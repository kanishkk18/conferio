import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';

export default function SAMLIdPLogin() {
  const router = useRouter();

  const { isReady, query } = router;

  useEffect(() => {
    if (!isReady) {
      return;
    }

    signIn('conferio', {
      callbackUrl: '/dashboard',
      code: query?.code,
    });
  }, [isReady, query]);

  return null;
}

SAMLIdPLogin.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};
