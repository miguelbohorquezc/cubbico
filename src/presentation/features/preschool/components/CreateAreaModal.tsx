import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../../infrastructure/firebase/firebase';
import { Card, Badge } from '../../../components/ui';
import { BookOpenIcon, XIcon, SaveIcon, AlertCircleIcon } from '../../../components/icons';

interface CreateAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  areasExistentes?: string[];
}

const CreateAreaModal = ({ isOpen, onClose, onSuccess, areasExistentes = [] }: CreateAreaModalProps) => {
  const [asignatura, setAsignatura] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const validateForm = (): boolean => {
    if (!asignatura.trim()) {
      setError('El nombre de la asignatura es requerido');
      return false;
    }
    const yaExiste = areasExistentes.some(
      nombre => nombre.trim().toLowerCase() === asignatura.trim().toLowerCase()
    );
    if (yaExiste) {
      setError(`Ya existe una asignatura llamada "${asignatura.trim()}". No se permiten duplicados.`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const newArea = {
        asignatura: asignatura.trim(),
        nivel: 'preescolar',
        ihs: 0,
        orden: 999,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'areas'), newArea);

      // Reset form
      setAsignatura('');
      setError('');

      onSuccess();
      onClose();
    } catch (error) {
      setError('Error al crear la asignatura. Por favor, intenta nuevamente.');
      console.error('Error creating area:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setAsignatura('');
    setError('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !saving) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay con blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-fadeIn"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto animate-fadeInScale">
          <Card elevation="lg" className="shadow-2xl">
            <Card.Header
              icon={<BookOpenIcon />}
              action={
                <button
                  onClick={handleClose}
                  className="p-1.5 text-light-gray-400 hover:text-error-600 hover:bg-red-50 rounded-md transition-colors"
                  disabled={saving}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              }
            >
              Crear Nueva Asignatura
            </Card.Header>

            <Card.Body className="space-y-5">
              {/* Descripción */}
              <p className="text-sm text-light-gray-600">
                Crea una nueva asignatura para asociar a los propósitos de aprendizaje. Luego podrás configurar sus indicadores de desempeño.
              </p>

              {/* Nombre de la asignatura */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-deep-blue-800 mb-2">
                  <BookOpenIcon className="w-4 h-4" />
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  value={asignatura}
                  onChange={(e) => setAsignatura(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ej: Dimensión Corporal, Dimensión Cognitiva..."
                  className="w-full px-4 py-3 border border-light-gray-300 rounded-lg text-sm focus:outline-none focus:border-deep-blue-500 focus:ring-2 focus:ring-deep-blue-200 transition-all"
                  disabled={saving}
                  autoFocus
                />
                <p className="text-xs text-light-gray-500 mt-1.5">
                  El nombre debe ser descriptivo y único
                </p>
              </div>

              {/* Badge informativo */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpenIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <Badge variant="info" size="sm" className="mb-1.5">
                    Nivel: Preescolar
                  </Badge>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Esta asignatura estará disponible para asociar a propósitos y configurar indicadores de evaluación.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <AlertCircleIcon className="w-4 h-4 text-error-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error-700">{error}</p>
                  </div>
                </div>
              )}
            </Card.Body>

            <Card.Footer>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-light-gray-700 bg-white border border-light-gray-300 rounded-lg hover:bg-light-gray-50 transition-all"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-deep-blue-600 rounded-lg hover:bg-deep-blue-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving || !asignatura.trim()}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-4 h-4" />
                      Crear Asignatura
                    </>
                  )}
                </button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreateAreaModal;
