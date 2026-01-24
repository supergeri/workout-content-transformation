/**
 * Tests for PeriodSelector component and utility functions.
 *
 * Part of AMA-483: Volume Analytics Dashboard
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PeriodSelector, getPeriodDates, type VolumePeriod } from '../PeriodSelector';

// =============================================================================
// PeriodSelector Component Tests
// =============================================================================

describe('PeriodSelector', () => {
  it('renders all period options', () => {
    const onChange = vi.fn();
    render(<PeriodSelector value="weekly" onChange={onChange} />);

    expect(screen.getByTestId('period-option-weekly')).toBeInTheDocument();
    expect(screen.getByTestId('period-option-monthly')).toBeInTheDocument();
    expect(screen.getByTestId('period-option-quarterly')).toBeInTheDocument();
  });

  it('shows correct text labels', () => {
    const onChange = vi.fn();
    render(<PeriodSelector value="weekly" onChange={onChange} />);

    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Quarterly')).toBeInTheDocument();
  });

  it('calls onChange when option clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PeriodSelector value="weekly" onChange={onChange} />);

    await user.click(screen.getByTestId('period-option-monthly'));

    expect(onChange).toHaveBeenCalledWith('monthly');
  });

  it('applies correct variant to selected option', () => {
    const onChange = vi.fn();
    render(<PeriodSelector value="monthly" onChange={onChange} />);

    const monthlyButton = screen.getByTestId('period-option-monthly');
    const weeklyButton = screen.getByTestId('period-option-weekly');
    const quarterlyButton = screen.getByTestId('period-option-quarterly');

    // All buttons should be rendered and clickable
    expect(monthlyButton).toBeInTheDocument();
    expect(weeklyButton).toBeInTheDocument();
    expect(quarterlyButton).toBeInTheDocument();

    // Selected button (monthly) should have different styling
    // The exact class depends on the Button component implementation
    expect(monthlyButton.className).not.toBe(weeklyButton.className);
  });

  it('updates visual state when selection changes', () => {
    const onChange = vi.fn();
    const { rerender } = render(<PeriodSelector value="weekly" onChange={onChange} />);

    const weeklyButton = screen.getByTestId('period-option-weekly');
    const monthlyButton = screen.getByTestId('period-option-monthly');

    // Capture initial classes
    const weeklySelectedClass = weeklyButton.className;
    const monthlyUnselectedClass = monthlyButton.className;

    // Change to monthly
    rerender(<PeriodSelector value="monthly" onChange={onChange} />);

    // Classes should be swapped
    expect(screen.getByTestId('period-option-monthly').className).toBe(weeklySelectedClass);
    expect(screen.getByTestId('period-option-weekly').className).toBe(monthlyUnselectedClass);
  });
});

// =============================================================================
// getPeriodDates Utility Tests
// =============================================================================

describe('getPeriodDates', () => {
  // Mock the current date for consistent tests
  const mockNow = new Date('2025-01-15T12:00:00Z');

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('weekly period', () => {
    it('returns 7-day date range', () => {
      const { current } = getPeriodDates('weekly');

      const startDate = new Date(current.startDate);
      const endDate = new Date(current.endDate);
      const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      expect(diffDays).toBe(7);
    });

    it('returns daily granularity', () => {
      const { granularity } = getPeriodDates('weekly');
      expect(granularity).toBe('daily');
    });

    it('previous period ends where current starts', () => {
      const { current, previous } = getPeriodDates('weekly');
      expect(previous.endDate).toBe(current.startDate);
    });
  });

  describe('monthly period', () => {
    it('returns 30-day date range', () => {
      const { current } = getPeriodDates('monthly');

      const startDate = new Date(current.startDate);
      const endDate = new Date(current.endDate);
      const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      expect(diffDays).toBe(30);
    });

    it('returns weekly granularity', () => {
      const { granularity } = getPeriodDates('monthly');
      expect(granularity).toBe('weekly');
    });
  });

  describe('quarterly period', () => {
    it('returns 90-day date range', () => {
      const { current } = getPeriodDates('quarterly');

      const startDate = new Date(current.startDate);
      const endDate = new Date(current.endDate);
      const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      expect(diffDays).toBe(90);
    });

    it('returns monthly granularity', () => {
      const { granularity } = getPeriodDates('quarterly');
      expect(granularity).toBe('monthly');
    });
  });

  describe('all periods', () => {
    it('endDate is today', () => {
      const periods: VolumePeriod[] = ['weekly', 'monthly', 'quarterly'];

      periods.forEach((period) => {
        const { current } = getPeriodDates(period);
        expect(current.endDate).toBe('2025-01-15');
      });
    });

    it('previous period has same duration as current', () => {
      const periods: VolumePeriod[] = ['weekly', 'monthly', 'quarterly'];

      periods.forEach((period) => {
        const { current, previous } = getPeriodDates(period);

        const currentStart = new Date(current.startDate);
        const currentEnd = new Date(current.endDate);
        const currentDuration = currentEnd.getTime() - currentStart.getTime();

        const previousStart = new Date(previous.startDate);
        const previousEnd = new Date(previous.endDate);
        const previousDuration = previousEnd.getTime() - previousStart.getTime();

        expect(previousDuration).toBe(currentDuration);
      });
    });
  });
});
