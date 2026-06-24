// import { CheckIcon } from '@heroicons/react/20/solid';
// import { useTranslation } from 'next-i18next';
// import { Button, Card } from 'react-daisyui';

// import plans from '@/components/data/pricing.json';

// const PricingSection = () => {
//   const { t } = useTranslation('common');
//   return (
//     <section className="py-6 h-screen bg-black">
//       <div className="flex flex-col justify-center space-y-6">
//         <h2 className="text-center text-4xl font-bold normal-case">
//           {t('pricing')}
//         </h2>
//         <p className="text-center text-xl">
//           Lorem Ipsum is simply dummy text of the printing and typesetting
//           industry.
//         </p>
//         <div className="flex items-center justify-center">
//           <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
//             {plans.map((plan, index) => {
//               return (
//                 <Card
//                   key={`plan-${index}`}
//                   className="rounded-md dark:border-gray-200 border border-gray-300"
//                 >
//                   <Card.Body>
//                     <Card.Title tag="h2">
//                       {plan.currency} {plan.amount} / {plan.duration}
//                     </Card.Title>
//                     <p>{plan.description}</p>
//                     <div className="mt-5">
//                       <ul className="flex flex-col gap-y-2">
//                         {plan.benefits.map(
//                           (benefit: string, itemIndex: number) => {
//                             return (
//                               <li
//                                 key={`plan-${index}-benefit-${itemIndex}`}
//                                 className="flex items-center"
//                               >
//                                 <CheckIcon className="h-5 w-5" />
//                                 <span className="ml-1">{benefit}</span>
//                               </li>
//                             );
//                           }
//                         )}
//                       </ul>
//                     </div>
//                   </Card.Body>
//                   <Card.Actions className="justify-center m-2">
//                     <Button
//                       color="primary"
//                       className="md:w-full w-3/4 rounded-md"
//                       size="md"
//                     >
//                       {t('buy-now')}
//                     </Button>
//                   </Card.Actions>
//                 </Card>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PricingSection;

// components/subscription/PricingSection.tsx
import { CheckIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'next-i18next';
import { Button, Card } from 'react-daisyui';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const PricingSection = () => {
  const { t } = useTranslation('common');
  const { status } = useSession();

  // Fetch products from a public endpoint (no team required)
  const { data, error } = useSWR(
    status === 'authenticated' ? '/api/payments/products-public' : null,
    fetcher
  );

  const plans = data?.data?.products || [];

  const initiateCheckout = async (priceId: string) => {
    const res = await fetch('/api/payments/create-checkout-session-public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: priceId }),
    });

    const result = await res.json();
    if (result?.data?.url) {
      window.location.href = result.data.url;
    } else {
      toast.error(result?.error?.message || t('stripe-checkout-fallback-error'));
    }
  };

  if (error) {
    return <div className="text-center text-red-500">Failed to load pricing</div>;
  }

  if (!data) {
    return <div className="text-center">Loading&hellip;</div>;
  }

  return (
    <section className="py-6 min-h-screen bg-black">
      <div className="flex flex-col justify-center gap-y-6">
        <h2 className="text-center text-4xl font-semibold normal-case text-white">
          {t('pricing')}
        </h2>
        <p className="text-center text-xl text-gray-300">
          Choose the plan that works best for your team.
        </p>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {plans.map((plan: any) => (
              <Card
                key={plan.id}
                className="rounded-md"
              >
                <Card.Body>
                  <Card.Title tag="h2" className="text-white">
                    {plan.name}
                  </Card.Title>
                  <p className="text-gray-400">{plan.description}</p>
                  <div className="mt-5">
                    <ul className="flex flex-col gap-y-2">
                      {(plan.features || []).map((feature: string, idx: number) => (
                        <li key={`${feature}-${idx}`} className="flex items-center text-gray-300">
                          <CheckIcon className="h-5 w-5 text-green-500" />
                          <span className="ml-2">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 gap-y-2">
                    {plan.prices?.map((price: any) => (
                      <Button
                        key={price.id}
                        color="primary"
                        className="w-full rounded-md"
                        size="md"
                        onClick={() => initiateCheckout(price.id)}
                      >
                        {price.currency?.toUpperCase()} {price.amount} / {price.interval || 'month'}
                      </Button>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
