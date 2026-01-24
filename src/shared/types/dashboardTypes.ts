/**
 * @fileoverview Tipos e interfaces para los componentes del Dashboard
 * @module shared/types/dashboardTypes
 *
 * Este archivo centraliza todos los tipos TypeScript necesarios para:
 * - Componentes de UI del Dashboard (StatCard, ProgressBar, etc.)
 * - Configuración del Sidebar y Header
 * - Estadísticas y métricas del sistema
 * - Navegación y breadcrumbs
 *
 * @security
 * - Los datos de estudiantes (RecentStudent) NO deben exponerse públicamente
 * - El documentNumber está separado en RecentStudentFull (solo para Coordinadores)
 * - Siempre validar/sanitizar datos antes de renderizar en HTML
 * - Usar permisos de rol para determinar qué estadísticas mostrar
 * - No exponer IDs internos de Firebase en URLs públicas
 *
 * @author Cubbico SIA
 * @version 1.0.1
 */

import { ReactNode } from 'react';

// ============================================
// Tipos Base y Utilidades
// ============================================

/**
 * Dirección de tendencia para indicadores de estadísticas
 * @example
 * const trend: TrendDirection = 'up'; // Indica crecimiento
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Variantes de color disponibles para componentes del Dashboard
 * Basadas en la paleta institucional de Cubbico
 */
export type DashboardColorVariant =
  | 'primary'    // deep-blue
  | 'secondary'  // medium-blue
  | 'accent'     // gold
  | 'success'    // green
  | 'warning'    // orange
  | 'error'      // red
  | 'info'       // light-blue
  | 'neutral';   // gray

/**
 * Tamaños estándar para componentes del Dashboard
 */
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

// ============================================
// Componentes de Estadísticas
// ============================================

/**
 * Información de tendencia para indicadores
 */
export interface TrendInfo {
  /** Dirección de la tendencia */
  direction: TrendDirection;
  /** Valor porcentual del cambio (ej: 12.5 para +12.5%) */
  value: number;
  /** Período de comparación (ej: "vs mes anterior") */
  period?: string;
}

/**
 * Props para el componente StatCard
 * Tarjeta de estadística individual con icono, valor y tendencia
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Estudiantes"
 *   value={250}
 *   icon={<StudentsIcon />}
 *   color="primary"
 *   trend={{ direction: 'up', value: 5.2, period: 'vs mes anterior' }}
 * />
 * ```
 */
export interface StatCardProps {
  /** Título descriptivo de la estadística */
  title: string;
  /** Valor numérico o texto a mostrar */
  value: string | number;
  /** Icono representativo (componente React) */
  icon?: ReactNode;
  /** Variante de color del card */
  color?: DashboardColorVariant;
  /** Información de tendencia (opcional) */
  trend?: TrendInfo;
  /** Subtítulo o descripción adicional */
  subtitle?: string;
  /** Formato del valor (ej: 'number', 'percentage', 'currency') */
  valueFormat?: 'number' | 'percentage' | 'currency' | 'text';
  /** Handler para click en el card (navegación) */
  onClick?: () => void;
  /** Clases CSS adicionales */
  className?: string;
  /** Indica si el card está cargando */
  isLoading?: boolean;
}

/**
 * Props para el componente ProgressBar
 * Barra de progreso con label y porcentaje
 */
