/**
 * VoiceInputButton — Mic button with visual states for voice input.
 *
 * States:
 * - idle: Gray mic icon
 * - recording: Pulsing red dot with "Listening..." tooltip
 * - processing: Spinner with "Transcribing..." tooltip
 * - error: Red mic with error tooltip
 * - unsupported: Hidden or disabled with tooltip
 */

import { Mic, MicOff, Loader2, Square } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import type { VoiceInputState } from '../../hooks/useVoiceInput';

interface VoiceInputButtonProps {
  state: VoiceInputState;
  isSupported: boolean;
  error: string | null;
  confidence: number;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}

function getTooltip(
  state: VoiceInputState,
  isSupported: boolean,
  error: string | null,
  confidence: number,
): string {
  if (!isSupported) {
    return 'Voice input is not supported in this browser';
  }

  switch (state) {
    case 'idle':
      return 'Click to start voice input';
    case 'requesting':
      return 'Requesting microphone access...';
    case 'recording':
      return 'Listening... Click to stop';
    case 'processing':
      return 'Transcribing...';
    case 'error':
      return error || 'Voice input error';
    default:
      return 'Voice input';
  }
}

export function VoiceInputButton({
  state,
  isSupported,
  error,
  confidence,
  disabled = false,
  onStart,
  onStop,
  onCancel,
}: VoiceInputButtonProps) {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing' || state === 'requesting';
  const isError = state === 'error';
  const isDisabled = disabled || !isSupported || isProcessing;

  const handleClick = () => {
    if (isRecording) {
      onStop();
    } else if (state === 'idle' || state === 'error') {
      onStart();
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRecording) {
      onCancel();
    }
  };

  const tooltip = getTooltip(state, isSupported, error, confidence);

  // Don't render if unsupported (graceful degradation)
  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'h-9 w-9 shrink-0 relative',
        isRecording && 'text-red-500 hover:text-red-600',
        isError && 'text-red-500',
      )}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      disabled={isDisabled}
      title={tooltip}
      aria-label={tooltip}
      data-testid="chat-voice-button"
      data-state={state}
    >
      {/* Recording indicator - pulsing dot */}
      {isRecording && (
        <span className="absolute top-1 right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      )}

      {/* Icon based on state */}
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <Square className="w-3 h-3 fill-current" />
      ) : isError ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
}
