import './UserForm.css';
import { useUserForm } from './useUserForm';
import { FormField } from '../../../shared/utils/FormField';

interface Option {
  value: string;
  label: string;
}

const roleOptions: Option[] = [
  { value: '', label: 'Seleccione un rol' },
  { value: 'Administrativo', label: 'Administrativo' },
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
    filterPreschool,
    togglePreschoolFilter,
    setShowPassword,
    handleInputChange,
    handleCheckboxChange,
    handleSubmit,
    handleLogout,
    handleBlur
  } = useUserForm();

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-header">
          <h2>Crear Nuevo Usuario</h2>
          <p>Diligencie el formulario de registro</p>
        </div>

        <FormField
          type="email"
          name="email"
          value={form.email}
          placeholder="Correo Electrónico"
          error={errors.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />

        <div className="form-group password-field">
          <div className="input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              placeholder="Contraseña"
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="form-control"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
          
          <div className="password-requirements">
            <p className={passwordRequirements.hasLength ? 'valid' : ''}>
              • Mínimo 8 caracteres
            </p>
            <p className={passwordRequirements.hasUppercase ? 'valid' : ''}>
              • Al menos una mayúscula
            </p>
            <p className={passwordRequirements.hasNumber ? 'valid' : ''}>
              • Al menos un número
            </p>
            <p className={passwordRequirements.hasSpecialChar ? 'valid' : ''}>
              • Al menos un carácter especial
            </p>
          </div>
        </div>

        <div className="form-group password-field">
          <div className="input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              placeholder="Confirmar Contraseña"
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="form-control"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <FormField
          type="select"
          name="role"
          value={form.role}
          options={roleOptions}
          error={errors.role}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />

        {form.role === 'Docente' && (
          <div className="form-section">
            <div className="filter-container">
              <h3>Asignaturas:</h3>
              <label className="filter-toggle">
                <input
                  type="checkbox"
                  checked={filterPreschool}
                  onChange={togglePreschoolFilter}
                />
                <span>Mostrar solo asignaturas de Preescolar</span>
              </label>
            </div>
            
            <div className="checkbox-grid">
              {areas.map(area => (
                <label 
                  key={area.id} 
                  className={`checkbox-item ${area.nivel.toLowerCase().includes('preescolar') ? 'preschool' : ''}`}
                >
                  <input
                    type="checkbox"
                    name={area.id}
                    checked={form.areas[area.id] || false}
                    onChange={handleCheckboxChange('areas')}
                  />
                  <span>{`${area.orden} - ${area.asignatura} - ${area.nivel}`}</span>
                </label>
              ))}
            </div>
            {errors.areas && <span className="error-message">{errors.areas}</span>}
          </div>
        )}

        <div className="form-section">
          <h3>Salones de Clase:</h3>
          <div className="checkbox-grid">
            {classRooms.map(salon => (
              <label key={salon.id} className="checkbox-item">
                <input
                  type="checkbox"
                  name={salon.id}
                  checked={form.salones[salon.id] || false}
                  onChange={handleCheckboxChange('salones')}
                />
                <span>{salon.nombreSalon}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Creando...' : 'Registrar Usuario'}
        </button>
      </form>

      <button onClick={handleLogout} className="logout-button">
        Cerrar Sesión
      </button>
    </div>
  );
};

export default CreateUserForm;