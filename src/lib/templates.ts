import { WorkoutStructure } from '../types/workout';

export const workoutTemplates: WorkoutStructure[] = [
  {
    title: "Hyrox Full Simulation",
    source: "template",
    blocks: [
      {
        label: "Hyrox Race Simulation",
        structure: "for time (cap: 60 min)",
        supersets: [
          {
            exercises: [
              { name: "1000 m Run", distance_m: 1000, type: "Cardio" },
              { name: "1000 m SkiErg", distance_m: 1000, type: "Cardio" },
              { name: "1000 m Run", distance_m: 1000, type: "Cardio" },
              { name: "50 m Sled Push", distance_m: 50, weight_kg: 152, type: "Strength" },
              { name: "1000 m Run", distance_m: 1000, type: "Cardio" },
              { name: "50 m Sled Pull", distance_m: 50, weight_kg: 103, type: "Strength" },
              { name: "1000 m Run", distance_m: 1000, type: "Cardio" },
              { name: "80 Burpee Broad Jumps", reps: 80, type: "HIIT" },
              { name: "1000 m Run", distance_m: 1000, type: "Cardio" },
              { name: "1000 m Row", distance_m: 1000, type: "Cardio" },
              { name: "1000 m Run", distance_m: 1000, type: "Cardio" },
              { name: "100 m Farmers Carry", distance_m: 100, weight_kg: 32, type: "Strength" },
              { name: "1000 m Run", distance_m: 1000, type: "Cardio" },
              { name: "100 Wall Balls", reps: 100, weight_kg: 9, type: "Strength" },
              { name: "1000 m Run", distance_m: 1000, type: "Cardio" }
            ]
          }
        ]
      }
    ]
  },
  {
    title: "5x5 Strength Program",
    source: "template",
    blocks: [
      {
        label: "Compound Lifts",
        structure: "5 sets x 5 reps",
        supersets: [
          {
            exercises: [
              { name: "Barbell Back Squat", reps: 5, type: "Strength" },
              { name: "Barbell Bench Press", reps: 5, type: "Strength" },
              { name: "Barbell Deadlift", reps: 5, type: "Strength" }
            ]
          }
        ]
      }
    ]
  },
  {
    title: "HIIT Cardio Blast",
    source: "template",
    blocks: [
      {
        label: "Warm-up",
        structure: "for time",
        supersets: [
          {
            exercises: [
              { name: "Jogging", duration_sec: 300, type: "Cardio" },
              { name: "Dynamic Stretching", duration_sec: 180, type: "Mobility" }
            ]
          }
        ]
      },
      {
        label: "HIIT Intervals",
        structure: "8 rounds: 30s work / 15s rest",
        supersets: [
          {
            exercises: [
              { name: "Burpees", duration_sec: 30, type: "HIIT" },
              { name: "Mountain Climbers", duration_sec: 30, type: "HIIT" },
              { name: "Jump Squats", duration_sec: 30, type: "HIIT" },
              { name: "High Knees", duration_sec: 30, type: "HIIT" }
            ]
          }
        ]
      },
      {
        label: "Cool Down",
        structure: "for time",
        supersets: [
          {
            exercises: [
              { name: "Walking", duration_sec: 300, type: "Cardio" },
              { name: "Static Stretching", duration_sec: 300, type: "Mobility" }
            ]
          }
        ]
      }
    ]
  },
  {
    title: "Upper Body Push/Pull",
    source: "template",
    blocks: [
      {
        label: "Push Exercises",
        structure: "3 sets x 10-12 reps",
        supersets: [
          {
            exercises: [
              { name: "Push-ups", reps: 12, type: "Strength" },
              { name: "Overhead Press", reps: 10, type: "Strength" },
              { name: "Dips", reps: 10, type: "Strength" }
            ]
          }
        ]
      },
      {
        label: "Pull Exercises",
        structure: "3 sets x 10-12 reps",
        supersets: [
          {
            exercises: [
              { name: "Pull-ups", reps: 10, type: "Strength" },
              { name: "Bent Over Row", reps: 12, type: "Strength" },
              { name: "Face Pulls", reps: 15, type: "Strength" }
            ]
          }
        ]
      }
    ]
  },
  {
    title: "Marathon Prep Long Run",
    source: "template",
    blocks: [
      {
        label: "Long Distance Run",
        structure: "steady pace",
        supersets: [
          {
            exercises: [
              { name: "Easy Run", distance_m: 20000, type: "Cardio" }
            ]
          }
        ]
      }
    ]
  }
];

export interface WorkoutHistory {
  id: string;
  workout: WorkoutStructure;
  createdAt: Date;
  exported: boolean;
}

// Mock history data
export const getWorkoutHistory = (): WorkoutHistory[] => {
  const now = new Date();
  return [
    {
      id: '1',
      workout: {
        title: "Morning HIIT Session",
        source: "instagram:https://instagram.com/p/...",
        blocks: [
          {
            label: "Quick HIIT",
            structure: "5 rounds",
            supersets: [
              {
                exercises: [
                  { name: "Burpees", reps: 20, type: "HIIT" },
                  { name: "Push-ups", reps: 15, type: "Strength" }
                ]
              }
            ]
          }
        ]
      },
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      exported: true
    },
    {
      id: '2',
      workout: {
        title: "Leg Day Strength",
        source: "youtube:https://youtube.com/watch?v=...",
        blocks: [
          {
            label: "Legs",
            structure: "4 sets x 8 reps",
            supersets: [
              {
                exercises: [
                  { name: "Back Squat", reps: 8, type: "Strength" },
                  { name: "Romanian Deadlift", reps: 8, type: "Strength" }
                ]
              }
            ]
          }
        ]
      },
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      exported: true
    },
    {
      id: '3',
      workout: {
        title: "Recovery Run",
        source: "ai-text:Easy 5k recovery run",
        blocks: [
          {
            label: "Recovery",
            structure: "easy pace",
            supersets: [
              {
                exercises: [
                  { name: "Easy Run", distance_m: 5000, type: "Cardio" }
                ]
              }
            ]
          }
        ]
      },
      createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
      exported: false
    }
  ];
};
