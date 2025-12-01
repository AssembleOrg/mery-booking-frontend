# Guía de Configuración

## ✅ Pasos Completados

1. ✅ Next.js 16 configurado con App Router
2. ✅ Mantine 8 instalado y configurado
3. ✅ Clean Architecture implementada
4. ✅ TypeScript configurado con path aliases
5. ✅ Componentes base creados (Header, WelcomeSection)
6. ✅ Diseño responsive mobile-first
7. ✅ Tema personalizado con colores rosados

## ⚠️ Pendientes

### 1. Fuente Personalizada

**Ubicación**: `/public/fonts/AvantGarde-BookTh.woff2`

**Pasos**:
1. Obtén el archivo de fuente AvantGarde-BookTh en formato `.woff2`
2. Colócalo en la carpeta `/public/fonts/`
3. Descomenta y actualiza la configuración en `src/app/layout.tsx`:

```typescript
import localFont from 'next/font/local';

const avantGarde = localFont({
  src: [
    {
      path: '../../public/fonts/AvantGarde-BookTh.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AvantGarde-BookTh.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AvantGarde-BookTh.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AvantGarde-BookTh.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-avant-garde',
  display: 'swap',
  fallback: ['sans-serif'],
});
```

### 2. Ilustración del Escritorio

**Ubicación actual**: `/public/desk.svg`

El archivo existe pero verifica que sea la ilustración correcta de la imagen de referencia (mujer en escritorio con calendario y reloj).

### 3. Logo

**Ubicación actual**: `/public/logo_cosetic_tattoo.svg`

Verifica que el logo sea el correcto y actualiza el tamaño si es necesario en `Header.tsx`.

## 🎨 Personalización de Colores

Los colores del tema se configuran en `src/presentation/providers/MantineProvider.tsx`:

```typescript
colors: {
  pink: [
    '#ffeef5', // 0 - más claro
    '#fdd8e5', // 1
    '#f5aeca', // 2
    '#ee81ad', // 3
    '#e85c95', // 4
    '#e54586', // 5
    '#e4387e', // 6 - primario
    '#cb2b6b', // 7
    '#b6245f', // 8
    '#9f1a52', // 9 - más oscuro
  ],
}
```

Para cambiar los colores de los botones, edita `WelcomeSection.tsx`:
- Botón 1: `color="pink.4"`
- Botón 2: `color="pink.3"`
- Botón 3: `color="pink.5"`

## 🔗 Funcionalidad de Botones

Actualmente los botones están estáticos. Para agregar navegación:

```typescript
// En WelcomeSection.tsx
import { useRouter } from 'next/navigation';

export function WelcomeSection() {
  const router = useRouter();

  const handleServiceClick = (serviceSlug: string) => {
    router.push(`/servicios/${serviceSlug}`);
  };

  // En cada botón:
  <Button onClick={() => handleServiceClick('cosmetic-tattoo')}>
    COSMETIC TATTOO
  </Button>
}
```

## 📱 Testing Responsive

Prueba el diseño en estos breakpoints:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

El diseño está optimizado para mobile-first y se adapta automáticamente.

## 🚀 Comandos Útiles

```bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Iniciar en producción
pnpm start

# Linter
pnpm lint
```

## 📝 Próximas Funcionalidades

1. **Página de servicios individuales**
   - Crear `/app/servicios/[slug]/page.tsx`
   - Mostrar detalles del servicio
   - Botón para reservar

2. **Sistema de reservas**
   - Calendario de disponibilidad
   - Selección de fecha y hora
   - Formulario de datos del cliente

3. **Autenticación**
   - Login/Registro
   - Área de usuario
   - Historial de reservas

4. **Backend Integration**
   - API para servicios
   - API para reservas
   - Base de datos

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que estés usando pnpm (no npm o yarn)
2. Asegúrate de que todos los SVG existan en `/public/`
3. Verifica que Next.js 16 esté correctamente instalado
4. Revisa la consola del navegador para errores
5. Verifica que el puerto 3000 esté disponible

## 🎯 Estructura de Archivos Importantes

```
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout principal con Mantine
│   │   ├── page.tsx            # Página de inicio
│   │   └── globals.css         # Estilos globales
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── Header/         # Componente de cabecera
│   │   │   └── WelcomeSection/ # Sección principal
│   │   └── providers/
│   │       └── MantineProvider.tsx # Configuración de Mantine
│   ├── domain/
│   │   ├── entities/           # Modelos de dominio
│   │   └── repositories/       # Interfaces
│   ├── application/
│   │   └── use-cases/          # Casos de uso
│   └── infrastructure/
│       └── repositories/       # Implementaciones
└── public/
    ├── fonts/                  # Fuentes personalizadas
    ├── desk.svg               # Ilustración
    └── logo_cosetic_tattoo.svg # Logo
```

---

¡Todo está listo para comenzar a desarrollar! 🎉

