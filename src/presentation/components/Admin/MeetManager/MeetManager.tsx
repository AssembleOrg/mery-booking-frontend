'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextInput,
  Textarea,
  NumberInput,
  Stack,
  Group,
  Text,
  Alert,
  Anchor,
  CopyButton,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { GoogleMeetService, type MeetInviteResult } from '@/infrastructure/http';

// Construye un ISO con offset fijo de Argentina (-03:00) a partir de la hora
// de pared elegida, sin depender del timezone del navegador del admin.
function toArtIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00-03:00`;
}

export function MeetManager() {
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | string>(30);
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetInviteResult | null>(null);

  const validate = (): string | null => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Ingresá un email válido';
    if (!title || title.trim().length < 2) return 'El título es requerido';
    if (!date) return 'Elegí fecha y hora';
    if (!duration || Number(duration) < 5) return 'La duración mínima es 5 minutos';
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await GoogleMeetService.invite({
        email: email.trim(),
        title: title.trim(),
        startDateTime: toArtIso(date as Date),
        durationMinutes: Number(duration),
        description: description.trim() || undefined,
      });
      setResult(res);
      // Reset parcial (dejo el email por si quiere reenviar)
      setTitle('');
      setDate(null);
      setDescription('');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo crear el Meet. Revisá la configuración de Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maw={640}>
      <Text fw={600} size="lg" mb="xs">
        Invitar a una videollamada (Google Meet)
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Crea un evento en el calendario, genera el link de Meet e invita al email por correo automáticamente.
      </Text>

      <Stack gap="md">
        <TextInput
          label="Email del invitado"
          placeholder="cliente@example.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Título"
          placeholder="Consulta previa - Mery García"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />
        <Group grow align="flex-start">
          <DateTimePicker
            label="Fecha y hora"
            placeholder="Elegí fecha y hora"
            value={date}
            onChange={(v) => setDate(v ? new Date(v) : null)}
            valueFormat="DD/MM/YYYY HH:mm"
            minDate={new Date()}
            required
          />
          <NumberInput
            label="Duración (minutos)"
            value={duration}
            onChange={setDuration}
            min={5}
            max={480}
            allowNegative={false}
            allowDecimal={false}
          />
        </Group>
        <Textarea
          label="Descripción (opcional)"
          placeholder="Notas para el invitado"
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        {result && (
          <Alert color="green" title="Meet creado — invitación enviada">
            <Stack gap={6}>
              <Text size="sm">
                Se invitó a <strong>{result.attendee}</strong>.
              </Text>
              {result.meetLink && (
                <Group gap="xs">
                  <Anchor href={result.meetLink} target="_blank" rel="noopener noreferrer" size="sm">
                    {result.meetLink}
                  </Anchor>
                  <CopyButton value={result.meetLink}>
                    {({ copied, copy }) => (
                      <Button size="xs" variant="light" color={copied ? 'teal' : 'gray'} onClick={copy}>
                        {copied ? 'Copiado' : 'Copiar'}
                      </Button>
                    )}
                  </CopyButton>
                </Group>
              )}
              {result.htmlLink && (
                <Anchor href={result.htmlLink} target="_blank" rel="noopener noreferrer" size="xs" c="dimmed">
                  Ver evento en el calendario
                </Anchor>
              )}
            </Stack>
          </Alert>
        )}

        <Group justify="flex-end">
          <Button color="pink" onClick={handleSubmit} loading={isSubmitting}>
            Crear Meet e invitar
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
