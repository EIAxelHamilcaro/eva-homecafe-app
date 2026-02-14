CREATE TABLE "emotion_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"emotion_category" text NOT NULL,
	"emotion_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "emotion_entry" ADD CONSTRAINT "emotion_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "emotion_entry_user_id_emotion_date_idx" ON "emotion_entry" USING btree ("user_id","emotion_date");--> statement-breakpoint
CREATE UNIQUE INDEX "emotion_entry_user_id_emotion_date_uniq" ON "emotion_entry" USING btree ("user_id","emotion_date");