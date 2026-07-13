import { useTeamStore } from 'store/teamStore';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

/**
 * Returns team slug with priority:
 * 1. URL param (router.query.slug) — for SSR pages like /teams/[slug]/workload
 * 2. Zustand store (selected team) — for pages without slug in URL
 */
export const useTeamSlug = (): string | undefined => {
  const router = useRouter();
  const storeSlug = useTeamStore((state) => state.getTeamSlug());

  return useMemo(() => {
    const urlSlug = router.query.slug as string | undefined;
    return urlSlug || storeSlug;
  }, [router.query.slug, storeSlug]);
};

/**
 * For API calls — returns query string with team context
 */
export const useTeamQuery = (): string => {
  const slug = useTeamSlug();
  const teamId = useTeamStore((state) => state.getTeamId());
  
  return useMemo(() => {
    if (slug) return `?teamSlug=${slug}`;
    if (teamId) return `?teamId=${teamId}`;
    return '';
  }, [slug, teamId]);
};