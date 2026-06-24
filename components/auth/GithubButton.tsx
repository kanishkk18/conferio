import { signIn } from 'next-auth/react';
import { Button } from 'components/ui/button';
import { useTranslation } from 'next-i18next';
import useInvitation from 'hooks/useInvitation';
import env from '@/lib/env';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const GithubButton = (props:any) => {
  const { t } = useTranslation('common');
  const { invitation } = useInvitation();

  const callbackUrl = invitation
    ? `/invitations/${invitation.token}`
    : env.redirectIfAuthenticated;

  return (
    <Button
    variant='ghost'
      onClick={() => {
        signIn('github', {
          callbackUrl,
        });
      }}
     className={ cn(props.className, `w-full md:transition-colors duration-200 uppercase font-bold flex items-center justify-center h-10 px-16 text-12 text-white tracking-snugger rounded bg-grey-5 ring-1 ring-white/10 transition-all hover:ring-white/15 mx-px gap-x-2 md:!px-2 !text-13`)}>

              <Image alt="" loading="lazy" width={22} height={22} decoding="async" data-nimg="1" src="https://huly.io/_next/static/media/b5542d544a6d8da936225cf15b50b17c.svg" className='text-transparent ' />

              <span className="font-medium text-sm !normal-case"> {t('Sign up with GitHub')}</span>
      
    </Button>
  );
};

export default GithubButton;
