import './UserForm.css';
import { useUserForm } from './useUserForm';
import { FormField } from '../../../shared/utils/FormField';
import { Option } from '../../../shared/types/studentTypes';


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
    handleInputChange,
    handleCheckboxChange,
    handleSubmit,
    handleLogout,
    handleBlur
  } = useUserForm();

  return (
    <div className="form-container animate-fade-in">
      <form onSubmit={handleSubmit} className="user-form animate-slide-up">
        <div className="form-header">
          <h2>Crear Nuevo Usuario</h2>
          <p>Diligencie el formulario de registro</p>
        </div>

        {/* Campo de Email */}
        <FormField
          type="text"
          name="email"
          value={form.email}
          placeholder="Correo Electrónico"
          error={errors.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />

        {/* Campo de Contraseña */}
        <FormField
          type="password"
          name="password"
          value={form.password}
          placeholder="Contraseña"
          onChange={handleInputChange}
          onBlur={handleBlur}
        />

        {/* Selector de Rol */}
        <FormField
          type="select"
          name="role"
          value={form.role}
          options={roleOptions}
          error={errors.role}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />

        {/* Sección de áreas para docentes */}
        {form.role === 'Docente' && (
          <div className="form-section animate-expand">
            <h3>Asignaturas:</h3>
            <div className="checkbox-grid">
              {areas.map(area => (
                <label key={area.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    name={area.id}
                    checked={form.areas[area.id] || false}
                    onChange={handleCheckboxChange('areas')}
                  />
                  {`${area.orden} - ${area.asignatura}`}
                </label>
              ))}
            </div>
            {errors.areas && <span className="error-message">{errors.areas}</span>}
          </div>
        )}

        {/* Sección de salones */}
        <div className="form-section animate-expand">
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
                {salon.nombreSalon}
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