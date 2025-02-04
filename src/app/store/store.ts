import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./states/user";
import { FirebaseUser } from "../../domain/entities/firebaseUser";  

// Definir la interfaz del estado global
export interface AppState {
    user: FirebaseUser;
}

// Configurar la store con tipado correcto
export const appStore = configureStore({
  reducer: {
    user: userReducer
  }
});

// Inferir los tipos de `dispatch` y `useSelector`
export type AppDispatch = typeof appStore.dispatch;
export type RootState = ReturnType<typeof appStore.getState>;

export default appStore;
