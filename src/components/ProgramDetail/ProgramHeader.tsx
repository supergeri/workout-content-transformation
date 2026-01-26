/**
 * ProgramHeader - Displays program name, metadata, progress bar, and actions
 */

import { ArrowLeft, Clock, Calendar, Dumbbell, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ProgramActions } from './ProgramActions';
import type { TrainingProgram, ProgramStatus } from '../../types/training-program';
import { STATUS_LABELS, PERIODIZATION_LABELS } from '../../types/training-program';
import { GOAL_LABELS, EXPERIENCE_LABELS } from '../../types/program-wizard';

interface ProgramHeaderProps {
  program: TrainingProgram;
  onBack: () => void;
  onStatusChange: (status: ProgramStatus) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  isLoading?: boolean;
}

export function ProgramHeader({
  program,
  onBack,
  onStatusChange,
  onDelete,
  isLoading,
}: ProgramHeaderProps) {
  // Calculate progress
  const progressPercent = Math.round(
    ((program.current_week - 1) / program.duration_weeks) * 100
  );

  // Count completed workouts in current week
  const currentWeekData = program.weeks.find(
    (w) => w.week_number === program.current_week
  );
  const completedWorkouts = currentWeekData?.workouts.filter(
    (w) => w.is_completed
  ).length || 0;
  const totalWorkoutsInWeek = currentWeekData?.workouts.length || 0;

  return (
    <div className="space-y-4">
      {/* Back button and title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold">{program.name}</h1>
              <Badge className={STATUS_LABELS[program.status].color}>
                {STATUS_LABELS[program.status].label}
              </Badge>
            </div>
            {program.notes && (
              <p className="text-sm text-muted-foreground mt-1">
                {program.notes}
              </p>
            )}
          </div>
        </div>
        <ProgramActions
          program={program}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Duration:</span>
          <span className="font-medium">{program.duration_weeks} weeks</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Dumbbell className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Sessions:</span>
          <span className="font-medium">{program.sessions_per_week}/week</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Time:</span>
          <span className="font-medium">{program.time_per_session_minutes} min</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Level:</span>
          <span className="font-medium capitalize">
            {EXPERIENCE_LABELS[program.experience_level]?.label || program.experience_level}
          </span>
        </div>
      </div>

      {/* Additional metadata badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="capitalize">
          {GOAL_LABELS[program.goal]?.label || program.goal.replace('_', ' ')}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {PERIODIZATION_LABELS[program.periodization_model]?.label || program.periodization_model}
        </Badge>
        {program.equipment_available.slice(0, 3).map((eq) => (
          <Badge key={eq} variant="outline" className="text-xs capitalize">
            {eq.replace('_', ' ')}
          </Badge>
        ))}
        {program.equipment_available.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{program.equipment_available.length - 3} more
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Week {program.current_week} of {program.duration_weeks}
          </span>
          <span className="text-muted-foreground">
            {completedWorkouts}/{totalWorkoutsInWeek} workouts this week
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {progressPercent}% complete
        </p>
      </div>
    </div>
  );
}
