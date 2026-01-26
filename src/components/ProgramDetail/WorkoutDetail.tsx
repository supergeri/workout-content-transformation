/**
 * WorkoutDetail - Sheet/drawer showing exercise list and workout details
 */

import { Check, Clock, Dumbbell, FileText, Play, Timer, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import type { ProgramWorkout, ProgramExercise } from '../../types/training-program';
import { WORKOUT_TYPE_COLORS, DAY_LABELS_FULL } from '../../types/training-program';

interface WorkoutDetailProps {
  workout: ProgramWorkout | null;
  open: boolean;
  onClose: () => void;
  onMarkComplete: (workoutId: string, isCompleted: boolean) => Promise<boolean>;
  onStartWorkout?: (workout: ProgramWorkout) => void;
  isLoading?: boolean;
}

export function WorkoutDetail({
  workout,
  open,
  onClose,
  onMarkComplete,
  onStartWorkout,
  isLoading,
}: WorkoutDetailProps) {
  if (!workout) return null;

  const handleMarkComplete = async () => {
    await onMarkComplete(workout.id, !workout.is_completed);
  };

  const handleStartWorkout = () => {
    onStartWorkout?.(workout);
  };

  const borderColor =
    WORKOUT_TYPE_COLORS[workout.workout_type.toLowerCase()] ||
    WORKOUT_TYPE_COLORS.default;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle className="text-left">{workout.name}</SheetTitle>
              <SheetDescription className="text-left">
                {DAY_LABELS_FULL[workout.day_of_week]}
              </SheetDescription>
            </div>
            {workout.is_completed && (
              <Badge className="bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant={workout.is_completed ? 'outline' : 'default'}
              size="sm"
              onClick={handleMarkComplete}
              disabled={isLoading}
              className="flex-1 gap-1.5"
            >
              {workout.is_completed ? (
                <>
                  <X className="w-4 h-4" />
                  Mark Incomplete
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Mark Complete
                </>
              )}
            </Button>
            {onStartWorkout && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartWorkout}
                className="flex-1 gap-1.5"
              >
                <Play className="w-4 h-4" />
                Start Workout
              </Button>
            )}
          </div>

          {/* Workout metadata */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`capitalize border-l-4 ${borderColor}`}
              >
                {workout.workout_type.replace('_', ' ')}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Exercises:</span>
                <span className="font-medium">{workout.exercises.length}</span>
              </div>
              {workout.target_duration_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {workout.target_duration_minutes} min
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Exercises list */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Exercises
            </h3>
            <div className="space-y-2">
              {workout.exercises.map((exercise, idx) => (
                <ExerciseItem key={idx} exercise={exercise} index={idx + 1} />
              ))}
            </div>
          </div>

          {/* Notes */}
          {workout.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {workout.notes}
                </p>
              </div>
            </>
          )}

          {/* Completion timestamp */}
          {workout.is_completed && workout.completed_at && (
            <p className="text-xs text-muted-foreground text-center">
              Completed on{' '}
              {new Date(workout.completed_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Individual exercise row
 */
interface ExerciseItemProps {
  exercise: ProgramExercise;
  index: number;
}

function ExerciseItem({ exercise, index }: ExerciseItemProps) {
  // Format sets x reps display
  const setsReps = `${exercise.sets} x ${exercise.reps}`;

  // Format rest time
  const formatRest = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
  };

  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
          {index}
        </span>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm">{exercise.name}</h4>
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {setsReps}
            </Badge>
          </div>

          {/* Exercise details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {exercise.weight && (
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3 h-3" />
                {exercise.weight} lbs
              </span>
            )}
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              Rest: {formatRest(exercise.rest_seconds)}
            </span>
            {exercise.tempo && (
              <span>Tempo: {exercise.tempo}</span>
            )}
            {exercise.rpe && (
              <span>RPE: {exercise.rpe}</span>
            )}
          </div>

          {/* Notes */}
          {exercise.notes && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              {exercise.notes}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
