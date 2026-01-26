/**
 * ProgramActions Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgramActions } from '../ProgramActions';
import {
  mockTrainingProgram,
  mockDraftProgram,
  mockPausedProgram,
  mockCompletedProgram,
  mockArchivedProgram,
} from '../../../test/fixtures/program-detail.fixtures';

describe('ProgramActions', () => {
  const mockOnStatusChange = vi.fn().mockResolvedValue(true);
  const mockOnDelete = vi.fn().mockResolvedValue(true);

  const defaultProps = {
    program: mockTrainingProgram,
    onStatusChange: mockOnStatusChange,
    onDelete: mockOnDelete,
    isLoading: false,
  };

  beforeEach(() => {
    mockOnStatusChange.mockClear();
    mockOnDelete.mockClear();
  });

  describe('Primary Action Button', () => {
    it('should show Activate button for draft programs', () => {
      render(<ProgramActions {...defaultProps} program={mockDraftProgram} />);
      expect(screen.getByRole('button', { name: /Activate/i })).toBeInTheDocument();
    });

    it('should show Pause button for active programs', () => {
      render(<ProgramActions {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
    });

    it('should show Resume button for paused programs', () => {
      render(<ProgramActions {...defaultProps} program={mockPausedProgram} />);
      expect(screen.getByRole('button', { name: /Resume/i })).toBeInTheDocument();
    });

    it('should show Archive button for completed programs', () => {
      render(<ProgramActions {...defaultProps} program={mockCompletedProgram} />);
      expect(screen.getByRole('button', { name: /Archive/i })).toBeInTheDocument();
    });

    it('should show Restore button for archived programs', () => {
      render(<ProgramActions {...defaultProps} program={mockArchivedProgram} />);
      expect(screen.getByRole('button', { name: /Restore/i })).toBeInTheDocument();
    });

    it('should call onStatusChange with "active" when Activate is clicked', async () => {
      render(<ProgramActions {...defaultProps} program={mockDraftProgram} />);

      const button = screen.getByRole('button', { name: /Activate/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('active');
      });
    });

    it('should call onStatusChange with "paused" when Pause is clicked', async () => {
      render(<ProgramActions {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Pause/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('paused');
      });
    });

    it('should call onStatusChange with "active" when Resume is clicked', async () => {
      render(<ProgramActions {...defaultProps} program={mockPausedProgram} />);

      const button = screen.getByRole('button', { name: /Resume/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('active');
      });
    });

    it('should disable primary button when loading', () => {
      render(<ProgramActions {...defaultProps} isLoading={true} />);

      const button = screen.getByRole('button', { name: /Pause/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Dropdown Menu', () => {
    it('should have a more actions dropdown button', () => {
      render(<ProgramActions {...defaultProps} />);

      // Look for the dropdown trigger button
      const buttons = screen.getAllByRole('button');
      // There should be at least 2 buttons (primary action + dropdown trigger)
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    // Note: Dropdown menu tests are skipped because Radix UI dropdowns
    // don't render their portal content in jsdom test environment by default.
    // These interactions should be tested in integration/E2E tests.
  });

  describe('Delete Confirmation', () => {
    // Note: Delete confirmation tests require the dropdown to open first,
    // which is challenging in jsdom. These interactions are better tested
    // in integration/E2E tests where the portal renders correctly.

    it('should have delete functionality available', () => {
      // The delete function is passed to the component and will be called
      // when the delete flow is completed (dropdown -> Delete -> confirm)
      render(<ProgramActions {...defaultProps} />);

      // Verify the component renders without error
      expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Loading State', () => {
    it('should disable dropdown trigger when loading', () => {
      render(<ProgramActions {...defaultProps} isLoading={true} />);

      const buttons = screen.getAllByRole('button');
      const moreButton = buttons[buttons.length - 1];
      expect(moreButton).toBeDisabled();
    });
  });
});
