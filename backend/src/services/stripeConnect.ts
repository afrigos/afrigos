import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface BankAccountDetails {
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  bankName: string;
  country?: string;
  currency?: string;
}

/**
 * Create or get a Stripe Connect account for a vendor
 */
export async function createOrGetStripeAccount(
  vendorId: string,
  email: string,
  businessName: string,
  country: string = 'GB'
): Promise<string> {
  try {
    // Check if account already exists in Stripe (you might want to store this mapping)
    // For now, we'll create a new account each time if stripeAccountId is not provided
    
    // Create a Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: country,
      email: email,
      business_type: 'company',
      company: {
        name: businessName,
      },
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
      metadata: {
        vendorId: vendorId,
      },
    });

    return account.id;
  } catch (error: any) {
    console.error('Error creating Stripe Connect account:', error);
    throw new Error(`Failed to create Stripe account: ${error.message}`);
  }
}

/**
 * Update Stripe Connect account with business details
 * Note: For Express accounts, bank accounts are added through Stripe's onboarding flow
 */
export async function updateStripeAccountDetails(
  stripeAccountId: string,
  businessName: string,
  businessType: string = 'company'
): Promise<Stripe.Account> {
  try {
    const account = await stripe.accounts.update(stripeAccountId, {
      business_type: businessType as any,
      company: {
        name: businessName,
      },
    });

    return account;
  } catch (error: any) {
    console.error('Error updating Stripe account details:', error);
    throw new Error(`Failed to update account details: ${error.message}`);
  }
}

/**
 * Create a transfer to a connected account (vendor payout)
 */
export async function createVendorPayout(
  stripeAccountId: string,
  amount: number, // Amount in currency's smallest unit (pence for GBP)
  currency: string = 'gbp',
  metadata?: Record<string, string>
): Promise<Stripe.Transfer> {
  try {
    // Create a transfer to the connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to pence
      currency: currency,
      destination: stripeAccountId,
      metadata: metadata || {},
    });

    return transfer;
  } catch (error: any) {
    console.error('Error creating vendor payout:', error);
    throw new Error(`Failed to create payout: ${error.message}`);
  }
}

/**
 * Get Stripe Connect account details
 */
export async function getStripeAccount(accountId: string): Promise<Stripe.Account> {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error: any) {
    console.error('Error retrieving Stripe account:', error);
    throw new Error(`Failed to retrieve Stripe account: ${error.message}`);
  }
}

/**
 * Create an account link for Stripe Connect onboarding
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  } catch (error: any) {
    console.error('Error creating account link:', error);
    throw new Error(`Failed to create account link: ${error.message}`);
  }
}

/**
 * Check if a Stripe account is ready for payouts
 */
export async function isAccountReadyForPayouts(accountId: string): Promise<boolean> {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    
    // Check if account has charges enabled and transfers enabled
    return (
      account.charges_enabled === true &&
      account.payouts_enabled === true &&
      account.details_submitted === true
    );
  } catch (error: any) {
    console.error('Error checking account status:', error);
    return false;
  }
}

export default stripe;

