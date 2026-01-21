import { useState, useEffect } from 'react';
import { fetchDocentes } from '../../../infrastructure/user.service';
import { DocenteOption, DirectorSelectorProps } from '../../../shared/types/classRoomTypes';

/**
 * Selector de director de grupo.
 * Carga la lista de docentes desde Firestore y permite seleccionar uno.
 */
const DirectorSelector = ({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}: DirectorSelectorProps) => {
  const [docentes, setDocentes] = useState<DocenteOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocentes = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchDocentes();
        setDocentes(data);
      } catch (err) {
        console.error('Error loading docentes:', err);
        setLoadError('Error al cargar docentes');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocentes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  // Obtener el texto a mostrar para un docente
  const getDocenteLabel = (docente: DocenteOption): string => {
    if (docente.displayName) {
      return `${docente.displayName} (${docente.email})`;
    }
    return docente.email;
  };

  // Clases base del select
  const selectClasses = [
    'w-full px-3 py-2 rounded-lg border transition-colors',
    'bg-white text-gray-900',
    'focus:outline-none focus:ring-2 focus:ring-deepBlue focus:border-transparent',
    disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
    error && 'border-red-500 focus:ring-red-500',
    !error && 'border-gray-300 hover:border-gray-400'
  ].filter(Boolean).join(' ');

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <svg className="animate-spin h-4 w-4 text-deepBlue" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-gray-500 text-sm">Cargando docentes...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700 text-sm">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {loadError}
        </div>
      </div>
    );
  }

  if (docentes.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          No hay docentes registrados
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <select
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={selectClasses}
        aria-label="Seleccionar director de grupo"
        aria-invalid={!!error}
      >
        <option value="">Seleccione un director de grupo</option>
        {docentes.map((docente) => (
          <option key={docente.id} value={docente.id}>
            {getDocenteLabel(docente)}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DirectorSelector;
