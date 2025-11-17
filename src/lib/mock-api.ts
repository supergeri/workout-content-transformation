import { WorkoutStructure, ValidationResponse, ExportFormats, SourceType, ValidationResult, ExerciseSuggestResponse } from '../types/workout';

// Mock delay to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock workout generation from sources
export async function generateWorkoutStructure(sources: Array<{ type: SourceType; content: string }>): Promise<WorkoutStructure> {
  await delay(1500);
  
  // Mock response based on source type
  return {
    title: "Hyrox Session",
    source: sources.map(s => `${s.type}:${s.content}`).join(' | '),
    blocks: [
      {
        label: "Hyrox",
        structure: "for time (cap: 35 min)",
        rest_between_sec: null,
        time_work_sec: 2100,
        default_reps_range: null,
        default_sets: null,
        exercises: [],
        supersets: [
          {
            exercises: [
              { 
                name: "1200 m Run", 
                sets: null,
                reps: null,
                reps_range: null,
                duration_sec: null,
                rest_sec: null,
                distance_m: 1200,
                distance_range: null,
                type: "HIIT"
              },
              { 
                name: "100 m KB Farmers (32/24kg)", 
                sets: null,
                reps: null,
                reps_range: null,
                duration_sec: null,
                rest_sec: null,
                distance_m: 100,
                distance_range: null,
                type: "HIIT"
              },
              { 
                name: "1000 m Run", 
                sets: null,
                reps: null,
                reps_range: null,
                duration_sec: null,
                rest_sec: null,
                distance_m: 1000,
                distance_range: null,
                type: "HIIT"
              },
              { 
                name: "80 Walking Lunges (30/20kg)", 
                sets: null,
                reps: 80,
                reps_range: null,
                duration_sec: null,
                rest_sec: null,
                distance_m: null,
                distance_range: null,
                type: "HIIT"
              }
            ],
            rest_between_sec: null
          }
        ]
      }
    ]
  };
}

