/**
 * @fileoverview Componente SearchBar para el HeaderV2
 * @module presentation/components/headerV2/SearchBar
 *
 * Barra de búsqueda moderna con:
 * - Icono de búsqueda
 * - Input con placeholder
 * - Botón de limpiar
 * - Estados hover/focus
 * - Responsive
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import type { SearchBarProps } from '../../../shared/types/layoutTypes';

// ============================================
// Constantes
// ============================================

const SIZE_CLASSES = {
  sm: {
    container: 'h-9',
    input: 'text-sm pl-9 pr-8',
    iconLeft: 'left-2.5 w-4 h-4',
    iconRight: 'right-2 w-4 h-4',
  },
  md: {
    container: 'h-10',
    input: 'text-sm pl-10 pr-9',
    iconLeft: 'left-3 w-5 h-5',
    iconRight: 'right-2.5 w-5 h-5',
  },
  lg: {
    container: 'h-12',
    input: 'text-base pl-12 pr-10',
    iconLeft: 'left-3.5 w-5 h-5',
    iconRight: 'right-3 w-5 h-5',
  },
};

// ============================================
// Componente
// ============================================

/**
 * SearchBar - Barra de búsqueda del header
 *
 * @param props - Props del componente
 * @returns Componente React
 *
 * @example
 * ```tsx
 * <SearchBar
 *   placeholder="Buscar estudiantes..."
 *   onSubmit={(query) => console.log(query)}
 * />
 * ```
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar...',
  value: controlledValue,
  onChange,
  onSubmit,
  onClear,
  isLoading = false,
  className = '',
  size = 'md',
}) => {
  // Estado interno para modo no controlado
  const [internalValue, setInternalValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Determinar si es controlado o no
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Clases según tamaño
  const sizeClasses = SIZE_CLASSES[size];

  /**
   * Maneja el cambio del input
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (!isControlled) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) {
        onSubmit?.(value.trim());
      }
    },
    [value, onSubmit]
  );

  /**
   * Limpia el input
   */
  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }

    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  }, [isControlled, onChange, onClear]);

  /**
   * Maneja teclas especiales
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' && value) {
        handleClear();
      }
    },
    [value, handleClear]
  );

  // Sincronizar valor controlado
  useEffect(() => {
    if (isControlled && controlledValue !== internalValue) {
      setInternalValue(controlledValue);
    }
  }, [isControlled, controlledValue, internalValue]);

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center ${className}`}
      role="search"
    >
      {/* Contenedor del input */}
      <div className={`relative w-full ${sizeClasses.container}`}>
        {/* Icono de búsqueda */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2
            ${sizeClasses.iconLeft}
            text-gray-400
            pointer-events-none
            transition-colors duration-200
          `}
        >
          {isLoading ? (
            <svg
              className="animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <IconSearch className="w-full h-full" stroke={1.5} />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          aria-label={placeholder}
          className={`
            w-full h-full
            ${sizeClasses.input}
            bg-gray-50
            border border-gray-200
            rounded-xl
            text-gray-900
            placeholder:text-gray-400
            transition-all duration-200
            outline-none
            focus:bg-white
            focus:border-amber-400
            focus:ring-2
            focus:ring-amber-100
            hover:border-gray-300
            hover:bg-gray-100
            disabled:opacity-50
            disabled:cursor-not-allowed
          `}
        />

        {/* Botón de limpiar */}
        {value && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className={`
              absolute top-1/2 -translate-y-1/2
              ${sizeClasses.iconRight}
              p-0.5
              text-gray-400
              hover:text-gray-600
              rounded-full
              hover:bg-gray-200
              transition-all duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-amber-300
            `}
            aria-label="Limpiar búsqueda"
          >
            <IconX className="w-full h-full" stroke={2} />
          </button>
        )}
      </div>
    </form>
  );
};

// ============================================
// Exports
// ============================================

export default SearchBar;
