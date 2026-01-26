/**
 * Training Program API Client
 *
 * Client for communicating with the calendar-api for training program management.
 * Handles fetching, updating, and deleting AI-generated training programs.
 */

import { authenticatedFetch } from './authenticated-fetch';
import { API_URLS } from './config';
import type { TrainingProgram, ProgramStatus, ProgramWorkout } from '../types/training-program';

const CALENDAR_API_BASE_URL = API_URLS.CALENDAR;

async function trainingProgramApiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${CALENDAR_API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await authenticatedFetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    const errorMessage = error.detail
      ? (Array.isArray(error.detail)
        ? error.detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
        : error.detail)
      : (error.message || `Training Program API error: ${response.status} ${response.statusText}`);
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get a training program by ID with all weeks and workouts
 */
export async function getTrainingProgram(
  programId: string,
  userId: string
): Promise<TrainingProgram | null> {
  try {
    const queryParams = new URLSearchParams({ user_id: userId });
    const response = await trainingProgramApiCall<{
      success: boolean;
      program?: TrainingProgram;
      message?: string;
    }>(`/training-programs/${programId}?${queryParams.toString()}`);

    return response.success ? response.program || null : null;
  } catch (err) {
    console.error('[getTrainingProgram] Error:', err);
    return null;
  }
}

/**
 * Get all training programs for a user
 */
export async function getTrainingPrograms(
  userId: string,
  includeArchived: boolean = false
): Promise<TrainingProgram[]> {
  try {
    const queryParams = new URLSearchParams({
      user_id: userId,
      include_archived: includeArchived.toString(),
    });

    const response = await trainingProgramApiCall<{
      success: boolean;
      programs: TrainingProgram[];
      count: number;
    }>(`/training-programs?${queryParams.toString()}`);

    return response.programs || [];
  } catch (err) {
    console.error('[getTrainingPrograms] Error:', err);
    return [];
  }
}

/**
 * Update program status (activate, pause, archive, etc.)
 */
export async function updateProgramStatus(
  programId: string,
  userId: string,
  status: ProgramStatus
): Promise<boolean> {
  try {
    const response = await trainingProgramApiCall<{
      success: boolean;
      message: string;
    }>(`/training-programs/${programId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId, status }),
    });

    return response.success;
  } catch (err) {
    console.error('[updateProgramStatus] Error:', err);
    return false;
  }
}

/**
 * Update current week progress
 */
export async function updateProgramProgress(
  programId: string,
  userId: string,
  currentWeek: number
): Promise<boolean> {
  try {
    const response = await trainingProgramApiCall<{
      success: boolean;
      message: string;
    }>(`/training-programs/${programId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId, current_week: currentWeek }),
    });

    return response.success;
  } catch (err) {
    console.error('[updateProgramProgress] Error:', err);
    return false;
  }
}

/**
 * Delete a training program
 */
export async function deleteTrainingProgram(
  programId: string,
  userId: string
): Promise<boolean> {
  try {
    const queryParams = new URLSearchParams({ user_id: userId });
    const response = await trainingProgramApiCall<{
      success: boolean;
      message: string;
    }>(`/training-programs/${programId}?${queryParams.toString()}`, {
      method: 'DELETE',
    });

    return response.success;
  } catch (err) {
    console.error('[deleteTrainingProgram] Error:', err);
    return false;
  }
}

/**
 * Mark a workout as complete
 */
export async function markWorkoutComplete(
  workoutId: string,
  userId: string,
  isCompleted: boolean = true
): Promise<boolean> {
  try {
    const response = await trainingProgramApiCall<{
      success: boolean;
      message: string;
    }>(`/training-programs/workouts/${workoutId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId, is_completed: isCompleted }),
    });

    return response.success;
  } catch (err) {
    console.error('[markWorkoutComplete] Error:', err);
    return false;
  }
}

/**
 * Get a single workout by ID
 */
export async function getProgramWorkout(
  workoutId: string,
  userId: string
): Promise<ProgramWorkout | null> {
  try {
    const queryParams = new URLSearchParams({ user_id: userId });
    const response = await trainingProgramApiCall<{
      success: boolean;
      workout?: ProgramWorkout;
      message?: string;
    }>(`/training-programs/workouts/${workoutId}?${queryParams.toString()}`);

    return response.success ? response.workout || null : null;
  } catch (err) {
    console.error('[getProgramWorkout] Error:', err);
    return null;
  }
}

/**
 * Check if the training program API is available
 */
export async function checkTrainingProgramApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${CALENDAR_API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
