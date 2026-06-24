import { ArrowUpRight, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { TeamMemberWithUser } from 'hooks/useTeamMembers';
import { Team } from '@prisma/client';
import { Badge } from '@/components/ui/badge';

interface LeadCardProps {
  team: Team;
  member: TeamMemberWithUser;
  onMemberSelect: (member: TeamMemberWithUser) => void;
  selectedMemberId?: string;
  isCurrentUser?: boolean;
}

const LeadCard = ({
  team,
  member,
  onMemberSelect,
  selectedMemberId,
  isCurrentUser
}: LeadCardProps) => {
  return (
    <Card
      className={`relative p-4 bg-[#F5F6F7] dark:bg-[#111111] dark:border-[#2A2A2A] shadow-none rounded-3xl hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${selectedMemberId === member.id
        ? 'ring-1 ring-blue-600 bg-blue-500/10 dark:bg-[#171717]'
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

      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative mb-3">
          <div className={` size-20 rounded-full border-4 p-0.5 ${isCurrentUser ? 'border-blue-500/50' : 'border-accent/30'
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
          <div className="absolute -top-1 -right-1 bg-card border border-border rounded-full p-1 shadow-sm">
            <ArrowUpRight className="size-3 text-foreground" />
          </div>

          {/* Online Status Indicator */}
          <div className="absolute bottom-0 right-0 size-4bg-green-500 border-2 border-background rounded-full"></div>
        </div>

        <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">
          {member.user.name}
        </h3>
        <p className="text-xs text-[#7B7B7B] line-clamp-1">
          {member.user.email}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-start">
        <div className="flex flex-col gap-1">
          <div>
            <p className="text-xs font-medium text-foreground uppercase tracking-wider">
              {member.role}
            </p>
            <p className="text-[#7B7B7B] text-[10px]">Role</p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">
              {member.id.slice(0, 6)}
            </p>
            <p className="text-[#7B7B7B] text-[10px]">ID</p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div>
            <p className="text-xs font-medium text-foreground">
              {new Date(member.createdAt).toLocaleDateString()}
            </p>
            <p className="text-[#7B7B7B] text-[10px]">Joined</p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">
              Active
            </p>
            <p className="text-[#7B7B7B] text-[10px]">Status</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LeadCard;
