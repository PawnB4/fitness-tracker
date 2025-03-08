import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

// Workouts table
export const workouts = sqliteTable('workouts', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    notes: text(),
    createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

// Exercise definitions table (reusable exercises)
export const exercises = sqliteTable('exercises', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull().unique(),
    type: text().notNull(), // "upper body", "lower body", "core", "cardio", etc.
    primaryMuscleGroup: text(),
    createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

// Workout-specific exercises (junction table with additional data)
export const workoutExercises = sqliteTable('workout_exercises', {
    id: integer().primaryKey({ autoIncrement: true }),
    workoutId: integer().notNull().references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: integer().notNull().references(() => exercises.id, { onDelete: 'restrict' }),
    sets: integer().notNull(),
    reps: integer().notNull(),
    weight: real().notNull(), // Using real for decimal weights
    notes: text(), // For workout-specific notes about this exercise
    sortOrder: integer().notNull(), // For ordering exercises within a workout
    createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

// Workout plans table
export const workoutPlans = sqliteTable('workout_plans', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull().unique(),
    description: text(),
    createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

// Plan exercises (exercises in a plan with their default values)
export const workoutPlanExercises = sqliteTable('workout_plan_exercises', {
    id: integer().primaryKey({ autoIncrement: true }),
    planId: integer().notNull().references(() => workoutPlans.id, { onDelete: 'cascade' }),
    exerciseId: integer().notNull().references(() => exercises.id, { onDelete: 'restrict' }),
    defaultSets: integer().notNull(),
    defaultReps: integer().notNull(),
    defaultWeight: real().notNull(),
    sortOrder: integer().notNull(), // To maintain exercise order in plan
    createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

// Zod schemas

// Workouts
export const insertWorkoutsSchema = createInsertSchema(workouts);
export const selectWorkoutsSchema = createSelectSchema(workouts);
export const updateWorkoutsSchema = createUpdateSchema(workouts);

// Exercises
export const insertExercisesSchema = createInsertSchema(exercises, {
    name: (schema) => schema.min(1, { message: "Name is required" }).max(40, { message: "Name must be less than 40 characters" }),
    type: () => z.object({
        value: z.string(),
        label: z.string(),
    }),
    primaryMuscleGroup: () => z.object({
        value: z.string(),
        label: z.string(),
    }),
    description: (schema) => schema.max(255, { message: "Description must be less than 255 characters" }),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const selectExercisesSchema = createSelectSchema(exercises);
export const updateExercisesSchema = createUpdateSchema(exercises);

// Workout exercises
export const selectWorkoutExercisesSchema = createSelectSchema(workoutExercises);
export const insertWorkoutExercisesSchema = createInsertSchema(workoutExercises);
export const updateWorkoutExercisesSchema = createUpdateSchema(workoutExercises);

// Workout plans

export const insertWorkoutPlansFormSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }).max(40, { message: "Name must be less than 40 characters" }),
    description: z.string().max(255, { message: "Description must be less than 255 characters" }),
});

export const selectWorkoutPlansSchema = createSelectSchema(workoutPlans);

// Workout plan exercises
export const insertWorkoutPlanExercisesFormSchema = z.object({
    exerciseId: z.object({
        value: z.string(),
        label: z.string(),
    }),
    defaultSets: z.string()
        .min(1, { message: "Sets is required" })
        .refine(val => !isNaN(Number(val)), { message: "Sets must be a number" })
        .refine(val => Number(val) >= 1, { message: "Sets must be at least 1" })
        .refine(val => Number.isInteger(Number(val)), { message: "Sets must be a whole number" }),
    defaultReps: z.string()
        .min(1, { message: "Reps is required" })
        .refine(val => !isNaN(Number(val)), { message: "Reps must be a number" })
        .refine(val => Number(val) >= 1, { message: "Reps must be at least 1" })
        .refine(val => Number.isInteger(Number(val)), { message: "Reps must be a whole number" }),
    defaultWeight: z.string()
        .min(1, { message: "Weight is required" })
        .refine(val => !isNaN(Number(val)), { message: "Weight must be a number" })
        .refine(val => Number(val) >= 0, { message: "Weight cannot be negative" }),
});

export const updateWorkoutPlanExercisesFormSchema = insertWorkoutPlanExercisesFormSchema.omit({
    exerciseId: true,
});

export const selectWorkoutPlanExercisesSchema = createSelectSchema(workoutPlanExercises);

// Form-specific schema that handles string inputs from React Native TextInput

// Types

export type Exercise = z.infer<typeof selectExercisesSchema>;

export type WorkoutPlan = z.infer<typeof selectWorkoutPlansSchema>;

export type WorkoutPlanExercise = z.infer<typeof selectWorkoutPlanExercisesSchema>;


