CREATE TYPE "public"."board_type" AS ENUM('todo', 'kanban');--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "type" SET DATA TYPE "public"."board_type" USING "type"::"public"."board_type";