import { useState, useEffect } from 'react';
import { IconLoader2, IconAlertCircle, IconUserOff, IconUser } from '@tabler/icons-react';
import { fetchAllUsers } from '../../../infrastructure/user.service';
import { DocenteOption, DirectorSelectorProps } from '../../../shared/types/classRoomTypes';

/**
 * Selector de director de grupo.
 * Carga la lista de todos los usuarios desde Firestore y permite seleccionar uno.
 */
const DirectorSelector = ({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}: DirectorSelectorProps) => {
  const [usuarios, setUsuarios] = useState<DocenteOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchAllUsers();
        setUsuarios(data);
      } catch (err) {
        console.error('Error loading usuarios:', err);
        setLoadError('Error al cargar usuarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsuarios();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  // Obtener el texto a mostrar para un usuario
  const getUsuarioLabel = (usuario: DocenteOption): string => {
    const name = usuario.displayName || usuario.email.split('@')[0];
    return `${name} - ${usuario.role}`;
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
          <IconLoader2 size={16} className="animate-spin text-tosca-600" />
          <span className="text-gray-500 text-sm">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 px-3 py-2.5 border border-red-200 rounded-lg bg-red-50 text-red-700 text-sm">
          <IconAlertCircle size={16} />
          {loadError}
        </div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 px-3 py-2.5 border border-amber-200 rounded-lg bg-amber-50 text-amber-700 text-sm">
          <IconUserOff size={16} />
          No hay usuarios registrados
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative">
        <IconUser
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <select
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            w-full pl-9 pr-4 py-2.5
            text-sm text-gray-700
            bg-white border rounded-lg
            cursor-pointer
            transition-all duration-200
            appearance-none
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
            ${error
              ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
              : 'border-gray-200 hover:border-gray-300 focus:ring-tosca/30 focus:border-tosca-400'
            }
            focus:outline-none focus:ring-2
          `}
          aria-label="Seleccionar director de grupo"
          aria-invalid={!!error}
        >
          <option value="">Seleccione un director de grupo</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {getUsuarioLabel(usuario)}
            </option>
          ))}
        </select>
        {/* Flecha del select */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <IconAlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default DirectorSelector;
