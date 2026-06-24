// // components/TeamMeetingCard.tsx
// 'use client'

// import React, { useState } from 'react'
// import { format, isPast, isToday, differenceInMinutes } from 'date-fns'
// import { Card, CardContent } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from '@/components/ui/tooltip'
// import { Switch } from '@/components/ui/switch'
// import { AnimateIcon } from '@/components/animate-ui/icons/icon'
// import { ArrowRight, Users, Video, Calendar, Clock, User } from 'lucide-react'

// interface MeetingAttendee {
//   id: string
//   email: string
//   name?: string
//   image?: string
//   isExternal: boolean
//   status: string
//   user?: {
//     id: string
//     name: string
//     email: string
//     image?: string
//   }
// }

// interface Meeting {
//   id: string
//   title: string
//   description?: string
//   startTime: string
//   endTime: string
//   meetLink: string
//   status: string
//   isHost: boolean
//   myRsvpStatus: string | null
//   attendeeCount: number
//   isTeamMeeting: boolean
//   user: {
//     id: string
//     name: string
//     email: string
//     image?: string
//   }
//   meetingAttendees: MeetingAttendee[]
//   teamMeetingLink?: {
//     shareToken: string
//     team?: {
//       name: string
//     }
//   }
// }

// interface TeamMeetingCardProps {
//   meeting: Meeting
//   onCancel?: (id: string) => void
//   filter: string
// }

// export default function TeamMeetingCard({ meeting, onCancel, filter }: TeamMeetingCardProps) {
//   const [showAllAttendees, setShowAllAttendees] = useState(false)

//   const startTime = new Date(meeting.startTime)
//   const endTime = new Date(meeting.endTime)
//   const isUpcoming = !isPast(startTime) && meeting.status === 'SCHEDULED'
//   const isNow = isToday(startTime) && differenceInMinutes(startTime, new Date()) < 15 && differenceInMinutes(startTime, new Date()) > -15

//   const visibleAttendees = showAllAttendees 
//     ? meeting.meetingAttendees 
//     : meeting.meetingAttendees

//   return (
//     <Card className="hover:shadow-md transition-shadow">
//       <CardContent className="p-4">
//         <div className="flex items-start justify-between">
//           <div className="flex-1">
//             {/* Header */}
//             <div className="flex items-center gap-2 mb-2">
//               <h4 className="font-semibold text-lg">{meeting.title}</h4>
//               {meeting.isTeamMeeting && (
//                 <Badge variant="secondary" className="text-xs">
//                   <Users className="size-3 mr-1" />
//                   Team
//                 </Badge>
//               )}
//               {meeting.teamMeetingLink?.team && (
//                 <Badge variant="outline" className="text-xs">
//                   {meeting.teamMeetingLink.team.name}
//                 </Badge>
//               )}
//               {isNow && (
//                 <Badge className="bg-green-500 text-white text-xs animate-pulse">
//                   LIVE NOW
//                 </Badge>
//               )}
//             </div>

//             {/* Time */}
//             <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
//               <span className="flex items-center gap-1">
//                 <Clock className="size-4 />
//                 {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
//               </span>
//               <span className="flex items-center gap-1">
//                 <Calendar className="size-4 />
//                 {format(startTime, 'MMM d, yyyy')}
//               </span>
//               {meeting.isHost ? (
//                 <Badge variant="default" className="text-xs">Host</Badge>
//               ) : (
//                 <Badge variant="secondary" className="text-xs">Guest</Badge>
//               )}
//             </div>

//             {/* Attendees */}
//             <div className="flex items-center gap-2 mb-3">
//               <span className="text-xs text-gray-500">
//                 {meeting.attendeeCount} attendees:
//               </span>
//               <div className="flex -gap-x-2">
//                 {visibleAttendees.map((attendee, idx) => (
//                   <Tooltip key={attendee.id}>
//                     <TooltipTrigger>
//                       <Avatar className="size-6 border-2 border-white">
//                         <AvatarImage src={attendee.user?.image || attendee.image} />
//                         <AvatarFallback className="text-xs bg-gray-200">
//                           {(attendee.name || attendee.email).charAt(0)}
//                         </AvatarFallback>
//                       </Avatar>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>{attendee.name || attendee.email}</p>
//                       {attendee.isExternal && <span className="text-xs text-gray-400">External</span>}
//                     </TooltipContent>
//                   </Tooltip>
//                 ))}
//                 {meeting.meetingAttendees.length > 5 && !showAllAttendees && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="size-6 rounded-full p-0 text-xs"
//                     onClick={() => setShowAllAttendees(true)}
//                   >
//                     +{meeting.meetingAttendees.length - 5}
//                   </Button>
//                 )}
//               </div>
//             </div>

//             {/* My RSVP Status */}
//             {!meeting.isHost && meeting.myRsvpStatus && (
//               <Badge 
//                 variant={meeting.myRsvpStatus === 'accepted' ? 'default' : 'outline'}
//                 className="text-xs mb-2"
//               >
//                 You: {meeting.myRsvpStatus}
//               </Badge>
//             )}
//           </div>

