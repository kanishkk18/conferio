// // components/TeamMeetingScheduler.tsx
// 'use client'

// import React, { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { useQuery, useMutation } from '@tanstack/react-query'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Calendar } from '@/components/ui/calendar'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Checkbox } from '@/components/ui/checkbox'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { Separator } from '@/components/ui/separator'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { format, addMinutes } from 'date-fns'
// import { 
//   Users, 
//   Clock, 
//   Calendar as CalendarIcon, 
//   X, 
//   Plus, 
//   Mail,
//   Check,
//   ChevronRight,
//   Loader2
// } from 'lucide-react'

// interface EventType {
//   id: string
//   title: string
//   description?: string
//   duration: number
//   locationType: string
// }

// interface TeamMember {
//   id: string
//   name: string
//   email: string
//   image?: string
//   role: string
// }

// interface Team {
//   id: string
//   name: string
//   slug: string
//   members: TeamMember[]
// }

// interface ExternalAttendee {
//   email: string
//   name: string
// }

// interface TeamMeetingSchedulerProps {
//   eventType: EventType
//   teamSlug: string // Current team context
// }

// export default function TeamMeetingScheduler({ 
//   eventType, 
//   teamSlug 
// }: TeamMeetingSchedulerProps) {
//   const router = useRouter()
//   const [step, setStep] = useState<'datetime' | 'attendees' | 'confirm'>('datetime')
  
//   // Date/Time selection
//   const [selectedDate, setSelectedDate] = useState<Date>()
//   const [selectedTime, setSelectedTime] = useState<string>()
  
//   // Attendee selection
//   const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
//   const [selectAllTeam, setSelectAllTeam] = useState(false)
//   const [externalAttendees, setExternalAttendees] = useState<ExternalAttendee[]>([])
//   const [newExternalEmail, setNewExternalEmail] = useState('')
//   const [newExternalName, setNewExternalName] = useState('')
  
//   // Meeting details
//   const [meetingDetails, setMeetingDetails] = useState({
//     title: eventType.title,
//     description: '',
//   })

//   // Fetch team members
//   const { data: teamData, isLoading: isLoadingTeam } = useQuery({
//     queryKey: ['team-members', teamSlug],
//     queryFn: async () => {
//       const res = await fetch(`/api/teams/${teamSlug}/members-for-selection`)
//       if (!res.ok) throw new Error('Failed to fetch team members')
//       return res.json()
//     },
//   })

//   // Create meeting mutation
//   const createMeetingMutation = useMutation({
//     mutationFn: async (data: any) => {
//       const res = await fetch('/api/meetings/team/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       })
//       if (!res.ok) throw new Error('Failed to create meeting')
//       return res.json()
//     },
//     onSuccess: (data) => {
//       router.push(`/meetings/${data.data.meeting.id}/success`)
//     },
//   })

//   const team: Team | null = teamData?.data

//   // Time slots generation
//   const timeSlots = [
//     '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
//     '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
//   ]

//   const handleSelectAllTeam = (checked: boolean) => {
//     setSelectAllTeam(checked)
//     if (checked && team) {
//       setSelectedMembers(new Set(team.members.map(m => m.id)))
//     } else {
//       setSelectedMembers(new Set())
//     }
//   }

//   const handleMemberToggle = (memberId: string) => {
//     const newSelected = new Set(selectedMembers)
//     if (newSelected.has(memberId)) {
//       newSelected.delete(memberId)
//       setSelectAllTeam(false)
//     } else {
//       newSelected.add(memberId)
//     }
//     setSelectedMembers(newSelected)
//   }

//   const addExternalAttendee = () => {
//     if (newExternalEmail && !externalAttendees.find(e => e.email === newExternalEmail)) {
//       setExternalAttendees([...externalAttendees, {
//         email: newExternalEmail,
//         name: newExternalName || newExternalEmail.split('@')[0],
//       }])
//       setNewExternalEmail('')
//       setNewExternalName('')
//     }
//   }

//   const removeExternalAttendee = (email: string) => {
//     setExternalAttendees(externalAttendees.filter(e => e.email !== email))
//   }

//   const handleSubmit = () => {
//     if (!selectedDate || !selectedTime || !team) return

//     const startTime = new Date(selectedDate)
//     const [hours, minutes] = selectedTime.split(':')
//     startTime.setHours(parseInt(hours), parseInt(minutes))
//     const endTime = addMinutes(startTime, eventType.duration)

//     createMeetingMutation.mutate({
//       eventId: eventType.id,
//       startTime: startTime.toISOString(),
//       endTime: endTime.toISOString(),
//       title: meetingDetails.title,
//       description: meetingDetails.description,
//       teamId: selectAllTeam ? team.id : undefined,
//       selectedMemberIds: Array.from(selectedMembers),
//       externalAttendees,
//     })
//   }

