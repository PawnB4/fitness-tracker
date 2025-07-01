import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";

// Exercise definitions table (reusable exercises)
export const exercises = sqliteTable("exercises", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull().unique(),
	type: text().notNull(), // "upper body", "lower body", "core", "cardio", etc.
	primaryMuscleGroup: text(),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

// Workouts table
export const workouts = sqliteTable("workouts", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	notes: text(),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

// Workout-specific exercises (junction table with additional data)
export const workoutExercises = sqliteTable("workout_exercises", {
	id: integer().primaryKey({ autoIncrement: true }),
	workoutId: integer()
		.notNull()
		.references(() => workouts.id, { onDelete: "cascade" }),
	exerciseId: integer()
		.notNull()
		.references(() => exercises.id, { onDelete: "cascade" }),
	sets: integer().notNull(),
	reps: integer().notNull(),
	weight: real().notNull(), // Using real for decimal weights
	notes: text(), // For workout-specific notes about this exercise
	sortOrder: integer().notNull(), // For ordering exercises within a workout
	completed: integer({ mode: "boolean" }).default(false),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

// Workout plans table
export const workoutPlans = sqliteTable("workout_plans", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull().unique(),
	description: text(),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

// Plan exercises (exercises in a plan with their default values)
export const workoutPlanExercises = sqliteTable("workout_plan_exercises", {
	id: integer().primaryKey({ autoIncrement: true }),
	planId: integer()
		.notNull()
		.references(() => workoutPlans.id, { onDelete: "cascade" }),
	exerciseId: integer()
		.notNull()
		.references(() => exercises.id, { onDelete: "cascade" }),
	defaultSets: integer().notNull(),
	defaultReps: integer().notNull(),
	defaultWeight: real().notNull(),
	sortOrder: integer().notNull(), // To maintain exercise order in plan
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

export const user = sqliteTable("user", {
	config: text("", { mode: "json" })
		.$type<{
			preferredTheme?: string;
			timezone?: string;
		}>()
		.default({
			preferredTheme: "dark",
			timezone: "America/Argentina/Buenos_Aires",
		}),
	name: text(),
});

// Zod schemas

// Exercises
export const insertExerciseSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }).max(40, {
		message: "Name must be less than 40 characters",
	}),
	type: z.object({
		value: z.string(),
		label: z.string(),
	}),
	primaryMuscleGroup: z
		.object({
			value: z.string(),
			label: z.string(),
		})
		.optional(),
});

// Workout exercises
export const insertWorkoutExerciseSchema = z.object({
	exerciseId: z.object({
		value: z.string(),
		label: z.string(),
	}),
	sets: z
		.string()
		.min(1, { message: "Sets is required" })
		.refine((val) => !isNaN(Number(val)), {
			message: "Sets must be a number",
		})
		.refine((val) => Number(val) >= 1, { message: "Sets must be at least 1" })
		.refine((val) => Number.isInteger(Number(val)), {
			message: "Sets must be a whole number",
		}),
	reps: z
		.string()
		.min(1, { message: "Reps is required" })
		.refine((val) => !isNaN(Number(val)), {
			message: "Reps must be a number",
		})
		.refine((val) => Number(val) >= 1, { message: "Reps must be at least 1" })
		.refine((val) => Number.isInteger(Number(val)), {
			message: "Reps must be a whole number",
		}),
	weight: z
		.string()
		.min(0, { message: "Weight is required" })
		.refine((val) => !isNaN(Number(val)), {
			message: "Weight must be a number",
		})
		.refine((val) => Number(val) >= 0, {
			message: "Weight cannot be negative",
		}),
	notes: z.string().optional(),
});

// Workout plans
export const insertWorkoutPlansSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }).max(40, {
		message: "Name must be less than 40 characters",
	}),
	description: z
		.string()
		.max(255, {
			message: "Description must be less than 255 characters",
		})
		.optional(),
});

// Workout plan exercises
export const insertWorkoutPlanExerciseSchema = z.object({
	exerciseId: z.object({
		value: z.string(),
		label: z.string(),
	}),
	defaultSets: z
		.string()
		.min(1, { message: "Sets is required" })
		.refine((val) => !isNaN(Number(val)), {
			message: "Sets must be a number",
		})
		.refine((val) => Number(val) >= 1, { message: "Sets must be at least 1" })
		.refine((val) => Number.isInteger(Number(val)), {
			message: "Sets must be a whole number",
		}),
	defaultReps: z
		.string()
		.min(1, { message: "Reps is required" })
		.refine((val) => !isNaN(Number(val)), {
			message: "Reps must be a number",
		})
		.refine((val) => Number(val) >= 1, { message: "Reps must be at least 1" })
		.refine((val) => Number.isInteger(Number(val)), {
			message: "Reps must be a whole number",
		}),
	defaultWeight: z
		.string()
		.min(0, { message: "Weight is required" })
		.refine((val) => !isNaN(Number(val)), {
			message: "Weight must be a number",
		})
		.refine((val) => Number(val) >= 0, {
			message: "Weight cannot be negative",
		}),
});

// User
export const insertUserSchema = z.object({
	name: z
		.string()
		.min(1, { message: "Name is required" })
		.max(40, { message: "Name must be less than 40 characters" }),
});

// Types

export type Exercise = {
	id: number;
	name: string;
	type: string;
	createdAt: string | null;
	updatedAt: string | null;
	primaryMuscleGroup: string | null;
};
export type NewExercise = z.infer<typeof insertExerciseSchema>;

export type Workout = {
	id: number;
	name: string;
	notes: string | null;
	createdAt: string | null;
	updatedAt: string | null;
};

export type WorkoutExercise = {
	id: number;
	notes: string | null;
	createdAt: string | null;
	updatedAt: string | null;
	workoutId: number;
	exerciseId: number;
	sets: number;
	reps: number;
	weight: number;
	sortOrder: number;
	completed: boolean | null;
};
export type NewWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;

export type WorkoutPlan = {
	id: number;
	name: string;
	description: string | null;
	createdAt: string | null;
	updatedAt: string | null;
};
export type NewWorkoutPlan = z.infer<typeof insertWorkoutPlansSchema>;

export type WorkoutPlanExercise = {
	id: number;
	createdAt: string | null;
	updatedAt: string | null;
	exerciseId: number;
	sortOrder: number;
	planId: number;
	defaultSets: number;
	defaultReps: number;
	defaultWeight: number;
};
export type NewWorkoutPlanExercise = z.infer<
	typeof insertWorkoutPlanExerciseSchema
>;

export type User = {
	name: string | null;
	config: {
		preferredTheme?: string;
		timezone?: string;
	} | null;
};
export type NewUser = z.infer<typeof insertUserSchema>;
