// src/domain/states/student.slice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../domain/services/firebase/firebase";
import { studentInfo } from "../../../domain/entities/user.student";
// src/domain/states/student.slice.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from "../store";

// Selectores raíz
const selectStudentsState = (state: RootState) => state.students;

// Selectores memoizados
export const selectAllStudents = createSelector(
  [selectStudentsState],
  (studentsState) => studentsState.students
);

export const selectStudentsLoading = createSelector(
  [selectStudentsState],
  (studentsState) => studentsState.loading
);

export const selectStudentsError = createSelector(
  [selectStudentsState],
  (studentsState) => studentsState.error
);

interface StudentState {
  students: studentInfo[];
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  students: [],
  loading: false,
  error: null,
};

export const fetchStudents = createAsyncThunk(
  'students/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const querySnapshot = await getDocs(collection(db, "student"));
      const students = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as studentInfo);
      return students;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<studentInfo[]>) => {
        state.students = action.payload;
        state.loading = false;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default studentSlice.reducer;