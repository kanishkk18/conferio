// components/team/TeamDashboard.tsx
import { Error, Loading, LetterAvatar } from '@/components/shared';
import { Team, TeamMember } from '@prisma/client';
import useTeam from 'hooks/useTeam';
import useTeamMembers, { TeamMemberWithUser } from 'hooks/useTeamMembers';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  Target,
  Clock,
  Star,
  Plus,
  Download,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Zap,
  Crown,
  ArrowUpRight,
} from 'lucide-react';

// Avatar colors for team members
const avatarColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
];

interface TeamDashboardProps {
  team: Team;
  teamFeatures: any;
}

const TeamDashboard = ({ team, teamFeatures }: TeamDashboardProps) => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState('overview');
  const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers(
    team.slug
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'priorities', label: 'Priorities', icon: Target },
    { id: 'team', label: 'Team', icon: Users },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  return (
    <div className="flex flex-col h-full w-full dark:bg-[#0f0f0f]">
      {/* Header with Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f0f]">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {team.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {team.name}'s Workspace
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab team={team} members={members} />
          )}
          {activeTab === 'team' && (
            <TeamTabContent team={team} members={members} />
          )}
          {activeTab === 'priorities' && (
            <PrioritiesTab team={team} members={members} />
          )}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({
  team,
  members,
}: {
  team: Team;
  members: TeamMemberWithUser[];
}) => {
  const { t } = useTranslation('common');

  const bookmarks = [
    { name: 'conferio', color: 'bg-blue-500' },
    { name: 'Team Space', color: 'bg-purple-500' },
    { name: 'Marketing', color: 'bg-green-500' },
    { name: 'Development', color: 'bg-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bookmarks Section */}
      <div className="lg:col-span-2">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Bookmarks
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-gray-400">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.name}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${bookmark.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                  >
                    <span className="text-white text-lg font-bold">
                      {bookmark.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    {bookmark.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Section */}
      <div className="lg:col-span-1">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Members
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {members?.length || 0}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                0% of people have Priorities set
              </p>
              <div className="flex -space-x-2">
                {members?.slice(0, 5).map((member, index) => (
                  <div
                    key={member.id}
                    className={`w-8 h-8 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center border-2 border-white dark:border-[#1a1a1a]`}
                  >
                    <span className="text-white text-xs font-medium">
                      {member.user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                ))}
                {(members?.length || 0) > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-[#1a1a1a]">
                    <span className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                      +{(members?.length || 0) - 5}
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {}}
              >
                View all members
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Off / Subscription Section */}
      <div className="lg:col-span-1">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Time off
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800/30">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  Business Plus
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                $19 member per month
              </p>
              <Button
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Choose Business Plus
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <div className="lg:col-span-2">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">KB</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Kanishk Bansal</span> created
                    a new task "Update documentation"
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">AK</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Amit Kumar</span> completed
                    "Fix login bug"
                  </p>
                  <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Activity history is limited to 7 days on the Free plan. Upgrade
                  to see more history.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Team Tab Component
const TeamTabContent = ({
  team,
  members,
}: {
  team: Team;
  members: TeamMemberWithUser[];
}) => {
  const { t } = useTranslation('common');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountType, setAccountType] = useState('all');

  return (
    <div>
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accountType} onValueChange={setAccountType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1" />
            More filters
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add member
          </Button>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members?.map((member, index) => (
          <MemberCard
            key={member.id}
            member={member}
            color={avatarColors[index % avatarColors.length]}
          />
        ))}
      </div>
    </div>
  );
};

// Member Card Component
const MemberCard = ({
  member,
  color,
}: {
  member: TeamMemberWithUser;
  color: string;
}) => {
  const initials = member.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] hover:shadow-md transition-shadow overflow-hidden">
      <div className={`h-20 ${color} relative`}>
        <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-2xl bg-white dark:bg-[#1a1a1a] flex items-center justify-center shadow-lg">
          <span className={`text-xl font-bold ${color.replace('bg-', 'text-')}`}>
            {initials}
          </span>
        </div>
      </div>
      <CardContent className="pt-10 pb-4 px-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
          {member.user.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
          {member.user.email}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <Badge
            variant="secondary"
            className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            {member.role}
          </Badge>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Priorities Tab Component
const PrioritiesTab = ({
  team,
  members,
}: {
  team: Team;
  members: TeamMemberWithUser[];
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Priorities
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set priorities for your team members
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add priority
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members?.map((member, index) => (
          <PriorityCard
            key={member.id}
            member={member}
            color={avatarColors[index % avatarColors.length]}
          />
        ))}
      </div>
    </div>
  );
};

// Priority Card Component
const PriorityCard = ({
  member,
  color,
}: {
  member: TeamMemberWithUser;
  color: string;
}) => {
  const initials = member.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {member.user.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {member.user.email}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center gap-2 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
            <Plus className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Add task</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamDashboard;