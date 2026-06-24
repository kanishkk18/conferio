import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function AppShell({ children }) {
  const router = useRouter();
  const { status } = useSession();


  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return;
  }

  return (
    <div>
          <div className="">
            {children}
          </div>
    </div>
  );
}
