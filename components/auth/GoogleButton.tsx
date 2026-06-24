import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import useInvitation from 'hooks/useInvitation';
import env from '@/lib/env';
import { cn } from '@/lib/utils';

const GoogleButton = (props:any) => {
  const { t } = useTranslation('common');
  const { invitation } = useInvitation();

  const callbackUrl = invitation
    ? `/invitations/${invitation.token}`
    : env.redirectIfAuthenticated;

  return (

    <Button variant="ghost" onClick={() => {
        signIn('google', {
          callbackUrl,
        });
      }} className={cn(props.className,"md:transition-colors  uppercase font-bold flex items-center justify-center h-10 px-16 text-12 text-white tracking-snugger rounded bg-grey-5 ring-1 ring-white/10 transition-all duration-200 hover:ring-white/15 mx-px gap-x-2 md:!px-2 !text-13" )} >

            <img alt="" loading="lazy" width="22" height="22" decoding="async" data-nimg="1" src="https://huly.io/_next/static/media/32e1c3b9e673e4ff754c5e08d689ba09.svg" className='text-transparent' />

            <span className="font-medium text-sm !normal-case"> {t('Sign in with Google')}</span>

          </Button>
    
  );
};

export default GoogleButton;
