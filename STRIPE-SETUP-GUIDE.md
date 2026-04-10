# Stripe Integration Setup Guide

This guide walks you through integrating Stripe subscriptions with your task management PWA using Supabase Edge Functions.

## Prerequisites

- Supabase account with a project created
- Stripe account (free to create)
- Supabase CLI installed (`brew install supabase/tap/supabase`)

---

## Part 1: Stripe Setup

### 1.1 Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com) and sign up
2. Complete the onboarding (use test mode for development)

### 1.2 Create a Product and Price
1. In Stripe Dashboard, go to **Products** > **Add product**
2. Fill in:
   - **Name**: "Premium Subscription"
   - **Description**: "Monthly premium access with all features"
   - **Pricing model**: Recurring
   - **Price**: $4.99 USD
   - **Billing period**: Monthly
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_`) - you'll need this later

Events
A product with ID prod_UJJTdjfaguFaCa was updated, 4/10/26, 3:20:02 PM
A new price called price_1TKgqkRt6Q0PBTTh29joqHEE was created, 4/10/26, 3:20:02 PM
A new plan called price_1TKgqkRt6Q0PBTTh29joqHEE was created, 4/10/26, 3:20:02 PM
A product with ID prod_UJJTdjfaguFaCa was created, 4/10/26, 3:20:02 PM



### 1.3 Get API Keys
1. Go to **Developers** > **API keys**
2. Copy **Publishable key** (starts with `pk_test_`)
3. Reveal and copy **Secret key** (starts with `sk_test_`)
4. Save both keys securely (you'll need them for environment variables)

### 1.4 Set up Webhook
1. Go to **Developers** > **Webhooks**
2. Click **+ Add destination** (or **+ Add endpoint**)
3. On the "Start by selecting which events" screen:
   - **Event source**: Select **Your account** (not "Connected and v2 accounts")
   - **Events to send**: Select **Select events** (not "All events")
   - Click **Continue**
4. You'll see "Select events to listen to". Search for and select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Continue**
6. For **Endpoint URL**, enter: `https://qyistatjtdqkfuwxquwk.supabase.co/functions/v1/stripe-webhook`
   - Replace `YOUR_PROJECT_ID` with your Supabase project ID (found in Supabase dashboard)
7. Click **Add endpoint** or **Create destination**
8. Click **Reveal** under **Signing secret** and copy the webhook secret (starts with `whsec_`)
whsec_6o8MT19BqVYm7JFX0cbbz83wGuOVCjZg



---

## Part 2: Supabase Setup

### 2.1 Create Subscriptions Table
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/add-subscriptions-table.sql` in your project
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** to create the table

### 2.2 Deploy Edge Functions

#### Install Supabase CLI
```bash
# macOS
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

#### Link to your project
```bash
cd /path/to/your/project
#PROJECT_ID: qyistatjtdqkfuwxquwk
supabase link --project-ref YOUR_PROJECT_ID
```


#### Set environment variables
Create a `.env` file in your project root:
```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# App URL (for redirects after checkout)
APP_URL=http://localhost:5173

# Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically 
# available in Edge Functions, no need to set them as secrets
```

#### Deploy the functions
```bash
# Deploy all three functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy create-portal-session

# Set secrets (environment variables for Edge Functions)
# Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically available
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_ID=price_...
supabase secrets set APP_URL=http://localhost:5173
```

---

## Part 3: Test the Integration

### 3.1 Test Locally
1. Start your dev server: `npm run dev`
2. Clear localStorage: Open browser console and run `localStorage.clear()`
3. Refresh the page
4. Go through the onboarding flow
5. Click "Try Free for 7 Days"
6. You should be redirected to Stripe checkout

### 3.2 Test Stripe Checkout
Use Stripe's test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Requires 3DS**: `4000 0027 6000 3184`
- **Declined**: `4000 0000 0000 0002`

For test cards:
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### 3.3 Verify Subscription Created
After successful checkout:
1. Go to Supabase dashboard > **Table Editor** > **subscriptions**
2. You should see a new row with your subscription data
3. Check `status` should be `"trialing"` or `"active"`

### 3.4 Test Webhook
1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click on your webhook endpoint
3. You should see recent events like `checkout.session.completed`
4. Click on an event to see the response (should be 200 OK)

---

## Part 4: Going to Production

### 4.1 Activate Stripe Account
1. Complete Stripe onboarding (add business details, bank account)
2. Get verified

### 4.2 Switch to Live Mode
1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Create a new product/price in live mode
3. Get new live API keys (start with `pk_live_` and `sk_live_`)
4. Create a new webhook endpoint for production URL
5. Update Supabase secrets with live keys:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_live_...
supabase secrets set STRIPE_PRICE_ID=price_live_...
supabase secrets set APP_URL=https://yourdomain.com
```

### 4.3 Update Frontend Environment Variables
Update your `.env` file:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Part 5: Common Issues

### Webhook not receiving events
- Verify webhook URL is correct in Stripe dashboard
- Check `stripe-webhook` function logs in Supabase: `supabase functions serve stripe-webhook`
- Ensure webhook secret matches in Stripe and Supabase secrets

### Checkout session doesn't create
- Check Edge Function logs: `supabase functions serve create-checkout-session`
- Verify CORS headers in function allow your app URL
- Check that price ID is correct

### Subscription not showing in database
- Verify webhook is receiving events (check Stripe dashboard)
- Check `stripe-webhook` function logs for errors
- Ensure subscriptions table has correct RLS policies

### Trial expired check not working
- Verify subscriptions table has data
- Check browser console for errors
- Ensure userId is being passed correctly

---

## Part 6: Monitoring & Maintenance

### View Function Logs
```bash
# Stream logs from a function
supabase functions serve stripe-webhook --debug

# View recent logs
supabase functions serve stripe-webhook
```

### Monitor Subscriptions
```sql
-- View all active subscriptions
SELECT 
  user_id,
  status,
  current_period_end,
  trial_end
FROM subscriptions
WHERE status IN ('active', 'trialing');

-- View expired trials
SELECT 
  user_id,
  status,
  trial_end
FROM subscriptions
WHERE trial_end < NOW() AND status = 'trialing';
```

### Handle Failed Payments
Stripe automatically retries failed payments. You can:
1. Send email notifications (implement in `handlePaymentFailed` in webhook function)
2. Show in-app notification
3. Downgrade to free tier after retry period ends

---

## Resources

- **Stripe Docs**: https://stripe.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Stripe Webhooks**: https://stripe.com/docs/webhooks

---

## Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Check Stripe webhook dashboard for delivery status
3. Verify all environment variables are set correctly
4. Test with Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`
