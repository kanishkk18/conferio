import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Team {
  id: string;
  name: string;
  slug: string;
}

interface TeamState {
  selectedTeam: Team | null;
  setSelectedTeam: (team: Team) => void;
  getTeamSlug: () => string | undefined;
  getTeamId: () => string | undefined;
  clearTeam: () => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      selectedTeam: null,
      setSelectedTeam: (team) => set({ selectedTeam: team }),
      getTeamSlug: () => get().selectedTeam?.slug,
      getTeamId: () => get().selectedTeam?.id,
      clearTeam: () => set({ selectedTeam: null }),
    }),
    { name: 'conferio-selected-team' }
  )
);