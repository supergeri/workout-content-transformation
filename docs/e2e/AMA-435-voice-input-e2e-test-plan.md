# E2E Test Plan: Voice Input (AMA-435)

## Overview

This document defines E2E test scenarios for the voice input feature that cannot be reliably tested via unit tests because they require real browser APIs (MediaRecorder, getUserMedia, Web Speech API).

**Test Framework:** Playwright (recommended for browser E2E)
**Current E2E Stack:** Vitest with jsdom (API-level tests only)
**Recommendation:** Add Playwright for browser-level E2E tests

---

## Test Architecture

### Why Playwright for Voice Input E2E

The current Vitest E2E tests (`vitest.e2e.config.ts`) use jsdom, which cannot:
- Access real microphone hardware
- Run MediaRecorder with actual audio streams
- Execute Web Speech API recognition

Playwright provides:
- Real Chromium/Firefox/WebKit browser contexts
- `browserContext.grantPermissions(['microphone'])` for mic access
- Route interception to mock `/voice/transcribe` responses
- Ability to inject synthetic audio via Web Audio API

### Test Data Strategy

```
Synthetic Audio Files (fixtures):
  - silence-1s.webm          - Empty audio for edge cases
  - speech-hello-world.webm  - "Hello world" for basic flow
  - speech-fitness-terms.webm - "3 sets of 10 reps bench press"
  - noise-only.webm          - Background noise, no speech
  - 60s-speech.webm          - Full 60-second recording
```

---

## Smoke Suite (Critical Path)

Run on every PR. Target: < 60 seconds total.

### SMOKE-1: Happy Path Recording Flow

**Priority:** P0
**Description:** Complete voice input flow from click to transcript in textarea

**Preconditions:**
- User is authenticated
- ChatPanel is open
- Microphone permission will be granted

**Test Steps:**
1. Click voice button (`[data-testid="chat-voice-button"]`)
2. Verify button state changes to `requesting` then `recording`
3. Verify pulsing red dot indicator appears
4. Wait 2 seconds (simulated recording)
5. Click voice button to stop
6. Verify button state changes to `processing`
7. Mock `/voice/transcribe` returns `{ success: true, text: "test message", confidence: 0.95 }`
8. Verify transcript appears in textarea (`[data-testid="chat-input-textarea"]`)
9. Verify textarea has focus
10. Verify send button is enabled

**Expected Results:**
- State transitions: idle -> requesting -> recording -> processing -> idle
- Textarea contains "test message"
- No auto-submit occurred

**Playwright Pattern:**
```typescript
test('SMOKE-1: happy path recording flow', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);

  // Mock the transcribe endpoint
  await page.route('**/voice/transcribe', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        text: 'test message',
        confidence: 0.95,
        provider: 'deepgram',
      }),
    });
  });

  await page.goto('/app');
  await page.click('[data-testid="chat-voice-button"]');

  // Verify recording state
  await expect(page.locator('[data-testid="chat-voice-button"]'))
    .toHaveAttribute('data-state', 'recording');

  // Stop recording
  await page.waitForTimeout(500); // Brief recording
  await page.click('[data-testid="chat-voice-button"]');

  // Verify processing then idle
  await expect(page.locator('[data-testid="chat-voice-button"]'))
    .toHaveAttribute('data-state', 'processing');
  await expect(page.locator('[data-testid="chat-voice-button"]'))
    .toHaveAttribute('data-state', 'idle');

  // Verify transcript in textarea
  await expect(page.locator('[data-testid="chat-input-textarea"]'))
    .toHaveValue('test message');

  // Verify textarea is focused
  await expect(page.locator('[data-testid="chat-input-textarea"]'))
    .toBeFocused();
});
```

---

### SMOKE-2: Permission Denied Handling

**Priority:** P0
**Description:** User denies microphone permission, sees helpful error

**Preconditions:**
- User is authenticated
- ChatPanel is open
- Microphone permission will be denied

**Test Steps:**
1. Configure context to deny microphone permission
2. Click voice button
3. Verify error state appears
4. Verify error message mentions "microphone access denied"
5. Verify tooltip shows the error message

**Expected Results:**
- Button shows error state (MicOff icon)
- Error message is user-friendly, mentions browser settings

**Playwright Pattern:**
```typescript
test('SMOKE-2: permission denied shows helpful error', async ({ page, context }) => {
  // Do NOT grant microphone permission - default is denied

  await page.goto('/app');
  await page.click('[data-testid="chat-voice-button"]');

  // Verify error state
  await expect(page.locator('[data-testid="chat-voice-button"]'))
    .toHaveAttribute('data-state', 'error');

  // Verify tooltip contains helpful message
  const tooltip = await page.locator('[data-testid="chat-voice-button"]')
    .getAttribute('title');
  expect(tooltip).toContain('Microphone access denied');
});
```

