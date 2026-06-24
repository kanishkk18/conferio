'use client';

import { useState, useMemo, useEffect } from 'react';
// import { addDays, setHours, setMinutes, getDay } from "date-fns";
import { useCalendarContext } from '@/components/calendar/event-calendar/calendar-context';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  EventCalendar,
  type CalendarEvent,
  type EventColor,
} from '@/components/calendar/event-calendar';
import CircularText from '../ui/CircularTextLoader';

export const etiquettes = [
  {
    id: 'my-events',
    name: 'My Events',
    color: 'emerald' as EventColor,
    isActive: true,
  },
  {
    id: 'marketing-team',
    name: 'Marketing Team',
    color: 'orange' as EventColor,
    isActive: true,
  },
  {
    id: 'interviews',
    name: 'Interviews',
    color: 'violet' as EventColor,
    isActive: true,
  },
  {
    id: 'events-planning',
    name: 'Events Planning',
    color: 'blue' as EventColor,
    isActive: true,
  },
  {
    id: 'holidays',
    name: 'Holidays',
    color: 'rose' as EventColor,
    isActive: true,
  },
];

export default function Component() {
  const { data: session, status } = useSession();
  const { push } = useRouter()
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { isColorVisible } = useCalendarContext();

  useEffect(() => {
    if (status === 'unauthenticated') {
      push('/auth/login');
    }
  }, [status]);

  // Fetch meetings from API
  const {
    data: meetingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const response = await fetch('/api/meetings/my-meetings');
      if (!response.ok) throw new Error('Failed to fetch meetings');
      return response.json();
    },
    enabled: !!session,
  });

  // Map API data to CalendarEvent format
  useEffect(() => {
    if (meetingsData) {
      // Check if meetingsData is an array or has a meetings property
      const meetingsArray = Array.isArray(meetingsData)
        ? meetingsData
        : meetingsData.meetings || [];

      const mappedEvents: CalendarEvent[] = meetingsArray.map(
        (meeting: any) => ({
          id: meeting.id,
          title: meeting.event.title || 'Untitled Meeting',
          description: meeting.additionalInfo || undefined,
          start: new Date(meeting.startTime || meeting.start || meeting.date),
          end: new Date(meeting.endTime || meeting.end || meeting.date),
          color: (meeting.color as EventColor) || 'rose',
          location: meeting.event.locationType || undefined,
          allDay: meeting.allDay || false,
        })
      );
      setEvents(mappedEvents);
    }
  }, [meetingsData]);

  const cancelMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await fetch(`/api/meeting/cancel/${meetingId}`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to cancel meeting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });

  const handleEventAdd = (event: CalendarEvent) => {
    // Implement API call to create new meeting
    console.log('Add event not implemented');
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    // Implement API call to update meeting
    console.log('Update event not implemented');
  };

  const handleEventDelete = (eventId: string) => {
    cancelMeetingMutation.mutate(eventId);
  };

  const visibleEvents = useMemo(() => {
    return events.filter((event) => isColorVisible(event.color));
  }, [events, isColorVisible]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularText
          text="CONFERIO*CALLS*"
          onHover="speedUp"
          spinDuration={5}
          className="custom-class"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Error loading meetings: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <EventCalendar
      events={visibleEvents}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      initialView="week"
    />
  );
}

// // components/calendar/big-calendar.tsx
// 'use client';

// import { useState, useMemo, useEffect, useCallback } from 'react';
// import { useCalendarContext } from '@/components/calendar/event-calendar/calendar-context';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// import {
//   EventCalendar,
//   type CalendarEvent,
//   type EventColor,
// } from '@/components/calendar/event-calendar';
// import CircularText from '../ui/CircularTextLoader';
// import { HolidayToggle } from './holiday-toggle';
// import { type CountryCode } from './event-calendar/calendar-context';

// export const etiquettes = [
//   {
//     id: 'my-events',
//     name: 'My Events',
//     color: 'emerald' as EventColor,
//     isActive: true,
//   },
//   {
//     id: 'marketing-team',
//     name: 'Marketing Team',
//     color: 'orange' as EventColor,
//     isActive: true,
//   },
//   {
//     id: 'interviews',
//     name: 'Interviews',
//     color: 'violet' as EventColor,
//     isActive: true,
//   },
//   {
//     id: 'events-planning',
//     name: 'Events Planning',
//     color: 'blue' as EventColor,
//     isActive: true,
//   },
//   {
//     id: 'holidays',
//     name: 'Holidays',
//     color: 'rose' as EventColor,
//     isActive: true,
//   },
// ];

