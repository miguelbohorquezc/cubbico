//@ts-ignore
import React from 'react';
import { useAreaForm } from './useAreaForm';
import { TEXT_FIELDS, SELECT_FIELDS } from './formConfig';
import './AreaForm.css'; 
import { AreaFormState, AreaServiceData } from '../../../shared/types/areaTypes';

interface AreaFormProps {
  initialData?: AreaFormState;
  onSubmit?: (formData: AreaServiceData) => Promise<boolean> | void;
}

const AreaForm = ({ initialData, onSubmit }: AreaFormProps) => {
  const { form, error, handleChange, handleBlur, handleSubmit, isSubmitting } = useAreaForm({ initialData, onSubmit });

  return (
    <div className="form-container">
      <h2 className="form-title">
        {initialData?.id ? 'Editar Área' : 'Nueva Área'}
      </h2>
      <form onSubmit={handleSubmit} className="area-form">
        <div className="form-grid">
          {/* Campos de texto */}
          {TEXT_FIELDS.map((field) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name} className="input-label">
                {field.placeholder}
              </label>
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${error[field.name] ? 'input-error' : ''}`}
                placeholder={field.placeholder}
              />
              {error[field.name] && <span className="error-message">{error[field.name]}</span>}
            </div>
          ))}

          {/* Campos de selección */}
          {SELECT_FIELDS.map((field) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name} className="input-label">
                {field.options[0].label} {/* Usa el placeholder de la primera opción */}
              </label>
              <select
                id={field.name}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-select ${error[field.name] ? 'input-error' : ''}`}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {error[field.name] && <span className="error-message">{error[field.name]}</span>}
            </div>
          ))}
        </div>

        <div className="form-actions">
        <button
            type="submit"
            disabled={isSubmitting}
            className={`submit-button ${isSubmitting ? 'button-disabled' : ''}`}
          >
            {isSubmitting 
              ? (initialData?.id ? 'Actualizando...' : 'Guardando...') 
              : (initialData?.id ? 'Actualizar Área' : 'Guardar Área')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AreaForm;