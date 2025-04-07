import { useState } from 'react';
import { useUserForm } from "./user-form.hook";
import './login.css';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    form,
    errors,
    authError,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit
  } = useUserForm(
    { email: "", password: "" },
    validationsForm
  );

  return (
    <div className="login-container">
      {/* Columna de la imagen */}
      <div className="login-image-column">
        <div className="image-overlay"></div>
        <div className="image-content">{/* 
          <h2>Bienvenido a nuestra plataforma</h2>
          <p>Gestiona tus proyectos de manera eficiente</p> */}
        </div>
        <div className="image-credit">
          Foto de <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>
        </div>
      </div>

      {/* Columna del formulario */}
      <div className="login-form-column">
        <div className="form-wrapper">
          <div className="login-header">
            <h1>Iniciar Sesión</h1>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                placeholder="ejemplo@correo.com"
                autoComplete="username"
              />
              {errors.email && (
                <span className="error-message">
                  {errors.email}
                </span>
              )}
            </div>

            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <div className="password-label-container">
                <label htmlFor="password">Contraseña</label>
                <button 
                  type="button" 
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="error-message">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                Recordar mi cuenta
              </label>
              <a href="/forgot-password" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {authError && (
              <div className="auth-error">
                {authError}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-button" 
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Procesando...
                </>
              ) : 'Iniciar sesión'}
            </button>
          </form>

          <div className="login-footer">
            <p>¿No tienes una cuenta? <a href="/register">Regístrate</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const validationsForm = (form: { email: string; password: string }) => {
  const errors: { email?: string; password?: string } = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.email.trim()) {
    errors.email = "Correo electrónico requerido";
  } else if (!emailRegex.test(form.email)) {
    errors.email = "Ingresa un correo válido";
  }

  if (!form.password) {
    errors.password = "Contraseña requerida";
  } else if (form.password.length < 6) {
    errors.password = "Mínimo 6 caracteres";
  }

  return errors;
};

export default LoginForm;