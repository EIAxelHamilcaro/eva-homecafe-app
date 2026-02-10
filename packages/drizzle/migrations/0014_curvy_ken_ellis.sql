CREATE TABLE "user_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"push_notifications" boolean DEFAULT true NOT NULL,
	"notify_new_messages" boolean DEFAULT true NOT NULL,
	"notify_friend_activity" boolean DEFAULT true NOT NULL,
	"notify_badges_earned" boolean DEFAULT true NOT NULL,
	"notify_journal_reminder" boolean DEFAULT true NOT NULL,
	"profile_visibility" boolean DEFAULT true NOT NULL,
	"rewards_visibility" text DEFAULT 'friends' NOT NULL,
	"theme_mode" text DEFAULT 'system' NOT NULL,
	"language" text DEFAULT 'fr' NOT NULL,
	"time_format" text DEFAULT '24h' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_preference_user_id_idx" ON "user_preference" USING btree ("user_id");