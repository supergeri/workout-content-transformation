/**
 * ProgramDetailContext Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ProgramDetailProvider, useProgramDetail } from '../ProgramDetailContext';
import {
  mockTrainingProgram,
  mockWorkout,
} from '../../test/fixtures/program-detail.fixtures';

// Wrapper component for tests
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProgramDetailProvider>{children}</ProgramDetailProvider>
);

describe('ProgramDetailContext', () => {
  describe('Initial State', () => {
    it('should have null program initially', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });
      expect(result.current.program).toBeNull();
    });

    it('should have default week number of 1', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });
      expect(result.current.state.selectedWeekNumber).toBe(1);
    });

    it('should have null selected workout initially', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });
      expect(result.current.selectedWorkout).toBeNull();
    });

    it('should not be loading initially', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });
      expect(result.current.isLoading).toBe(false);
    });

    it('should have no error initially', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });
      expect(result.current.error).toBeNull();
    });
  });

  describe('setProgram', () => {
    it('should set program', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
      });

      expect(result.current.program).toEqual(mockTrainingProgram);
    });

    it('should set selectedWeekNumber to program current_week', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
      });

      expect(result.current.state.selectedWeekNumber).toBe(mockTrainingProgram.current_week);
    });

    it('should clear error when setting program', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setError('Some error');
        result.current.setProgram(mockTrainingProgram);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('clearProgram', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
        result.current.selectWeek(3);
        result.current.selectWorkout(mockWorkout);
        result.current.clearProgram();
      });

      expect(result.current.program).toBeNull();
      expect(result.current.state.selectedWeekNumber).toBe(1);
      expect(result.current.selectedWorkout).toBeNull();
    });
  });

  describe('selectWeek', () => {
    it('should update selected week number', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
        result.current.selectWeek(3);
      });

      expect(result.current.state.selectedWeekNumber).toBe(3);
    });

    it('should clear selected workout when changing weeks', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
        result.current.selectWorkout(mockWorkout);
        result.current.selectWeek(3);
      });

      expect(result.current.selectedWorkout).toBeNull();
    });
  });

  describe('selectWorkout', () => {
    it('should set selected workout', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.selectWorkout(mockWorkout);
      });

      expect(result.current.selectedWorkout).toEqual(mockWorkout);
    });

    it('should clear selected workout when set to null', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.selectWorkout(mockWorkout);
        result.current.selectWorkout(null);
      });

      expect(result.current.selectedWorkout).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setError('Something went wrong');
      });

      expect(result.current.error).toBe('Something went wrong');
    });

    it('should clear error when set to null', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setError('Something went wrong');
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update program status', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
        result.current.updateStatus('paused');
      });

      expect(result.current.program?.status).toBe('paused');
    });

    it('should not update if no program is set', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.updateStatus('paused');
      });

      expect(result.current.program).toBeNull();
    });
  });

  describe('updateCurrentWeek', () => {
    it('should update current week', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
        result.current.updateCurrentWeek(5);
      });

      expect(result.current.program?.current_week).toBe(5);
    });

    it('should not update if no program is set', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.updateCurrentWeek(5);
      });

      expect(result.current.program).toBeNull();
    });
  });

  describe('markWorkoutComplete', () => {
    it('should mark workout as completed', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
        result.current.markWorkoutComplete(mockWorkout.id, true);
      });

      // Find the workout in the program
      const week = result.current.program?.weeks.find(
        (w) => w.week_number === 1
      );
      const workout = week?.workouts.find((w) => w.id === mockWorkout.id);
      expect(workout?.is_completed).toBe(true);
      expect(workout?.completed_at).toBeDefined();
    });

    it('should mark workout as incomplete', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
        result.current.markWorkoutComplete(mockWorkout.id, true);
        result.current.markWorkoutComplete(mockWorkout.id, false);
      });

      const week = result.current.program?.weeks.find(
        (w) => w.week_number === 1
      );
      const workout = week?.workouts.find((w) => w.id === mockWorkout.id);
      expect(workout?.is_completed).toBe(false);
    });

    it('should update selected workout if it matches', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
        result.current.selectWorkout(mockWorkout);
        result.current.markWorkoutComplete(mockWorkout.id, true);
      });

      expect(result.current.selectedWorkout?.is_completed).toBe(true);
    });
  });

  describe('selectedWeek computed property', () => {
    it('should return correct week based on selectedWeekNumber', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
        result.current.selectWeek(1);
      });

      expect(result.current.selectedWeek?.week_number).toBe(1);
      expect(result.current.selectedWeek?.focus).toBe('Hypertrophy');
    });

    it('should return null if program is not set', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      expect(result.current.selectedWeek).toBeNull();
    });

    it('should return null if week not found', () => {
      const { result } = renderHook(() => useProgramDetail(), { wrapper });

      act(() => {
        result.current.setProgram(mockTrainingProgram);
        result.current.selectWeek(99); // Non-existent week
      });

      expect(result.current.selectedWeek).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when used outside provider', () => {
      // This should throw an error
      expect(() => {
        renderHook(() => useProgramDetail());
      }).toThrow('useProgramDetail must be used within a ProgramDetailProvider');
    });
  });
});
