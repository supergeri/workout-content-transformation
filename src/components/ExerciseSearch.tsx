import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Search, Dumbbell } from 'lucide-react';
import { DeviceId } from '../lib/devices';

type Props = {
  onSelect: (exerciseName: string) => void;
  onClose: () => void;
  device: DeviceId;
};

// Mock exercise library - in real app this would come from API
const EXERCISE_LIBRARY: Record<DeviceId, Array<{ name: string; category: string; confidence: number }>> = {
  garmin: [
    { name: 'Barbell Back Squat', category: 'Strength', confidence: 0.95 },
    { name: 'Deadlift', category: 'Strength', confidence: 0.95 },
    { name: 'Bench Press', category: 'Strength', confidence: 0.95 },
    { name: 'Pull-ups', category: 'Strength', confidence: 0.90 },
    { name: 'Overhead Press', category: 'Strength', confidence: 0.90 },
    { name: 'Romanian Deadlift', category: 'Strength', confidence: 0.85 },
    { name: 'Lunges', category: 'Strength', confidence: 0.85 },
    { name: 'Dumbbell Row', category: 'Strength', confidence: 0.85 },
    { name: 'Bicep Curl', category: 'Strength', confidence: 0.80 },
    { name: 'Tricep Extension', category: 'Strength', confidence: 0.80 },
    { name: 'Leg Press', category: 'Strength', confidence: 0.80 },
    { name: 'Lat Pulldown', category: 'Strength', confidence: 0.80 },
    { name: 'Running', category: 'Cardio', confidence: 0.95 },
    { name: 'Cycling', category: 'Cardio', confidence: 0.95 },
    { name: 'Rowing', category: 'Cardio', confidence: 0.90 },
    { name: 'Jump Rope', category: 'Cardio', confidence: 0.85 },
    { name: 'Box Jumps', category: 'Plyometric', confidence: 0.80 },
    { name: 'Burpees', category: 'Plyometric', confidence: 0.80 },
    { name: 'Plank', category: 'Core', confidence: 0.90 },
    { name: 'Russian Twists', category: 'Core', confidence: 0.85 },
  ],
  apple: [
    { name: 'Push-ups', category: 'Strength', confidence: 0.90 },
    { name: 'Squats', category: 'Strength', confidence: 0.90 },
    { name: 'Lunges', category: 'Strength', confidence: 0.85 },
    { name: 'Plank', category: 'Core', confidence: 0.90 },
    { name: 'Running', category: 'Cardio', confidence: 0.95 },
    { name: 'Walking', category: 'Cardio', confidence: 0.95 },
    { name: 'Cycling', category: 'Cardio', confidence: 0.95 },
    { name: 'Swimming', category: 'Cardio', confidence: 0.90 },
    { name: 'HIIT', category: 'Cardio', confidence: 0.85 },
    { name: 'Yoga', category: 'Flexibility', confidence: 0.90 },
    { name: 'Stretching', category: 'Flexibility', confidence: 0.85 },
    { name: 'Jump Rope', category: 'Cardio', confidence: 0.85 },
    { name: 'Burpees', category: 'Plyometric', confidence: 0.80 },
    { name: 'Mountain Climbers', category: 'Plyometric', confidence: 0.80 },
  ],
  zwift: [
    { name: 'Cycling - Endurance', category: 'Cycling', confidence: 0.95 },
    { name: 'Cycling - Tempo', category: 'Cycling', confidence: 0.95 },
    { name: 'Cycling - Threshold', category: 'Cycling', confidence: 0.95 },
    { name: 'Cycling - VO2 Max', category: 'Cycling', confidence: 0.95 },
    { name: 'Cycling - Sprint', category: 'Cycling', confidence: 0.95 },
    { name: 'Running - Easy', category: 'Running', confidence: 0.90 },
    { name: 'Running - Tempo', category: 'Running', confidence: 0.90 },
    { name: 'Running - Interval', category: 'Running', confidence: 0.90 },
    { name: 'Recovery Ride', category: 'Cycling', confidence: 0.85 },
    { name: 'Hill Climb', category: 'Cycling', confidence: 0.85 },
  ]
};

export function ExerciseSearch({ onSelect, onClose, device }: Props) {
  const [search, setSearch] = useState('');
  const [filteredExercises, setFilteredExercises] = useState(EXERCISE_LIBRARY[device]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(EXERCISE_LIBRARY[device].map(e => e.category))];

  useEffect(() => {
    let results = EXERCISE_LIBRARY[device];

    // Filter by category
    if (selectedCategory) {
      results = results.filter(e => e.category === selectedCategory);
    }

    // Filter by search
    if (search) {
      results = results.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredExercises(results);
  }, [search, selectedCategory, device]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Results */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No exercises found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              ) : (
                filteredExercises.map((exercise, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelect(exercise.name)}
                    className="w-full text-left p-3 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground">{exercise.category}</p>
                      </div>
                      <Badge variant="outline">
                        {Math.round(exercise.confidence * 100)}% match
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Custom Exercise */}
          {search && filteredExercises.length === 0 && (
            <Button
              onClick={() => onSelect(search)}
              variant="outline"
              className="w-full"
            >
              Add "{search}" as custom exercise
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
