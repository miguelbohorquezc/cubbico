// src/hooks/useUserForm.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../domain/services/firebase/firebase";
import { 
  createUser,
  getAreas,
  getClassRooms,
  assignRoles,
  UserFormData,
  Area,
  ClassRoom
} from "../../../domain/services/user.service";

export const useUserForm = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState<UserFormData>({
    email: '',
    password: '',
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!form.email) {
      newErrors.email = 'Email es requerido';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Email inválido';
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
    areas,
    classRooms,
    handleInputChange,
    handleCheckboxChange,
    handleSubmit,
    handleLogout,
    handleBlur
  };
};