---

### SMOKE-3: Transcript Appends to Existing Text

**Priority:** P0
**Description:** Voice transcript appends to existing textarea content

**Preconditions:**
- Textarea already contains "I did"
- Recording completes with transcript "3 sets of bench press"

**Test Steps:**
1. Type "I did" in textarea
2. Click voice button, complete recording
3. Mock returns "3 sets of bench press"
4. Verify textarea contains "I did 3 sets of bench press"

**Expected Results:**
- Space separator added between existing text and transcript
- User can continue editing before sending

---

## Regression Suite (Full Coverage)

Run nightly and on release branches. Target: < 5 minutes.

### REG-1: 60-Second Max Duration Auto-Stop

**Priority:** P1
**Description:** Recording automatically stops after 60 seconds

**Test Steps:**
1. Start recording
2. Wait for 60 seconds (use fake timers or accelerated timeout)
3. Verify recording stops automatically
4. Verify transcription is triggered

**Implementation Note:**
```typescript
test('REG-1: 60s max duration auto-stop', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);

  // Override the max duration for faster testing
  await page.addInitScript(() => {
    // Intercept the hook to use a shorter timeout
    window.__TEST_VOICE_MAX_DURATION_MS = 2000; // 2 seconds for test
  });

  await page.route('**/voice/transcribe', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, text: 'auto stopped', confidence: 0.9 }),
    });
  });

  await page.goto('/app');
  await page.click('[data-testid="chat-voice-button"]');

  // Wait for auto-stop (should happen after 2s in test mode)
  await expect(page.locator('[data-testid="chat-voice-button"]'))
    .toHaveAttribute('data-state', 'processing', { timeout: 5000 });
});
```

---

### REG-2: Fallback to Web Speech API on Deepgram Failure

**Priority:** P1
**Description:** When Deepgram fails, Web Speech API fallback is attempted

**Preconditions:**
- Browser supports Web Speech API
- Deepgram endpoint will fail

**Test Steps:**
1. Mock `/voice/transcribe` to return 500 error
2. Start and complete recording
3. Verify Web Speech API fallback is attempted
4. Verify user sees transcript (from fallback) or appropriate error

**Implementation Note:**
Testing Web Speech API requires browser automation with actual speech recognition, which is complex. Consider:
- Mock the SpeechRecognition constructor in page context
- Use a real browser with speech synthesis + recognition (complex)
- Focus on verifying the fallback attempt is made

---

### REG-3: Low Confidence Triggers Fallback

**Priority:** P1
**Description:** Deepgram confidence < 0.5 triggers Web Speech API attempt

**Test Steps:**
1. Mock `/voice/transcribe` to return `{ success: true, text: "...", confidence: 0.3 }`
2. Start and complete recording
3. Verify fallback is attempted
4. If fallback fails, original low-confidence result is used

---

### REG-4: Both Providers Fail - Error Message

**Priority:** P1
**Description:** When both Deepgram and Web Speech fail, show appropriate error

**Test Steps:**
1. Mock Deepgram to fail
2. Mock Web Speech to fail (or unavailable)
3. Complete recording
4. Verify error message: "Voice transcription failed. Please try again or type your message."

---

### REG-5: Voice Button Disabled During Streaming

**Priority:** P1
**Description:** Cannot start voice input while AI is responding

**Test Steps:**
1. Send a message that triggers AI streaming response
2. While streaming, verify voice button is disabled
3. Wait for streaming to complete
4. Verify voice button is re-enabled

---

### REG-6: Cancel Recording via Right-Click

**Priority:** P2
**Description:** Right-clicking during recording cancels without transcription

**Test Steps:**
1. Start recording
2. Right-click the voice button
3. Verify recording is cancelled
4. Verify no transcription request is made
5. Verify state returns to idle
6. Verify no transcript in textarea

---

### REG-7: No Audio Recorded Error

**Priority:** P2
**Description:** Empty audio blob shows appropriate error

**Test Steps:**
1. Mock MediaRecorder to produce 0-byte blob
2. Complete recording
3. Verify error: "No audio recorded. Please try again."

---

### REG-8: Network Error During Transcription

**Priority:** P2
**Description:** Network failure during transcription shows helpful error

**Test Steps:**
1. Mock `/voice/transcribe` to simulate network error
2. Complete recording
3. Verify error message mentions network connection

---

### REG-9: Browser Not Supported

**Priority:** P2
**Description:** Unsupported browser hides voice button

**Test Steps:**
1. Mock `navigator.mediaDevices` to be undefined
2. Load the page
3. Verify voice button is not rendered

