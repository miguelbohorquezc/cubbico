import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FirebaseUser } from "../../../domain/entities/firebaseUser";

// Estado inicial mejor tipado
const getInitialUserState = (): FirebaseUser | null => {
  try {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) as FirebaseUser : null;
  } catch (error) {
    console.error('Error parsing user from sessionStorage:', error);
    return null;
  }
};

// Estado inicial
const initialState: FirebaseUser | null = getInitialUserState();

// Helper functions mejoradas con manejo de errores
const sessionStorageManager = {
  set: (user: FirebaseUser) => {
    try {
      sessionStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to sessionStorage:', error);
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing user from sessionStorage:', error);
    }
  }
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    createUser: (_, action: PayloadAction<FirebaseUser>) => {
      sessionStorageManager.set(action.payload);
      return action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<FirebaseUser>>) => {
      if (!state) return null;
      const updatedUser = { ...state, ...action.payload };
      sessionStorageManager.set(updatedUser);
      return updatedUser;
    },
    resetUser: () => {
      sessionStorageManager.clear();
      return null;
    }
  }
});

export const { createUser, updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;