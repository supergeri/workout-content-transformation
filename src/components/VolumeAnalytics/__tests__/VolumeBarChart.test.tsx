/**
 * Unit tests for VolumeBarChart component.
 *
 * Part of AMA-483: Volume Analytics Dashboard
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VolumeBarChart } from '../VolumeBarChart';
import { MOCK_VOLUME_DATA_POINTS } from './fixtures/volume-analytics.fixtures';

// Mock Recharts ResponsiveContainer
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 500, height: 300 }}>
        {children}
      </div>
    ),
  };
});

// =============================================================================
// Rendering Tests
// =============================================================================

describe('VolumeBarChart rendering', () => {
  it('renders the chart container', () => {
    render(
      <VolumeBarChart
        data={MOCK_VOLUME_DATA_POINTS}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });

  it('renders chart title', () => {
    render(
      <VolumeBarChart
        data={MOCK_VOLUME_DATA_POINTS}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByText('Volume by Muscle Group')).toBeInTheDocument();
  });

  it('renders ResponsiveContainer', () => {
    render(
      <VolumeBarChart
        data={MOCK_VOLUME_DATA_POINTS}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});

// =============================================================================
// Loading State Tests
// =============================================================================

describe('VolumeBarChart loading state', () => {
  it('shows loading skeleton', () => {
    render(
      <VolumeBarChart
        data={[]}
        granularity="daily"
        isLoading={true}
      />
    );

    expect(screen.getByTestId('volume-bar-chart-loading')).toBeInTheDocument();
  });

  it('shows chart title while loading', () => {
    render(
      <VolumeBarChart
        data={[]}
        granularity="daily"
        isLoading={true}
      />
    );

    expect(screen.getByText('Volume by Muscle Group')).toBeInTheDocument();
  });
});

// =============================================================================
// Empty State Tests
// =============================================================================

describe('VolumeBarChart empty state', () => {
  it('shows empty state when data is empty', () => {
    render(
      <VolumeBarChart
        data={[]}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('volume-bar-chart-empty')).toBeInTheDocument();
  });

  it('shows empty state message', () => {
    render(
      <VolumeBarChart
        data={[]}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByText('No volume data available for this period')).toBeInTheDocument();
  });
});

// =============================================================================
// Granularity Tests
// =============================================================================

describe('VolumeBarChart granularity handling', () => {
  it('renders with daily granularity', () => {
    render(
      <VolumeBarChart
        data={MOCK_VOLUME_DATA_POINTS}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });

  it('renders with weekly granularity', () => {
    render(
      <VolumeBarChart
        data={MOCK_VOLUME_DATA_POINTS}
        granularity="weekly"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });

  it('renders with monthly granularity', () => {
    render(
      <VolumeBarChart
        data={MOCK_VOLUME_DATA_POINTS}
        granularity="monthly"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });
});

// =============================================================================
// Click Handler Tests
// =============================================================================

describe('VolumeBarChart click handlers', () => {
  it('accepts onMuscleGroupClick prop', () => {
    const onClick = vi.fn();

    render(
      <VolumeBarChart
        data={MOCK_VOLUME_DATA_POINTS}
        granularity="daily"
        isLoading={false}
        onMuscleGroupClick={onClick}
      />
    );

    // Component should render without errors
    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });

  it('renders without click handler', () => {
    render(
      <VolumeBarChart
        data={MOCK_VOLUME_DATA_POINTS}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });
});

// =============================================================================
// Data Transformation Tests
// =============================================================================

describe('VolumeBarChart data handling', () => {
  it('handles single data point', () => {
    const singlePoint = [MOCK_VOLUME_DATA_POINTS[0]];

    render(
      <VolumeBarChart
        data={singlePoint}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });

  it('handles data with single muscle group', () => {
    const singleMuscle = MOCK_VOLUME_DATA_POINTS.filter(d => d.muscleGroup === 'chest');

    render(
      <VolumeBarChart
        data={singleMuscle}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });

  it('handles data with multiple periods', () => {
    render(
      <VolumeBarChart
        data={MOCK_VOLUME_DATA_POINTS}
        granularity="daily"
        isLoading={false}
      />
    );

    // MOCK_VOLUME_DATA_POINTS has data for multiple dates
    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });
});

// =============================================================================
// Legend Tests
// =============================================================================

describe('VolumeBarChart legend', () => {
  it('renders chart container when data is present', () => {
    render(
      <VolumeBarChart
        data={MOCK_VOLUME_DATA_POINTS}
        granularity="daily"
        isLoading={false}
      />
    );

    // Since Recharts is mocked, we just verify the chart renders
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});

// =============================================================================
// Edge Cases Tests
// =============================================================================

describe('VolumeBarChart edge cases', () => {
  it('handles null data gracefully', () => {
    render(
      <VolumeBarChart
        data={null as unknown as typeof MOCK_VOLUME_DATA_POINTS}
        granularity="daily"
        isLoading={false}
      />
    );

    // Should show empty state without crashing
    expect(screen.getByTestId('volume-bar-chart-empty')).toBeInTheDocument();
  });

  it('handles very large volume values', () => {
    const largeData = [
      { period: '2025-01-15', muscleGroup: 'chest', totalVolume: 5000000, totalSets: 100, totalReps: 1000 },
    ];

    render(
      <VolumeBarChart
        data={largeData}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });

  it('handles zero volume values', () => {
    const zeroData = [
      { period: '2025-01-15', muscleGroup: 'chest', totalVolume: 0, totalSets: 0, totalReps: 0 },
    ];

    render(
      <VolumeBarChart
        data={zeroData}
        granularity="daily"
        isLoading={false}
      />
    );

    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
  });
});
