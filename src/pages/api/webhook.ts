import express, { Request, Response, NextFunction } from 'express';
import { handleStripeWebhook } from './stripe-webhook';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      res.status(400).send('Missing signature or webhook secret');
      return;
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
});

export default router; 