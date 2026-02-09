import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { SearchIcon, XIcon } from '../icons';

/**
 * Props for the SearchInput component
 */
export interface SearchInputProps {
  /**
   * Current search value
   */
  value: string;

  /**
   * Callback when search value changes
   */
  onChange: (value: string) => void;

  /**
   * Callback when clear button is clicked
   */
  onClear?: () => void;

  /**
   * Placeholder text
   * @default "Buscar..."
   */
  placeholder?: string;

  /**
   * Debounce delay in milliseconds
   * Set to 0 to disable debounce
   * @default 300
   */
  debounceMs?: number;

  /**
   * Optional result count to display
   */
  resultCount?: number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * SearchInput Component
 *
 * A specialized search input with debounce functionality, clear button,
 * and optional result counter. Optimized for search/filter use cases.
 *
 * @example
 * ```tsx
 * // Basic search input
 * <SearchInput
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   placeholder="Buscar estudiantes..."
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Search input with debounce and result count
 * <SearchInput
 *   value={query}
 *   onChange={handleSearch}
 *   onClear={handleClear}
 *   debounceMs={500}
 *   resultCount={filteredItems.length}
 *   placeholder="Buscar indicadores..."
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Small search input without debounce
 * <SearchInput
 *   value={filter}
 *   onChange={setFilter}
 *   size="sm"
 *   debounceMs={0}
 * />
 * ```
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  debounceMs = 300,
  resultCount,
  className = '',
  disabled = false,
  size = 'md',
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal value with prop value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Handle input change with debounce
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer or call immediately if debounce is disabled
    if (debounceMs > 0) {
      debounceTimer.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    } else {
      onChange(newValue);
    }
  };

  // Handle clear button
  const handleClear = () => {
    setInternalValue('');
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Container classes
  const containerClasses = `
    flex
    items-center
    gap-2
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Input wrapper classes
  const wrapperClasses = `
    relative
    flex
    items-center
    flex-1
  `.replace(/\s+/g, ' ').trim();

  // Input classes
  const inputClasses = `
    ${sizeClasses[size]}
    w-full
    pl-10
    pr-10
    py-2
    bg-white
    border
    border-light-gray-300
    rounded-lg
    text-light-gray-900
    placeholder-light-gray-500
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-deep-blue-300
    focus:border-deep-blue-500
    disabled:bg-light-gray-100
    disabled:cursor-not-allowed
    disabled:text-light-gray-500
  `.replace(/\s+/g, ' ').trim();

  // Icon button base classes
  const iconButtonClasses = `
    absolute
    p-1
    text-light-gray-400
    hover:text-light-gray-600
    focus:outline-none
    focus:text-deep-blue-600
    transition-colors
    duration-150
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={containerClasses}>
      {/* Input Wrapper */}
      <div className={wrapperClasses}>
        {/* Search Icon */}
        <div className={`absolute left-3 ${iconButtonClasses}`}>
          <SearchIcon className={iconSizeClasses[size]} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          aria-label="Buscar"
        />

        {/* Clear Button */}
        {internalValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-3 ${iconButtonClasses}`}
            aria-label="Limpiar búsqueda"
          >
            <XIcon className={iconSizeClasses[size]} />
          </button>
        )}
      </div>

      {/* Result Count */}
      {resultCount !== undefined && (
        <span className="text-sm text-light-gray-600 whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
        </span>
      )}
    </div>
  );
};

// PropTypes for runtime validation
SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number,
  resultCount: PropTypes.number,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default SearchInput;
