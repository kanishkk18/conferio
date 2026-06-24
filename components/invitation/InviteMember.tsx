import React from 'react';
import { useTranslation } from 'next-i18next';
import type { Team } from '@prisma/client';
import InviteViaEmail from './InviteViaEmail';
import InviteViaLink from './InviteViaLink';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InviteMemberProps {
  team: Team;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const InviteMember = ({ visible, setVisible, team }: InviteMemberProps) => {
  const { t } = useTranslation('common');

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{t('invite-new-member')}</DialogTitle>
      <DialogDescription>
        Invite your Team via Link or send Invitation to mail
      </DialogDescription>
    </DialogHeader>
     <div className="grid grid-cols-1 divide-y py-2">
          <InviteViaEmail setVisible={setVisible} team={team} />
          <InviteViaLink team={team} />
        </div>
  </DialogContent>
</Dialog>
  );
};

export default InviteMember;
