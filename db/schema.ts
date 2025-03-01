import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { eq, sql } from 'drizzle-orm';
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { EXERCISES_TYPES } from '~/lib/constants';

// Workouts table
export const workouts = sqliteTable('workouts', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    date: text().notNull(), // Storing as ISO string
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
    secondaryMuscleGroups: text(),
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


// Zod schemas
export const insertWorkoutsSchema = createInsertSchema(workouts);
export const selectWorkoutsSchema = createSelectSchema(workouts);
export const updateWorkoutsSchema = createUpdateSchema(workouts);

export const insertExercisesSchema = createInsertSchema(exercises, {
    name: (schema) => schema.min(1, { message: "Name is required" }).max(40, { message: "Name must be less than 40 characters" }),
    description: (schema) => schema.max(255, { message: "Description must be less than 255 characters" }),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const selectExercisesSchema = createSelectSchema(exercises);
export const updateExercisesSchema = createUpdateSchema(exercises);

export const selectWorkoutExercisesSchema = createSelectSchema(workoutExercises);
export const insertWorkoutExercisesSchema = createInsertSchema(workoutExercises);
export const updateWorkoutExercisesSchema = createUpdateSchema(workoutExercises);


// Types

export type NewExercise = z.infer<typeof insertExercisesSchema>;
export type Exercise = z.infer<typeof selectExercisesSchema>;



