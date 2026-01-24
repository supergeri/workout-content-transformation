/**
 * Integration tests for VolumeAnalytics main component.
 *
 * Part of AMA-483: Volume Analytics Dashboard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VolumeAnalytics } from '../VolumeAnalytics';
import {
  MOCK_VOLUME_ANALYTICS,
  MOCK_VOLUME_ANALYTICS_EMPTY,
  createVolumeAnalyticsReturn,
  createEmptyVolumeAnalyticsReturn,
  createLoadingVolumeAnalyticsReturn,
  createErrorVolumeAnalyticsReturn,
} from './fixtures/volume-analytics.fixtures';

// Mock the hooks
vi.mock('../../../hooks/useProgressionApi', () => ({
  useVolumeAnalytics: vi.fn(),
}));

import { useVolumeAnalytics } from '../../../hooks/useProgressionApi';

// Mock Recharts ResponsiveContainer for chart tests
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

const mockUser = { id: 'user-123', name: 'Test User' };

// =============================================================================
// Setup
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();

  // Default mock: return data for all calls (current, previous, drill-down)
  vi.mocked(useVolumeAnalytics).mockReturnValue(createVolumeAnalyticsReturn());
});

// =============================================================================
// Initial Render Tests
// =============================================================================

describe('VolumeAnalytics initial render', () => {
  it('shows page header and description', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByText('Volume Analytics')).toBeInTheDocument();
    expect(
      screen.getByText('Track your training volume by muscle group over time')
    ).toBeInTheDocument();
  });

  it('renders period selector with default weekly selection', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('period-selector')).toBeInTheDocument();
    // Weekly button should be visible
    expect(screen.getByTestId('period-option-weekly')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('volume-summary-cards')).toBeInTheDocument();
    expect(screen.getByText('Total Volume')).toBeInTheDocument();
    expect(screen.getByText('Total Sets')).toBeInTheDocument();
    expect(screen.getByText('Total Reps')).toBeInTheDocument();
    expect(screen.getByText('Active Muscle Groups')).toBeInTheDocument();
  });

  it('renders bar chart', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('volume-bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Volume by Muscle Group')).toBeInTheDocument();
  });

  it('renders balance indicators', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('balance-indicators')).toBeInTheDocument();
    expect(screen.getByText('Push / Pull Balance')).toBeInTheDocument();
    expect(screen.getByText('Upper / Lower Balance')).toBeInTheDocument();
  });

  it('renders muscle group breakdown table', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('muscle-group-breakdown')).toBeInTheDocument();
    expect(screen.getByText('Muscle Group Breakdown')).toBeInTheDocument();
  });
});

// =============================================================================
// Empty State Tests
// =============================================================================

describe('VolumeAnalytics empty state', () => {
  beforeEach(() => {
    vi.mocked(useVolumeAnalytics)
      .mockReset()
      .mockReturnValue(createEmptyVolumeAnalyticsReturn());
  });

  it('shows empty state when no volume data', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('volume-analytics-empty')).toBeInTheDocument();
    expect(screen.getByText('No Volume Data Yet')).toBeInTheDocument();
  });

  it('shows guidance about tracking', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(
      screen.getByText(/Complete workouts with tracked weight and reps/)
    ).toBeInTheDocument();
  });

  it('shows badge explaining volume calculation', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByText('Volume = Weight x Reps per set')).toBeInTheDocument();
  });
});

// =============================================================================
// Loading State Tests
// =============================================================================

describe('VolumeAnalytics loading states', () => {
  beforeEach(() => {
    vi.mocked(useVolumeAnalytics)
      .mockReset()
      .mockReturnValue(createLoadingVolumeAnalyticsReturn());
  });

  it('shows skeleton loading in summary cards', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('volume-summary-loading')).toBeInTheDocument();
  });

  it('shows skeleton loading in bar chart', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('volume-bar-chart-loading')).toBeInTheDocument();
  });

  it('shows skeleton loading in balance indicators', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('balance-indicators-loading')).toBeInTheDocument();
  });

  it('shows skeleton loading in muscle group breakdown', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('muscle-group-breakdown-loading')).toBeInTheDocument();
  });
});

// =============================================================================
// Error State Tests
// =============================================================================

describe('VolumeAnalytics error states', () => {
  beforeEach(() => {
    vi.mocked(useVolumeAnalytics)
      .mockReset()
      .mockReturnValue(createErrorVolumeAnalyticsReturn('Network error'));
  });

  it('shows error message when fetch fails', () => {
    render(<VolumeAnalytics user={mockUser} />);

    expect(screen.getByTestId('volume-analytics-error')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load volume data/)).toBeInTheDocument();
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });
});

// =============================================================================
// Period Selection Tests
// =============================================================================

describe('VolumeAnalytics period selection', () => {
  beforeEach(() => {
    vi.mocked(useVolumeAnalytics)
      .mockReset()
      .mockReturnValue(createVolumeAnalyticsReturn());
  });

  it('can switch to monthly period', async () => {
    const user = userEvent.setup();
    render(<VolumeAnalytics user={mockUser} />);

    await user.click(screen.getByTestId('period-option-monthly'));

    // Hook should be called with monthly granularity
    expect(useVolumeAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        granularity: 'weekly', // monthly period uses weekly granularity
      })
    );
  });

  it('can switch to quarterly period', async () => {
    const user = userEvent.setup();
    render(<VolumeAnalytics user={mockUser} />);

    await user.click(screen.getByTestId('period-option-quarterly'));

    // Hook should be called with monthly granularity for quarterly
    expect(useVolumeAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        granularity: 'monthly',
      })
    );
  });
});

// =============================================================================
// Summary Cards Content Tests
// =============================================================================

describe('VolumeAnalytics summary cards content', () => {
  beforeEach(() => {
    vi.mocked(useVolumeAnalytics)
      .mockReset()
      .mockReturnValue(createVolumeAnalyticsReturn());
  });

  it('displays total volume', () => {
    render(<VolumeAnalytics user={mockUser} />);

    // MOCK_VOLUME_SUMMARY has totalVolume: 72000 -> "72.0K lbs"
    expect(screen.getByTestId('stat-value-total-volume')).toHaveTextContent('72.0K lbs');
  });

  it('displays total sets', () => {
    render(<VolumeAnalytics user={mockUser} />);

    // MOCK_VOLUME_SUMMARY has totalSets: 72
    expect(screen.getByTestId('stat-value-total-sets')).toHaveTextContent('72');
  });

  it('displays total reps', () => {
    render(<VolumeAnalytics user={mockUser} />);

    // MOCK_VOLUME_SUMMARY has totalReps: 560
    expect(screen.getByTestId('stat-value-total-reps')).toHaveTextContent('560');
  });

  it('displays active muscle groups count', () => {
    render(<VolumeAnalytics user={mockUser} />);

    // MOCK_VOLUME_SUMMARY has 7 muscle groups
    expect(screen.getByTestId('stat-value-muscle-groups')).toHaveTextContent('7');
  });
});

// =============================================================================
// Hook Integration Tests
// =============================================================================

describe('VolumeAnalytics hook integration', () => {
  beforeEach(() => {
    vi.mocked(useVolumeAnalytics).mockReset();
  });

  it('calls useVolumeAnalytics with correct date range parameters', () => {
    vi.mocked(useVolumeAnalytics).mockReturnValue(createVolumeAnalyticsReturn());

    render(<VolumeAnalytics user={mockUser} />);

    // Should be called at least twice: current and previous period
    // (ExerciseDrillDown also calls it when mounted, even if closed)
    expect(useVolumeAnalytics).toHaveBeenCalledTimes(3);

    // First call should have current period dates
    expect(useVolumeAnalytics).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        startDate: expect.any(String),
        endDate: expect.any(String),
        granularity: 'daily', // weekly period uses daily granularity
      })
    );

    // Second call should have previous period dates
    expect(useVolumeAnalytics).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        startDate: expect.any(String),
        endDate: expect.any(String),
        granularity: 'daily',
      })
    );
  });
});
