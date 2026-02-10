import { useState, useEffect, useMemo } from "react";
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
  const [selectedLevels, setSelectedLevels] = useState<('Preescolar' | 'Primaria' | 'Secundaria')[]>([]);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const [form, setForm] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Docente',
    willTeach: false,
    areas: {},
    salones: {},
    directorGrupo: '',
    nivelesEducativos: [],
    isActive: true
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

  const filteredAreas = useMemo(() => {
    if (selectedLevels.length === 0) return areas;
    return areas.filter(area => 
      selectedLevels.some(nivel => 
        area.nivel.toLowerCase().includes(nivel.toLowerCase())
      )
    );
  }, [areas, selectedLevels]);

  const filteredClassRooms = useMemo(() => {
    if (selectedLevels.length === 0) return classRooms;
    return classRooms.filter(salon =>
      selectedLevels.some(nivel =>
        salon.nivel.toLowerCase().includes(nivel.toLowerCase())
      )
    );
  }, [classRooms, selectedLevels]);

  // Auto-seleccionar todo para Coordinadores cuando seleccionan niveles
  useEffect(() => {
    const isCoordinador = form.role === 'Coordinador';
    const shouldAutoSelect = isCoordinador && form.willTeach && selectedLevels.length > 0;

    if (shouldAutoSelect) {
      const newAreas: Record<string, boolean> = {};
      const newSalones: Record<string, boolean> = {};

      // Para áreas: NO incluir las de preescolar (son internas)
      filteredAreas.forEach(area => {
        const isPreschoolArea = area.nivel.toLowerCase().includes('preescolar');
        if (!isPreschoolArea) {
          newAreas[area.id] = true;
        }
      });

      // Para salones: incluir TODOS (incluido preescolar)
      filteredClassRooms.forEach(salon => {
        newSalones[salon.id] = true;
      });

      setForm(prev => ({
        ...prev,
        areas: newAreas,
        salones: newSalones
      }));
    }
  }, [form.role, form.willTeach, selectedLevels, filteredAreas, filteredClassRooms]);

  const toggleNivelEducativo = (nivel: 'Preescolar' | 'Primaria' | 'Secundaria') => {
    setSelectedLevels(prev => 
      prev.includes(nivel)
        ? prev.filter(n => n !== nivel)
        : [...prev, nivel]
    );
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

    if (!form.firstName.trim()) {
      newErrors.firstName = 'Nombre es requerido';
    } else if (form.firstName.trim().length < 2) {
      newErrors.firstName = 'Nombre debe tener al menos 2 caracteres';
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Apellido es requerido';
    } else if (form.lastName.trim().length < 2) {
      newErrors.lastName = 'Apellido debe tener al menos 2 caracteres';
    }

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

    // Validar asignaciones si es Docente O si es Coordinador que dará clases
    const requiresTeachingAssignments = form.role === 'Docente' ||
      (form.role === 'Coordinador' && form.willTeach);

    if (requiresTeachingAssignments) {
      if (selectedLevels.length === 0) {
        newErrors.nivelesEducativos = 'Seleccione al menos un nivel educativo';
      }

      const hasSelectedAreas = Object.values(form.areas).some(v => v);
      if (!hasSelectedAreas) {
        newErrors.areas = 'Debe seleccionar al menos un área';
      }

      const hasSelectedSalones = Object.values(form.salones).some(v => v);
      if (!hasSelectedSalones) {
        newErrors.salones = 'Debe seleccionar al menos un salón';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'role' && form.role !== value) {
      setForm({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: value as 'Coordinador' | 'Docente',
        willTeach: false,
        areas: {},
        salones: {},
        directorGrupo: '',
        nivelesEducativos: [],
        isActive: true
      });
      setSelectedLevels([]);
      return;
    }
    
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

  const handleWillTeachChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const willTeach = e.target.checked;
    if (!willTeach) {
      // Si desmarca "Dará clases", limpiar asignaciones
      setForm(prev => ({
        ...prev,
        willTeach: false,
        areas: {},
        salones: {},
        directorGrupo: '',
        nivelesEducativos: []
      }));
      setSelectedLevels([]);
    } else {
      setForm(prev => ({ ...prev, willTeach: true }));
    }
  };

  const handleBlur = () => {
    validateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const areasToSend = Object.fromEntries(
        Object.entries(form.areas)
          .filter(([id]) => id && id.trim() && filteredAreas.some(a => a.id === id))
      );

      const salonesToSend = Object.fromEntries(
        Object.entries(form.salones)
          .filter(([id]) => id && id.trim() && filteredClassRooms.some(s => s.id === id))
      );

      const userId = await createUser({
        ...form,
        nivelesEducativos: selectedLevels,
        areas: areasToSend,
        salones: salonesToSend
      });
      
      await assignRoles(userId, {
        role: form.role,
        areas: areasToSend,
        salones: salonesToSend,
        directorGrupo: form.directorGrupo,
        //@ts-ignore
        nivelesEducativos: selectedLevels
      });
      
      // Reset form
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Docente',
        willTeach: false,
        areas: {},
        salones: {},
        directorGrupo: '',
        nivelesEducativos: [],
        isActive: true
      });
      setSelectedLevels([]);
      
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
    classRooms: filteredClassRooms,
    showPassword,
    passwordRequirements,
    selectedLevels,
    setShowPassword,
    handleInputChange,
    handleCheckboxChange,
    handleWillTeachChange,
    handleSubmit,
    handleLogout,
    handleBlur,
    toggleNivelEducativo
  };
};