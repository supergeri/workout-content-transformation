import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Timer,
  MapPin,
  ExternalLink,
  AlertCircle,
  Activity,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

// Mock Strava Activities (to be enhanced)
const MOCK_STRAVA_ACTIVITIES = [
  {
    id: '123456',
    name: 'Morning Run',
    type: 'Run',
    date: '2025-11-16T06:30:00Z',
    distance: 8500,
    moving_time: 2580,
    has_description: false,
  },
  {
    id: '123457',
    name: 'Evening CrossFit',
    type: 'Workout',
    date: '2025-11-10T18:00:00Z',
    distance: 0,
    moving_time: 3600,
    has_description: true,
    description: '5 Rounds for Time:\n10 Thrusters (95 lbs)\n15 Pull-ups\n20 Box Jumps (24")',
    has_images: true
  },
  {
    id: '123458',
    name: 'Hyrox Training',
    type: 'Workout',
    date: '2025-11-14T18:30:00Z',
    distance: 1200,
    moving_time: 2100,
    has_description: false,
  },
  {
    id: '123459',
    name: 'Strength Training',
    type: 'WeightTraining',
    date: '2025-11-08T17:00:00Z',
    distance: 0,
    moving_time: 2700,
    has_description: true,
    description: 'Back Squat 5x5 @ 225 lbs\nDeadlift 3x8 @ 275 lbs',
  },
];

type Step = 'select-activity' | 'add-details' | 'success';

interface StravaEnhanceProps {
  onClose: () => void;
}

