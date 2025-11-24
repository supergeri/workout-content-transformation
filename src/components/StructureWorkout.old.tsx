import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Watch, Bike, Wand2, ShieldCheck, Edit2, Check, X, Trash2, GripVertical, Plus, Video, ExternalLink, Save, RotateCcw, Clock, Layers, ChevronDown, Timer, Repeat, Zap } from 'lucide-react';
import { FollowAlongInstructions } from './FollowAlongInstructions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverEvent, useDroppable } from '@dnd-kit/core';
import React from 'react';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WorkoutStructure, Exercise } from '../types/workout';
import { DeviceId, getDevicesByIds, getDeviceById } from '../lib/devices';
import { ExerciseSearch } from './ExerciseSearch';
import { DroppableSuperset } from './DroppableSuperset';
import { OCRQualityRecommendation } from './OCRQualityRecommendation';
import { analyzeOCRQuality } from '../lib/ocr-quality';
import { getImageProcessingMethod } from '../lib/preferences';

type Props = {
  workout: WorkoutStructure;
  onWorkoutChange: (workout: WorkoutStructure) => void;
  onAutoMap: () => void;
  onValidate: () => void;
  onSave?: () => void | Promise<void>;
  isEditingFromHistory?: boolean;
  loading: boolean;
  selectedDevice: DeviceId;
  onDeviceChange: (device: DeviceId) => void;
  userSelectedDevices: DeviceId[];
};

type SortableExerciseProps = {
  exercise: Exercise;
  exerciseId: string;
  onEdit: () => void;
  onDelete: () => void;
};

// Droppable component for block-level exercises
function BlockExercisesDroppable({ blockIdx, children }: { blockIdx: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `block-exercises-${blockIdx}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${isOver ? 'bg-primary/10 border-primary border-2 rounded' : ''}`}
    >
      {children}
    </div>
  );
}

