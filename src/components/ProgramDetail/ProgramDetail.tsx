/**
 * ProgramDetail - Main container for the training program detail view
 *
 * Displays the full program with:
 * - Header with metadata and actions
 * - Weekly calendar navigation
 * - Workout cards grid
 * - Workout detail sheet
 * - Periodization progress chart
 */

import { Loader2 } from 'lucide-react';
import { ProgramDetailProvider } from '../../context/ProgramDetailContext';
import { useProgramDetailApi } from '../../hooks/useProgramDetailApi';
import { ProgramHeader } from './ProgramHeader';
import { WeeklyCalendar } from './WeeklyCalendar';
import { WorkoutDetail } from './WorkoutDetail';
import { ProgressChart } from './ProgressChart';
import type { ProgramWorkout } from '../../types/training-program';

interface ProgramDetailProps {
  programId: string;
  userId: string;
  onBack: () => void;
  onDeleted?: () => void;
  onStartWorkout?: (workout: ProgramWorkout) => void;
}

/**
 * Inner component that uses the context
 */
function ProgramDetailContent({
  programId,
  userId,
  onBack,
  onDeleted,
  onStartWorkout,
}: ProgramDetailProps) {
  const {
    program,
    selectedWeek,
    selectedWorkout,
    isLoading,
    error,
    selectWeek,
    selectWorkout,
    updateStatus,
    deleteProgram,
    markWorkoutComplete,
  } = useProgramDetailApi({
    programId,
    userId,
    onDeleted,
  });

  // Loading state
  if (isLoading && !program) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error && !program) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={onBack}
          className="text-primary hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  // No program found
  if (!program) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Program not found</p>
        <button
          onClick={onBack}
          className="text-primary hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <ProgramHeader
        program={program}
        onBack={onBack}
        onStatusChange={updateStatus}
        onDelete={deleteProgram}
        isLoading={isLoading}
      />

      {/* Periodization chart */}
      <ProgressChart
        program={program}
        currentWeek={program.current_week}
      />

      {/* Weekly calendar with workout cards */}
      <WeeklyCalendar
        program={program}
        selectedWeekNumber={selectedWeek?.week_number || program.current_week}
        selectedWorkout={selectedWorkout}
        onSelectWeek={selectWeek}
        onSelectWorkout={selectWorkout}
      />

      {/* Workout detail sheet */}
      <WorkoutDetail
        workout={selectedWorkout}
        open={!!selectedWorkout}
        onClose={() => selectWorkout(null)}
        onMarkComplete={markWorkoutComplete}
        onStartWorkout={onStartWorkout}
        isLoading={isLoading}
      />
    </div>
  );
}

/**
 * Main component wrapped with provider
 */
export function ProgramDetail(props: ProgramDetailProps) {
  return (
    <ProgramDetailProvider>
      <ProgramDetailContent {...props} />
    </ProgramDetailProvider>
  );
}

export default ProgramDetail;
