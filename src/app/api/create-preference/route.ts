import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

interface CreatePreferenceRequest {
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  depositAmount: number;
  clientData: {
    fullName: string;
    email: string;
    phone: string;
    dni: string;
    notes?: string;
  };
  bookingData: {
    employeeId: string;
    serviceId: string;
    date: string;
    startTime: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePreferenceRequest = await request.json();
    const { serviceName, depositAmount, clientData, bookingData } = body;

    console.log(
      '[Create Preference] Generando preferencia para:',
      clientData.fullName
    );

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: bookingData.serviceId,
            title: serviceName,
            quantity: 1,
            unit_price: depositAmount,
            currency_id: 'ARS',
          },
        ],
        // Esto hay que cambiarlo por el clientid
        payer: {
          email: 'TESTUSER8883738017904117317@TESTUSER.COM',
        },
        metadata: {
          client_data: JSON.stringify(clientData),
          booking_data: JSON.stringify(bookingData),
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reserva/success`,
          failure: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reserva/failure`,
          pending: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reserva/pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/webhook`,
      },
    });

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error('[Create Preference] Error:', error);
    return NextResponse.json(
      { error: 'Error creating preference' },
      { status: 500 }
    );
  }
}
