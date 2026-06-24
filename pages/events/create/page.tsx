// 'use client';

// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { useMutation } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { PlusIcon } from 'lucide-react';
// import Link from 'next/link';
// import {
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalFooter,
//   ModalTrigger,
// } from '@/components/ui/animated-modal';
// import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent } from '@/components/ui/card';

// export default function CreateEvent() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     duration: 30,
//     locationType: 'GOOGLE_MEET_AND_CALENDAR',
//   });
//     const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/auth/login');
//     }
//   }, [status, router]);

//   const createEventMutation = useMutation({
//     mutationFn: async (data: typeof formData) => {
//       const response = await fetch('/api/event/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });
//       if (!response.ok) throw new Error('Failed to create event');
//       return response.json();
//     },
//     onSuccess: () => {
//       setIsOpen(false);
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     createEventMutation.mutate(formData);
//   };

//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (status === 'unauthenticated') {
//     return null;
//   }

//   return (

//       <Modal open={isOpen} onOpenChange={setIsOpen}>
//         <ModalTrigger>
//            <Button onClick={() => setIsOpen(true)} className="aspect-square max-sm:p-0 bg-yellow-500 dark:bg-blue-600 text-white">
//       <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
//       <span className="max-sm:sr-only">Add new</span>
//     </Button>
//         </ModalTrigger>

//         <ModalBody className="">
//           <ModalContent className=' min-w-lg max-w-xl px-0'>

//               <form onSubmit={handleSubmit} className="space-y-6 w-full min-w-full">
//                 <div className='w-full'>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Event Title *
//                   </label>
//                   <Input
//                     type="text"
//                     value={formData.title}
//                     onChange={(e) =>
//                       setFormData({ ...formData, title: e.target.value })
//                     }
//                     placeholder="e.g., 30 Minute Meeting"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Description
//                   </label>
//                   <Textarea
//                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows={3}
//                     value={formData.description}
//                     onChange={(e) =>
//                       setFormData({ ...formData, description: e.target.value })
//                     }
//                     placeholder="Brief description of the meeting"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Duration (minutes) *
//                   </label>
//                   <Input
//                     type="number"
//                     value={formData.duration}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         duration: parseInt(e.target.value),
//                       })
//                     }
//                     min="1"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Location Type *
//                   </label>
//                   <select
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={formData.locationType}
//                     onChange={(e) =>
//                       setFormData({ ...formData, locationType: e.target.value })
//                     }
//                     required
//                   >
//                     <option value="GOOGLE_MEET_AND_CALENDAR">
//                       Google Meet & Calendar
//                     </option>
//                     <option value="ZOOM_MEETING">Zoom Meeting</option>
//                   </select>
//                 </div>

//                 <Card>
//                   <CardContent value={formData.locationType}
//                     onChange={(e) =>
//                       setFormData({ ...formData, locationType: e.target.value })
//                     }>
//                     Google
//                   </CardContent>
//                 </Card>

//                 <div className="flex justify-end gap-4">
//                   <Button
//                     type="submit"
//                     disabled={createEventMutation.isPending}
//                     className=""
//                   >
//                     {createEventMutation.isPending
//                       ? 'Creating...'
//                       : 'Create'}
//                   </Button>

//                 </div>
//               </form>
//           </ModalContent>
//         </ModalBody>
//       </Modal>

//   );
// }

'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/animated-modal';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { CirclePlus } from '@/components/animate-ui/icons/circle-plus';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';

export default function CreateEvent({children}: {children: React.ReactNode}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    locationType: '',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

 
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/event/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.refresh();
      setIsOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    createEventMutation.mutate(formData);
  };

  const locationOptions = [
    {
      id: 'GOOGLE_MEET_AND_CALENDAR',
      label: 'Google',
      logo: 'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_18_2x.png',
    },
    // {
    //   id: 'ZOOM_MEETING',
    //   label: 'Zoom',
    //   logo: '/zoom-logo.png',
    // },
    {
      id: 'CONFERIO',
      label: 'Conferio',
      logo: '/logo-transparent.png',
    },
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalTrigger className="">
        {children}
      </ModalTrigger>
      <form onSubmit={handleSubmit}>
        <ModalBody className="!w-full !max-w-lg !px-0">
          <ModalContent className="space-y-5 !w-full !px-6 min-w-full">
            <div>
              <label htmlFor="event-create-title" className="block text-sm text-start font-medium text-gray-700 dark:text-[#B3B3B3] mb-2">
                Event Title *
              </label>
              <Input
                id="event-create-title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., 30 Minute Meeting"
                required
              />
            </div>

            <div>
              <label htmlFor="event-create-desc" className="block text-sm text-start font-medium text-gray-700 dark:text-[#B3B3B3] mb-2">
                Description
              </label>
              <Textarea
                id="event-create-desc"
              className='border dark:border-[#222]'
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the meeting"
              />
            </div>

            <div>
              <label htmlFor="event-create-duration" className="block text-sm text-start font-medium text-gray-700 dark:text-[#B3B3B3] mb-2">
                Duration (mins) *
              </label>
              <Input
                id="event-create-duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
                min="1"
                required
              />
            </div>

            {/* Location Type Cards */}
            <div>
              <div className="block text-start text-sm font-medium text-gray-700 dark:text-[#B3B3B3] mb-2">
                Location Type *
              </div>
              <div className="grid grid-cols-3 gap-4">
                {locationOptions.map((opt) => (
                  <Card
                    key={opt.id}
                    onClick={() =>
                      setFormData({ ...formData, locationType: opt.id })
                    }
                    className={`cursor-pointer bg-[#EEE] dark:bg-transparent transition-all ${
                      formData.locationType === opt.id
                        ? 'border border-blue-600 dark:border-blue-600 shadow-lg'
                        : 'border'
                    }`}
                  >
                    <CardContent className="flex bg-transparent flex-col items-center justify-center p-4 gap-y-2">
                      <Image
                        src={opt.logo}
                        alt={opt.label}
                        width={40}
                        height={40}
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Error if Google not verified */}
            {error && (
              <div className="text-red-600 text-sm mt-2">
                {error}{' '}
                <Link href="/settings" className="underline text-blue-600">
                  Go to settings
                </Link>
              </div>
            )}
          </ModalContent>
          <ModalFooter className="dark:bg-black mt-auto">
            <Button type="submit" variant='outline' className="dark:text-white dark:bg-[#333]" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalBody>
      </form>
    </Modal>
  );
}
