// TeacherDataLoader.tsx
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { teacherActions } from "../../../app/store/states/teacher.slice"; // Importación corregida
import { fetchTeacherData } from "../../../infrastructure/teacher.service";

const TeacherDataLoader = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { loading, error } = useAppSelector((state) => state.teacherData);

  useEffect(() => {
    const loadTeacherData = async () => {
      if (!user?.uid) return;

      try {
        dispatch(teacherActions.setLoading(true));
        const teacherData = await fetchTeacherData(user.uid);
        
        // Actualizar el store con los datos obtenidos
        dispatch(teacherActions.setClassrooms(teacherData.classrooms));
        dispatch(teacherActions.setAreas(teacherData.areas));
        
        // Resetear error si tuvo éxito
        if (error) dispatch(teacherActions.setError(null));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido";
        dispatch(teacherActions.setError(errorMessage));
        console.error("Error loading teacher data:", errorMessage);
      } finally {
        dispatch(teacherActions.setLoading(false));
      }
    };

    loadTeacherData();
  }, [user?.uid, dispatch, error]);

  // Renderizar estados de carga/error si es necesario
  if (loading) return <div className="loading-indicator"></div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return null;
};

export default TeacherDataLoader;