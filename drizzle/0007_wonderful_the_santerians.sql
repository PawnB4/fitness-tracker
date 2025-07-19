PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`config` text DEFAULT '{"preferredTheme":"dark","timezone":"America/Argentina/Buenos_Aires"}',
	`name` text,
	`weekly_target` integer,
	`locale` text
);
--> statement-breakpoint
INSERT INTO `__new_user`("config", "name", "weekly_target", "locale") SELECT "config", "name", "weekly_target", "locale" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;