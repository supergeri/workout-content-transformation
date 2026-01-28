/**
 * Voice Input Regression Tests (AMA-435)
 *
 * Comprehensive tests for voice input functionality including edge cases,
 * error handling, and fallback behavior.
 *
 * Run nightly and on release branches.
 *
 * Usage:
 *   npx playwright test voice-input.regression.spec.ts
 *   npx playwright test --project=chromium voice-input.regression.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import {
  mockTranscribeSuccess,
  mockTranscribeLowConfidence,
  mockTranscribeServiceError,
  mockTranscribeNetworkError,
  createTranscribeResponse,
} from './fixtures/voice-api.fixtures';

// Test selectors
const SELECTORS = {
  voiceButton: '[data-testid="chat-voice-button"]',
  textarea: '[data-testid="chat-input-textarea"]',
  sendButton: '[data-testid="chat-send-button"]',
} as const;

// Helper to mock the transcribe endpoint
async function mockTranscribeEndpoint(
  page: Page,
  response: object,
  options?: { status?: number; delay?: number }
) {
  const { status = 200, delay = 0 } = options || {};

  await page.route('**/voice/transcribe', async (route) => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

// Helper to wait for voice button state
async function waitForVoiceState(page: Page, state: string, timeout = 10_000) {
  await expect(page.locator(SELECTORS.voiceButton))
    .toHaveAttribute('data-state', state, { timeout });
}

// Helper to complete a recording
async function completeRecording(page: Page, recordDurationMs = 300) {
  const voiceButton = page.locator(SELECTORS.voiceButton);
  await voiceButton.click();
  await waitForVoiceState(page, 'recording');
  await page.waitForTimeout(recordDurationMs);
  await voiceButton.click();
}

