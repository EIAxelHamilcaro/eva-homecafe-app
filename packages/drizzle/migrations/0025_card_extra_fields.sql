ALTER TABLE "card" ADD COLUMN "priority" text;
ALTER TABLE "card" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "card" ADD COLUMN "link" text;
