import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: any) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const signature = req.headers['stripe-signature']

  if (!signature) {
    return res.status(400).json({ error: 'No signature' })
  }

  try {
    const buf = await buffer(req)
    const event = stripe.webhooks.constructEvent(buf, signature, webhookSecret)

    console.log(`Webhook received: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return res.status(400).json({ error: error.message })
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id

  if (!userId) {
    console.error('No user ID in subscription metadata')
    return
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error upserting subscription:', error)
  } else {
    console.log(`Subscription updated for user ${userId}`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id

  if (!userId) {
    console.error('No user ID in subscription metadata')
    return
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating canceled subscription:', error)
  } else {
    console.log(`Subscription canceled for user ${userId}`)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Check both metadata and client_reference_id (Payment Links use client_reference_id)
  const userId = session.metadata?.supabase_user_id || session.client_reference_id

  if (!userId) {
    console.error('No user ID in checkout session - checked metadata and client_reference_id')
    console.log('Session data:', JSON.stringify(session, null, 2))
    return
  }

  console.log(`Checkout completed for user ${userId}`)

  // Get the subscription from the session
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    
    // Add user_id to subscription metadata if not present
    if (!subscription.metadata.supabase_user_id) {
      await stripe.subscriptions.update(subscription.id, {
        metadata: { supabase_user_id: userId }
      })
      subscription.metadata.supabase_user_id = userId
    }
    
    await handleSubscriptionChange(subscription)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  )
  
  const userId = subscription.metadata.supabase_user_id

  if (!userId) {
    console.error('No user ID in subscription metadata')
    return
  }

  await handleSubscriptionChange(subscription)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  )
  
  const userId = subscription.metadata.supabase_user_id

  if (!userId) {
    console.error('No user ID in subscription metadata')
    return
  }

  console.log(`Payment failed for user ${userId}`)
}
