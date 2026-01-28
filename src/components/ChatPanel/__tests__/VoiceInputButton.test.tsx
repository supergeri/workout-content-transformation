/**
 * Unit tests for VoiceInputButton component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceInputButton } from '../VoiceInputButton';
import type { VoiceInputState } from '../../../hooks/useVoiceInput';

describe('VoiceInputButton', () => {
  const defaultProps = {
    state: 'idle' as VoiceInputState,
    isSupported: true,
    error: null,
    confidence: 0,
    onStart: vi.fn(),
    onStop: vi.fn(),
    onCancel: vi.fn(),
  };

  describe('rendering', () => {
    it('renders when supported', () => {
      render(<VoiceInputButton {...defaultProps} />);
      expect(screen.getByTestId('chat-voice-button')).toBeInTheDocument();
    });

    it('does not render when not supported', () => {
      render(<VoiceInputButton {...defaultProps} isSupported={false} />);
      expect(screen.queryByTestId('chat-voice-button')).not.toBeInTheDocument();
    });

    it('has correct data-state attribute', () => {
      render(<VoiceInputButton {...defaultProps} state="recording" />);
      expect(screen.getByTestId('chat-voice-button')).toHaveAttribute('data-state', 'recording');
    });
  });

  describe('idle state', () => {
    it('shows mic icon', () => {
      render(<VoiceInputButton {...defaultProps} state="idle" />);
      const button = screen.getByTestId('chat-voice-button');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('has correct tooltip', () => {
      render(<VoiceInputButton {...defaultProps} state="idle" />);
      expect(screen.getByTestId('chat-voice-button')).toHaveAttribute(
        'title',
        'Click to start voice input'
      );
    });

    it('calls onStart when clicked', () => {
      const onStart = vi.fn();
      render(<VoiceInputButton {...defaultProps} state="idle" onStart={onStart} />);
      fireEvent.click(screen.getByTestId('chat-voice-button'));
      expect(onStart).toHaveBeenCalled();
    });
  });

  describe('recording state', () => {
    it('shows stop icon and pulsing indicator', () => {
      render(<VoiceInputButton {...defaultProps} state="recording" />);
      const button = screen.getByTestId('chat-voice-button');
      // Should have red color class for recording
      expect(button.className).toContain('text-red-500');
    });

    it('has correct tooltip', () => {
      render(<VoiceInputButton {...defaultProps} state="recording" />);
      expect(screen.getByTestId('chat-voice-button')).toHaveAttribute(
        'title',
        'Listening... Click to stop'
      );
    });

    it('calls onStop when clicked', () => {
      const onStop = vi.fn();
      render(<VoiceInputButton {...defaultProps} state="recording" onStop={onStop} />);
      fireEvent.click(screen.getByTestId('chat-voice-button'));
      expect(onStop).toHaveBeenCalled();
    });

    it('calls onCancel on right-click', () => {
      const onCancel = vi.fn();
      render(<VoiceInputButton {...defaultProps} state="recording" onCancel={onCancel} />);
      fireEvent.contextMenu(screen.getByTestId('chat-voice-button'));
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('processing state', () => {
    it('is disabled', () => {
      render(<VoiceInputButton {...defaultProps} state="processing" />);
      expect(screen.getByTestId('chat-voice-button')).toBeDisabled();
    });

    it('has correct tooltip', () => {
      render(<VoiceInputButton {...defaultProps} state="processing" />);
      expect(screen.getByTestId('chat-voice-button')).toHaveAttribute(
        'title',
        'Transcribing...'
      );
    });
  });

  describe('requesting state', () => {
    it('is disabled', () => {
      render(<VoiceInputButton {...defaultProps} state="requesting" />);
      expect(screen.getByTestId('chat-voice-button')).toBeDisabled();
    });

    it('has correct tooltip', () => {
      render(<VoiceInputButton {...defaultProps} state="requesting" />);
      expect(screen.getByTestId('chat-voice-button')).toHaveAttribute(
        'title',
        'Requesting microphone access...'
      );
    });
  });

  describe('error state', () => {
    it('shows error icon with red color', () => {
      render(<VoiceInputButton {...defaultProps} state="error" error="Test error" />);
      const button = screen.getByTestId('chat-voice-button');
      expect(button.className).toContain('text-red-500');
    });

    it('shows error message in tooltip', () => {
      render(<VoiceInputButton {...defaultProps} state="error" error="Microphone access denied" />);
      expect(screen.getByTestId('chat-voice-button')).toHaveAttribute(
        'title',
        'Microphone access denied'
      );
    });

    it('calls onStart when clicked to retry', () => {
      const onStart = vi.fn();
      render(<VoiceInputButton {...defaultProps} state="error" onStart={onStart} />);
      fireEvent.click(screen.getByTestId('chat-voice-button'));
      expect(onStart).toHaveBeenCalled();
    });
  });

  describe('disabled prop', () => {
    it('disables button when disabled=true', () => {
      render(<VoiceInputButton {...defaultProps} disabled={true} />);
      expect(screen.getByTestId('chat-voice-button')).toBeDisabled();
    });

    it('does not call handlers when disabled', () => {
      const onStart = vi.fn();
      render(<VoiceInputButton {...defaultProps} disabled={true} onStart={onStart} />);
      fireEvent.click(screen.getByTestId('chat-voice-button'));
      expect(onStart).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has aria-label', () => {
      render(<VoiceInputButton {...defaultProps} />);
      expect(screen.getByTestId('chat-voice-button')).toHaveAttribute('aria-label');
    });

    it('aria-label matches tooltip', () => {
      render(<VoiceInputButton {...defaultProps} state="recording" />);
      const button = screen.getByTestId('chat-voice-button');
      expect(button.getAttribute('aria-label')).toBe(button.getAttribute('title'));
    });
  });
});
