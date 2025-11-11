-- AlterTable
ALTER TABLE "vendor_earnings" ADD COLUMN     "movedToWithdrawal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "movedToWithdrawalAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "vendor_profiles" ADD COLUMN     "withdrawalBalance" DECIMAL(10,2) NOT NULL DEFAULT 0;
