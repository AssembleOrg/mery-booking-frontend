import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceName, depositAmount, clientData, bookingData, locale } =
      body;

    if (process.env.NODE_ENV !== 'production') {
      console.info('[create-preference] Incoming booking payload', {
        serviceName,
        bookingEmployeeId: bookingData?.employeeId,
        bookingServiceId: bookingData?.serviceId,
        bookingDate: bookingData?.date,
        bookingStartTime: bookingData?.startTime,
      });
    }

    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(
      /\/$/,
      ''
    );

    if (!frontendUrl) {
      return NextResponse.json(
        { error: 'Falta NEXT_PUBLIC_FRONTEND_URL' },
        { status: 500 }
      );
    }

    // PASO 1: Crear pre-reserva temporal (bloquea el slot)
    const tempReservationResponse = await fetch(
      `${BACKEND_URL}/temp-reservations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: bookingData.employeeId,
          serviceId: bookingData.serviceId,
          date: bookingData.date,
          startTime: bookingData.startTime,
          clientData: {
            fullName: clientData.fullName,
            email: clientData.email,
            phone: clientData.phone,
            dni: clientData.dni,
          },
          expirationMinutes: 15, // 15 minutos para completar el pago
          notes: clientData.notes,
        }),
      }
    );

    // Manejar error 409 (slot ya ocupado)
    if (tempReservationResponse.status === 409) {
      const errorData = await tempReservationResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'El turno ya no está disponible',
          message:
            errorData.message ||
            'Este horario fue reservado por otra persona. Por favor, selecciona otro.',
        },
        { status: 409 }
      );
    }

    if (!tempReservationResponse.ok) {
      return NextResponse.json(
        {
          error: 'Error al crear la pre-reserva',
          message: 'No se pudo reservar el turno. Intenta nuevamente.',
        },
        { status: tempReservationResponse.status }
      );
    }

    const tempReservationData = await tempReservationResponse.json();
    const tempReservationId = tempReservationData.data.id;

    // PASO 2: Crear preferencia en Mercado Pago con temp_reservation_id
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 14 * 60 * 1000); // 14 minutos

    const preference = await new Preference(client).create({
      body: {
        expires: true,
        expiration_date_from: now.toISOString(),
        expiration_date_to: expirationDate.toISOString(),
        items: [
          {
            id: String(bookingData.serviceId),
            title: serviceName,
            quantity: 1,
            unit_price: Number(depositAmount),
            currency_id: 'ARS',
          },
        ],
        metadata: {
          user_full_name: clientData.fullName,
          user_email: clientData.email,
          user_phone: clientData.phone,
          user_dni: clientData.dni,
          book_emp_id: bookingData.employeeId,
          book_serv_id: bookingData.serviceId,
          book_date: bookingData.date,
          book_time: bookingData.startTime,
          book_notes: clientData.notes || '',
          temp_reservation_id: tempReservationId, // ⭐ NUEVO: ID de pre-reserva
        },
        back_urls: {
          success: `${frontendUrl}/reserva/success`,
          failure: `${frontendUrl}/reserva/failure`,
          pending: `${frontendUrl}/reserva/pending`,
        },
        payment_methods: {
          installments: 1,
        },
        auto_return: 'approved',
        notification_url: `${frontendUrl}/api/webhook`,
        statement_descriptor: 'MERY RESERVAS',
      },
    });

    // PASO 3: Vincular preferencia con pre-reserva (opcional pero recomendado)
    try {
      await fetch(
        `${BACKEND_URL}/temp-reservations/${tempReservationId}/preference`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferenceId: preference.id,
          }),
        }
      );
    } catch (linkError) {
      // No crítico - vinculación opcional
    }

    // Determinar si usar sandbox basado en variable de entorno
    const useSandbox = process.env.MERCADOPAGO_USE_SANDBOX === 'true';
    const checkoutUrl = useSandbox
      ? preference.sandbox_init_point
      : preference.init_point;

    return NextResponse.json({
      id: preference.id,
      init_point: checkoutUrl, // URL correcta según el entorno
      tempReservationId, // Incluir para referencia
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Error al procesar la solicitud',
        message: 'Ocurrió un error al crear la preferencia de pago.',
      },
      { status: 500 }
    );
  }
}
