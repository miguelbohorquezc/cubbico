/**
 * @fileoverview Componente HeaderV2 para el Dashboard
 * @module presentation/components/headerV2/HeaderV2
 *
 * Header completo del Dashboard que integra:
 * - Título de página + fecha
 * - Barra de búsqueda central
 * - Acciones rápidas (notificaciones)
 * - Perfil de usuario con dropdown
 *
 * Diseñado para coexistir con SidebarV2, ajustándose
 * automáticamente según el estado colapsado/expandido.
 *
 * Inspirado en el diseño Academix (ui/ui.webp)
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IconBell, IconCalendar } from '@tabler/icons-react';
import { SearchBar } from './SearchBar';
import { UserProfile } from './UserProfile';
import { formatHeaderDate } from '../../../shared/types/headerTypes';
import type { HeaderV2Props } from '../../../shared/types/layoutTypes';

// ============================================
// Constantes
// ============================================

const SIDEBAR_WIDTH_EXPANDED = '280px';
const SIDEBAR_WIDTH_COLLAPSED = '64px';

// ============================================
// Subcomponentes
// ============================================

/**
 * Componente de fecha
 */
interface DateDisplayProps {
  date?: Date;
  className?: string;
}

const DateDisplay: React.FC<DateDisplayProps> = ({
  date = new Date(),
  className = '',
}) => {
  const formattedDate = useMemo(() => formatHeaderDate(date, 'long'), [date]);

  return (
    <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
      <IconCalendar size={16} stroke={1.5} className="text-gray-400" />
      <span className="text-sm">{formattedDate}</span>
    </div>
  );
};

/**
 * Botón de notificaciones
 */
interface NotificationButtonProps {
  count?: number;
  onClick?: () => void;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  count = 0,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        relative
        p-2
        rounded-xl
        text-gray-500
        hover:text-gray-700
        hover:bg-gray-100
        transition-all duration-200
        focus:outline-none
        focus:ring-2 focus:ring-amber-200
      "
      aria-label={`Notificaciones${count > 0 ? ` (${count} nuevas)` : ''}`}
    >
      <IconBell size={22} stroke={1.5} />

      {/* Badge de notificaciones */}
      {count > 0 && (
        <span
          className="
            absolute -top-0.5 -right-0.5
            min-w-[18px] h-[18px]
            flex items-center justify-center
            px-1
            text-[10px] font-bold
            text-white
            bg-red-500
            rounded-full
            border-2 border-white
          "
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

// ============================================
// Componente Principal
// ============================================

/**
 * HeaderV2 - Header completo del Dashboard
 *
 * @param props - Props del componente
 * @returns Componente React
 *
 * @example
 * ```tsx
 * <HeaderV2
 *   title="Dashboard"
 *   showDate
 *   showSearch
 *   isSidebarCollapsed={false}
 * />
 * ```
 */
export const HeaderV2: React.FC<HeaderV2Props> = ({
  title = 'Dashboard',
  subtitle,
  showDate = true,
  showSearch = true,
  searchPlaceholder = 'Buscar estudiantes, salones...',
  onSearch,
  isSidebarCollapsed = false,
  className = '',
}) => {
  const navigate = useNavigate();

  // Obtener datos del usuario desde Redux
  // @ts-ignore - El tipo del state no está definido completamente
  const userEmail = useSelector((state) => state.user?.email || '');
  // @ts-ignore
  const userRole = useSelector((state) => state.user?.role || 'Usuario');

  // Calcular el margin-left según el estado del sidebar
  const sidebarWidth = isSidebarCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;

  // Datos del usuario para el perfil
  const userData = useMemo(
    () => ({
      displayName: userEmail ? userEmail.split('@')[0] : 'Usuario',
      email: userEmail,
      role: userRole,
    }),
    [userEmail, userRole]
  );

  /**
   * Handler de búsqueda
   */
  const handleSearch = (query: string) => {
    console.log('Búsqueda:', query);
    onSearch?.(query);
    // TODO: Implementar navegación a resultados de búsqueda
  };

  /**
   * Handler de logout
   */
  const handleLogout = () => {
    // El logout se maneja desde el SidebarActions
    // Aquí podríamos agregar lógica adicional si es necesario
    navigate('/login');
  };

  /**
   * Handler de configuración
   */
  const handleSettings = () => {
    navigate('/private/dashboard/user');
  };

  /**
   * Handler de notificaciones
   */
  const handleNotifications = () => {
    // TODO: Implementar panel de notificaciones
    console.log('Abrir notificaciones');
  };

  return (
    <header
      className={`
        fixed top-0 right-0
        h-16
        bg-white
        border-b border-gray-100
        z-40
        transition-all duration-300 ease-in-out
        ${className}
      `}
      style={{
        left: sidebarWidth,
      }}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Sección izquierda: Título y fecha */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
            {subtitle && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500 truncate">{subtitle}</span>
              </>
            )}
          </div>
          {showDate && <DateDisplay className="mt-0.5 hidden sm:flex" />}
        </div>

        {/* Sección central: Búsqueda */}
        {showSearch && (
          <div className="flex-1 max-w-md hidden md:block">
            <SearchBar
              placeholder={searchPlaceholder}
              onSubmit={handleSearch}
              size="md"
            />
          </div>
        )}

        {/* Sección derecha: Acciones y perfil */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Botón de búsqueda móvil */}
          {showSearch && (
            <button
              type="button"
              className="
                md:hidden
                p-2
                rounded-xl
                text-gray-500
                hover:text-gray-700
                hover:bg-gray-100
                transition-all duration-200
              "
              aria-label="Buscar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          )}

          {/* Notificaciones */}
          <NotificationButton count={3} onClick={handleNotifications} />

          {/* Separador */}
          <div className="hidden lg:block w-px h-8 bg-gray-200" />

          {/* Perfil de usuario */}
          <UserProfile
            user={userData}
            showRole
            avatarSize="md"
            onLogout={handleLogout}
            onSettings={handleSettings}
          />
        </div>
      </div>
    </header>
  );
};

// ============================================
// Exports
// ============================================

export default HeaderV2;
