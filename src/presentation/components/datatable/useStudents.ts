// src/hooks/useStudents.ts
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store/store"; // Corrige la ruta
import { fetchStudents } from "../../../app/store/states/student.slice"; // Corrige la ruta
import {selectAllStudents, selectStudentsLoading, selectStudentsError } from "../../../app/store/states/student.slice";

export const useStudents = () => {
    const dispatch = useAppDispatch();
    
    // Usar selectores memoizados
    const students = useAppSelector(selectAllStudents);
    const loading = useAppSelector(selectStudentsLoading);
    const error = useAppSelector(selectStudentsError);
  
    useEffect(() => {
      dispatch(fetchStudents());
    }, [dispatch]);
  
    return {
      students,
      loading,
      error,
      refreshStudents: () => dispatch(fetchStudents())
    };
  };