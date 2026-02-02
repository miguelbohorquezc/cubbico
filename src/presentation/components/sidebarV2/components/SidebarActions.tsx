/**
 * @fileoverview Componente SidebarActions para sección inferior del sidebar
 * @module presentation/components/sidebarV2/components/SidebarActions
 *
 * Sección inferior del sidebar con:
 * - Settings (configuración/perfil)
 * - Logout (cerrar sesión)
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SettingsIcon, LogoutIcon, CalendarIcon } from '../../icons/SidebarIcons';
import { SidebarTooltip } from './SidebarTooltip';
import { AuthService } from '../../../../infrastructure/firebase/auth.service';
import Modal from '../../modal/Modal';
import PeriodConfigManager from '../../../features/settings/PeriodConfigManager';
import type { AppState } from '../../../../app/store/store';

// ============================================
// Types
// ============================================

export interface SidebarActionsProps {
  /** Indica si el sidebar está colapsado */
  isCollapsed: boolean;
  /** Handler adicional después de logout */
  onLogout?: () => void;
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Componente Principal
// ============================================

/**
 * SidebarActions - Sección inferior del sidebar
 *
 * @param props - Props del componente
 * @returns Componente React
 */
export const SidebarActions: React.FC<SidebarActionsProps> = ({
  isCollapsed,
  onLogout,
  className = '',
}) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPeriodConfigOpen, setIsPeriodConfigOpen] = useState(false);

  // Obtener rol del usuario
  const userRole = useSelector((state: AppState) => {
    const user = state.user as { role?: string } | null;
    return user?.role;
  });
  const isCoordinador = userRole === 'Coordinador';

  // Handler para abrir configuración de períodos
  const handlePeriodConfig = () => {
    setIsPeriodConfigOpen(true);
  };

  // Handler para Settings
  const handleSettings = () => {
    navigate('/private/dashboard/user');
  };

  // Handler para Logout
  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await AuthService.signOut();
      onLogout?.();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
    }
  };

  // Clases base para los botones
  const buttonBaseClasses = `
    group flex items-center
    py-2.5 my-0.5
    rounded-lg
    text-sm font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
  `;

  // Clases para modo colapsado vs expandido
  const collapsedClasses = isCollapsed
    ? 'justify-center w-10 h-10 mx-auto px-0'
    : 'w-full px-3';

  // Componente de botón de acción
  const ActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
    disabled?: boolean;
  }> = ({ icon, label, onClick, variant = 'default', disabled = false }) => {
    const variantClasses = {
      default: `
        text-gray-600
        hover:bg-gray-100 hover:text-gray-900
        focus:ring-gray-500
      `,
      danger: `
        text-gray-600
        hover:bg-red-50 hover:text-red-600
        focus:ring-red-500
      `,
    };

    const button = (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`
          ${buttonBaseClasses}
          ${variantClasses[variant]}
          ${collapsedClasses}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={label}
      >
        {/* Icono */}
        <span
          className={`
            flex-shrink-0 transition-colors duration-200
            ${variant === 'danger' ? 'group-hover:text-red-500' : 'group-hover:text-gray-700'}
            ${isCollapsed ? '' : 'mr-3'}
          `}
        >
          {icon}
        </span>

        {/* Label (oculto en modo colapsado) */}
        {!isCollapsed && (
          <span className="flex-1 text-left">{label}</span>
        )}
      </button>
    );

    // Envolver en tooltip si está colapsado
    if (isCollapsed) {
      return (
        <SidebarTooltip content={label} position="right">
          {button}
        </SidebarTooltip>
      );
    }

    return button;
  };

  return (
    <div className={`mt-auto overflow-hidden ${className}`}>
      {/* Separador */}
      <div className={`my-2 border-t border-gray-200 ${isCollapsed ? 'mx-1' : 'mx-3'}`} />

      {/* Acciones */}
      <div className={`py-2 ${isCollapsed ? 'px-1' : 'px-2'}`}>
        {/* Fechas de Entrega - Solo Coordinador */}
        {isCoordinador && (
          <ActionButton
            icon={<CalendarIcon size={22} />}
            label="Fechas de entrega"
            onClick={handlePeriodConfig}
            variant="default"
          />
        )}

        {/* Settings - Solo Coordinador */}
        {isCoordinador && (
          <ActionButton
            icon={<SettingsIcon size={22} />}
            label="Configuración"
            onClick={handleSettings}
            variant="default"
          />
        )}

        {/* Logout */}
        <ActionButton
          icon={<LogoutIcon size={22} />}
          label={isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
          onClick={handleLogout}
          variant="danger"
          disabled={isLoggingOut}
        />
      </div>

      {/* Modal de configuración de períodos */}
      <Modal
        isOpen={isPeriodConfigOpen}
        onClose={() => setIsPeriodConfigOpen(false)}
        title="Configuración de Fechas de Entrega"
        size="4xl"
      >
        <PeriodConfigManager />
      </Modal>
    </div>
  );
};

// ============================================
// Exports
// ============================================

export default SidebarActions;
