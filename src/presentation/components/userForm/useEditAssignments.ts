import { useState, useEffect, useMemo } from "react";
import { getAreas, getClassRooms, updateUserAssignments, getUserByUid } from "../../../infrastructure/user.service";
import { ClassRoom } from "../../../domain/entities/classRoom";
import { Area } from "../../../domain/entities/area";

interface EditAssignmentsData {
  areas: Record<string, boolean>;
  salones: Record<string, boolean>;
  nivelesEducativos: string[];
}

export const useEditAssignments = (userId: string, userRole: string) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [selectedLevels, setSelectedLevels] = useState<('Preescolar' | 'Primaria' | 'Secundaria')[]>([]);
  const [form, setForm] = useState<EditAssignmentsData>({
    areas: {},
    salones: {},
    nivelesEducativos: []
  });

  const isCoordinador = userRole === 'Coordinador';

  // Cargar datos iniciales (áreas, salones y datos actuales del usuario)
  useEffect(() => {
    const loadInitialData = async () => {
      setInitializing(true);
      try {
        const [areasData, classRoomsData, userData] = await Promise.all([
          getAreas(),
          getClassRooms(),
          getUserByUid(userId)
        ]);

        setAreas(areasData);
        setClassRooms(classRoomsData);

        if (userData) {
          // Limpiar claves vacías de las asignaciones
          const cleanAreas = Object.fromEntries(
            Object.entries(userData.areas || {}).filter(([key]) => key && key.trim())
          );
          const cleanSalones = Object.fromEntries(
            Object.entries(userData.salones || {}).filter(([key]) => key && key.trim())
          );

          setForm({
            areas: cleanAreas,
            salones: cleanSalones,
            nivelesEducativos: userData.nivelesEducativos || []
          });

          // Determinar niveles seleccionados basados en las asignaciones actuales
          const niveles: ('Preescolar' | 'Primaria' | 'Secundaria')[] = [];
          if (userData.nivelesEducativos) {
            userData.nivelesEducativos.forEach((nivel: string) => {
              if (nivel === 'Preescolar' || nivel === 'Primaria' || nivel === 'Secundaria') {
                niveles.push(nivel);
              }
            });
          }
          setSelectedLevels(niveles);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitializing(false);
      }
    };

    loadInitialData();
  }, [userId]);

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

  // Auto-seleccionar todo para Coordinadores
  useEffect(() => {
    if (isCoordinador && selectedLevels.length > 0) {
      const newAreas: Record<string, boolean> = {};
      const newSalones: Record<string, boolean> = {};

      // Para áreas: NO incluir las de preescolar
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
  }, [isCoordinador, selectedLevels, filteredAreas, filteredClassRooms]);

  const toggleNivelEducativo = (nivel: 'Preescolar' | 'Primaria' | 'Secundaria') => {
    setSelectedLevels(prev =>
      prev.includes(nivel)
        ? prev.filter(n => n !== nivel)
        : [...prev, nivel]
    );
  };

  const handleCheckboxChange = (type: 'areas' | 'salones') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setForm(prev => ({
        ...prev,
        [type]: { ...prev[type], [name]: checked }
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que haya al menos un nivel seleccionado
    if (selectedLevels.length === 0) {
      alert('Debe seleccionar al menos un nivel educativo');
      return;
    }

    // Validar que haya al menos una asignación
    const hasAreas = Object.values(form.areas).some(v => v);
    const hasSalones = Object.values(form.salones).some(v => v);

    if (!hasAreas && !hasSalones) {
      alert('Debe seleccionar al menos un área o salón');
      return;
    }

    setLoading(true);
    try {
      // Filtrar solo las asignaciones seleccionadas, excluyendo claves vacías
      const areasToSend = Object.fromEntries(
        Object.entries(form.areas).filter(([key, value]) => key && key.trim() && value)
      );

      const salonesToSend = Object.fromEntries(
        Object.entries(form.salones).filter(([key, value]) => key && key.trim() && value)
      );

      await updateUserAssignments(userId, {
        areas: areasToSend,
        salones: salonesToSend,
        nivelesEducativos: selectedLevels
      });

      return true; // Éxito
    } catch (error) {
      console.error("Error updating assignments:", error);
      alert('Error al actualizar asignaciones: ' + error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    initializing,
    areas: filteredAreas,
    classRooms: filteredClassRooms,
    selectedLevels,
    isCoordinador,
    handleCheckboxChange,
    handleSubmit,
    toggleNivelEducativo
  };
};
