/**
 * Unit tests for VolumeSummaryCards component.
 *
 * Part of AMA-483: Volume Analytics Dashboard
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VolumeSummaryCards } from '../VolumeSummaryCards';
import {
  MOCK_VOLUME_SUMMARY,
  MOCK_VOLUME_SUMMARY_PREVIOUS,
  MOCK_VOLUME_SUMMARY_EMPTY,
} from './fixtures/volume-analytics.fixtures';

// =============================================================================
// Rendering Tests
// =============================================================================

describe('VolumeSummaryCards rendering', () => {
  it('renders all four stat cards', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={MOCK_VOLUME_SUMMARY_PREVIOUS}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('stat-card-total-volume')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-total-sets')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-total-reps')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-muscle-groups')).toBeInTheDocument();
  });

  it('renders card titles', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={MOCK_VOLUME_SUMMARY_PREVIOUS}
        isLoading={false}
      />
    );

    expect(screen.getByText('Total Volume')).toBeInTheDocument();
    expect(screen.getByText('Total Sets')).toBeInTheDocument();
    expect(screen.getByText('Total Reps')).toBeInTheDocument();
    expect(screen.getByText('Active Muscle Groups')).toBeInTheDocument();
  });

  it('renders "vs previous" labels', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={MOCK_VOLUME_SUMMARY_PREVIOUS}
        isLoading={false}
      />
    );

    const vsLabels = screen.getAllByText('vs previous');
    expect(vsLabels.length).toBe(4);
  });
});

// =============================================================================
// Loading State Tests
// =============================================================================

describe('VolumeSummaryCards loading state', () => {
  it('shows loading skeletons', () => {
    render(
      <VolumeSummaryCards
        current={null}
        previous={null}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('volume-summary-loading')).toBeInTheDocument();
  });

  it('renders skeleton cards when loading', () => {
    render(
      <VolumeSummaryCards
        current={null}
        previous={null}
        isLoading={true}
      />
    );

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// Value Display Tests
// =============================================================================

describe('VolumeSummaryCards value display', () => {
  it('displays total volume with formatting', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={null}
        isLoading={false}
      />
    );

    // 72000 -> "72.0K lbs"
    expect(screen.getByTestId('stat-value-total-volume')).toHaveTextContent('72.0K lbs');
  });

  it('displays total sets', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={null}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('stat-value-total-sets')).toHaveTextContent('72');
  });

  it('displays total reps', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={null}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('stat-value-total-reps')).toHaveTextContent('560');
  });

  it('displays active muscle groups count', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={null}
        isLoading={false}
      />
    );

    // MOCK_VOLUME_SUMMARY has 7 muscle groups
    expect(screen.getByTestId('stat-value-muscle-groups')).toHaveTextContent('7');
  });
});

// =============================================================================
// Volume Formatting Tests
// =============================================================================

describe('VolumeSummaryCards volume formatting', () => {
  it('formats values under 1000 as plain numbers', () => {
    const smallVolume = {
      ...MOCK_VOLUME_SUMMARY,
      totalVolume: 500,
      totalReps: 50,
    };

    render(
      <VolumeSummaryCards
        current={smallVolume}
        previous={null}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('stat-value-total-volume')).toHaveTextContent('500 lbs');
  });

  it('formats values over 1000 with K suffix', () => {
    const mediumVolume = {
      ...MOCK_VOLUME_SUMMARY,
      totalVolume: 5500,
    };

    render(
      <VolumeSummaryCards
        current={mediumVolume}
        previous={null}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('stat-value-total-volume')).toHaveTextContent('5.5K lbs');
  });

  it('formats values over 1000000 with M suffix', () => {
    const largeVolume = {
      ...MOCK_VOLUME_SUMMARY,
      totalVolume: 1500000,
    };

    render(
      <VolumeSummaryCards
        current={largeVolume}
        previous={null}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('stat-value-total-volume')).toHaveTextContent('1.5M lbs');
  });
});

// =============================================================================
// Percent Change Tests
// =============================================================================

describe('VolumeSummaryCards percent change', () => {
  it('shows positive change indicator when current > previous', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={MOCK_VOLUME_SUMMARY_PREVIOUS}
        isLoading={false}
      />
    );

    // 72000 vs 65000 = ~10.8% increase
    const changeIndicators = screen.getAllByTestId('change-indicator');
    expect(changeIndicators.length).toBeGreaterThan(0);

    // At least one should show positive percentage
    const positiveChange = changeIndicators.find(el => el.textContent?.includes('11%'));
    expect(positiveChange).toBeTruthy();
  });

  it('shows negative change indicator when current < previous', () => {
    const decreasedCurrent = {
      ...MOCK_VOLUME_SUMMARY,
      totalVolume: 50000,
    };

    render(
      <VolumeSummaryCards
        current={decreasedCurrent}
        previous={MOCK_VOLUME_SUMMARY_PREVIOUS}
        isLoading={false}
      />
    );

    // 50000 vs 65000 = ~23% decrease
    const changeIndicators = screen.getAllByTestId('change-indicator');
    const negativeChange = changeIndicators.find(el => el.textContent?.includes('23%'));
    expect(negativeChange).toBeTruthy();
  });

  it('handles zero previous value', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={MOCK_VOLUME_SUMMARY_EMPTY}
        isLoading={false}
      />
    );

    // Should show 100% increase when previous is 0
    const changeIndicators = screen.getAllByTestId('change-indicator');
    expect(changeIndicators.length).toBeGreaterThan(0);
  });

  it('handles null previous data', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={null}
        isLoading={false}
      />
    );

    // Should render without crashing
    expect(screen.getByTestId('volume-summary-cards')).toBeInTheDocument();
  });
});

// =============================================================================
// Empty/Null Data Tests
// =============================================================================

describe('VolumeSummaryCards empty data', () => {
  it('shows zero values when current is null', () => {
    render(
      <VolumeSummaryCards
        current={null}
        previous={null}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('stat-value-total-volume')).toHaveTextContent('0 lbs');
    expect(screen.getByTestId('stat-value-total-sets')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-value-total-reps')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-value-muscle-groups')).toHaveTextContent('0');
  });

  it('shows zero values when current has empty breakdown', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY_EMPTY}
        previous={null}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('stat-value-muscle-groups')).toHaveTextContent('0');
  });
});

// =============================================================================
// Edge Cases Tests
// =============================================================================

describe('VolumeSummaryCards edge cases', () => {
  it('handles same current and previous values (0% change)', () => {
    render(
      <VolumeSummaryCards
        current={MOCK_VOLUME_SUMMARY}
        previous={MOCK_VOLUME_SUMMARY}
        isLoading={false}
      />
    );

    // Should show 0% or dash for no change
    expect(screen.getByTestId('volume-summary-cards')).toBeInTheDocument();
  });

  it('handles very large set counts', () => {
    const largeSets = {
      ...MOCK_VOLUME_SUMMARY,
      totalSets: 9999,
    };

    render(
      <VolumeSummaryCards
        current={largeSets}
        previous={null}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('stat-value-total-sets')).toHaveTextContent('9,999');
  });
});