export function StravaEnhance({ onClose }: StravaEnhanceProps) {
  const [currentStep, setCurrentStep] = useState<Step>('select-activity');
  const [selectedActivity, setSelectedActivity] = useState<typeof MOCK_STRAVA_ACTIVITIES[0] | null>(null);
  
  // Enhancement fields
  const [overwriteTitle, setOverwriteTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [highlights, setHighlights] = useState('');
  const [intensity, setIntensity] = useState('');
  const [focus, setFocus] = useState('');
  const [volume, setVolume] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const [showPreview, setShowPreview] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters} m`;
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate enhanced description using MyAmaka template
  const generateDescription = () => {
    let description = '🏋️‍♂️ MYAMAKA ACTIVITY ENHANCEMENT\n';
    description += '──────────────────────────────\n\n';

    if (summary.trim()) {
      description += '📌 Summary\n';
      description += summary.trim() + '\n\n';
    }

    if (highlights.trim()) {
      description += '🔥 Key Highlights\n';
      description += highlights.trim() + '\n\n';
    }

    if (intensity) {
      description += '💥 Intensity\n';
      description += intensity + '\n\n';
    }

    if (focus.trim()) {
      description += '🎯 Focus\n';
      description += focus.trim() + '\n\n';
    }

    if (volume.trim()) {
      description += '📊 Estimated Volume\n';
      description += volume.trim() + '\n\n';
    }

    if (uploadedImage) {
      description += '📸 Workout Image:\n';
      description += uploadedImage + '\n\n';
    }

    if (notes.trim()) {
      description += '──────────────────────────────\n';
      description += 'Athlete Notes:\n';
      description += notes.trim() + '\n\n';
    }

    description += '──────────────────────────────\n';
    description += '🤖 Enhanced via MyAmaka\n';
    description += 'Ingest → Enhance → Sync';

    return description;
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      toast.success('Image uploaded');
    };
    reader.readAsDataURL(file);
  };

  // Handle enhance activity
  const handleEnhance = async () => {
    if (!selectedActivity) return;

    setIsEnhancing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production: POST /api/strava/activities/enhance-manual
    toast.success('Strava activity enhanced!');
    setIsEnhancing(false);
    setCurrentStep('success');
  };

  // Navigation
  const goBack = () => {
    if (currentStep === 'add-details') setCurrentStep('select-activity');
  };

  const goNext = () => {
    if (currentStep === 'select-activity' && selectedActivity) {
      setNewTitle(selectedActivity.name);
      setCurrentStep('add-details');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2">Enhance Strava Activity</h2>
          <p className="text-muted-foreground">
            Add MyAmaka's structured formatting to your Strava activity
          </p>
        </div>
        <Badge variant="secondary">
          {currentStep === 'select-activity' && 'Step 1 of 2'}
          {currentStep === 'add-details' && 'Step 2 of 2'}
          {currentStep === 'success' && 'Complete'}
        </Badge>
      </div>

      {/* Progress Steps */}
      {currentStep !== 'success' && (
        <div className="flex items-center gap-2">
          <div className={`flex-1 h-2 rounded ${currentStep === 'select-activity' || currentStep === 'add-details' ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex-1 h-2 rounded ${currentStep === 'add-details' ? 'bg-primary' : 'bg-muted'}`} />
        </div>
      )}

      {/* Step 1: Select Strava Activity */}
      {currentStep === 'select-activity' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              Select a Strava Activity
            </CardTitle>
            <CardDescription>
              Choose a workout that already exists on Strava
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {MOCK_STRAVA_ACTIVITIES.map(activity => (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedActivity?.id === activity.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{activity.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {activity.type}
                          </Badge>
                          {activity.has_images && (
                            <Badge variant="outline" className="text-xs">
                              Has images
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(activity.date)}
                        </div>
                      </div>
                      {selectedActivity?.id === activity.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      {activity.distance > 0 && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDistance(activity.distance)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span>{formatTime(activity.moving_time)}</span>
                      </div>
                    </div>

                    {/* Existing description preview */}
                    {activity.has_description && activity.description && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        {activity.description.slice(0, 100)}...
                      </div>
                    )}

                    {activity.has_description && (
                      <Alert className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          This activity already has a description. It will be replaced with MyAmaka formatting.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Add Enhancement Details */}
      {currentStep === 'add-details' && selectedActivity && (
        <div className="space-y-4">
          {/* Selected Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Selected Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{selectedActivity.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(selectedActivity.date)} • {selectedActivity.type}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Title */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Activity Title</CardTitle>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Overwrite</Label>
                  <Switch
                    checked={overwriteTitle}
                    onCheckedChange={setOverwriteTitle}
                  />
                </div>
              </div>
              <CardDescription>
                {overwriteTitle ? 'Custom title will replace Strava activity name' : 'Keep original Strava activity name'}
              </CardDescription>
            </CardHeader>
            {overwriteTitle && (
              <CardContent>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Morning Hyrox Session"
                />
              </CardContent>
            )}
          </Card>

          {/* Enhancement Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enhancement Details</CardTitle>
              <CardDescription>
                Fill in the fields below to create a structured workout description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <Label>Workout Summary</Label>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Describe what you did..."
                  rows={3}
                />
              </div>

              {/* Key Highlights */}
              <div className="space-y-2">
                <Label>Key Highlights</Label>
                <Textarea
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="e.g., Tough sled today, New PR, Zone 4 focus"
                  rows={2}
                />
              </div>

              {/* Intensity Rating */}
              <div className="space-y-2">
                <Label>Intensity Rating</Label>
                <Select value={intensity} onValueChange={setIntensity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intensity..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Max">Max</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Main Movement / Focus */}
              <div className="space-y-2">
                <Label>Main Movement / Focus</Label>
                <Input
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g., Sled pushes, Endurance running"
                />
              </div>

              {/* Estimated Volume */}
              <div className="space-y-2">
                <Label>Estimated Volume</Label>
                <Input
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="e.g., 5k total distance, 200 reps"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or observations..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workout Image (Optional)</CardTitle>
              <CardDescription>
                Upload an image to include in the description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadedImage ? (
                  <div className="relative inline-block">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded workout" 
                      className="w-32 h-32 object-cover rounded-lg border border-primary"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setUploadedImage(null)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Upload image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Screen */}
      {currentStep === 'success' && selectedActivity && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl">Strava Activity Enhanced!</h3>
              <p className="text-muted-foreground">
                Your activity "{selectedActivity.name}" has been enhanced with MyAmaka formatting
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  window.open(`https://www.strava.com/activities/${selectedActivity.id}`, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Strava
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onClose}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      {currentStep !== 'success' && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={currentStep === 'select-activity' ? onClose : goBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 'select-activity' ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex gap-2">
            {currentStep === 'add-details' && (
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            )}
            
            {currentStep === 'select-activity' ? (
              <Button
                onClick={goNext}
                disabled={!selectedActivity}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleEnhance}
                disabled={isEnhancing || !summary.trim()}
              >
                {isEnhancing ? 'Enhancing...' : 'Enhance Activity'}
                {!isEnhancing && <Check className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview Enhancement</DialogTitle>
            <DialogDescription>
              This is how your activity will appear on Strava
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {overwriteTitle && newTitle.trim() && (
                <div>
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <div className="p-3 bg-muted rounded-lg mt-1">
                    {newTitle}
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <div className="p-4 bg-muted rounded-lg mt-1 whitespace-pre-wrap text-sm font-mono">
                  {generateDescription()}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
