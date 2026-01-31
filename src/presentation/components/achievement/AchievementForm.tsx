import { useAchievementForm } from './useAchievementForm';
import { useParams } from 'react-router-dom';
import { IconLoader2, IconTargetArrow, IconRefresh } from '@tabler/icons-react';

const AchievementForm = () => {
  const { form, error, handleChange, handleSubmit, isSubmitting, loading, docId, previousYearLogros, copyFromPreviousYear } = useAchievementForm();
  const { periodId } = useParams<{ periodId: string }>();

  const calculateProgress = (text: string) => {
    const length = text.length;
    return Math.min((length / 200) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-400';
    if (progress < 70) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <IconLoader2 size={32} className="text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-gray-600">Cargando configuración de logros...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <IconTargetArrow size={18} className="text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {docId ? 'Editar Logros' : 'Nuevos Logros'}
          </span>
        </div>
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
          Periodo {periodId}
        </span>
      </div>

      {/* Copiar logros del año anterior */}
      {previousYearLogros && !form.logro1 && !form.logro2 && !form.logro3 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-amber-700">
            Hay logros del año anterior disponibles
          </span>
          <button
            type="button"
            onClick={copyFromPreviousYear}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <IconRefresh size={14} />
            Copiar logros
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {[1, 2, 3].map((num) => {
          const fieldName = `logro${num}` as keyof typeof form;
          const progress = calculateProgress(form[fieldName]);
          const hasError = error[fieldName];

          return (
            <div key={num} className="space-y-2">
              {/* Label y progress */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Logro Académico {num}
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getProgressColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 tabular-nums w-12 text-right">
                    {form[fieldName].length}/200
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                name={fieldName}
                value={form[fieldName]}
                onChange={handleChange}
                placeholder={`Describe el logro académico ${num}...`}
                rows={2}
                maxLength={200}
                className={`
                  w-full px-3 py-2.5 text-sm text-gray-700
                  bg-gray-50 border rounded-lg
                  placeholder:text-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:bg-white
                  resize-none
                  ${hasError
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                  }
                `}
              />

              {/* Error message */}
              {hasError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                  {error[fieldName]}
                </p>
              )}
            </div>
          );
        })}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full py-2.5 px-4
            text-sm font-semibold text-white
            bg-gradient-to-r from-blue-500 to-indigo-600
            rounded-lg shadow-sm
            transition-all duration-200
            hover:from-blue-600 hover:to-indigo-700 hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-blue-300
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-sm
            flex items-center justify-center gap-2
          `}
        >
          {isSubmitting && <IconLoader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Guardando...' : docId ? 'Actualizar Logros' : 'Guardar Logros'}
        </button>
      </form>
    </div>
  );
};

export default AchievementForm;