CREATE TABLE "dashboard_layout" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"section_order" jsonb DEFAULT '["todo-kanban","tableau","chronologie","calendrier","badges"]'::jsonb NOT NULL,
	"collapsed_sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dashboard_layout" ADD CONSTRAINT "dashboard_layout_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_layout_user_id_idx" ON "dashboard_layout" USING btree ("user_id");