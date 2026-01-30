import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceName, depositAmount, clientData, bookingData, locale } =
      body;
    const effectiveLocale = locale || 'es';

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

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: String(bookingData.serviceId),
            title: serviceName,
            quantity: 1,
            unit_price: Number(depositAmount),
            currency_id: 'ARS',
          },
        ],
        payer: {
          // PARA PROD: Cambia a clientData.email
          email: 'TESTUSER8883738017904117317@TESTUSER.COM',
        },
        metadata: {
          user_fullName: clientData.fullName,
          user_email: clientData.email,
          user_phone: clientData.phone,
          user_dni: clientData.dni,
          book_empId: bookingData.employeeId,
          book_servId: bookingData.serviceId,
          book_date: bookingData.date,
          book_time: bookingData.startTime,
          book_notes: clientData.notes || '',
        },
        back_urls: {
          success: `${frontendUrl}/${effectiveLocale}/reserva/success`,
          failure: `${frontendUrl}/${effectiveLocale}/reserva/failure`,
          pending: `${frontendUrl}/${effectiveLocale}/reserva/pending`,
        },
        auto_return: 'approved',
        notification_url: `${frontendUrl}/api/webhook`,
        statement_descriptor: 'MERY RESERVAS',
      },
    });

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
