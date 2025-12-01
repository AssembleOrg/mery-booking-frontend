# 🚀 Guía de Inicio Rápido

## ⚡ Inicio en 3 Pasos

### 1️⃣ Instalar Dependencias
```bash
pnpm install
```

### 2️⃣ Ejecutar en Desarrollo
```bash
pnpm dev
```

### 3️⃣ Abrir en Navegador
```
http://localhost:3000
```

¡Listo! 🎉

---

## 🎯 Vista Actual

Al abrir el navegador verás:

- ✅ Header con logo "MERY GARCÍA - COSMETIC TATTOO"
- ✅ Menú hamburguesa responsive
- ✅ Ilustración de escritorio
- ✅ Mensaje de bienvenida
- ✅ 3 botones de servicios:
  - COSMETIC TATTOO (rosa medio)
  - ESTILISMO DE CEJAS (rosa claro)
  - PARAMEDICAL TATTOO (rosa oscuro)

---

## ⚠️ Nota Importante: Fuente Personalizada

El proyecto está configurado para usar la fuente **AvantGarde-BookTh**, pero necesitas agregarla manualmente:

### Paso 1: Obtener la fuente
Descarga o convierte el archivo a formato `.woff2`

### Paso 2: Colocar el archivo
```
/public/fonts/AvantGarde-BookTh.woff2
```

### Paso 3: Actualizar layout.tsx
En `src/app/layout.tsx`, reemplaza la configuración temporal de fuente con:

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

Y en el JSX del layout:

```typescript
<body className={avantGarde.variable} style={{ margin: 0 }}>
```

**Mientras tanto**: El proyecto usa una fuente de sistema como fallback y funciona perfectamente.

---

## 📱 Testing Responsive

Prueba estos tamaños en DevTools:

### Mobile
- iPhone SE: 375×667
- iPhone 12 Pro: 390×844
- Pixel 5: 393×851

### Tablet
- iPad Mini: 768×1024
- iPad Air: 820×1180

### Desktop
- 1024×768
- 1440×900
- 1920×1080

El diseño se adapta automáticamente a todos los tamaños.

---

## 🎨 Personalización Rápida

### Cambiar colores de botones
Edita `src/presentation/components/WelcomeSection/WelcomeSection.tsx`:

```typescript
// Cambiar el color del primer botón
<Button color="pink.6">  // Valores: pink.0 a pink.9
  COSMETIC TATTOO
</Button>
```

### Cambiar textos
Edita `src/presentation/components/WelcomeSection/WelcomeSection.tsx`:

```typescript
<Text>
  Tu nuevo texto aquí
</Text>
```

### Cambiar logo
Reemplaza `/public/logo_cosetic_tattoo.svg` con tu logo

### Cambiar ilustración
Reemplaza `/public/desk.svg` con tu ilustración

---

## 🔧 Comandos Útiles

```bash
# Desarrollo con hot reload
pnpm dev

# Build para producción
pnpm build

# Ejecutar build de producción
pnpm start

# Linter
pnpm lint

# Ver puerto específico
pnpm dev -- -p 3001
```

---

## 📂 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `src/app/page.tsx` | Página principal (/) |
| `src/app/layout.tsx` | Layout y configuración |
| `src/presentation/components/Header/` | Componente del header |
| `src/presentation/components/WelcomeSection/` | Sección principal |
| `src/presentation/providers/MantineProvider.tsx` | Tema y colores |

---

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
# Verifica que el puerto 3000 esté libre
lsof -ti:3000 | xargs kill -9

# Reinstala dependencias
rm -rf node_modules
pnpm install
```

### Errores de TypeScript
```bash
# Limpia el cache
rm -rf .next
pnpm dev
```

### La fuente no se ve
- Verifica que el archivo esté en `/public/fonts/`
- Verifica que el nombre sea exacto: `AvantGarde-BookTh.woff2`
- Reinicia el servidor

### Los estilos no se aplican
- Limpia el cache del navegador
- Reinicia el servidor
- Verifica que `@mantine/core/styles.css` esté importado en `layout.tsx`

---

## 📚 Documentación Adicional

- **README.md** - Visión general del proyecto
- **SETUP.md** - Guía detallada de configuración
- **IMPLEMENTACION.md** - Documentación técnica completa

---

## 🎯 Próximos Pasos

1. ✅ Agregar fuente personalizada
2. ⬜ Crear páginas de servicios individuales
3. ⬜ Implementar sistema de reservas
4. ⬜ Agregar autenticación
5. ⬜ Conectar con backend

---

## 💡 Tips

- Usa **pnpm** (no npm o yarn) - es más rápido
- Guarda con Ctrl+S para hot reload automático
- Usa las DevTools de React para debugging
- Revisa la consola del navegador para errores

---

## ✨ Features Destacadas

- 📱 Mobile First Design
- 🎨 Mantine UI Components
- 🏗️ Clean Architecture
- 📦 Path Aliases Configurados
- 🔄 Hot Reload
- 🎯 TypeScript Strict Mode
- 🌐 Fully Responsive

---

¡Disfruta desarrollando! 🚀

**¿Necesitas ayuda?** Revisa la documentación completa en los archivos .md del proyecto.

