// API Request/Response Types matching the actual backend

export interface Exercise {
  name: string;
  sets: number | null;
  reps: number | null;
  reps_range: string | null;
  duration_sec: number | null;
  rest_sec: number | null;
  distance_m: number | null;
  distance_range: string | null;
  type: 'strength' | 'cardio' | 'HIIT' | 'interval' | string;
  followAlongUrl?: string | null; // Instagram, TikTok, YouTube, or any video URL for this exercise
}

export interface Superset {
  exercises: Exercise[];
  rest_between_sec: number | null;
}

export interface Block {
  label: string;
  structure: string | null;
  rest_between_sec: number | null;
  time_work_sec: number | null;
  default_reps_range: string | null;
  default_sets: number | null;
  exercises: Exercise[];
  supersets: Superset[];
}

export interface WorkoutStructure {
  title: string;
  source: string;
  blocks: Block[];
}

export interface BlocksJson {
  blocks_json: WorkoutStructure;
}

// Validation Types
export interface ExerciseSuggestion {
  name: string;
  score: number;
  normalized: string;
  keyword?: string;
}

export interface ValidationSuggestions {
  similar: ExerciseSuggestion[];
  by_type: ExerciseSuggestion[];
  category: string | null;
  needs_user_search: boolean;
}

export interface ValidationResult {
  original_name: string;
  mapped_to: string | null;
  confidence: number;
  description: string;
  block: string;
  location: string;
  status: 'valid' | 'needs_review';
  suggestions: ValidationSuggestions;
}

export interface ValidationResponse {
  total_exercises: number;
  validated_exercises: ValidationResult[];
  needs_review: ValidationResult[];
  unmapped_exercises: ValidationResult[];
  can_proceed: boolean;
}

// Export Formats
export interface ExportFormats {
  yaml: string;
  fit?: string;
  plist?: string;
  zwo?: string;
}

// Workflow Response
export interface WorkflowProcessResponse {
  validation: ValidationResponse;
  yaml: string | null;
  message: string;
}

// Exercise Suggestion Response
export interface ExerciseSuggestResponse {
  input: string;
  best_match: {
    name: string;
    score: number;
    is_exact: boolean;
  } | null;
  similar_exercises: ExerciseSuggestion[];
  exercises_by_type: ExerciseSuggestion[];
  category: string | null;
  needs_user_search: boolean;
}

// Mapping Types
export interface ExerciseMapping {
  exercise_name: string;
  garmin_name: string;
  created_at?: string;
}

export interface MappingResponse {
  message: string;
  mapping: ExerciseMapping;
}

export interface MappingLookupResponse {
  exercise_name: string;
  mapped_to: string | null;
  exists: boolean;
}

// Source Types (for UI)
export type SourceType = 'instagram' | 'youtube' | 'image' | 'ai-text';

export interface Source {
  id: string;
  type: SourceType;
  content: string;
  timestamp: Date;
}
