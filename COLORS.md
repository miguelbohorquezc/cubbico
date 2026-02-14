# Sistema de Colores Cubbico

Paleta oficial basada en `ui/ColorPalette.jpg` - StyleDoubler Design System

---

## 📋 Índice de Colores

### PRIMARY COLOR - The Robust Black to White

Escala de grises para textos, fondos y bordes.

| Nombre       | Tailwind Class | Hex Code | Uso Principal |
|--------------|----------------|----------|---------------|
| **Black**    | `black`        | #000000  | Textos muy oscuros |
| **Gray 90**  | `gray-90`      | #1A1A14  | Textos primarios |
| **Gray 80**  | `gray-80`      | #333333  | Textos secundarios |
| **Gray 70**  | `gray-70`      | #4D4D4D  | Textos terciarios |
| **Gray 60**  | `gray-60`      | #666666  | Textos deshabilitados |
| **Gray 50**  | `gray-50`      | #808080  | Placeholders |
| **Gray 40**  | `gray-40`      | #999999  | Bordes sutiles |
| **Gray 30**  | `gray-30`      | #BFBFBF  | Bordes secundarios |
| **Gray 20**  | `gray-20`      | #D9D9D9  | Fondos secundarios |
| **Gray 10**  | `gray-10`      | #E6E6E6  | Fondos terciarios |
| **Gray 5**   | `gray-5`       | #F2F2F2  | Fondos claros |
| **White**    | `white`        | #FFFFFF  | Fondo principal |

---

### ACCENT COLOR - The Orchid Blue

Color principal de la institución. Usa estos para elementos interactivos.

| Nombre       | Tailwind Class    | Hex Code | Uso Principal |
|--------------|-------------------|----------|---------------|
| **Blue 70**  | `orchid-blue-70`  | #0F2358  | Textos sobre fondos claros |
| **Blue 60**  | `orchid-blue-60`  | #1A3C57  | Botones principales, badges |
| **Blue 50**  | `orchid-blue-50`  | #1F4CC0  | Color principal (Main) |
| **Blue 40**  | `orchid-blue-40`  | #4272BF  | Hover states |
| **Blue 30**  | `orchid-blue-30`  | #65A8BF  | Bordes de badges |
| **Blue 20**  | `orchid-blue-20`  | #A4B0F0  | Badges, contadores |
| **Blue 10**  | `orchid-blue-10`  | #CAC9FF  | Fondos de badges claros |
| **Blue 5**   | `orchid-blue-5`   | #E4F0FF  | Fondos sutiles |

---

### ADDITIONAL COLORS - The Short Rainbow

Colores de apoyo para casos especiales (campañas, tags, alertas).

#### Magenta (Errores, Urgente)
| Nombre          | Tailwind Class | Hex Code | Uso Principal |
|-----------------|----------------|----------|---------------|
| **Magenta DS**  | `magenta-ds`   | #F12E78  | Errores, alertas críticas |
| **Magenta CC**  | `magenta-cc`   | #A52C5F  | Hover de errores |

#### Peach (Advertencias)
| Nombre       | Tailwind Class | Hex Code | Uso Principal |
|--------------|----------------|----------|---------------|
| **Peach DS** | `peach-ds`     | #FF5B36  | Advertencias, atención |
| **Peach CC** | `peach-cc`     | #CC4A2B  | Hover de advertencias |

#### Yellow (Información, Pendiente)
| Nombre        | Tailwind Class | Hex Code | Uso Principal |
|---------------|----------------|----------|---------------|
| **Yellow DS** | `yellow-ds`    | #FFD600  | Info, pendiente |
| **Yellow CC** | `yellow-cc`    | #F4B527  | Hover de info |

#### Tosca (Éxito, Confirmación)
| Nombre       | Tailwind Class | Hex Code | Uso Principal |
|--------------|----------------|----------|---------------|
| **Tosca DS** | `tosca-ds`     | #0FCDC8  | Éxito, confirmación |
| **Tosca CC** | `tosca-cc`     | #0CA39F  | Hover de éxito |

---

## 🎨 Guía de Uso por Componente

### Botones

