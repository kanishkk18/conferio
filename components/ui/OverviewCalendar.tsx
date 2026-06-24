// import React from 'react';
// import { cn } from '@/lib/utils';


// const Calendar: React.FC = () => {



//   // Time slots for the scheduler
//   const timeSlots = Array.from({ length: 12 }, (_, i) => {
//     const hour = i + 8; // Start from 8 AM
//     return `${hour.toString().padStart(2, '0')}:00`;
//   });

//   return (
//     <div className="pt-20">
    
     
    
//       <div className="flex flex-col space-y-4 mt-6">
//         {timeSlots.map((time, index) => (
//           <div key={time} className="flex">
//             <div className="w-12 text-xs text-gray-500">{time}</div>
//             <div className="flex-grow relative">
//               {/* Render events at specific times */}
//               {index === 2 && (
//                 <div className={`absolute left-2 right-4 purple-card p-2 rounded-lg`}>
//                   <div className="flex items-center">
//                     <div className="size-2 rounded-full bg-white mr-2"></div>
//                     <p className="text-xs font-medium">Design Meeting</p>
//                   </div>
//                   <p className="text-xs opacity-80 mt-0.5">10:30 AM - 11:30 AM</p>
//                 </div>
//               )}
//               {index === 5 && (
//                 <div className={`absolute left-2 right-4 green-card p-2 rounded-lg`}>
//                   <div className="flex items-center">
//                     <div className="size-2 rounded-full bg-white mr-2"></div>
//                     <p className="text-xs font-medium">Planning Work</p>
//                   </div>
//                   <p className="text-xs opacity-80 mt-0.5">1:30 PM - 3:15 PM</p>
//                 </div>
//               )}
//               {index === 9 && (
//                 <div className={`absolute left-2 right-4 yellow-card p-2 rounded-lg`}>
//                   <div className="flex items-center">
//                     <div className="size-2 rounded-full bg-black mr-2"></div>
//                     <p className="text-xs font-medium text-black">Daily Stand-Up</p>
//                   </div>
//                   <p className="text-xs text-black opacity-80 mt-0.5">5:30 PM - 6:00 PM</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Calendar;

// import * as React from "react"
// import {
//   ChevronDownIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
// } from "lucide-react"
// import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

// import { cn } from "@/lib/utils"
// import { Button, buttonVariants } from "./button"
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer"


// function Calendar({
//   className,
//   classNames,
//   showOutsideDays = true,
//   captionLayout = "label",
//   buttonVariant = "ghost",
//   formatters,
//   components,
//   ...props
// }: React.ComponentProps<typeof DayPicker> & {
//   buttonVariant?: React.ComponentProps<typeof Button>["variant"]
// }) {
//   const defaultClassNames = getDefaultClassNames()

//    const timeSlots = Array.from({ length: 12 }, (_, i) => {
//     const hour = i + 8; // Start from 8 AM
//     return `${hour.toString().padStart(2, '0')}:00`;
//   });


