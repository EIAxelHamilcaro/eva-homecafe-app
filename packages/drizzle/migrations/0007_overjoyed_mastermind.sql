CREATE TABLE "mood_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"mood_category" text NOT NULL,
	"mood_intensity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "mood_entry" ADD CONSTRAINT "mood_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mood_entry_user_id_created_at_idx" ON "mood_entry" USING btree ("user_id","created_at");