import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FirebaseUser } from "../../../domain/entities/firebaseUser";

// Estado vacío inicial
export const EmptyUserState: FirebaseUser = {} as FirebaseUser;

// Funciones auxiliares para sincronizar `sessionStorage`
const saveUserToSession = (user: FirebaseUser) => {
    sessionStorage.setItem('user', JSON.stringify(user));
};

const clearSessionPersistence = () => {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
};

// Estado inicial desde `sessionStorage`
const getInitialUserState = (): FirebaseUser => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : EmptyUserState;
};

// Slice de usuario
export const userSlice = createSlice({
    name: 'user',
    initialState: getInitialUserState(),
    reducers: {
        createUser: (_state, action: PayloadAction<FirebaseUser>) => {
            saveUserToSession(action.payload);
            return action.payload;
        },
        updateUser: (state, action: PayloadAction<Partial<FirebaseUser>>) => {
            const updatedUser = { ...state, ...action.payload };
            saveUserToSession(updatedUser);
            return updatedUser;
        },
        resetUser: () => {
            clearSessionPersistence();
            return EmptyUserState;
        }
    }
});

// Exportación de acciones y reducer
export const { createUser, updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
