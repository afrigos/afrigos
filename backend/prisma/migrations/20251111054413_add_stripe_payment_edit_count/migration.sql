-- AlterTable
ALTER TABLE "vendor_profiles" ADD COLUMN IF NOT EXISTS "stripe_payment_details_edit_count" INTEGER NOT NULL DEFAULT 0;
