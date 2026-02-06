// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import userReducer from "./states/user";
import studentReducer from "./states/student.slice";
import { FirebaseUser } from "../../domain/entities/firebaseUser";
import { studentInfo } from "../../domain/entities/studentInfo";
import usersReducer from "./states/user.slice";
import { Area } from "../../domain/entities/area";
import { ClassRoom } from "../../domain/entities/classRoom";
import teacherReducer from "./states/teacher.slice";
import { AchievementData } from "../../domain/entities/achievementData";
import flexibleScheduleReducer, { FlexibleScheduleState } from "./states/flexibleSchedule.slice";

export interface AppState {
  user: FirebaseUser;
  students: {
    students: studentInfo[];
    loading: boolean;
    error: string | null;
  };
  teacherData: {
    classrooms: ClassRoom[];
    areas: Area[];
    achievements: AchievementData[];
    loading: boolean;
    error: string | null;
  };
  users: {
    list: FirebaseUser[];
    loading: boolean;
    error: string | null;
  };
  flexibleSchedule: FlexibleScheduleState;
}

export const appStore = configureStore({
  reducer: {
    user: userReducer,
    students: studentReducer,
    users: usersReducer,
    teacherData: teacherReducer,
    flexibleSchedule: flexibleScheduleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['teacherData/upsertAchievement'],
        ignoredPaths: ['teacherData.achievements']
      }
    })
});

// Tipos inferidos
export type AppDispatch = typeof appStore.dispatch;
export type RootState = ReturnType<typeof appStore.getState>;

// Hooks personalizados tipados
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default appStore;