function SortableExercise({ exercise, exerciseId, onEdit, onDelete }: SortableExerciseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: exerciseId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getDisplayText = () => {
    const parts: string[] = [];
    if (exercise.sets) parts.push(`${exercise.sets} sets`);
    if (exercise.reps) parts.push(`${exercise.reps} reps`);
    if (exercise.reps_range) parts.push(`${exercise.reps_range} reps`);
    if (exercise.duration_sec) parts.push(`${exercise.duration_sec}s`);
    if (exercise.distance_m) parts.push(`${exercise.distance_m}m`);
    if (exercise.distance_range) parts.push(`${exercise.distance_range}`);
    if (exercise.rest_sec) parts.push(`Rest: ${exercise.rest_sec}s`);
    return parts.length > 0 ? parts.join(' • ') : 'No details';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50 hover:bg-muted"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{exercise.name}</p>
          {exercise.followAlongUrl && (
            <a
              href={exercise.followAlongUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-primary hover:text-primary/80"
              title="View follow-along video"
            >
              <Video className="w-4 h-4" />
            </a>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {getDisplayText()}
        </p>
      </div>
      
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function StructureWorkout({
  workout,
  onWorkoutChange,
  onAutoMap,
  onValidate,
  onSave,
  isEditingFromHistory = false,
  loading,
  selectedDevice,
  onDeviceChange,
  userSelectedDevices,
  onNavigateToSettings
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(workout.title);
  const [editingExercise, setEditingExercise] = useState<{ blockIdx: number; supersetIdx: number | null; exerciseIdx: number; originalExercise: Exercise } | null>(null);
  const [editedExerciseData, setEditedExerciseData] = useState<Exercise | null>(null);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [addingToBlock, setAddingToBlock] = useState<{ blockIdx: number; supersetIdx: number } | null>(null);
  const [editingSupersetRest, setEditingSupersetRest] = useState<{ blockIdx: number; supersetIdx: number } | null>(null);
  
  // Analyze OCR quality if OCR was used (not Vision API)
  const usedVisionAPI = getImageProcessingMethod() === 'vision';
  const ocrQuality = analyzeOCRQuality(workout, usedVisionAPI);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const availableDevices = getDevicesByIds(userSelectedDevices);

  const saveTitle = () => {
    onWorkoutChange({ ...workout, title: tempTitle });
    setEditingTitle(false);
  };

  const handleDragEnd = (event: DragEndEvent, blockIdx: number) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const newWorkout = JSON.parse(JSON.stringify(workout));
    
    // Original logic for dragging within structure
    if (blockIdx === -1) return; // Left panel doesn't have draggable items anymore
    
    const block = newWorkout.blocks[blockIdx];

    // Parse active and over IDs to get block, superset, and exercise indices
    // Format for superset exercises: `${blockIdx}-${supersetIdx}-${exerciseIdx}`
    // Format for block-level exercises: `block-${blockIdx}-${exerciseIdx}`
    const parseId = (id: string | number) => {
      const idStr = String(id);
      if (idStr.startsWith('block-')) {
        // Block-level exercise
        const parts = idStr.split('-');
        return {
          blockIdx: parseInt(parts[1]),
          supersetIdx: null as number | null,
          exerciseIdx: parseInt(parts[2])
        };
      } else {
        // Superset exercise
        const parts = idStr.split('-');
        return {
          blockIdx: parseInt(parts[0]),
          supersetIdx: parseInt(parts[1]),
          exerciseIdx: parseInt(parts[2])
        };
      }
    };

    const overIdStr = String(over.id);
    const activeInfo = parseId(active.id);
    
    // Check if dragging over a superset container (format: `superset-${blockIdx}-${supersetIdx}`)
    if (overIdStr.startsWith('superset-')) {
      // Dragging over a superset container - move to that superset
      const parts = overIdStr.split('-');
      const targetSupersetIdx = parseInt(parts[2]);
      
      let exercise: Exercise;
      
      // Get exercise from source (block-level or superset)
      if (activeInfo.supersetIdx === null) {
        // Moving from block-level to superset
        exercise = block.exercises[activeInfo.exerciseIdx];
        block.exercises.splice(activeInfo.exerciseIdx, 1);
      } else {
        // Moving from one superset to another
        if (activeInfo.supersetIdx === targetSupersetIdx) return; // Same superset, no change
        exercise = block.supersets[activeInfo.supersetIdx].exercises[activeInfo.exerciseIdx];
        block.supersets[activeInfo.supersetIdx].exercises.splice(activeInfo.exerciseIdx, 1);
      }
      
      // Add to target superset (at the end)
      block.supersets[targetSupersetIdx].exercises.push(exercise);
      
      onWorkoutChange(newWorkout);
      return;
    }
    
    // Check if dragging over block-level drop zone (format: `block-exercises-${blockIdx}`)
    if (overIdStr.startsWith('block-exercises-')) {
      const targetBlockIdx = parseInt(overIdStr.split('-')[2]);
      if (targetBlockIdx !== blockIdx) return; // Different block, ignore
      
      let exercise: Exercise;
      
      // Get exercise from source (superset)
      if (activeInfo.supersetIdx === null) {
        // Already block-level, will be handled by reordering below
        return;
      } else {
        // Moving from superset to block-level
        exercise = block.supersets[activeInfo.supersetIdx].exercises[activeInfo.exerciseIdx];
        block.supersets[activeInfo.supersetIdx].exercises.splice(activeInfo.exerciseIdx, 1);
      }
      
      // Add to block-level exercises (at the end)
      if (!block.exercises) {
        block.exercises = [];
      }
      block.exercises.push(exercise);
      
      onWorkoutChange(newWorkout);
      return;
    }

    // Dragging over another exercise - move within or between locations
    try {
      const overInfo = parseId(over.id);

      // Case 1: Both are block-level exercises - reorder within block
      if (activeInfo.supersetIdx === null && overInfo.supersetIdx === null) {
        const exercises = block.exercises;
        const oldIndex = activeInfo.exerciseIdx;
        const newIndex = overInfo.exerciseIdx;
        block.exercises = arrayMove(exercises, oldIndex, newIndex);
        onWorkoutChange(newWorkout);
        return;
      }
      
      // Case 2: Both are superset exercises - move within or between supersets
      if (activeInfo.supersetIdx !== null && overInfo.supersetIdx !== null) {
        if (activeInfo.supersetIdx === overInfo.supersetIdx) {
          // Moving within the same superset
          const exercises = block.supersets[activeInfo.supersetIdx].exercises;
          const oldIndex = activeInfo.exerciseIdx;
          const newIndex = overInfo.exerciseIdx;
          block.supersets[activeInfo.supersetIdx].exercises = arrayMove(exercises, oldIndex, newIndex);
        } else {
          // Moving between different supersets
          const sourceSuperset = block.supersets[activeInfo.supersetIdx];
          const targetSuperset = block.supersets[overInfo.supersetIdx];
          const exercise = sourceSuperset.exercises[activeInfo.exerciseIdx];
          
          // Remove from source
          sourceSuperset.exercises.splice(activeInfo.exerciseIdx, 1);
          
          // Insert at target position
          targetSuperset.exercises.splice(overInfo.exerciseIdx, 0, exercise);
        }
        onWorkoutChange(newWorkout);
        return;
      }
      
      // Case 3: Moving between block-level and superset
      let exercise: Exercise;
      if (activeInfo.supersetIdx === null) {
        // Moving from block-level to superset
        exercise = block.exercises[activeInfo.exerciseIdx];
        block.exercises.splice(activeInfo.exerciseIdx, 1);
        // Insert into target superset
        block.supersets[overInfo.supersetIdx!].exercises.splice(overInfo.exerciseIdx, 0, exercise);
      } else {
        // Moving from superset to block-level
        exercise = block.supersets[activeInfo.supersetIdx].exercises[activeInfo.exerciseIdx];
        block.supersets[activeInfo.supersetIdx].exercises.splice(activeInfo.exerciseIdx, 1);
        // Ensure block.exercises exists
        if (!block.exercises) {
          block.exercises = [];
        }
        // Insert into block-level at target position
        block.exercises.splice(overInfo.exerciseIdx, 0, exercise);
      }
      
      onWorkoutChange(newWorkout);
    } catch (error) {
      console.error('Error handling drag end:', error);
    }
  };

  const deleteExercise = (blockIdx: number, supersetIdx: number | null, exerciseIdx: number) => {
    const newWorkout = JSON.parse(JSON.stringify(workout));
    if (supersetIdx === null) {
      // Delete from block-level exercises
      newWorkout.blocks[blockIdx].exercises.splice(exerciseIdx, 1);
    } else {
      // Delete from superset
      newWorkout.blocks[blockIdx].supersets[supersetIdx].exercises.splice(exerciseIdx, 1);
    }
    onWorkoutChange(newWorkout);
  };


  const updateExercise = (blockIdx: number, supersetIdx: number | null, exerciseIdx: number, updates: Partial<Exercise>) => {
    const newWorkout = JSON.parse(JSON.stringify(workout));
    if (supersetIdx === null) {
      // Update block-level exercise
      const exercise = newWorkout.blocks[blockIdx].exercises[exerciseIdx];
      newWorkout.blocks[blockIdx].exercises[exerciseIdx] = {
        ...exercise,
        ...updates
      };
    } else {
      // Update superset exercise
      const exercise = newWorkout.blocks[blockIdx].supersets[supersetIdx].exercises[exerciseIdx];
      newWorkout.blocks[blockIdx].supersets[supersetIdx].exercises[exerciseIdx] = {
        ...exercise,
        ...updates
      };
    }
    onWorkoutChange(newWorkout);
  };

  const handleEditExercise = (blockIdx: number, supersetIdx: number | null, exerciseIdx: number) => {
    const exercise = supersetIdx === null 
      ? workout.blocks[blockIdx].exercises[exerciseIdx]
      : workout.blocks[blockIdx].supersets[supersetIdx].exercises[exerciseIdx];
    setEditingExercise({ blockIdx, supersetIdx, exerciseIdx, originalExercise: { ...exercise } });
    setEditedExerciseData({ ...exercise });
  };

  const handleSaveExercise = () => {
    if (!editingExercise || !editedExerciseData) return;
    updateExercise(
      editingExercise.blockIdx,
      editingExercise.supersetIdx,
      editingExercise.exerciseIdx,
      editedExerciseData
    );
    setEditingExercise(null);
    setEditedExerciseData(null);
  };

  const handleRevertExercise = () => {
    if (!editingExercise) return;
    setEditedExerciseData({ ...editingExercise.originalExercise });
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
    setEditedExerciseData(null);
  };

  const addExercise = (blockIdx: number, supersetIdx: number | null, exerciseName: string) => {
    const newWorkout = JSON.parse(JSON.stringify(workout));
    const newExercise: Exercise = {
      name: exerciseName,
      sets: 3,
      reps: 10,
      reps_range: null,
      duration_sec: null,
      rest_sec: 60,
      distance_m: null,
      distance_range: null,
      type: 'strength'
    };
    if (supersetIdx === null) {
      // Add to block-level exercises
      newWorkout.blocks[blockIdx].exercises.push(newExercise);
    } else {
      // Add to superset
      newWorkout.blocks[blockIdx].supersets[supersetIdx].exercises.push(newExercise);
    }
    onWorkoutChange(newWorkout);
    setShowExerciseSearch(false);
    setAddingToBlock(null);
  };

  const updateSupersetRest = (blockIdx: number, supersetIdx: number, restSec: number | null) => {
    const newWorkout = JSON.parse(JSON.stringify(workout));
    newWorkout.blocks[blockIdx].supersets[supersetIdx].rest_between_sec = restSec;
    onWorkoutChange(newWorkout);
  };

  type WorkoutStructureType = 'superset' | 'amrap' | 'emom' | 'for-time' | 'tabata' | 'circuit';

  const createWorkoutStructure = (blockIdx: number, type: WorkoutStructureType) => {
    const newWorkout = JSON.parse(JSON.stringify(workout));
    const block = newWorkout.blocks[blockIdx];
    
    switch (type) {
      case 'superset':
        // For superset, we don't set block.structure, just create the superset
        // This allows multiple supersets without a structure type
        const newSuperset = {
          exercises: [],
          rest_between_sec: 60 // Default 1 minute rest
        };
        block.supersets.push(newSuperset);
        break;
      
      case 'amrap':
        // AMRAP: As Many Rounds As Possible
        block.structure = 'amrap';
        block.time_work_sec = 600; // Default 10 minutes
        block.rest_between_sec = null;
        // Create a default superset for AMRAP exercises
        if (block.supersets.length === 0) {
          block.supersets.push({
            exercises: [],
            rest_between_sec: null
          });
        }
        break;
      
      case 'emom':
        // EMOM: Every Minute On the Minute
        block.structure = 'emom';
        block.time_work_sec = 60; // Default 1 minute per round
        block.rest_between_sec = null;
        if (block.supersets.length === 0) {
          block.supersets.push({
            exercises: [],
            rest_between_sec: null
          });
        }
        break;
      
      case 'for-time':
        // For Time: Complete as fast as possible
        block.structure = 'for-time';
        block.time_work_sec = null;
        block.rest_between_sec = null;
        if (block.supersets.length === 0) {
          block.supersets.push({
            exercises: [],
            rest_between_sec: null
          });
        }
        break;
      
      case 'tabata':
        // Tabata: 20 seconds work, 10 seconds rest
        block.structure = 'tabata';
        block.time_work_sec = 20; // 20 seconds work
        block.rest_between_sec = 10; // 10 seconds rest
        if (block.supersets.length === 0) {
          block.supersets.push({
            exercises: [],
            rest_between_sec: 10
          });
        }
        break;
      
      case 'circuit':
        // Circuit: Multiple exercises in sequence
        block.structure = 'circuit';
        block.time_work_sec = null;
        block.rest_between_sec = 60; // Default 1 minute rest between rounds
        if (block.supersets.length === 0) {
          block.supersets.push({
            exercises: [],
            rest_between_sec: 60
          });
        }
        break;
    }
    
    onWorkoutChange(newWorkout);
  };

  return (
    <div className="space-y-6">
      {/* Show OCR quality recommendation if quality is poor */}
      {ocrQuality && ocrQuality.recommendation === 'poor' && (
        <OCRQualityRecommendation 
          qualityScore={ocrQuality.score} 
          onNavigateToSettings={onNavigateToSettings}
        />
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {editingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                    className="max-w-md"
                  />
                  <Button size="sm" onClick={saveTitle}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingTitle(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CardTitle>{workout.title}</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => setEditingTitle(true)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Target Device: {availableDevices.find(d => d.id === selectedDevice)?.name || getDeviceById(selectedDevice)?.name || selectedDevice}</Label>
            <div className="flex gap-2 mt-2">
              {availableDevices.map((device) => (
                <Button
                  key={device.id}
                  variant={selectedDevice === device.id ? 'default' : 'outline'}
                  onClick={() => onDeviceChange(device.id)}
                  className="gap-2"
                >
                  {device.id === 'garmin' && <Watch className="w-4 h-4" />}
                  {device.id === 'apple' && <Watch className="w-4 h-4" />}
                  {device.id === 'zwift' && <Bike className="w-4 h-4" />}
                  {device.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {isEditingFromHistory ? (
              <>
                {onSave && (
                  <Button onClick={onSave} disabled={loading} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                )}
                <Button onClick={onAutoMap} disabled={loading} variant="outline" className="gap-2">
                  <Wand2 className="w-4 h-4" />
                  Re-Auto-Map & Export
                </Button>
                <Button onClick={onValidate} disabled={loading} variant="outline" className="gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Re-Validate & Review
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onAutoMap} disabled={loading} className="gap-2">
                  <Wand2 className="w-4 h-4" />
                  Auto-Map & Export
                </Button>
                <Button onClick={onValidate} disabled={loading} variant="outline" className="gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Validate & Review
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two-panel layout: Exercises on left, Structure on right */}
      <div className="grid grid-cols-2 gap-4 h-[600px]">
        {/* Left Panel: Available Exercises */}
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Available Exercises</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowExerciseSearch(true);
                setAddingToBlock({ blockIdx: 0, supersetIdx: null });
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </Button>
          </div>
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Drag exercises from here to the workout structure on the right. Exercises in the structure won't appear here.
              </p>
              {/* Left panel is now just for adding new exercises - existing exercises are only shown in the structure */}
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>Exercises are organized in the structure on the right.</p>
                <p className="mt-2">Use the "Add Exercise" button above to add new exercises.</p>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel: Workout Structure */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Workout Structure</h3>
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="space-y-4 pr-4">
              {workout.blocks.map((block, blockIdx) => (
            <Card key={blockIdx}>
              <CardHeader>
                <CardTitle className="text-lg">{block.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Workout Structure Dropdown - Always show at the top */}
                <div className="mb-4 p-3 border-2 border-dashed rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {block.structure ? `Current: ${block.structure.toUpperCase()}` : 'No workout structure set'}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={block.structure ? "outline" : "default"}
                        size="default"
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {block.structure ? 'Change Workout Structure' : 'Select Workout Structure Type'}
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuLabel>Workout Structure Types</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'superset')}>
                        <Layers className="w-4 h-4 mr-2" />
                        <div className="flex flex-col">
                          <span>Superset</span>
                          <span className="text-xs text-muted-foreground">Rest between exercises</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'amrap')}>
                        <Timer className="w-4 h-4 mr-2" />
                        <div className="flex flex-col">
                          <span>AMRAP</span>
                          <span className="text-xs text-muted-foreground">As Many Rounds As Possible</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'emom')}>
                        <Repeat className="w-4 h-4 mr-2" />
                        <div className="flex flex-col">
                          <span>EMOM</span>
                          <span className="text-xs text-muted-foreground">Every Minute On the Minute</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'for-time')}>
                        <Zap className="w-4 h-4 mr-2" />
                        <div className="flex flex-col">
                          <span>For Time</span>
                          <span className="text-xs text-muted-foreground">Complete as fast as possible</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'tabata')}>
                        <Timer className="w-4 h-4 mr-2" />
                        <div className="flex flex-col">
                          <span>Tabata</span>
                          <span className="text-xs text-muted-foreground">20s work, 10s rest</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'circuit')}>
                        <Repeat className="w-4 h-4 mr-2" />
                        <div className="flex flex-col">
                          <span>Circuit</span>
                          <span className="text-xs text-muted-foreground">Multiple rounds</span>
                        </div>
                      </DropdownMenuItem>
                      {block.structure && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              const newWorkout = JSON.parse(JSON.stringify(workout));
                              newWorkout.blocks[blockIdx].structure = null;
                              newWorkout.blocks[blockIdx].time_work_sec = null;
                              onWorkoutChange(newWorkout);
                            }}
                            variant="destructive"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove Structure Type
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {block.supersets.length > 0 && !block.structure && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      This block has {block.supersets.length} existing superset{block.supersets.length !== 1 ? 's' : ''}. Select a structure type to organize them.
                    </div>
                  )}
                </div>
                
                {/* Show block structure type if set */}
                {block.structure && (
                  <div className="mb-2 px-3 py-2 bg-primary/10 rounded-md border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">
                          {block.structure.toUpperCase()}
                          {block.time_work_sec && ` - ${block.time_work_sec}s`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                            >
                              Change
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel>Change Structure Type</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'superset')}>
                              <Layers className="w-4 h-4 mr-2" />
                              Superset
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'amrap')}>
                              <Timer className="w-4 h-4 mr-2" />
                              AMRAP
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'emom')}>
                              <Repeat className="w-4 h-4 mr-2" />
                              EMOM
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'for-time')}>
                              <Zap className="w-4 h-4 mr-2" />
                              For Time
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'tabata')}>
                              <Timer className="w-4 h-4 mr-2" />
                              Tabata
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => createWorkoutStructure(blockIdx, 'circuit')}>
                              <Repeat className="w-4 h-4 mr-2" />
                              Circuit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                const newWorkout = JSON.parse(JSON.stringify(workout));
                                newWorkout.blocks[blockIdx].structure = null;
                                newWorkout.blocks[blockIdx].time_work_sec = null;
                                onWorkoutChange(newWorkout);
                              }}
                              variant="destructive"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Remove Structure
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newWorkout = JSON.parse(JSON.stringify(workout));
                            newWorkout.blocks[blockIdx].structure = null;
                            newWorkout.blocks[blockIdx].time_work_sec = null;
                            onWorkoutChange(newWorkout);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Single DndContext for entire block to allow cross-superset and block-level dragging */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, blockIdx)}
                >
                  {/* Block-level exercises section (exercises outside of supersets) */}
                  {block.exercises && block.exercises.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Block Exercises (Outside Superset)</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAddingToBlock({ blockIdx, supersetIdx: null });
                            setShowExerciseSearch(true);
                          }}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Exercise
                        </Button>
                      </div>
                      <BlockExercisesDroppable blockIdx={blockIdx}>
                        <div className="space-y-2 border rounded-lg p-3 bg-card">
                          <SortableContext 
                            items={block.exercises.map((_, idx) => `block-${blockIdx}-${idx}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            {block.exercises.map((exercise, exerciseIdx) => {
                              const exerciseId = `block-${blockIdx}-${exerciseIdx}`;
                              return (
                                <SortableExercise
                                  key={exerciseId}
                                  exercise={exercise}
                                  exerciseId={exerciseId}
                                  onEdit={() => handleEditExercise(blockIdx, null, exerciseIdx)}
                                  onDelete={() => deleteExercise(blockIdx, null, exerciseIdx)}
                                />
                              );
                            })}
                          </SortableContext>
                        </div>
                      </BlockExercisesDroppable>
                    </div>
                  )}
                  
                  {/* Add Exercise button for block-level if no block exercises exist */}
                  {(!block.exercises || block.exercises.length === 0) && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium text-muted-foreground">Block Exercises</Label>
                      </div>
                      <BlockExercisesDroppable blockIdx={blockIdx}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAddingToBlock({ blockIdx, supersetIdx: null });
                            setShowExerciseSearch(true);
                          }}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Exercise to Block (Outside Superset)
                        </Button>
                      </BlockExercisesDroppable>
                    </div>
                  )}
                    {block.supersets.map((superset, supersetIdx) => {
                      const exerciseIds = superset.exercises.map((_, idx) => `${blockIdx}-${supersetIdx}-${idx}`);
                      const isEditingRest = editingSupersetRest?.blockIdx === blockIdx && editingSupersetRest?.supersetIdx === supersetIdx;
                      const supersetDropId = `superset-${blockIdx}-${supersetIdx}`;
                      
                      return (
                    <div key={supersetIdx} className="space-y-2 border rounded-lg p-3 bg-muted/30">
                      {/* Superset Header with Rest Period */}
                      <div className="flex items-center justify-between mb-2 pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Superset {supersetIdx + 1}</span>
                          {superset.exercises.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">(empty - drag exercises here)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isEditingRest ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={superset.rest_between_sec || ''}
                                onChange={(e) => {
                                  const value = e.target.value ? parseInt(e.target.value) : null;
                                  updateSupersetRest(blockIdx, supersetIdx, value);
                                }}
                                placeholder="Rest (sec)"
                                className="w-24 h-8"
                                onBlur={() => setEditingSupersetRest(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingSupersetRest(null);
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingSupersetRest(null)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingSupersetRest({ blockIdx, supersetIdx })}
                              className="h-8 gap-1 text-xs"
                            >
                              <Clock className="w-3 h-3" />
                              {superset.rest_between_sec ? `${superset.rest_between_sec}s rest` : 'Set rest'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Droppable superset container */}
                      <DroppableSuperset
                        id={supersetDropId}
                        exerciseIds={exerciseIds}
                        isEmpty={superset.exercises.length === 0}
                      >
                        {/* Only render exercises if superset is not empty */}
                        {superset.exercises.length > 0 && superset.exercises.map((exercise, exerciseIdx) => {
                          const exerciseId = `${blockIdx}-${supersetIdx}-${exerciseIdx}`;
                          
                          return (
                            <SortableExercise
                              key={exerciseId}
                              exercise={exercise}
                              exerciseId={exerciseId}
                              onEdit={() => handleEditExercise(blockIdx, supersetIdx, exerciseIdx)}
                              onDelete={() => deleteExercise(blockIdx, supersetIdx, exerciseIdx)}
                            />
                          );
                        })}
                      </DroppableSuperset>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAddingToBlock({ blockIdx, supersetIdx });
                          setShowExerciseSearch(true);
                        }}
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Exercise
                      </Button>
                    </div>
                  );
                })}
                </DndContext>
              </CardContent>
            </Card>
          ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Exercise Search Modal */}
      {showExerciseSearch && addingToBlock && (
        <ExerciseSearch
          onSelect={(exerciseName) => addExercise(addingToBlock.blockIdx, addingToBlock.supersetIdx, exerciseName)}
          onClose={() => {
            setShowExerciseSearch(false);
            setAddingToBlock(null);
          }}
          device={selectedDevice}
        />
      )}

      {/* Exercise Edit Dialog */}
      <Dialog open={editingExercise !== null} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>
          {editedExerciseData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="exercise-name">Exercise Name</Label>
                <Input
                  id="exercise-name"
                  value={editedExerciseData.name}
                  onChange={(e) => setEditedExerciseData({ ...editedExerciseData, name: e.target.value })}
                  placeholder="Exercise name"
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="exercise-sets">Sets</Label>
                    <Input
                      id="exercise-sets"
                      value={editedExerciseData.sets || ''}
                      onChange={(e) => setEditedExerciseData({ ...editedExerciseData, sets: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Sets"
                      type="number"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="exercise-rest">Rest (sec)</Label>
                    <Input
                      id="exercise-rest"
                      value={editedExerciseData.rest_sec || ''}
                      onChange={(e) => setEditedExerciseData({ ...editedExerciseData, rest_sec: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Rest (sec)"
                      type="number"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor="exercise-reps">Reps</Label>
                    <Input
                      id="exercise-reps"
                      value={editedExerciseData.reps || ''}
                      onChange={(e) => {
                        const reps = e.target.value ? parseInt(e.target.value) : null;
                        setEditedExerciseData({ 
                          ...editedExerciseData, 
                          reps,
                          distance_m: reps ? null : editedExerciseData.distance_m // Clear distance if setting reps
                        });
                      }}
                      placeholder="Reps"
                      type="number"
                      className="mt-1"
                    />
                  </div>
                  <div className="text-muted-foreground text-sm px-2 pb-2">or</div>
                  <div className="flex-1">
                    <Label htmlFor="exercise-distance">Distance (m)</Label>
                    <Input
                      id="exercise-distance"
                      value={editedExerciseData.distance_m || ''}
                      onChange={(e) => {
                        const distance_m = e.target.value ? parseInt(e.target.value) : null;
                        setEditedExerciseData({ 
                          ...editedExerciseData, 
                          distance_m,
                          reps: distance_m ? null : editedExerciseData.reps // Clear reps if setting distance
                        });
                      }}
                      placeholder="Distance (m)"
                      type="number"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Follow-Along Video URL
                  </Label>
                  <FollowAlongInstructions />
                </div>
                <Input
                  value={editedExerciseData.followAlongUrl || ''}
                  onChange={(e) => setEditedExerciseData({ ...editedExerciseData, followAlongUrl: e.target.value || null })}
                  placeholder="Instagram, TikTok, YouTube, or any video URL"
                  type="url"
                />
                {editedExerciseData.followAlongUrl && (
                  <a
                    href={editedExerciseData.followAlongUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Open link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleRevertExercise}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Revert
            </Button>
            <Button onClick={handleSaveExercise}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}