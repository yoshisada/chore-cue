-- hand-edited from `drizzle-kit generate --name chore_domain` for idempotency.
-- the migration runner wraps every migration in a single BEGIN…COMMIT, so no
-- CONCURRENTLY here and every statement must be safe to re-run.
ALTER TABLE "householdMember" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "householdMember" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "householdMember" ADD COLUMN IF NOT EXISTS "timezone" text DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chore" (
	"id" text PRIMARY KEY NOT NULL,
	"householdId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assigneeMemberId" text NOT NULL,
	"createdByMemberId" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"recurrenceRuleType" text NOT NULL,
	"recurrenceIntervalDays" integer,
	"recurrenceDayOfWeek" integer,
	"recurrenceTimeMinutes" integer DEFAULT 540 NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"nextDueAt" timestamp NOT NULL,
	"lastCompletedAt" timestamp,
	"lastCompletedByMemberId" text,
	"lastBumpedAt" timestamp,
	"archivedAt" timestamp,
	"photoLabel" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chore_title_len_chk" CHECK (char_length(btrim("chore"."title")) between 1 and 120),
	CONSTRAINT "chore_time_minutes_chk" CHECK ("chore"."recurrenceTimeMinutes" between 0 and 1439),
	CONSTRAINT "chore_archive_consistency_chk" CHECK (("chore"."status" = 'archived') = ("chore"."archivedAt" is not null)),
	CONSTRAINT "chore_recurrence_shape_chk" CHECK (CASE "chore"."recurrenceRuleType" WHEN 'interval_days' THEN "chore"."recurrenceIntervalDays" IS NOT NULL AND "chore"."recurrenceIntervalDays" BETWEEN 1 AND 365 AND "chore"."recurrenceDayOfWeek" IS NULL WHEN 'weekly_day' THEN "chore"."recurrenceDayOfWeek" IS NOT NULL AND "chore"."recurrenceDayOfWeek" BETWEEN 0 AND 6 AND "chore"."recurrenceIntervalDays" IS NULL WHEN 'daily_time' THEN "chore"."recurrenceIntervalDays" IS NULL AND "chore"."recurrenceDayOfWeek" IS NULL ELSE false END)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bumpEvent" (
	"id" text PRIMARY KEY NOT NULL,
	"householdId" text NOT NULL,
	"choreId" text NOT NULL,
	"senderMemberId" text NOT NULL,
	"recipientMemberId" text NOT NULL,
	"sentAt" timestamp NOT NULL,
	"sentOnDate" text NOT NULL,
	"dailySequence" integer NOT NULL,
	"messageType" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bumpEvent_no_self_chk" CHECK ("bumpEvent"."senderMemberId" <> "bumpEvent"."recipientMemberId"),
	CONSTRAINT "bumpEvent_sequence_chk" CHECK ("bumpEvent"."dailySequence" between 1 and 5)
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "chore" ADD CONSTRAINT "chore_householdId_household_id_fk" FOREIGN KEY ("householdId") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "chore" ADD CONSTRAINT "chore_assigneeMemberId_householdMember_id_fk" FOREIGN KEY ("assigneeMemberId") REFERENCES "public"."householdMember"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "chore" ADD CONSTRAINT "chore_createdByMemberId_householdMember_id_fk" FOREIGN KEY ("createdByMemberId") REFERENCES "public"."householdMember"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "chore" ADD CONSTRAINT "chore_lastCompletedByMemberId_householdMember_id_fk" FOREIGN KEY ("lastCompletedByMemberId") REFERENCES "public"."householdMember"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "bumpEvent" ADD CONSTRAINT "bumpEvent_householdId_household_id_fk" FOREIGN KEY ("householdId") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "bumpEvent" ADD CONSTRAINT "bumpEvent_choreId_chore_id_fk" FOREIGN KEY ("choreId") REFERENCES "public"."chore"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "bumpEvent" ADD CONSTRAINT "bumpEvent_senderMemberId_householdMember_id_fk" FOREIGN KEY ("senderMemberId") REFERENCES "public"."householdMember"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "bumpEvent" ADD CONSTRAINT "bumpEvent_recipientMemberId_householdMember_id_fk" FOREIGN KEY ("recipientMemberId") REFERENCES "public"."householdMember"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bumpEvent_sender_day_seq_uniq" ON "bumpEvent" USING btree ("senderMemberId","sentOnDate","dailySequence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bumpEvent_chore_sentAt_idx" ON "bumpEvent" USING btree ("choreId","sentAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chore_household_status_due_idx" ON "chore" USING btree ("householdId","status","nextDueAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chore_assigneeMemberId_idx" ON "chore" USING btree ("assigneeMemberId");