//   const totalAttendees = selectedMembers.size + externalAttendees.length

//   // Step 1: Date/Time Selection
//   if (step === 'datetime') {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <CalendarIcon className="size-5" />
//               Select Date & Time
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <Calendar
//                 mode="single"
//                 selected={selectedDate}
//                 onSelect={setSelectedDate}
//                 disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
//                 className="rounded-md border"
//               />
              
//               {selectedDate && (
//                 <div>
//                   <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
//                     <Clock className="size-4 />
//                     Available Times for {format(selectedDate, 'MMMM d, yyyy')}
//                   </h3>
//                   <div className="grid grid-cols-2 gap-2">
//                     {timeSlots.map((time) => (
//                       <Button
//                         key={time}
//                         variant={selectedTime === time ? "default" : "outline"}
//                         size="sm"
//                         onClick={() => setSelectedTime(time)}
//                       >
//                         {time}
//                       </Button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="mt-6 flex justify-end">
//               <Button
//                 onClick={() => setStep('attendees')}
//                 disabled={!selectedDate || !selectedTime}
//               >
//                 Next: Select Attendees
//                 <ChevronRight className="size-4ml-2" />
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   // Step 2: Attendee Selection
//   if (step === 'attendees') {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Users className="size-5" />
//               Select Attendees
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="team" className="w-full">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="team">Team Members</TabsTrigger>
//                 <TabsTrigger value="external">
//                   External Guests
//                   {externalAttendees.length > 0 && (
//                     <Badge variant="secondary" className="ml-2">
//                       {externalAttendees.length}
//                     </Badge>
//                   )}
//                 </TabsTrigger>
//               </TabsList>

//               <TabsContent value="team" className="mt-4">
//                 {isLoadingTeam ? (
//                   <div className="flex items-center justify-center py-8">
//                     <Loader2 className="size-6 animate-spin" />
//                   </div>
//                 ) : !team ? (
//                   <div className="text-center py-8 text-gray-500">
//                     No team found
//                   </div>
//                 ) : (
//                   <div className="gap-y-4">
//                     {/* Select All Option */}
//                     <div className="flex items-center gap-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                       <Checkbox
//                         id="select-all"
//                         checked={selectAllTeam}
//                         onCheckedChange={(checked) => handleSelectAllTeam(checked as boolean)}
//                       />
//                       <Label htmlFor="select-all" className="flex-1 cursor-pointer font-medium">
//                         Select All Team Members ({team.members.length} people)
//                       </Label>
//                       <Users className="size-5 text-blue-500" />
//                     </div>

//                     <Separator />

//                     {/* Individual Members */}
//                     <ScrollArea className="h-[300px]">
//                       <div className="gap-y-2">
//                         {team.members.map((member) => (
//                           <div
//                             key={member.id}
//                             className="flex items-center gap-x-3 p-3 rounded-lg hover:bg-gray-50 border"
//                           >
//                             <Checkbox
//                               id={member.id}
//                               checked={selectedMembers.has(member.id)}
//                               onCheckedChange={() => handleMemberToggle(member.id)}
//                             />
//                             <Avatar className="size-8">
//                               <AvatarImage src={member.image} />
//                               <AvatarFallback>
//                                 {member.name?.charAt(0) || member.email.charAt(0)}
//                               </AvatarFallback>
//                             </Avatar>
//                             <label
//                               htmlFor={member.id}
//                               className="flex-1 cursor-pointer"
//                             >
//                               <div className="font-medium">{member.name || 'Unnamed'}</div>
//                               <div className="text-sm text-gray-500">{member.email}</div>
//                             </label>
//                             <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
//                               {member.role}
//                             </Badge>
//                           </div>
//                         ))}
//                       </div>
//                     </ScrollArea>
//                   </div>
//                 )}
//               </TabsContent>

