# Sistema de Diseño - Cubbico

**Versión:** 1.0.0
**Última actualización:** 2026-02-13

---

## 🎨 Paleta de Colores

### Primary Color - The Robust Black to White
Escala de grises institucional para texto, fondos y elementos neutros.

| Nombre | Hex | Uso |
|--------|-----|-----|
| Black | `#000000` | Texto primario |
| Gray 90 | `#1A1A1A` | Texto secundario oscuro |
| Gray 50 | `#7F7F7F` | Texto terciario |
| Gray 10 | `#E6E6E6` | Fondos claros |
| White | `#FFFFFF` | Fondos principales |

### Accent Color - The Orchid Blue
Color principal de la institución, usado para elementos interactivos y estados activos.

| Nombre | Hex | Clase Tailwind | Uso |
|--------|-----|----------------|-----|
| Blue 70 | `#0F2358` | `orchid-blue-70` | Primario oscuro |
| Blue 50 | `#1F4CC0` | `orchid-blue-50` | Primario |
| Blue 20 | `#A4B0F0` | `orchid-blue-20` | Hover states |
| Blue 5 | `#E4F0FF` | `orchid-blue-5` | Fondos suaves |

### Additional Colors - The Short Rainbow

| Color | Hex | Clase Tailwind | Uso |
|-------|-----|----------------|-----|
| Magenta | `#F12E78` | `magenta` | Acciones destructivas, alertas |
| Peach | `#FF5B36` | `peach` | Advertencias |
| Yellow | `#FFD600` | `yellow` | Destacados, éxito |
| Tosca | `#0FCDC8` | `tosca` | Confirmaciones, estados positivos |

---

## 📐 Border Radius

Usar **únicamente** `rounded-lg` para consistencia en todo el sistema.

```tsx
// ✅ Correcto
<button className="rounded-lg">Botón</button>

// ❌ Incorrecto (no usar)
<button className="rounded-xl">Botón</button>
<button className="rounded-2xl">Botón</button>
```

**Valor:** `0.5rem` (8px)

---

## 🔤 Tipografía

### Familia
- **Principal:** Nunito (sans-serif)

### Tamaños

| Clase | Tamaño | Uso |
|-------|--------|-----|
| `text-xs` | 12px | Labels, ayudas |
| `text-sm` | 14px | Cuerpo secundario |
| `text-base` | 16px | Cuerpo principal |
| `text-lg` | 18px | Subtítulos |
| `text-xl` | 20px | Títulos de sección |
| `text-2xl` | 24px | Títulos de página |

### Pesos
- **Normal:** 400 - Cuerpo de texto
- **Medium:** 500 - Elementos destacados
- **Semibold:** 600 - Subtítulos
- **Bold:** 700 - Títulos principales

---

## 🧱 Componentes UI

### Button

```tsx
import Button from '@/components/ui/Button';

// Variantes
<Button variant="primary">Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="accent">Acento</Button>
<Button variant="danger">Peligro</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="md">Mediano</Button>
<Button size="lg">Grande</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `fullWidth`: boolean

---

### Badge

```tsx
import Badge from '@/components/ui/Badge';

<Badge variant="success">Activo</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
```

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'blue'
- `size`: 'sm' | 'md' | 'lg'
- `showDot`: boolean

---

### Card

```tsx
import Card from '@/components/ui/Card';

<Card elevation="md">
  <Card.Header icon={<Icon />}>Título</Card.Header>
  <Card.Body>Contenido</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

**Props:**
- `elevation`: 'none' | 'sm' | 'md' | 'lg'
- `hoverable`: boolean

---

### Modal

```tsx
import Modal from '@/components/modal/Modal';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título del Modal"
  size="lg"
>
  {/* Contenido */}
</Modal>
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'

---

## 📏 Espaciado

Usar escala de Tailwind:

```tsx
// Padding/Margin
p-2   // 8px
p-4   // 16px
p-6   // 24px
p-8   // 32px

// Gap
gap-2  // 8px
gap-4  // 16px
gap-6  // 24px
```

---

## ✨ Estados Interactivos

### Focus Ring
Usar colores institucionales para focus states:

```tsx
focus:ring-2 focus:ring-orchid-blue-20
```

### Hover
Transiciones suaves de 200ms:

```tsx
transition-all duration-200
hover:bg-orchid-blue-60
```

---

## 🎯 Patrones Comunes

### Página con Header

```tsx
<div className="flex h-screen bg-gray-50 overflow-hidden">
  <SidebarV2 />
  <div className="flex-1 flex flex-col min-w-0">
    <HeaderV2 title="Título" />
    <div className="h-16 flex-shrink-0" />
    <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">
      {/* Contenido */}
    </main>
  </div>
</div>
```

### Card Container

```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-100/80 p-4 lg:p-6">
  {/* Contenido */}
</div>
```

### Botón de Acción Principal

```tsx
<button
  className="
    inline-flex items-center gap-2
    px-4 py-2.5 text-sm font-medium
    bg-orchid-blue-50
    text-white rounded-lg
    hover:bg-orchid-blue-60
    transition-all duration-200
  "
>
  <Icon size={18} />
  <span>Acción</span>
</button>
```

---

## 🚫 No Hacer

❌ No usar colores genéricos de Tailwind (emerald, amber, purple, etc.)
❌ No usar `rounded-xl` o `rounded-2xl`
❌ No crear archivos `.css` nuevos (usar solo Tailwind)
❌ No usar `any` en TypeScript
❌ No mezclar estilos inline con clases de Tailwind

---

## ✅ Buenas Prácticas

✅ Usar constantes de diseño de `designTokens.ts`
✅ Componentes UI reutilizables en lugar de duplicar estilos
✅ Mobile-first con responsive design
✅ Accesibilidad con aria-labels y roles
✅ Transiciones suaves para interacciones

---

## 📱 PWA

La aplicación está configurada como PWA con:
- Manifest.json generado automáticamente
- Service worker con caché de assets
- Theme color: `#0F2358` (Orchid Blue)
- Iconos: 192x192, 512x512

---

## 🔗 Referencias

- **Paleta oficial:** `ui/ColorPalette.jpg`
- **Configuración Tailwind:** `tailwind.config.js`
- **Tokens de diseño:** `src/shared/constants/designTokens.ts`
- **Componentes UI:** `src/presentation/components/ui/`