// interface NagerHoliday {
//   date: string;
//   localName: string;
//   name: string;
//   countryCode: string;
//   global: boolean;
//   types: string[];
// }

// // Fallback Indian holidays for 2025-2026 (used when API fails)
// const FALLBACK_INDIAN_HOLIDAYS: { date: string; localName: string; name: string }[] = [
//   { date: "2025-01-26", localName: "Republic Day", name: "Republic Day" },
//   { date: "2025-03-14", localName: "Holi", name: "Holi" },
//   { date: "2025-03-31", localName: "Idul Fitr", name: "Eid al-Fitr" },
//   { date: "2025-04-14", localName: "Dr. Ambedkar Jayanti", name: "Ambedkar Jayanti" },
//   { date: "2025-04-18", localName: "Good Friday", name: "Good Friday" },
//   { date: "2025-05-01", localName: "Labour Day", name: "Labour Day" },
//   { date: "2025-08-15", localName: "Independence Day", name: "Independence Day" },
//   { date: "2025-08-27", localName: "Ganesh Chaturthi", name: "Ganesh Chaturthi" },
//   { date: "2025-10-02", localName: "Gandhi Jayanti", name: "Gandhi Jayanti" },
//   { date: "2025-10-20", localName: "Diwali", name: "Diwali" },
//   { date: "2025-12-25", localName: "Christmas Day", name: "Christmas" },
//   { date: "2026-01-26", localName: "Republic Day", name: "Republic Day" },
//   { date: "2026-03-03", localName: "Holi", name: "Holi" },
//   { date: "2026-03-20", localName: "Idul Fitr", name: "Eid al-Fitr" },
//   { date: "2026-04-14", localName: "Dr. Ambedkar Jayanti", name: "Ambedkar Jayanti" },
//   { date: "2026-04-03", localName: "Good Friday", name: "Good Friday" },
//   { date: "2026-05-01", localName: "Labour Day", name: "Labour Day" },
//   { date: "2026-08-15", localName: "Independence Day", name: "Independence Day" },
//   { date: "2026-09-15", localName: "Ganesh Chaturthi", name: "Ganesh Chaturthi" },
//   { date: "2026-10-02", localName: "Gandhi Jayanti", name: "Gandhi Jayanti" },
//   { date: "2026-11-08", localName: "Diwali", name: "Diwali" },
//   { date: "2026-12-25", localName: "Christmas Day", name: "Christmas" },
// ];

// export default function BigCalendar() {
//   const { data: session, status } = useSession();
//   const { push } = useRouter();
//   const queryClient = useQueryClient();
//   const [events, setEvents] = useState<CalendarEvent[]>([]);
//   const { isColorVisible, showHolidays, holidayCountry, currentDate } = useCalendarContext();
//   const [holidays, setHolidays] = useState<CalendarEvent[]>([]);
//   const [holidaysLoading, setHolidaysLoading] = useState(false);
//   const [holidaysError, setHolidaysError] = useState<string | null>(null);

//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       push('/auth/login');
//     }
//   }, [status, push]);

//   // Fetch meetings from API
//   const {
//     data: meetingsData,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ['meetings'],
//     queryFn: async () => {
//       const response = await fetch('/api/meetings/my-meetings');
//       if (!response.ok) throw new Error('Failed to fetch meetings');
//       return response.json();
//     },
//     enabled: !!session,
//   });

//   // Map API data to CalendarEvent format
//   useEffect(() => {
//     if (meetingsData) {
//       const meetingsArray = Array.isArray(meetingsData)
//         ? meetingsData
//         : meetingsData.meetings || [];

//       const mappedEvents: CalendarEvent[] = meetingsArray.map(
//         (meeting: any) => ({
//           id: meeting.id,
//           title: meeting.event.title || 'Untitled Meeting',
//           description: meeting.additionalInfo || undefined,
//           start: new Date(meeting.startTime || meeting.start || meeting.date),
//           end: new Date(meeting.endTime || meeting.end || meeting.date),
//           color: (meeting.color as EventColor) || 'rose',
//           location: meeting.event.locationType || undefined,
//           allDay: meeting.allDay || false,
//         })
//       );
//       setEvents(mappedEvents);
//     }
//   }, [meetingsData]);

//   // Fetch public holidays when enabled
//   const fetchHolidays = useCallback(async (year: number, code: CountryCode) => {
//     setHolidaysLoading(true);
//     setHolidaysError(null);
    
//     try {
//       // Add timeout to fetch - abort after 5 seconds
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 5000);
      
//       const response = await fetch(
//         `https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`,
//         { signal: controller.signal }
//       );
      
//       clearTimeout(timeoutId);
      
