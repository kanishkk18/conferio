import { FC, useEffect, useRef, useCallback, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Trash2,
  ArrowRight,
  UserPlus,
  UserMinus,
  Edit2,
  Tag,
  Paperclip,
  Calendar,
  AlertCircle,
  LogIn,
  Mail,
  RotateCcw,
  Archive,
  MessageSquare,
  Layers,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata: Record<string, any> | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
}

interface BoardActivityLogProps {
  boardId: string;
}

const ACTION_ICONS: Record<string, { icon: typeof Plus; color: string; bg: string }> = {
  CREATED: { icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  DELETED: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  MOVED: { icon: ArrowRight, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ASSIGNED: { icon: UserPlus, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  UNASSIGNED: { icon: UserMinus, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  UPDATED: { icon: Edit2, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  RENAMED: { icon: Edit2, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  LABELED: { icon: Tag, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  ATTACHED: { icon: Paperclip, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  DUE_DATE_SET: { icon: Calendar, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  PRIORITY_CHANGED: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  STATUS_CHANGED: { icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  COMMENTED: { icon: MessageSquare, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/20' },
  INVITED: { icon: Mail, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  JOINED: { icon: LogIn, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  REMOVED: { icon: UserMinus, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  ARCHIVED: { icon: Archive, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20' },
  RESTORED: { icon: RotateCcw, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  COVER_CHANGED: { icon: Edit2, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
};

const ENTITY_COLORS: Record<string, string> = {
  BOARD: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  TASK: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  COLUMN: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  MEMBER: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  COMMENT: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  ATTACHMENT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  LABEL: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

// Group activities by date
function groupByDate(activities: ActivityLog[]) {
  const groups: Record<string, ActivityLog[]> = {};
  activities.forEach((a) => {
    const date = new Date(a.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;
    if (date.toDateString() === today.toDateString()) label = 'Today';
    else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = format(date, 'MMMM d, yyyy');

    if (!groups[label]) groups[label] = [];
    groups[label].push(a);
  });
  return groups;
}

function RelativeTime({ date }: { date: string | Date }) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    // Runs only on client — no hydration mismatch
    setTimeAgo(formatDistanceToNow(new Date(date), { addSuffix: true }));

    // Optional: keep it live-updating every minute
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(new Date(date), { addSuffix: true }));
    }, 60_000);

    return () => clearInterval(interval); // ✅ cleanup — fixes the memory leak too!
  }, [date]);

  if (!timeAgo) return null; // or a skeleton

  return <span>{timeAgo}</span>;
}

const ActivityItem: FC<{ activity: ActivityLog }> = ({ activity }) => {
  const config = ACTION_ICONS[activity.action] ?? ACTION_ICONS['UPDATED'];
  const Icon = config.icon;
  const entityColor = ENTITY_COLORS[activity.entityType] ?? ENTITY_COLORS['TASK'];

  return (
    <div className="flex gap-3 group py-2 px-1 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="size-6 border border-neutral-200 dark:border-neutral-700">
          <AvatarImage src={activity.user.image ?? undefined} />
          <AvatarFallback className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {activity.user.name?.charAt(0)?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        {/* Action icon badge */}
        <div className={`absolute -bottom-1 -right-1 size-4rounded-full ${config.bg} flex items-center justify-center ring-1 ring-white dark:ring-neutral-900`}>
          <Icon className={`w-2.5 h-2.5 ${config.color}`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-sm leading-snug">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 shrink-0">
              {activity.user.name ?? activity.user.email}
            </span>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0 ${entityColor}`}
            >
              {activity.entityType}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 shrink-0 pt-0.5">
            {/* {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })} */}
            <RelativeTime date={activity.createdAt} />
          </span>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
          {activity.description}
        </p>

        {/* Metadata pills for moves */}
        {activity.action === 'MOVED' && activity.metadata?.from && activity.metadata?.to && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
              {activity.metadata.from}
            </span>
            <ArrowRight className="size-3 text-neutral-400" />
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
              {activity.metadata.to}
            </span>
          </div>
        )}

        {/* Priority change pills */}
        {activity.action === 'PRIORITY_CHANGED' && activity.metadata?.from && activity.metadata?.to && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
              {activity.metadata.from}
            </span>
            <ArrowRight className="size-3 text-neutral-400" />
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium">
              {activity.metadata.to}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const MiniActivityItem: FC<{ activity: ActivityLog }> = ({ activity }) => {
  const config = ACTION_ICONS[activity.action] ?? ACTION_ICONS['UPDATED'];
  const Icon = config.icon;
  const entityColor = ENTITY_COLORS[activity.entityType] ?? ENTITY_COLORS['TASK'];

  return (
    <div className="flex gap-3 group py-1.5 px-1 overflow-hidden mb-1 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="size-6 border border-neutral-200 dark:border-neutral-700">
          <AvatarImage src={activity.user.image ?? undefined} />
          <AvatarFallback className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {activity.user.name?.charAt(0)?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        {/* Action icon badge */}
        <div className={`absolute -bottom-1 -right-1 size-4rounded-full ${config.bg} flex items-center justify-center ring-1 ring-white dark:ring-neutral-900`}>
          <Icon className={`w-2.5 h-2.5 ${config.color}`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 ">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm leading-snug">
            <span className="font-medium text-xs text-neutral-900 dark:text-neutral-100 shrink-0">
              {(activity.user.name?.split(' ')[0] || activity.user.email)}
            </span>

            <span
              className={`text-[8px] font-medium px-1 py-0.5 rounded-md shrink-0 ${entityColor}`}
            >
              {activity.entityType}
            </span>
          </div>
          {/* <span className="text-[9px] text-neutral-400 dark:text-neutral-500 shrink-0 pt-0.5">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </span> */}
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0 pt-0.5">
            {/* {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
              .replace('about ', '')
              .replace(' hours ago', ' h ago')
              .replace(' hour ago', ' h ago')
              .replace(' minutes ago', ' mins ago')
              .replace(' minute ago', ' mins ago')} */}
            <RelativeTime date={activity.createdAt} />
          </span>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
          {activity.description}
        </p>

        {/* Metadata pills for moves */}
        {activity.action === 'MOVED' && activity.metadata?.from && activity.metadata?.to && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
              {activity.metadata.from}
            </span>
            <ArrowRight className="size-3 text-neutral-400" />
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
              {activity.metadata.to}
            </span>
          </div>
        )}

        {/* Priority change pills */}
        {activity.action === 'PRIORITY_CHANGED' && activity.metadata?.from && activity.metadata?.to && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
              {activity.metadata.from}
            </span>
            <ArrowRight className="size-3 text-neutral-400" />
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium">
              {activity.metadata.to}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const BoardActivityLog: FC<BoardActivityLogProps> = ({ boardId }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['board-activity', boardId],
    queryFn: async ({ pageParam }) => {
      const url = `/api/boards/${boardId}/activity?limit=30${pageParam ? `&cursor=${pageParam}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch activity');
      return res.json() as Promise<{ activities: ActivityLog[]; nextCursor: string | null }>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const allActivities = data?.pages.flatMap((p) => p.activities) ?? [];
  const grouped = groupByDate(allActivities);

  // Intersection observer for infinite scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const nearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
      if (nearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="size-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
            <div className="flex-1 gap-y-2 pt-1">
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (allActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12 px-4 text-center">
        <div className="size-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <Layers className="size-5 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No activity yet</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Actions on this board will appear here
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full overflow-y-auto max-w-full thin-scrollbar px-3 py-2"
      onScroll={handleScroll}
    >
      {Object.entries(grouped).map(([date, activities]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center gap-2 py-2 sticky top-0 z-10 backdrop-blur-sm">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide px-1">
              {date}
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      ))}

      {isFetchingNextPage && (
        <div className="flex justify-center py-3">
          <div className="size-5 border-2 border-neutral-300 dark:border-neutral-600 border-t-[#5C47CD] rounded-full animate-spin" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export const MiniActivityLog: FC<BoardActivityLogProps> = ({ boardId }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['board-activity', boardId],
    queryFn: async ({ pageParam }) => {
      const url = `/api/boards/${boardId}/activity?limit=30${pageParam ? `&cursor=${pageParam}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch activity');
      return res.json() as Promise<{ activities: ActivityLog[]; nextCursor: string | null }>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const allActivities = data?.pages.flatMap((p) => p.activities) ?? [];
  const grouped = groupByDate(allActivities);

  // Intersection observer for infinite scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const nearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
      if (nearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="size-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
            <div className="flex-1 gap-y-2 pt-1">
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (allActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12 px-4 text-center">
        <div className="size-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <Layers className="size-5 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No activity yet</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Actions on this board will appear here
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full overflow-y-auto max-w-full thin-scrollbar px-3 py-2"
      onScroll={handleScroll}
    >
      {Object.entries(grouped).map(([date, activities]) => (
        <div key={date}>
          {/* Date separator */}
          {/* <div className="flex items-center gap-2 py-2 sticky top-0 z-10 backdrop-blur-sm">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide px-1">
              {date}
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div> */}

          {activities.map((activity) => (
            <MiniActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      ))}

      {isFetchingNextPage && (
        <div className="flex justify-center py-3">
          <div className="size-5 border-2 border-neutral-300 dark:border-neutral-600 border-t-[#5C47CD] rounded-full animate-spin" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
