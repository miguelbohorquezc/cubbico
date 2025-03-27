import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../infrastructure/firebase/firebase";
import { createUser, getAreas, getClassRooms, assignRoles } from "../../../infrastructure/user.service";
import { ClassRoom } from "../../../domain/entities/classRoom";
import { UserFormData } from "../../../domain/entities/userFormData";
import { Area } from "../../../domain/entities/area";

export const useUserForm = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [filterPreschool, setFilterPreschool] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const [form, setForm] = useState<UserFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    areas: {},
    salones: {},
    directorGrupo: ''
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [areasData, classRoomsData] = await Promise.all([
          getAreas(),
          getClassRooms()
        ]);
        setAreas(areasData);
        setClassRooms(classRoomsData);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const filteredAreas = filterPreschool 
    ? areas.filter(area => area.nivel.toLowerCase().includes('preescolar'))
    : areas;

  const togglePreschoolFilter = () => {
    setFilterPreschool(!filterPreschool);
    setForm(prev => ({ ...prev, areas: {} }));
  };

  const validatePassword = (password: string) => {
    const requirements = {
      hasLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    setPasswordRequirements(requirements);
    return requirements;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!form.email) {
      newErrors.email = 'Email es requerido';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Email inválido';
    }

    const passwordValid = validatePassword(form.password);
    if (!form.password) {
      newErrors.password = 'Contraseña requerida';
    } else if (!Object.values(passwordValid).every(v => v)) {
      newErrors.password = 'La contraseña no cumple los requisitos';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!form.role) {
      newErrors.role = 'Debe seleccionar un rol';
    }

    if (form.role === 'Docente' && !Object.values(form.areas).some(v => v)) {
      newErrors.areas = 'Debe seleccionar al menos un área';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'password') {
      validatePassword(value);
    }
    
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (type: 'areas' | 'salones') => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setForm(prev => ({
        ...prev,
        [type]: { ...prev[type], [name]: checked }
      }));
    };

  const handleBlur = () => {
    validateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userId = await createUser(form);
      await assignRoles(userId, {
        role: form.role,
        areas: form.areas,
        salones: form.salones,
        directorGrupo: form.directorGrupo
      });
      
      setForm({
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        areas: {},
        salones: {},
        directorGrupo: ''
      });
      
      alert('Usuario creado exitosamente!');
    } catch (error) {
      console.error("Error creating user:", error);
      alert('Error al crear usuario: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    form,
    errors,
    loading,
    areas: filteredAreas,
    classRooms,
    showPassword,
    passwordRequirements,
    filterPreschool,
    togglePreschoolFilter,
    setShowPassword,
    handleInputChange,
    handleCheckboxChange,
    handleSubmit,
    handleLogout,
    handleBlur
  };
};