'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Tabs, Box, Text, Button } from '@mantine/core';
import { useAuth } from '@/presentation/contexts';
import { CategoriesManager } from '@/presentation/components/Admin/CategoriesManager';
import { ServicesManager } from '@/presentation/components/Admin/ServicesManager';
import { TimeSlotsManager } from '@/presentation/components/Admin/TimeSlotsManager';
import { EmployeesManager } from '@/presentation/components/Admin/EmployeesManager';
import { BookingsManager } from '@/presentation/components/Admin/BookingsManager';
import classes from './page.module.css';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('categories');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <Box className={classes.loadingContainer}>
        <Text>Cargando...</Text>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box className={classes.pageWrapper}>
      {/* Header */}
      <Box className={classes.adminHeader}>
        <Container size="xl">
          <Box className={classes.headerContent}>
            <Box>
              <Text className={classes.welcomeText}>
                Bienvenido, <Text component="span" fw={600}>{user?.fullName}</Text>
              </Text>
              <Text className={classes.roleText}>
                Panel de Administración
              </Text>
            </Box>
            <Button
              variant="outline"
              color="gray"
              onClick={logout}
              className={classes.logoutButton}
            >
              Cerrar Sesión
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="xl" py="xl">
        <Tabs value={activeTab} onChange={setActiveTab} className={classes.tabs}>
          <Tabs.List className={classes.tabsList}>
            <Tabs.Tab value="categories" className={classes.tab}>
              Categorías
            </Tabs.Tab>
            <Tabs.Tab value="services" className={classes.tab}>
              Servicios
            </Tabs.Tab>
            <Tabs.Tab value="timeslots" className={classes.tab}>
              Franja Horaria
            </Tabs.Tab>
            <Tabs.Tab value="employees" className={classes.tab}>
              Empleados
            </Tabs.Tab>
            <Tabs.Tab value="bookings" className={classes.tab}>
              Reservas
            </Tabs.Tab>
          </Tabs.List>

          <Box className={classes.tabContent}>
            <Tabs.Panel value="categories" pt="xl">
              {activeTab === 'categories' && <CategoriesManager />}
            </Tabs.Panel>

            <Tabs.Panel value="services" pt="xl">
              {activeTab === 'services' && <ServicesManager />}
            </Tabs.Panel>

            <Tabs.Panel value="timeslots" pt="xl">
              {activeTab === 'timeslots' && <TimeSlotsManager />}
            </Tabs.Panel>

            <Tabs.Panel value="employees" pt="xl">
              {activeTab === 'employees' && <EmployeesManager />}
            </Tabs.Panel>

            <Tabs.Panel value="bookings" pt="xl">
              {activeTab === 'bookings' && <BookingsManager />}
            </Tabs.Panel>
          </Box>
        </Tabs>
      </Container>
    </Box>
  );
}

