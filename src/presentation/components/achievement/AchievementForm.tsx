import React from 'react';
import { useAchievementForm } from './useAchievementForm';
import './AchievementForm.css';
import { useParams } from 'react-router-dom';

const AchievementForm = () => {
  const { form, error, handleChange, handleSubmit, isSubmitting, loading, docId } = useAchievementForm();
  const { periodId } = useParams<{ periodId: string }>();

  const calculateProgress = (text: string) => {
    const length = text.length;
    return Math.min((length / 200) * 100, 100);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando configuración de logros...</p>
      </div>
    );
  }

  return (
    <div className="achievement-container">
      <div className="form-header">
        <div className="title-badge">{docId ? 'Editar Logros académicos' : 'Nuevos Logros académicos'}</div>
        <div className="period-badge">Periodo {periodId}</div>
      </div>

      <form onSubmit={handleSubmit} className="achievement-form">
        {[1, 2, 3].map((num) => {
          const fieldName = `logro${num}` as keyof typeof form;
          return (
            <div key={num} className="logro-group">
              <label className="logro-label">
                <h3>Logro Académico: {num}</h3>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${calculateProgress(form[fieldName])}%` }}
                    />
                  </div>
                  <div className="character-count">
                    {form[fieldName].length}/200
                  </div>
                </div>
              </label>
              <textarea
                name={fieldName}
                value={form[fieldName]}
                onChange={handleChange}
                placeholder={`Ejemplo de logro ${num}...`}
                rows={2}
                maxLength={200}
                className={`logro-textarea ${error[fieldName] ? 'input-error' : ''}`}
              />
              {error[fieldName] && (
                <div className="error-message">
                  {error[fieldName]}
                </div>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`submit-button ${isSubmitting ? 'button-loading' : ''}`}
        >
          <span className="button-text">
            {isSubmitting ? 'Guardando...' : docId ? 'Actualizar' : 'Guardar'}
          </span>
        </button>
      </form>
    </div>
  );
};

export default AchievementForm;