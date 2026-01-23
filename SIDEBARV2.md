# SidebarV2 & HeaderV2 - Registro de Desarrollo

**Componentes:** SidebarV2, HeaderV2
**Fecha de inicio:** 2026-01-23
**Estado:** En desarrollo
**Fase:** FASE 6 - Rediseño del Dashboard

---

## Objetivo

Rediseñar el Sidebar y Header del Dashboard con Tailwind CSS, inspirado en el diseño "Academix" (ui/ui.webp). Crear un sistema de navegación moderno con:
- Modo expandido y colapsado (desktop)
- Modo drawer (móvil)
- Submenús animados
- Tooltips en modo colapsado
- Persistencia de estado en localStorage
- Header con búsqueda, notificaciones y perfil de usuario

---

## Archivos Creados

### Estructura de carpetas

```
src/presentation/components/
├── sidebarV2/
│   ├── SidebarV2.tsx              # Componente principal
│   ├── index.ts                   # Barrel export
│   ├── components/
│   │   ├── SidebarBrand.tsx       # Logo y toggle
│   │   ├── SidebarNavItem.tsx     # Item de navegación
│   │   ├── SidebarSubmenu.tsx     # Submenús expandibles
│   │   ├── SidebarActions.tsx     # Settings y Logout
│   │   ├── SidebarOverlay.tsx     # Overlay para móvil
│   │   └── SidebarTooltip.tsx     # Tooltip para modo colapsado
│   ├── config/
│   │   └── sidebarNavConfig.ts    # Configuración de navegación
│   └── hooks/
│       └── useSidebarV2.ts        # Hook de estado del sidebar
├── headerV2/
│   ├── HeaderV2.tsx               # Componente principal del header
│   ├── SearchBar.tsx              # Barra de búsqueda
│   ├── UserProfile.tsx            # Perfil de usuario con dropdown
│   └── index.ts                   # Barrel export
├── icons/
│   └── SidebarIcons.ts            # Re-export de iconos Tabler
└── dashboard/
    ├── StatCard.tsx               # Tarjeta de estadísticas
    └── index.ts                   # Barrel export
```

### Tipos creados

```
src/shared/types/
├── dashboardTypes.ts              # Tipos para Dashboard (MT-D01)
├── layoutTypes.ts                 # Tipos para Layout/Sidebar (MT-D08)
└── headerTypes.ts                 # Tipos para Header (MT-H01) ← NUEVO
```

---

## Características Implementadas

### SidebarV2.tsx
- [x] Layout vertical con logo en la parte superior
- [x] Estado colapsado (solo iconos) y expandido (iconos + texto)
- [x] Items de navegación con iconos SVG (Tabler Icons)
- [x] Item activo resaltado con fondo amber y texto amber
- [x] Submenús animados (expandir/colapsar con acordeón)
- [x] Sección inferior con Settings y Logout
- [x] Transición suave al colapsar/expandir (300ms)
- [x] Responsive: drawer en móvil con overlay
- [x] Estilos 100% Tailwind CSS

### useSidebarV2.ts
- [x] Estado `isCollapsed` persistido en localStorage
- [x] Estado `isOpen` para modo drawer (móvil)
- [x] Detección de breakpoints (mobile/tablet/desktop)
- [x] Estado `expandedSubmenus` con comportamiento acordeón
- [x] Funciones: toggleCollapse, toggleSubmenu, open, close
- [x] Cierre automático del drawer al cambiar de ruta

### SidebarTooltip.tsx
- [x] Tooltip con position fixed (evita problemas de overflow)
- [x] Renderizado con createPortal en document.body
- [x] Posición calculada dinámicamente con getBoundingClientRect
- [x] Animación de fade-in/fade-out
- [x] Flecha apuntando al elemento
- [x] Delay configurable antes de mostrar

### SidebarNavItem.tsx
- [x] Soporte para NavLink (navegación) y button (submenús)
- [x] Estados: normal, hover, activo, deshabilitado
- [x] Badge de notificación opcional
- [x] Chevron animado para submenús
- [x] Iconos con tamaño 22px (consistente con SidebarActions)

