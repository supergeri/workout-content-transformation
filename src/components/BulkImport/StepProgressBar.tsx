/**
 * StepProgressBar Component
 *
 * Visual progress indicator for the bulk import workflow.
 * Matches the Create Workout stepper style:
 * (1) Add Sources > (2) Match > (3) Preview > (4) Import
 */

import { CheckCircle, ChevronRight } from 'lucide-react';
import { useBulkImport } from '../../context/BulkImportContext';
import { BulkImportStep } from '../../types/bulk-import';
import { cn } from '../ui/utils';

interface StepProgressBarProps {
  className?: string;
}

const stepConfig: Record<BulkImportStep, { label: string }> = {
  detect: { label: 'Add Sources' },
  map: { label: 'Map Columns' },
  match: { label: 'Match Exercises' },
  preview: { label: 'Preview' },
  import: { label: 'Import' },
};

export function StepProgressBar({ className }: StepProgressBarProps) {
  const { state, goToStep } = useBulkImport();
  const currentIndex = state.activeSteps.indexOf(state.step);

  const handleStepClick = (step: BulkImportStep, index: number) => {
    // Only allow clicking on completed steps (going back)
    if (index < currentIndex) {
      goToStep(step);
    }
  };

  return (
    <div className={cn('w-full flex items-center justify-center flex-wrap gap-y-2', className)}>
      {state.activeSteps.map((step, index) => {
        const isActive = step === state.step;
        const isCompleted = index < currentIndex;
        const isClickable = index < currentIndex;
        const config = stepConfig[step];

        return (
          <div key={step} className="flex items-center">
            {/* Step: Number + Label inline */}
            <button
              onClick={() => handleStepClick(step, index)}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded-lg transition-all',
                isClickable && 'cursor-pointer hover:bg-muted/50',
                !isClickable && 'cursor-default'
              )}
            >
              {/* Numbered Circle */}
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold transition-all',
                  isActive && 'bg-foreground text-background',
                  isCompleted && 'bg-emerald-500 text-white',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label - inline next to number */}
              <span
                className={cn(
                  'text-sm font-medium transition-colors whitespace-nowrap',
                  isActive && 'text-foreground',
                  isCompleted && 'text-emerald-600',
                  !isActive && !isCompleted && 'text-muted-foreground'
                )}
              >
                {config.label}
              </span>
            </button>

            {/* Chevron Connector */}
            {index < state.activeSteps.length - 1 && (
              <ChevronRight
                className={cn(
                  'w-5 h-5 mx-1 flex-shrink-0',
                  index < currentIndex ? 'text-emerald-500' : 'text-muted-foreground/40'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StepProgressBar;
