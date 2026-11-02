export interface CatalogueItem {
  name: string
  muscle: string // Primary muscle group
  secondaryMuscles?: string[]
  defaultSets?: number
  defaultReps?: string
}

export const PRIMARY_MUSCLES = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Abs',
  'Calves',
  'Forearms'
] as const

export const EXERCISE_CATALOGUE: CatalogueItem[] = [
  // Chest
  {
    name: 'Barbell Bench Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Deltoids'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Incline Dumbbell Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Deltoids'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Dumbbell Bench Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Deltoids'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Incline Barbell Bench Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Deltoids'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Cable Fly',
    muscle: 'Chest',
    secondaryMuscles: ['Front Deltoids'],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Chest Fly',
    muscle: 'Chest',
    secondaryMuscles: ['Front Deltoids'],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Push-Up',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Deltoids'],
    defaultSets: 3,
    defaultReps: '15-20'
  },

  // Back
  {
    name: 'Lat Pulldown',
    muscle: 'Back',
    secondaryMuscles: ['Biceps'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Seated Cable Row',
    muscle: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Seated Row',
    muscle: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'One-Arm Dumbbell Row',
    muscle: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Barbell Row',
    muscle: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    defaultSets: 3,
    defaultReps: '8-10'
  },
  {
    name: 'Pull-Up',
    muscle: 'Back',
    secondaryMuscles: ['Biceps'],
    defaultSets: 3,
    defaultReps: '6-10'
  },
  {
    name: 'Chin-Up',
    muscle: 'Back',
    secondaryMuscles: ['Biceps'],
    defaultSets: 3,
    defaultReps: '6-10'
  },
  {
    name: 'Deadlift',
    muscle: 'Back',
    secondaryMuscles: ['Legs', 'Glutes'],
    defaultSets: 3,
    defaultReps: '5'
  },

  // Shoulders
  {
    name: 'Dumbbell Lateral Raise',
    muscle: 'Shoulders',
    secondaryMuscles: ['Traps'],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Lateral Raise',
    muscle: 'Shoulders',
    secondaryMuscles: ['Traps'],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Overhead Press',
    muscle: 'Shoulders',
    secondaryMuscles: ['Triceps'],
    defaultSets: 3,
    defaultReps: '6-10'
  },
  {
    name: 'Dumbbell Shoulder Press',
    muscle: 'Shoulders',
    secondaryMuscles: ['Triceps'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Rear Delt Fly',
    muscle: 'Shoulders',
    secondaryMuscles: ['Upper Back'],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Face Pull',
    muscle: 'Shoulders',
    secondaryMuscles: ['Upper Back'],
    defaultSets: 3,
    defaultReps: '15'
  },

  // Biceps
  {
    name: 'Barbell Curl',
    muscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Incline Curl',
    muscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Incline Dumbbell Curl',
    muscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Hammer Curl',
    muscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Cable Curl',
    muscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    defaultSets: 3,
    defaultReps: '10-12'
  },

  // Triceps
  {
    name: 'Triceps Pushdown',
    muscle: 'Triceps',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Rope Pushdown',
    muscle: 'Triceps',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Overhead Extension',
    muscle: 'Triceps',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Skull Crusher',
    muscle: 'Triceps',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Dips',
    muscle: 'Triceps',
    secondaryMuscles: ['Chest', 'Front Deltoids'],
    defaultSets: 3,
    defaultReps: '8-12'
  },

  // Legs
  {
    name: 'Leg Press',
    muscle: 'Legs',
    secondaryMuscles: ['Glutes'],
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Romanian Deadlift',
    muscle: 'Legs',
    secondaryMuscles: ['Hamstrings', 'Glutes'],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Squat',
    muscle: 'Legs',
    secondaryMuscles: ['Glutes', 'Lower Back'],
    defaultSets: 3,
    defaultReps: '6-10'
  },
  {
    name: 'Leg Extension',
    muscle: 'Legs',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Leg Curl',
    muscle: 'Legs',
    secondaryMuscles: ['Hamstrings'],
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Lunge',
    muscle: 'Legs',
    secondaryMuscles: ['Glutes'],
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Standing Calf Raise',
    muscle: 'Legs',
    secondaryMuscles: ['Calves'],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Calf Raise',
    muscle: 'Legs',
    secondaryMuscles: ['Calves'],
    defaultSets: 3,
    defaultReps: '12-15'
  },

  // Abs
  {
    name: 'Cable Crunch',
    muscle: 'Abs',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Hanging Leg Raise',
    muscle: 'Abs',
    defaultSets: 3,
    defaultReps: '10-15'
  },
  {
    name: 'Plank',
    muscle: 'Abs',
    defaultSets: 3,
    defaultReps: '60s'
  }
]

export function findInCatalogue(name: string): CatalogueItem | undefined {
  const cleanName = name.trim().toLowerCase()
  return EXERCISE_CATALOGUE.find((item) => item.name.toLowerCase() === cleanName)
}

export function normalizeExercise(name: string, currentMuscle?: string): { muscle: string; secondaryMuscles?: string[] } {
  const found = findInCatalogue(name)
  if (found) {
    return {
      muscle: found.muscle,
      secondaryMuscles: found.secondaryMuscles
    }
  }
  return {
    muscle: currentMuscle && currentMuscle !== '' ? currentMuscle : 'Other'
  }
}
