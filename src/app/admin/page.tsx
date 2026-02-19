'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, Box, Text, Button } from '@mantine/core';
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

  const handleTabChange = (value: string | null) => {
    if (value) {
      setActiveTab(value);
    }
  };

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
        <Box className={classes.headerContent}>
          <Text className={classes.welcomeText}>
            {user?.fullName}
          </Text>
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            onClick={logout}
            className={classes.logoutButton}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className={classes.mainContent}>
        <Tabs value={activeTab} onChange={handleTabChange} className={classes.tabsWrapper}>
          <Tabs.List className={classes.tabsList}>
            <Tabs.Tab value="categories" className={classes.tab}>
              Categorías
            </Tabs.Tab>
            <Tabs.Tab value="services" className={classes.tab}>
              Servicios
            </Tabs.Tab>
            <Tabs.Tab value="timeslots" className={classes.tab}>
              Franjas
            </Tabs.Tab>
            <Tabs.Tab value="employees" className={classes.tab}>
              Empleados
            </Tabs.Tab>
            <Tabs.Tab value="bookings" className={classes.tab}>
              Reservas
            </Tabs.Tab>
          </Tabs.List>

          <Box className={classes.tabContent}>
            <Tabs.Panel value="categories">
              {activeTab === 'categories' && <CategoriesManager />}
            </Tabs.Panel>

            <Tabs.Panel value="services">
              {activeTab === 'services' && <ServicesManager />}
            </Tabs.Panel>

            <Tabs.Panel value="timeslots">
              {activeTab === 'timeslots' && <TimeSlotsManager />}
            </Tabs.Panel>

            <Tabs.Panel value="employees">
              {activeTab === 'employees' && <EmployeesManager />}
            </Tabs.Panel>

            <Tabs.Panel value="bookings">
              {activeTab === 'bookings' && <BookingsManager />}
            </Tabs.Panel>
          </Box>
        </Tabs>
      </Box>
    </Box>
  );
}
