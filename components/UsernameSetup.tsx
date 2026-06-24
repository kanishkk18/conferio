// components/UsernameSetup.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter
} from '@/components/ui/animated-modal';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface UsernameSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UsernameSetup({ 
  open, 
  onOpenChange 
}: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: session, update } = useSession();
const { reload } = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/set-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        await update({ username });
        onOpenChange(false); // Close modal
        reload();
      } else {
        setError(data.message || 'Error setting username');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setUsername('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <ModalContent>
            <ModalHeader className='mt-3 mb-3'>
              <ModalTitle>Set Your Username</ModalTitle>
              <ModalDescription>
                Please choose a username to continue using the platform.
              </ModalDescription>
            </ModalHeader>

            <div className="*:not-first:mt-2 gap-y-2 mb-4">
              <Label>Username</Label>
              <div className="relative">
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="peer ps-[5.5rem] dark:text-white"
                  placeholder="John_doe18"
                />
                <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
                  conferio.in/
                </span>
              </div>
            </div>

            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          </ModalContent>
          
          <ModalFooter>
            <button
              type="submit"
              disabled={isLoading || username.length < 3}
              className="w-fit bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Updating' : 'Update'}
            </button>
          </ModalFooter>
        </ModalBody>
      </form>
    </Modal>
  );
}