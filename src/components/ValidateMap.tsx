import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  ArrowRight,
  Sparkles,
  Watch,
  Bike
} from 'lucide-react';
import { ValidationResponse, ValidationResult } from '../types/workout';
import { DeviceId } from '../lib/devices';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { EnhancedMapping } from './EnhancedMapping';
import { toast } from 'sonner@2.0.3';

interface ValidateMapProps {
  validation: ValidationResponse;
  onReValidate: () => void;
  onProcess: (device: DeviceId) => void;
  loading: boolean;
  selectedDevice: DeviceId;
}

export function ValidateMap({ 
  validation, 
  onReValidate, 
  onProcess,
  loading,
  selectedDevice
}: ValidateMapProps) {
  const [localValidation, setLocalValidation] = useState(validation);

  const handleApplyMapping = (exerciseName: string, newMapping: string) => {
    // Update the local validation state
    const updatedValidation = { ...localValidation };
    
    // Find and update the exercise in all categories
    const updateExercise = (exercises: ValidationResult[]) => {
      return exercises.map(ex => 
        ex.original_name === exerciseName 
          ? { ...ex, mapped_to: newMapping, confidence: 0.95, status: 'valid' as const }
          : ex
      );
    };

    updatedValidation.validated_exercises = updateExercise(updatedValidation.validated_exercises);
    updatedValidation.needs_review = updateExercise(updatedValidation.needs_review);
    updatedValidation.unmapped_exercises = updateExercise(updatedValidation.unmapped_exercises);

    // Move updated exercise to validated
    const movedExercise = [
      ...updatedValidation.needs_review,
      ...updatedValidation.unmapped_exercises
    ].find(ex => ex.original_name === exerciseName);

    if (movedExercise) {
      updatedValidation.validated_exercises.push({
        ...movedExercise,
        mapped_to: newMapping,
        confidence: 0.95,
        status: 'valid'
      });
      updatedValidation.needs_review = updatedValidation.needs_review.filter(
        ex => ex.original_name !== exerciseName
      );
      updatedValidation.unmapped_exercises = updatedValidation.unmapped_exercises.filter(
        ex => ex.original_name !== exerciseName
      );
      updatedValidation.can_proceed = updatedValidation.unmapped_exercises.length === 0;
    }

    setLocalValidation(updatedValidation);
  };

  const handleAcceptMapping = (exerciseName: string) => {
    toast.success(`Confirmed mapping for ${exerciseName}`);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge className="bg-green-500">🟢 {(confidence * 100).toFixed(0)}%</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge className="bg-orange-500">🟠 {(confidence * 100).toFixed(0)}%</Badge>;
    } else {
      return <Badge variant="destructive">🔴 {(confidence * 100).toFixed(0)}%</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Validate & Map</h2>
        <p className="text-muted-foreground">
          Review mapping confidence and fix any issues before export
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-1">{localValidation.total_exercises}</div>
              <div className="text-sm text-muted-foreground">Total Exercises</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-1 text-green-600">
                {localValidation.validated_exercises.length}
              </div>
              <div className="text-sm text-muted-foreground">Validated</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-1 text-orange-600">
                {localValidation.needs_review.length}
              </div>
              <div className="text-sm text-muted-foreground">Needs Review</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-1 text-red-600">
                {localValidation.unmapped_exercises.length}
              </div>
              <div className="text-sm text-muted-foreground">Unmapped</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {!localValidation.can_proceed && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <div>Cannot automatically proceed</div>
                <div className="text-sm text-muted-foreground">
                  You have {localValidation.unmapped_exercises.length} unmapped exercise(s) that need attention
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Tabs */}
      <Tabs defaultValue="needs-review" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="validated" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Validated ({localValidation.validated_exercises.length})
          </TabsTrigger>
          <TabsTrigger value="needs-review" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Needs Review ({localValidation.needs_review.length})
          </TabsTrigger>
          <TabsTrigger value="unmapped" className="gap-2">
            <XCircle className="w-4 h-4" />
            Unmapped ({localValidation.unmapped_exercises.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="validated" className="space-y-3">
          {localValidation.validated_exercises.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No validated exercises yet
              </CardContent>
            </Card>
          ) : (
            localValidation.validated_exercises.map((result, idx) => (
              <EnhancedMapping
                key={`validated-${result.original_name}-${idx}`}
                result={result}
                onApplyMapping={handleApplyMapping}
                onAcceptMapping={handleAcceptMapping}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="needs-review" className="space-y-3">
          {localValidation.needs_review.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No exercises need review
              </CardContent>
            </Card>
          ) : (
            localValidation.needs_review.map((result, idx) => (
              <EnhancedMapping
                key={`review-${result.original_name}-${idx}`}
                result={result}
                onApplyMapping={handleApplyMapping}
                onAcceptMapping={handleAcceptMapping}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="unmapped" className="space-y-3">
          {localValidation.unmapped_exercises.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No unmapped exercises
              </CardContent>
            </Card>
          ) : (
            localValidation.unmapped_exercises.map((result, idx) => (
              <EnhancedMapping
                key={`unmapped-${result.original_name}-${idx}`}
                result={result}
                onApplyMapping={handleApplyMapping}
                onAcceptMapping={handleAcceptMapping}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Target Device Info */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {selectedDevice === 'zwift' ? (
              <Bike className="w-6 h-6 text-primary" />
            ) : (
              <Watch className="w-6 h-6 text-primary" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Target Device:</span>
                <Badge>
                  {selectedDevice === 'garmin' ? 'Garmin' : selectedDevice === 'apple' ? 'Apple Watch' : 'Zwift'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Validation checked against {selectedDevice === 'garmin' ? 'Garmin' : selectedDevice === 'apple' ? 'Apple Watch' : 'Zwift'} exercise library
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={onReValidate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Re-Validate
        </Button>
        <Button
          onClick={() => onProcess(selectedDevice)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4 mr-2" />
          )}
          Export to {selectedDevice === 'garmin' ? 'Garmin' : selectedDevice === 'apple' ? 'Apple Watch' : 'Zwift'}
        </Button>
      </div>
    </div>
  );
}