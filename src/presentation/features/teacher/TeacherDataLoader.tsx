// TeacherDataLoader.tsx
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { setClassrooms, setAreas, setLoading, setError } from "../../../app/store/states/teacher.slice";
import { fetchTeacherData } from "../../../infrastructure/teacher.service";

const TeacherDataLoader = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { loading } = useAppSelector((state) => state.teacherData);

  useEffect(() => {
    const loadData = async () => {
      if (user?.uid) {
        try {
          dispatch(setLoading(true));
          const data = await fetchTeacherData(user.uid);
          dispatch(setClassrooms(data.classrooms));
          dispatch(setAreas(data.areas));
        } catch (error) {
          if (error instanceof Error) {
            dispatch(setError(error.message));
          } else {
            dispatch(setError("An unknown error occurred"));
          }
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    loadData();
  }, [user?.uid, dispatch]);

  return null;
};

export default TeacherDataLoader;