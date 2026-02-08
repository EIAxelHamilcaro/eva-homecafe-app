ALTER TABLE "mood_entry" ADD COLUMN "mood_date" date NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "mood_entry_user_id_mood_date_uniq" ON "mood_entry" USING btree ("user_id","mood_date");