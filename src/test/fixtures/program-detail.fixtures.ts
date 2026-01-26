/**
 * Test fixtures for Program Detail View tests
 */

import type {
  TrainingProgram,
  ProgramWeek,
  ProgramWorkout,
  ProgramExercise,
} from '../../types/training-program';

// ============================================================================
// Mock Exercises
// ============================================================================

export const mockExercises: ProgramExercise[] = [
  {
    name: 'Barbell Squat',
    sets: 4,
    reps: '6-8',
    rest_seconds: 180,
    weight: 135,
    notes: 'Focus on depth',
  },
  {
    name: 'Romanian Deadlift',
    sets: 3,
    reps: '10-12',
    rest_seconds: 120,
    weight: 95,
  },
  {
    name: 'Leg Press',
    sets: 3,
    reps: '12-15',
    rest_seconds: 90,
  },
  {
    name: 'Leg Curl',
    sets: 3,
    reps: '12-15',
    rest_seconds: 60,
    tempo: '3-1-2-0',
  },
];

// ============================================================================
// Mock Workouts
// ============================================================================

export const mockWorkout: ProgramWorkout = {
  id: 'workout-1',
  week_id: 'week-1',
  day_of_week: 1, // Monday
  name: 'Lower Body Strength',
  workout_type: 'legs',
  target_duration_minutes: 60,
  exercises: mockExercises,
  is_completed: false,
};

export const mockCompletedWorkout: ProgramWorkout = {
  id: 'workout-2',
  week_id: 'week-1',
  day_of_week: 3, // Wednesday
  name: 'Upper Body Push',
  workout_type: 'push',
  target_duration_minutes: 45,
  exercises: [
    {
      name: 'Bench Press',
      sets: 4,
      reps: '6-8',
      rest_seconds: 180,
      weight: 155,
    },
    {
      name: 'Overhead Press',
      sets: 3,
      reps: '8-10',
      rest_seconds: 120,
      weight: 85,
    },
  ],
  is_completed: true,
  completed_at: '2024-01-15T10:30:00Z',
};

export const mockWorkoutWithNotes: ProgramWorkout = {
  id: 'workout-3',
  week_id: 'week-1',
  day_of_week: 5, // Friday
  name: 'Upper Body Pull',
  workout_type: 'pull',
  target_duration_minutes: 50,
  exercises: [
    {
      name: 'Pull-ups',
      sets: 4,
      reps: 'AMRAP',
      rest_seconds: 120,
      notes: 'Use band if needed',
    },
  ],
  is_completed: false,
  notes: 'Take extra rest if needed after heavy week',
};

// ============================================================================
// Mock Weeks
// ============================================================================

export const mockWeek1: ProgramWeek = {
  id: 'week-1',
  program_id: 'program-1',
  week_number: 1,
  focus: 'Hypertrophy',
  intensity_percentage: 70,
  volume_modifier: 1.0,
  is_deload: false,
  workouts: [mockWorkout, mockCompletedWorkout, mockWorkoutWithNotes],
};

export const mockWeek2: ProgramWeek = {
  id: 'week-2',
  program_id: 'program-1',
  week_number: 2,
  focus: 'Hypertrophy',
  intensity_percentage: 75,
  volume_modifier: 1.0,
  is_deload: false,
  workouts: [
    {
      id: 'workout-4',
      week_id: 'week-2',
      day_of_week: 1,
      name: 'Lower Body Strength',
      workout_type: 'legs',
      target_duration_minutes: 60,
      exercises: mockExercises,
      is_completed: false,
    },
  ],
};

export const mockDeloadWeek: ProgramWeek = {
  id: 'week-4',
  program_id: 'program-1',
  week_number: 4,
  focus: 'Recovery',
  intensity_percentage: 50,
  volume_modifier: 0.5,
  is_deload: true,
  workouts: [
    {
      id: 'workout-deload',
      week_id: 'week-4',
      day_of_week: 1,
      name: 'Light Full Body',
      workout_type: 'full_body',
      target_duration_minutes: 30,
      exercises: [
        {
          name: 'Goblet Squat',
          sets: 2,
          reps: '15',
          rest_seconds: 60,
          weight: 25,
        },
      ],
      is_completed: false,
    },
  ],
};

// ============================================================================
// Mock Programs
// ============================================================================

export const mockTrainingProgram: TrainingProgram = {
  id: 'program-1',
  user_id: 'user-123',
  name: 'Strength & Hypertrophy Program',
  goal: 'hypertrophy',
  periodization_model: 'linear',
  duration_weeks: 8,
  sessions_per_week: 3,
  experience_level: 'intermediate',
  equipment_available: ['barbell', 'dumbbells', 'cable_machine', 'bench'],
  time_per_session_minutes: 60,
  status: 'active',
  current_week: 2,
  weeks: [mockWeek1, mockWeek2, mockDeloadWeek],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  started_at: '2024-01-08T00:00:00Z',
};

export const mockDraftProgram: TrainingProgram = {
  ...mockTrainingProgram,
  id: 'program-draft',
  name: 'Draft Program',
  status: 'draft',
  current_week: 1,
  started_at: undefined,
};

export const mockPausedProgram: TrainingProgram = {
  ...mockTrainingProgram,
  id: 'program-paused',
  name: 'Paused Program',
  status: 'paused',
};

export const mockCompletedProgram: TrainingProgram = {
  ...mockTrainingProgram,
  id: 'program-completed',
  name: 'Completed Program',
  status: 'completed',
  current_week: 8,
  completed_at: '2024-03-01T00:00:00Z',
};

export const mockArchivedProgram: TrainingProgram = {
  ...mockTrainingProgram,
  id: 'program-archived',
  name: 'Archived Program',
  status: 'archived',
};

// ============================================================================
// Empty States
// ============================================================================

export const mockEmptyWeek: ProgramWeek = {
  id: 'empty-week',
  program_id: 'program-1',
  week_number: 3,
  focus: 'Rest',
  intensity_percentage: 0,
  volume_modifier: 0,
  is_deload: false,
  workouts: [],
};

export const mockProgramNoWeeks: TrainingProgram = {
  ...mockTrainingProgram,
  id: 'program-no-weeks',
  name: 'Program Without Weeks',
  weeks: [],
};

// ============================================================================
// API Response Mocks
// ============================================================================

export const mockApiSuccessResponse = {
  success: true,
  program: mockTrainingProgram,
};

export const mockApiErrorResponse = {
  success: false,
  message: 'Program not found',
};

export const mockStatusUpdateResponse = {
  success: true,
  message: 'Status updated successfully',
};

export const mockWorkoutCompleteResponse = {
  success: true,
  message: 'Workout marked as complete',
};

// ============================================================================
// Test IDs
// ============================================================================

export const TEST_USER_ID = 'user-123';
export const TEST_PROGRAM_ID = 'program-1';
export const TEST_WORKOUT_ID = 'workout-1';