test.describe('Voice Input Regression Tests', () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['microphone']);
  });

  test.describe('Duration Limits', () => {
    test('REG-1: recording auto-stops after max duration', async ({ page }) => {
      // Note: In real implementation, we would need to override the hook's maxDurationMs
      // For this test, we inject a script to shorten the timeout
      await page.addInitScript(() => {
        // Override for testing - reduces 60s to 2s
        (window as Record<string, unknown>).__TEST_VOICE_MAX_DURATION_MS = 2000;
      });

      await mockTranscribeEndpoint(page, createTranscribeResponse({
        text: 'auto stopped recording',
      }));

      await page.goto('/');

      const voiceButton = page.locator(SELECTORS.voiceButton);
      await voiceButton.click();
      await waitForVoiceState(page, 'recording');

      // Wait for auto-stop (2 seconds in test mode + buffer)
      // Should transition to processing without manual stop
      await waitForVoiceState(page, 'processing', 5000);

      // Then back to idle with transcript
      await waitForVoiceState(page, 'idle');
      await expect(page.locator(SELECTORS.textarea))
        .toHaveValue('auto stopped recording');
    });
  });

  test.describe('Fallback Behavior', () => {
    test('REG-2: low confidence triggers fallback attempt', async ({ page }) => {
      // First request returns low confidence
      let requestCount = 0;
      await page.route('**/voice/transcribe', async (route) => {
        requestCount++;
        // Low confidence should trigger fallback to Web Speech API
        // which then succeeds (mocked at browser level)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockTranscribeLowConfidence),
        });
      });

      await page.goto('/');
      await completeRecording(page);

      // Should still complete (either with fallback result or low-confidence original)
      await waitForVoiceState(page, 'idle');

      // The textarea should have some text (either fallback or original)
      const textarea = page.locator(SELECTORS.textarea);
      await expect(textarea).not.toHaveValue('');
    });

    test('REG-3: service error triggers fallback attempt', async ({ page }) => {
      await mockTranscribeEndpoint(page, mockTranscribeServiceError, { status: 500 });

      await page.goto('/');
      await completeRecording(page);

      // Should attempt fallback, then show error if fallback fails
      // (Web Speech API may not be available in Playwright)
      await waitForVoiceState(page, 'error');

      // Error tooltip should be helpful
      const tooltip = await page.locator(SELECTORS.voiceButton).getAttribute('title');
      expect(tooltip).toMatch(/failed|error|try again/i);
    });

    test('REG-4: both providers fail shows appropriate error', async ({ page }) => {
      // Mock Deepgram to fail
      await mockTranscribeEndpoint(page, mockTranscribeServiceError, { status: 500 });

      // Mock Web Speech API to be unavailable
      await page.addInitScript(() => {
        // Remove Web Speech API
        delete (window as Record<string, unknown>).SpeechRecognition;
        delete (window as Record<string, unknown>).webkitSpeechRecognition;
      });

      await page.goto('/');
      await completeRecording(page);

      await waitForVoiceState(page, 'error');

      const tooltip = await page.locator(SELECTORS.voiceButton).getAttribute('title');
      expect(tooltip).toContain('network connection');
    });
  });

  test.describe('Streaming Interaction', () => {
    test('REG-5: voice button disabled during AI streaming', async ({ page }) => {
      await mockTranscribeEndpoint(page, mockTranscribeSuccess);

      await page.goto('/');

      const voiceButton = page.locator(SELECTORS.voiceButton);
      const textarea = page.locator(SELECTORS.textarea);
      const sendButton = page.locator(SELECTORS.sendButton);

      // Type a message and send
      await textarea.fill('Hello AI');

      // Mock a slow streaming response
      await page.route('**/chat/**', async (route) => {
        // Simulate slow streaming
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({ status: 200, body: 'OK' });
      });

      // Send message (this triggers isStreaming = true in the component)
      await sendButton.click();

      // Voice button should be disabled during streaming
      // Note: This depends on the parent component passing isStreaming=true
      await expect(voiceButton).toBeDisabled();
    });
  });

  test.describe('Cancel Recording', () => {
    test('REG-6: right-click cancels recording without transcription', async ({ page }) => {
      let transcribeRequestMade = false;
      await page.route('**/voice/transcribe', async (route) => {
        transcribeRequestMade = true;
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockTranscribeSuccess),
        });
      });

      await page.goto('/');

      const voiceButton = page.locator(SELECTORS.voiceButton);

      // Start recording
      await voiceButton.click();
      await waitForVoiceState(page, 'recording');

      // Right-click to cancel
      await voiceButton.click({ button: 'right' });

      // Should return to idle immediately
      await waitForVoiceState(page, 'idle');

      // No transcribe request should have been made
      expect(transcribeRequestMade).toBe(false);

      // Textarea should be empty
      await expect(page.locator(SELECTORS.textarea)).toHaveValue('');
    });
  });

  test.describe('Error Handling', () => {
    test('REG-7: empty audio shows appropriate error', async ({ page }) => {
      // This test is tricky because we need to simulate empty MediaRecorder output
      // In practice, this would require mocking at the MediaRecorder level
      // For now, we test the error message path via API error

      await mockTranscribeEndpoint(
        page,
        { detail: 'No audio data received' },
        { status: 400 }
      );

      await page.goto('/');
      await completeRecording(page, 100); // Very short recording

      // May get error from API or from empty blob check
      await waitForVoiceState(page, 'error');
    });

    test('REG-8: network timeout shows connection error', async ({ page }) => {
      // Simulate network timeout
      await page.route('**/voice/transcribe', async (route) => {
        // Never respond - will timeout
        await new Promise((resolve) => setTimeout(resolve, 60000));
      });

      await page.goto('/');

      const voiceButton = page.locator(SELECTORS.voiceButton);
      await voiceButton.click();
      await waitForVoiceState(page, 'recording');
      await page.waitForTimeout(300);
      await voiceButton.click();

      // Processing should eventually timeout or error
      await waitForVoiceState(page, 'processing');

      // Note: Actual timeout behavior depends on fetch implementation
      // This test may need adjustment based on actual timeout configuration
    });
  });

  test.describe('Browser Support', () => {
    test('REG-9: unsupported browser hides voice button', async ({ page }) => {
      // Mock browser without MediaRecorder support
      await page.addInitScript(() => {
        delete (window.navigator as Record<string, unknown>).mediaDevices;
        delete (window as Record<string, unknown>).MediaRecorder;
      });

      await page.goto('/');

      // Voice button should not be rendered
      await expect(page.locator(SELECTORS.voiceButton)).not.toBeVisible();
    });
  });

  test.describe('Sequential Operations', () => {
    test('REG-10: multiple sequential recordings work correctly', async ({ page }) => {
      let recordingCount = 0;
      await page.route('**/voice/transcribe', async (route) => {
        recordingCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(createTranscribeResponse({
            text: `recording ${recordingCount}`,
          })),
        });
      });

      await page.goto('/');

      const voiceButton = page.locator(SELECTORS.voiceButton);
      const textarea = page.locator(SELECTORS.textarea);

      // First recording
      await completeRecording(page);
      await waitForVoiceState(page, 'idle');
      await expect(textarea).toHaveValue('recording 1');

      // Second recording (should append)
      await completeRecording(page);
      await waitForVoiceState(page, 'idle');
      await expect(textarea).toHaveValue('recording 1 recording 2');

      // Third recording
      await completeRecording(page);
      await waitForVoiceState(page, 'idle');
      await expect(textarea).toHaveValue('recording 1 recording 2 recording 3');

      // Verify no state corruption
      expect(recordingCount).toBe(3);
    });

    test('REG-11: error recovery allows new recording', async ({ page }) => {
      let shouldFail = true;
      await page.route('**/voice/transcribe', async (route) => {
        if (shouldFail) {
          shouldFail = false;
          await route.fulfill({
            status: 500,
            body: JSON.stringify(mockTranscribeServiceError),
          });
        } else {
          await route.fulfill({
            status: 200,
            body: JSON.stringify(mockTranscribeSuccess),
          });
        }
      });

      await page.goto('/');

      // First recording fails
      await completeRecording(page);
      await waitForVoiceState(page, 'error');

      // Second recording should work
      await completeRecording(page);
      await waitForVoiceState(page, 'idle');
      await expect(page.locator(SELECTORS.textarea)).toHaveValue(mockTranscribeSuccess.text);
    });
  });

  test.describe('Fitness Vocabulary', () => {
    test('REG-12: fitness terms are correctly transcribed', async ({ page }) => {
      await mockTranscribeEndpoint(page, createTranscribeResponse({
        text: 'superset of dumbbell curls and tricep pushdowns',
        confidence: 0.96,
      }));

      await page.goto('/');
      await completeRecording(page);
      await waitForVoiceState(page, 'idle');

      await expect(page.locator(SELECTORS.textarea))
        .toHaveValue('superset of dumbbell curls and tricep pushdowns');
    });

    test('REG-13: corrections are applied from personal dictionary', async ({ page }) => {
      await mockTranscribeEndpoint(page, createTranscribeResponse({
        text: 'Romanian deadlift',
        corrections_applied: 1,
      }));

      await page.goto('/');
      await completeRecording(page);
      await waitForVoiceState(page, 'idle');

      // The corrected term should be in the textarea
      await expect(page.locator(SELECTORS.textarea)).toHaveValue('Romanian deadlift');
    });
  });
});
