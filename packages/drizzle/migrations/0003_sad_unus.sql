CREATE TABLE "friend_request" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invite_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "friend_request_sender_id_idx" ON "friend_request" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "friend_request_receiver_id_idx" ON "friend_request" USING btree ("receiver_id");--> statement-breakpoint
CREATE UNIQUE INDEX "friend_request_pair_idx" ON "friend_request" USING btree ("sender_id","receiver_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invite_token_token_idx" ON "invite_token" USING btree ("token");--> statement-breakpoint
CREATE INDEX "invite_token_user_id_idx" ON "invite_token" USING btree ("user_id");