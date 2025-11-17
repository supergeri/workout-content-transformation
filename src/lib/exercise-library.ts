// Mock exercise library for autocomplete and mapping

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  category: string;
  deviceId: string;
  aliases: string[];
  equipment?: string;
}

// Mock exercise library (would come from API/Supabase in production)
export const exerciseLibrary: ExerciseLibraryItem[] = [
  // Upper Body - Push
  { id: 'g1', name: 'Push-ups', category: 'Upper Push', deviceId: '1', aliases: ['pushup', 'press up'], equipment: 'bodyweight' },
  { id: 'g2', name: 'Bench Press', category: 'Upper Push', deviceId: '2', aliases: ['bench', 'barbell bench'], equipment: 'barbell' },
  { id: 'g3', name: 'Overhead Press', category: 'Upper Push', deviceId: '3', aliases: ['shoulder press', 'military press'], equipment: 'barbell' },
  { id: 'g4', name: 'Dumbbell Chest Press', category: 'Upper Push', deviceId: '4', aliases: ['db press', 'dumbbell bench'], equipment: 'dumbbells' },
  { id: 'g5', name: 'Dips', category: 'Upper Push', deviceId: '5', aliases: ['tricep dips', 'parallel bar dips'], equipment: 'bodyweight' },
  
  // Upper Body - Pull
  { id: 'g6', name: 'Pull-ups', category: 'Upper Pull', deviceId: '6', aliases: ['pullup', 'chin up'], equipment: 'bodyweight' },
  { id: 'g7', name: 'Bent Over Row', category: 'Upper Pull', deviceId: '7', aliases: ['barbell row', 'bb row'], equipment: 'barbell' },
  { id: 'g8', name: 'Lat Pulldown', category: 'Upper Pull', deviceId: '8', aliases: ['lat pull', 'pulldown'], equipment: 'cable' },
  { id: 'g9', name: 'Dumbbell Row', category: 'Upper Pull', deviceId: '9', aliases: ['db row', 'one arm row'], equipment: 'dumbbells' },
  { id: 'g10', name: 'Face Pulls', category: 'Upper Pull', deviceId: '10', aliases: ['cable face pull'], equipment: 'cable' },
  
  // Lower Body
  { id: 'g11', name: 'Squats', category: 'Lower Body', deviceId: '11', aliases: ['back squat', 'barbell squat'], equipment: 'barbell' },
  { id: 'g12', name: 'Deadlift', category: 'Lower Body', deviceId: '12', aliases: ['conventional deadlift'], equipment: 'barbell' },
  { id: 'g13', name: 'Lunges', category: 'Lower Body', deviceId: '13', aliases: ['walking lunge', 'reverse lunge'], equipment: 'bodyweight' },
  { id: 'g14', name: 'Leg Press', category: 'Lower Body', deviceId: '14', aliases: ['machine leg press'], equipment: 'machine' },
  { id: 'g15', name: 'Romanian Deadlift', category: 'Lower Body', deviceId: '15', aliases: ['rdl', 'stiff leg deadlift'], equipment: 'barbell' },
  { id: 'g16', name: 'Bulgarian Split Squat', category: 'Lower Body', deviceId: '16', aliases: ['split squat', 'rear foot elevated'], equipment: 'dumbbells' },
  
  // Core
  { id: 'g17', name: 'Plank', category: 'Core', deviceId: '17', aliases: ['front plank', 'forearm plank'], equipment: 'bodyweight' },
  { id: 'g18', name: 'Sit-ups', category: 'Core', deviceId: '18', aliases: ['crunches', 'ab crunches'], equipment: 'bodyweight' },
  { id: 'g19', name: 'Russian Twists', category: 'Core', deviceId: '19', aliases: ['oblique twists'], equipment: 'bodyweight' },
  { id: 'g20', name: 'Dead Bug', category: 'Core', deviceId: '20', aliases: ['deadbug'], equipment: 'bodyweight' },
  
  // Cardio/Conditioning
  { id: 'g21', name: 'Running', category: 'Cardio', deviceId: '21', aliases: ['run', 'jog', 'jogging'], equipment: 'none' },
  { id: 'g22', name: 'Cycling', category: 'Cardio', deviceId: '22', aliases: ['bike', 'biking'], equipment: 'bike' },
  { id: 'g23', name: 'Rowing', category: 'Cardio', deviceId: '23', aliases: ['row', 'erg'], equipment: 'rower' },
  { id: 'g24', name: 'Jump Rope', category: 'Cardio', deviceId: '24', aliases: ['skipping', 'rope skips'], equipment: 'rope' },
  { id: 'g25', name: 'Burpees', category: 'Cardio', deviceId: '25', aliases: ['burpee'], equipment: 'bodyweight' },
];

// Search function with fuzzy matching
export function searchExercises(query: string, limit: number = 10): ExerciseLibraryItem[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  
  return exerciseLibrary
    .filter(ex => 
      ex.name.toLowerCase().includes(lowerQuery) ||
      ex.aliases.some(alias => alias.toLowerCase().includes(lowerQuery)) ||
      ex.category.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit);
}

// Calculate confidence score for auto-mapping
export function calculateConfidence(exerciseName: string, libraryItem: ExerciseLibraryItem): number {
  const lowerExercise = exerciseName.toLowerCase();
  const lowerLibrary = libraryItem.name.toLowerCase();
  
  // Exact match
  if (lowerExercise === lowerLibrary) return 0.95;
  
  // Check aliases
  for (const alias of libraryItem.aliases) {
    if (lowerExercise === alias.toLowerCase()) return 0.90;
  }
  
  // Contains match
  if (lowerLibrary.includes(lowerExercise) || lowerExercise.includes(lowerLibrary)) return 0.75;
  
  // Word match
  const exerciseWords = lowerExercise.split(' ');
  const libraryWords = lowerLibrary.split(' ');
  const matchingWords = exerciseWords.filter(word => libraryWords.includes(word));
  
  if (matchingWords.length > 0) {
    return Math.min(0.70, matchingWords.length / Math.max(exerciseWords.length, libraryWords.length));
  }
  
  return 0.0;
}
