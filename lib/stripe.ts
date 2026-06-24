// import Stripe from 'stripe';
// import env from '@/lib/env';
// import { updateTeam } from 'models/team';

// export const stripe = new Stripe(env.stripe.secretKey ?? '');

// export async function getStripeCustomerId(teamMember, session?: any) {
//   let customerId = '';
//   if (!teamMember.team.billingId) {
//     const customerData: {
//       metadata: { teamId: string };
//       email?: string;
//     } = {
//       metadata: {
//         teamId: teamMember.teamId,
//       },
//     };
//     if (session?.user?.email) {
//       customerData.email = session?.user?.email;
//     }
//     const customer = await stripe.customers.create({
//       ...customerData,
//       name: session?.user?.name as string,
//     });
//     await updateTeam(teamMember.team.slug, {
//       billingId: customer.id,
//       billingProvider: 'stripe',
//     });
//     customerId = customer.id;
//   } else {
//     customerId = teamMember.team.billingId;
//   }
//   return customerId;
// }

// lib/stripe.ts
import Stripe from 'stripe';
import env from '@/lib/env';
import { updateTeam } from 'models/team';

export const isStripeConfigured = (): boolean => {
  return !!env.stripe.secretKey;
};

let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.stripe.secretKey!, {
      apiVersion: '2024-06-20',
    });
  }
  return stripeInstance;
};

// Backward-compatible export for existing imports
export const stripe = isStripeConfigured() 
  ? new Stripe(env.stripe.secretKey!, { apiVersion: '2024-06-20' })
  : (null as unknown as Stripe);

export async function getStripeCustomerId(teamMember, session?: any) {
  const stripe = getStripe(); // Use the safe getter

  let customerId = '';
  if (!teamMember.team.billingId) {
    const customerData: {
      metadata: { teamId: string };
      email?: string;
    } = {
      metadata: {
        teamId: teamMember.teamId,
      },
    };
    if (session?.user?.email) {
      customerData.email = session?.user?.email;
    }
    const customer = await stripe.customers.create({
      ...customerData,
      name: session?.user?.name as string,
    });
    await updateTeam(teamMember.team.slug, {
      billingId: customer.id,
      billingProvider: 'stripe',
    });
    customerId = customer.id;
  } else {
    customerId = teamMember.team.billingId;
  }
  return customerId;
}
