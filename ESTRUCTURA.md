# 📁 Estructura del Proyecto

## 🗂️ Vista General

```
mery-booking-frontend/
│
├── 📁 public/                          # Assets públicos
│   ├── fonts/                         # Fuentes personalizadas
│   │   └── README.md                  # Instrucciones para agregar fuentes
│   ├── desk.svg                       # Ilustración principal
│   ├── file.svg                       # (original de Next.js)
│   ├── globe.svg                      # (original de Next.js)
│   ├── logo_cosetic_tattoo.svg       # Logo del negocio
│   ├── next.svg                       # (original de Next.js)
│   ├── vercel.svg                     # (original de Next.js)
│   └── window.svg                     # (original de Next.js)
│
├── 📁 src/                             # Código fuente
│   │
│   ├── 📁 app/                         # Next.js App Router
│   │   ├── favicon.ico                # Favicon
│   │   ├── globals.css                # Estilos globales
│   │   ├── layout.tsx                 # Layout principal con Mantine
│   │   └── page.tsx                   # Página de inicio (/)
│   │
│   ├── 📁 domain/                      # 🎯 CAPA DE DOMINIO
│   │   │
│   │   ├── 📁 entities/                # Entidades de negocio
│   │   │   ├── Service.ts             # Modelo de servicio + enum
│   │   │   └── index.ts               # Barrel export
│   │   │
│   │   └── 📁 repositories/            # Interfaces de repositorios
│   │       ├── ServiceRepository.ts   # Interface del repositorio
│   │       └── index.ts               # Barrel export
│   │
│   ├── 📁 application/                 # 🔧 CAPA DE APLICACIÓN
│   │   │
│   │   └── 📁 use-cases/               # Casos de uso
│   │       ├── GetServicesUseCase.ts  # Obtener todos los servicios
│   │       └── index.ts               # Barrel export
│   │
│   ├── 📁 infrastructure/              # 🏗️ CAPA DE INFRAESTRUCTURA
│   │   │
│   │   └── 📁 repositories/            # Implementaciones de repositorios
│   │       ├── InMemoryServiceRepository.ts  # Repositorio en memoria
│   │       └── index.ts               # Barrel export
│   │
│   └── 📁 presentation/                # 🎨 CAPA DE PRESENTACIÓN
│       │
│       ├── 📁 components/              # Componentes UI
│       │   │
│       │   ├── 📁 Header/              # Componente Header
│       │   │   ├── Header.tsx         # Componente React
│       │   │   ├── Header.module.css  # Estilos del header
│       │   │   └── index.ts           # Barrel export
│       │   │
│       │   ├── 📁 WelcomeSection/      # Componente WelcomeSection
│       │   │   ├── WelcomeSection.tsx           # Componente React
│       │   │   ├── WelcomeSection.module.css    # Estilos
│       │   │   └── index.ts           # Barrel export
│       │   │
│       │   └── index.ts               # Barrel export principal
│       │
│       ├── 📁 layouts/                 # Layouts (preparado para futuro)
│       │
│       └── 📁 providers/               # Context Providers
│           ├── MantineProvider.tsx    # Configuración de Mantine
│           └── index.ts               # Barrel export
│
├── 📄 .gitignore                       # Archivos ignorados por Git
├── 📄 .prettierignore                  # Archivos ignorados por Prettier
├── 📄 .prettierrc                      # Configuración de Prettier
├── 📄 CHECKLIST.md                     # Lista de verificación
├── 📄 eslint.config.mjs                # Configuración de ESLint
├── 📄 ESTRUCTURA.md                    # Este archivo
├── 📄 IMPLEMENTACION.md                # Documentación técnica completa
├── 📄 next.config.ts                   # Configuración de Next.js
├── 📄 next-env.d.ts                    # Types de Next.js
├── 📄 package.json                     # Dependencias del proyecto
├── 📄 package-lock.json                # Lock de npm (ignorado)
├── 📄 postcss.config.mjs               # Configuración de PostCSS
├── 📄 QUICKSTART.md                    # Guía de inicio rápido
├── 📄 README.md                        # Documentación principal
├── 📄 SETUP.md                         # Guía de configuración
└── 📄 tsconfig.json                    # Configuración de TypeScript

```

