/**
 * @fileoverview Tipos e interfaces específicos para el HeaderV2 del Dashboard
 * @module shared/types/headerTypes
 *
 * Este archivo define tipos adicionales para el HeaderV2 que complementan
 * los tipos base definidos en layoutTypes.ts y dashboardTypes.ts.
 *
 * Incluye:
 * - Configuración de notificaciones
 * - Toggle de tema (light/dark)
 * - Acciones rápidas del header
 * - Props extendidas para componentes del header
 *
 * @security
 * - No exponer datos sensibles en notificaciones
 * - Sanitizar contenido de notificaciones antes de renderizar
 * - Validar URLs de avatares antes de mostrar
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import { ReactNode } from 'react';

// Re-exportar tipos relacionados de layoutTypes para conveniencia
export type {
  HeaderV2Props,
  HeaderUserInfo,
  SearchBarProps,
  UserMenuProps,
  UserMenuItem,
} from './layoutTypes';

// ============================================
// Tema (Light/Dark Mode)
// ============================================

/**
 * Modos de tema disponibles
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Props para el componente ThemeToggle
 */
export interface ThemeToggleProps {
  /** Tema actual */
  currentTheme: ThemeMode;
  /** Handler de cambio de tema */
  onThemeChange: (theme: ThemeMode) => void;
  /** Mostrar solo icono (sin texto) */
  iconOnly?: boolean;
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg';
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Notificaciones
// ============================================

/**
 * Tipos de notificación
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message';

/**
 * Prioridad de notificación
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Elemento de notificación individual
 * @security No incluir datos personales sensibles en el contenido
 */
export interface NotificationItem {
  /** ID único de la notificación */
  id: string;
  /** Tipo de notificación */
  type: NotificationType;
  /** Título de la notificación */
  title: string;
  /** Mensaje/descripción (máx 150 caracteres recomendado) */
  message: string;
  /** Fecha/hora de la notificación */
  timestamp: Date | string;
  /** Indica si ha sido leída */
  isRead: boolean;
  /** Prioridad de la notificación */
  priority?: NotificationPriority;
  /** URL para navegar al hacer click (opcional) */
  actionUrl?: string;
  /** Texto del botón de acción (opcional) */
  actionLabel?: string;
  /** Icono personalizado (opcional) */
  icon?: ReactNode;
  /** Avatar del remitente (opcional, para mensajes) */
  avatarUrl?: string;
  /** Nombre del remitente (opcional, para mensajes) */
  senderName?: string;
}

/**
 * Props para el componente NotificationBell
 */
export interface NotificationBellProps {
  /** Lista de notificaciones */
  notifications: NotificationItem[];
  /** Número máximo a mostrar en el badge */
  maxBadgeCount?: number;
  /** Handler al hacer click en una notificación */
  onNotificationClick?: (notification: NotificationItem) => void;
  /** Handler para marcar como leída */
  onMarkAsRead?: (notificationId: string) => void;
  /** Handler para marcar todas como leídas */
  onMarkAllAsRead?: () => void;
  /** Handler para limpiar todas */
  onClearAll?: () => void;
  /** Indica si el dropdown está abierto */
  isOpen?: boolean;
  /** Handler de toggle del dropdown */
  onToggle?: () => void;
  /** Tamaño del icono */
  size?: 'sm' | 'md' | 'lg';
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Props para el dropdown de notificaciones
 */
export interface NotificationDropdownProps {
  /** Lista de notificaciones */
  notifications: NotificationItem[];
  /** Indica si está abierto */
  isOpen: boolean;
  /** Handler de cierre */
  onClose: () => void;
  /** Handler al hacer click en una notificación */
  onNotificationClick?: (notification: NotificationItem) => void;
  /** Handler para marcar como leída */
  onMarkAsRead?: (notificationId: string) => void;
  /** Handler para marcar todas como leídas */
  onMarkAllAsRead?: () => void;
  /** Texto cuando no hay notificaciones */
  emptyMessage?: string;
  /** Máximo de notificaciones a mostrar */
  maxVisible?: number;
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Acciones Rápidas del Header
// ============================================

/**
 * Tipos de acciones rápidas
 */
export type QuickActionType = 'theme' | 'notifications' | 'settings' | 'help' | 'custom';

/**
 * Acción rápida del header (iconos a la derecha)
 */
export interface HeaderQuickAction {
  /** ID único */
  id: string;
  /** Tipo de acción */
  type: QuickActionType;
  /** Aria-label para accesibilidad */
  ariaLabel: string;
  /** Icono a mostrar */
  icon: ReactNode;
  /** Handler de click */
  onClick?: () => void;
  /** Número para badge (opcional) */
  badgeCount?: number;
  /** Indica si está activo/seleccionado */
  isActive?: boolean;
  /** Indica si está deshabilitado */
  disabled?: boolean;
  /** Tooltip text */
  tooltip?: string;
}

/**
 * Props para la barra de acciones rápidas
 */
export interface QuickActionsBarProps {
  /** Lista de acciones */
  actions: HeaderQuickAction[];
  /** Tamaño de los iconos */
  size?: 'sm' | 'md' | 'lg';
  /** Espaciado entre acciones */
  gap?: 'sm' | 'md' | 'lg';
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Fecha y Hora
// ============================================

/**
 * Formato de fecha para mostrar
 */
export type DateFormat = 'short' | 'medium' | 'long' | 'full';

/**
 * Props para el componente de fecha
 */
export interface DateDisplayProps {
  /** Fecha a mostrar (por defecto: hoy) */
  date?: Date;
  /** Formato de fecha */
  format?: DateFormat;
  /** Mostrar icono de calendario */
  showIcon?: boolean;
  /** Locale para formateo */
  locale?: string;
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Perfil de Usuario
// ============================================

/**
 * Props extendidas para el componente UserProfile
 * Extiende HeaderUserInfo con funcionalidad adicional
 */
export interface UserProfileProps {
  /** Información del usuario */
  user: {
    /** Nombre para mostrar */
    displayName: string;
    /** Email del usuario */
    email: string;
    /** URL del avatar */
    avatarUrl?: string;
    /** Rol del usuario */
    role?: string;
    /** Iniciales (calculadas si no se provee avatarUrl) */
    initials?: string;
  };
  /** Mostrar rol del usuario */
  showRole?: boolean;
  /** Mostrar email */
  showEmail?: boolean;
  /** Indica si el dropdown está abierto */
  isDropdownOpen?: boolean;
  /** Handler de toggle dropdown */
  onToggleDropdown?: () => void;
  /** Handler de logout */
  onLogout?: () => void;
  /** Handler para ir a perfil */
  onViewProfile?: () => void;
  /** Handler para ir a configuración */
  onSettings?: () => void;
  /** Tamaño del avatar */
  avatarSize?: 'sm' | 'md' | 'lg';
  /** Orientación del layout */
  layout?: 'horizontal' | 'vertical';
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Props para el componente Avatar
 */
export interface AvatarProps {
  /** URL de la imagen */
  src?: string;
  /** Texto alternativo */
  alt?: string;
  /** Iniciales a mostrar si no hay imagen */
  initials?: string;
  /** Tamaño del avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Forma del avatar */
  shape?: 'circle' | 'square' | 'rounded';
  /** Color de fondo (si no hay imagen) */
  bgColor?: string;
  /** Color del texto (para iniciales) */
  textColor?: string;
  /** Indica si está online (mostrar badge verde) */
  isOnline?: boolean;
  /** Indica si tiene notificaciones */
  hasNotification?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Barra de Búsqueda Extendida
// ============================================

/**
 * Resultado de búsqueda
 */
export interface SearchResult {
  /** ID único */
  id: string;
  /** Tipo de resultado */
  type: 'student' | 'classroom' | 'teacher' | 'document' | 'page';
  /** Título/nombre */
  title: string;
  /** Descripción/subtítulo */
  subtitle?: string;
  /** URL de avatar/icono */
  avatarUrl?: string;
  /** URL para navegar */
  url: string;
  /** Metadatos adicionales */
  metadata?: Record<string, string>;
}

/**
 * Props extendidas para SearchBar con autocompletado
 */
export interface SearchBarExtendedProps {
  /** Placeholder del input */
  placeholder?: string;
  /** Valor actual */
  value?: string;
  /** Handler de cambio */
  onChange?: (value: string) => void;
  /** Handler de submit */
  onSubmit?: (value: string) => void;
  /** Handler de selección de resultado */
  onResultSelect?: (result: SearchResult) => void;
  /** Resultados de búsqueda */
  results?: SearchResult[];
  /** Indica si está buscando */
  isSearching?: boolean;
  /** Mostrar resultados recientes */
  showRecent?: boolean;
  /** Búsquedas recientes */
  recentSearches?: string[];
  /** Handler para limpiar historial */
  onClearHistory?: () => void;
  /** Debounce en ms */
  debounceMs?: number;
  /** Mínimo de caracteres para buscar */
  minChars?: number;
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Configuración del Header
// ============================================

/**
 * Configuración completa del HeaderV2
 */
export interface HeaderV2Config {
  /** Mostrar título de página */
  showTitle: boolean;
  /** Mostrar fecha actual */
  showDate: boolean;
  /** Formato de fecha */
  dateFormat: DateFormat;
  /** Mostrar barra de búsqueda */
  showSearch: boolean;
  /** Placeholder de búsqueda */
  searchPlaceholder: string;
  /** Mostrar toggle de tema */
  showThemeToggle: boolean;
  /** Mostrar notificaciones */
  showNotifications: boolean;
  /** Mostrar perfil de usuario */
  showUserProfile: boolean;
  /** Altura del header */
  height: string;
  /** Sticky (fijo al hacer scroll) */
  sticky: boolean;
  /** Con sombra */
  withShadow: boolean;
  /** Color de fondo */
  bgColor: 'white' | 'transparent' | 'blur';
}

/**
 * Configuración por defecto del HeaderV2
 */
export const DEFAULT_HEADER_CONFIG: HeaderV2Config = {
  showTitle: true,
  showDate: true,
  dateFormat: 'long',
  showSearch: true,
  searchPlaceholder: 'Buscar estudiantes, salones...',
  showThemeToggle: false, // Deshabilitado por defecto
  showNotifications: true,
  showUserProfile: true,
  height: '64px',
  sticky: true,
  withShadow: false,
  bgColor: 'white',
};

// ============================================
// Utilidades
// ============================================

/**
 * Obtiene las iniciales de un nombre
 * @param name - Nombre completo
 * @param maxChars - Máximo de caracteres (default: 2)
 * @returns Iniciales en mayúscula
 * @example getInitials("Juan Pérez") // "JP"
 * @example getInitials("María") // "MA"
 */
export const getInitials = (name: string, maxChars: number = 2): string => {
  if (!name || typeof name !== 'string') return '?';

  const sanitized = name.trim();
  if (sanitized.length === 0) return '?';

  const words = sanitized.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, maxChars).toUpperCase();
  }

