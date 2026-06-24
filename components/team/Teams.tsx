import { LetterAvatar } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { Team } from '@prisma/client';
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types/index';
import { useRouter } from 'next/router';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { WithLoadingAndError } from '@/components/shared';
import { CreateTeam } from '@/components/team';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const Teams = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [team, setTeam] = useState<Team | null>(null);
  const { isLoading, isError, teams, mutateTeams } = useTeams();
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [createTeamVisible, setCreateTeamVisible] = useState(false);

  const { newTeam } = router.query as { newTeam: string };

  useEffect(() => {
    if (newTeam) {
      setCreateTeamVisible(true);
    }
  }, [newTeam]);

  const leaveTeam = async (team: Team) => {
    const response = await fetch(`/api/teams/${team.slug}/members`, {
      method: 'PUT',
      headers: defaultHeaders,
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('leave-team-success'));
    mutateTeams();
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="gap-y-3">
        <div className="flex justify-between items-center">
          <div className="gap-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">
              {t('all-teams')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('team-listed')}
            </p>
          </div>
          <CreateTeam
          visible={createTeamVisible}
          setVisible={setCreateTeamVisible}
        />
        </div>

<Table>
  <TableCaption></TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[200px]">{t("name")}</TableHead>
      <TableHead>{t("members")}</TableHead>
      <TableHead>{t("created-at")}</TableHead>
      <TableHead className="text-right">{t("actions")}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {teams && teams.length > 0 ? (
      teams.map((team) => (
        <TableRow key={team.id}>
          <TableCell>
            <Link href={`/teams/${team.slug}/members`}>
              <div className="flex items-center gap-x-2">
                <LetterAvatar name={team.name} />
                <span className="underline">{team.name}</span>
              </div>
            </Link>
          </TableCell>
          <TableCell>{team._count.members}</TableCell>
          <TableCell>{new Date(team.createdAt).toDateString()}</TableCell>
          <TableCell className="text-right">
            <button type="button"
              onClick={() => {
                setTeam(team);
                setAskConfirmation(true);
              }}
              className="text-red-600 hover:underline"
            >
              {t("leave-team")}
            </button>
          </TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={4} className="text-center">
          {t("no-teams-found")}
        </TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>


        <ConfirmationDialog
  visible={askConfirmation}
  title={`${t('leave-team')} ${team?.name}`}
  onCancel={() => setAskConfirmation(false)}
  onConfirm={() => {
    if (team) {
      leaveTeam(team);
    }
  }}
  confirmText={t('leave-team')}
>
  {t('leave-team-confirmation')}
</ConfirmationDialog>

      </div>
    </WithLoadingAndError>
  );
};

export default Teams;