//       if (!response.ok) {
//         throw new Error(`API returned ${response.status}`);
//       }
      
//       // Check if response has content
//       const contentType = response.headers.get('content-type');
//       if (!contentType || !contentType.includes('application/json')) {
//         throw new Error('Invalid response format');
//       }
      
//       const text = await response.text();
//       if (!text || text.trim() === '') {
//         throw new Error('Empty response from API');
//       }
      
//       let data: NagerHoliday[];
//       try {
//         data = JSON.parse(text);
//       } catch {
//         throw new Error('Invalid JSON from API');
//       }
      
//       if (!Array.isArray(data)) {
//         throw new Error('Unexpected API response format');
//       }
      
//       const mappedHolidays: CalendarEvent[] = data.map((holiday) => ({
//         id: `holiday-${holiday.date}-${holiday.name}`,
//         title: holiday.localName || holiday.name,
//         description: `Public Holiday - ${holiday.name}`,
//         start: new Date(holiday.date),
//         end: new Date(holiday.date),
//         color: 'rose' as EventColor,
//         allDay: true,
//         isHoliday: true,
//       }));
      
//       setHolidays(mappedHolidays);
//       setHolidaysError(null);
//     } catch (err) {
//       console.warn('Holiday API failed, using fallback:', err);
      
//       // Use fallback data for India
//       if (code === 'IN') {
//         const fallbackData = FALLBACK_INDIAN_HOLIDAYS.filter(h => {
//           const holidayYear = new Date(h.date).getFullYear();
//           return holidayYear === year;
//         });
        
//         const mappedHolidays: CalendarEvent[] = fallbackData.map((holiday) => ({
//           id: `holiday-${holiday.date}-${holiday.name}`,
//           title: holiday.localName,
//           description: `Public Holiday - ${holiday.name}`,
//           start: new Date(holiday.date),
//           end: new Date(holiday.date),
//           color: 'rose' as EventColor,
//           allDay: true,
//           isHoliday: true,
//         }));
        
//         setHolidays(mappedHolidays);
//         setHolidaysError('Using offline holiday data (API unavailable)');
//       } else {
//         setHolidays([]);
//         setHolidaysError('Failed to load holidays. Please try again later.');
//       }
//     } finally {
//       setHolidaysLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (showHolidays) {
//       fetchHolidays(currentDate.getFullYear(), holidayCountry);
//     } else {
//       setHolidays([]);
//       setHolidaysError(null);
//     }
//   }, [showHolidays, holidayCountry, currentDate.getFullYear(), fetchHolidays]);

//   // Merge holidays with regular events
//   const allEvents = useMemo(() => {
//     if (!showHolidays) return events;
//     return [...events, ...holidays];
//   }, [events, holidays, showHolidays]);

//   const cancelMeetingMutation = useMutation({
//     mutationFn: async (meetingId: string) => {
//       const response = await fetch(`/api/meeting/cancel/${meetingId}`, {
//         method: 'PUT',
//       });
//       if (!response.ok) throw new Error('Failed to cancel meeting');
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['meetings'] });
//     },
//   });

//   const handleEventAdd = (event: CalendarEvent) => {
//     console.log('Add event not implemented');
//   };

//   const handleEventUpdate = (updatedEvent: CalendarEvent) => {
//     console.log('Update event not implemented');
//   };

//   const handleEventDelete = (eventId: string) => {
//     if (eventId.startsWith('holiday-')) return;
//     cancelMeetingMutation.mutate(eventId);
//   };

//   const visibleEvents = useMemo(() => {
//     return allEvents.filter((event) => isColorVisible(event.color));
//   }, [allEvents, isColorVisible]);

//   if (status === 'loading' || isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <CircularText
//           text="CONFERIO*CALLS*"
//           onHover="speedUp"
//           spinDuration={5}
//           className="custom-class"
//         />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-red-500">
//           Error loading meetings: {(error as Error).message}
//         </div>
//       </div>
//     );
//   }

//   if (status === 'unauthenticated') {
//     return null;
//   }

//   return (
//     <div className="flex h-full gap-4">
//       {/* <div className="w-64 flex-shrink-0 space-y-4">
//         <HolidayToggle 
//           isLoading={holidaysLoading} 
//           error={holidaysError}
//         />
//       </div> */}
      
//       <div className="flex-1">
//         <EventCalendar
//           events={visibleEvents}
//           onEventAdd={handleEventAdd}
//           onEventUpdate={handleEventUpdate}
//           onEventDelete={handleEventDelete}
//           initialView="week"
//         />
//       </div>
//     </div>
//   );
// }