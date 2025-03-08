CREATE TABLE `date_table_test` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`current_timestamp_column` text DEFAULT (CURRENT_TIMESTAMP),
	`current_time_column` text DEFAULT (CURRENT_TIME),
	`current_date_column` text DEFAULT (CURRENT_DATE)
);
