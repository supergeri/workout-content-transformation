/**
 * Shared test fixtures for Volume Analytics components.
 *
 * Part of AMA-483: Volume Analytics Dashboard
 */

import { vi } from 'vitest';
import type {
  VolumeDataPoint,
  VolumeSummary,
  VolumeAnalytics,
  VolumeGranularity,
} from '../../../../types/progression';

// =============================================================================
// Volume Data Point Fixtures
// =============================================================================

export const MOCK_VOLUME_DATA_POINTS: VolumeDataPoint[] = [
  { period: '2025-01-13', muscleGroup: 'chest', totalVolume: 12500, totalSets: 12, totalReps: 96 },
  { period: '2025-01-13', muscleGroup: 'triceps', totalVolume: 5000, totalSets: 6, totalReps: 60 },
  { period: '2025-01-14', muscleGroup: 'lats', totalVolume: 15000, totalSets: 15, totalReps: 120 },
  { period: '2025-01-14', muscleGroup: 'biceps', totalVolume: 4000, totalSets: 6, totalReps: 48 },
  { period: '2025-01-15', muscleGroup: 'quadriceps', totalVolume: 20000, totalSets: 16, totalReps: 100 },
  { period: '2025-01-15', muscleGroup: 'hamstrings', totalVolume: 8000, totalSets: 8, totalReps: 64 },
  { period: '2025-01-16', muscleGroup: 'shoulders', totalVolume: 7500, totalSets: 9, totalReps: 72 },
];

export const MOCK_VOLUME_DATA_EMPTY: VolumeDataPoint[] = [];

// =============================================================================
// Volume Summary Fixtures
// =============================================================================

export const MOCK_VOLUME_SUMMARY: VolumeSummary = {
  totalVolume: 72000,
  totalSets: 72,
  totalReps: 560,
  muscleGroupBreakdown: {
    chest: 12500,
    triceps: 5000,
    lats: 15000,
    biceps: 4000,
    quadriceps: 20000,
    hamstrings: 8000,
    shoulders: 7500,
  },
};

export const MOCK_VOLUME_SUMMARY_PREVIOUS: VolumeSummary = {
  totalVolume: 65000,
  totalSets: 65,
  totalReps: 520,
  muscleGroupBreakdown: {
    chest: 11000,
    triceps: 4500,
    lats: 14000,
    biceps: 3500,
    quadriceps: 18000,
    hamstrings: 7000,
    shoulders: 7000,
  },
};

export const MOCK_VOLUME_SUMMARY_EMPTY: VolumeSummary = {
  totalVolume: 0,
  totalSets: 0,
  totalReps: 0,
  muscleGroupBreakdown: {},
};

// =============================================================================
// Full Volume Analytics Fixtures
// =============================================================================

export const MOCK_VOLUME_ANALYTICS: VolumeAnalytics = {
  data: MOCK_VOLUME_DATA_POINTS,
  summary: MOCK_VOLUME_SUMMARY,
  period: {
    startDate: '2025-01-10',
    endDate: '2025-01-17',
  },
  granularity: 'daily',
};

export const MOCK_VOLUME_ANALYTICS_PREVIOUS: VolumeAnalytics = {
  data: [
    { period: '2025-01-03', muscleGroup: 'chest', totalVolume: 11000, totalSets: 11, totalReps: 88 },
    { period: '2025-01-03', muscleGroup: 'triceps', totalVolume: 4500, totalSets: 5, totalReps: 50 },
  ],
  summary: MOCK_VOLUME_SUMMARY_PREVIOUS,
  period: {
    startDate: '2025-01-03',
    endDate: '2025-01-10',
  },
  granularity: 'daily',
};

export const MOCK_VOLUME_ANALYTICS_EMPTY: VolumeAnalytics = {
  data: [],
  summary: MOCK_VOLUME_SUMMARY_EMPTY,
  period: {
    startDate: '2025-01-10',
    endDate: '2025-01-17',
  },
  granularity: 'daily',
};

// =============================================================================
// Balance Test Fixtures
// =============================================================================

/**
 * Balanced push/pull ratio (1:1)
 */
export const MOCK_BALANCED_BREAKDOWN: Record<string, number> = {
  chest: 10000,    // push
  triceps: 5000,   // push
  lats: 10000,     // pull
  biceps: 5000,    // pull
};

/**
 * Imbalanced push/pull ratio (heavy push)
 */
export const MOCK_PUSH_HEAVY_BREAKDOWN: Record<string, number> = {
  chest: 20000,    // push
  triceps: 10000,  // push
  lats: 5000,      // pull
  biceps: 2500,    // pull
};

/**
 * Balanced upper/lower ratio (1:1)
 */
export const MOCK_UPPER_LOWER_BALANCED: Record<string, number> = {
  chest: 10000,        // upper
  lats: 10000,         // upper
  quadriceps: 15000,   // lower
  hamstrings: 5000,    // lower
};

/**
 * Imbalanced upper/lower ratio (heavy upper)
 */
export const MOCK_UPPER_HEAVY_BREAKDOWN: Record<string, number> = {
  chest: 15000,      // upper
  shoulders: 10000,  // upper
  lats: 10000,       // upper
  quadriceps: 5000,  // lower
};

// =============================================================================
// Hook Return Value Factories
// =============================================================================

export function createVolumeAnalyticsReturn(
  overrides: Partial<{
    data: VolumeAnalytics | null;
    isLoading: boolean;
    error: Error | null;
  }> = {}
) {
  return {
    data: overrides.data ?? MOCK_VOLUME_ANALYTICS,
    isLoading: overrides.isLoading ?? false,
    error: overrides.error ?? null,
    refetch: vi.fn(),
  };
}

export function createEmptyVolumeAnalyticsReturn() {
  return createVolumeAnalyticsReturn({
    data: MOCK_VOLUME_ANALYTICS_EMPTY,
  });
}

export function createLoadingVolumeAnalyticsReturn() {
  return createVolumeAnalyticsReturn({
    data: null,
    isLoading: true,
  });
}

export function createErrorVolumeAnalyticsReturn(message: string = 'Network error') {
  return createVolumeAnalyticsReturn({
    data: null,
    error: new Error(message),
  });
}
