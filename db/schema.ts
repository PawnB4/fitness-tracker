import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
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
export const exercisesFormSchema = createInsertSchema(exercises, {
	name: (schema) =>
		schema
			.min(1, { message: "Name is required" })
			.max(40, { message: "Name must be less than 40 characters" }),
	type: () =>
		z.object({
			value: z.string(),
			label: z.string(),
		}),
	primaryMuscleGroup: () =>
		z.object({
			value: z.string(),
			label: z.string(),
		}),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
export const selectExercisesSchema = createSelectSchema(exercises);
export const updateExercisesSchema = createUpdateSchema(exercises);

// Workouts
export const insertWorkoutsSchema = createInsertSchema(workouts);
export const selectWorkoutsSchema = createSelectSchema(workouts);
export const updateWorkoutsSchema = createUpdateSchema(workouts);

// Workout exercises
export const selectWorkoutExercisesSchema =
	createSelectSchema(workoutExercises);

export const workoutExerciseFormSchema = createInsertSchema(workoutExercises, {
	exerciseId: () =>
		z.object({
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
}).omit({
	id: true,
	workoutId: true,
	sortOrder: true,
	createdAt: true,
	updatedAt: true,
	completed: true,
});
export const updateWorkoutExercisesSchema =
	createUpdateSchema(workoutExercises);

// Workout plans
export const workoutPlansFormSchema = createInsertSchema(workoutPlans, {
	name: (schema) =>
		schema
			.min(1, { message: "Name is required" })
			.max(40, { message: "Name must be less than 40 characters" }),
	description: (schema) =>
		schema.max(255, {
			message: "Description must be less than 255 characters",
		}),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
export const selectWorkoutPlansSchema = createSelectSchema(workoutPlans);

// Workout plan exercises
export const workoutPlanExercisesFormSchema = createInsertSchema(
	workoutPlanExercises,
	{
		exerciseId: () =>
			z.object({
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
	},
).omit({
	id: true,
	planId: true,
	sortOrder: true,
	createdAt: true,
	updatedAt: true,
});
export const selectWorkoutPlanExercisesSchema =
	createSelectSchema(workoutPlanExercises);

// User
export const selectUserSchema = createSelectSchema(user);

// Types

export type Exercise = z.infer<typeof selectExercisesSchema>;
export type NewExercise = z.infer<typeof exercisesFormSchema>;

export type Workout = z.infer<typeof selectWorkoutsSchema>;
export type NewWorkout = z.infer<typeof insertWorkoutsSchema>;

export type WorkoutExercise = z.infer<typeof selectWorkoutExercisesSchema>;
export type NewWorkoutExercise = z.infer<typeof workoutExerciseFormSchema>;

export type WorkoutPlan = z.infer<typeof selectWorkoutPlansSchema>;
export type NewWorkoutPlan = z.infer<typeof workoutPlansFormSchema>;

export type WorkoutPlanExercise = z.infer<
	typeof selectWorkoutPlanExercisesSchema
>;
export type NewWorkoutPlanExercise = z.infer<
	typeof workoutPlanExercisesFormSchema
>;

export type User = z.infer<typeof selectUserSchema>;
