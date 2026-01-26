/**
 * ProgramsList - Main container for the programs list page
 * Handles fetching, filtering, sorting, and displaying programs
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { ProgramsHeader } from './ProgramsHeader';
import { ProgramsFilterBar, type StatusFilter, type SortBy } from './ProgramsFilterBar';
import { ProgramCard } from './ProgramCard';
import { ProgramsEmptyState } from './ProgramsEmptyState';
import { ProgramsLoadingSkeleton } from './ProgramsLoadingSkeleton';
import { ProgramWizard } from '../ProgramWizard';
import {
  getTrainingPrograms,
  updateProgramStatus,
  deleteTrainingProgram,
} from '../../lib/training-program-api';
import type { TrainingProgram, ProgramStatus } from '../../types/training-program';

interface ProgramsListProps {
  userId: string;
  onViewProgram: (programId: string) => void;
}

export function ProgramsList({ userId, onViewProgram }: ProgramsListProps) {
  // Data state
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/sort state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updated_at');

  // Modal state
  const [showWizard, setShowWizard] = useState(false);

  // Fetch programs
  const loadPrograms = useCallback(async () => {
    try {
      setError(null);
      const data = await getTrainingPrograms(userId, true); // Include archived
      setPrograms(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load programs';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  // Calculate counts for each status
  const counts = useMemo(() => {
    const result = { all: 0, active: 0, draft: 0, completed: 0 };
    programs.forEach((p) => {
      result.all++;
      if (p.status === 'active' || p.status === 'paused') {
        result.active++;
      } else if (p.status === 'draft') {
        result.draft++;
      } else if (p.status === 'completed') {
        result.completed++;
      }
    });
    return result;
  }, [programs]);

  // Filter and sort programs
  const filteredPrograms = useMemo(() => {
    let filtered = [...programs];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => {
        if (statusFilter === 'active') {
          return p.status === 'active' || p.status === 'paused';
        }
        return p.status === statusFilter;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress': {
          // Guard against division by zero
          if (a.duration_weeks === 0 || b.duration_weeks === 0) return 0;
          const progressA = (a.current_week - 1) / a.duration_weeks;
          const progressB = (b.current_week - 1) / b.duration_weeks;
          return progressB - progressA; // Higher progress first
        }
        case 'updated_at':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [programs, statusFilter, sortBy]);

  // Handle status updates
  const handleActivate = async (programId: string) => {
    try {
      const success = await updateProgramStatus(programId, userId, 'active');
      if (success) {
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === programId
              ? { ...p, status: 'active' as ProgramStatus, started_at: new Date().toISOString() }
              : p
          )
        );
        toast.success('Program activated');
      } else {
        toast.error('Failed to activate program');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Activate failed:', err);
      toast.error(`Failed to activate program: ${message}`);
    }
  };

  const handlePause = async (programId: string) => {
    try {
      const success = await updateProgramStatus(programId, userId, 'paused');
      if (success) {
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === programId ? { ...p, status: 'paused' as ProgramStatus } : p
          )
        );
        toast.success('Program paused');
      } else {
        toast.error('Failed to pause program');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Pause failed:', err);
      toast.error(`Failed to pause program: ${message}`);
    }
  };

  const handleDelete = async (programId: string) => {
    try {
      const success = await deleteTrainingProgram(programId, userId);
      if (success) {
        setPrograms((prev) => prev.filter((p) => p.id !== programId));
        toast.success('Program deleted');
      } else {
        toast.error('Failed to delete program');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Delete failed:', err);
      toast.error(`Failed to delete program: ${message}`);
    }
  };

  // Handle view drafts from empty state
  const handleViewDrafts = () => {
    setStatusFilter('draft');
  };

  // Handle program creation
  const handleCreateProgram = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    loadPrograms();
  };

  if (isLoading) {
    return (
      <div>
        <ProgramsHeader
          totalCount={0}
          onCreateProgram={handleCreateProgram}
        />
        <ProgramsFilterBar
          statusFilter={statusFilter}
          sortBy={sortBy}
          onStatusChange={setStatusFilter}
          onSortChange={setSortBy}
          counts={{ all: 0, active: 0, draft: 0, completed: 0 }}
        />
        <ProgramsLoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-destructive mb-4">{error}</p>
        <Button
          onClick={() => {
            setIsLoading(true);
            loadPrograms();
          }}
          variant="outline"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <ProgramsHeader
        totalCount={programs.length}
        onCreateProgram={handleCreateProgram}
      />

      <ProgramsFilterBar
        statusFilter={statusFilter}
        sortBy={sortBy}
        onStatusChange={setStatusFilter}
        onSortChange={setSortBy}
        counts={counts}
      />

      {filteredPrograms.length === 0 ? (
        <ProgramsEmptyState
          statusFilter={statusFilter}
          onCreateProgram={handleCreateProgram}
          onViewDrafts={handleViewDrafts}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onView={() => onViewProgram(program.id)}
              onActivate={() => handleActivate(program.id)}
              onPause={() => handlePause(program.id)}
              onDelete={() => handleDelete(program.id)}
            />
          ))}
        </div>
      )}

      {/* Program Generation Wizard */}
      <ProgramWizard
        userId={userId}
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}

export default ProgramsList;
