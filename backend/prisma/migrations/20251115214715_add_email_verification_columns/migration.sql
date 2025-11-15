-- AlterTable: Add email verification columns to users table
-- This migration ONLY ADDS columns - does not delete or modify anything

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "emailVerificationCode" TEXT,
ADD COLUMN IF NOT EXISTS "emailVerificationCodeExpiry" TIMESTAMP(3);
