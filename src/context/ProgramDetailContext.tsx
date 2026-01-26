'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { TrainingProgram, ProgramWorkout, ProgramWeek, ProgramStatus } from '@/types/training-program';

// State type
interface ProgramDetailState {
  program: TrainingProgram | null;
  selectedWeekNumber: number;
  selectedWorkout: ProgramWorkout | null;
  isLoading: boolean;
  error: string | null;
}

// Action types
type ProgramDetailAction =
  | { type: 'SET_PROGRAM'; program: TrainingProgram }
  | { type: 'CLEAR_PROGRAM' }
  | { type: 'SELECT_WEEK'; weekNumber: number }
  | { type: 'SELECT_WORKOUT'; workout: ProgramWorkout | null }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'UPDATE_STATUS'; status: ProgramStatus }
  | { type: 'UPDATE_CURRENT_WEEK'; currentWeek: number }
  | { type: 'MARK_WORKOUT_COMPLETE'; workoutId: string; isCompleted: boolean };

// Initial state
const initialState: ProgramDetailState = {
  program: null,
  selectedWeekNumber: 1,
  selectedWorkout: null,
  isLoading: false,
  error: null,
};

// Context value type
interface ProgramDetailContextValue {
  state: ProgramDetailState;
  dispatch: React.Dispatch<ProgramDetailAction>;

  // Convenience getters
  program: TrainingProgram | null;
  selectedWeek: ProgramWeek | null;
  selectedWorkout: ProgramWorkout | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProgram: (program: TrainingProgram) => void;
  clearProgram: () => void;
  selectWeek: (weekNumber: number) => void;
  selectWorkout: (workout: ProgramWorkout | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateStatus: (status: ProgramStatus) => void;
  updateCurrentWeek: (currentWeek: number) => void;
  markWorkoutComplete: (workoutId: string, isCompleted: boolean) => void;
}

// Create context
const ProgramDetailContext = createContext<ProgramDetailContextValue | null>(null);

// Reducer function
function programDetailReducer(
  state: ProgramDetailState,
  action: ProgramDetailAction
): ProgramDetailState {
  switch (action.type) {
    case 'SET_PROGRAM':
      return {
        ...state,
        program: action.program,
        selectedWeekNumber: action.program.current_week || 1,
        error: null,
      };

    case 'CLEAR_PROGRAM':
      return initialState;

    case 'SELECT_WEEK':
      return {
        ...state,
        selectedWeekNumber: action.weekNumber,
        selectedWorkout: null, // Clear selected workout when changing weeks
      };

    case 'SELECT_WORKOUT':
      return {
        ...state,
        selectedWorkout: action.workout,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
      };

    case 'UPDATE_STATUS':
      if (!state.program) return state;
      return {
        ...state,
        program: {
          ...state.program,
          status: action.status,
        },
      };

    case 'UPDATE_CURRENT_WEEK':
      if (!state.program) return state;
      return {
        ...state,
        program: {
          ...state.program,
          current_week: action.currentWeek,
        },
      };

    case 'MARK_WORKOUT_COMPLETE': {
      if (!state.program) return state;

      // Update the workout in the program weeks
      const updatedWeeks = state.program.weeks.map((week) => ({
        ...week,
        workouts: week.workouts.map((workout) =>
          workout.id === action.workoutId
            ? {
              ...workout,
              is_completed: action.isCompleted,
              completed_at: action.isCompleted ? new Date().toISOString() : undefined,
            }
            : workout
        ),
      }));

      // Also update selectedWorkout if it's the one being marked
      const updatedSelectedWorkout =
        state.selectedWorkout?.id === action.workoutId
          ? {
            ...state.selectedWorkout,
            is_completed: action.isCompleted,
            completed_at: action.isCompleted ? new Date().toISOString() : undefined,
          }
          : state.selectedWorkout;

      return {
        ...state,
        program: {
          ...state.program,
          weeks: updatedWeeks,
        },
        selectedWorkout: updatedSelectedWorkout,
      };
    }

    default:
      return state;
  }
}

// Provider component
interface ProgramDetailProviderProps {
  children: React.ReactNode;
}

export function ProgramDetailProvider({ children }: ProgramDetailProviderProps) {
  const [state, dispatch] = useReducer(programDetailReducer, initialState);

  // Computed values
  const selectedWeek = state.program?.weeks.find(
    (w) => w.week_number === state.selectedWeekNumber
  ) || null;

  // Action creators
  const setProgram = useCallback(
    (program: TrainingProgram) => dispatch({ type: 'SET_PROGRAM', program }),
    []
  );

  const clearProgram = useCallback(
    () => dispatch({ type: 'CLEAR_PROGRAM' }),
    []
  );

  const selectWeek = useCallback(
    (weekNumber: number) => dispatch({ type: 'SELECT_WEEK', weekNumber }),
    []
  );

  const selectWorkout = useCallback(
    (workout: ProgramWorkout | null) => dispatch({ type: 'SELECT_WORKOUT', workout }),
    []
  );

  const setLoading = useCallback(
    (isLoading: boolean) => dispatch({ type: 'SET_LOADING', isLoading }),
    []
  );

  const setError = useCallback(
    (error: string | null) => dispatch({ type: 'SET_ERROR', error }),
    []
  );

  const updateStatus = useCallback(
    (status: ProgramStatus) => dispatch({ type: 'UPDATE_STATUS', status }),
    []
  );

  const updateCurrentWeek = useCallback(
    (currentWeek: number) => dispatch({ type: 'UPDATE_CURRENT_WEEK', currentWeek }),
    []
  );

  const markWorkoutComplete = useCallback(
    (workoutId: string, isCompleted: boolean) =>
      dispatch({ type: 'MARK_WORKOUT_COMPLETE', workoutId, isCompleted }),
    []
  );

  const value: ProgramDetailContextValue = {
    state,
    dispatch,
    program: state.program,
    selectedWeek,
    selectedWorkout: state.selectedWorkout,
    isLoading: state.isLoading,
    error: state.error,
    setProgram,
    clearProgram,
    selectWeek,
    selectWorkout,
    setLoading,
    setError,
    updateStatus,
    updateCurrentWeek,
    markWorkoutComplete,
  };

  return (
    <ProgramDetailContext.Provider value={value}>
      {children}
    </ProgramDetailContext.Provider>
  );
}

// Custom hook
export function useProgramDetail(): ProgramDetailContextValue {
  const context = useContext(ProgramDetailContext);
  if (!context) {
    throw new Error('useProgramDetail must be used within a ProgramDetailProvider');
  }
  return context;
}
