import { stripe } from '@/lib/stripe-server';
import { Request, Response, Router } from 'express';

interface CancelSubscriptionBody {
  subscriptionId: string;
}

const router = Router();

const cancelSubscription = async (
  req: Request<{}, any, CancelSubscriptionBody>,
  res: Response
): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { subscriptionId } = req.body;

  if (!subscriptionId) {
    res.status(400).json({ error: 'Missing subscriptionId' });
    return;
  }

  try {
    // Cancela a assinatura no final do período atual
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

router.post('/', cancelSubscription);

export default router; 