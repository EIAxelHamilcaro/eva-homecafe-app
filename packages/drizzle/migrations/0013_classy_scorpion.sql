CREATE TYPE "public"."achievement_type" AS ENUM('sticker', 'badge');--> statement-breakpoint
CREATE TABLE "achievement_definition" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "achievement_type" NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"criteria" jsonb NOT NULL,
	"icon_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "achievement_definition_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_reward" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"achievement_definition_id" text NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_reward_user_definition_unique" UNIQUE("user_id","achievement_definition_id")
);
--> statement-breakpoint
ALTER TABLE "user_reward" ADD CONSTRAINT "user_reward_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reward" ADD CONSTRAINT "user_reward_achievement_definition_id_achievement_definition_id_fk" FOREIGN KEY ("achievement_definition_id") REFERENCES "public"."achievement_definition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_reward_user_id_idx" ON "user_reward" USING btree ("user_id");