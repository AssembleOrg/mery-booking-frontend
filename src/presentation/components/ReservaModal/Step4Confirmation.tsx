'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookingConfirmationModal } from '@/presentation/components';
import { useCreateClient, useCreateBooking } from '@/presentation/hooks';
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
  onComplete: () => void;
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
  onComplete,
  onBack,
}: Step4ConfirmationProps) {
  const [showConfirmation, setShowConfirmation] = useState(true);

  // Hooks para crear cliente y reserva
  const createClientMutation = useCreateClient();
  const createBookingMutation = useCreateBooking();

  // Usar employeeId del selectedOption (ya viene asignado por getOptionsWithIds)
  // Solo usar fallbacks si no existe
  const employeeId = selectedOption.employeeId ||
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

  const handleConfirmBooking = async (clientData: Client) => {
    if (!selectedOption.serviceId || !selectedDate || !selectedTime) return;

    // Validar que haya un empleado seleccionado
    if (!employeeId) {
      return;
    }

    try {
      // 1. Crear cliente primero
      if (!clientData.dni) {
        throw new Error('El DNI es requerido para completar la reserva');
      }

      const clientResponse = await createClientMutation.mutateAsync({
        fullName: `${clientData.name} ${clientData.surname}`,
        email: clientData.email,
        phone: clientData.mobile,
        dni: clientData.dni,
      });

      // 2. Crear reserva con el ID del cliente
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      await createBookingMutation.mutateAsync({
        clientId: clientResponse.id,
        employeeId: employeeId,
        serviceId: selectedOption.serviceId,
        date: dateStr,
        startTime: selectedTime,
        quantity: 1,
        paid: false,
        notes: clientData.notes,
      });

      // Éxito - cerrar todo
      handleBookingSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
      // El error será manejado por los hooks de react-query
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onBack(); // Volver al paso anterior si cancela
  };

  const handleBookingSuccess = () => {
    setShowConfirmation(false);
    onComplete(); // Cerrar todo el modal y resetear
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
        onConfirm={handleConfirmBooking}
      />
    </motion.div>
  );
}