export interface ProgressBarProps {
  /** Valor actual (0-100) */
  value: number;
  /** Valor máximo (por defecto 100) */
  max?: number;
  /** Etiqueta de la barra */
  label?: string;
  /** Mostrar porcentaje */
  showPercentage?: boolean;
  /** Variante de color */
  color?: DashboardColorVariant;
  /** Tamaño de la barra */
  size?: 'sm' | 'md' | 'lg';
  /** Animación de llenado */
  animated?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Props para el componente IconBadge
 * Contenedor de icono con fondo de color
 */
export interface IconBadgeProps {
  /** Icono a mostrar (componente React) */
  icon: ReactNode;
  /** Variante de color del fondo */
  color?: DashboardColorVariant;
  /** Tamaño del badge */
  size?: ComponentSize;
  /** Forma del badge */
  shape?: 'circle' | 'rounded' | 'square';
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Props para el componente Card base
 * Contenedor genérico con header opcional
 */
export interface CardProps {
  /** Título del card (opcional) */
  title?: string;
  /** Subtítulo del card (opcional) */
  subtitle?: string;
  /** Acción del header (botón, link, menú) */
  headerAction?: ReactNode;
  /** Contenido del card */
  children: ReactNode;
  /** Padding interno */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Clases CSS adicionales */
  className?: string;
  /** Indica si el card está cargando */
  isLoading?: boolean;
  /** Contenido del footer (opcional) */
  footer?: ReactNode;
}

// ============================================
// Estadísticas del Dashboard
// ============================================

/**
 * Estadísticas por nivel educativo
 */
export interface LevelStats {
  /** Total de estudiantes en el nivel */
  totalStudents: number;
  /** Total de salones en el nivel */
  totalClassrooms: number;
  /** Total de asignaturas en el nivel */
  totalSubjects: number;
  /** Porcentaje de ocupación (estudiantes/capacidad) */
  occupancyRate?: number;
}

/**
 * Estadísticas generales del Dashboard
 * Contiene todas las métricas principales del sistema
 */
export interface DashboardStats {
  /** Total de estudiantes matriculados */
  totalStudents: number;
  /** Total de salones activos */
  totalClassrooms: number;
  /** Total de docentes registrados */
  totalTeachers: number;
  /** Total de asignaturas */
  totalSubjects: number;
  /** Estadísticas por nivel educativo */
  byLevel: {
    preescolar: LevelStats;
    primaria: LevelStats;
    secundaria: LevelStats;
  };
  /** Fecha de última actualización */
  lastUpdated?: Date;
}

/**
 * Estudiante resumido para la tabla del Dashboard (sin datos sensibles)
 *
 * @security Esta interface NO incluye documentNumber por privacidad de menores.
 * Para acceso a datos completos, usar RecentStudentFull con permisos de Coordinador.
 */
export interface RecentStudent {
  /** ID único del estudiante */
  id: string;
  /** Nombre completo */
  fullName: string;
  /** Primer nombre (para avatar) */
  firstName: string;
  /** Primer apellido (para avatar) */
  lastName: string;
  /** Nombre del salón */
  classroomName: string;
  /** ID del salón */
  classroomId: string;
  /** Nivel educativo */
  level: 'preescolar' | 'primaria' | 'secundaria';
  /** Fecha de matrícula */
  enrollmentDate?: Date;
  /** Estado del estudiante */
  status?: 'active' | 'inactive';
}

/**
 * Estudiante con datos completos (solo para Coordinadores/Administradores)
 *
 * @security Esta interface incluye datos sensibles (documentNumber).
 * Solo debe usarse en contextos autorizados con verificación de rol.
 * Usar `filterStudentData` para sanitizar antes de renderizar.
 */
export interface RecentStudentFull extends RecentStudent {
  /** Número de documento (DATO SENSIBLE - solo Coordinadores) */
  documentNumber: string;
  /** Documento enmascarado para visualización segura (ej: ****5678) */
  documentNumberMasked?: string;
}

// ============================================
// Navegación y Sidebar
// ============================================

/**
 * Roles de usuario para control de acceso en navegación
 * Sincronizado con UserRole de AuthGuard.v2.tsx
 */
export type NavUserRole = 'Coordinador' | 'Docente' | 'Administrativo';

/**
 * Badge de notificación para items de navegación
 */
export interface NavBadge {
  /** Valor a mostrar (número o texto) */
  value: string | number;
  /** Variante de color */
  color?: DashboardColorVariant;
}

/**
 * Item de submenú
 */
export interface SubMenuItem {
  /** Identificador único */
  id: string;
  /** Texto a mostrar */
  label: string;
  /** Ruta de navegación */
  path: string;
  /** Descripción para tooltip */
  description?: string;
  /** Badge de notificación */
  badge?: NavBadge;
  /** Roles permitidos para ver este item (si no se especifica, todos pueden ver) */
  allowedRoles?: NavUserRole[];
}

/**
 * Item de navegación del Sidebar
 *
 * @example
 * ```ts
 * const navItem: NavItem = {
 *   id: 'students',
 *   label: 'Estudiantes',
 *   path: '/private/dashboard/student',
 *   icon: StudentsIcon,
 *   badge: { value: 5, color: 'accent' },
 *   submenu: [
 *     { id: 'new', label: 'Nuevo estudiante', path: '/private/dashboard/new-student' }
 *   ]
 * };
 * ```
 */
export interface NavItem {
  /** Identificador único del item */
  id: string;
  /** Texto a mostrar */
  label: string;
  /** Ruta de navegación (null si tiene submenú) */
  path: string | null;
  /** Componente de icono */
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  /** Badge de notificación */
  badge?: NavBadge;
  /** Items de submenú */
  submenu?: SubMenuItem[];
  /** Descripción para tooltip */
  description?: string;
  /** Indica si el item está deshabilitado */
  disabled?: boolean;
  /** Indica si es visible (para permisos) */
  visible?: boolean;
  /** Roles permitidos para ver este item (si no se especifica, todos pueden ver) */
  allowedRoles?: NavUserRole[];
}

/**
 * Configuración completa del Sidebar
 */
export interface SidebarConfig {
  /** Items de navegación principal */
  navItems: NavItem[];
  /** Items de acciones (settings, logout) */
  actionItems: NavItem[];
  /** Logo o nombre de la aplicación */
  brand: {
    name: string;
    logo?: string;
    logoCollapsed?: string;
  };
  /** Mostrar notificaciones inline */
  showNotifications?: boolean;
}

/**
 * Estado del Sidebar
 */
export interface SidebarState {
  /** Indica si el sidebar está abierto (móvil) */
  isOpen: boolean;
  /** Indica si el sidebar está colapsado (desktop) */
  isCollapsed: boolean;
  /** ID del item activo */
  activeItem: string | null;
  /** IDs de submenús expandidos */
  expandedSubmenus: string[];
}

// ============================================
// Header y Breadcrumbs
// ============================================

/**
 * Item de breadcrumb
 */
export interface BreadcrumbItem {
  /** Texto a mostrar */
  label: string;
  /** Ruta de navegación (null para el último item) */
  path: string | null;
  /** Icono opcional */
  icon?: ReactNode;
}

/**
 * Título de página con metadatos
 */
export interface PageTitle {
  /** Título principal */
  title: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Mostrar fecha actual */
  showDate?: boolean;
  /** Formato de fecha personalizado */
  dateFormat?: string;
}

/**
 * Acción del header (botón, dropdown, etc.)
 */
export interface HeaderAction {
  /** Identificador único */
  id: string;
  /** Tipo de acción */
  type: 'button' | 'icon' | 'dropdown';
  /** Texto o aria-label */
  label: string;
  /** Icono del botón */
  icon?: ReactNode;
  /** Handler de click */
  onClick?: () => void;
  /** Items del dropdown (si type='dropdown') */
  items?: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    divider?: boolean;
  }>;
  /** Badge de notificación */
  badge?: NavBadge;
}

/**
 * Configuración del Header
 */
export interface HeaderConfig {
  /** Título de la página */
  pageTitle: PageTitle;
  /** Breadcrumbs de navegación */
  breadcrumbs?: BreadcrumbItem[];
  /** Mostrar barra de búsqueda */
  showSearch?: boolean;
  /** Placeholder de búsqueda */
  searchPlaceholder?: string;
  /** Handler de búsqueda */
  onSearch?: (query: string) => void;
  /** Acciones del header */
  actions?: HeaderAction[];
  /** Mostrar menú de usuario */
  showUserMenu?: boolean;
}

// ============================================
// Layout del Dashboard
// ============================================

/**
 * Props para el componente DashboardLayout
 */
export interface DashboardLayoutProps {
  /** Contenido principal de la página */
  children: ReactNode;
  /** Título de la página */
  title?: string;
  /** Subtítulo de la página */
  subtitle?: string;
  /** Mostrar panel lateral derecho */
  showRightPanel?: boolean;
  /** Contenido del panel derecho */
  rightPanelContent?: ReactNode;
  /** Ancho del panel derecho */
  rightPanelWidth?: 'sm' | 'md' | 'lg';
  /** Breadcrumbs personalizados */
  breadcrumbs?: BreadcrumbItem[];
  /** Acciones del header */
  headerActions?: HeaderAction[];
  /** Clases CSS adicionales para el contenido */
  contentClassName?: string;
  /** Indica si la página está cargando */
  isLoading?: boolean;
}

// ============================================
// DataTable para Dashboard
// ============================================

/**
 * Definición de columna para DataTableV2
 */
export interface TableColumn<T> {
  /** Identificador único de la columna */
  key: string;
  /** Título de la columna */
  title: string;
  /** Campo del objeto a mostrar (o función de render) */
  dataIndex?: keyof T;
  /** Función de render personalizada */
  render?: (value: unknown, record: T, index: number) => ReactNode;
  /** Ancho de la columna */
  width?: string | number;
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right';
  /** Columna ordenable */
  sortable?: boolean;
  /** Columna oculta en móvil */
  hideOnMobile?: boolean;
}

/**
 * Props para el componente DataTableV2
 */
export interface DataTableV2Props<T> {
  /** Definición de columnas */
  columns: TableColumn<T>[];
  /** Datos a mostrar */
  data: T[];
  /** Indica si está cargando */
  loading?: boolean;
  /** Mensaje cuando no hay datos */
  emptyMessage?: string;
  /** Icono para estado vacío */
  emptyIcon?: ReactNode;
  /** Handler de click en fila */
  onRowClick?: (record: T, index: number) => void;
  /** Key única para cada fila */
  rowKey: keyof T | ((record: T) => string);
  /** Clases CSS adicionales */
  className?: string;
  /** Mostrar bordes entre filas */
  striped?: boolean;
  /** Efecto hover en filas */
  hoverable?: boolean;
  /** Tamaño de la tabla */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================
// Hooks y Estado
// ============================================

/**
 * Estado del hook useDashboardStats
 */
export interface DashboardStatsState {
  /** Estadísticas del dashboard */
  stats: DashboardStats | null;
  /** Indica si está cargando */
  loading: boolean;
  /** Error si ocurrió alguno */
  error: string | null;
  /** Función para refrescar datos */
  refresh: () => Promise<void>;
}

/**
 * Opciones para el hook useDashboardStats
 */
export interface DashboardStatsOptions {
  /** Refrescar automáticamente cada X milisegundos */
  autoRefreshInterval?: number;
  /** Cargar datos al montar */
  loadOnMount?: boolean;
}

// ============================================
// Utilidades de formato (con validación de seguridad)
// ============================================

/**
 * Formatea un número como string con separadores de miles
 * @param value - Número a formatear
 * @returns String formateado o '0' si el valor es inválido
 *
 * @security Valida que el valor sea un número finito para prevenir
 * comportamientos inesperados con NaN, Infinity o valores maliciosos.
 *
 * @example
 * formatNumber(1500) // "1.500"
 * formatNumber(NaN)  // "0"
 */
export const formatNumber = (value: number): string => {
  // Validación de entrada
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    if (import.meta.env?.DEV) {
      console.warn(`formatNumber: Invalid value received: ${value}`);
    }
    return '0';
  }
  return new Intl.NumberFormat('es-CO').format(value);
};

/**
 * Formatea una fecha en español
 * @param date - Fecha a formatear
 * @param format - Formato deseado
 * @returns String formateado o 'Fecha no disponible' si es inválida
 *
 * @security Valida que la fecha sea válida para prevenir errores de runtime
 * y mostrar "Invalid Date" en la UI.
 *
 * @example
 * formatDate(new Date()) // "22 de enero de 2026"
 * formatDate(new Date('invalid')) // "Fecha no disponible"
 */
export const formatDate = (
  date: Date,
  format: 'short' | 'long' | 'full' = 'long'
): string => {
  // Validación de fecha válida
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    if (import.meta.env?.DEV) {
      console.warn(`formatDate: Invalid date received: ${date}`);
    }
    return 'Fecha no disponible';
  }

