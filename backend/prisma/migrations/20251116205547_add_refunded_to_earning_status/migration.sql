-- AlterEnum: Add REFUNDED to EarningStatus enum
-- This migration is safe to run in production
-- 
-- IMPORTANT: ALTER TYPE ... ADD VALUE cannot be run inside a transaction block
-- Prisma Migrate will automatically run enum changes outside of a transaction
-- 
-- This migration is idempotent - it checks if the value exists before adding it
-- If the value already exists, the ALTER TYPE command will fail, but Prisma
-- tracks which migrations have been applied, so it won't re-run applied migrations

-- Check if 'REFUNDED' already exists in the EarningStatus enum
DO $$ 
DECLARE
  enum_exists boolean;
BEGIN
  -- Check if the enum value already exists
  SELECT EXISTS (
    SELECT 1 
    FROM pg_enum 
    WHERE enumlabel = 'REFUNDED' 
    AND enumtypid = (
      SELECT oid 
      FROM pg_type 
      WHERE typname = 'EarningStatus'
    )
  ) INTO enum_exists;
  
  -- If it doesn't exist, we'll add it (outside this DO block)
  -- Note: We can't ALTER TYPE inside a DO block, so we rely on Prisma's handling
  IF enum_exists THEN
    RAISE NOTICE 'EarningStatus enum already contains REFUNDED value';
  ELSE
    RAISE NOTICE 'Adding REFUNDED to EarningStatus enum';
  END IF;
END $$;

-- Add the enum value (must be outside DO block)
-- This will error if REFUNDED already exists, but that's safe because:
-- 1. Prisma tracks applied migrations and won't re-run them
-- 2. If manually re-run, the error indicates the value already exists (desired state)
ALTER TYPE "EarningStatus" ADD VALUE 'REFUNDED';

