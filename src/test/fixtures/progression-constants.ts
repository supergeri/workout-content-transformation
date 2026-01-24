/**
 * Shared constants for progression test fixtures.
 *
 * These constants are used by both unit test fixtures and E2E fixtures
 * to ensure consistency across test types.
 */

// =============================================================================
// Exercise IDs
// =============================================================================

/**
 * Canonical exercise IDs used across all tests.
 * These must match the exercises table in mapper-api.
 */
export const EXERCISE_IDS = {
  BENCH_PRESS: 'barbell-bench-press',
  SQUAT: 'barbell-squat',
  DEADLIFT: 'deadlift',
  PULL_UP: 'pull-up',
} as const;

/**
 * Exercise ID that does not exist in the database.
 * Used for 404 error testing.
 */
export const UNKNOWN_EXERCISE_ID = 'nonexistent-exercise-xyz';

/**
 * Invalid exercise ID format (uppercase not allowed).
 * Used for 400 validation error testing.
 */
export const INVALID_EXERCISE_ID = 'INVALID_UPPERCASE';

// =============================================================================
// Test User
// =============================================================================

/**
 * Test user ID for E2E and contract tests.
 * This should match the user configured in CI and seeded data.
 */
export const TEST_USER_ID = 'e2e-test-user-001';

// =============================================================================
// Weight Units
// =============================================================================

export const WEIGHT_UNITS = {
  LBS: 'lbs',
  KG: 'kg',
} as const;

export const DEFAULT_WEIGHT_UNIT = WEIGHT_UNITS.LBS;

// =============================================================================
// Record Types
// =============================================================================

export const RECORD_TYPES = {
  ONE_RM: '1rm',
  MAX_WEIGHT: 'max_weight',
  MAX_REPS: 'max_reps',
} as const;

// =============================================================================
// Granularity Options
// =============================================================================

export const GRANULARITY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

// =============================================================================
// 1RM Formulas
// =============================================================================

export const ONE_RM_FORMULAS = {
  BRZYCKI: 'brzycki',
  EPLEY: 'epley',
} as const;

export const DEFAULT_ONE_RM_FORMULA = ONE_RM_FORMULAS.BRZYCKI;