// Mock auto-map
export async function autoMapWorkout(blocks_json: WorkoutStructure): Promise<ExportFormats> {
  await delay(1200);
  
  const allExercises = blocks_json.blocks.flatMap(block => [
    ...(block.exercises || []),
    ...(block.supersets || []).flatMap(ss => ss.exercises || [])
  ]);
  
  const yaml = `settings:
  deleteSameNameWorkout: true
workouts:
  ${blocks_json.title}:
    sport: ${allExercises[0]?.type === 'strength' ? 'strength' : 'running'}
    steps:
${allExercises.map((ex, i) => `    - type: exercise
      exerciseName: ${ex.name}
      ${ex.sets ? `sets: ${ex.sets}` : ''}
      ${ex.reps ? `repetitionValue: ${ex.reps}` : ''}
      ${ex.reps_range ? `repetitionValue: ${ex.reps_range}` : ''}
      ${ex.duration_sec ? `duration: ${ex.duration_sec}` : ''}
      ${ex.rest_sec ? `rest: ${ex.rest_sec}` : ''}`).join('\n')}
schedulePlan:
  start_from: '2025-11-21'
  workouts:
  - ${blocks_json.title}
`;

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN">
<plist version="1.0">
<dict>
  <key>name</key>
  <string>${blocks_json.title}</string>
  <key>blocks</key>
  <array>
    <!-- Exercise blocks here -->
  </array>
</dict>
</plist>`;

  const zwo = `<workout_file>
  <name>${blocks_json.title}</name>
  <workout>
    <!-- Exercise blocks here -->
  </workout>
</workout_file>`;

  const fit = `FIT file data for ${blocks_json.title}`;

  return { yaml, plist, zwo, fit };
}

// Mock validation
export async function validateWorkout(blocks_json: WorkoutStructure): Promise<ValidationResponse> {
  await delay(1000);
  
  const allExercisesData: Array<{ name: string; block: string; location: string }> = [];
  
  blocks_json.blocks.forEach((block, blockIdx) => {
    // Check block-level exercises
    (block.exercises || []).forEach((ex, exIdx) => {
      allExercisesData.push({
        name: ex.name,
        block: block.label,
        location: `blocks[${blockIdx}].exercises[${exIdx}]`
      });
    });
    
    // Check superset exercises
    (block.supersets || []).forEach((ss, ssIdx) => {
      (ss.exercises || []).forEach((ex, exIdx) => {
        allExercisesData.push({
          name: ex.name,
          block: block.label,
          location: `blocks[${blockIdx}].supersets[${ssIdx}].exercises[${exIdx}]`
        });
      });
    });
  });

  const validated: ValidationResult[] = allExercisesData.slice(0, Math.floor(allExercisesData.length * 0.6)).map(ex => ({
    original_name: ex.name,
    mapped_to: ex.name,
    confidence: 0.95,
    description: `lap | ${ex.name}`,
    block: ex.block,
    location: ex.location,
    status: 'valid' as const,
    suggestions: {
      similar: [
        { name: ex.name, score: 0.95, normalized: ex.name.toLowerCase() }
      ],
      by_type: [],
      category: null,
      needs_user_search: false
    }
  }));

  const needsReview: ValidationResult[] = allExercisesData.slice(
    Math.floor(allExercisesData.length * 0.6), 
    Math.floor(allExercisesData.length * 0.85)
  ).map(ex => ({
    original_name: ex.name,
    mapped_to: ex.name,
    confidence: 0.75,
    description: `lap | ${ex.name}`,
    block: ex.block,
    location: ex.location,
    status: 'needs_review' as const,
    suggestions: {
      similar: [
        { name: ex.name, score: 0.75, normalized: ex.name.toLowerCase() },
        { name: `${ex.name} (Alt)`, score: 0.65, normalized: `${ex.name} alt`.toLowerCase() }
      ],
      by_type: [
        { name: ex.name, score: 0.75, normalized: ex.name.toLowerCase(), keyword: ex.name.split(' ')[0].toLowerCase() }
      ],
      category: ex.name.split(' ')[0].toLowerCase(),
      needs_user_search: false
    }
  }));

  const unmapped: ValidationResult[] = allExercisesData.slice(Math.floor(allExercisesData.length * 0.85)).map(ex => ({
    original_name: ex.name,
    mapped_to: null,
    confidence: 0,
    description: `lap | ${ex.name}`,
    block: ex.block,
    location: ex.location,
    status: 'needs_review' as const,
    suggestions: {
      similar: [],
      by_type: [],
      category: null,
      needs_user_search: true
    }
  }));

  return {
    total_exercises: allExercisesData.length,
    validated_exercises: validated,
    needs_review: needsReview,
    unmapped_exercises: unmapped,
    can_proceed: unmapped.length === 0
  };
}

// Mock exercise suggestions
export async function getExerciseSuggestions(exerciseName: string): Promise<ExerciseSuggestResponse> {
  await delay(500);
  
  const normalized = exerciseName.toLowerCase();
  const hasMatch = normalized.includes('squat') || normalized.includes('bench') || normalized.includes('run');
  
  if (!hasMatch) {
    return {
      input: exerciseName,
      best_match: null,
      similar_exercises: [],
      exercises_by_type: [],
      category: null,
      needs_user_search: true
    };
  }
  
  const category = normalized.includes('squat') ? 'squat' 
    : normalized.includes('bench') ? 'bench'
    : normalized.includes('run') ? 'run'
    : 'exercise';
  
  return {
    input: exerciseName,
    best_match: {
      name: exerciseName,
      score: 0.85,
      is_exact: false
    },
    similar_exercises: [
      { name: exerciseName, score: 0.85, normalized },
      { name: `${exerciseName} (Alt)`, score: 0.75, normalized: `${normalized} alt` },
      { name: `Modified ${exerciseName}`, score: 0.65, normalized: `modified ${normalized}` }
    ],
    exercises_by_type: [
      { name: exerciseName, score: 0.85, normalized, keyword: category },
      { name: `${category.charAt(0).toUpperCase() + category.slice(1)} Variation`, score: 0.70, normalized: `${category} variation`, keyword: category }
    ],
    category,
    needs_user_search: false
  };
}

// Mock process workflow
export async function processWorkflow(blocks_json: WorkoutStructure, autoProceed: boolean = false): Promise<ExportFormats> {
  await delay(1500);
  return autoMapWorkout(blocks_json);
}