# Stripe Payment Integration Setup Guide

## Webhook Setup Instructions

### Option 1: Stripe CLI (Recommended for Local Development)

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```
   This will open a browser window to authenticate.

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3002/api/v1/payments/webhook
   ```
   
   **Important:** This command will output a webhook signing secret like `whsec_xxxxx`. Copy this value - you'll need it for your `.env` file as `STRIPE_WEBHOOK_SECRET`.

4. **Keep the CLI running** while testing payments locally.

### Option 2: Using Stripe Dashboard (For Production)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter your endpoint URL:
   - **Local testing (with ngrok):** `https://your-ngrok-url.ngrok.io/api/v1/payments/webhook`
   - **Production:** `https://your-production-domain.com/api/v1/payments/webhook`
4. **Select events to listen to:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_`) and add it to your `.env` file

## Events to Select in Stripe Dashboard

When setting up the webhook, select these events:

### Required Events:
- ✅ `payment_intent.succeeded` - When payment is successful
- ✅ `payment_intent.payment_failed` - When payment fails
- ✅ `payment_intent.canceled` - When payment is canceled

### Optional Events (for advanced features):
- `charge.refunded` - For handling refunds
- `payment_intent.requires_action` - For 3D Secure authentication

## Environment Variables

Add these to your `backend/.env` file:

```env
STRIPE_SECRET_KEY=sk_test_51SQI9U2KuopfHAHw7SlskkejBHrFJfvOmeAY6Fjqdp6QvIbMMGugvzbvz6yhbb2yES2a05ep9aJMN7OvckgTiwaP00lHkb9Q7t
STRIPE_PUBLISHABLE_KEY=pk_test_51SQI9U2KuopfHAHw48lpvsa9dVScgYIn8rihOlLX9Ta4okmrRsmwK0bXkSgU3kBCUIbU2nhAb1FE04aAXjCODHLg00idxpeRfq
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

For the frontend, add to your `.env` file (or `.env.local`):

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SQI9U2KuopfHAHw48lpvsa9dVScgYIn8rihOlLX9Ta4okmrRsmwK0bXkSgU3kBCUIbU2nhAb1FE04aAXjCODHLg00idxpeRfq
```

## Test Cards

Use these test card numbers in Stripe test mode:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires 3D Secure:** `4000 0025 0000 3155`
- **Insufficient Funds:** `4000 0000 0000 9995`

Use any future expiry date, any 3-digit CVC, and any postal code.

## Quick Start Checklist

- [ ] Stripe CLI installed and logged in
- [ ] Webhook secret obtained (from Stripe CLI or Dashboard)
- [ ] Environment variables added to `.env` files
- [ ] Backend server running on port 3002
- [ ] Stripe CLI forwarding webhooks (if using CLI)
- [ ] Test payment with test card number



## Webhook Setup Instructions

### Option 1: Stripe CLI (Recommended for Local Development)

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```
   This will open a browser window to authenticate.

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3002/api/v1/payments/webhook
   ```
   
   **Important:** This command will output a webhook signing secret like `whsec_xxxxx`. Copy this value - you'll need it for your `.env` file as `STRIPE_WEBHOOK_SECRET`.

4. **Keep the CLI running** while testing payments locally.

### Option 2: Using Stripe Dashboard (For Production)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter your endpoint URL:
   - **Local testing (with ngrok):** `https://your-ngrok-url.ngrok.io/api/v1/payments/webhook`
   - **Production:** `https://your-production-domain.com/api/v1/payments/webhook`
4. **Select events to listen to:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_`) and add it to your `.env` file

## Events to Select in Stripe Dashboard

When setting up the webhook, select these events:

### Required Events:
- ✅ `payment_intent.succeeded` - When payment is successful
- ✅ `payment_intent.payment_failed` - When payment fails
- ✅ `payment_intent.canceled` - When payment is canceled

### Optional Events (for advanced features):
- `charge.refunded` - For handling refunds
- `payment_intent.requires_action` - For 3D Secure authentication

## Environment Variables

Add these to your `backend/.env` file:

```env
STRIPE_SECRET_KEY=sk_test_51SQI9U2KuopfHAHw7SlskkejBHrFJfvOmeAY6Fjqdp6QvIbMMGugvzbvz6yhbb2yES2a05ep9aJMN7OvckgTiwaP00lHkb9Q7t
STRIPE_PUBLISHABLE_KEY=pk_test_51SQI9U2KuopfHAHw48lpvsa9dVScgYIn8rihOlLX9Ta4okmrRsmwK0bXkSgU3kBCUIbU2nhAb1FE04aAXjCODHLg00idxpeRfq
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

For the frontend, add to your `.env` file (or `.env.local`):

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SQI9U2KuopfHAHw48lpvsa9dVScgYIn8rihOlLX9Ta4okmrRsmwK0bXkSgU3kBCUIbU2nhAb1FE04aAXjCODHLg00idxpeRfq
```

## Test Cards

Use these test card numbers in Stripe test mode:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires 3D Secure:** `4000 0025 0000 3155`
- **Insufficient Funds:** `4000 0000 0000 9995`

Use any future expiry date, any 3-digit CVC, and any postal code.

## Quick Start Checklist

- [ ] Stripe CLI installed and logged in
- [ ] Webhook secret obtained (from Stripe CLI or Dashboard)
- [ ] Environment variables added to `.env` files
- [ ] Backend server running on port 3002
- [ ] Stripe CLI forwarding webhooks (if using CLI)
- [ ] Test payment with test card number






