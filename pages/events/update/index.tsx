// // components/EditEvent.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Edit, X } from 'lucide-react';
// import {
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalFooter,
//   ModalTrigger,
// } from '@/components/ui/animated-modal';
// import { Textarea } from '@/components/ui/textarea';

// interface Event {
//   id: string;
//   title: string;
//   description: string | null;
//   duration: number;
//   locationType: string;
//   slug: string;
//   isPrivate: boolean;
// }

// interface EditEventProps {
//   event: Event;
// }

// export default function EditEvent({ event }: EditEventProps) {
//   const queryClient = useQueryClient();
//   const [isOpen, setIsOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     id: '',
//     title: '',
//     description: '',
//     duration: 30,
//     locationType: 'GOOGLE_MEET_AND_CALENDAR',
//   });

//   // Update form data when event changes or modal opens
//   useEffect(() => {
//     if (event) {
//       setFormData({
//         id: event.id,
//         title: event.title,
//         description: event.description || '',
//         duration: event.duration,
//         locationType: event.locationType,
//       });
//     }
//   }, [event, isOpen]);

//   const updateEventMutation = useMutation({
//     mutationFn: async (data: typeof formData) => {
//       const response = await fetch('/api/event/update', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update event');
//       }

//       return response.json();
//     },
//     onSuccess: () => {
//       // Invalidate and refetch events
//       queryClient.invalidateQueries({ queryKey: ['events'] });
//       setIsOpen(false);
//     },
//     onError: (error: Error) => {
//       console.error('Update error:', error);
//       // You might want to show a toast notification here
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     // Log the data being sent for debugging
//     console.log('Submitting form data:', formData);

//     updateEventMutation.mutate(formData);
//   };

//   return (
//     <Modal open>
//       <ModalTrigger >
//         <Button variant="outline" size="sm" >
//           <Edit className="size-4" />
//         </Button>
//       </ModalTrigger>

//       <ModalBody>
//         <ModalContent className="min-w-lg max-w-lg">

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <input type="hidden" value={formData.id} />

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Event Title *
//               </label>
//               <Input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) =>
//                   setFormData({ ...formData, title: e.target.value })
//                 }
//                 placeholder="e.g., 30 Minute Meeting"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Description
//               </label>
//               <Textarea
//                 className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 rows={3}
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 placeholder="Brief description of the meeting"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Duration (minutes) *
//               </label>
//               <Input
//                 type="number"
//                 value={formData.duration}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     duration: parseInt(e.target.value) || 30,
//                   })
//                 }
//                 min="1"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Location Type *
//               </label>
//               <select
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={formData.locationType}
//                 onChange={(e) =>
//                   setFormData({ ...formData, locationType: e.target.value })
//                 }
//                 required
//               >
//                 <option value="GOOGLE_MEET_AND_CALENDAR">
//                   Google Meet & Calendar
//                 </option>
//                 <option value="ZOOM_MEETING">Zoom Meeting</option>
//               </select>
//             </div>

//             <div className="flex gap-4">
//               <Button
//                 type="submit"
//                 disabled={updateEventMutation.isPending}
//                 className="flex-1"
//               >
//                 {updateEventMutation.isPending
//                   ? 'Updating...'
//                   : 'Update Event'}
//               </Button>
//               <Button 
//                 variant="outline" 
//                 type="button"
//                 onClick={() => setIsOpen(false)}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         </ModalContent>
//       </ModalBody>
//     </Modal>
//   );
// }

// components/EditEvent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/ui/animated-modal';
import { Textarea } from '@/components/ui/textarea';

interface Event {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  locationType: string;
  slug: string;
  isPrivate: boolean;
}

interface EditEventProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEvent({
  event,
  open,
  onOpenChange
}: EditEventProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    duration: 30,
    locationType: 'GOOGLE_MEET_AND_CALENDAR',
  });

  useEffect(() => {
    if (event && open) {
      setFormData({
        id: event.id,
        title: event.title,
        description: event.description || '',
        duration: event.duration,
        locationType: event.locationType,
      });
    }
  }, [event, open]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/event/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update event');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventMutation.mutate(formData);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}> <ModalBody>

        <ModalContent className="min-w-lg max-w-lg">

          <div className="space-y-6">
            <input type="hidden" value={formData.id} />

            <div>
              <label htmlFor="event-update-title" className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <Input
                id="event-update-title"
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
              <label htmlFor="event-update-desc" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                id="event-update-desc"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the meeting"
              />
            </div>

            <div>
              <label htmlFor="event-update-duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <Input
                id="event-update-duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 30,
                  })
                }
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="event-update-location" className="block text-sm font-medium text-gray-700 mb-2">
                Location Type *
              </label>
              <select
                id="event-update-location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.locationType}
                onChange={(e) =>
                  setFormData({ ...formData, locationType: e.target.value })
                }
                required
              >
                <option value="GOOGLE_MEET_AND_CALENDAR">
                  Google Meet & Calendar
                </option>
                <option value="ZOOM_MEETING">Zoom Meeting</option>
              </select>
            </div>


          </div>
        </ModalContent> <ModalFooter className="flex gap-4">
          <Button
            type="submit"
            disabled={updateEventMutation.isPending}
            className="flex-1"
          >
            {updateEventMutation.isPending
              ? 'Updating...'
              : 'Update Event'}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalBody> </form>
    </Modal>
  );
}