  return words
    .slice(0, maxChars)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
};

/**
 * Formatea una fecha según el formato especificado
 * @param date - Fecha a formatear
 * @param format - Formato deseado
 * @param locale - Locale (default: 'es-CO')
 * @returns Fecha formateada
 */
export const formatHeaderDate = (
  date: Date = new Date(),
  format: DateFormat = 'long',
  locale: string = 'es-CO'
): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const optionsMap = {
    short: { day: 'numeric', month: 'short' } as const,
    medium: { weekday: 'short', day: 'numeric', month: 'short' } as const,
    long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } as const,
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } as const,
  };
  const options: Intl.DateTimeFormatOptions = optionsMap[format];

  try {
    const formatted = date.toLocaleDateString(locale, options);
    // Capitalizar primera letra
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return date.toLocaleDateString();
  }
};

/**
 * Calcula el tiempo relativo (hace X minutos, etc.)
 * @param date - Fecha a comparar
 * @returns Texto relativo
 */
export const getRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;

  if (!(then instanceof Date) || isNaN(then.getTime())) {
    return '';
  }

  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return then.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

/**
 * Cuenta notificaciones no leídas
 * @param notifications - Lista de notificaciones
 * @returns Número de no leídas
 */
export const countUnreadNotifications = (notifications: NotificationItem[]): number => {
  if (!Array.isArray(notifications)) return 0;
  return notifications.filter((n) => !n.isRead).length;
};
