

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, Image as ImageIcon, Archive, RotateCcw, Plus, X, Users } from 'lucide-react';
import { BoardCoverUpload } from './board-cover-upload';
import { useSession } from 'next-auth/react';
import { LayoutDashboard } from '@/components/animate-ui/icons/layout-dashboard';
import { ListIcon } from '@/components/animate-ui/icons/list';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchInput from '@/components/ui/Search';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from '@/components/animate-ui/icons/arrow-up-down';
import {
  motion,
  LayoutGroup,
  AnimatePresence,
} from "framer-motion";

import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import BoardList from './BoardList';
import { Activity } from '../animate-ui/icons/activity';

interface BoardHeaderProps {
  board: any;
}

const AVATAR_MOTION = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
};

export function BoardHeader({ board }: BoardHeaderProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);


  // Fetch available team members
  const { data: invitesData } = useQuery({
    queryKey: ['board-invites', board.id],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${board.id}/invites`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !!board.id,
  });

  const isOwnerOrAdmin = board.members.some(
    (m: any) => m.user.id === session?.user?.id && ['OWNER', 'ADMIN'].includes(m.role)
  );

  // Get available members (not already in board)
  const boardMemberIds = new Set(board.members.map((m: any) => m.user.id));
  const availableMembers = (invitesData?.availableTeamMembers || [])
    .filter((tm: any) => !boardMemberIds.has(tm.userId));

  // Mutations
  const addMember = useMutation({
    mutationFn: async (teamMemberId: string) => {
      const res = await fetch(`/api/boards/${board.id}/invites`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamMemberId, role: 'MEMBER' }),
      });
      if (!res.ok) throw new Error('Failed to add');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      queryClient.invalidateQueries({ queryKey: ['board-invites', board.id] });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/boards/${board.id}/members/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      queryClient.invalidateQueries({ queryKey: ['board-invites', board.id] });
    },
  });

    const updateBoardMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await fetch(`/api/boards/${board.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update board');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

   
  const handleArchiveToggle = () => {
    updateBoardMutation.mutate({ isArchived: !board.isArchived });
  };

  const maxVisible = 6;
  const visibleBoardMembers = board.members.slice(0, maxVisible);
  const overflowMembers = board.members.slice(maxVisible);
  const remainingCount = overflowMembers.length;

  return (
    <>
      <div className="flex w-full justify-between items-center px-4 pt-1">
        <div className=" flex-grow w-[50%] flex gap-4 justify-start items-center">
          <SearchInput  />
         
          <AnimateIcon animateOnHover>
            <TabsList className="!px-0 !py-0">
              <TabsTrigger value="account" className='rounded-r-none'><LayoutDashboard /></TabsTrigger>
              <TabsTrigger value="password" className='rounded-none'><ListIcon /></TabsTrigger>
              <TabsTrigger value="activity" className='rounded-l-none'><Activity /></TabsTrigger>
            </TabsList>
          </AnimateIcon>

          {/* MEMBER AVATARS - BOTH PILLS */}
          <div className="flex items-center gap-3">
            <LayoutGroup>
              <TooltipProvider delayDuration={0}>
                
                {/* LEFT PILL: Board Members (Selected) */}
                <motion.div
                  layout
                  className="flex items-center bg-neutral-100 dark:bg-[#3a3a3a] p-0.5 w-fit rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm"
                >
                  <div className="flex items-center h-8">
                    <AnimatePresence mode="popLayout">
                      {visibleBoardMembers.map((member: any, index: number) => (
                        <Tooltip key={member.user.id}>
                          <TooltipTrigger asChild>
                            <motion.div
                              layoutId={`avatar-${member.user.id}`}
                              className="relative cursor-pointer -ml-1.5 first:ml-0"
                              onClick={() => isOwnerOrAdmin && removeMember.mutate(member.user.id)}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ opacity: 1, scale: 1, zIndex: board.members.length - index }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              whileHover={{ scale: 1.15, zIndex: 50 }}
                              transition={AVATAR_MOTION}
                            >
                              {/* Using your old working img logic */}
                              <img
                                src={member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name || member.user.email)}&background=random`}
                                alt={(member.user.name || member.user.email).charAt(0).toUpperCase()}
                                className="relative size-8 rounded-full !z-50 object-cover transition duration-300 hover:ring-2 hover:ring-red-300"
                              />
                              
                              {isOwnerOrAdmin && (
                                <div className="absolute inset-0 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                  <X className="size-4 text-white" />
                                </div>
                              )}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <div className="flex flex-col gap-0.5">
                              <p className="font-semibold text-xs">{member.user.name || member.user.email}</p>
                              <p className="text-[10px] text-gray-400 uppercase">{member.role}</p>
                              {isOwnerOrAdmin && <p className="text-[10px] text-red-400">Click to remove</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}

                      {/* Overflow Dropdown */}
                      {remainingCount > 0 && (
                        <DropdownMenu open={overflowOpen} onOpenChange={setOverflowOpen}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <motion.button
                                  layoutId="overflow-btn"
                                  initial={{ scale: 0.95, opacity: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="relative z-10 flex items-center justify-center size-8 rounded-full bg-gray-200 dark:bg-neutral-700 border-2 border-white dark:border-neutral-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition-colors cursor-pointer -ml-2"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  +{remainingCount}
                                </motion.button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Show {remainingCount} more</p>
                            </TooltipContent>
                          </Tooltip>

                          <DropdownMenuContent className="w-56 p-2" align="start">
                            <DropdownMenuLabel className="text-xs text-gray-500">
                              All Members ({board.members.length})
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {overflowMembers.map((member: any) => (
                              <DropdownMenuItem 
                                key={member.user.id}
                                className="flex items-center gap-2 p-2 cursor-pointer"
                                onClick={() => isOwnerOrAdmin && removeMember.mutate(member.user.id)}
                              >
                                <img
                                  src={member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name || member.user.email)}&background=random`}
                                  className="size-8 rounded-full object-cover"
                                  alt=""
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{member.user.name || member.user.email}</p>
                                  <p className="text-xs text-gray-500 capitalize">{member.role.toLowerCase()}</p>
                                </div>
                                {isOwnerOrAdmin && <X className="size-4 text-gray-400 hover:text-red-500" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </AnimatePresence>

                    {board.members.length === 0 && (
                      <div className="h-9 px-3 flex items-center text-xs text-gray-400 gap-2">
                        <Users className="size-4" />
                        <span>No members</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* DIVIDER */}
                {/* {isOwnerOrAdmin && availableMembers.length > 0 && board.members.length > 0 && (
                  <div className="w-px h-6 bg-gray-300 dark:bg-neutral-700 mx-0" />
                )} */}

                {/* RIGHT PILL: Available to Add */}
                {isOwnerOrAdmin && availableMembers.length > 0 && (
                  <motion.div
                    layout
                    className="flex items-center bg-neutral-100 dark:bg-neutral-800/50 p-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm"
                  >
                    <div className="flex items-center h-8 px-0">
                      <AnimatePresence mode="popLayout">
                        {availableMembers.map((member: any, index: number) => (
                          <Tooltip key={member.teamMemberId}>
                            <TooltipTrigger asChild>
                              <motion.div
                                layoutId={`avatar-${member.userId}`}
                                className="relative cursor-pointer -ml-1.5 first:ml-0"
                                onClick={() => addMember.mutate(member.teamMemberId)}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ opacity: 1, scale: 1, zIndex: availableMembers.length - index }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                whileHover={{ scale: 1.15, zIndex: 50, filter: 'grayscale(0)' }}
                                style={{ filter: 'grayscale(1)' }}
                                transition={AVATAR_MOTION}
                              >
                                {/* <img
                                  src={member.user?.image || "https://i.pinimg.com/736x/17/77/67/17776765f35d35624722d4adfe217c63.jpg" || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.name || member.user?.email || 'U')}&background=cccccc`}
                                  alt={(member.user?.name || member.user?.email || 'U').charAt(0).toUpperCase()}
                                  className="relative size-8 rounded-full border-2 border-white dark:border-neutral-800 object-cover"
                                /> */}
                                <img
                                src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.email)}&background=random`}
                                alt={(member.name || member.email).charAt(0).toUpperCase()}
                                className="relative size-8 rounded-full !z-50 object-cover transition duration-300 hover:ring-2 hover:ring-red-300"
                              />
                                
                                <div className="absolute inset-0 rounded-full bg-indigo-500/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <Plus className="size-2 text-white" />
                                </div>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <div className="flex flex-col gap-0.5">
                                <p className="font-semibold text-xs">{member.name || member.email}</p>
                                <div className="flex items-center gap-1">
                                <p className="text-[10px] text-gray-400">{member.teamName || 'Team Member'}</p>
                                <p className="text-xs text-gray-500 capitalize">{member.role.toLowerCase()}</p>
                                </div>
                                <p className="text-[10px] text-indigo-400">Click to add</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </AnimatePresence>

                      <div className="size-8 -ml-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border-2 border-dashed border-indigo-300 dark:border-indigo-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Plus className="size-4" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </TooltipProvider>
            </LayoutGroup>
          </div>
        </div>

        {/* RIGHT SIDE - FILTER, ARCHIVE, ETC */}
        <div className="w-[45%] flex px-1 justify-end items-center">
          <div className="flex justify-center items-center gap-1">
            {board.isArchived && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-white text-xs rounded-full font-medium">
                Archived
              </span>
            )}

            
             <BoardList />

             
            <Button variant="outline" className="flex dark:text-white dark:!border-none !py-3.5 h-0 items-center gap-1 text-gray-700 rounded-md transition-colors text-sm font-medium">
              <Filter className="size-3" />
              Filter
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="inline-flex justify-center px-2 !py-3.5 h-0 dark:border-none">
                  <AnimateIcon animateOnHover animateOnTap>
                    <ArrowUpDown className="pointer-events-none dark:text-[#EEE] h-5 w-5 -rotate-90"/>
                  </AnimateIcon>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 dark:bg-[#171717]" align="center" side="bottom">
                <DropdownMenuLabel>Board</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleArchiveToggle}>
                  {board.isArchived ? (
                    <><RotateCcw className="size-4" /> Restore</>
                  ) : (
                    <><Archive className="size-4" /> Archive</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCoverUpload(true)}>
                  <ImageIcon className="size-4" /> Cover Image
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {showCoverUpload && (
        <BoardCoverUpload
          boardId={board.id}
          currentCover={board.coverImage}
          onClose={() => setShowCoverUpload(false)}
          open={showCoverUpload}
        />
      )}
    </>
  );
}
