// import { Error, LetterAvatar, Loading } from '@/components/shared';
// import { Team, TeamMember } from '@prisma/client';
// import useCanAccess from 'hooks/useCanAccess';
// import useTeamMembers, { TeamMemberWithUser } from 'hooks/useTeamMembers';
// import { useSession } from 'next-auth/react';
// import { useTranslation } from 'next-i18next';
// import toast from 'react-hot-toast';
// import { InviteMember } from '@/components/invitation';
// import UpdateMemberRole from './UpdateMemberRole';
// import { defaultHeaders } from '@/lib/common';
// import type { ApiResponse } from 'types/index';
// import ConfirmationDialog from '../shared/ConfirmationDialog';
// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"

// const Members = ({ team }: { team: Team }) => {
//   const { data: session } = useSession();
//   const { t } = useTranslation('common');
//   const { canAccess } = useCanAccess();
//   const [visible, setVisible] = useState(false);
//   const [selectedMember, setSelectedMember] =
//     useState<TeamMemberWithUser | null>(null);
//   const [confirmationDialogVisible, setConfirmationDialogVisible] =
//     useState(false);

//   const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers(
//     team.slug
//   );

//   if (isLoading) {
//     return <Loading />;
//   }

//   if (isError) {
//     return <Error message={isError.message} />;
//   }

//   if (!members) {
//     return null;
//   }

//   const removeTeamMember = async (member: TeamMember | null) => {
//     if (!member) {
//       return;
//     }

//     const sp = new URLSearchParams({ memberId: member.userId });

//     const response = await fetch(
//       `/api/teams/${team.slug}/members?${sp.toString()}`,
//       {
//         method: 'DELETE',
//         headers: defaultHeaders,
//       }
//     );

//     const json = (await response.json()) as ApiResponse;

//     if (!response.ok) {
//       toast.error(json.error.message);
//       return;
//     }

//     mutateTeamMembers();
//     toast.success(t('member-deleted'));
//   };

//   const canUpdateRole = (member: TeamMember) => {
//     return (
//       session?.user.id != member.userId && canAccess('team_member', ['update'])
//     );
//   };

//   const canRemoveMember = (member: TeamMember) => {
//     return (
//       session?.user.id != member.userId && canAccess('team_member', ['delete'])
//     );
//   };

//   const cols = [t('name'), t('email'), t('role')];
//   if (canAccess('team_member', ['delete'])) {
//     cols.push(t('actions'));
//   }

//   return (
//     <div className="gap-y-3">
//       <div className="flex justify-between items-center">
//         <div className="gap-y-3">
//           <h2 className="text-xl font-medium leading-none tracking-tight">
//             {t('members')}
//           </h2>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             {t('members-description')}
//           </p>
//         </div>
//         <Button variant="default" onClick={() => setVisible(!visible)}>
//           {t('add-member')}
//         </Button>
//       </div>

//        <Table>
//       <TableCaption>A list of your team members.</TableCaption>
//       <TableHeader>
//         <TableRow>
//           <TableHead className="min-w-[200px]">Name</TableHead>
//           <TableHead className="min-w-[250px]">Email</TableHead>
//           <TableHead className="min-w-[200px]">Role</TableHead>
//           <TableHead>Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {members.map((member) => (
//           <TableRow key={member.id}>
//             <TableCell>
//               <div className="flex items-center gap-x-2">
//                 <LetterAvatar name={member.user.name} />
//                 <span>{member.user.name}</span>
//               </div>
//             </TableCell>
//             <TableCell>{member.user.email}</TableCell>
//             <TableCell>
//               {canUpdateRole(member) ? (
//                 <UpdateMemberRole team={team} member={member} />
//               ) : (
//                 <span>{member.role}</span>
//               )}
//             </TableCell>
//             <TableCell>
//               {canRemoveMember(member) && (
//                 <button type="button"
//                   className="text-red-600 hover:underline"
//                   onClick={() => {
//                     setSelectedMember(member);
//                     setConfirmationDialogVisible(true);
//                   }}
//                 >
//                   {t("remove")}
//                 </button>
//               )}
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>

//       <ConfirmationDialog
//         visible={confirmationDialogVisible}
//         onCancel={() => setConfirmationDialogVisible(false)}
//         onConfirm={() => removeTeamMember(selectedMember)}
//         title={t('confirm-delete-member')}
//       >
//         {t('delete-member-warning', {
//           name: selectedMember?.user.name,
//           email: selectedMember?.user.email,
//         })}
//       </ConfirmationDialog>
//       <InviteMember visible={visible} setVisible={setVisible} team={team} />
//     </div>
//   );
// };

// export default Members;

// components/team/Members.tsx
import { Error, LetterAvatar, Loading } from '@/components/shared';
import { Team, TeamMember } from '@prisma/client';
import useCanAccess from 'hooks/useCanAccess';
import useTeamMembers, { TeamMemberWithUser } from 'hooks/useTeamMembers';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { InviteMember } from '@/components/invitation';
import UpdateMemberRole from './UpdateMemberRole';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types/index';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Filter, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const avatarColors = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500'
];

const Members = ({ team }: { team: Team }) => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [visible, setVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithUser | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] = useState(false);

  const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers(team.slug);

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!members) return null;

  const removeTeamMember = async (member: TeamMember | null) => {
    if (!member) return;
    const sp = new URLSearchParams({ memberId: member.userId });
    const response = await fetch(`/api/teams/${team.slug}/members?${sp.toString()}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    const json = (await response.json()) as ApiResponse;
    if (!response.ok) { toast.error(json.error.message); return; }
    mutateTeamMembers();
    toast.success(t('member-deleted'));
  };

  const canUpdateRole = (member: TeamMember) => session?.user.id != member.userId && canAccess('team_member', ['update']);
  const canRemoveMember = (member: TeamMember) => session?.user.id != member.userId && canAccess('team_member', ['delete']);

  return (
    <div className="gap-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] bg-white dark:bg-[#1a1a1a]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="bg-white dark:bg-[#1a1a1a]">
            <Filter className="w-4 h-4 mr-1" /> Filters
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white dark:bg-[#1a1a1a]">
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => setVisible(!visible)}>
            <Plus className="w-4 h-4 mr-1" /> Add member
          </Button>
        </div>
      </div>

      {/* Card Grid Layout from Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map((member, index) => {
          const color = avatarColors[index % avatarColors.length];
          const initials = member.user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
          
          return (
            <Card key={member.id} className="border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-20 ${color}`} />
              <CardContent className="pt-10 pb-4 px-4 relative">
                {/* Avatar overlapping the color bar */}
                <div className="absolute -top-7 left-4 w-14 h-14 rounded-2xl bg-white dark:bg-[#1a1a1a] flex items-center justify-center shadow-lg border-4 border-white dark:border-[#1a1a1a]">
                  <span className={`text-xl font-bold ${color.replace('bg-', 'text-')}`}>{initials}</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate mt-2">
                  {member.user.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {member.user.email}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="w-[120px]">
                    {canUpdateRole(member) ? (
                      <UpdateMemberRole team={team} member={member} />
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {member.role}
                      </Badge>
                    )}
                  </div>
                  
                  {canRemoveMember(member) && (
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      onClick={() => {
                        setSelectedMember(member);
                        setConfirmationDialogVisible(true);
                      }}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => removeTeamMember(selectedMember)}
        title={t('confirm-delete-member')}
      >
        {t('delete-member-warning', { name: selectedMember?.user.name, email: selectedMember?.user.email })}
      </ConfirmationDialog>
      
      <InviteMember visible={visible} setVisible={setVisible} team={team} />
    </div>
  );
};

export default Members;