```tsx
// Botón Principal
className="bg-orchid-blue-60 text-white hover:bg-orchid-blue-70"

// Botón Secundario
className="bg-orchid-blue-30 text-white hover:bg-orchid-blue-40"

// Botón Outline
className="border border-orchid-blue-50 text-orchid-blue-60 hover:bg-orchid-blue-5"

// Botón Peligro
className="bg-magenta-ds text-white hover:bg-magenta-cc"

// Botón Éxito
className="bg-tosca-ds text-white hover:bg-tosca-cc"
```

### Badges

```tsx
// Badge Info (Blue)
className="bg-orchid-blue-10 text-orchid-blue-70 border border-orchid-blue-30"

// Badge Contador
className="bg-orchid-blue-20 text-orchid-blue-70"

// Badge Éxito
className="bg-tosca-ds/10 text-tosca-cc border border-tosca-ds/30"

// Badge Error
className="bg-magenta-ds/10 text-magenta-cc border border-magenta-ds/30"

// Badge Advertencia
className="bg-yellow-ds/10 text-yellow-cc border border-yellow-ds/30"
```

### Textos

```tsx
// Título Principal
className="text-gray-90 font-bold"

// Título Secundario
className="text-gray-80 font-semibold"

// Texto Normal
className="text-gray-70"

// Texto Secundario
className="text-gray-60"

// Placeholder
className="text-gray-50"
```

### Fondos

```tsx
// Fondo Principal
className="bg-white"

// Fondo Secundario
className="bg-gray-5"

// Fondo Terciario
className="bg-gray-10"

// Fondo Hover
className="hover:bg-gray-20"
```

### Bordes

```tsx
// Borde Sutil
className="border border-gray-20"

// Borde Normal
className="border border-gray-30"

// Borde Seleccionado
className="border-2 border-orchid-blue-50"

// Borde Hover
className="border border-gray-40 hover:border-orchid-blue-40"
```

---

## 📦 Ejemplos de Componentes Comunes

### Card con Header
```tsx
<div className="bg-white border border-gray-20 rounded-lg">
  {/* Header */}
  <div className="bg-orchid-blue-5 px-4 py-3 border-b border-gray-20">
    <h3 className="text-gray-90 font-semibold">Título</h3>
  </div>
  {/* Body */}
  <div className="p-4">
    <p className="text-gray-70">Contenido</p>
  </div>
</div>
```

### Lista con Items Clickeables
```tsx
<div className="space-y-1">
  <button className="w-full text-left px-3 py-2 rounded-lg text-gray-70 hover:bg-orchid-blue-5 hover:text-orchid-blue-70">
    Item 1
  </button>
  <button className="w-full text-left px-3 py-2 rounded-lg bg-orchid-blue-10 text-orchid-blue-70 font-medium">
    Item 2 (Activo)
  </button>
</div>
```

### Badge con Contador
```tsx
<div className="flex items-center gap-2">
  <span className="text-gray-70">Estudiantes</span>
  <span className="px-2 py-0.5 bg-orchid-blue-20 text-orchid-blue-70 rounded-full text-xs font-semibold">
    24
  </span>
</div>
```

---

## 🔧 Cómo Usar Este Sistema

### Paso 1: Identificar el Elemento
- ¿Es un botón? → Usa Blue 60 o Blue 50
- ¿Es un badge? → Usa Blue 10 + Blue 70
- ¿Es texto? → Usa Gray 70 o Gray 80
- ¿Es un contador? → Usa Blue 20

### Paso 2: Aplicar el Color
Simplemente di el nombre del color y el componente:
- "El badge de evaluación usa **Blue 10**"
- "El botón exportar usa **Blue 60**"
- "El contador usa **Blue 20**"

### Paso 3: No Necesitas Decir el Archivo
Solo di: "En la vista X, el elemento Y debe ser **Blue 60**"

---

## ✅ Validación Rápida

**¿El color está bien?**
- Botones principales → Blue 60 ✓
- Badges informativos → Blue 10 ✓
- Contadores → Blue 20 ✓
- Textos principales → Gray 70 o Gray 80 ✓
- Hover de botones → Blue 70 ✓

---

*Última actualización: 2024*
*Basado en StyleDoubler Design System*