---

## 📊 Estadísticas del Proyecto

### Archivos por Categoría

| Categoría | Cantidad | Archivos |
|-----------|----------|----------|
| **Componentes React** | 2 | Header, WelcomeSection |
| **CSS Modules** | 2 | Header.module.css, WelcomeSection.module.css |
| **Domain Layer** | 2 | Service.ts, ServiceRepository.ts |
| **Application Layer** | 1 | GetServicesUseCase.ts |
| **Infrastructure Layer** | 1 | InMemoryServiceRepository.ts |
| **Providers** | 1 | MantineProvider.tsx |
| **App Router** | 2 | layout.tsx, page.tsx |
| **Barrel Exports** | 8 | index.ts en cada módulo |
| **Documentación** | 6 | README, SETUP, IMPLEMENTACION, etc. |
| **Configuración** | 5 | tsconfig, eslint, prettier, etc. |

**Total de archivos creados**: ~30

---

## 🎯 Flujo de Dependencias

### Clean Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Header    │  │   Welcome    │  │   Mantine    │  │
│  │  Component   │  │   Section    │  │   Provider   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ⬇
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│              ┌──────────────────────┐                    │
│              │ GetServicesUseCase   │                    │
│              └──────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
                            ⬇
┌─────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                         │
│  ┌──────────────┐         ┌──────────────────────┐      │
│  │   Service    │ ◄────── │  ServiceRepository   │      │
│  │   Entity     │         │    (Interface)       │      │
│  └──────────────┘         └──────────────────────┘      │
└─────────────────────────────────────────────────────────┘
                            ⬆
┌─────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                     │
│           ┌──────────────────────────────┐               │
│           │ InMemoryServiceRepository    │               │
│           │    (Implementation)          │               │
│           └──────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Import Flow

### Ejemplo de imports usando path aliases

```typescript
// En src/app/page.tsx
import { Header, WelcomeSection } from '@/presentation/components';

// En src/presentation/components/WelcomeSection/WelcomeSection.tsx
import { Box, Button, Container, Stack, Text, Title } from '@mantine/core';

// En src/application/use-cases/GetServicesUseCase.ts
import { Service } from '@/domain/entities';
import { ServiceRepository } from '@/domain/repositories';

// En src/infrastructure/repositories/InMemoryServiceRepository.ts
import { Service } from '@/domain/entities';
import { ServiceRepository } from '@/domain/repositories';
```

---

## 📁 Convenciones de Nombrado

### Componentes
```
ComponentName/
├── ComponentName.tsx         # PascalCase
├── ComponentName.module.css  # PascalCase + .module.css
└── index.ts                  # Barrel export
```

### Use Cases
```
NombreDelCasoDeUsoUseCase.ts  # PascalCase + UseCase suffix
```

### Entities
```
EntityName.ts                  # PascalCase, singular
```

### Repositories
```
EntityNameRepository.ts        # PascalCase + Repository suffix
```

---

## 🎨 Estructura de Componentes

### Header Component
```typescript
Header/
├── Header.tsx                 # 50 líneas
│   ├── imports (Mantine, Next)
│   ├── useDisclosure hook
│   └── JSX (logo + burger menu)
│
├── Header.module.css          # 6 líneas
│   └── .header styles
│
└── index.ts                   # 1 línea
    └── export { Header }
```

