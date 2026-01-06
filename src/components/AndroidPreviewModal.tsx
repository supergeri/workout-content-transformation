import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Repeat, Timer, Dumbbell, Smartphone, Loader2, PlayCircle, Coffee } from 'lucide-react';
import { WorkoutStructure, ValidationResponse } from '../types/workout';
import { applyValidationMappings } from '../lib/workout-utils';
import { API_URLS } from '../lib/config';

interface AndroidPreviewModalProps {
  workout: WorkoutStructure;
  validation?: ValidationResponse | null;
  trigger?: React.ReactNode;
}

// Backend preview step format (same as FIT preview)
interface BackendPreviewStep {
  type: 'exercise' | 'rest' | 'repeat' | 'warmup';
  display_name: string;
  original_name?: string;
  category_id?: number;
  category_name?: string;
  duration_type?: string;
  duration_display?: string;
  reps?: number | string;
  sets?: number;
  rest_seconds?: number;
  repeat_count?: number;
  duration_step?: number;
  intensity?: string;
  is_warmup_set?: boolean;
}

// Group flat steps into nested structure for display
interface GroupedStep {
  type: 'single' | 'repeat-group';
  step?: BackendPreviewStep;
  repeatCount?: number;
  children?: BackendPreviewStep[];
}

function groupStepsForDisplay(steps: BackendPreviewStep[]): GroupedStep[] {
  const grouped: GroupedStep[] = [];
  let i = 0;

  while (i < steps.length) {
    const step = steps[i];

    if (step.type === 'exercise' || step.type === 'warmup') {
      const children: BackendPreviewStep[] = [step];
      let j = i + 1;

      while (j < steps.length && steps[j].type === 'rest') {
        children.push(steps[j]);
        j++;
      }

      if (j < steps.length && steps[j].type === 'repeat') {
        const repeatStep = steps[j];
        const totalSets = repeatStep.repeat_count || 1;
        grouped.push({
          type: 'repeat-group',
          repeatCount: totalSets,
          children: children,
        });
        i = j + 1;
      } else {
        children.forEach(child => {
          grouped.push({ type: 'single', step: child });
        });
        i = j;
      }
    } else if (step.type === 'repeat') {
      grouped.push({ type: 'single', step });
      i++;
    } else {
      grouped.push({ type: 'single', step });
      i++;
    }
  }

  return grouped;
}

