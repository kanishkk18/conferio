// pages/api/payments/products-public.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAllServices, getAllPrices } from 'models/service'; // or your DB models
import { isStripeConfigured, getStripe } from '@/lib/stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!isStripeConfigured()) {
      return res.json({ data: { products: [] } });
    }

    // Fetch from your DB (which syncs with Stripe via webhooks)
    const [products, prices] = await Promise.all([
      getAllServices(),
      getAllPrices(),
    ]);

    const productsWithPrices = products.map((product: any) => ({
      ...product,
      prices: prices
        .filter((price: any) => price.serviceId === product.id)
        .map((price: any) => ({
          id: price.id,
          amount: price.amount,
          currency: price.currency,
          interval: price.metadata?.interval || 'month',
        })),
    }));

    res.json({ data: { products: productsWithPrices } });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
}