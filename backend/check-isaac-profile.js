const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProfile() {
  try {
    const email = 'isaac@gmail.com';
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { vendorProfile: true }
    });

    if (!user || !user.vendorProfile) {
      console.log(`User or vendor profile not found for ${email}`);
      return;
    }

    const profile = user.vendorProfile;
    console.log(`\n=== Vendor Profile for ${email} ===\n`);
    console.log(`Business Name: ${profile.businessName}`);
    console.log(`\nBank Details:`);
    console.log(`  Account Number: ${profile.bankAccountNumber ? '***' + profile.bankAccountNumber.slice(-4) : 'None'}`);
    console.log(`  Routing Number: ${profile.bankRoutingNumber || 'None'}`);
    console.log(`  Account Holder: ${profile.bankAccountHolderName || 'None'}`);
    console.log(`  Bank Name: ${profile.bankName || 'None'}`);
    console.log(`\nStripe Details:`);
    console.log(`  Stripe Account ID: ${profile.stripeAccountId || 'None (NOT CREATED)'}`);
    console.log(`  Stripe Account Status: ${profile.stripeAccountStatus || 'None'}`);
    console.log(`  Edit Count: ${profile.stripePaymentDetailsEditCount || 0}`);
    console.log(`\n`);

    if (profile.bankAccountNumber && !profile.stripeAccountId) {
      console.log('⚠️  ISSUE FOUND: Bank details exist but Stripe Account ID was not created!');
      console.log('   This likely means the Stripe API call failed silently.');
      console.log('   Check:');
      console.log('   1. Is STRIPE_SECRET_KEY set in .env?');
      console.log('   2. Is the Stripe key valid?');
      console.log('   3. Check backend logs for Stripe errors');
    } else if (profile.bankAccountNumber && profile.stripeAccountId) {
      console.log('✅ Stripe Account ID was created successfully!');
    } else {
      console.log('ℹ️  No bank details saved yet.');
    }

  } catch (error) {
    console.error('Error checking profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfile();

