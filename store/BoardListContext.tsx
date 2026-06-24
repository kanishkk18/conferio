import { useRouter } from 'next/router';
import React, { PropsWithChildren, useEffect, useState, useContext } from 'react';
import useSWR, { KeyedMutator } from 'swr';
import { useSession } from 'next-auth/react';
import { fetcher } from '../utils/utils';
import { Board } from '../types';

export type BoardListContextProps = {
  boards?: Board[];
  selectedBoard: Board | null;
  selectedTask: string | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<string | null>>;
  mutateBoards: KeyedMutator<Board[]>;
  isLoading: boolean;
  isValidating: boolean;
  error: any;
};

export const BoardListContext = React.createContext<BoardListContextProps>({
  boards: [],
  selectedBoard: null,
  selectedTask: null,
  setSelectedTask: () => null,
  isLoading: false,
  isValidating: false,
  error: null,
  mutateBoards: () => Promise.resolve([]),
});

const BoardListContextProvider: React.FC<PropsWithChildren<{ value?: BoardListContextProps }>> = (props) => {
  const session = useSession();
  const router = useRouter();

  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const {
    data: boards,
    mutate: mutateBoards,
    isLoading,
    isValidating,
    error,
  } = useSWR<Board[]>(`/api/boards`, fetcher);

  useEffect(() => {
    if (boards && router.query.boardId) {
      const board = boards.find((board) => board.uuid === router.query.boardId);
      setSelectedBoard(board ?? null);
    }
  }, [boards, router.query.boardId]);

  const contextValue: BoardListContextProps = {
    boards,
    selectedBoard,
    selectedTask,
    setSelectedTask,
    isLoading,
    isValidating,
    error,
    mutateBoards,
  };

  // Wait until session is resolved before rendering children
  if (session.status === 'loading') {
    return null; // or return a <Spinner /> if preferred
  }

  return (
    <BoardListContext.Provider value={props.value ?? contextValue} >
      {props.children}
    </BoardListContext.Provider>
  );
};

export function useBoardsContext() {
  const context = useContext(BoardListContext);
  if (!context) {
    throw new Error('useBoardsContext must be used within a BoardListContextProvider.');
  }
  return context;
}

export default BoardListContextProvider;