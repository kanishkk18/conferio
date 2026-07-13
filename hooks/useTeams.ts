// import fetcher from '@/lib/fetcher';
// import useSWR, { mutate } from 'swr';
// import type { ApiResponse, TeamWithMemberCount } from 'types/index';

// const useTeams = () => {
//   const url = `/api/teams`;

//   const { data, error, isLoading } = useSWR<ApiResponse<TeamWithMemberCount[]>>(
//     url,
//     fetcher
//   );

//   const mutateTeams = async () => {
//     mutate(url);
//   };

//   return {
//     isLoading,
//     isError: error,
//     teams: data?.data,
//     mutateTeams,
//   };
// };

// export default useTeams;

import fetcher from '@/lib/fetcher';
import useSWR, { mutate } from 'swr';
import type { ApiResponse, TeamWithMemberCount } from 'types/index';
import { useTeamStore } from 'store/teamStore';
import { useEffect } from 'react';

const useTeams = () => {
  const url = `/api/teams`;
  const { selectedTeam, setSelectedTeam } = useTeamStore();

  const { data, error, isLoading } = useSWR<ApiResponse<TeamWithMemberCount[]>>(
    url,
    fetcher
  );

  // Auto-select default team when teams load (only if no URL context)
  useEffect(() => {
    if (data?.data && data.data.length > 0 && !selectedTeam) {
      setSelectedTeam(data.data[0]);
    }
  }, [data, selectedTeam, setSelectedTeam]);

  const mutateTeams = async () => {
    mutate(url);
  };

  return {
    isLoading,
    isError: error,
    teams: data?.data,
    selectedTeam,
    setSelectedTeam,
    mutateTeams,
  };
};

export default useTeams;