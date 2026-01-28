/**
 * Unit tests for ChatInput component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

// Helper to setup browser mocks for voice support
function setupVoiceSupportMocks() {
  const originalMediaDevices = navigator.mediaDevices;
  const originalMediaRecorder = globalThis.MediaRecorder;

  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn() },
    writable: true,
    configurable: true,
  });

  globalThis.MediaRecorder = vi.fn() as unknown as typeof MediaRecorder;

  return () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: originalMediaDevices,
      writable: true,
      configurable: true,
    });
    globalThis.MediaRecorder = originalMediaRecorder;
  };
}

// ── Tests ────────────────────────────────────────────────────────────

describe('ChatInput', () => {
  // Sending
  it('calls onSend with trimmed text when send button clicked', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} rateLimitInfo={null} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    fireEvent.change(textarea, { target: { value: '  hello  ' } });

    await userEvent.click(screen.getByTestId('chat-send-button'));
    expect(onSend).toHaveBeenCalledWith('hello');
  });

  it('calls onSend on Enter key press', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} rateLimitInfo={null} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    fireEvent.change(textarea, { target: { value: 'test msg' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(onSend).toHaveBeenCalledWith('test msg');
  });

  it('does NOT call onSend on Shift+Enter', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} rateLimitInfo={null} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    fireEvent.change(textarea, { target: { value: 'line' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('does NOT call onSend when textarea is empty', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} rateLimitInfo={null} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('clears textarea after sending', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} rateLimitInfo={null} />);

    const textarea = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'msg' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(textarea.value).toBe('');
  });

  it('send button is disabled when isStreaming=true', () => {
    render(<ChatInput onSend={vi.fn()} isStreaming={true} rateLimitInfo={null} />);
    expect(screen.getByTestId('chat-send-button')).toBeDisabled();
  });

  it('send button is disabled when textarea is empty', () => {
    render(<ChatInput onSend={vi.fn()} isStreaming={false} rateLimitInfo={null} />);
    expect(screen.getByTestId('chat-send-button')).toBeDisabled();
  });

  it('send button is enabled when textarea has text and not streaming', () => {
    render(<ChatInput onSend={vi.fn()} isStreaming={false} rateLimitInfo={null} />);
    const textarea = screen.getByTestId('chat-input-textarea');
    fireEvent.change(textarea, { target: { value: 'text' } });
    expect(screen.getByTestId('chat-send-button')).not.toBeDisabled();
  });

  it('textarea is disabled when isStreaming=true', () => {
    render(<ChatInput onSend={vi.fn()} isStreaming={true} rateLimitInfo={null} />);
    expect(screen.getByTestId('chat-input-textarea')).toBeDisabled();
  });

  // Rate limit display
  it('shows rate limit text when rateLimitInfo is provided', () => {
    render(<ChatInput onSend={vi.fn()} isStreaming={false} rateLimitInfo={{ usage: 45, limit: 50 }} />);
    const rateLimit = screen.getByTestId('chat-rate-limit');
    expect(rateLimit).toHaveTextContent('45/50 messages');
  });

  it('hides rate limit text when rateLimitInfo is null', () => {
    render(<ChatInput onSend={vi.fn()} isStreaming={false} rateLimitInfo={null} />);
    expect(screen.queryByTestId('chat-rate-limit')).not.toBeInTheDocument();
  });

  // Voice input button
  describe('voice input button', () => {
    it('is hidden when browser does not support voice input', () => {
      // In test environment, navigator.mediaDevices is not available
      render(<ChatInput onSend={vi.fn()} isStreaming={false} rateLimitInfo={null} />);
      expect(screen.queryByTestId('chat-voice-button')).not.toBeInTheDocument();
    });

    it('is rendered when browser supports voice input', async () => {
      // Mock navigator.mediaDevices and MediaRecorder
      const originalMediaDevices = navigator.mediaDevices;
      const originalMediaRecorder = globalThis.MediaRecorder;

      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: vi.fn() },
        writable: true,
        configurable: true,
      });

      globalThis.MediaRecorder = vi.fn() as unknown as typeof MediaRecorder;

      // Re-import the component to pick up the new browser support check
      // Use dynamic import to avoid caching
      vi.resetModules();
      const { ChatInput: FreshChatInput } = await import('../ChatInput');

      render(<FreshChatInput onSend={vi.fn()} isStreaming={false} rateLimitInfo={null} />);
      const voiceButton = screen.getByTestId('chat-voice-button');
      expect(voiceButton).toBeInTheDocument();
      expect(voiceButton).toHaveAttribute('aria-label');

      // Restore
      Object.defineProperty(navigator, 'mediaDevices', {
        value: originalMediaDevices,
        writable: true,
        configurable: true,
      });
      globalThis.MediaRecorder = originalMediaRecorder;
    });
  });

  // Accessibility
  it('send button has aria-label', () => {
    render(<ChatInput onSend={vi.fn()} isStreaming={false} rateLimitInfo={null} />);
    expect(screen.getByTestId('chat-send-button')).toHaveAttribute('aria-label', 'Send message');
  });

  // Voice input integration tests
  describe('voice input integration', () => {
    let cleanup: () => void;

    beforeEach(() => {
      cleanup = setupVoiceSupportMocks();
      vi.resetModules();
    });

    afterEach(() => {
      cleanup();
    });

    it('voice button is disabled when isStreaming=true', async () => {
      const { ChatInput: FreshChatInput } = await import('../ChatInput');

      render(<FreshChatInput onSend={vi.fn()} isStreaming={true} rateLimitInfo={null} />);
      const voiceButton = screen.getByTestId('chat-voice-button');
      expect(voiceButton).toBeDisabled();
    });

    it('voice button is enabled when isStreaming=false', async () => {
      const { ChatInput: FreshChatInput } = await import('../ChatInput');

      render(<FreshChatInput onSend={vi.fn()} isStreaming={false} rateLimitInfo={null} />);
      const voiceButton = screen.getByTestId('chat-voice-button');
      expect(voiceButton).not.toBeDisabled();
    });

    it('voice button has data-state attribute for state tracking', async () => {
      const { ChatInput: FreshChatInput } = await import('../ChatInput');

      render(<FreshChatInput onSend={vi.fn()} isStreaming={false} rateLimitInfo={null} />);
      const voiceButton = screen.getByTestId('chat-voice-button');
      expect(voiceButton).toHaveAttribute('data-state');
    });
  });
});
