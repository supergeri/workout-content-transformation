// LocalStorage utilities for persistence (until Supabase is connected)

import { WorkoutStructure } from '../types/workout';

export interface SavedWorkout {
  id: string;
  workout: WorkoutStructure;
  device: string;
  createdAt: string;
  sources?: string[];
}

export const storage = {
  // User
  getUser: () => {
    const user = localStorage.getItem('amakaflow_user');
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user: any) => {
    localStorage.setItem('amakaflow_user', JSON.stringify(user));
  },
  
  clearUser: () => {
    localStorage.removeItem('amakaflow_user');
  },

  // Workouts
  getWorkouts: (): SavedWorkout[] => {
    const workouts = localStorage.getItem('amakaflow_workouts');
    return workouts ? JSON.parse(workouts) : [];
  },
  
  saveWorkout: (workout: SavedWorkout) => {
    const workouts = storage.getWorkouts();
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    
    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.push(workout);
    }
    
    localStorage.setItem('amakaflow_workouts', JSON.stringify(workouts));
  },
  
  deleteWorkout: (id: string) => {
    const workouts = storage.getWorkouts().filter(w => w.id !== id);
    localStorage.setItem('amakaflow_workouts', JSON.stringify(workouts));
  },

  // Stats
  incrementWorkoutCount: () => {
    const count = storage.getWorkoutCount();
    localStorage.setItem('amakaflow_workout_count', String(count + 1));
  },
  
  getWorkoutCount: (): number => {
    return parseInt(localStorage.getItem('amakaflow_workout_count') || '0');
  }
};