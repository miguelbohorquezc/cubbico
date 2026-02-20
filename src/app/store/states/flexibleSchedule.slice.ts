/**
 * @fileoverview Slice de Redux para gestión del calendario flexible
 * @module app/store/states/flexibleSchedule.slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type {
  FlexibleScheduleActivity,
  ActivityConflictCheck,
} from '../../../domain/entities/schedule';
import {
  fetchFlexibleSchedule,
  addFlexibleActivity,
  updateFlexibleActivity,
  deleteFlexibleActivity,
} from '../../../infrastructure/schedule.service';
import { detectActivityOverlap, calculateEndTime } from '../../../domain/entities/schedule';

// ============================================
// Estado del slice
// ============================================

export interface FlexibleScheduleState {
  activities: FlexibleScheduleActivity[];
  year: string;
  loading: boolean;
  error: string | null;
  saving: boolean;
}

const initialState: FlexibleScheduleState = {
  activities: [],
  year: new Date().getFullYear().toString(),
  loading: false,
  error: null,
  saving: false,
};

// ============================================
// Thunks Async (operaciones con Firebase)
// ============================================

/**
 * Carga el horario flexible desde Firebase
 */
export const loadFlexibleSchedule = createAsyncThunk(
  'flexibleSchedule/load',
  async (year: string, { rejectWithValue }) => {
    try {
      const schedule = await fetchFlexibleSchedule(year);
      return schedule.activities;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al cargar horario'
      );
    }
  }
);

/**
 * Guarda una nueva actividad
 */
export const saveActivity = createAsyncThunk(
  'flexibleSchedule/saveActivity',
  async (
    { year, activity }: { year: string; activity: FlexibleScheduleActivity },
    { rejectWithValue }
  ) => {
    try {
      await addFlexibleActivity(year, activity);
      return activity;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al guardar actividad'
      );
    }
  }
);

/**
 * Actualiza una actividad existente
 */
export const updateActivity = createAsyncThunk(
  'flexibleSchedule/updateActivity',
  async (
    { year, activity }: { year: string; activity: FlexibleScheduleActivity },
    { rejectWithValue }
  ) => {
    try {
      await updateFlexibleActivity(year, activity);
      return activity;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al actualizar actividad'
      );
    }
  }
);

/**
 * Elimina una actividad
 */
export const removeActivity = createAsyncThunk(
  'flexibleSchedule/removeActivity',
  async ({ year, activityId }: { year: string; activityId: string }, { rejectWithValue }) => {
    try {
      await deleteFlexibleActivity(year, activityId);
      return activityId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al eliminar actividad'
      );
    }
  }
);

/**
 * Mueve una actividad (cambia startTime)
 */
export const moveActivity = createAsyncThunk(
  'flexibleSchedule/moveActivity',
  async (
    {
      year,
      activityId,
      newStartTime,
      newDayOfWeek,
    }: { year: string; activityId: string; newStartTime: string; newDayOfWeek: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const activity = state.flexibleSchedule.activities.find((a) => a.id === activityId);

      if (!activity) {
        throw new Error('Actividad no encontrada');
      }

      const updatedActivity: FlexibleScheduleActivity = {
        ...activity,
        startTime: newStartTime,
        dayOfWeek: newDayOfWeek,
        endTime: calculateEndTime(newStartTime, activity.durationMinutes),
      };

      await updateFlexibleActivity(year, updatedActivity);
      return updatedActivity;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al mover actividad'
      );
    }
  }
);

/**
 * Redimensiona una actividad (cambia duración)
 */
export const resizeActivity = createAsyncThunk(
  'flexibleSchedule/resizeActivity',
  async (
    {
      year,
      activityId,
      newDuration,
    }: { year: string; activityId: string; newDuration: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const activity = state.flexibleSchedule.activities.find((a) => a.id === activityId);

      if (!activity) {
        throw new Error('Actividad no encontrada');
      }

      const updatedActivity: FlexibleScheduleActivity = {
        ...activity,
        durationMinutes: newDuration,
        endTime: calculateEndTime(activity.startTime, newDuration),
      };

      await updateFlexibleActivity(year, updatedActivity);
      return updatedActivity;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al redimensionar actividad'
      );
    }
  }
);

// ============================================
// Slice
// ============================================

const flexibleScheduleSlice = createSlice({
  name: 'flexibleSchedule',
  initialState,
  reducers: {
    // Acciones síncronas
    setActivities: (state, action: PayloadAction<FlexibleScheduleActivity[]>) => {
      state.activities = action.payload;
    },
    setYear: (state, action: PayloadAction<string>) => {
      state.year = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load schedule
    builder
      .addCase(loadFlexibleSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFlexibleSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(loadFlexibleSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Save activity
    builder
      .addCase(saveActivity.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveActivity.fulfilled, (state, action) => {
        state.saving = false;
        state.activities.push(action.payload);
      })
      .addCase(saveActivity.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    // Update activity
    builder
      .addCase(updateActivity.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.activities.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    // Remove activity
    builder
      .addCase(removeActivity.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(removeActivity.fulfilled, (state, action) => {
        state.saving = false;
        state.activities = state.activities.filter((a) => a.id !== action.payload);
      })
      .addCase(removeActivity.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    // Move activity
    builder
      .addCase(moveActivity.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(moveActivity.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.activities.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
      })
      .addCase(moveActivity.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    // Resize activity
    builder
      .addCase(resizeActivity.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(resizeActivity.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.activities.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
      })
      .addCase(resizeActivity.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================
// Selectores
// ============================================

/**
 * Selecciona todas las actividades
 */
export const selectAllActivities = (state: RootState): FlexibleScheduleActivity[] =>
  state.flexibleSchedule.activities;

/**
 * Selecciona actividades de un día específico
 */
export const selectActivitiesByDay = (dayOfWeek: number) => (state: RootState) =>
  state.flexibleSchedule.activities.filter((activity) => activity.dayOfWeek === dayOfWeek);

/**
 * Selecciona una actividad por ID
 */
export const selectActivityById = (activityId: string) => (state: RootState) =>
  state.flexibleSchedule.activities.find((activity) => activity.id === activityId);

/**
 * Selecciona actividades de un profesor
 */
export const selectActivitiesByTeacher = (teacherId: string) => (state: RootState) =>
  state.flexibleSchedule.activities.filter((activity) => activity.teacherId === teacherId);

/**
 * Selecciona actividades de un salón
 */
export const selectActivitiesByClassroom = (classroomId: string) => (state: RootState) =>
  state.flexibleSchedule.activities.filter((activity) => activity.classroomId === classroomId);

/**
 * Detecta solapamientos para una actividad dada
 */
export const selectOverlapsForActivity = (check: ActivityConflictCheck) => (state: RootState) => {
  return detectActivityOverlap(state.flexibleSchedule.activities, check);
};

/**
 * Selecciona año actual
 */
export const selectYear = (state: RootState): string => state.flexibleSchedule.year;

/**
 * Selecciona estados de carga
 */
export const selectLoading = (state: RootState): boolean => state.flexibleSchedule.loading;
export const selectSaving = (state: RootState): boolean => state.flexibleSchedule.saving;
export const selectError = (state: RootState): string | null => state.flexibleSchedule.error;

// ============================================
// Exports
// ============================================

export const { setActivities, setYear, clearError } = flexibleScheduleSlice.actions;

export default flexibleScheduleSlice.reducer;