//           {/* Actions */}
//           <div className="flex flex-col gap-2 ml-4">
//             {meeting.meetLink && isUpcoming && (
//               <Button
//                 size="sm"
//                 className="gap-2"
//                 onClick={() => window.open(meeting.meetLink, '_blank')}
//               >
//                 <Video className="size-4 />
//                 {isNow ? 'Join Now' : 'Join'}
//               </Button>
//             )}

//             {meeting.isHost && filter === 'UPCOMING' && (
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <div className="flex items-center gap-2 text-sm">
//                     <span className="text-xs text-gray-500">Cancel</span>
//                     <Switch
//                       checked={false}
//                       onCheckedChange={() => onCancel?.(meeting.id)}
//                     />
//                   </div>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>Cancel this meeting for all attendees</p>
//                 </TooltipContent>
//               </Tooltip>
//             )}

//             {/* Share Link for Team Meetings */}
//             {meeting.teamMeetingLink && meeting.isHost && (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   navigator.clipboard.writeText(
//                     `${window.location.origin}/meetings/join/${meeting.teamMeetingLink.shareToken}`
//                   )
//                 }}
//               >
//                 Copy Link
//               </Button>
//             )}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// components/TeamMeetingCard.tsx
'use client'

import React, { useState } from 'react'
import { format, isPast, isToday, differenceInMinutes } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Users, Loader2 } from 'lucide-react'
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';
import { Trash2 } from '@/components/animate-ui/icons/trash-2';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface MeetingAttendee {
  id: string
  email: string
  name?: string
  image?: string
  isExternal: boolean
  status: string
  user?: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface Meeting {
  id: string
  title?: string
  guestName: string
  guestEmail: string
  description?: string
  startTime: string
  endTime: string
  meetLink: string
  status: string
  isHost: boolean
  myRsvpStatus: string | null
  attendeeCount: number
  isTeamMeeting: boolean
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  meetingAttendees?: MeetingAttendee[]
  teamMeetingLink?: {
    shareToken: string
    team?: {
      name: string
    }
  }
  event?: {
    title: string
    duration: number
  }
}

interface TeamMeetingCardProps {
  meeting: Meeting
  onCancel?: (id: string) => void
  filter: string
}


export default function TeamMeetingCard({ meeting, onCancel, filter }: TeamMeetingCardProps) {
  const [showAllAttendees, setShowAllAttendees] = useState(false)
  const queryClient = useQueryClient();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const startTime = new Date(meeting.startTime)
  const isUpcoming = !isPast(startTime) && meeting.status === 'SCHEDULED'
  const isNow = isToday(startTime) && differenceInMinutes(startTime, new Date()) < 15 && differenceInMinutes(startTime, new Date()) > -15
  const [aiLoading, setAiLoading] = useState(false)

  // ❌ REMOVE THIS — causes the bug
  // const [aiEnabled, setAiEnabled] = useState(aiData?.enabled ?? false)

  // ✅ Use query data directly as source of truth
  const { data: aiData } = useQuery({
    queryKey: ['ai-notetaker', meeting.id],
    queryFn: async () => {
      const r = await fetch(`/api/meetings/${meeting.id}/ai-notetaker`)
      if (!r.ok) return { enabled: false }
      return r.json()
    },
  })

  // ✅ Derive enabled state from query, not local state
  const aiEnabled = aiData?.enabled ?? false

  const handleAiToggle = async (checked: boolean) => {
    setAiLoading(true)
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/ai-notetaker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: checked }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()

      // ✅ Update the query cache directly — this updates aiEnabled automatically
      queryClient.setQueryData(['ai-notetaker', meeting.id], data)

    } catch {
      // Revert is automatic since aiEnabled reads from cache
    } finally {
      setAiLoading(false)
    }
  }

  // Use meetingAttendees if available, otherwise create from guest info
  const attendees = meeting.meetingAttendees || [{
    id: 'guest',
    email: meeting.guestEmail,
    name: meeting.guestName,
    isExternal: !meeting.isTeamMeeting,
    status: 'pending'
  }]

  const x = useMotionValue(0);
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );

  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  const visibleAttendees = showAllAttendees
    ? attendees
    : attendees.slice(0, 5)

  const displayTitle = meeting.event?.title || meeting.title || 'Meeting'

  const trackJoinMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      await fetch('/api/meetings/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
    }
  });

  return (
    <TooltipProvider>
      <div className=" flex gap-x-2  w-full h-full justify-center">
        <div className="p-4 gap-y-4 flex-grow bg-[#F4F4F5] border dark:border-[#1D1D1D] dark:bg-[#111111] rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex justify-start mb-2 items-center gap-4">
                <h4 className="dark:text-[#EEE] font-semibold text-md">
                  {displayTitle}
                </h4>

                {meeting.isHost ? (
                  <Badge variant="outline" className="text-xs">Host</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Guest</Badge>
                )}</div>
              <p className="dark:text-gray-400 text-xs">
                {format(meeting.startTime, 'h:mm a')} -{' '}
                {format(meeting.endTime, 'h:mm a')} - {' '}
                {format(startTime, 'MMM d, yyyy')}
              </p>
            </div>

            <div className="flex justify-center items-center gap-2">

              {/* {filter === 'UPCOMING' && (
                <Tooltip>
                  <TooltipTrigger >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs font-semibold text-[#B4B4B4]">AI Notetaker</span>
                      <Switch
                      className='bg-gradient-to-tr from-[#3793FF] to-[#0017E4]'
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send AI Notetaker to this meeting</p>
                  </TooltipContent>
                </Tooltip>
              )} */}
              {filter === 'UPCOMING' && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs font-semibold text-[#B4B4B4]">AI Notetaker</span>
                      {aiLoading || aiData === undefined ? (
                        <Loader2 className="size-4 animate-spin text-[#3793FF]" />
                      ) : (
                        <Switch
                          checked={aiEnabled}
                          onCheckedChange={handleAiToggle}
                          disabled={aiLoading}
                          className="data-[state=checked]:bg-gradient-to-tr data-[state=checked]:from-[#3793FF] data-[state=checked]:to-[#0017E4]"
                        />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{aiEnabled ? 'AI will join at meeting time' : 'Send AI Notetaker'}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {meeting.isHost && filter === 'UPCOMING' && (
                <Tooltip>
                  <TooltipTrigger className="p-1 hover:text-[#EC7B7F] text-[#B4B4B4] hover:bg-red-500/30 rounded-full">
                    <AnimateIcon onClick={() => onCancel?.(meeting.id)} animateOnHover>
                      <Trash2 className="h-4 w-4 " />
                    </AnimateIcon>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancel this meeting</p>
                  </TooltipContent>
                </Tooltip>
              )}

            </div>

          </div>
          <div className="mt-4 flex justify-between">
            <div className="gap-2 flex flex-col justify-start items-start">
              <div className="flex justify-center items-center gap-2 mb-2">

                {meeting.isTeamMeeting && (
                  <Badge variant="secondary" className="text-xs">
                    <Users className="size-3 mr-1" />
                    Team
                  </Badge>
                )}
                {meeting.teamMeetingLink?.team && (
                  <Badge variant="outline" className="text-xs">
                    {meeting.teamMeetingLink.team.name}
                  </Badge>
                )}
                {isNow && (
                  <Badge className="bg-green-500 text-white text-xs animate-pulse">
                    LIVE NOW
                  </Badge>
                )}

                {!meeting.isHost && meeting.myRsvpStatus && (
                  <Badge
                    variant={meeting.myRsvpStatus === 'accepted' ? 'default' : 'outline'}
                    className="text-xs "
                  >
                    {meeting.myRsvpStatus}
                  </Badge>
                )}

              </div>

              <div className="flex flex-row items-center justify-start w-full">
                {attendees.length > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="flex -gap-x-2">
                      {visibleAttendees.map((attendee, idx) => (
                        <div
                          key={attendee.id || idx}
                          className="group relative -mr-1"
                          onMouseEnter={() => setHoveredIndex(attendee.id as any)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          <AnimatePresence mode="popLayout">
                            {hoveredIndex === (attendee.id as string) && (
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  y: 20,
                                  scale: 0.6,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  scale: 1,
                                  transition: {
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 10,
                                  },
                                }}
                                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                                style={{
                                  translateX: translateX,
                                  rotate: rotate,
                                  whiteSpace: 'nowrap',
                                }}
                                className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl"
                              >
                                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                                <div className="relative z-30 text-base font-bold text-white">
                                  {attendee.name || attendee.email}
                                </div>
                                <div className="text-xs text-white">
                                  {attendee.isExternal ? 'External Guest' : 'Team Member'}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {attendee.email}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <Avatar
                            className="size-8  cursor-pointer"
                            onMouseMove={handleMouseMove}
                          >
                            <AvatarImage src={attendee.user?.image || attendee.image || "https://i.pinimg.com/736x/46/67/f6/4667f65735ae83f8d12d74ef7e0ba982.jpg"} />
                            <AvatarFallback className="text-xs ">
                              {(attendee.name || attendee.email).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ))}
                      {attendees.length > 5 && !showAllAttendees && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 rounded-full p-0 text-xs bg-gradient-to-br from-[#3793FF] to-[#0017E4]"
                          onClick={() => setShowAllAttendees(true)}
                        >
                          +{attendees.length - 5}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center items-end gap-2">


              {/* 
                            
                            {meeting.teamMeetingLink && meeting.isHost && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/${meeting.teamMeetingLink?.shareToken}`
                  )
                }}
              >
                Copy Link
              </Button>
            )}*/}

              {meeting.meetLink && isUpcoming && (
                <Tooltip>
                  <TooltipTrigger className=" p-1.5 dark:bg-[#3149d1] bg-[#ffffff] hover:bg-[#5C48BC] rounded-full">
                    <div
                    >
                      <AnimateIcon onClick={() => {
                        trackJoinMutation.mutate(meeting.id);
                        window.open(meeting.meetLink, '_blank');
                      }} animateOnHover>
                        <ArrowRight className="h-5 font-bold text-[#8D8D8D] dark:text-white hover:text-white w-5 -rotate-45" />
                      </AnimateIcon>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-white">
                      click to join meeting{' '}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