//   return (
//      <div className="pt-14 h-full w-fit overflow-hidden mx-auto  ">
//     <DayPicker
//       showOutsideDays={showOutsideDays}
//       className={cn(
//         "group/calendar p-1 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
//         String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
//         String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
//         className
//       )}
//       captionLayout={captionLayout}
//       formatters={{
//         formatMonthDropdown: (date) =>
//           date.toLocaleString("default", { month: "short" }),
//         ...formatters,
//       }}
//       classNames={{
//         root: cn("w-full", defaultClassNames.root),
//         months: cn(
//           "relative flex flex-col gap-2 md:flex-row",
//           defaultClassNames.months
//         ),
//         month: cn("flex w-full flex-col gap-2", defaultClassNames.month),
//         nav: cn(
//           "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
//           defaultClassNames.nav
//         ),
//         button_previous: cn(
//           buttonVariants({ variant: buttonVariant }),
//           "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
//           defaultClassNames.button_previous
//         ),
//         button_next: cn(
//           buttonVariants({ variant: buttonVariant }),
//           "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
//           defaultClassNames.button_next
//         ),
//         month_caption: cn(
//           "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
//           defaultClassNames.month_caption
//         ),
//         dropdowns: cn(
//           "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
//           defaultClassNames.dropdowns
//         ),
//         dropdown_root: cn(
//           "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
//           defaultClassNames.dropdown_root
//         ),
//         dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
//         caption_label: cn(
//           "select-none font-medium",
//           captionLayout === "label"
//             ? "text-sm"
//             : "[&>svg]:text-muted-foreground flex h-4 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
//           defaultClassNames.caption_label
//         ),
//         table: "w-full border-collapse",
//         weekdays: cn("flex", defaultClassNames.weekdays),
//         weekday: cn(
//           "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
//           defaultClassNames.weekday
//         ),
//         week: cn(" flex w-full", defaultClassNames.week),
//         week_number_header: cn(
//           "w-[--cell-size] select-none",
//           defaultClassNames.week_number_header
//         ),
//         week_number: cn(
//           "text-muted-foreground select-none text-[0.4rem]",
//           defaultClassNames.week_number
//         ),
//         day: cn(
//           "group/day relative aspect-square m-1 h-[60px] bg-[#F4F4F5] dark:bg-[#101012] w-[60px] select-none p-2 rounded-lg text-[12px] text-start [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-md",
//           defaultClassNames.day
//         ),
//         range_start: cn(
//           "bg-accent rounded-l-md",
//           defaultClassNames.range_start
//         ),
//         range_middle: cn("rounded-none", defaultClassNames.range_middle),
//         range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
//         today: cn(
//           "border-red-500 border text-accent-foreground rounded-md data-[selected=true]:rounded-none",
//           defaultClassNames.today
//         ),
//         outside: cn(
//           "text-muted-foreground aria-selected:text-muted-foreground",
//           defaultClassNames.outside
//         ),
//         disabled: cn(
//           "text-muted-foreground opacity-50",
//           defaultClassNames.disabled
//         ),
//         hidden: cn("invisible", defaultClassNames.hidden),
//         ...classNames,
//       }}
//       components={{
//         Root: ({ className, rootRef, ...props }) => {
//           return (
//             <div
//               data-slot="calendar"
//               ref={rootRef}
//               className={cn(className)}
//               {...props}
//             />
//           )
//         },
//         Chevron: ({ className, orientation, ...props }) => {
//           if (orientation === "left") {
//             return (
//               <ChevronLeftIcon className={cn("size-4", className)} {...props} />
//             )
//           }

//           if (orientation === "right") {
//             return (
//               <ChevronRightIcon
//                 className={cn("size-4", className)}
//                 {...props}
//               />
//             )
//           }

//           return (
//             <ChevronDownIcon className={cn("size-4", className)} {...props} />
//           )
//         },
//         DayButton: CalendarDayButton,
//         WeekNumber: ({ children, ...props }) => {
//           return (
//             <td {...props}>
//               <div className="flex size-[--cell-size] items-center justify-center text-center">
//                 {children}
//               </div>
//             </td>
//           )
//         },
//         ...components,
//       }}
//       {...props}
//     />

