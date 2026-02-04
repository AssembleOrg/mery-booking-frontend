import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

        console.log('[Webhook] Metadata recibida:', metadata);

        // Validar que tengamos los campos necesarios
        if (
          !metadata.user_full_name ||
          !metadata.user_email ||
          !metadata.book_emp_id ||
          !metadata.book_serv_id ||
          !metadata.temp_reservation_id
        ) {
          console.error('[Webhook] Metadata incompleta:', metadata);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        console.log(
          '[Webhook] Procesando pago aprobado. Client:',
          metadata.user_full_name,
          'TempReservationId:',
          metadata.temp_reservation_id
        );

        try {
          // 🔥 Llamar al endpoint del backend para crear el booking
          // NOTA: El backend debe validar el secret internamente, no lo enviamos desde el frontend
          
          // Acceder a preference_id de forma segura (puede no estar en el tipo pero existe en runtime)
          const paymentData = payment as any;
          const preferenceId = paymentData.preference_id || paymentData.preference?.id || '';
          const transactionAmount = paymentData.transaction_amount || paymentData.amount || 0;
          
          const webhookResponse = await fetch(
            `${BACKEND_URL}/bookings/webhook`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // El secret NO se envía desde el frontend por seguridad
                // El backend debe validar que la petición viene de un origen confiable
              },
              body: JSON.stringify({
                paymentId: String(payment.id),
                preferenceId: preferenceId,
                tempReservationId: metadata.temp_reservation_id,
                amount: transactionAmount,
                clientData: {
                  fullName: metadata.user_full_name,
                  email: metadata.user_email,
                  phone: metadata.user_phone || '',
                  dni: metadata.user_dni || '',
                },
                bookingData: {
                  employeeId: metadata.book_emp_id,
                  serviceId: metadata.book_serv_id,
                  date: metadata.book_date,
                  startTime: metadata.book_time,
                  notes: metadata.book_notes || '',
                },
              }),
            }
          );

          if (!webhookResponse.ok) {
            const errorData = await webhookResponse
              .json()
              .catch(() => ({}));
            console.error(
              '[Webhook] Error del backend:',
              webhookResponse.status,
              errorData
            );

            // IMPORTANTE: Responder 200 para que MP no reintente infinitamente
            // El backend debe manejar los errores y marcar el pago como "needs_manual_review"
            return NextResponse.json(
              {
                received: true,
                error: 'Backend error',
                paymentId: payment.id,
                status: webhookResponse.status,
              },
              { status: 200 }
            );
          }

          const webhookData = await webhookResponse.json();
          console.log(
            '[Webhook] Booking creado exitosamente:',
            webhookData.data?.bookingId
          );

          return NextResponse.json(
            {
              received: true,
              bookingId: webhookData.data?.bookingId,
              clientId: webhookData.data?.clientId,
            },
            { status: 200 }
          );
        } catch (error) {
          // ❌ ERROR CRÍTICO: Pago aprobado pero falló la creación
          console.error(
            `[CRÍTICO] Pago aprobado pero fallo al procesar. Payment ID: ${payment.id}`,
            error
          );

          // IMPORTANTE: Aún así responder 200 para que MercadoPago no reintente
          return NextResponse.json(
            {
              received: true,
              error: 'Failed to process payment',
              paymentId: payment.id,
            },
            { status: 200 }
          );
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
