/**
 * Unit tests for BalanceIndicators component.
 *
 * Part of AMA-483: Volume Analytics Dashboard
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalanceIndicators } from '../BalanceIndicators';
import {
  MOCK_BALANCED_BREAKDOWN,
  MOCK_PUSH_HEAVY_BREAKDOWN,
  MOCK_UPPER_LOWER_BALANCED,
  MOCK_UPPER_HEAVY_BREAKDOWN,
} from './fixtures/volume-analytics.fixtures';

// =============================================================================
// Rendering Tests
// =============================================================================

describe('BalanceIndicators rendering', () => {
  it('renders both balance cards', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={MOCK_BALANCED_BREAKDOWN}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('push-pull-balance')).toBeInTheDocument();
    expect(screen.getByTestId('upper-lower-balance')).toBeInTheDocument();
  });

  it('renders card titles', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={MOCK_BALANCED_BREAKDOWN}
        isLoading={false}
      />
    );

    expect(screen.getByText('Push / Pull Balance')).toBeInTheDocument();
    expect(screen.getByText('Upper / Lower Balance')).toBeInTheDocument();
  });

  it('displays volume amounts for each group', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={MOCK_BALANCED_BREAKDOWN}
        isLoading={false}
      />
    );

    // Push: 10000 + 5000 = 15000 -> 15K
    // Pull: 10000 + 5000 = 15000 -> 15K
    expect(screen.getAllByText('15.0K').length).toBeGreaterThanOrEqual(2);
  });
});

// =============================================================================
// Loading State Tests
// =============================================================================

describe('BalanceIndicators loading state', () => {
  it('shows skeleton loading', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={null}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('balance-indicators-loading')).toBeInTheDocument();
  });

  it('shows skeleton cards when loading', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={null}
        isLoading={true}
      />
    );

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// Empty State Tests
// =============================================================================

describe('BalanceIndicators empty state', () => {
  it('shows empty state when breakdown is null', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={null}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('balance-indicators-empty')).toBeInTheDocument();
  });

  it('shows empty state when breakdown is empty object', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={{}}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('balance-indicators-empty')).toBeInTheDocument();
  });

  it('shows "No volume data available" messages', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={null}
        isLoading={false}
      />
    );

    const noDataMessages = screen.getAllByText('No volume data available');
    expect(noDataMessages.length).toBe(2);
  });
});

// =============================================================================
// Push/Pull Balance Tests
// =============================================================================

describe('BalanceIndicators push/pull balance', () => {
  it('shows balanced status for 1:1 ratio', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={MOCK_BALANCED_BREAKDOWN}
        isLoading={false}
      />
    );

    const pushPullCard = screen.getByTestId('push-pull-balance');
    expect(pushPullCard).toHaveTextContent('Balanced');
  });

  it('shows ratio value for balanced breakdown', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={MOCK_BALANCED_BREAKDOWN}
        isLoading={false}
      />
    );

    // 15000 push / 15000 pull = 1.00
    expect(screen.getByText('Ratio: 1.00:1')).toBeInTheDocument();
  });

  it('shows imbalanced status for heavy push ratio', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={MOCK_PUSH_HEAVY_BREAKDOWN}
        isLoading={false}
      />
    );

    const pushPullCard = screen.getByTestId('push-pull-balance');
    // 30000 push / 7500 pull = 4.0 ratio -> imbalanced
    expect(pushPullCard).toHaveTextContent('Needs Attention');
  });

  it('displays Push and Pull labels', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={MOCK_BALANCED_BREAKDOWN}
        isLoading={false}
      />
    );

    expect(screen.getByText('Push')).toBeInTheDocument();
    expect(screen.getByText('Pull')).toBeInTheDocument();
  });
});

// =============================================================================
// Upper/Lower Balance Tests
// =============================================================================

describe('BalanceIndicators upper/lower balance', () => {
  it('shows balanced status for balanced upper/lower', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={MOCK_UPPER_LOWER_BALANCED}
        isLoading={false}
      />
    );

    const upperLowerCard = screen.getByTestId('upper-lower-balance');
    // 20000 upper / 20000 lower = 1.0 ratio -> balanced
    expect(upperLowerCard).toHaveTextContent('Balanced');
  });

  it('shows imbalanced status for heavy upper ratio', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={MOCK_UPPER_HEAVY_BREAKDOWN}
        isLoading={false}
      />
    );

    const upperLowerCard = screen.getByTestId('upper-lower-balance');
    // 35000 upper / 5000 lower = 7.0 ratio -> imbalanced
    expect(upperLowerCard).toHaveTextContent('Needs Attention');
  });

  it('displays Upper and Lower labels', () => {
    render(
      <BalanceIndicators
        muscleGroupBreakdown={MOCK_BALANCED_BREAKDOWN}
        isLoading={false}
      />
    );

    expect(screen.getByText('Upper')).toBeInTheDocument();
    expect(screen.getByText('Lower')).toBeInTheDocument();
  });
});

// =============================================================================
// Balance Status Thresholds Tests
// =============================================================================

describe('BalanceIndicators status thresholds', () => {
  it('shows balanced for ratio at 0.8 boundary', () => {
    // Create breakdown with 0.8 push/pull ratio
    const breakdown = {
      chest: 8000,   // push
      lats: 10000,   // pull
    };

    render(
      <BalanceIndicators
        muscleGroupBreakdown={breakdown}
        isLoading={false}
      />
    );

    const pushPullCard = screen.getByTestId('push-pull-balance');
    expect(pushPullCard).toHaveTextContent('Balanced');
  });

  it('shows balanced for ratio at 1.2 boundary', () => {
    // Create breakdown with 1.2 push/pull ratio
    const breakdown = {
      chest: 12000,  // push
      lats: 10000,   // pull
    };

    render(
      <BalanceIndicators
        muscleGroupBreakdown={breakdown}
        isLoading={false}
      />
    );

    const pushPullCard = screen.getByTestId('push-pull-balance');
    expect(pushPullCard).toHaveTextContent('Balanced');
  });

  it('shows slight imbalance for ratio at 0.7', () => {
    // Create breakdown with 0.7 push/pull ratio
    const breakdown = {
      chest: 7000,   // push
      lats: 10000,   // pull
    };

    render(
      <BalanceIndicators
        muscleGroupBreakdown={breakdown}
        isLoading={false}
      />
    );

    const pushPullCard = screen.getByTestId('push-pull-balance');
    expect(pushPullCard).toHaveTextContent('Slightly Off');
  });

  it('shows slight imbalance for ratio at 1.4', () => {
    // Create breakdown with 1.4 push/pull ratio
    const breakdown = {
      chest: 14000,  // push
      lats: 10000,   // pull
    };

    render(
      <BalanceIndicators
        muscleGroupBreakdown={breakdown}
        isLoading={false}
      />
    );

    const pushPullCard = screen.getByTestId('push-pull-balance');
    expect(pushPullCard).toHaveTextContent('Slightly Off');
  });

  it('shows needs attention for ratio below 0.5', () => {
    // Create breakdown with 0.4 push/pull ratio
    const breakdown = {
      chest: 4000,   // push
      lats: 10000,   // pull
    };

    render(
      <BalanceIndicators
        muscleGroupBreakdown={breakdown}
        isLoading={false}
      />
    );

    const pushPullCard = screen.getByTestId('push-pull-balance');
    expect(pushPullCard).toHaveTextContent('Needs Attention');
  });

  it('shows needs attention for ratio above 1.5', () => {
    // Create breakdown with 2.0 push/pull ratio
    const breakdown = {
      chest: 20000,  // push
      lats: 10000,   // pull
    };

    render(
      <BalanceIndicators
        muscleGroupBreakdown={breakdown}
        isLoading={false}
      />
    );

    const pushPullCard = screen.getByTestId('push-pull-balance');
    expect(pushPullCard).toHaveTextContent('Needs Attention');
  });
});

// =============================================================================
// Edge Cases Tests
// =============================================================================

describe('BalanceIndicators edge cases', () => {
  it('handles zero pull volume', () => {
    const breakdown = {
      chest: 10000,  // push only
    };

    render(
      <BalanceIndicators
        muscleGroupBreakdown={breakdown}
        isLoading={false}
      />
    );

    // Should render without crashing
    expect(screen.getByTestId('push-pull-balance')).toBeInTheDocument();
  });

  it('handles zero push volume', () => {
    const breakdown = {
      lats: 10000,   // pull only
    };

    render(
      <BalanceIndicators
        muscleGroupBreakdown={breakdown}
        isLoading={false}
      />
    );

    // Should render without crashing
    expect(screen.getByTestId('push-pull-balance')).toBeInTheDocument();
  });

  it('handles only core muscles (neither push/pull nor upper/lower)', () => {
    const breakdown = {
      abs: 5000,
      obliques: 3000,
    };

    render(
      <BalanceIndicators
        muscleGroupBreakdown={breakdown}
        isLoading={false}
      />
    );

    // Should render without crashing, showing default ratio
    expect(screen.getByTestId('balance-indicators')).toBeInTheDocument();
  });

  it('handles very large volumes', () => {
    const breakdown = {
      chest: 1000000,
      lats: 1000000,
    };

    render(
      <BalanceIndicators
        muscleGroupBreakdown={breakdown}
        isLoading={false}
      />
    );

    // Should format as 1.0M
    expect(screen.getAllByText('1.0M').length).toBeGreaterThanOrEqual(1);
  });
});
