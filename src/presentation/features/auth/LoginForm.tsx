import { useUserForm } from './user-form.hook';

// Tipos para las validaciones
interface ValidationRules {
  email: string;
  password: string;
}

// Componente principal
const LoginForm = () => {
  const { 
    form,
    errors,
    authError,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit
  } = useUserForm(
    { email: '', password: '' },
    validationsForm
  );

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.email ? 'input-error' : ''}
            disabled={isLoading}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.password ? 'input-error' : ''}
            disabled={isLoading}
          />
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        {authError && <div className="auth-error">{authError}</div>}

        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>
    </div>
  );
};

// Validaciones del formulario
const validationsForm = (form: ValidationRules) => {
  const errors: Partial<Record<keyof ValidationRules, string>> = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.email.trim()) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Correo electrónico inválido';
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida';
  } else if (form.password.length < 6) {
    errors.password = 'Mínimo 6 caracteres';
  }

  return errors;
};

export default LoginForm;