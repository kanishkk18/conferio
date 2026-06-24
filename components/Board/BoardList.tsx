import { useState } from 'react';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from '../ui/animated-modal';
import { Button } from '@/components/ui/button';
import { AnimateIcon } from '../animate-ui/icons/icon';
import { SquareKanban } from '../animate-ui/icons/square-kanban';
import { Card, CardContent } from '../ui/card';
import { LayoutIcon } from 'lucide-react';

interface Board {
  id: string;
  title: string;
  coverImage: string | null;
  isArchived: boolean;
}

interface BoardLinkProps {
  board: Board;
  isActive: boolean;
  onSelect: () => void;
}

const BoardLink: FC<BoardLinkProps> = ({ board, isActive, onSelect }) => {
  const coverImage =
    board.coverImage ||
    'https://i.pinimg.com/1200x/46/f0/5c/46f05c604d64a25948b9ad15ba4ee35a.jpg';

  return (
    <Link href={`/board/${board.id}`} onClick={onSelect} className="block">
      <Card
        className={`h-fit w-48 p-0 overflow-hidden border-none shadow-md rounded-xl cursor-pointer transition-all duration-200 ${isActive
            ? 'ring-2 ring-[#5C47CD] ring-offset-2 dark:ring-offset-neutral-900'
            : 'hover:scale-105'
          }`}
      >
        <CardContent
          className={`flex flex-col gap-y-3 p-2 overflow-hidden h-full w-full ${isActive ? 'bg-[#5C47CD]/10 dark:bg-[#5C47CD]/20' : 'bg-transparent'
            }`}
        >
          <div
            className="relative h-[6rem] w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden"
            style={
              board.coverImage
                ? {
                  backgroundImage: `url(${board.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
                : {}
            }
          >
            {!board.coverImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LayoutIcon className="size-6 text-white/50" />
              </div>
            )}
          </div>
          <div className="flex gap-x-2 justify-center items-center">
            <Button
              variant="outline"
              size="sm"
              className={`w-full border-none text-sm truncate ${isActive
                  ? 'bg-[#5C47CD] text-white'
                  : 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white hover:bg-[#5C47CD] hover:text-white'
                }`}
            >
              {board.title}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const BoardList: FC<{ handleBoardSelect?: (board: Board) => void }> = ({
  handleBoardSelect,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  // ✅ Use React Query directly — same as dashboard, guaranteed to work
  const { data: boards, isLoading } = useQuery<Board[]>({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await fetch('/api/boards');
      if (!res.ok) throw new Error('Failed to fetch boards');
      return res.json();
    },
  });

  const handleBoardClick = (board: Board) => {
    handleBoardSelect?.(board);
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className="rounded-lg dark:bg-[#1D1D1D] flex dark:border-neutral-800 items-center justify-center px-2 py-1 text-center"
      >
        <SquareKanban />
        <p>Loading&hellip;</p>
      </Button>
    );
  }

  return (
    <Modal
      open={dialogOpen}
      onOpenChange={(open) => setDialogOpen(open)}
    >
      <AnimateIcon animateOnHover loop loopDelay={1000}>
        <ModalTrigger className="!py-0 !px-0">
          <Button
            variant="outline"
            className="rounded-lg dark:bg-[#1D1D1D] flex dark:border-neutral-800 items-center justify-center px-2 py-0.5 h-8 text-center"
          >
            <SquareKanban />
            <p>Boards ({boards?.length ?? 0})</p>
          </Button>
        </ModalTrigger>
      </AnimateIcon>

      <ModalBody className="!max-w-[56%] !min-h-fit !h-[40%] !max-h-[76%] dark:bg-neutral-900 !w-[20%]">
        <div className="px-5 py-4 flex flex-col gap-2 text-center sm:text-left">
          <h1 className="text-lg leading-none font-semibold">Select Board</h1>
          {!isLoading && boards?.length === 0 && (
            <p className="text-sm text-neutral-500">No boards found</p>
          )}
        </div>

        <ModalContent className="gap-4 !pt-3 !px-4 grid grid-cols-4">
          {boards?.map((board) => (
            <div key={board.id} className="h-fit w-fit">
              <BoardLink
                board={board}
                isActive={router.query.boardId === board.id}
                onSelect={() => handleBoardClick(board)}
              />
            </div>
          ))}
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

export default BoardList;
