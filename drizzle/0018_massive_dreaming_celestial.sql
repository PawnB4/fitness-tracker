PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`config` text DEFAULT '{"preferredTheme":"dark","timezone":"America/Argentina/Buenos_Aires"}'
);
--> statement-breakpoint
INSERT INTO `__new_user`("config") SELECT "config" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;