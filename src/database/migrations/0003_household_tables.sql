CREATE TABLE IF NOT EXISTS "household" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "householdMember" (
  "id" text PRIMARY KEY NOT NULL,
  "householdId" text NOT NULL,
  "userId" text NOT NULL,
  "role" text DEFAULT 'member' NOT NULL,
  "displayName" text,
  "joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "householdMember_householdId_idx" ON "householdMember" USING btree ("householdId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "householdMember_userId_idx" ON "householdMember" USING btree ("userId");
