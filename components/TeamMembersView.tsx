// components/TeamMembersView.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Team } from '@prisma/client';
import { TeamMemberWithUser } from 'hooks/useTeamMembers';
import ProfileSidebar from './ProfileSidebar';
import LeadCard from './LeadCard';
import { useSession } from 'next-auth/react';
import useTeamMembers from 'hooks/useTeamMembers';
import { Loading, Error } from '@/components/shared';
import ChatInterface from './ChatInterface';
import { ScrollArea } from './ui/scroll-area';
import Mainsidebar from './ui/mainSideBar';
import { Button } from './ui/button';
import { AnimateIcon } from './animate-ui/icons/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import useTeams from 'hooks/useTeams';
import { ChevronUpDown } from './animate-ui/icons/chevron-up-down';
import InviteMember from './invitation/InviteMember';
import { Header } from './doc-components/Header';
import { Users } from './animate-ui/icons/users';

interface TeamMembersViewProps {
  team: Team;
}

const TeamMembersView = ({ team }: TeamMembersViewProps) => {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { teams } = useTeams();
  const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers(team.slug);

  const { data: currentMember = null } = useQuery({
    queryKey: ['currentMember', team.slug, session?.user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${team.slug}/members/me`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!session?.user?.id,
  });


  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (members && members.length > 0 && !selectedMember && currentMember) {
      const otherMembers = members.filter(
        (member) => member.userId !== session?.user?.id
      );
      const firstMember = otherMembers.length > 0 ? otherMembers[0] : members[0];
      setSelectedMember(firstMember);
      setIsSidebarOpen(true);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [members, selectedMember, session?.user?.id, currentMember]);


  const handleMemberSelect = (member: TeamMemberWithUser) => {
    setSelectedMember(member);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!members) {
    return null;
  }

  return (
    <div className="min-h-screen flex dark:bg-[#000000] h-screen min-w-full max-w-full">
      <div className="z-50">
        <Mainsidebar />
      </div>
      <ScrollArea className="scrollbar-thin2 pb-4 w-full">
        <Header />
        <div className="w-full justify-between items-center py-1 px-4 mb-4 border-b dark:border-[#222] flex bg-[#111]">
          <div className="text-2xl font-semibold capitalize flex flex-col ">
            {' '}
            <DropdownMenu>
              <AnimateIcon animateOnHover>
                <DropdownMenuTrigger className="capitalize text-sm border dark:border-[#333] p-1 px-2 rounded-md flex justify-center items-center gap-1.5">
                  <Users className="size-3.5"/> <p>{team.name}</p>
                  <ChevronUpDown className="size-3.5" />
                </DropdownMenuTrigger>
              </AnimateIcon>
              <DropdownMenuContent>
                <DropdownMenuLabel  className='py-0.5 dark:bg-black/50 rounded-sm'>Teams</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {teams &&
                  Array.isArray(teams) &&
                  teams.map((t: Team) => (
                    <DropdownMenuItem
                      key={t.slug}
                      onClick={() =>
                        (window.location.href = `/members/${t.slug}`)
                      }
                      className="capitalize"
                    >
                      {t.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>{' '}
          </div>

          <Button className='dark:bg-white dark:text-black py-0 h-8 rounded-lg' size="sm" variant="outline" onClick={() => setVisible(!visible)}>
            Add Member
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-2 px-3 pt-0">
          <div className="col-span-4 w-full overflow-hidden max-h-screen">
            <div className="h-full w-full overflow-y-auto thin-scrollbar pb-0">
              <div className="grid grid-cols-2 gap-3 p-0.5">

                {members?.map((member) => (
                  <LeadCard
                    key={member.id}
                    team={team}
                    member={member}
                    onMemberSelect={handleMemberSelect}
                    selectedMemberId={selectedMember?.id}
                    isCurrentUser={member.userId === session?.user?.id}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-5 h-full max-h-screen">
            <ChatInterface
              team={team}
              selectedMember={selectedMember}
              currentMember={currentMember}
            />
          </div>

          {isSidebarOpen && selectedMember && (
            <div className="col-span-3 -ml-3 max-h-screen">
              <ProfileSidebar
                defaultTo={selectedMember.user.email} defaultSubject="work"
                team={team}
                member={selectedMember}
                currentMember={currentMember}
                onClose={handleCloseSidebar}
              />
            </div>
          )}
        </div>
      </ScrollArea>
      <InviteMember visible={visible} setVisible={setVisible} team={team} />


    </div>
  );
};

export default TeamMembersView;
