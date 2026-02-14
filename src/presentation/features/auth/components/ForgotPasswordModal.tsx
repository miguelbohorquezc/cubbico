import { useState } from 'react';
import { sendPasswordReset } from '../../../../infrastructure/firebase/auth.service';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Ingrese su correo electronico');
      return;
    }

    if (!validateEmail(email)) {
      setError('Ingrese un correo electronico valido');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperacion');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recuperar Contrasena
        </h2>

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">Correo enviado</p>
              <p className="text-green-700 text-sm mt-1">
                Hemos enviado un enlace de recuperacion a <strong>{email}</strong>.
                Revise su bandeja de entrada y siga las instrucciones.
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              Si no recibe el correo en unos minutos, revise su carpeta de spam.
            </p>
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-orchid-blue-60 text-white rounded-lg hover:bg-orchid-blue-70 transition-colors"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-600 text-sm">
              Ingrese su correo electronico y le enviaremos un enlace para
              restablecer su contrasena.
            </p>

            <div>
              <label
                htmlFor="reset-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electronico
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 disabled:bg-gray-100 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orchid-blue-60 text-white rounded-lg hover:bg-orchid-blue-70 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
