import { WorkoutStructure, ExportFormats } from '../types/workout';
import { DeviceId } from './devices';

export type WorkoutHistoryItem = {
  id: string;
  workout: WorkoutStructure;
  sources: string[];
  device: DeviceId;
  exports?: ExportFormats;
  createdAt: string;
  updatedAt: string;
  syncedToStrava?: boolean;
  stravaActivityId?: string;
};

const HISTORY_KEY = 'amakaflow_workout_history';
const MAX_HISTORY_ITEMS = 50;

export function saveWorkoutToHistory(data: {
  workout: WorkoutStructure;
  sources: string[];
  device: DeviceId;
  exports?: ExportFormats;
}): WorkoutHistoryItem {
  const history = getWorkoutHistory();
  
  const item: WorkoutHistoryItem = {
    id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    workout: data.workout,
    sources: data.sources,
    device: data.device,
    exports: data.exports,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add to beginning of array
  history.unshift(item);
  
  // Keep only the latest MAX_HISTORY_ITEMS
  const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
  
  // Save to localStorage
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save workout history:', error);
  }
  
  return item;
}

export function getWorkoutHistory(): WorkoutHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Failed to load workout history:', error);
    return [];
  }
}

export function deleteWorkoutFromHistory(id: string): void {
  const history = getWorkoutHistory();
  const filtered = history.filter(item => item.id !== id);
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete workout from history:', error);
  }
}

export function clearWorkoutHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear workout history:', error);
  }
}

export function updateStravaSyncStatus(workoutId: string, stravaActivityId: string): void {
  const history = getWorkoutHistory();
  const updated = history.map(item => 
    item.id === workoutId 
      ? { ...item, syncedToStrava: true, stravaActivityId, updatedAt: new Date().toISOString() }
      : item
  );
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update Strava sync status:', error);
  }
}

export function getWorkoutStats(historyParam?: WorkoutHistoryItem[]) {
  const history = historyParam || getWorkoutHistory();
  
  const totalWorkouts = history.length;
  const thisWeek = history.filter(item => {
    if (!item.createdAt) return false;
    try {
      const date = new Date(item.createdAt);
      if (isNaN(date.getTime())) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    } catch {
      return false;
    }
  }).length;
  
  const deviceCounts = history.reduce((acc, item) => {
    acc[item.device] = (acc[item.device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const avgExercisesPerWorkout = history.length > 0
    ? history.reduce((sum, item) => {
        const count = item.workout.blocks.reduce((blockSum, block) => {
          // Handle both old format (exercises directly on block) and new format (exercises in supersets)
          if (block.supersets && block.supersets.length > 0) {
            return blockSum + block.supersets.reduce((ssSum, ss) => ssSum + (ss.exercises?.length || 0), 0);
          } else if (block.exercises) {
            return blockSum + (block.exercises.length || 0);
          }
          return blockSum;
        }, 0);
        return sum + count;
      }, 0) / history.length
    : 0;
  
  return {
    totalWorkouts,
    thisWeek,
    deviceCounts,
    avgExercisesPerWorkout: Math.round(avgExercisesPerWorkout)
  };
}