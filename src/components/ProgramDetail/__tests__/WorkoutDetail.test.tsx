/**
 * WorkoutDetail Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkoutDetail } from '../WorkoutDetail';
import {
  mockWorkout,
  mockCompletedWorkout,
  mockWorkoutWithNotes,
} from '../../../test/fixtures/program-detail.fixtures';

describe('WorkoutDetail', () => {
  const mockOnClose = vi.fn();
  const mockOnMarkComplete = vi.fn().mockResolvedValue(true);
  const mockOnStartWorkout = vi.fn();

  const defaultProps = {
    workout: mockWorkout,
    open: true,
    onClose: mockOnClose,
    onMarkComplete: mockOnMarkComplete,
    onStartWorkout: mockOnStartWorkout,
    isLoading: false,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnMarkComplete.mockClear();
    mockOnStartWorkout.mockClear();
  });

  describe('Rendering', () => {
    it('should render workout name', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(screen.getByText(mockWorkout.name)).toBeInTheDocument();
    });

    it('should render day of week', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(screen.getByText('Monday')).toBeInTheDocument();
    });

    it('should render workout type', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(screen.getByText('legs')).toBeInTheDocument();
    });

    it('should render exercise count', () => {
      render(<WorkoutDetail {...defaultProps} />);
      // Find the exercise count in the metadata section
      expect(screen.getByText('Exercises:')).toBeInTheDocument();
    });

    it('should render duration when present', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(screen.getByText(`${mockWorkout.target_duration_minutes} min`)).toBeInTheDocument();
    });

    it('should not render when workout is null', () => {
      render(<WorkoutDetail {...defaultProps} workout={null} />);
      expect(screen.queryByText(mockWorkout.name)).not.toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(<WorkoutDetail {...defaultProps} open={false} />);
      // Sheet content should not be visible
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Exercise List', () => {
    it('should render all exercises', () => {
      render(<WorkoutDetail {...defaultProps} />);

      expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
      expect(screen.getByText('Romanian Deadlift')).toBeInTheDocument();
      expect(screen.getByText('Leg Press')).toBeInTheDocument();
      expect(screen.getByText('Leg Curl')).toBeInTheDocument();
    });

    it('should render exercise sets and reps', () => {
      render(<WorkoutDetail {...defaultProps} />);

      expect(screen.getByText('4 x 6-8')).toBeInTheDocument();
      expect(screen.getByText('3 x 10-12')).toBeInTheDocument();
      // '3 x 12-15' appears twice (Leg Press and Leg Curl both have this)
      expect(screen.getAllByText('3 x 12-15').length).toBe(2);
    });

    it('should render exercise weight when present', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(screen.getByText('135 lbs')).toBeInTheDocument();
      expect(screen.getByText('95 lbs')).toBeInTheDocument();
    });

    it('should render rest time', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(screen.getByText(/Rest: 3m/)).toBeInTheDocument(); // 180 seconds
      expect(screen.getByText(/Rest: 2m/)).toBeInTheDocument(); // 120 seconds
    });

    it('should render exercise notes when present', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(screen.getByText('Focus on depth')).toBeInTheDocument();
    });

    it('should render tempo when present', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(screen.getByText(/Tempo: 3-1-2-0/)).toBeInTheDocument();
    });

    it('should render exercise numbers', () => {
      render(<WorkoutDetail {...defaultProps} />);

      // Exercise numbers are rendered in numbered circles
      // Query by the specific container class that holds the number
      const exerciseNumbers = document.querySelectorAll('.rounded-full.bg-primary\\/10');
      expect(exerciseNumbers.length).toBe(4);
    });
  });

  describe('Workout Notes', () => {
    it('should render workout notes when present', () => {
      render(<WorkoutDetail {...defaultProps} workout={mockWorkoutWithNotes} />);
      expect(
        screen.getByText('Take extra rest if needed after heavy week')
      ).toBeInTheDocument();
    });

    it('should not render notes section when notes are empty', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(
        screen.queryByText('Take extra rest if needed after heavy week')
      ).not.toBeInTheDocument();
    });
  });

  describe('Completion Status', () => {
    it('should show Completed badge for completed workouts', () => {
      render(<WorkoutDetail {...defaultProps} workout={mockCompletedWorkout} />);
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should not show Completed badge for incomplete workouts', () => {
      render(<WorkoutDetail {...defaultProps} />);
      // Look for the badge specifically, not any text
      const badges = screen.queryAllByText('Completed');
      expect(badges.length).toBe(0);
    });

    it('should show completion date for completed workouts', () => {
      render(<WorkoutDetail {...defaultProps} workout={mockCompletedWorkout} />);
      expect(screen.getByText(/Completed on/)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render Mark Complete button for incomplete workouts', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(screen.getByText('Mark Complete')).toBeInTheDocument();
    });

    it('should render Mark Incomplete button for completed workouts', () => {
      render(<WorkoutDetail {...defaultProps} workout={mockCompletedWorkout} />);
      expect(screen.getByText('Mark Incomplete')).toBeInTheDocument();
    });

    it('should call onMarkComplete when Mark Complete is clicked', async () => {
      render(<WorkoutDetail {...defaultProps} />);

      const button = screen.getByText('Mark Complete');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnMarkComplete).toHaveBeenCalledWith(mockWorkout.id, true);
      });
    });

    it('should call onMarkComplete with false when Mark Incomplete is clicked', async () => {
      render(<WorkoutDetail {...defaultProps} workout={mockCompletedWorkout} />);

      const button = screen.getByText('Mark Incomplete');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnMarkComplete).toHaveBeenCalledWith(mockCompletedWorkout.id, false);
      });
    });

    it('should render Start Workout button when onStartWorkout is provided', () => {
      render(<WorkoutDetail {...defaultProps} />);
      expect(screen.getByText('Start Workout')).toBeInTheDocument();
    });

    it('should not render Start Workout button when onStartWorkout is not provided', () => {
      render(<WorkoutDetail {...defaultProps} onStartWorkout={undefined} />);
      expect(screen.queryByText('Start Workout')).not.toBeInTheDocument();
    });

    it('should call onStartWorkout when Start Workout is clicked', () => {
      render(<WorkoutDetail {...defaultProps} />);

      const button = screen.getByText('Start Workout');
      fireEvent.click(button);

      expect(mockOnStartWorkout).toHaveBeenCalledWith(mockWorkout);
    });

    it('should disable buttons when loading', () => {
      render(<WorkoutDetail {...defaultProps} isLoading={true} />);

      const markCompleteButton = screen.getByText('Mark Complete').closest('button');
      expect(markCompleteButton).toBeDisabled();
    });
  });
});
