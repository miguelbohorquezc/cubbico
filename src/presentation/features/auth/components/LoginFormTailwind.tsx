/**
 * LoginForm con Tailwind CSS - Versión Moderna
 *
 * CARACTERÍSTICAS:
 * - 100% Tailwind CSS (sin archivos CSS externos)
 * - Usa el nuevo hook useAuth (no legacy useUserForm)
 * - Diseño responsive mobile-first
 * - Colores institucionales (deep-blue, gold, medium-blue)
 * - Accesibilidad mejorada (ARIA labels, roles, navegación por teclado)
 * - Validación en tiempo real
 * - Indicadores de carga granulares
 * - Animaciones suaves con Tailwind
 *
 * @module LoginFormTailwind
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Enum } from '../../../../domain/entities/enum';

/**
 * Componente LoginForm modernizado
 *
 * @returns {JSX.Element} Formulario de login con Tailwind CSS
 */
const LoginFormTailwind = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Usar el nuevo hook useAuth con callbacks
  const {
    formData,
    errors,
    authError,
    isAuthenticating,
    updateField,
    signIn,
    clearErrors
  } = useAuth(
    { email: '', password: '' },
    {
      onSuccess: () => {
        navigate(Enum.PRIVATEROUTE);
      },
      onError: (error) => {
        // SEGURIDAD: No loguear detalles de errores de autenticación en producción
        // para evitar exposición de información sensible
        if (import.meta.env.DEV) {
          console.error('Error de autenticación:', error);
        }
      },
      options: {
        rememberMe
      }
    }
  );

  /**
   * Toggle visibility de contraseña
   */
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Manejo de cambios en inputs
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name as 'email' | 'password', value);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* ========================================
          COLUMNA IZQUIERDA: IMAGEN
          ======================================== */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-deep-blue via-medium-blue to-deep-blue-700">
        {/* Imagen de fondo con overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg)',
            opacity: 0.3
          }}
          role="img"
          aria-label="Imagen de bienvenida mostrando estudiantes"
        />

        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-deep-blue/80 via-medium-blue/70 to-deep-blue-800/80" />

        {/* Contenido de la columna de imagen */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Contenido superior (opcional para logos o títulos) */}
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-4 leading-tight animate-fade-in">
              Sistema Académico
            </h2>
            <p className="text-lg opacity-90 animate-fade-in">
              Colina Campestre School - Gestión Institucional
            </p>
          </div>

          {/* Crédito de imagen (footer) */}
          <div className="text-sm opacity-70 self-end">
            Foto de{' '}
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gold transition-colors"
            >
              Pexels
            </a>
          </div>
        </div>
      </div>

      {/* ========================================
          COLUMNA DERECHA: FORMULARIO
          ======================================== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-off-white">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Header del formulario */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-deep-blue mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-600">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <form
            onSubmit={signIn}
            className="space-y-6"
            noValidate
            aria-label="Formulario de inicio de sesión"
          >
            {/* ========================================
                CAMPO: EMAIL
                ======================================== */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-deep-blue mb-2"
              >
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isAuthenticating}
                placeholder="ejemplo@colina.edu"
                autoComplete="username"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`
                  w-full px-4 py-3 rounded-lg border-2
                  text-deep-blue placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.email
                    ? 'border-error bg-error-light/10 focus:border-error focus:ring-error/20'
                    : 'border-light-gray-300 bg-white focus:border-medium-blue focus:ring-medium-blue/20'
                  }
                `}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="mt-2 text-sm text-error flex items-center gap-1 animate-fade-in"
                  role="alert"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* ========================================
                CAMPO: PASSWORD
                ======================================== */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-deep-blue"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  disabled={isAuthenticating}
                  className="text-xs text-medium-blue hover:text-deep-blue transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isAuthenticating}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`
                  w-full px-4 py-3 rounded-lg border-2
                  text-deep-blue placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.password
                    ? 'border-error bg-error-light/10 focus:border-error focus:ring-error/20'
                    : 'border-light-gray-300 bg-white focus:border-medium-blue focus:ring-medium-blue/20'
                  }
                `}
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-2 text-sm text-error flex items-center gap-1 animate-fade-in"
                  role="alert"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* ========================================
                OPCIONES: RECORDAR / OLVIDÉ CONTRASEÑA
                ======================================== */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isAuthenticating}
                  className="w-4 h-4 rounded border-light-gray-400 text-medium-blue focus:ring-2 focus:ring-medium-blue/20 disabled:opacity-50 cursor-pointer"
                  aria-label="Recordar mi cuenta"
                />
                <span className="text-gray-600 group-hover:text-deep-blue transition-colors">
                  Recordar mi cuenta
                </span>
              </label>

              <a
                href="/forgot-password"
                className="text-medium-blue hover:text-deep-blue hover:underline transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implementar recuperación de contraseña
                  alert('Funcionalidad de recuperación de contraseña próximamente');
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* ========================================
                ERROR DE AUTENTICACIÓN (GLOBAL)
                ======================================== */}
            {authError && (
              <div
                className="bg-error-light/10 border-l-4 border-error text-error px-4 py-3 rounded-r animate-fade-in"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-sm">Error de autenticación</p>
                    <p className="text-sm mt-1">{authError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearErrors}
                    className="ml-auto text-error hover:text-error-dark transition-colors"
                    aria-label="Cerrar mensaje de error"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================
                BOTÓN SUBMIT
                ======================================== */}
            <button
              type="submit"
              disabled={isAuthenticating}
              aria-busy={isAuthenticating}
              className="
                w-full py-3 px-4 rounded-lg font-medium text-white
                bg-gradient-to-r from-medium-blue to-deep-blue
                hover:from-medium-blue-600 hover:to-deep-blue-600
                focus:outline-none focus:ring-2 focus:ring-medium-blue/50 focus:ring-offset-2
                disabled:opacity-70 disabled:cursor-not-allowed
                transition-all duration-200
                shadow-md hover:shadow-lg
                transform hover:-translate-y-0.5 active:translate-y-0
              "
            >
              {isAuthenticating ? (
                <span className="flex items-center justify-center gap-2">
                  {/* Spinner animado */}
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Autenticando...</span>
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* ========================================
              FOOTER: LINK DE REGISTRO
              ======================================== */}
          <div className="text-center text-sm text-gray-600 pt-4 border-t border-light-gray-300">
            <p>
              ¿No tienes una cuenta?{' '}
              <a
                href="/register"
                className="text-medium-blue hover:text-deep-blue font-medium hover:underline transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Navegar a página de registro
                  alert('Funcionalidad de registro próximamente');
                }}
              >
                Regístrate
              </a>
            </p>
          </div>

          {/* Badge de versión (opcional, solo desarrollo) */}
          {import.meta.env.DEV && (
            <div className="text-center text-xs text-gray-400 pt-2">
              <p className="flex items-center justify-center gap-1">
                <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse" />
                Versión Tailwind CSS • useAuth
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginFormTailwind;
