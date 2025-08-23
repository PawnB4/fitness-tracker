PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`primary_muscle_group` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_exercises`("id", "name", "type", "primary_muscle_group", "created_at", "updated_at") SELECT "id", "name", "type", "primary_muscle_group", "created_at", "updated_at" FROM `exercises`;--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
ALTER TABLE `__new_exercises` RENAME TO `exercises`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_name_unique` ON `exercises` (`name`);--> statement-breakpoint
CREATE TABLE `__new_user` (
	`config` text DEFAULT '{"preferredTheme":"light","timezone":"America/Argentina/Buenos_Aires"}' NOT NULL,
	`name` text NOT NULL,
	`weekly_target` integer NOT NULL,
	`locale` text NOT NULL,
	`bodyweight` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`("config", "name", "weekly_target", "locale", "bodyweight") SELECT "config", "name", "weekly_target", "locale", "bodyweight" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
CREATE TABLE `__new_workout_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`workout_exercise_data` text DEFAULT '[]' NOT NULL,
	`notes` text,
	`sort_order` integer NOT NULL,
	`completed` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workout_exercises`("id", "workout_id", "exercise_id", "workout_exercise_data", "notes", "sort_order", "completed", "created_at", "updated_at") SELECT "id", "workout_id", "exercise_id", "workout_exercise_data", "notes", "sort_order", "completed", "created_at", "updated_at" FROM `workout_exercises`;--> statement-breakpoint
DROP TABLE `workout_exercises`;--> statement-breakpoint
ALTER TABLE `__new_workout_exercises` RENAME TO `workout_exercises`;--> statement-breakpoint
CREATE TABLE `__new_workout_plan_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`workout_plan_exercise_data` text DEFAULT '[]' NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workout_plan_exercises`("id", "plan_id", "exercise_id", "workout_plan_exercise_data", "sort_order", "created_at", "updated_at") SELECT "id", "plan_id", "exercise_id", "workout_plan_exercise_data", "sort_order", "created_at", "updated_at" FROM `workout_plan_exercises`;--> statement-breakpoint
DROP TABLE `workout_plan_exercises`;--> statement-breakpoint
ALTER TABLE `__new_workout_plan_exercises` RENAME TO `workout_plan_exercises`;--> statement-breakpoint
CREATE TABLE `__new_workout_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_workout_plans`("id", "name", "description", "created_at", "updated_at") SELECT "id", "name", "description", "created_at", "updated_at" FROM `workout_plans`;--> statement-breakpoint
DROP TABLE `workout_plans`;--> statement-breakpoint
ALTER TABLE `__new_workout_plans` RENAME TO `workout_plans`;--> statement-breakpoint
CREATE UNIQUE INDEX `workout_plans_name_unique` ON `workout_plans` (`name`);--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_workouts`("id", "name", "notes", "created_at", "updated_at") SELECT "id", "name", "notes", "created_at", "updated_at" FROM `workouts`;--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;