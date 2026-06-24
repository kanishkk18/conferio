export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string;
  category?: string;
  color?: string;
  guestName?: string;
  guestEmail?: string;
}

export interface MeetingType {
  id: string;
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  event: {
    title: string;
    description?: string;
  };
}

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  view: CalendarView;
  events: CalendarEvent[];
  isEventSheetOpen: boolean;
  selectedEvent: CalendarEvent | null;
}