/**
 * @fileoverview Re-exportación de iconos Tabler para el Sidebar
 * @module presentation/components/icons/SidebarIcons
 *
 * Centraliza los iconos usados en el SidebarV2 para facilitar
 * cambios futuros y mantener consistencia.
 *
 * @see https://tabler.io/icons
 * @author Cubbico SIA
 * @version 1.0.0
 */

// ============================================
// Iconos de Navegación Principal
// ============================================

/** Icono de Dashboard/Home */
export { IconLayoutDashboard as DashboardIcon } from '@tabler/icons-react';

/** Icono de Usuarios/Estudiantes */
export { IconUsers as UsersIcon } from '@tabler/icons-react';

/** Icono de Salones/Aulas */
export { IconBuildingCommunity as ClassroomIcon } from '@tabler/icons-react';

/** Icono de Libros/Asignaturas */
export { IconBook as BookIcon } from '@tabler/icons-react';

/** Icono de Reloj/Fechas */
export { IconClock as ClockIcon } from '@tabler/icons-react';

/** Icono de Calendario/Periodos */
export { IconCalendar as CalendarIcon } from '@tabler/icons-react';

/** Icono de Evaluaciones/Notas */
export { IconClipboardCheck as EvaluationIcon } from '@tabler/icons-react';

/** Icono de Aspirantes/Admisiones */
export { IconUserPlus as AspirantIcon } from '@tabler/icons-react';

/** Icono de Matrícula */
export { IconId as EnrollmentIcon } from '@tabler/icons-react';

// ============================================
// Iconos de Acciones
// ============================================

/** Icono de Configuración */
export { IconSettings as SettingsIcon } from '@tabler/icons-react';

/** Icono de Cerrar Sesión */
export { IconLogout as LogoutIcon } from '@tabler/icons-react';

/** Icono de Perfil de Usuario */
export { IconUser as UserIcon } from '@tabler/icons-react';

// ============================================
// Iconos de UI/Control
// ============================================

/** Icono de Menú (hamburger) */
export { IconMenu2 as MenuIcon } from '@tabler/icons-react';

/** Icono de Cerrar */
export { IconX as CloseIcon } from '@tabler/icons-react';

/** Icono de Chevron derecho (expandir) */
export { IconChevronRight as ChevronRightIcon } from '@tabler/icons-react';

/** Icono de Chevron izquierdo (colapsar) */
export { IconChevronLeft as ChevronLeftIcon } from '@tabler/icons-react';

/** Icono de Chevron abajo (submenú cerrado) */
export { IconChevronDown as ChevronDownIcon } from '@tabler/icons-react';

/** Icono de Chevron arriba (submenú abierto) */
export { IconChevronUp as ChevronUpIcon } from '@tabler/icons-react';

// ============================================
// Iconos Adicionales
// ============================================

/** Icono de Notificación/Campana */
export { IconBell as BellIcon } from '@tabler/icons-react';

/** Icono de Búsqueda */
export { IconSearch as SearchIcon } from '@tabler/icons-react';

/** Icono de Sol (modo claro) */
export { IconSun as SunIcon } from '@tabler/icons-react';

/** Icono de Luna (modo oscuro) */
export { IconMoon as MoonIcon } from '@tabler/icons-react';

/** Icono de Flecha externa (link externo) */
export { IconExternalLink as ExternalLinkIcon } from '@tabler/icons-react';

/** Icono de Punto/Badge */
export { IconPoint as PointIcon } from '@tabler/icons-react';

// ============================================
// Re-exportar tipo de props de Tabler
// ============================================

export type { TablerIconsProps as IconProps } from '@tabler/icons-react';
