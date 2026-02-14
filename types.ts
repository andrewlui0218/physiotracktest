export enum ExerciseCategory {
  ELECTROTHERAPY = 'Electrotherapy',
  AEROBIC = 'Aerobic',
  STRENGTHENING = 'Strengthening',
  MOBILIZATION = 'Mobilization',
  BALANCE = 'Balance',
  HAND = 'Hand',
  OTHERS = 'Others',
  FREE_TEXT = 'Additional Exercises'
}

export type InputType = 'checkbox' | 'text' | 'number' | 'select';

export interface ExerciseField {
  key: string;
  label: string;
  type: InputType;
  options?: readonly string[]; // For select inputs (e.g., R/L/Both)
  placeholder?: string;
  width?: string; // Tailwind width class
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;
  fields: ExerciseField[];
}

export interface PrescribedExercise {
  exerciseId: string;
  name: string;
  category: ExerciseCategory;
  data: Record<string, any>; // Stores values for fields like 'weight', 'reps', etc.
  timestamp: number;
}

export interface PatientData {
  id: string; // PHYA...
  name: string;
  therapistName: string;
  class?: string;
  hr?: string;
  exercises: PrescribedExercise[];
  lastUpdated: number;
}

export type Mode = 'home' | 'therapist' | 'patient';