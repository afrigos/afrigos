require('dotenv').config();
const Stripe = require('stripe');

async function checkStripeConnect() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY is not set in .env file');
      return;
    }
    
    console.log('✅ STRIPE_SECRET_KEY is set');
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    
    // Check if we can retrieve account information
    console.log('\n📊 Checking Stripe account information...');
    
    try {
      const account = await stripe.accounts.retrieve();
      console.log('✅ Stripe account retrieved successfully');
      console.log(`Account ID: ${account.id}`);
      console.log(`Country: ${account.country}`);
      console.log(`Type: ${account.type}`);
      
      // Try to create a test Connect account
      console.log('\n🧪 Testing Stripe Connect account creation...');
      
      try {
        const testAccount = await stripe.accounts.create({
          type: 'express',
          country: 'GB',
          email: 'test@example.com',
          business_type: 'company',
          company: {
            name: 'Test Company',
          },
          capabilities: {
            card_payments: {
              requested: true,
            },
            transfers: {
              requested: true,
            },
          },
        });
        
        console.log('✅ Stripe Connect is ENABLED!');
        console.log(`Test account created: ${testAccount.id}`);
        
        // Clean up - delete the test account
        await stripe.accounts.del(testAccount.id);
        console.log('✅ Test account deleted');
        
        console.log('\n🎉 You can now use Stripe Connect in your application!');
        
      } catch (connectError) {
        console.error('\n❌ Stripe Connect is NOT enabled');
        console.error('Error:', connectError.message);
        
        if (connectError.message.includes('signed up for Connect')) {
          console.log('\n📝 To enable Stripe Connect:');
          console.log('1. Go to: https://dashboard.stripe.com/test/connect/overview');
          console.log('2. Click "Get started" or "Enable Connect"');
          console.log('3. Follow the setup wizard');
          console.log('4. Choose "Express accounts" when prompted');
          console.log('\n💡 If you don\'t see the option in the dashboard:');
          console.log('   - Make sure you\'re logged into the correct Stripe account');
          console.log('   - Try switching between test and live mode');
          console.log('   - Some accounts may need to complete business verification first');
        }
      }
      
    } catch (accountError) {
      console.error('❌ Error retrieving Stripe account:', accountError.message);
      console.log('\n💡 Make sure your STRIPE_SECRET_KEY is valid');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStripeConnect();

