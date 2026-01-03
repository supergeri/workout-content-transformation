/**
 * Account management API functions (AMA-200)
 *
 * Communicates with mapper-api for account operations.
 */

import { authenticatedFetch } from './authenticated-fetch';

const MAPPER_API_URL = import.meta.env.VITE_MAPPER_API_URL || 'http://localhost:8002';

// Types
export interface DeletionPreview {
  workouts: number;
  workout_completions: number;
  programs: number;
  tags: number;
  follow_along_workouts: number;
  paired_devices: number;
  voice_settings: boolean;
  voice_corrections: number;
  strava_connection: boolean;
  garmin_connection: boolean;
  total_items: number;
  has_ios_devices: boolean;
  has_external_connections: boolean;
}

/**
 * Get a preview of all user data that will be deleted when account is deleted.
 */
export async function getDeletionPreview(): Promise<DeletionPreview> {
  const response = await authenticatedFetch(`${MAPPER_API_URL}/account/deletion-preview`);

  if (!response.ok) {
    throw new Error(`Failed to fetch deletion preview: ${response.statusText}`);
  }

  return response.json();
}
