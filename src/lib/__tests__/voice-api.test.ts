/**
 * Unit tests for voice-api transcribeAudio function (AMA-435).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transcribeAudio } from '../voice-api';

// Mock authenticatedFetch
vi.mock('../authenticated-fetch', () => ({
  authenticatedFetch: vi.fn(),
}));

import { authenticatedFetch } from '../authenticated-fetch';

describe('transcribeAudio', () => {
  const mockAuthenticatedFetch = authenticatedFetch as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends audio as base64 to transcribe endpoint', async () => {
    const audioBlob = new Blob(['test audio data'], { type: 'audio/webm' });

    mockAuthenticatedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        text: 'hello world',
        confidence: 0.95,
        provider: 'deepgram',
      }),
    });

    await transcribeAudio(audioBlob);

    expect(mockAuthenticatedFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockAuthenticatedFetch.mock.calls[0];

    expect(url).toContain('/voice/transcribe');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(options.body);
    expect(body).toHaveProperty('audio_base64');
    expect(body.provider).toBe('deepgram');
    expect(body.language).toBe('en-US');
  });

  it('uses custom language when provided', async () => {
    const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });

    mockAuthenticatedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        text: 'test',
        confidence: 0.9,
        provider: 'deepgram',
      }),
    });

    await transcribeAudio(audioBlob, { language: 'en-GB' });

    const [, options] = mockAuthenticatedFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.language).toBe('en-GB');
  });

  it('includes keywords when provided', async () => {
    const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });
    const keywords = ['squat', 'deadlift', 'bench press'];

    mockAuthenticatedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        text: 'do 3 sets of squats',
        confidence: 0.92,
        provider: 'deepgram',
      }),
    });

    await transcribeAudio(audioBlob, { keywords });

    const [, options] = mockAuthenticatedFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.keywords).toEqual(keywords);
  });

  it('returns transcription result on success', async () => {
    const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });
    const expectedResult = {
      success: true,
      text: 'do 5 sets of 10 reps',
      confidence: 0.95,
      provider: 'deepgram',
      duration_seconds: 3.5,
      corrections_applied: 2,
    };

    mockAuthenticatedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(expectedResult),
    });

    const result = await transcribeAudio(audioBlob);

    expect(result).toEqual(expectedResult);
  });

  it('throws error on API failure', async () => {
    const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });

    mockAuthenticatedFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ detail: 'Transcription service unavailable' }),
    });

    await expect(transcribeAudio(audioBlob)).rejects.toThrow('Transcription service unavailable');
  });

  it('throws generic error when API fails without detail', async () => {
    const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });

    mockAuthenticatedFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    await expect(transcribeAudio(audioBlob)).rejects.toThrow('Transcription failed: Bad Gateway');
  });
});
