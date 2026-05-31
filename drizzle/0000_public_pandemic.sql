CREATE TABLE `account` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cash` text NOT NULL,
	`starting_balance` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `holdings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`shares` text NOT NULL,
	`avg_cost` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `holdings_symbol_idx` ON `holdings` (`symbol`);--> statement-breakpoint
CREATE TABLE `portfolio_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`total_value` text NOT NULL,
	`cash` text NOT NULL,
	`holdings_value` text NOT NULL,
	`recorded_at` integer NOT NULL,
	`source` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`symbol` text NOT NULL,
	`dollars` text NOT NULL,
	`price` text NOT NULL,
	`shares` text NOT NULL,
	`note` text NOT NULL,
	`executed_at` integer NOT NULL
);
