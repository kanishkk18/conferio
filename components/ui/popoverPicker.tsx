// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverContent } from '@/components/ui/popover';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { PopoverTrigger } from '@radix-ui/react-popover';
// import { format } from 'date-fns';
// import { CalendarIcon } from 'lucide-react';

// export default function PopoverDatePicker() {
//   const today = new Date();
//   const [date, setDate] = useState<Date | undefined>(today);
//   const [time, setTime] = useState<string | undefined>('10:00');

//   // Mock time slots data
//   const timeSlots = [
//     { time: '09:00', available: true },
//     { time: '09:30', available: true },
//     { time: '10:00', available: true },
//     { time: '10:30', available: true },
//     { time: '11:00', available: true },
//     { time: '11:30', available: true },
//     { time: '12:00', available: true },
//     { time: '12:30', available: true },
//     { time: '13:00', available: true },
//     { time: '13:30', available: true },
//     { time: '14:00', available: true },
//     { time: '14:30', available: true },
//     { time: '15:00', available: true },
//     { time: '15:30', available: true },
//     { time: '16:00', available: true },
//     { time: '16:30', available: true },
//     { time: '17:00', available: true },
//     { time: '17:30', available: true },
//     { time: '18:00', available: true },
//     { time: '18:30', available: true },
//     { time: '19:00', available: true },
//     { time: '19:30', available: true },
//     { time: '20:00', available: true },
//     { time: '20:30', available: true },
//     { time: '21:00', available: true },
//     { time: '21:30', available: true },
//     { time: '22:00', available: true },
//     { time: '22:30', available: true },
//     { time: '23:00', available: true },
//     { time: '23:30', available: true },
//     { time: '24:00', available: true },
//   ];

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <div className="relative w-[180px] flex justify-start items-center">
//           <Button type="button" variant="outline" mode="input" placeholder={!date} className="w-full !p-0 overflow-hidden text-xs font-normal">
//             <CalendarIcon />
//             {date ? format(date, 'PPP') + (time ? ` - ${time}` : '') : <span>Pick a date</span>}
//           </Button>
//         </div>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0" align="start">
//         <div className="flex max-sm:flex-col">
//           <Calendar
//             mode="single"
//             selected={date}
//             onSelect={(newDate) => {
//               if (newDate) {
//                 setDate(newDate);
//                 setTime(undefined);
//               }
//             }}
//             className="p-2 sm:pe-5"
//             disabled={[{ before: today }]}
//           />
//           <div className="relative w-full max-sm:h-48 sm:w-40">
//             <div className="absolute inset-0 py-4 max-sm:border-t">
//               <ScrollArea className="h-full sm:border-s">
//                 <div className="gap-y-3">
//                   <div className="flex h-5 shrink-0 items-center px-5">
//                     <p className="text-sm font-medium">{date ? format(date, 'EEEE, d') : 'Pick a date'}</p>
//                   </div>
//                   <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
//                     {timeSlots.map(({ time: timeSlot, available }) => (
//                       <Button
//                         key={timeSlot}
//                         variant={time === timeSlot ? 'default' : 'outline'}
//                         size="sm"
//                         className="w-full"
//                         onClick={() => setTime(timeSlot)}
//                         disabled={!available}
//                       >
//                         {timeSlot}
//                       </Button>
//                     ))}
//                   </div>
//                 </div>
//               </ScrollArea>
//             </div>
//           </div>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// }

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import dayjs, { Dayjs } from 'dayjs';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimePickerProps {
  date: Dayjs | null;
  setDate: (value: Dayjs | null) => void;
}

export default function DateTime_Picker({ date, setDate }: DateTimePickerProps) {
  const today = new Date();
  const [time, setTime] = useState<string | undefined>('10:00');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
  ];

  const handleDateChange = (selectedDate: Date | null) => {
    setDate(selectedDate ? dayjs(selectedDate) : null);
  };

  const handleTimeSelect = (timeStr: string) => {
    if (!date) return;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const updated = dayjs(date).hour(hours).minute(minutes);
    setDate(updated);
    setTime(timeStr);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs"
        >
          <CalendarIcon className="mr-0.2 h-4 w-4" />
          {date ? format(date.toDate(), 'PPP') + (time ? ` - ${time}` : '') : 'Set date'}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-auto" align="start">
        <div className="flex max-sm:flex-col">
          {/* Calendar Date Picker */}
          <div className="p-2 sm:pe-4">
            <DatePicker
              inline
              selected={date?.toDate() || today}
              onChange={handleDateChange}
              minDate={today}
              calendarClassName="!border-none"
            />
          </div>

          {/* Scrollable Time Slots */}
          <div className="relative w-full max-sm:h-48 sm:w-40">
            <div className="absolute inset-0 py-4 max-sm:border-t">
              <ScrollArea className="h-full sm:border-l">
                <div className="gap-y-3">
                  <div className="flex h-5 shrink-0 items-center px-5">
                    <p className="text-sm font-medium">
                      {date ? format(date.toDate(), 'EEEE, d MMM') : 'Pick a date'}
                    </p>
                  </div>
                  <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        size="sm"
                        variant={time === slot ? 'default' : 'outline'}
                        onClick={() => handleTimeSelect(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