### WelcomeSection Component
```typescript
WelcomeSection/
├── WelcomeSection.tsx         # 70 líneas
│   ├── imports (Mantine, Next)
│   ├── JSX (illustration + text + buttons)
│   └── Stack layout
│
├── WelcomeSection.module.css  # 40 líneas
│   ├── .wrapper (gradient bg)
│   ├── .illustration (responsive)
│   ├── .title (responsive font)
│   ├── .serviceButton (hover effects)
│   └── Media queries
│
└── index.ts                   # 1 línea
    └── export { WelcomeSection }
```

---

## 🔧 Archivos de Configuración

### tsconfig.json
- ✅ Strict mode enabled
- ✅ Path aliases configurados
- ✅ JSX: react-jsx
- ✅ Module: esnext

### package.json
- ✅ pnpm como package manager
- ✅ Scripts: dev, build, start, lint
- ✅ Dependencies: Mantine, Next, React
- ✅ DevDependencies: TypeScript, ESLint

### .prettierrc
- ✅ Semi: true
- ✅ Single quotes: true
- ✅ Tab width: 2
- ✅ Print width: 80

---

## 📚 Documentación Generada

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| README.md | ~150 | Documentación general del proyecto |
| SETUP.md | ~200 | Guía detallada de configuración |
| IMPLEMENTACION.md | ~400 | Documentación técnica completa |
| QUICKSTART.md | ~250 | Guía de inicio rápido |
| CHECKLIST.md | ~300 | Lista de verificación completa |
| ESTRUCTURA.md | ~200 | Este archivo - estructura visual |
| public/fonts/README.md | ~15 | Instrucciones para fuentes |

**Total**: ~1,500 líneas de documentación

---

## 🎯 Path Aliases Configurados

```json
{
  "@/*": ["./src/*"],           // Acceso a src/
  "~/*": ["./src/*"],           // Alternativa a @/
  "@/domain/*": ["./src/domain/*"],
  "@/application/*": ["./src/application/*"],
  "@/infrastructure/*": ["./src/infrastructure/*"],
  "@/presentation/*": ["./src/presentation/*"]
}
```

### Uso de Aliases

```typescript
// ✅ Correcto
import { Header } from '@/presentation/components';
import { Service } from '@/domain/entities';
import { GetServicesUseCase } from '@/application/use-cases';

// ❌ Evitar
import { Header } from '../../presentation/components';
import { Service } from '../../../domain/entities';
```

---

## 🎨 Assets del Proyecto

### SVG Files
- `desk.svg` - Ilustración de escritorio (280-380px)
- `logo_cosetic_tattoo.svg` - Logo del negocio (40x40px)
- `file.svg`, `globe.svg`, `window.svg` - Next.js defaults
- `next.svg`, `vercel.svg` - Branding

### Fuentes
- Ubicación: `/public/fonts/`
- Nombre: `AvantGarde-BookTh.woff2`
- Estado: ⚠️ Pendiente de agregar

---

## 🚀 Próximos Directorios a Crear

```
src/
├── app/
│   └── servicios/
│       └── [slug]/
│           └── page.tsx       # Página de servicio individual
│
├── presentation/
│   ├── components/
│   │   ├── ServiceDetail/     # Componente de detalle
│   │   ├── BookingForm/       # Formulario de reserva
│   │   └── Calendar/          # Calendario de disponibilidad
│   │
│   └── layouts/
│       └── MainLayout/        # Layout principal
│
└── infrastructure/
    └── api/
        └── ServiceAPI.ts      # Cliente API
```

---

## 📊 Resumen Técnico

- **Arquitectura**: Clean Architecture (4 capas)
- **Framework**: Next.js 16 (App Router)
- **UI Library**: Mantine 8
- **Lenguaje**: TypeScript (strict mode)
- **Estilos**: CSS Modules + Mantine theme
- **Package Manager**: pnpm
- **Total de archivos**: ~30
- **Total de líneas**: ~2,000 (código + docs)
- **Componentes**: 2
- **Capas**: 4
- **Path aliases**: 6

---

**Estado del Proyecto**: ✅ Listo para desarrollo
**Última actualización**: 29 de Octubre, 2025

