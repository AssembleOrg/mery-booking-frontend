'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookingConfirmationModal } from '@/presentation/components';
import { Client } from '@/domain/entities';
import classes from './ReservaModal.module.css';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Employee } from '@/infrastructure/http/employeeService';
import type { ServiceEntity } from '@/infrastructure/http/serviceService';

const MOCK_LOCATION = 'Mery García Office';

interface Step4ConfirmationProps {
  serviceName: string;
  selectedOption: ServiceOption;
  selectedDate: Date;
  selectedTime: string;
  employees: Employee[];
  services: ServiceEntity[];
  staffConsultasId?: string;
  meryGarciaId?: string;
  selectedEmployeeId?: string;
  onClientDataCollected: (data: {
    name: string;
    surname: string;
    email: string;
    mobile: string;
    dni: string;
    notes?: string;
  }) => void;
  onBack: () => void;
}

export function Step4Confirmation({
  serviceName,
  selectedOption,
  selectedDate,
  selectedTime,
  employees,
  services,
  staffConsultasId,
  meryGarciaId,
  selectedEmployeeId,
  onClientDataCollected,
  onBack,
}: Step4ConfirmationProps) {
  const [showConfirmation, setShowConfirmation] = useState(true);

  // Priorizar selectedEmployeeId de la página, luego selectedOption.employeeId, luego fallbacks
  const employeeId = selectedEmployeeId ||
                     selectedOption.employeeId ||
                     (selectedOption.contentType === 'consulta-sin-trabajo' ||
                      selectedOption.contentType === 'consulta-con-trabajo'
                       ? staffConsultasId
                       : meryGarciaId);

  const employee = employees.find(e => e.id === employeeId);
  const service = services.find(s => s.id === selectedOption.serviceId);

  // Transformar ServiceEntity a Service domain entity
  const serviceForModal = useMemo(() => {
    if (!service) return null;
    return {
      id: service.id,
      name: service.name,
      slug: service.name.toLowerCase().replace(/\s+/g, '-'),
      price: Number(service.price),
      priceBook: Number(service.price),
      duration: service.duration,
      image: service.urlImage || '/desk.svg',
    };
  }, [service]);

  // Transformar Employee a Professional domain entity
  const professionalForModal = useMemo(() => {
    if (!employee) return null;
    return {
      id: employee.id,
      name: employee.fullName,
      available: true,
      services: [],
    };
  }, [employee]);

  const handleCollectData = async (clientData: Client) => {
    console.log('[ReservaModal Step4] Datos del cliente recolectados:', {
      name: clientData.name,
      surname: clientData.surname,
      email: clientData.email,
      dni: clientData.dni,
      hasMobile: !!clientData.mobile,
      hasNotes: !!clientData.notes,
    });

    if (!clientData.dni) {
      console.error('[ReservaModal Step4] ERROR: El DNI es requerido');
      return;
    }

    console.log('[ReservaModal Step4] Llamando a onClientDataCollected...');
    // Recolectar datos y pasar al Step 5
    onClientDataCollected({
      name: clientData.name,
      surname: clientData.surname,
      email: clientData.email,
      mobile: clientData.mobile,
      dni: clientData.dni,
      notes: clientData.notes,
    });
    console.log('[ReservaModal Step4] onClientDataCollected ejecutado exitosamente');
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onBack(); // Volver al paso anterior si cancela
  };

  if (!serviceForModal) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <BookingConfirmationModal
        opened={showConfirmation}
        onClose={handleConfirmationClose}
        service={serviceForModal}
        professional={professionalForModal || null}
        date={selectedDate}
        time={selectedTime}
        location={MOCK_LOCATION}
        onConfirm={handleCollectData}
      />
    </motion.div>
  );
}
