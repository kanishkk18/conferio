import React, { FC, useEffect, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Button } from '../ui/button';


interface BoardHeaderProps {
    board: any;
  }
  
 

const BoardInsideHeader = ({ board }: BoardHeaderProps) => {
    const { data: session } = useSession();  // <-- ADD THIS
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(board.title);
  
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
        setIsEditing(false);
      },
    });
  
 
  return (
    <header className="flex items-center justify-between bg-transparent text-2xl font-jakarta text-black font-semibold px-3">
      <div className="relative flex">
        
          <h1
            id="board-header"
            className=" max-w-[30vw] overflow-hidden dark:text-white text-ellipsis whitespace-nowrap text-2xl sm:font-bold lg:max-w-none lg:text-2xl"
          >
           {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => updateBoardMutation.mutate({ title })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateBoardMutation.mutate({ title });
                  if (e.key === 'Escape') {
                    setTitle(board.title);
                    setIsEditing(false);
                  }
                }}
                aria-label="board title"
                className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent"
                
              />
            ) : (
              <Button onClick={() => setIsEditing(true)} className='bg-transparent'> <h1 
                
                className="text-2xl font-semibold text-[#111] dark:text-[#EEE] cursor-pointer hover:bg-gray-100 px-2 py-1 rounded -ml-2 transition-colors"
              >
               {board.title}
              </h1>
              </Button>
            )}
          </h1>
      </div>
     
    </header>
  );
};

export default BoardInsideHeader;
