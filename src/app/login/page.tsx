'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Box,
  Stack,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/presentation/contexts';
import Image from 'next/image';
import classes from './page.module.css';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setLoginError('');
      await login(data);
      router.push('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(
        error.response?.data?.message || 'Usuario o contraseña incorrectos'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Box className={classes.pageWrapper}>
      <Container size="xs" className={classes.container}>
        <Box className={classes.logoContainer}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Image
              src="/logo-original.webp"
              alt="Mery García"
              width={200}
              height={70}
              priority
              className={classes.logo}
              style={{ cursor: 'pointer' }}
            />
          </Link>
        </Box>

        <Box style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button
              variant="subtle"
              size="sm"
              style={{
                color: '#545454',
                fontFamily: 'var(--font-avant-garde), sans-serif',
              }}
            >
              ← Volver al inicio
            </Button>
          </Link>
        </Box>

        <Paper shadow="xl" p="xl" radius="lg" className={classes.paper}>
          <Stack gap="lg">
            <Box className={classes.header}>
              <Title order={2} className={classes.title}>
                Panel de Administración
              </Title>
              <Text size="sm" c="dimmed" className={classes.subtitle}>
                Ingresa tus credenciales para continuar
              </Text>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="tu@email.com"
                  size="md"
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                  error={errors.email?.message}
                  classNames={{
                    label: classes.label,
                    input: classes.input,
                  }}
                />

                <PasswordInput
                  label="Contraseña"
                  placeholder="Tu contraseña"
                  size="md"
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres',
                    },
                  })}
                  error={errors.password?.message}
                  classNames={{
                    label: classes.label,
                    input: classes.input,
                  }}
                />

                {loginError && (
                  <Text size="sm" c="red" ta="center">
                    {loginError}
                  </Text>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  mt="md"
                  loading={isSubmitting}
                  className={classes.submitButton}
                >
                  Iniciar Sesión
                </Button>
              </Stack>
            </form>

            <Text size="xs" c="dimmed" ta="center" mt="md">
              ¿Necesitas ayuda? Contacta al administrador
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
