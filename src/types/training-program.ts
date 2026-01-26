// Training Program Types - Generated Programs from AI
// These differ from WorkoutProgram (manual collections of workouts)

import type { ProgramGoal, ExperienceLevel } from './program-wizard';

export type PeriodizationModel = 'linear' | 'undulating' | 'block' | 'conjugate';

export type ProgramStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface ProgramExercise {
  name: string;
  sets: number;
  reps: string; // Can be "8-12" or "8" or "AMRAP"
  rest_seconds: number;
  weight?: number;
  notes?: string;
  tempo?: string; // e.g., "3-1-2-0"
  rpe?: number; // Rate of Perceived Exertion 1-10
}

export interface ProgramWorkout {
  id: string;
  week_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  name: string;
  workout_type: string;
  target_duration_minutes?: number;
  exercises: ProgramExercise[];
  is_completed?: boolean;
  completed_at?: string;
  notes?: string;
}

export interface ProgramWeek {
  id: string;
  program_id: string;
  week_number: number; // 1-indexed
  focus?: string; // e.g., "Hypertrophy", "Strength", "Deload"
  intensity_percentage?: number; // 0-100
  volume_modifier: number; // Multiplier for volume, e.g., 0.5 for deload
  is_deload: boolean;
  workouts: ProgramWorkout[];
}

export interface TrainingProgram {
  id: string;
  user_id: string;
  name: string;
  goal: ProgramGoal;
  periodization_model: PeriodizationModel;
  duration_weeks: number;
  sessions_per_week: number;
  experience_level: ExperienceLevel;
  equipment_available: string[];
  time_per_session_minutes: number;
  status: ProgramStatus;
  current_week: number; // 1-indexed, current week user is on
  weeks: ProgramWeek[];
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
}

// Display labels
export const PERIODIZATION_LABELS: Record<PeriodizationModel, { label: string; description: string }> = {
  linear: {
    label: 'Linear',
    description: 'Gradually increase intensity week over week',
  },
  undulating: {
    label: 'Undulating',
    description: 'Vary intensity within each week',
  },
  block: {
    label: 'Block',
    description: 'Focus on specific qualities for 3-4 week blocks',
  },
  conjugate: {
    label: 'Conjugate',
    description: 'Rotate exercises while maintaining intensity',
  },
};

export const STATUS_LABELS: Record<ProgramStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600' },
};

export const WORKOUT_TYPE_COLORS: Record<string, string> = {
  push: 'border-l-red-500',
  pull: 'border-l-blue-500',
  legs: 'border-l-green-500',
  upper: 'border-l-purple-500',
  lower: 'border-l-orange-500',
  full_body: 'border-l-pink-500',
  cardio: 'border-l-cyan-500',
  recovery: 'border-l-gray-400',
  default: 'border-l-slate-400',
};

// Day labels for calendar display
export const DAY_LABELS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_LABELS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
