/**
 * Test fixtures for voice input E2E tests.
 *
 * These fixtures provide mock API responses for the /voice/transcribe endpoint.
 */

export const mockTranscribeSuccess = {
  success: true,
  text: '3 sets of 10 reps bench press',
  confidence: 0.95,
  provider: 'deepgram',
  language: 'en-US',
  duration_seconds: 2.5,
  corrections_applied: 0,
};

export const mockTranscribeHelloWorld = {
  success: true,
  text: 'hello world',
  confidence: 0.98,
  provider: 'deepgram',
  language: 'en-US',
  duration_seconds: 1.2,
  corrections_applied: 0,
};

export const mockTranscribeLowConfidence = {
  success: true,
  text: 'three sets of ten reps bench press',
  confidence: 0.35, // Below 0.5 threshold - triggers fallback
  provider: 'deepgram',
  language: 'en-US',
  duration_seconds: 2.5,
  corrections_applied: 0,
};

export const mockTranscribeWithCorrections = {
  success: true,
  text: 'Romanian deadlift', // Corrected from "Romanian dead lift"
  confidence: 0.92,
  provider: 'deepgram',
  language: 'en-US',
  duration_seconds: 1.8,
  corrections_applied: 1,
};

export const mockTranscribeFitnessVocab = {
  success: true,
  text: 'superset of dumbbell curls and tricep pushdowns with 60 second rest',
  confidence: 0.94,
  provider: 'deepgram',
  language: 'en-US',
  duration_seconds: 4.2,
  corrections_applied: 0,
};

// Error responses

export const mockTranscribeServiceError = {
  detail: 'Transcription service temporarily unavailable',
};

export const mockTranscribeNetworkError = {
  detail: 'Failed to connect to transcription service',
};

export const mockTranscribeAuthError = {
  detail: 'Authentication required',
};

// Helper to create custom responses
export function createTranscribeResponse(overrides: Partial<typeof mockTranscribeSuccess>) {
  return {
    ...mockTranscribeSuccess,
    ...overrides,
  };
}
