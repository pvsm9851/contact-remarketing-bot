import { stripe, STRIPE_CONFIG } from '@/lib/stripe-server';
import { handleStripeWebhook } from './stripe-webhook';
import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature || !STRIPE_CONFIG.WEBHOOK_SECRET) {
      res.status(400).json({ error: 'Missing signature or webhook secret' });
      return;
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      STRIPE_CONFIG.WEBHOOK_SECRET
    );

    // Handle the webhook event
    await handleStripeWebhook(event);

    // Send response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(400).json({
      error: `Webhook Error: ${err.message}`
    });
  }
});

export default router; 