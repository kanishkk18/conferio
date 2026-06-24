import { useRouter } from 'next/router';
import { TeamScreenTimeDashboard } from '@/components/screen-time/TeamScreenTimeDashboard';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter as useNextRouter } from 'next/router';

export default function TeamAnalyticsPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: session, status } = useSession();
  const nextRouter = useNextRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!slug || status === 'loading') return;

    const checkAdmin = async () => {
      try {
        const res = await fetch(`/api/teams/${slug}/check-role`);
        if (!res.ok) {
          nextRouter.push('/dashboard');
          return;
        }
        const data = await res.json();
        if (data.role !== 'ADMIN' && data.role !== 'OWNER') {
          nextRouter.push('/dashboard');
          return;
        }
        setIsAdmin(true);
      } catch {
        nextRouter.push('/dashboard');
      } finally {
        setChecking(false);
      }
    };

    checkAdmin();
  }, [slug, status, nextRouter]);

  if (status === 'loading' || checking) return <div className="p-8 text-center">Loading...</div>;
  if (!isAdmin) return null;

  return <TeamScreenTimeDashboard teamId={slug as string} />;
}