// <Drawer>
//   <DrawerTrigger className="h-56 mt-2 overflow-hidden md:w-[450px] lg:min-w-[495px]">
//     <div className="flex flex-col space-y-2">
//       <div className=" h-2 mt-2 z-50 w-[100px] rounded-full bg-muted mx-auto" />
//         {timeSlots.map((time, index) => (
//           <div key={time} className="flex">
//             <div className="w-12 text-xs text-gray-500">{time}</div>
//             <div className="flex-grow relative">
//               {/* Render events at specific times */}
//               {index === 2 && (
//                 <div className={`absolute left-2 right-4 purple-card p-2 rounded-lg`}>
//                   <div className="flex items-center">
//                     <div className="size-2 rounded-full bg-white mr-2"></div>
//                     <p className="text-xs font-medium">Design Meeting</p>
//                   </div>
//                   <p className="text-xs opacity-80 mt-0.5">10:30 AM - 11:30 AM</p>
//                 </div>
//               )}
//               {index === 5 && (
//                 <div className={`absolute left-2 right-4 green-card p-2 rounded-lg`}>
//                   <div className="flex items-center">
//                     <div className="size-2 rounded-full bg-white mr-2"></div>
//                     <p className="text-xs font-medium">Planning Work</p>
//                   </div>
//                   <p className="text-xs opacity-80 mt-0.5">1:30 PM - 3:15 PM</p>
//                 </div>
//               )}
//               {index === 9 && (
//                 <div className={`absolute left-2 right-4 yellow-card p-2 rounded-lg`}>
//                   <div className="flex items-center">
//                     <div className="size-2 rounded-full bg-black mr-2"></div>
//                     <p className="text-xs font-medium text-black">Daily Stand-Up</p>
//                   </div>
//                   <p className="text-xs text-black opacity-80 mt-0.5">5:30 PM - 6:00 PM</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//   </div></DrawerTrigger>
//   <DrawerContent className=" absolute bottom-0 right-[0%] z-50 h-auto bg-white dark:bg-black/80 w-[495px] rounded-t-[10px] p-2 border">
//      <div className="flex flex-col space-y-4 mt-3">
//         {timeSlots.map((time, index) => (
//           <div key={time} className="flex">
//             <div className="w-12 text-xs text-gray-500">{time}</div>
//             <div className="flex-grow relative">
//               {/* Render events at specific times */}
//               {index === 2 && (
//                 <div className={`absolute left-2 right-4 purple-card p-2 rounded-lg`}>
//                   <div className="flex items-center">
//                     <div className="size-2 rounded-full bg-white mr-2"></div>
//                     <p className="text-xs font-medium">Design Meeting</p>
//                   </div>
//                   <p className="text-xs opacity-80 mt-0.5">10:30 AM - 11:30 AM</p>
//                 </div>
//               )}
//               {index === 5 && (
//                 <div className={`absolute left-2 right-4 green-card p-2 rounded-lg`}>
//                   <div className="flex items-center">
//                     <div className="size-2 rounded-full bg-white mr-2"></div>
//                     <p className="text-xs font-medium">Planning Work</p>
//                   </div>
//                   <p className="text-xs opacity-80 mt-0.5">1:30 PM - 3:15 PM</p>
//                 </div>
//               )}
//               {index === 9 && (
//                 <div className={`absolute left-2 right-4 yellow-card p-2 rounded-lg`}>
//                   <div className="flex items-center">
//                     <div className="size-2 rounded-full bg-black mr-2"></div>
//                     <p className="text-xs font-medium text-black">Daily Stand-Up</p>
//                   </div>
//                   <p className="text-xs text-black opacity-80 mt-0.5">5:30 PM - 6:00 PM</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//    </div>
//   </DrawerContent>
// </Drawer>
  
//     </div>
//   )
// }

// function CalendarDayButton({
//   className,
//   day,
//   modifiers,
//   ...props
// }: React.ComponentProps<typeof DayButton>) {
//   const defaultClassNames = getDefaultClassNames()

//   const ref = React.useRef<HTMLButtonElement>(null)
//   React.useEffect(() => {
//     if (modifiers.focused) ref.current?.focus()
//   }, [modifiers.focused])

//   return (
//     <Button
//       ref={ref}
//       variant="ghost"
//       size="icon"
//       data-day={day.date.toLocaleDateString()}
//       data-selected-single={
//         modifiers.selected &&
//         !modifiers.range_start &&
//         !modifiers.range_end &&
//         !modifiers.range_middle
//       }
//       data-range-start={modifiers.range_start}
//       data-range-end={modifiers.range_end}
//       data-range-middle={modifiers.range_middle}
//       className={cn(
//         "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
//         defaultClassNames.day,
//         className
//       )}
//       {...props}
//     >
//       {day.date.getDate()}
//     </Button>
//   )
// }

// export { Calendar, CalendarDayButton }


