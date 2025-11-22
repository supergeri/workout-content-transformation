import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Play, Clock, List, CheckCircle2, ExternalLink, Plus, Loader2 } from 'lucide-react';
import { ingestFollowAlong, listFollowAlong, getFollowAlong, pushToGarmin, pushToAppleWatch } from '../lib/follow-along-api';
import type { FollowAlongWorkout } from '../types/follow-along';
import { toast } from 'sonner';
import { useClerkUser } from '../lib/clerk-auth';
import { FollowAlongInstructions } from './FollowAlongInstructions';

export function FollowAlongWorkouts() {
  const { user: clerkUser } = useClerkUser();
  const [workouts, setWorkouts] = useState<FollowAlongWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<FollowAlongWorkout | null>(null);
  const [showIngestDialog, setShowIngestDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const getUserId = (): string => {
    if (!clerkUser?.id) {
      throw new Error('User not authenticated');
    }
    return clerkUser.id;
  };

  useEffect(() => {
    if (clerkUser?.id) {
      loadWorkouts();
    }
  }, [clerkUser?.id]);

  const loadWorkouts = async () => {
    if (!clerkUser?.id) {
      toast.error('Please sign in to view workouts');
      return;
    }
    
    setLoading(true);
    try {
      const result = await listFollowAlong(clerkUser.id);
      setWorkouts(result.items);
    } catch (error: any) {
      toast.error(`Failed to load workouts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!instagramUrl.trim()) {
      toast.error('Please enter an Instagram URL');
      return;
    }

    if (!clerkUser?.id) {
      toast.error('Please sign in to add workouts');
      return;
    }

    setIngesting(true);
    try {
      const result = await ingestFollowAlong(instagramUrl, clerkUser.id);
      setWorkouts([result.followAlongWorkout, ...workouts]);
      setInstagramUrl('');
      setShowIngestDialog(false);
      toast.success('Workout extracted successfully!');
    } catch (error: any) {
      toast.error(`Failed to extract workout: ${error.message}`);
    } finally {
      setIngesting(false);
    }
  };

  const handleViewDetails = async (workout: FollowAlongWorkout) => {
    if (!clerkUser?.id) {
      toast.error('Please sign in to view workout details');
      return;
    }

    try {
      const result = await getFollowAlong(workout.id, clerkUser.id);
      setSelectedWorkout(result.followAlongWorkout);
      setShowDetailDialog(true);
    } catch (error: any) {
      toast.error(`Failed to load workout details: ${error.message}`);
    }
  };

  const handlePushToGarmin = async (workoutId: string) => {
    if (!clerkUser?.id) {
      toast.error('Please sign in to sync workouts');
      return;
    }

    try {
      const result = await pushToGarmin(workoutId, clerkUser.id);
      if (result.status === 'success') {
        toast.success('Workout synced to Garmin!');
        loadWorkouts(); // Refresh to update sync status
      } else {
        toast.error(result.message || 'Failed to sync to Garmin');
      }
    } catch (error: any) {
      toast.error(`Failed to sync to Garmin: ${error.message}`);
    }
  };

  const handlePushToAppleWatch = async (workoutId: string) => {
    if (!clerkUser?.id) {
      toast.error('Please sign in to sync workouts');
      return;
    }

    try {
      const result = await pushToAppleWatch(workoutId, clerkUser.id);
      if (result.status === 'success') {
        toast.success('Workout synced to Apple Watch!');
        loadWorkouts(); // Refresh to update sync status
      } else {
        toast.error(result.message || 'Failed to sync to Apple Watch');
      }
    } catch (error: any) {
      toast.error(`Failed to sync to Apple Watch: ${error.message}`);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Follow-Along Workouts</h2>
          <p className="text-muted-foreground">Extract and sync Instagram workout videos</p>
        </div>
        <FollowAlongInstructions />
        <Dialog open={showIngestDialog} onOpenChange={setShowIngestDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Instagram Workout</DialogTitle>
              <DialogDescription>
                Paste an Instagram workout post URL to extract and follow along
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="https://www.instagram.com/p/..."
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
              <Button onClick={handleIngest} disabled={ingesting || !instagramUrl.trim()}>
                {ingesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  'Extract Workout'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : workouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No follow-along workouts yet</p>
            <p className="text-sm text-muted-foreground mt-2">Add an Instagram workout to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <Card key={workout.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewDetails(workout)}>
              {workout.thumbnailUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                  <img
                    src={workout.thumbnailUrl}
                    alt={workout.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{workout.title}</CardTitle>
                {workout.description && (
                  <CardDescription className="line-clamp-2">{workout.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(workout.videoDurationSec)}
                  </div>
                  <div className="flex items-center gap-1">
                    <List className="h-4 w-4" />
                    {workout.steps.length} steps
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {workout.garminWorkoutId && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Garmin
                    </Badge>
                  )}
                  {workout.appleWatchWorkoutId && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Apple Watch
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedWorkout && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedWorkout.title}</DialogTitle>
                {selectedWorkout.description && (
                  <DialogDescription>{selectedWorkout.description}</DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-4">
                {selectedWorkout.videoProxyUrl && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                    <video
                      src={selectedWorkout.videoProxyUrl}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                )}
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Workout Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{formatDuration(selectedWorkout.videoDurationSec)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Steps:</span>
                        <span>{selectedWorkout.steps.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Source:</span>
                        <a
                          href={selectedWorkout.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          Instagram
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Sync Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant={selectedWorkout.garminWorkoutId ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePushToGarmin(selectedWorkout.id);
                        }}
                        disabled={!!selectedWorkout.garminWorkoutId}
                      >
                        {selectedWorkout.garminWorkoutId ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Synced to Garmin
                          </>
                        ) : (
                          'Send to Garmin'
                        )}
                      </Button>
                      <Button
                        variant={selectedWorkout.appleWatchWorkoutId ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePushToAppleWatch(selectedWorkout.id);
                        }}
                        disabled={!!selectedWorkout.appleWatchWorkoutId}
                      >
                        {selectedWorkout.appleWatchWorkoutId ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Synced to Apple Watch
                          </>
                        ) : (
                          'Send to Apple Watch'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Workout Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedWorkout.steps.map((step) => (
                        <div key={step.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                              {step.order}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{step.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDuration(step.durationSec)}
                                {step.targetReps && ` • ${step.targetReps} reps`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

