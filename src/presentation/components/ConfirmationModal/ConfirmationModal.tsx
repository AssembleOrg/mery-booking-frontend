'use client';

import { Modal, Stack, Text, TextInput, Button, Box } from '@mantine/core';
import { useState } from 'react';
import classes from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmationWord?: string; // Palabra a escribir para confirmar (default: "eliminar")
  confirmButtonText?: string;
  confirmButtonColor?: string;
  isLoading?: boolean;
}

export function ConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmationWord = 'eliminar',
  confirmButtonText = 'Confirmar',
  confirmButtonColor = 'red',
  isLoading = false,
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (inputValue.toLowerCase() !== confirmationWord.toLowerCase()) {
      setError(`Debes escribir "${confirmationWord}" para confirmar`);
      return;
    }

    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('Error en confirmación:', error);
    }
  };

  const handleClose = () => {
    setInputValue('');
    setError('');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      centered
      size="md"
      classNames={{
        title: classes.modalTitle,
        header: classes.modalHeader,
        content: classes.modalContent,
      }}
    >
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          {message}
        </Text>

        <Box>
          <Text size="sm" fw={500} mb="xs">
            Escribe <Text component="span" fw={700} c={confirmButtonColor}>{confirmationWord}</Text> para confirmar:
          </Text>
          <TextInput
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.currentTarget.value);
              setError('');
            }}
            placeholder={confirmationWord}
            error={error}
            className={classes.input}
            autoFocus
          />
        </Box>

        <Box className={classes.actions}>
          <Button
            variant="outline"
            color="gray"
            onClick={handleClose}
            disabled={isLoading}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            color={confirmButtonColor}
            onClick={handleConfirm}
            loading={isLoading}
            disabled={!inputValue || isLoading}
            fullWidth
          >
            {confirmButtonText}
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
}