### SidebarActions.tsx
- [x] Botón de Settings (navega a /private/dashboard/user)
- [x] Botón de Logout con confirmación de carga
- [x] Tooltips funcionales en modo colapsado
- [x] Variante "danger" para logout (hover rojo)

### SidebarIcons.ts
- [x] Re-exportación de iconos de @tabler/icons-react
- [x] Iconos de navegación: Dashboard, Users, Classroom, Book, Calendar, etc.
- [x] Iconos de acciones: Settings, Logout, User
- [x] Iconos de UI: Menu, Close, Chevrons, Search, Bell

---

## HeaderV2 - Características Implementadas (NUEVO)

### HeaderV2.tsx
- [x] Layout: Título+fecha | Búsqueda | Acciones+Perfil
- [x] Se ajusta al sidebar (left: 280px expandido, 64px colapsado)
- [x] Fixed + sticky (z-index 40)
- [x] Componente DateDisplay con formato largo en español
- [x] Botón de notificaciones con badge
- [x] Integra SearchBar y UserProfile
- [x] Obtiene datos del usuario desde Redux
- [x] Responsive (búsqueda oculta en móvil, botón de búsqueda visible)
- [x] 100% Tailwind CSS

### SearchBar.tsx
- [x] Icono de búsqueda (Tabler Icons)
- [x] 3 tamaños: sm, md, lg
- [x] Botón de limpiar (X) cuando hay texto
- [x] Spinner cuando isLoading
- [x] Estados: normal, hover, focus (amber ring)
- [x] Soporte controlado y no controlado
- [x] Escape para limpiar
- [x] Accesibilidad (aria-label, role="search")

### UserProfile.tsx
- [x] Avatar con imagen o iniciales (colores basados en email)
- [x] Nombre y rol del usuario
- [x] Dropdown con portal (evita overflow)
- [x] Opciones: Perfil, Configuración, Logout
- [x] Animación fade-in + slide
- [x] Click outside para cerrar
- [x] Escape para cerrar
- [x] Posición dinámica del dropdown
- [x] 3 tamaños: sm, md, lg
- [x] Layout: horizontal, vertical
- [x] Accesibilidad (aria-expanded, aria-haspopup)

### headerTypes.ts
- [x] ThemeMode, ThemeToggleProps (tema light/dark)
- [x] NotificationItem, NotificationBellProps (notificaciones)
- [x] HeaderQuickAction, QuickActionsBarProps (acciones rápidas)
- [x] DateDisplayProps, DateFormat (fecha)
- [x] UserProfileProps, AvatarProps (perfil de usuario)
- [x] SearchBarExtendedProps, SearchResult (búsqueda con autocompletado)
- [x] HeaderV2Config (configuración del header)
- [x] Utilidades: getInitials, formatHeaderDate, getRelativeTime

---

## Microtareas Relacionadas (FASE 6)

| MT | Descripción | Estado |
|----|-------------|--------|
| MT-D01 | Tipos para Dashboard | ✅ Completada |
| MT-D02 | StatCard | ✅ Completada |
| MT-D08 | Tipos para Layout | ✅ Completada |
| MT-D09 | useSidebarV2 | ✅ Completada |
| MT-D10 | SidebarV2 | ✅ Completada |
| MT-D13 | SidebarIcons | ✅ Completada |
| **MT-H01** | **Tipos para Header** | **✅ Completada** |
| **MT-H02** | **SearchBar** | **✅ Completada** |
| **MT-H03** | **UserProfile** | **✅ Completada** |
| **MT-H04** | **HeaderV2 principal** | **✅ Completada** |
| **MT-H05** | **Integración en Home.tsx** | **✅ Completada** |

---

## Correcciones Realizadas

### 2026-01-23 - Ajuste de iconos y tooltips

**Problema:** Los iconos de navegación se veían más delgados que los de Settings/Logout. Los tooltips no aparecían correctamente en modo colapsado (se cortaban por overflow del nav).

**Solución:**
1. **SidebarNavItem.tsx**: Cambié `size={20} stroke={1.5}` a `size={22}` para iconos más gruesos
2. **SidebarV2.tsx**: Reestructuré el renderizado para aplicar tooltip directamente al item
3. **SidebarTooltip.tsx**: Implementé `createPortal` para renderizar en `document.body` con `position: fixed`

