// scripts/seed-stripe.ts
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

async function seed() {
  const stripe = getStripe();

  // Create in Stripe
  const product = await stripe.products.create({
    name: 'Basic Plan',
    description: 'Perfect for small teams',
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: { interval: 'month' },
  });

  // Save to DB with REAL Stripe IDs
  await prisma.service.create({
    data: {
      id: product.id,
      name: 'Basic Plan',
      description: 'Perfect for small teams',
      features: ['Up to 20 users', '1GB storage', 'Email support'],
      image: '/images/basic-plan.png',
      created: new Date(),
      Price: {
        create: {
          id: price.id, // REAL Stripe price ID
          amount: 2900,
          currency: 'usd',
          billingScheme: 'per_unit',
          type: 'recurring',
          metadata: { interval: 'month' },
          created: new Date(),
        },
      },
    },
  });

  console.log('Created in Stripe:', { productId: product.id, priceId: price.id });
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());