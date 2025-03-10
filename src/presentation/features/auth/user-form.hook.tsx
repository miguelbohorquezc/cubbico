import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store/store";
import { auth } from "../../../infrastructure/firebase/firebase";
import { createUser } from "../../../app/store/states/user";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Enum } from "../../../domain/entities/enum";
import { FirebaseUser } from "../../../domain/entities/firebaseUser";

interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface AuthError {
  code: string;
  message: string;
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
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || "",
      };

      dispatch(createUser(userData as FirebaseUser));
      navigate(Enum.PRIVATEROUTE);
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setIsLoading(false);
    }
  }, [form, dispatch, navigate]);

  const handleAuthError = useCallback((error: AuthError) => {
    switch (error.code) {
      case "auth/invalid-login-credentials":
        setAuthError("Credenciales inválidas");
        break;
      case "auth/too-many-requests":
        setAuthError("Demasiados intentos. Intente más tarde");
        break;
      case "auth/invalid-email":
        setAuthError("Correo electrónico inválido");
        break;
      case "auth/missing-password":
        setAuthError("Contraseña requerida");
        break;
      case "auth/network-request-failed":
        setAuthError("Error de red");
        break;
      default:
        setAuthError("Error al iniciar sesión");
    }
  }, []);

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