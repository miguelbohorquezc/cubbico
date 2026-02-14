import { useUserForm } from './useUserForm';

interface Option {
  value: string;
  label: string;
}

const roleOptions: Option[] = [
  { value: 'Docente', label: 'Docente' },
  { value: 'Coordinador', label: 'Coordinador' }
];

const CreateUserForm = () => {
  const {
    form,
    errors,
    loading,
    areas,
    classRooms,
    showPassword,
    passwordRequirements,
    selectedLevels,
    setShowPassword,
    handleInputChange,
    handleCheckboxChange,
    handleWillTeachChange,
    handleSubmit,
    handleBlur,
    toggleNivelEducativo
  } = useUserForm();

  const showTeachingAssignments = form.role === 'Docente' ||
    (form.role === 'Coordinador' && form.willTeach);

  const inputBaseClasses = `
    w-full px-4 py-3 rounded-lg border-2
    text-gray-900 placeholder-gray-400
    transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:bg-gray-100
  `;

  const inputNormalClasses = `${inputBaseClasses} border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500/20`;
  const inputErrorClasses = `${inputBaseClasses} border-red-500 bg-red-50/10 focus:border-red-500 focus:ring-red-500/20`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            placeholder="Nombre"
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={loading}
            className={errors.firstName ? inputErrorClasses : inputNormalClasses}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido *
          </label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            placeholder="Apellido"
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={loading}
            className={errors.lastName ? inputErrorClasses : inputNormalClasses}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo electronico *
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          placeholder="correo@ejemplo.com"
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={loading}
          className={errors.email ? inputErrorClasses : inputNormalClasses}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Contraseña */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Contrasena *
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={form.password}
          placeholder="••••••••"
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={loading}
          className={errors.password ? inputErrorClasses : inputNormalClasses}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}

        {/* Requisitos de contraseña */}
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
          <p className={passwordRequirements.hasLength ? 'text-green-600' : 'text-gray-500'}>
            {passwordRequirements.hasLength ? '✓' : '○'} Minimo 8 caracteres
          </p>
          <p className={passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
            {passwordRequirements.hasUppercase ? '✓' : '○'} Al menos una mayuscula
          </p>
          <p className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}>
            {passwordRequirements.hasNumber ? '✓' : '○'} Al menos un numero
          </p>
          <p className={passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}>
            {passwordRequirements.hasSpecialChar ? '✓' : '○'} Al menos un caracter especial
          </p>
        </div>
      </div>

      {/* Confirmar Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar contrasena *
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={form.confirmPassword}
          placeholder="••••••••"
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={loading}
          className={errors.confirmPassword ? inputErrorClasses : inputNormalClasses}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Rol */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rol *
        </label>
        <select
          name="role"
          value={form.role}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={loading}
          className={errors.role ? inputErrorClasses : inputNormalClasses}
        >
          {roleOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role}</p>
        )}
      </div>

      {/* Checkbox "¿Dará clases?" para Coordinador */}
      {form.role === 'Coordinador' && (
        <div className="p-4 bg-magenta-50 border border-purple-200 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.willTeach}
              onChange={handleWillTeachChange}
              disabled={loading}
              className="w-5 h-5 rounded border-gray-300 text-magenta-600 focus:ring-purple-500"
            />
            <span className="font-medium text-magenta-900">¿Dara clases?</span>
          </label>
          <p className="mt-1 text-sm text-magenta-700 ml-8">
            Marque esta opcion si el coordinador tambien impartira clases
          </p>
        </div>
      )}

      {/* Asignaciones de enseñanza */}
      {showTeachingAssignments && (
        <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {/* Nota para Coordinadores */}
          {form.role === 'Coordinador' && form.willTeach && (
            <div className="p-3 bg-magenta-50 border border-purple-200 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-magenta-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-magenta-900 text-sm">Acceso automático para Coordinadores</p>
                  <p className="mt-1 text-xs text-magenta-700">
                    Al seleccionar niveles, se asignarán automáticamente todas las áreas y salones.
                    Para preescolar solo se asignan salones (las asignaturas son internas).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Niveles Educativos */}
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Niveles Educativos *
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Preescolar', 'Primaria', 'Secundaria'] as const).map(nivel => (
                <button
                  type="button"
                  key={nivel}
                  onClick={() => toggleNivelEducativo(nivel)}
                  disabled={loading}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${selectedLevels.includes(nivel)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                    }
                  `}
                >
                  {nivel}
                  {selectedLevels.includes(nivel) && (
                    <span className="ml-2">✓</span>
                  )}
                </button>
              ))}
            </div>
            {errors.nivelesEducativos && (
              <p className="mt-1 text-sm text-red-600">{errors.nivelesEducativos}</p>
            )}
          </div>

          {/* Asignaturas y Salones */}
          {selectedLevels.length > 0 && (
            <>
              {/* Asignaturas */}
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center justify-between">
                  <span>Asignaturas ({selectedLevels.join(', ')}) *</span>
                  {form.role === 'Coordinador' && form.willTeach && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      Selección automática
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg border border-blue-100">
                  {areas.map(area => {
                    const isCoordinadorAutoSelect = form.role === 'Coordinador' && form.willTeach;
                    return (
                      <label
                        key={area.id}
                        className={`
                          flex items-center gap-2 p-2 rounded transition-colors
                          ${area.nivel.toLowerCase().includes('preescolar')
                            ? 'bg-yellow-50 hover:bg-yellow-100'
                            : 'hover:bg-gray-50'
                          }
                          ${isCoordinadorAutoSelect ? 'opacity-60' : 'cursor-pointer'}
                        `}
                      >
                        <input
                          type="checkbox"
                          name={area.id}
                          checked={form.areas[area.id] || false}
                          onChange={handleCheckboxChange('areas')}
                          disabled={loading || isCoordinadorAutoSelect}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-700">
                          {area.asignatura}
                          <span className="text-xs text-gray-500 ml-1">({area.nivel})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.areas && (
                  <p className="mt-1 text-sm text-red-600">{errors.areas}</p>
                )}
              </div>

              {/* Salones */}
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center justify-between">
                  <span>Salones ({selectedLevels.join(', ')}) *</span>
                  {form.role === 'Coordinador' && form.willTeach && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      Selección automática
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg border border-blue-100">
                  {classRooms.map(salon => {
                    const isCoordinadorAutoSelect = form.role === 'Coordinador' && form.willTeach;
                    return (
                      <label
                        key={salon.id}
                        className={`
                          flex items-center gap-2 p-2 rounded transition-colors
                          hover:bg-gray-50
                          ${isCoordinadorAutoSelect ? 'opacity-60' : 'cursor-pointer'}
                        `}
                      >
                        <input
                          type="checkbox"
                          name={salon.id}
                          checked={form.salones[salon.id] || false}
                          onChange={handleCheckboxChange('salones')}
                          disabled={loading || isCoordinadorAutoSelect}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-700">{salon.nombreSalon}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.salones && (
                  <p className="mt-1 text-sm text-red-600">{errors.salones}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Botón Submit */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full py-3 px-4 rounded-lg font-medium text-white
          bg-gradient-to-r from-blue-600 to-blue-700
          hover:bg-orchid-blue-60
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
          disabled:opacity-70 disabled:cursor-not-allowed
          transition-all duration-200 shadow-md hover:shadow-lg
        "
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            Creando usuario...
          </span>
        ) : (
          'Registrar Usuario'
        )}
      </button>
    </form>
  );
};

export default CreateUserForm;
