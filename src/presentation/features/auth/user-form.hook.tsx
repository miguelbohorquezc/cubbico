/**
 * Hook de formulario de autenticación - REFACTORIZADO
 *
 * CAMBIOS DE SEGURIDAD APLICADOS:
 * ✅ Usa AuthService en lugar de Firebase directamente
 * ✅ Manejo de errores centralizado y traducido
 * ✅ No duplica lógica de manejo de errores
 * ✅ Usa tipos del dominio (AuthFormData, AuthErrorResponse)
 *
 * @deprecated Este hook será reemplazado por useAuth.ts en futuras versiones
 * Se mantiene temporalmente para compatibilidad con LoginForm existente.
 *
 * @module useUserForm
 */

import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store/store";
import { createUser } from "../../../app/store/states/user";
import { useNavigate } from "react-router-dom";
import { Enum } from "../../../domain/entities/enum";
import { FirebaseUser } from "../../../domain/entities/firebaseUser";
import { AuthService } from "../../../infrastructure/firebase/auth.service";
import { AuthFormData, AuthErrorResponse } from "../../../domain/entities/auth.types";

interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface ValidationRules {
  (form: FormValues): FormErrors;
}

export const useUserForm = (initialForm: FormValues, validations: ValidationRules) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  const [form, setForm] = useState<FormValues>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback(() => {
    setErrors(validations(form));
  }, [form, validations]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validations(form);

    if (Object.values(newErrors).some(error => !!error)) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setAuthError(""); // Limpiar errores previos

      // Usar AuthService en lugar de Firebase directamente
      const { user } = await AuthService.signIn({
        email: form.email,
        password: form.password
      } as AuthFormData);

      // Mapear AuthUser a FirebaseUser para compatibilidad con Redux legacy
      const userData: FirebaseUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL,
        metadata: {
          creationTime: user.metadata?.creationTime,
          lastSignInTime: user.metadata?.lastSignInTime
        }
      };

      dispatch(createUser(userData));
      navigate(Enum.PRIVATEROUTE);
    } catch (error) {
      // AuthService ya maneja el mapeo de errores a español
      const authError = error as AuthErrorResponse;
      setAuthError(authError.message);
    } finally {
      setIsLoading(false);
    }
  }, [form, dispatch, navigate, validations]);

  return {
    form,
    errors,
    authError,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    user
  };
};