//               <TabsContent value="external" className="mt-4">
//                 <div className="gap-y-4">
//                   <div className="grid grid-cols-2 gap-2">
//                     <Input
//                       placeholder="Name (optional)"
//                       value={newExternalName}
//                       onChange={(e) => setNewExternalName(e.target.value)}
//                     />
//                     <div className="flex gap-2">
//                       <Input
//                         placeholder="email@example.com"
//                         type="email"
//                         value={newExternalEmail}
//                         onChange={(e) => setNewExternalEmail(e.target.value)}
//                         onKeyPress={(e) => e.key === 'Enter' && addExternalAttendee()}
//                       />
//                       <Button onClick={addExternalAttendee} size="icon">
//                         <Plus className="size-4 />
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="gap-y-2">
//                     {externalAttendees.map((attendee) => (
//                       <div
//                         key={attendee.email}
//                         className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                       >
//                         <div className="flex items-center gap-3">
//                           <Avatar className="size-8">
//                             <AvatarFallback>
//                               {attendee.name.charAt(0)}
//                             </AvatarFallback>
//                           </Avatar>
//                           <div>
//                             <div className="font-medium">{attendee.name}</div>
//                             <div className="text-sm text-gray-500">{attendee.email}</div>
//                           </div>
//                           <Badge variant="outline">External</Badge>
//                         </div>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => removeExternalAttendee(attendee.email)}
//                         >
//                           <X className="size-4 />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </TabsContent>
//             </Tabs>

//             {/* Selected Summary */}
//             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium">
//                   Total Attendees: {totalAttendees}
//                 </span>
//                 <div className="flex gap-2">
//                   {selectedMembers.size > 0 && (
//                     <Badge variant="secondary">
//                       <Users className="size-3 mr-1" />
//                       {selectedMembers.size} team
//                     </Badge>
//                   )}
//                   {externalAttendees.length > 0 && (
//                     <Badge variant="outline">
//                       <Mail className="size-3 mr-1" />
//                       {externalAttendees.length} external
//                     </Badge>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6 flex justify-between">
//               <Button variant="outline" onClick={() => setStep('datetime')}>
//                 Back
//               </Button>
//               <Button
//                 onClick={() => setStep('confirm')}
//                 disabled={totalAttendees === 0}
//               >
//                 Next: Confirm Details
//                 <ChevronRight className="size-4ml-2" />
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   // Step 3: Confirmation
//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Confirm Meeting Details</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {/* Meeting Title/Description */}
//           <div className="gap-y-2">
//             <Label>Meeting Title</Label>
//             <Input
//               value={meetingDetails.title}
//               onChange={(e) => setMeetingDetails(prev => ({ ...prev, title: e.target.value }))}
//             />
//           </div>
          
//           <div className="gap-y-2">
//             <Label>Description (Optional)</Label>
//             <Textarea
//               value={meetingDetails.description}
//               onChange={(e) => setMeetingDetails(prev => ({ ...prev, description: e.target.value }))}
//               placeholder="Add agenda or notes..."
//             />
//           </div>

//           {/* Date/Time Summary */}
//           <div className="p-4 bg-gray-50 rounded-lg gap-y-2">
//             <div className="flex items-center gap-2 text-sm">
//               <CalendarIcon className="size-4text-gray-500" />
//               <span className="font-medium">
//                 {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
//               </span>
//             </div>
//             <div className="flex items-center gap-2 text-sm">
//               <Clock className="size-4text-gray-500" />
//               <span>
//                 {selectedTime} - {selectedDate && selectedTime && 
//                   format(addMinutes(
//                     new Date(selectedDate.setHours(...selectedTime.split(':').map(Number))), 
//                     eventType.duration
//                   ), 'h:mm a')}
//               </span>
//               <Badge variant="secondary">{eventType.duration} min</Badge>
//             </div>
//           </div>

//           {/* Attendees Summary */}
//           <div>
//             <Label className="mb-2 block">Attendees ({totalAttendees})</Label>
//             <div className="gap-y-2 max-h-[200px] overflow-y-auto">
//               {Array.from(selectedMembers).map((memberId) => {
//                 const member = team?.members.find(m => m.id === memberId)
//                 if (!member) return null
//                 return (
//                   <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
//                     <Avatar className="size-6">
//                       <AvatarImage src={member.image} />
//                       <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
//                     </Avatar>
//                     <span className="text-sm">{member.name || member.email}</span>
//                     <Badge variant="secondary" className="text-xs">Team</Badge>
//                   </div>
//                 )
//               })}
//               {externalAttendees.map((attendee) => (
//                 <div key={attendee.email} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
//                   <Avatar className="size-6">
//                     <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
//                   </Avatar>
//                   <span className="text-sm">{attendee.name}</span>
//                   <Badge variant="outline" className="text-xs">External</Badge>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex justify-between pt-4">
//             <Button variant="outline" onClick={() => setStep('attendees')}>
//               Back
//             </Button>
//             <Button
//               onClick={handleSubmit}
//               disabled={createMeetingMutation.isPending}
//               className="min-w-[150px]"
//             >
//               {createMeetingMutation.isPending ? (
//                 <>
//                   <Loader2 className="size-4mr-2 animate-spin" />
//                   Scheduling...
//                 </>
//               ) : (
//                 <>
//                   <Check className="size-4mr-2" />
//                   Schedule Meeting
//                 </>
//               )}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
