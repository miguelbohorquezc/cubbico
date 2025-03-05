// teacher.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ClassRoom, Area } from "../../../domain/services/user.service";

interface TeacherState {
  classrooms: ClassRoom[];
  areas: Area[];
  loading: boolean;
  error: string | null;
}

const initialState: TeacherState = {
  classrooms: [],
  areas: [],
  loading: false,
  error: null,
};

const teacherSlice = createSlice({
  name: "teacherData",
  initialState,
  reducers: {
    setClassrooms: (state, action: PayloadAction<ClassRoom[]>) => {
      state.classrooms = action.payload;
    },
    setAreas: (state, action: PayloadAction<Area[]>) => {
      state.areas = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setClassrooms, setAreas, setLoading, setError } = teacherSlice.actions;
export default teacherSlice.reducer;