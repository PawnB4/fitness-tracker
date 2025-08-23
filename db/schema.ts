import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";

// Exercise definitions table (reusable exercises)
export const exercises = sqliteTable("exercises", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull().unique(),
	type: text().notNull(), // "upper body", "lower body", "core", "cardio", etc.
	primaryMuscleGroup: text(),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: text()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
});

// Workouts table
export const workouts = sqliteTable("workouts", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	notes: text(),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: text()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
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
	workoutExerciseData: text({ mode: "json" })
		.$type<
			Array<{
				setNumber: number;
				reps: number | null;
				durationSeconds: number | null;
				weight: number;
			}>
		>()
		.notNull()
		.default(sql`'[]'`),
	notes: text(), // For workout-specific notes about this exercise
	sortOrder: integer().notNull(), // For ordering exercises within a workout
	completed: integer({ mode: "boolean" }).default(false),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: text()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
});

// Workout plans table
export const workoutPlans = sqliteTable("workout_plans", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull().unique(),
	description: text(),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
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
	workoutPlanExerciseData: text({ mode: "json" })
		.$type<
			Array<{
				defaultSetNumber: number;
				defaultReps: number | null;
				defaultDurationSeconds: number | null;
				defaultWeight: number;
			}>
		>()
		.notNull()
		.default(sql`'[]'`),
	sortOrder: integer().notNull(), // To maintain exercise order in plan
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: text()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
});

export const user = sqliteTable("user", {
	config: text("", { mode: "json" })
		.$type<{
			preferredTheme?: string;
			timezone?: string;
		}>()
		.default({
			preferredTheme: "light",
			timezone: "America/Argentina/Buenos_Aires",
		})
		.notNull(),
	name: text().notNull(),
	weeklyTarget: integer().notNull(),
	locale: text().notNull(),
	bodyweight: integer().notNull(),
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

// Workout exercises (and plan exercises)

export const repsSchema = z
	.string()
	.min(1, { message: "Reps is required" })
	.refine((val) => !isNaN(Number(val)), {
		message: "Reps must be a number",
	})
	.refine((val) => Number(val) >= 1, { message: "Reps must be at least 1" })
	.refine((val) => Number(val) < 99, {
		message: "Reps must be less than 99",
	})
	.refine((val) => Number.isInteger(Number(val)), {
		message: "Reps must be a whole number",
	});

export const weightSchema = z
	.string()
	.min(0, { message: "Weight is required" })
	.refine((val) => !isNaN(Number(val)), {
		message: "Weight must be a number",
	})
	.refine((val) => Number(val) >= 0, {
		message: "Weight cannot be negative",
	})
	.refine((val) => Number(val) < 999, {
		message: "Weight must be less than 999",
	});

export const setsSchema = z
	.string()
	.min(1, { message: "Sets is required" })
	.refine((val) => !isNaN(Number(val)), {
		message: "Sets must be a number",
	})
	.refine((val) => Number(val) >= 1, {
		message: "Sets must be at least 1",
	})
	.refine((val) => Number(val) < 99, {
		message: "Sets must be less than 99",
	})
	.refine((val) => Number.isInteger(Number(val)), {
		message: "Sets must be a whole number",
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

// User
export const insertUserSchema = z.object({
	name: z
		.string()
		.min(1, { message: "Name is required" })
		.max(40, { message: "Name must be less than 40 characters" }),
	weeklyTarget: z
		.string()
		.min(1, { message: "Weekly target is required" })
		.refine((val) => !isNaN(Number(val)), {
			message: "Weekly target must be a number",
		})
		.refine((val) => Number(val) >= 1, {
			message: "Weekly target must be at least 1",
		})
		.refine((val) => Number(val) <= 14, {
			message: "Weekly target must be less than 14",
		})
		.refine((val) => Number.isInteger(Number(val)), {
			message: "Weekly target must be a whole number",
		}),
	bodyweight: z
		.string()
		.min(1, { message: "Bodyweight is required" })
		.refine((val) => !isNaN(Number(val)), {
			message: "Bodyweight must be a number",
		})
		.refine((val) => Number(val) >= 1, {
			message: "Bodyweight must be at least 1",
		})
		.refine((val) => Number(val) <= 999, {
			message: "Bodyweight must be less than 999",
		}),
});

// Types

export type Exercise = {
	id: number;
	name: string;
	type: string;
	createdAt: string;
	updatedAt: string;
	primaryMuscleGroup: string | null;
};
export type NewExercise = z.infer<typeof insertExerciseSchema>;

export type Workout = {
	id: number;
	name: string;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
};

export type WorkoutExercise = {
	id: number;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	workoutId: number;
	exerciseId: number;
	workoutExerciseData: WorkoutExerciseData[];
	sortOrder: number;
	completed: boolean | null;
};

export type WorkoutExerciseData = {
	setNumber: number;
	reps: number | null;
	durationSeconds: number | null;
	weight: number;
};

export type WorkoutPlan = {
	id: number;
	name: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
};
export type NewWorkoutPlan = z.infer<typeof insertWorkoutPlansSchema>;

export type WorkoutPlanExercise = {
	id: number;
	createdAt: string;
	updatedAt: string;
	exerciseId: number;
	sortOrder: number;
	planId: number;
	workoutPlanExerciseData: WorkoutPlanExerciseData[];
};

export type WorkoutPlanExerciseData = {
	defaultSetNumber: number;
	defaultReps: number | null;
	defaultDurationSeconds: number | null;
	defaultWeight: number;
};

export type User = {
	name: string;
	weeklyTarget: number;
	config: {
		preferredTheme?: string;
		timezone?: string;
	} | null;
	locale: string;
	bodyweight: number;
};
export type NewUser = z.infer<typeof insertUserSchema>;
