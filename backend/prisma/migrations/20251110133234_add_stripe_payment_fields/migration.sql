-- AlterTable
ALTER TABLE "vendor_profiles" ADD COLUMN     "bankAccountHolderName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "bankRoutingNumber" TEXT,
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeAccountStatus" TEXT;
