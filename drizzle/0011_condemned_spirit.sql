PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workout_plan_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`default_sets` integer NOT NULL,
	`default_reps` integer NOT NULL,
	`default_weight` real NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_workout_plan_exercises`("id", "plan_id", "exercise_id", "default_sets", "default_reps", "default_weight", "sort_order", "created_at", "updated_at") SELECT "id", "plan_id", "exercise_id", "default_sets", "default_reps", "default_weight", "sort_order", "created_at", "updated_at" FROM `workout_plan_exercises`;--> statement-breakpoint
DROP TABLE `workout_plan_exercises`;--> statement-breakpoint
ALTER TABLE `__new_workout_plan_exercises` RENAME TO `workout_plan_exercises`;--> statement-breakpoint
PRAGMA foreign_keys=ON;