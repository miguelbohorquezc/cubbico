/**
 * @fileoverview Componente UserProfile para el HeaderV2
 * @module presentation/components/headerV2/UserProfile
 *
 * Perfil de usuario con:
 * - Avatar (imagen o iniciales)
 * - Nombre y rol
 * - Dropdown con opciones
 * - Animaciones suaves
 * - Click outside para cerrar
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  IconChevronDown,
  IconUser,
  IconSettings,
  IconLogout,
} from '@tabler/icons-react';
import type { UserProfileProps } from '../../../shared/types/headerTypes';
import { getInitials } from '../../../shared/types/headerTypes';

// ============================================
// Constantes
// ============================================

const AVATAR_SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const AVATAR_COLORS = [
  'bg-amber-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

// ============================================
// Subcomponentes
// ============================================

/**
 * Avatar del usuario
 */
interface AvatarComponentProps {
  src?: string;
  initials: string;
  size: 'sm' | 'md' | 'lg';
  colorIndex?: number;
}

const Avatar: React.FC<AvatarComponentProps> = ({
  src,
  initials,
  size,
  colorIndex = 0,
}) => {
  const [imageError, setImageError] = useState(false);
  const bgColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt="Avatar"
        onError={() => setImageError(true)}
        className={`
          ${AVATAR_SIZES[size]}
          rounded-full
          object-cover
          border-2 border-white
          shadow-sm
        `}
      />
    );
  }

  return (
    <div
      className={`
        ${AVATAR_SIZES[size]}
        ${bgColor}
        rounded-full
        flex items-center justify-center
        text-white font-semibold
        border-2 border-white
        shadow-sm
      `}
    >
      {initials}
    </div>
  );
};

/**
 * Item del menú dropdown
 */
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onClick,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
    danger: 'text-red-600 hover:bg-red-50 hover:text-red-700',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        flex items-center gap-3
        px-4 py-2.5
        text-sm font-medium
        transition-colors duration-150
        ${variantClasses[variant]}
        focus:outline-none
        focus:bg-gray-50
      `}
    >
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

// ============================================
// Componente Principal
// ============================================

/**
 * UserProfile - Perfil de usuario con dropdown
 *
 * @param props - Props del componente
 * @returns Componente React
 *
 * @example
 * ```tsx
 * <UserProfile
 *   user={{ displayName: "Juan Pérez", email: "juan@email.com", role: "Docente" }}
 *   onLogout={() => console.log('logout')}
 * />
 * ```
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  showRole = true,
  showEmail = false,
  isDropdownOpen: controlledIsOpen,
  onToggleDropdown,
  onLogout,
  onViewProfile,
  onSettings,
  avatarSize = 'md',
  layout = 'horizontal',
  className = '',
}) => {
  // Estado interno para modo no controlado
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determinar si es controlado
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  // Calcular iniciales
  const initials = user.initials || getInitials(user.displayName);

  // Calcular índice de color basado en el email
  const colorIndex = user.email
    ? user.email.charCodeAt(0) + user.email.charCodeAt(user.email.length - 1)
    : 0;

  /**
   * Toggle del dropdown
   */
  const handleToggle = useCallback(() => {
    if (isControlled) {
      onToggleDropdown?.();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  }, [isControlled, onToggleDropdown]);

  /**
   * Cerrar dropdown
   */
  const closeDropdown = useCallback(() => {
    if (isControlled) {
      if (isOpen) onToggleDropdown?.();
    } else {
      setInternalIsOpen(false);
    }
  }, [isControlled, isOpen, onToggleDropdown]);

  /**
   * Actualizar posición del dropdown
   */
  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  /**
   * Click outside para cerrar
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen, closeDropdown, updateDropdownPosition]);

  /**
   * Cerrar con Escape
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeDropdown();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeDropdown]);

  /**
   * Handlers de acciones del menú
   */
  const handleViewProfile = () => {
    onViewProfile?.();
    closeDropdown();
  };

  const handleSettings = () => {
    onSettings?.();
    closeDropdown();
  };

  const handleLogout = () => {
    onLogout?.();
    closeDropdown();
  };

  // Layout classes
  const layoutClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };

  // Dropdown content
  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        right: dropdownPosition.right,
        zIndex: 9999,
      }}
      className="
        w-64
        bg-white
        rounded-xl
        shadow-lg
        border border-gray-100
        overflow-hidden
        animate-in fade-in slide-in-from-top-2
        duration-200
      "
    >
      {/* Header del dropdown */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar
            src={user.avatarUrl}
            initials={initials}
            size="md"
            colorIndex={colorIndex}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Opciones del menú */}
      <div className="py-1">
        {onViewProfile && (
          <MenuItem
            icon={<IconUser size={20} stroke={1.5} />}
            label="Mi Perfil"
            onClick={handleViewProfile}
          />
        )}

        {onSettings && (
          <MenuItem
            icon={<IconSettings size={20} stroke={1.5} />}
            label="Configuración"
            onClick={handleSettings}
          />
        )}

        {(onViewProfile || onSettings) && onLogout && (
          <div className="my-1 border-t border-gray-100" />
        )}

        {onLogout && (
          <MenuItem
            icon={<IconLogout size={20} stroke={1.5} />}
            label="Cerrar Sesión"
            onClick={handleLogout}
            variant="danger"
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Botón del perfil */}
      <div ref={containerRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={handleToggle}
          className={`
            flex items-center gap-3
            ${layoutClasses[layout]}
            px-2 py-1.5
            rounded-xl
            transition-all duration-200
            hover:bg-gray-100
            focus:outline-none
            focus:ring-2 focus:ring-amber-200
            ${isOpen ? 'bg-gray-100' : ''}
          `}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Menú de usuario"
        >
          {/* Avatar */}
          <Avatar
            src={user.avatarUrl}
            initials={initials}
            size={avatarSize}
            colorIndex={colorIndex}
          />

          {/* Info del usuario (solo en layout horizontal y pantallas grandes) */}
          <div className="hidden lg:flex flex-col items-start text-left">
            <span className="text-sm font-semibold text-gray-900 max-w-[120px] truncate">
              {user.displayName}
            </span>
            {showRole && user.role && (
              <span className="text-xs text-gray-500">{user.role}</span>
            )}
            {showEmail && !showRole && (
              <span className="text-xs text-gray-500 max-w-[120px] truncate">
                {user.email}
              </span>
            )}
          </div>

          {/* Chevron */}
          <IconChevronDown
            size={16}
            stroke={2}
            className={`
              hidden lg:block
              text-gray-400
              transition-transform duration-200
              ${isOpen ? 'rotate-180' : ''}
            `}
          />
        </button>
      </div>

      {/* Dropdown (portal) */}
      {typeof document !== 'undefined' &&
        createPortal(dropdownContent, document.body)}
    </>
  );
};

// ============================================
// Exports
// ============================================

export default UserProfile;
