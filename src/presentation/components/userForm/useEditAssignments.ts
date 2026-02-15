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
  const [error, setError] = useState<string | null>(null);
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

  // Limpiar asignaciones que ya no están en los niveles seleccionados
  useEffect(() => {
    if (selectedLevels.length === 0) return;

    const filteredAreaIds = new Set(filteredAreas.map(a => a.id));
    const filteredSalonIds = new Set(filteredClassRooms.map(s => s.id));

    setForm(prev => {
      // Filtrar solo las áreas que están en los niveles seleccionados
      const cleanedAreas = Object.fromEntries(
        Object.entries(prev.areas).filter(([id]) => filteredAreaIds.has(id))
      );

      // Filtrar solo los salones que están en los niveles seleccionados
      const cleanedSalones = Object.fromEntries(
        Object.entries(prev.salones).filter(([id]) => filteredSalonIds.has(id))
      );

      console.log('🧹 Cleaning form - Removed areas:',
        Object.keys(prev.areas).filter(id => !filteredAreaIds.has(id)));
      console.log('🧹 Cleaning form - Removed salones:',
        Object.keys(prev.salones).filter(id => !filteredSalonIds.has(id)));

      return {
        ...prev,
        areas: cleanedAreas,
        salones: cleanedSalones
      };
    });
  }, [selectedLevels, filteredAreas, filteredClassRooms]);

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
      console.log(`🔲 Checkbox change - Type: ${type}, ID: ${name}, Checked: ${checked}`);
      setForm(prev => {
        const newForm = {
          ...prev,
          [type]: { ...prev[type], [name]: checked }
        };
        console.log('📝 New form state:', newForm);
        return newForm;
      });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos

    // Validar que haya al menos un nivel seleccionado
    if (selectedLevels.length === 0) {
      setError('Debe seleccionar al menos un nivel educativo');
      return false;
    }

    // Validar que haya al menos una asignación
    const hasAreas = Object.values(form.areas).some(v => v);
    const hasSalones = Object.values(form.salones).some(v => v);

    if (!hasAreas && !hasSalones) {
      setError('Debe seleccionar al menos un área o salón');
      return false;
    }

    setLoading(true);
    try {
      // Enviar TODAS las asignaciones (incluyendo false) para sobrescribir correctamente en Firebase
      // Esto asegura que los items desmarcados se guarden como false
      const areasToSend = Object.fromEntries(
        Object.entries(form.areas).filter(([key]) => key && key.trim())
      );

      const salonesToSend = Object.fromEntries(
        Object.entries(form.salones).filter(([key]) => key && key.trim())
      );

      console.log('💾 Saving to Firebase - Areas:', areasToSend);
      console.log('💾 Saving to Firebase - Salones:', salonesToSend);

      await updateUserAssignments(userId, {
        areas: areasToSend,
        salones: salonesToSend,
        nivelesEducativos: selectedLevels
      });

      return true; // Éxito
    } catch (error) {
      console.error("Error updating assignments:", error);
      setError('Error al actualizar asignaciones. Por favor intente de nuevo.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    initializing,
    error,
    areas: filteredAreas,
    classRooms: filteredClassRooms,
    selectedLevels,
    isCoordinador,
    handleCheckboxChange,
    handleSubmit,
    toggleNivelEducativo
  };
};
