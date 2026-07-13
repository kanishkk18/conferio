// hooks/useSyncTeamFromUrl.ts
import { useEffect } from 'react';
import { useTeamStore } from 'store/teamStore';
import useTeams from './useTeams';

export const useSyncTeamFromUrl = (urlSlug?: string) => {
  const { teams, isLoading } = useTeams();
  const { selectedTeam, setSelectedTeam } = useTeamStore();

  useEffect(() => {
    if (isLoading || !teams) return;

    // If URL has a slug, sync store to that team
    if (urlSlug) {
      const teamFromUrl = teams.find((t) => t.slug === urlSlug);
      if (teamFromUrl && teamFromUrl.id !== selectedTeam?.id) {
        setSelectedTeam(teamFromUrl);
      }
    }
    // If no URL slug and no selected team, auto-select first
    else if (!selectedTeam && teams.length > 0) {
      setSelectedTeam(teams[0]);
    }
  }, [urlSlug, teams, isLoading, selectedTeam, setSelectedTeam]);
};