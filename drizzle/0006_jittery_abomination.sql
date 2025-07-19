PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`config` text DEFAULT '{"preferredTheme":"dark","timezone":"America/Argentina/Buenos_Aires","locale":"en"}',
	`name` text,
	`weekly_target` integer
);
--> statement-breakpoint
INSERT INTO `__new_user`("config", "name", "weekly_target") SELECT "config", "name", "weekly_target" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;