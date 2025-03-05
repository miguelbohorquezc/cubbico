// src/infrastructure/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import userReducer from "./states/user";
import studentReducer from "./states/student.slice";
import { FirebaseUser } from "../../domain/entities/firebaseUser";
import { studentInfo } from "../../domain/entities/user.student";
import usersReducer from "./states/user.slice";

export interface AppState {
  user: FirebaseUser;
  students: {
    students: studentInfo[];
    loading: boolean;
    error: string | null;
  };
}

export const appStore = configureStore({
  reducer: {
    user: userReducer,
    students: studentReducer,
    users: usersReducer,
  }
});

// Tipos inferidos
export type AppDispatch = typeof appStore.dispatch;
export type RootState = ReturnType<typeof appStore.getState>;

// Hooks personalizados tipados
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default appStore;