import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "./button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "./scroll-area"
import CircularText from "./CircularTextLoader"
import { Loader } from "../loader"
import LazyLoader from "../loader/lazyloader"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())

  // Fetch meetings
  const { data: meetings, isLoading: meetingsLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const response = await fetch(`/api/meeting/user/all?filter=UPCOMING`)
      if (!response.ok) throw new Error('Failed to fetch meetings')
      return response.json()
    },
    enabled: !!session,
  })

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch("/api/task")
      if (!response.ok) throw new Error("Failed to fetch tasks")
      return response.json()
    },
    enabled: !!session,
  })

  // Get dates with meetings and tasks for calendar indicators
  const meetingDates = React.useMemo(() => {
    if (!meetings?.meetings) return []
    return meetings.meetings.map((meeting: any) => new Date(meeting.startTime))
  }, [meetings])

  const taskDates = React.useMemo(() => {
    if (!tasks) return []
    return tasks
      .filter((task: any) => !task.itsDone)
      .map((task: any) => new Date(task.createdAt))
  }, [tasks])

  // Get events for selected date
  const eventsForSelectedDate = React.useMemo(() => {
    if (!selectedDate) return { meetings: [], tasks: [] }
    
    const dayMeetings = meetings?.meetings?.filter((meeting: any) => {
      const meetingDate = new Date(meeting.startTime)
      return meetingDate.toDateString() === selectedDate.toDateString()
    }) || []
    
    const dayTasks = tasks?.filter((task: any) => {
      const taskDate = new Date(task.createdAt)
      return taskDate.toDateString() === selectedDate.toDateString() && !task.itsDone
    }) || []
    
    return { meetings: dayMeetings, tasks: dayTasks }
  }, [selectedDate, meetings, tasks])

  // Time slots for the scheduler
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 8 // Start from 8 AM
    return `${hour.toString().padStart(2, '0')}:00`
  })

  // Check if a date has events
  const hasEvents = (date: Date) => {
    const dateString = date.toDateString()
    return meetingDates.some(d => d.toDateString() === dateString) || 
           taskDates.some(d => d.toDateString() === dateString)
  }

  if (status === "loading" || meetingsLoading || tasksLoading) {
    return (
     <div className="h-screen flex items-center justify-center">
             <LazyLoader
        />
           </div>
    )
  }

  if (status === "unauthenticated") {
    router.push('/auth/login')
    return null
  }

  return (
    <div className=" !pt-8 min-h-full max-h-screen w-fit !overflow-y-hidden">
      <DayPicker
        showOutsideDays={showOutsideDays}
        selected={selectedDate}
        onSelect={setSelectedDate}
        className={cn(
          "group/calendar px-1 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
          className
        )}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("default", { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-full", defaultClassNames.root),
          months: cn(
            "relative flex flex-col gap-2 md:flex-row",
            defaultClassNames.months
          ),
          month: cn("flex w-full flex-col gap-2", defaultClassNames.month),
          nav: cn(
            "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: buttonVariant }),
            "h-[--cell-size] w-[--cell-size] bg-[#F4F4F5] dark:bg-[#101012] select-none p-0 ml-1 aria-disabled:opacity-50",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant }),
            "h-[--cell-size] w-[--cell-size] bg-[#F4F4F5] dark:bg-[#101012] select-none mr-4 p-0 aria-disabled:opacity-50",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
            defaultClassNames.month_caption
          ),
          dropdowns: cn(
            "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
            defaultClassNames.dropdowns
          ),
          dropdown_root: cn(
            "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
            defaultClassNames.dropdown_root
          ),
          dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
          caption_label: cn(
            "select-none font-medium",
            captionLayout === "label"
              ? "text-sm"
              : "[&>svg]:text-muted-foreground flex h-4 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
            defaultClassNames.caption_label
          ),
          table: "w-full border-collapse",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn(
            "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
            defaultClassNames.weekday
          ),
          week: cn(" flex w-full", defaultClassNames.week),
          week_number_header: cn(
            "w-[--cell-size] select-none",
            defaultClassNames.week_number_header
          ),
          week_number: cn(
            "text-muted-foreground select-none text-[0.4rem]",
            defaultClassNames.week_number
          ),
          day: cn(
            "group/day relative aspect-square m-1 h-[60px] bg-[#F4F4F5] dark:bg-[#101012] w-[60px] select-none p-2 rounded-lg text-[12px] text-start [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-md",
            defaultClassNames.day
          ),
          range_start: cn(
            "bg-accent rounded-l-md",
            defaultClassNames.range_start
          ),
          range_middle: cn("rounded-none", defaultClassNames.range_middle),
          range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
          today: cn(
            "border-blue-600 bg-gray-200 dark:bg-[#222] border text-accent-foreground rounded-lg data-[selected=true]:rounded-none",
            defaultClassNames.today
          ),
          outside: cn(
            "text-muted-foreground aria-selected:text-muted-foreground",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-muted-foreground opacity-50",
            defaultClassNames.disabled
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        modifiers={{
          hasEvent: (date) => hasEvents(date),
        }}
        modifiersClassNames={{
          hasEvent: "after:content-[''] after:block after:w-1 after:h-1 after:rounded-full after:bg-blue-500 after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2",
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return (
              <div
                data-slot="calendar"
                ref={rootRef}
                className={cn(className)}
                {...props}
              />
            )
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (
                <ChevronLeftIcon className={cn("size-4", className)} {...props} />
              )
            }

            if (orientation === "right") {
              return (
                <ChevronRightIcon
                  className={cn("size-4 mr-1", className)}
                  {...props}
                />
              )
            }

            return (
              <ChevronDownIcon className={cn("size-4", className)} {...props} />
            )
          },
          DayButton: CalendarDayButton,
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div className="flex size-[--cell-size] items-center justify-center text-center">
                  {children}
                </div>
              </td>
            )
          },
          ...components,
        }}
        {...props}
      />

      <Drawer>
        <DrawerTrigger className="min-h-32 max-h-36 mt-2 overflow-hidden md:w-[450px] lg:min-w-[495px]">
          <div className="flex flex-col gap-y-2">
            <div className="h-2 mt-2 z-50 w-[100px] rounded-full bg-muted mx-auto" />
            {timeSlots.map((time, index) => {
              // Find meetings that occur at this time slot
              const hour = parseInt(time.split(':')[0])
              const meetingAtThisTime = eventsForSelectedDate.meetings.find((meeting: any) => {
                const meetingHour = new Date(meeting.startTime).getHours()
                return meetingHour === hour
              })

              return (
                <div key={time} className="flex">
                  <div className="w-12 text-xs text-gray-500">{time}</div>
                  <div className="flex-grow relative">
                    {meetingAtThisTime && (
                      <div className={`absolute text-start left-2 right-4 purple-card p-2 rounded-lg`}>
                        <div className="flex items-center">
                          <div className="size-2 rounded-full bg-white mr-2"></div>
                          <p className="text-xs font-medium">{meetingAtThisTime.event.title}</p>
                        </div>
                        <p className="text-xs opacity-80 mt-0.5">
                          {format(new Date(meetingAtThisTime.startTime), 'h:mm a')} - {' '}
                          {format(new Date(meetingAtThisTime.endTime), 'h:mm a')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </DrawerTrigger>
        <DrawerContent className="absolute bottom-0 right-[0%] dark:border-[#333] overflow-hidden z-50 h-auto bg-white dark:bg-[#0d0d0d] w-[485px] rounded-t-[10px] p-2 border">
       <ScrollArea className="w-full overflow-y-auto h-80">
          <DrawerHeader>
            <DrawerTitle>Events for {selectedDate?.toLocaleDateString()}</DrawerTitle>
            <DrawerDescription>
              {eventsForSelectedDate.meetings.length} Meetings, {eventsForSelectedDate.tasks.length} Remindars
            </DrawerDescription>
          </DrawerHeader>
           {/* <div className="flex flex-col space-y-2">
            <div className="h-2 mt-2 z-50 w-[100px] rounded-full bg-muted mx-auto" />
            {timeSlots.map((time, index) => {
              // Find meetings that occur at this time slot
              const hour = parseInt(time.split(':')[0])
              const meetingAtThisTime = eventsForSelectedDate.meetings.find((meeting: any) => {
            const meetingHour = new Date(meeting.startTime).getHours()
              return meetingHour === hour
            })

            return (
              <div key={time} className="flex">
                <div className="w-12 text-xs text-gray-500">{time}</div>
              </div>
            )
          })}
          </div> */}
          <div className="px-4">
            {/* Display meetings */}
            {eventsForSelectedDate.meetings.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg mb-0">Meetings</h3>
                {eventsForSelectedDate.meetings.map((meeting: any) => (
                  <div key={meeting.id} className="mb-0 px-3 p-1 purple-card rounded-lg">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold">{meeting.event.title}</h4>
                      <Badge variant="secondary" className="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-100 mb-2">
                          {meeting.event.duration} min
                        </Badge>
                    </div>
                    <div className="flex items-center text-sm mt-0">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(new Date(meeting.startTime), 'h:mm a')} - {' '}
                      {format(new Date(meeting.endTime), 'h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Display tasks */}
            {eventsForSelectedDate.tasks.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg ">Remindars</h3>
                {eventsForSelectedDate.tasks.map((task: any) => (
                  <div key={task.id} className=" p-3 green-card rounded-lg">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold">{task.title}</h4>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-100 mb-2">
                          Pending
                        </Badge>
                    </div>
                    <div className="flex items-center text-sm mt-0">
                      <Clock className="h-4 w-4 mr-1" />
                      Due: {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {eventsForSelectedDate.meetings.length === 0 && eventsForSelectedDate.tasks.length === 0 && (
              <p className="text-center text-gray-500">No events for this day</p>
            )}
          </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      {day.date.getDate()}
    </Button>
  )
}

export { Calendar, CalendarDayButton }
