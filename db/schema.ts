import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { eq, sql } from 'drizzle-orm';

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
    name: text().notNull(),
    type: text().notNull(), // "upper body", "lower body", "core", "cardio", etc.
    description: text(),
    // Optional fields that might be useful
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

// Types
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

// Relations helper function
export const getWorkoutExercises = (workoutId: number) => {
    return {
        where: eq(workoutExercises.workoutId, workoutId),
    };
};