  const optionsMap: Record<'short' | 'long' | 'full', Intl.DateTimeFormatOptions> = {
    short: { day: 'numeric', month: 'short' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  };

  return new Intl.DateTimeFormat('es-CO', optionsMap[format]).format(date);
};

/**
 * Sanitiza una cadena removiendo caracteres HTML peligrosos
 * @param str - Cadena a sanitizar
 * @returns Cadena sanitizada o '?' si es inválida
 *
 * @security Previene XSS al remover caracteres que podrían ser
 * interpretados como HTML si se insertan en el DOM.
 */
const sanitizeString = (str: string): string => {
  if (typeof str !== 'string' || str.trim().length === 0) {
    return '?';
  }
  // Remover caracteres especiales HTML para prevenir XSS
  return str.trim().replace(/[<>'"&]/g, '');
};

/**
 * Obtiene las iniciales de un nombre para avatar
 * @param firstName - Primer nombre
 * @param lastName - Apellido
 * @returns Iniciales (máximo 2 caracteres) o '??' si son inválidos
 *
 * @security Sanitiza los strings de entrada para prevenir XSS y maneja
 * valores null/undefined de forma segura.
 *
 * @example
 * getInitials('Juan', 'Pérez') // "JP"
 * getInitials('', '')          // "??"
 * getInitials('<script>', 'x') // "?X" (sanitizado)
 */
export const getInitials = (firstName: string, lastName: string): string => {
  const first = sanitizeString(firstName).charAt(0).toUpperCase();
  const last = sanitizeString(lastName).charAt(0).toUpperCase();
  return `${first}${last}`;
};

/**
 * Enmascara un número de documento mostrando solo los últimos 4 dígitos
 * @param documentNumber - Número de documento completo
 * @returns Documento enmascarado (ej: "****5678")
 *
 * @security Usa esta función para mostrar documentos de forma segura
 * en la UI sin exponer el número completo.
 *
 * @example
 * maskDocumentNumber('1234567890') // "****7890"
 * maskDocumentNumber('123')         // "****"
 */
export const maskDocumentNumber = (documentNumber: string): string => {
  if (typeof documentNumber !== 'string' || documentNumber.length < 4) {
    return '****';
  }
  const lastFour = documentNumber.slice(-4);
  return `****${lastFour}`;
};
