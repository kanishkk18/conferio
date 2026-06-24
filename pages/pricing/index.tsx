import useCanAccess from 'hooks/useCanAccess';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PricingSection from '@/components/subscription/PricingSection';
import env from '@/lib/env';
import { useTranslation } from 'next-i18next';

const Pricing = () => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  return (
    <>
      <div className="flex items-center justify-center">
        {/* {canAccess("team_payments", ['read']) && */}
         <PricingSection />
         {/* } */}
      </div>
    </>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  if (!env.teamFeatures.payments) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default Pricing;
