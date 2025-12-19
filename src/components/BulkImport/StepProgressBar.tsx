/**
 * StepProgressBar Component
 *
 * Visual progress indicator for the bulk import workflow.
 * Shows all steps with current position, clickable navigation back,
 * and adapts to skipped steps.
 */

import { CheckCircle, ChevronRight } from 'lucide-react';
import { useBulkImport } from '../../context/BulkImportContext';
import { BulkImportStep } from '../../types/bulk-import';
import { cn } from '../ui/utils';

interface StepProgressBarProps {
  className?: string;
}

const stepConfig: Record<BulkImportStep, { label: string; shortLabel: string }> = {
  detect: { label: 'Add Sources', shortLabel: 'Sources' },
  map: { label: 'Map Columns', shortLabel: 'Map' },
  match: { label: 'Match Exercises', shortLabel: 'Match' },
  preview: { label: 'Preview', shortLabel: 'Preview' },
  import: { label: 'Import', shortLabel: 'Import' },
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
    <div className={cn('w-full', className)}>
      {/* Desktop View */}
      <div className="hidden sm:flex items-center justify-center gap-1">
        {state.activeSteps.map((step, index) => {
          const isActive = step === state.step;
          const isCompleted = index < currentIndex;
          const isClickable = index < currentIndex;
          const config = stepConfig[step];

          return (
            <div key={step} className="flex items-center">
              {/* Step Indicator */}
              <button
                onClick={() => handleStepClick(step, index)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-full transition-all',
                  isClickable && 'cursor-pointer hover:bg-muted/50',
                  !isClickable && !isActive && 'cursor-default',
                  isActive && 'cursor-default bg-muted/30'
                )}
              >
                {/* Numbered Circle */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all border-2',
                    isActive && 'bg-primary text-primary-foreground border-primary',
                    isCompleted && 'bg-emerald-500 text-white border-emerald-500',
                    !isActive && !isCompleted && 'bg-muted/50 text-muted-foreground border-muted-foreground/30'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-sm font-medium transition-colors whitespace-nowrap',
                    isActive && 'text-foreground',
                    isCompleted && 'text-emerald-500',
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
                    'w-5 h-5 mx-2 flex-shrink-0',
                    index < currentIndex ? 'text-emerald-500' : 'text-muted-foreground/50'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View - Compact horizontal */}
      <div className="flex sm:hidden items-center justify-between px-2">
        {state.activeSteps.map((step, index) => {
          const isActive = step === state.step;
          const isCompleted = index < currentIndex;
          const isClickable = index < currentIndex;
          const config = stepConfig[step];

          return (
            <div key={step} className="flex items-center flex-1">
              <button
                onClick={() => handleStepClick(step, index)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center gap-2 py-2 flex-1 rounded transition-all',
                  isClickable && 'cursor-pointer active:scale-95'
                )}
              >
                {/* Numbered Circle */}
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all border-2',
                    isActive && 'bg-primary text-primary-foreground border-primary',
                    isCompleted && 'bg-emerald-500 text-white border-emerald-500',
                    !isActive && !isCompleted && 'bg-muted/50 text-muted-foreground border-muted-foreground/30'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Short Label */}
                <span
                  className={cn(
                    'text-xs font-medium transition-colors text-center',
                    isActive && 'text-foreground',
                    isCompleted && 'text-emerald-500',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {config.shortLabel}
                </span>
              </button>

              {/* Connector line */}
              {index < state.activeSteps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 -mx-1 mb-6',
                    index < currentIndex ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepProgressBar;