export function AndroidPreviewModal({ workout, validation, trigger }: AndroidPreviewModalProps) {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<BackendPreviewStep[]>([]);
  const [sportType, setSportType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupedSteps = groupStepsForDisplay(steps);

  useEffect(() => {
    if (!open || !workout) return;

    const fetchPreviewData = async () => {
      setLoading(true);
      setError(null);

      try {
        const MAPPER_API_BASE_URL = API_URLS.MAPPER;
        const mappedWorkout = applyValidationMappings(workout, validation);

        // Fetch preview steps - use same endpoint as Garmin
        const [stepsRes, metadataRes] = await Promise.all([
          fetch(`${MAPPER_API_BASE_URL}/map/preview-steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blocks_json: mappedWorkout }),
          }),
          fetch(`${MAPPER_API_BASE_URL}/map/fit-metadata`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blocks_json: mappedWorkout }),
          })
        ]);

        if (!stepsRes.ok) {
          throw new Error('Failed to fetch preview');
        }

        const stepsData = await stepsRes.json();
        setSteps(stepsData.steps || []);

        if (metadataRes.ok) {
          const metadata = await metadataRes.json();
          setSportType(metadata.detected_sport || null);
        }
      } catch (err) {
        console.error('Failed to fetch preview data:', err);
        setError('Failed to load preview');
        setSteps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [open, workout, validation]);

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Smartphone className="w-4 h-4 mr-2" />
      Preview on Android
    </Button>
  );

  const exerciseSteps = steps.filter(s => s.type === 'exercise');
  const totalSets = exerciseSteps.reduce((sum, s) => sum + (s.sets || 1), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Android Companion Preview</DialogTitle>
          <DialogDescription>
            How this workout will appear on the AmakaFlow Android app
          </DialogDescription>
        </DialogHeader>

        {/* Phone-like display */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '32px',
          padding: '12px',
          maxWidth: '320px',
          margin: '0 auto'
        }}>
          {/* Phone notch */}
          <div style={{
            width: '80px',
            height: '24px',
            backgroundColor: '#000',
            borderRadius: '12px',
            margin: '0 auto 12px auto'
          }} />

          {/* Phone screen */}
          <div style={{
            backgroundColor: '#121212',
            borderRadius: '20px',
            padding: '16px',
            minHeight: '400px'
          }}>
            {/* App header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #333'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  {workout?.title || 'Workout'}
                </div>
                {sportType && (
                  <span style={{
                    backgroundColor: sportType === 'cardio' ? '#dc2626' :
                                     sportType === 'strength' ? '#6366f1' : '#16a34a',
                    color: 'white',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}>
                    {sportType}
                  </span>
                )}
              </div>
            </div>

            {/* Steps section header */}
            <div style={{
              fontSize: '12px',
              color: '#888',
              marginBottom: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Workout Steps
            </div>

            {loading ? (
              <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '48px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#10b981' }} />
                <span style={{ fontSize: '14px' }}>Loading preview...</span>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', color: '#ef4444', padding: '48px 0', fontSize: '14px' }}>
                {error}
              </div>
            ) : groupedSteps.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '48px 0', fontSize: '14px' }}>
                No steps found
              </div>
            ) : (
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {groupedSteps.map((group, groupIdx) => {
                  // Repeat group
                  if (group.type === 'repeat-group') {
                    return (
                      <div key={groupIdx} style={{
                        backgroundColor: '#1e1e1e',
                        borderRadius: '12px',
                        marginBottom: '10px',
                        overflow: 'hidden',
                        border: '1px solid #2a2a2a'
                      }}>
                        {/* Repeat header */}
                        <div style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderBottom: '1px solid rgba(34, 197, 94, 0.3)'
                        }}>
                          <Repeat style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                          <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 600 }}>
                            {group.repeatCount} Sets
                          </span>
                        </div>
                        {/* Children steps */}
                        <div style={{ padding: '10px' }}>
                          {group.children?.map((step, childIdx) => (
                            <div key={childIdx}>
                              {step.type === 'exercise' && (
                                <div style={{
                                  backgroundColor: step.is_warmup_set ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                  borderRadius: '8px',
                                  padding: '10px 12px',
                                  marginBottom: '8px',
                                  borderLeft: step.is_warmup_set ? '3px solid #f59e0b' : '3px solid #3b82f6'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Dumbbell style={{
                                      width: '16px',
                                      height: '16px',
                                      color: step.is_warmup_set ? '#f59e0b' : '#60a5fa'
                                    }} />
                                    <span style={{
                                      color: step.is_warmup_set ? '#fbbf24' : '#93c5fd',
                                      fontSize: '14px',
                                      fontWeight: 500
                                    }}>
                                      {step.display_name}
                                    </span>
                                  </div>
                                  {step.duration_display && (
                                    <div style={{ marginTop: '6px', marginLeft: '26px' }}>
                                      <span style={{
                                        backgroundColor: step.is_warmup_set ? '#78350f' :
                                                       step.duration_type === 'distance' ? '#059669' :
                                                       step.duration_type === 'time' ? '#7c3aed' : '#1d4ed8',
                                        color: step.is_warmup_set ? '#fbbf24' : 'white',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        fontSize: '11px'
                                      }}>
                                        {step.duration_display}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {step.type === 'rest' && (
                                <div style={{
                                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  marginBottom: '8px',
                                  borderLeft: '3px solid #6b7280'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Coffee style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>Rest</span>
                                    <span style={{
                                      backgroundColor: '#374151',
                                      color: '#9ca3af',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px'
                                    }}>
                                      {step.duration_display || 'Until ready'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Single step
                  const step = group.step!;

                  // Warmup step
                  if (step.type === 'warmup') {
                    return (
                      <div key={groupIdx} style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        marginBottom: '10px',
                        borderLeft: '3px solid #f59e0b'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <PlayCircle style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                          <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 500 }}>Warmup</span>
                          {step.duration_display && (
                            <span style={{
                              backgroundColor: '#78350f',
                              color: '#fbbf24',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              marginLeft: 'auto'
                            }}>
                              {step.duration_display}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Rest step (standalone)
                  if (step.type === 'rest') {
                    return (
                      <div key={groupIdx} style={{
                        backgroundColor: 'rgba(107, 114, 128, 0.1)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        marginBottom: '10px',
                        borderLeft: '3px solid #6b7280'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Coffee style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>Rest</span>
                          <span style={{
                            backgroundColor: '#374151',
                            color: '#9ca3af',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}>
                            {step.duration_display || 'Until ready'}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Exercise step (standalone)
                  return (
                    <div key={groupIdx} style={{
                      backgroundColor: step.is_warmup_set ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '10px',
                      borderLeft: step.is_warmup_set ? '3px solid #f59e0b' : '3px solid #3b82f6'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Dumbbell style={{
                          width: '16px',
                          height: '16px',
                          color: step.is_warmup_set ? '#f59e0b' : '#60a5fa'
                        }} />
                        <span style={{
                          color: step.is_warmup_set ? '#fbbf24' : '#93c5fd',
                          fontSize: '14px',
                          fontWeight: 500
                        }}>
                          {step.display_name}
                        </span>
                      </div>
                      {step.duration_display && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '6px',
                          marginLeft: '26px'
                        }}>
                          <span style={{
                            backgroundColor: step.is_warmup_set ? '#78350f' :
                                           step.duration_type === 'distance' ? '#059669' :
                                           step.duration_type === 'time' ? '#7c3aed' : '#1d4ed8',
                            color: step.is_warmup_set ? '#fbbf24' : 'white',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}>
                            {step.duration_display}
                          </span>
                          {step.category_name && (
                            <span style={{
                              backgroundColor: '#374151',
                              color: '#9ca3af',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10px'
                            }}>
                              {step.category_name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer stats */}
            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#666',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #333'
            }}>
              {steps.length} step{steps.length !== 1 ? 's' : ''}
              {' \u2022 '}{exerciseSteps.length} exercise{exerciseSteps.length !== 1 ? 's' : ''}
              {totalSets > exerciseSteps.length && ` \u2022 ${totalSets} total sets`}
            </div>
          </div>

          {/* Phone home indicator */}
          <div style={{
            width: '100px',
            height: '4px',
            backgroundColor: '#333',
            borderRadius: '2px',
            margin: '12px auto 0 auto'
          }} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <PlayCircle className="w-3 h-3 text-amber-500" />
            <span>Warmup</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="w-3 h-3 text-amber-500" />
            <span>Warm-Up Set</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="w-3 h-3 text-blue-500" />
            <span>Exercise</span>
          </div>
          <div className="flex items-center gap-1">
            <Coffee className="w-3 h-3 text-gray-500" />
            <span>Rest</span>
          </div>
          <div className="flex items-center gap-1">
            <Repeat className="w-3 h-3 text-green-500" />
            <span>Repeat</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AndroidPreviewModal;