**Archivos modificados:**
- `src/presentation/components/sidebarV2/components/SidebarNavItem.tsx`
- `src/presentation/components/sidebarV2/components/SidebarTooltip.tsx`
- `src/presentation/components/sidebarV2/SidebarV2.tsx`

### 2026-01-23 - Implementación de HeaderV2

**Cambios realizados:**
1. Creado `headerTypes.ts` con tipos completos para el header
2. Creado `SearchBar.tsx` con barra de búsqueda moderna
3. Creado `UserProfile.tsx` con dropdown y avatar
4. Creado `HeaderV2.tsx` integrando todos los componentes
5. Modificado `Home.tsx` para usar HeaderV2 en lugar de Navbar legacy

**Archivos creados:**
- `src/shared/types/headerTypes.ts`
- `src/presentation/components/headerV2/SearchBar.tsx`
- `src/presentation/components/headerV2/UserProfile.tsx`
- `src/presentation/components/headerV2/HeaderV2.tsx`
- `src/presentation/components/headerV2/index.ts`

**Archivos modificados:**
- `src/presentation/pages/private/Dashboard/components/Home.tsx`

---

## Dependencias Agregadas

```json
{
  "@tabler/icons-react": "^3.x.x"
}
```

---

## Uso de los Componentes

### SidebarV2 + HeaderV2 (Layout completo)

```tsx
import { SidebarV2 } from '@/presentation/components/sidebarV2';
import { HeaderV2 } from '@/presentation/components/headerV2';

function Dashboard() {
  // Hook para sincronizar con localStorage del sidebar
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('cubbico-sidebar-collapsed') === 'true';
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarV2 />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderV2
          title="Dashboard"
          showDate
          showSearch
          isSidebarCollapsed={isCollapsed}
        />
        <div className="h-16" /> {/* Spacer para header fixed */}
        <main className="flex-1 p-6">
          {/* Contenido */}
        </main>
      </div>
    </div>
  );
}
```

### SearchBar standalone

```tsx
import { SearchBar } from '@/presentation/components/headerV2';

<SearchBar
  placeholder="Buscar estudiantes..."
  onSubmit={(query) => console.log(query)}
  size="md"
/>
```

### UserProfile standalone

```tsx
import { UserProfile } from '@/presentation/components/headerV2';

<UserProfile
  user={{
    displayName: "Juan Pérez",
    email: "juan@email.com",
    role: "Docente"
  }}
  showRole
  onLogout={() => handleLogout()}
  onSettings={() => navigate('/settings')}
/>
```

---

## Pendiente

- [x] ~~Integrar SidebarV2 en Dashboard.tsx~~
- [x] ~~Crear HeaderV2 con barra de búsqueda y avatar~~
- [ ] Crear DashboardLayout que combine Sidebar + Header + Content
- [ ] Migrar HeaderV2 a todas las páginas del Dashboard
- [ ] Probar en diferentes breakpoints
- [ ] Corregir errores TypeScript preexistentes
- [ ] Hacer commit de todos los cambios

---

## Notas Técnicas

### Z-index hierarchy
- Header: z-40
- Sidebar: z-50
- Sidebar Overlay: z-40
- Tooltips: z-[9999]
- UserProfile Dropdown: z-[9999]

### Breakpoints
- Móvil: < 768px (md)
- Tablet: 768px - 1024px
- Desktop: > 1024px (lg)

### Persistencia
- Sidebar collapsed: `cubbico-sidebar-collapsed` en localStorage
- Header sincroniza leyendo ese mismo key

### Comunicación Sidebar ↔ Header
- Actualmente: polling cada 100ms del localStorage
- Futuro: considerar React Context para mejor performance

---

## Errores TypeScript Preexistentes

Los siguientes errores existen pero no bloquean el desarrollo:
- `AuthGuard.v2.tsx` - problema con argumentos
- `user.ts` - tipos de Redux
- `SidebarIcons.ts` - TablerIconsProps
- `sidebarNavConfig.ts` - tipos de iconos

Estos deberían corregirse en una microtarea de limpieza.

---

**Última actualización:** 2026-01-23
