# Mery García - Portal de Reservas Online

Portal de reservas online para servicios de Cosmetic Tattoo, Estilismo de Cejas y Paramedical Tattoo.

## 🏗️ Arquitectura

Este proyecto está construido siguiendo los principios de **Clean Architecture**, con una separación clara de responsabilidades:

```
src/
├── domain/              # Entidades y lógica de negocio
│   ├── entities/       # Modelos de dominio
│   └── repositories/   # Interfaces de repositorios
├── application/         # Casos de uso
│   └── use-cases/      # Lógica de aplicación
├── infrastructure/      # Implementaciones concretas
│   └── repositories/   # Implementaciones de repositorios
└── presentation/        # Capa de presentación (UI)
    ├── components/     # Componentes React
    ├── layouts/        # Layouts de página
    └── providers/      # Context providers
```

## 🚀 Tecnologías

- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca UI
- **Mantine 8** - Biblioteca de componentes UI
- **TypeScript** - Tipado estático
- **pnpm** - Gestor de paquetes
- **Clean Architecture** - Patrón de arquitectura

## 📱 Diseño

- **Mobile First** - Diseño prioritario para dispositivos móviles
- **Fully Responsive** - Adaptado para todos los dispositivos (móvil, tablet, desktop)
- **Tipografía**: AvantGarde-BookTh (con diferentes pesos)

## 🎨 Características

- Diseño moderno y limpio
- Animaciones suaves
- Tema personalizado con colores rosados/pasteles
- Componentes reutilizables
- Separación de concerns según Clean Architecture

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Ejecutar en producción
pnpm start
```

## 🔤 Configuración de Fuentes

Para usar la tipografía personalizada **AvantGarde-BookTh**:

1. Obtén el archivo de fuente en formato `.woff2`
2. Colócalo en `/public/fonts/AvantGarde-BookTh.woff2`
3. Actualiza el archivo `src/app/layout.tsx` descomentando la configuración de `localFont`

El proyecto funciona con una fuente de sistema por defecto hasta que agregues la fuente personalizada.

## 🎯 Path Aliases

El proyecto usa path aliases para imports más limpios:

```typescript
// Alias disponibles:
@/*              // src/*
~/*              // src/*
@/domain/*       // src/domain/*
@/application/*  // src/application/*
@/infrastructure/* // src/infrastructure/*
@/presentation/* // src/presentation/*
```

Ejemplo:
```typescript
import { Header } from '@/presentation/components';
import { Service } from '@/domain/entities';
```

## 📂 Estructura de Componentes

Los componentes siguen una estructura modular con barrel files:

```
components/
├── Header/
│   ├── Header.tsx         # Componente
│   ├── Header.module.css  # Estilos
│   └── index.ts          # Barrel file
└── index.ts              # Barrel file principal
```

## 🌐 Servicios Disponibles

1. **Cosmetic Tattoo** - Tatuaje cosmético profesional
2. **Estilismo de Cejas** - Diseño y estilismo de cejas
3. **Paramedical Tattoo** - Tatuaje paramédico especializado

## 🔄 Próximos Pasos

- [ ] Agregar navegación entre servicios
- [ ] Implementar sistema de reservas
- [ ] Integrar con backend/API
- [ ] Agregar autenticación de usuarios
- [ ] Implementar calendario de disponibilidad
- [ ] Agregar galería de trabajos realizados

## 📝 Notas

- El proyecto usa `pnpm` como gestor de paquetes
- Todos los componentes usan TypeScript estricto
- Los estilos usan CSS Modules para evitar conflictos
- La arquitectura permite fácil escalabilidad y testing

## 👤 Autor

**Mery García**
- Cosmetic Tattoo Professional
- Portal de Reservas Online

---

Desarrollado con ❤️ usando Next.js y Clean Architecture
