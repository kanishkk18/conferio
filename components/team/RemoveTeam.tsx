import { Team } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types/base';

interface RemoveTeamProps {
  team: Team;
  allowDelete: boolean;
}

const RemoveTeam = ({ team, allowDelete }: RemoveTeamProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [askConfirmation, setAskConfirmation] = useState(false);

  const removeTeam = async () => {
    setLoading(true);

    const response = await fetch(`/api/teams/${team.slug}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    setLoading(false);

    if (!response.ok) {
      const json = (await response.json()) as ApiResponse;
      toast.error(json.error.message);
      return;
    }

    toast.success(t('team-removed-successfully'));
    router.push('/teams');
  };

  return (
    <>
      <Card className='bg-transparent'>
          <CardHeader>
            <CardTitle>{t('remove-team')}</CardTitle>
            <CardDescription>
              {allowDelete
                ? t('remove-team-warning')
                : t('remove-team-restricted')}
            </CardDescription>
          </CardHeader>
       
        {allowDelete && (
          <CardFooter>
            <Button
            className='capitalize '
              onClick={() => setAskConfirmation(true)}
              variant="outline"
            >
              remove team
            </Button>
          </CardFooter>
        )}
      </Card>

      {allowDelete && (
        <ConfirmationDialog
          visible={askConfirmation}
          title={t('remove-team')}
          onCancel={() => setAskConfirmation(false)}
          onConfirm={removeTeam}
        >
          {t('remove-team-confirmation')}
        </ConfirmationDialog>
      )}
    </>
  );
};

export default RemoveTeam;
