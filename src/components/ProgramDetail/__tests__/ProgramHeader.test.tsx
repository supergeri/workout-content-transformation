/**
 * ProgramHeader Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgramHeader } from '../ProgramHeader';
import {
  mockTrainingProgram,
  mockDraftProgram,
  mockPausedProgram,
  mockCompletedProgram,
} from '../../../test/fixtures/program-detail.fixtures';

describe('ProgramHeader', () => {
  const mockOnBack = vi.fn();
  const mockOnStatusChange = vi.fn().mockResolvedValue(true);
  const mockOnDelete = vi.fn().mockResolvedValue(true);

  const defaultProps = {
    program: mockTrainingProgram,
    onBack: mockOnBack,
    onStatusChange: mockOnStatusChange,
    onDelete: mockOnDelete,
    isLoading: false,
  };

  beforeEach(() => {
    mockOnBack.mockClear();
    mockOnStatusChange.mockClear();
    mockOnDelete.mockClear();
  });

  describe('Rendering', () => {
    it('should render program name', () => {
      render(<ProgramHeader {...defaultProps} />);
      expect(screen.getByText(mockTrainingProgram.name)).toBeInTheDocument();
    });

    it('should render status badge', () => {
      render(<ProgramHeader {...defaultProps} />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render program metadata', () => {
      render(<ProgramHeader {...defaultProps} />);

      // Duration
      expect(screen.getByText(`${mockTrainingProgram.duration_weeks} weeks`)).toBeInTheDocument();

      // Sessions per week
      expect(screen.getByText(`${mockTrainingProgram.sessions_per_week}/week`)).toBeInTheDocument();

      // Time per session
      expect(screen.getByText(`${mockTrainingProgram.time_per_session_minutes} min`)).toBeInTheDocument();
    });

    it('should render experience level', () => {
      render(<ProgramHeader {...defaultProps} />);
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
    });

    it('should render goal badge', () => {
      render(<ProgramHeader {...defaultProps} />);
      expect(screen.getByText('Build Muscle')).toBeInTheDocument();
    });

    it('should render periodization model badge', () => {
      render(<ProgramHeader {...defaultProps} />);
      expect(screen.getByText('Linear')).toBeInTheDocument();
    });

    it('should render equipment badges', () => {
      render(<ProgramHeader {...defaultProps} />);
      expect(screen.getByText('barbell')).toBeInTheDocument();
      expect(screen.getByText('dumbbells')).toBeInTheDocument();
      expect(screen.getByText('cable machine')).toBeInTheDocument();
    });

    it('should show "+N more" for equipment when more than 3', () => {
      render(<ProgramHeader {...defaultProps} />);
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      render(<ProgramHeader {...defaultProps} />);
      expect(screen.getByText(/Week 2 of 8/)).toBeInTheDocument();
    });

    it('should render progress percentage', () => {
      render(<ProgramHeader {...defaultProps} />);
      // Week 2 of 8 = (2-1)/8 = 12.5%, rounds to 13%
      expect(screen.getByText(/% complete/)).toBeInTheDocument();
    });

    it('should render workout completion count', () => {
      render(<ProgramHeader {...defaultProps} />);
      // mockWeek2 has 1 workout, 0 completed
      expect(screen.getByText(/0\/1 workouts this week/)).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should show Draft badge for draft programs', () => {
      render(<ProgramHeader {...defaultProps} program={mockDraftProgram} />);
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should show Paused badge for paused programs', () => {
      render(<ProgramHeader {...defaultProps} program={mockPausedProgram} />);
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });

    it('should show Completed badge for completed programs', () => {
      render(<ProgramHeader {...defaultProps} program={mockCompletedProgram} />);
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should call onBack when back button is clicked', () => {
      render(<ProgramHeader {...defaultProps} />);

      // Find back button by looking for button with ArrowLeft icon
      const buttons = screen.getAllByRole('button');
      const backButton = buttons.find((btn) => btn.querySelector('.lucide-arrow-left'));
      expect(backButton).toBeTruthy();
      fireEvent.click(backButton!);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Notes', () => {
    it('should render notes when present', () => {
      const programWithNotes = {
        ...mockTrainingProgram,
        notes: 'Focus on form over weight',
      };
      render(<ProgramHeader {...defaultProps} program={programWithNotes} />);
      expect(screen.getByText('Focus on form over weight')).toBeInTheDocument();
    });

    it('should not render notes section when notes are empty', () => {
      render(<ProgramHeader {...defaultProps} />);
      // Original program has no notes
      expect(screen.queryByText('Focus on form')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable actions when loading', () => {
      render(<ProgramHeader {...defaultProps} isLoading={true} />);

      // The Pause button should be disabled
      const pauseButton = screen.getByRole('button', { name: /Pause/i });
      expect(pauseButton).toBeDisabled();
    });
  });
});
