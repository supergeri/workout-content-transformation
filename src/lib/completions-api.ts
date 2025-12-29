/**
 * Workout Completions API (AMA-196)
 *
 * Client functions for fetching workout completion records from Apple Watch/Garmin.
 */

import { authenticatedFetch } from './authenticated-fetch';
import { API_URLS } from './config';

// Use centralized API config
const MAPPER_API_BASE_URL = API_URLS.MAPPER;

// Types for workout completions
export interface WorkoutCompletion {
  id: string;
  workoutName: string;
  startedAt: string;
  durationSeconds: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  activeCalories?: number;
  source: string;
}

export interface WorkoutCompletionsResponse {
  completions: WorkoutCompletion[];
  total: number;
}

/**
 * Fetch workout completions for the authenticated user.
 *
 * Returns a paginated list of workout completion records captured from
 * Apple Watch, Garmin, or manual entry.
 *
 * @param limit - Maximum number of completions to return (default 50)
 * @param offset - Number of completions to skip for pagination (default 0)
 */
export async function fetchWorkoutCompletions(
  limit: number = 50,
  offset: number = 0
): Promise<WorkoutCompletionsResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await authenticatedFetch(
    `${MAPPER_API_BASE_URL}/workouts/completions?${params}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `Failed to fetch completions: ${response.status}`);
  }

  const data = await response.json();

  // Transform snake_case from backend to camelCase for frontend
  return {
    completions: (data.completions || []).map((c: any) => ({
      id: c.id,
      workoutName: c.workout_name,
      startedAt: c.started_at,
      durationSeconds: c.duration_seconds,
      avgHeartRate: c.avg_heart_rate,
      maxHeartRate: c.max_heart_rate,
      activeCalories: c.active_calories,
      source: c.source,
    })),
    total: data.total || 0,
  };
}