**Note:** This is already covered by unit tests but can be verified E2E.

---

### REG-10: Multiple Sequential Recordings

**Priority:** P2
**Description:** User can make multiple recordings in sequence

**Test Steps:**
1. Complete first recording, verify transcript
2. Complete second recording, verify new transcript appends
3. Verify no state corruption between recordings

---

## Test Selectors (data-testid)

All selectors are already defined in the implementation:

| Element | Selector | Notes |
|---------|----------|-------|
| Voice Button | `[data-testid="chat-voice-button"]` | Has `data-state` attribute |
| Textarea | `[data-testid="chat-input-textarea"]` | For verifying transcript |
| Send Button | `[data-testid="chat-send-button"]` | For verifying enabled state |
| Rate Limit | `[data-testid="chat-rate-limit"]` | Context indicator |

Additional attribute for state verification:
- `[data-testid="chat-voice-button"][data-state="recording"]`
- `[data-testid="chat-voice-button"][data-state="processing"]`
- `[data-testid="chat-voice-button"][data-state="error"]`
- `[data-testid="chat-voice-button"][data-state="idle"]`

---

## Fixtures Required

### Audio Fixtures

Create synthetic audio files in `src/test/fixtures/audio/`:

```
fixtures/audio/
  - speech-hello-world.webm   # "Hello world" - basic test
  - speech-bench-press.webm   # "3 sets of 10 bench press" - fitness terms
  - silence-2s.webm           # Silent audio for edge cases
```

### API Response Fixtures

```typescript
// src/test/fixtures/voice-api.fixtures.ts

export const mockTranscribeSuccess = {
  success: true,
  text: '3 sets of 10 reps bench press',
  confidence: 0.95,
  provider: 'deepgram',
  duration_seconds: 2.5,
  corrections_applied: 0,
};

export const mockTranscribeLowConfidence = {
  success: true,
  text: 'three sets of ten reps bench press',
  confidence: 0.35, // Below 0.5 threshold
  provider: 'deepgram',
  duration_seconds: 2.5,
  corrections_applied: 0,
};

export const mockTranscribeError = {
  success: false,
  detail: 'Transcription service unavailable',
};
```

---

## CI/CD Integration

### PR Checks (Fast Feedback)

```yaml
# .github/workflows/e2e-smoke.yml
name: E2E Smoke Tests
on: [pull_request]

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run test:e2e:smoke
        env:
          VITE_INGESTOR_API_URL: http://localhost:8000
```

### Nightly Full Suite

```yaml
# .github/workflows/e2e-nightly.yml
name: E2E Full Suite
on:
  schedule:
    - cron: '0 3 * * *' # 3 AM UTC daily

jobs:
  full-suite:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install ${{ matrix.browser }}
      - run: npm run test:e2e -- --project=${{ matrix.browser }}
```

---

## Anti-Patterns to Avoid

### 1. Arbitrary Sleeps
```typescript
// BAD
await page.waitForTimeout(5000);

// GOOD
await expect(page.locator('[data-state="idle"]')).toBeVisible();
```

### 2. Flaky Timing for Real Audio
```typescript
// BAD - Depends on real audio playback timing
await injectAudioAndWait(realAudioFile);

// GOOD - Mock at API boundary
await page.route('**/voice/transcribe', mockResponse);
```

### 3. Testing Implementation Details
```typescript
// BAD - Tests internal state machine
expect(voiceInput.state).toBe('processing');

// GOOD - Tests user-visible behavior
await expect(page.locator('[data-state="processing"]')).toBeVisible();
```

### 4. Not Cleaning Up Permissions
```typescript
// BAD - Permission state leaks between tests
await context.grantPermissions(['microphone']);

// GOOD - Use isolated context per test
const context = await browser.newContext();
await context.grantPermissions(['microphone']);
// ... test ...
await context.close();
```

---

## Implementation Roadmap

### Phase 1: Playwright Setup (1 day)
1. Add Playwright dev dependency
2. Create `playwright.config.ts`
3. Create base page objects for ChatPanel
4. Add `npm run test:e2e:playwright` script

### Phase 2: Smoke Suite (1 day)
1. Implement SMOKE-1, SMOKE-2, SMOKE-3
2. Add to PR checks

### Phase 3: Regression Suite (2 days)
1. Implement REG-1 through REG-10
2. Add to nightly pipeline

### Phase 4: Cross-Browser (1 day)
1. Validate in Firefox and WebKit
2. Add browser matrix to CI

---

## References

- [Playwright Browser Context Permissions](https://playwright.dev/docs/api/class-browsercontext#browser-context-grant-permissions)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [AMA-435 Implementation PR](../../../)
