import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getPaymentWithRetry(paymentId: number, retries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await new Payment(client).get({ id: paymentId });
    } catch (error) {
      const err = error instanceof Error ? error : null;
      const status = (error as { status?: number })?.status;
      const isNotFound = status === 404 || err?.message?.includes('not_found');
      if (isNotFound && attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Payment not found after retries');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MercadoPago envía notificaciones de tipo 'payment'
    if (body.type === 'payment') {
      const paymentId = Number(body.data.id);

      // Obtener información completa del pago desde MercadoPago (con reintentos por race condition)
      const payment = await getPaymentWithRetry(paymentId);

      // SOLO procesar pagos aprobados
      if (payment.status === 'approved') {
        // Extraer metadata con la información de la reserva
        const metadata = payment.metadata as Record<string, string>;

        // Validar que tengamos los campos necesarios
        if (
          !metadata.user_full_name ||
          !metadata.user_email ||
          !metadata.book_emp_id ||
          !metadata.book_serv_id ||
          !metadata.temp_reservation_id
        ) {
          return NextResponse.json({ received: true }, { status: 200 });
        }

        try {
          // 🔥 Llamar al endpoint del backend para crear el booking
          // El webhook secret se envía desde el servidor (API route), no se expone al cliente
          
          // Acceder a preference_id de forma segura (puede no estar en el tipo pero existe en runtime)
          const paymentData = payment as any;
          const preferenceId = paymentData.preference_id || paymentData.preference?.id || '';
          const transactionAmount = paymentData.transaction_amount || paymentData.amount || 0;
          
          // Preparar headers con el webhook secret
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          // Agregar webhook secret si está configurado
          const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
          if (webhookSecret) {
            headers['X-Webhook-Secret'] = webhookSecret;
          }
          
          const webhookResponse = await fetch(
            `${BACKEND_URL}/bookings/webhook`,
            {
              method: 'POST',
              headers,
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

          return NextResponse.json(
            {
              received: true,
              bookingId: webhookData.data?.bookingId,
              clientId: webhookData.data?.clientId,
            },
            { status: 200 }
          );
        } catch (error) {
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
      }
    }

    // SIEMPRE responder 200 para que MercadoPago no reintente
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    // Incluso con error, respondemos 200 para evitar reintentos infinitos
    return NextResponse.json({ error: 'Internal error' }, { status: 200 });
  }
}
