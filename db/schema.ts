import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

// Workouts table
export const workouts = sqliteTable('workouts', {
    id: integer().primaryKey({ autoIncrement: true }),
    date: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    notes: text(),
    createdAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Exercise definitions table (reusable exercises)
export const exercises = sqliteTable('exercises', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull().unique(),
    type: text().notNull(), // "upper body", "lower body", "core", "cardio", etc.
    description: text(), // Optional fields that might be useful
    primaryMuscleGroup: text(),
    createdAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
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
    order: integer(), // For ordering exercises within a workout
    createdAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Workout plans table
export const workoutPlans = sqliteTable('workout_plans', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull().unique(),
    description: text(),
    createdAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
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
    createdAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
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
export const insertWorkoutPlansSchema = createInsertSchema(workoutPlans, {
    name: (schema) => schema.min(1, { message: "Name is required" }).max(40, { message: "Name must be less than 40 characters" }),
    description: (schema) => schema.max(255, { message: "Description must be less than 255 characters" }),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const selectWorkoutPlansSchema = createSelectSchema(workoutPlans);
export const updateWorkoutPlansSchema = createUpdateSchema(workoutPlans);

// Workout plan exercises
export const insertWorkoutPlanExercisesSchema = createInsertSchema(workoutPlanExercises, {
    defaultSets: (schema) => schema.min(1, { message: "Sets must be at least 1" }),
    defaultReps: (schema) => schema.min(1, { message: "Reps must be at least 1" }),
    defaultWeight: (schema) => schema.nonnegative({ message: "Weight cannot be negative" }),
    exerciseId: () => z.object({
        value: z.number(),
        label: z.string(),
    }),
}).omit({
    id: true,
    planId: true,
    sortOrder: true,
    createdAt: true,
    updatedAt: true,
});
export const selectWorkoutPlanExercisesSchema = createSelectSchema(workoutPlanExercises);
export const updateWorkoutPlanExercisesSchema = createUpdateSchema(workoutPlanExercises);

// Types

export type NewExercise = z.infer<typeof insertExercisesSchema>;
export type Exercise = z.infer<typeof selectExercisesSchema>;

export type NewWorkoutPlan = z.infer<typeof insertWorkoutPlansSchema>;
export type WorkoutPlan = z.infer<typeof selectWorkoutPlansSchema>;

export type NewWorkoutPlanExercise = z.infer<typeof insertWorkoutPlanExercisesSchema>;
export type WorkoutPlanExercise = z.infer<typeof selectWorkoutPlanExercisesSchema>;


