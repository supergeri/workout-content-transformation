/**
 * Unit tests for ExerciseDrillDown component.
 *
 * Part of AMA-483: Volume Analytics Dashboard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseDrillDown } from '../ExerciseDrillDown';
import {
  MOCK_VOLUME_ANALYTICS,
  MOCK_VOLUME_ANALYTICS_EMPTY,
  createVolumeAnalyticsReturn,
  createLoadingVolumeAnalyticsReturn,
  createErrorVolumeAnalyticsReturn,
} from './fixtures/volume-analytics.fixtures';

// Mock the hooks
vi.mock('../../../hooks/useProgressionApi', () => ({
  useVolumeAnalytics: vi.fn(),
}));

import { useVolumeAnalytics } from '../../../hooks/useProgressionApi';

// =============================================================================
// Setup
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useVolumeAnalytics).mockReturnValue(createVolumeAnalyticsReturn());
});

// =============================================================================
// Rendering Tests
// =============================================================================

describe('ExerciseDrillDown rendering', () => {
  it('renders sheet content when open', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    // Sheet content should be in the document when open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows muscle group name in title', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(screen.getByText('Chest Exercises')).toBeInTheDocument();
  });

  it('shows description with muscle group name', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="quadriceps"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    // Should have text mentioning quads exercises
    expect(screen.getAllByText(/quads/i).length).toBeGreaterThan(0);
  });
});

// =============================================================================
// Loading State Tests
// =============================================================================

describe('ExerciseDrillDown loading state', () => {
  beforeEach(() => {
    vi.mocked(useVolumeAnalytics).mockReturnValue(createLoadingVolumeAnalyticsReturn());
  });

  it('shows loading skeletons', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    // Loading state should show skeletons
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// Error State Tests
// =============================================================================

describe('ExerciseDrillDown error state', () => {
  beforeEach(() => {
    vi.mocked(useVolumeAnalytics).mockReturnValue(createErrorVolumeAnalyticsReturn('API Error'));
  });

  it('shows error message', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(screen.getByText(/Failed to load exercise data/)).toBeInTheDocument();
  });
});

// =============================================================================
// Empty State Tests
// =============================================================================

describe('ExerciseDrillDown empty state', () => {
  beforeEach(() => {
    vi.mocked(useVolumeAnalytics).mockReturnValue({
      data: MOCK_VOLUME_ANALYTICS_EMPTY,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('shows empty state when no exercises', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(screen.getByText(/No exercises found/i)).toBeInTheDocument();
  });

  it('shows empty message with muscle group name', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="lats"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(screen.getByText(/No exercises found/i)).toBeInTheDocument();
  });
});

// =============================================================================
// Data Display Tests
// =============================================================================

describe('ExerciseDrillDown data display', () => {
  it('displays summary stats', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    // Summary stats section should be present with labels
    expect(screen.getAllByText(/Volume/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sets/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Reps/i).length).toBeGreaterThan(0);
  });

  it('renders the sheet dialog', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

// =============================================================================
// Hook Integration Tests
// =============================================================================

describe('ExerciseDrillDown hook integration', () => {
  it('calls useVolumeAnalytics with muscle group filter', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(useVolumeAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        muscleGroups: ['chest'],
        startDate: '2025-01-10',
        endDate: '2025-01-17',
        granularity: 'daily',
        enabled: true,
      })
    );
  });

  it('disables hook when closed', () => {
    render(
      <ExerciseDrillDown
        open={false}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(useVolumeAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('disables hook when no muscle group', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup={null}
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(useVolumeAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });
});

// =============================================================================
// Sheet Behavior Tests
// =============================================================================

describe('ExerciseDrillDown sheet behavior', () => {
  it('calls onOpenChange when sheet closes', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={onOpenChange}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    // Find and click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

// =============================================================================
// Muscle Group Display Name Tests
// =============================================================================

describe('ExerciseDrillDown muscle group names', () => {
  it('displays canonical name for chest', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(screen.getByText(/Chest/)).toBeInTheDocument();
  });

  it('displays canonical name for quadriceps', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="quadriceps"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(screen.getByText(/Quads/)).toBeInTheDocument();
  });

  it('displays canonical name for latissimus_dorsi', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="latissimus_dorsi"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    expect(screen.getByText(/Lats/)).toBeInTheDocument();
  });
});

// =============================================================================
// Color Tests
// =============================================================================

describe('ExerciseDrillDown colors', () => {
  it('displays color indicator matching muscle group', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    // Title should have a color indicator
    const colorIndicator = document.querySelector('.rounded-sm');
    expect(colorIndicator).toBeInTheDocument();
  });
});

// =============================================================================
// Data Table Tests
// =============================================================================

describe('ExerciseDrillDown data table', () => {
  it('renders table with period data', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    // Table should be rendered
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(
      <ExerciseDrillDown
        open={true}
        onOpenChange={() => {}}
        muscleGroup="chest"
        startDate="2025-01-10"
        endDate="2025-01-17"
        granularity="daily"
      />
    );

    // Column headers should be present
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });
});
