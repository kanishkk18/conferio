import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { TeamMemberWithUser } from 'hooks/useTeamMembers';
import { Team } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  team: Team;
  member: TeamMemberWithUser;
  onMemberSelect: (member: TeamMemberWithUser) => void;
  selectedMemberId?: string;
  isCurrentUser?: boolean;
}

const MemberChatCards = ({

  member,
  onMemberSelect,
  selectedMemberId,
  isCurrentUser
}: LeadCardProps) => {
  return (
    <>
      <div
        className={`group px-1 w-full py-0.5 rounded-md flex flex-col items-center !-space-y-5 hover:bg-neutral-900 hover:dark:bg-neutral-900 transition  ${selectedMemberId === member.id
            ? 'bg-neutal-900 dark:bg-neutral-900'
            : 'hover:dark:bg-[#191919]'
          }`}
        onClick={() => onMemberSelect(member)}
      >
        {/* Current User Badge */}
        {isCurrentUser && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="text-xs">
              You
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-1 w-full text-center">
          <div className="relative ">
            <div className={`size-6 rounded-full p-0.5 ${isCurrentUser ? 'border-blue-500/50' : 'border-accent/30'
              }`}>
              <Avatar className="w-full h-full">
                <AvatarImage src={member.user.image || ''} alt={member.user.name} />
                <AvatarFallback className="bg-card text-foreground">
                  {member.user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

          </div>
          <p
            className={cn(
              " text-sm text-[#B4B4B4] capitalize group-hover:text-zinc-600 dark:text-[#B4B4B4] dark:group-hover:text-zinc-300 transition",
              selectedMemberId === member.id &&
              "text-primary dark:text-zinc-200 dark:group-hover:text-white"
            )}
          >
            {member.user.name}
          </p>
        </div>

      </div>

    </>
  );
};

export default MemberChatCards;
