/**
 * WeeklyCalendar Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeeklyCalendar } from '../WeeklyCalendar';
import {
  mockTrainingProgram,
  mockWorkout,
  mockCompletedWorkout,
} from '../../../test/fixtures/program-detail.fixtures';

describe('WeeklyCalendar', () => {
  const mockOnSelectWeek = vi.fn();
  const mockOnSelectWorkout = vi.fn();

  const defaultProps = {
    program: mockTrainingProgram,
    selectedWeekNumber: 1,
    selectedWorkout: null,
    onSelectWeek: mockOnSelectWeek,
    onSelectWorkout: mockOnSelectWorkout,
  };

  beforeEach(() => {
    mockOnSelectWeek.mockClear();
    mockOnSelectWorkout.mockClear();
  });

  describe('Week Tabs', () => {
    it('should render week tabs for all weeks', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      expect(screen.getByText('Week 1')).toBeInTheDocument();
      expect(screen.getByText('Week 2')).toBeInTheDocument();
      expect(screen.getByText('Week 4')).toBeInTheDocument(); // deload week
    });

    it('should highlight selected week', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={1} />);

      const weekTab = screen.getByText('Week 1').closest('button');
      expect(weekTab).toHaveClass('bg-primary');
    });

    it('should call onSelectWeek when week tab is clicked', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      const week2Tab = screen.getByText('Week 2').closest('button');
      fireEvent.click(week2Tab!);

      expect(mockOnSelectWeek).toHaveBeenCalledWith(2);
    });

    it('should show workout completion count in tabs', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={1} />);

      // Week 1 has 3 workouts, 1 completed (mockCompletedWorkout)
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    it('should show deload indicator on deload weeks', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      // Week 4 is deload - should have a Zap icon
      const week4Tab = screen.getByText('Week 4').closest('button');
      expect(week4Tab?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Week Navigation', () => {
    it('should have previous week button', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={2} />);

      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-left'));
      expect(prevButton).toBeInTheDocument();
    });

    it('should have next week button', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={1} />);

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-right'));
      expect(nextButton).toBeInTheDocument();
    });

    it('should disable previous button on first week', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={1} />);

      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-left'));
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last week', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={8} />);

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-right'));
      expect(nextButton).toBeDisabled();
    });

    it('should call onSelectWeek with previous week number', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={2} />);

      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-left'));
      fireEvent.click(prevButton!);

      expect(mockOnSelectWeek).toHaveBeenCalledWith(1);
    });

    it('should call onSelectWeek with next week number', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={1} />);

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-right'));
      fireEvent.click(nextButton!);

      expect(mockOnSelectWeek).toHaveBeenCalledWith(2);
    });
  });

  describe('Week Info Bar', () => {
    it('should show week focus when present', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={1} />);
      expect(screen.getByText(/Focus: Hypertrophy/)).toBeInTheDocument();
    });

    it('should show intensity percentage when present', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={1} />);
      expect(screen.getByText('70% Intensity')).toBeInTheDocument();
    });

    it('should show deload badge for deload weeks', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={4} />);
      expect(screen.getByText('Deload Week')).toBeInTheDocument();
    });

    it('should show volume modifier when not 100%', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={4} />);
      expect(screen.getByText(/Volume: 50%/)).toBeInTheDocument();
    });
  });

  describe('Day Grid', () => {
    it('should render day headers', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    it('should render workout cards on scheduled days', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={1} />);

      // Week 1 has workouts on Monday, Wednesday, Friday
      expect(screen.getByText('Lower Body Strength')).toBeInTheDocument();
      expect(screen.getByText('Upper Body Push')).toBeInTheDocument();
      expect(screen.getByText('Upper Body Pull')).toBeInTheDocument();
    });

    it('should render rest day cells for unscheduled days', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={1} />);

      // Should have rest day cells for Sun, Tue, Thu, Sat (4 days)
      const restDays = screen.getAllByText('Rest Day');
      expect(restDays.length).toBe(4);
    });

    it('should call onSelectWorkout when workout card is clicked', () => {
      render(<WeeklyCalendar {...defaultProps} selectedWeekNumber={1} />);

      const workoutCard = screen.getByText('Lower Body Strength');
      fireEvent.click(workoutCard);

      expect(mockOnSelectWorkout).toHaveBeenCalled();
    });
  });

  describe('Selected Workout', () => {
    it('should highlight selected workout', () => {
      render(
        <WeeklyCalendar
          {...defaultProps}
          selectedWeekNumber={1}
          selectedWorkout={mockWorkout}
        />
      );

      // The selected card should have ring styling (via WorkoutCard)
      const workoutCard = screen.getByText(mockWorkout.name).closest('.p-3');
      expect(workoutCard).toHaveClass('ring-2');
    });
  });
});
