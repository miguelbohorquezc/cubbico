// teacher.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Area } from "../../../domain/entities/area";
import { ClassRoom } from "../../../domain/entities/classRoom";
import { AchievementData } from "../../../infrastructure/achievement.service";

interface TeacherState {
  classrooms: ClassRoom[];
  areas: Area[];
  achievements: AchievementData[];
  loading: boolean;
  error: string | null;
}

const initialState: TeacherState = {
  classrooms: [],
  areas: [],
  achievements: [],
  loading: false,
  error: null,
};

export const teacherSlice = createSlice({
  name: "teacherData",
  initialState,
  reducers: {
    setClassrooms: (state, action: PayloadAction<ClassRoom[]>) => {
      state.classrooms = action.payload;
    },
    setAreas: (state, action: PayloadAction<Area[]>) => {
      state.areas = action.payload;
    },
    setAchievements: (state, action: PayloadAction<AchievementData[]>) => {
      state.achievements = action.payload;
    },
    upsertAchievement: (state, action: PayloadAction<AchievementData>) => {
      const index = state.achievements.findIndex(
        a => a.id === action.payload.id
      );
      if (index >= 0) {
        state.achievements[index] = action.payload;
      } else {
        state.achievements.push(action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Exporta las acciones como un objeto nombrado
export const teacherActions = teacherSlice.actions;
export default teacherSlice.reducer;