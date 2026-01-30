import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { ClientService, BookingService, CreateClientPublicDto, CreateBookingDto } from '@/infrastructure/http';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Webhook] Notificación recibida:', body);

    // MercadoPago envía notificaciones de tipo 'payment'
    if (body.type === 'payment') {
      const paymentId = body.data.id;

      // Obtener información completa del pago desde MercadoPago
      const payment = await new Payment(client).get({ id: paymentId });

      console.log('[Webhook] Estado del pago:', payment.status);

      // SOLO procesar pagos aprobados
      if (payment.status === 'approved') {
        // Extraer metadata con la información de la reserva
        const metadata = payment.metadata as Record<string, string>;

        if (!metadata.client_data || !metadata.booking_data) {
          console.error('[Webhook] Metadata incompleta:', metadata);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const clientData = JSON.parse(metadata.client_data);
        const bookingData = JSON.parse(metadata.booking_data);

        console.log('[Webhook] Procesando pago aprobado. Client:', clientData.fullName);

        try {
          // 🔥 LÓGICA CRÍTICA: Crear cliente y booking

          // 1. Crear el cliente (o recuperar existente por DNI)
          const clientDto: CreateClientPublicDto = {
            fullName: clientData.fullName,
            email: clientData.email,
            phone: clientData.phone,
            dni: clientData.dni,
          };

          const newClient = await ClientService.createPublic(clientDto);
          console.log('[Webhook] Cliente creado/recuperado:', newClient.id);

          // 2. Crear la reserva con paid: true
          const bookingDto: CreateBookingDto = {
            clientId: newClient.id,
            employeeId: bookingData.employeeId,
            serviceId: bookingData.serviceId,
            date: bookingData.date,
            startTime: bookingData.startTime,
            paid: true, // ✅ PAGO CONFIRMADO
            notes: clientData.notes || `Pago procesado vía MercadoPago. Payment ID: ${payment.id}`,
          };

          const booking = await BookingService.create(bookingDto);
          console.log('[Webhook] Reserva creada exitosamente:', booking.id);

          // 3. (Opcional) Aquí podrías enviar email de confirmación
          // await sendConfirmationEmail(clientData.email, booking);

          return NextResponse.json({
            received: true,
            bookingId: booking.id,
            clientId: newClient.id,
          }, { status: 200 });

        } catch (error) {
          // ❌ ERROR CRÍTICO: Pago aprobado pero falló la creación
          console.error(
            `[CRÍTICO] Pago aprobado pero fallo al crear cliente/booking. Payment ID: ${payment.id}`,
            error
          );

          // TODO: Implementar alerta al admin
          // TODO: Guardar en tabla de reconciliación manual

          // IMPORTANTE: Aún así responder 200 para que MercadoPago no reintente
          return NextResponse.json({
            received: true,
            error: 'Failed to create booking',
            paymentId: payment.id,
          }, { status: 200 });
        }
      } else {
        console.log('[Webhook] Pago no aprobado. Status:', payment.status);
      }
    }

    // SIEMPRE responder 200 para que MercadoPago no reintente
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('[Webhook] Error general:', error);
    // Incluso con error, respondemos 200 para evitar reintentos infinitos
    return NextResponse.json({ error: 'Internal error' }, { status: 200 });
  }
}
