ALTER TABLE "board" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "priority" text;--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "due_date" date;--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "link" text;
