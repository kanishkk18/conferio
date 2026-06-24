// // components/QuickSchedule.tsx
// import React, { useState, useEffect, cloneElement, isValidElement } from 'react'
// import { format, addMinutes } from 'date-fns'
// import { toast } from 'sonner'
// import { 
//   ChevronLeft, 
//   X, 
//   Calendar, 
//   Clock, 
//   Users, 
//   User,
//   Check,
//   Loader2
// } from 'lucide-react'

// // ── Types ───────────────────────────────────────────────────────────────

// interface Team {
//   id: string
//   name: string
//   slug: string
// }

// interface EventType {
//   id: string
//   title: string
//   description?: string
//   duration: number
//   slug: string
// }

// type ScheduleMode = 'team' | 'one-on-one'

// interface QuickScheduleProps {
//   children: React.ReactElement
//   onScheduled?: () => void
//   onClose?: () => void
//   defaultTeam?: Team
// }

// // ── Component ───────────────────────────────────────────────────────────

// export function QuickSchedule({ children, onScheduled, onClose, defaultTeam }: QuickScheduleProps) {
//   const [isOpen, setIsOpen] = useState(false)
//   const [step, setStep] = useState<'select-mode' | 'select-team' | 'select-event' | 'select-time' | 'confirm'>('select-mode')
  
//   const [teams, setTeams] = useState<Team[]>([])
//   const [selectedTeam, setSelectedTeam] = useState<Team | null>(defaultTeam || null)
//   const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('team')
  
//   const [events, setEvents] = useState<EventType[]>([])
//   const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date())
//   const [selectedTime, setSelectedTime] = useState<string | null>(null)
//   const [availability, setAvailability] = useState<any>(null)
//   const [description, setDescription] = useState('')
  
//   const [isLoading, setIsLoading] = useState(false)
//   const [isLoadingTeams, setIsLoadingTeams] = useState(false)
//   const [isLoadingEvents, setIsLoadingEvents] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   // Open modal
//   const openModal = () => {
//     setIsOpen(true)
//     setStep(defaultTeam ? 'select-mode' : 'select-team')
//     resetState()
//     if (!defaultTeam) fetchTeams()
//   }

//   // Reset state
//   const resetState = () => {
//     setSelectedEvent(null)
//     setSelectedTime(null)
//     setSelectedDate(new Date())
//     setDescription('')
//     setError(null)
//     setScheduleMode('team')
//     if (!defaultTeam) setSelectedTeam(null)
//   }

//   // Close modal
//   const closeModal = () => {
//     setIsOpen(false)
//     onClose?.()
//   }

//   // Fetch teams
//   const fetchTeams = async () => {
//     try {
//       setIsLoadingTeams(true)
//       const res = await fetch('/api/teams')
//       if (!res.ok) throw new Error('Failed to fetch teams')
//       const data = await res.json()
//       setTeams(data.data || data.teams || [])
//     } catch (err: any) {
//       setError(err.message || 'Failed to load teams')
//     } finally {
//       setIsLoadingTeams(false)
//     }
//   }

//   // Fetch event types
//   const fetchEvents = async () => {
//     try {
//       setIsLoadingEvents(true)
//       setError(null)
      
//       let response = await fetch('/api/event/all')
//       if (!response.ok) response = await fetch('/api/events')
//       if (!response.ok) throw new Error('Failed to fetch meeting types')
      
//       const data = await response.json()
//       const eventsList = data.events || data.data?.events || data || []
//       setEvents(eventsList)
      
//       if (eventsList.length === 0) {
//         setError('No meeting types found. Create one in your dashboard first.')
//       }
//     } catch (err: any) {
//       setError(err.message || 'Failed to load meeting types')
//     } finally {
//       setIsLoadingEvents(false)
//     }
//   }

//   // Fetch availability
//   useEffect(() => {
//     if (selectedEvent && selectedDate) {
//       fetchAvailability()
//     }
//   }, [selectedEvent, selectedDate])

//   const fetchAvailability = async () => {
//     if (!selectedEvent) return
//     try {
//       const res = await fetch(`/api/availability/public/${selectedEvent.id}`)
//       if (res.ok) {
//         const data = await res.json()
//         setAvailability(data)
//       }
//     } catch (error) {
//       console.error('Failed to fetch availability:', error)
//     }
//   }

//   const generateTimeSlots = () => {
//     if (!selectedDate || !availability?.data) return []
//     const dayName = format(selectedDate, 'EEEE').toUpperCase()
//     const dayAvailability = availability.data.find((d: any) => d.day === dayName)
//     return dayAvailability?.slots || []
//   }

//   const handleSchedule = async () => {
//     if (!selectedEvent || !selectedDate || !selectedTime || !selectedTeam) return
    
//     setIsLoading(true)
    
//     const startTime = new Date(selectedDate)
//     const [hours, minutes] = selectedTime.split(':').map(Number)
//     startTime.setHours(hours, minutes, 0, 0)
//     const endTime = addMinutes(startTime, selectedEvent.duration)
    
//     try {
//       const payload: any = {
//         eventId: selectedEvent.id,
//         startTime: startTime.toISOString(),
//         endTime: endTime.toISOString(),
//         title: `${selectedEvent.title} - ${selectedTeam.name}`,
//         description: description,
//         externalAttendees: []
//       }

//       if (scheduleMode === 'team') {
//         payload.teamId = selectedTeam.id
//         payload.selectedMemberIds = [] // Empty = all team members
//       } else {
//         // One-on-one: no teamId, no selected members
//         payload.teamId = undefined
//         payload.selectedMemberIds = []
//       }

//       const res = await fetch('/api/meetings/team/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       })
      
//       if (!res.ok) {
//         const error = await res.json()
//         throw new Error(error.message || 'Failed to schedule meeting')
//       }
      
//       const modeText = scheduleMode === 'team' ? `for ${selectedTeam.name}` : '(One-on-One)'
//       toast.success(`Meeting scheduled ${modeText}`)
//       onScheduled?.()
//       closeModal()
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to schedule meeting')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const timeSlots = generateTimeSlots()

//   // Clone child element and inject onClick
//   const triggerElement = isValidElement(children)
//     ? cloneElement(children as React.ReactElement<any>, {
//         onClick: (e: React.MouseEvent) => {
//           if (children.props.onClick) children.props.onClick(e)
//           openModal()
//         },
//       })
//     : children

//   if (!isOpen) return <>{triggerElement}</>

//   return (
//     <>
//       {triggerElement}
      
//       {/* Modal Overlay */}
//       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm !z-[9999] flex items-center justify-center p-4">
//         <div className="bg-[#0A0A0A] border border-neutral-800 text-white w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl">
          
//           {/* Header */}
//           <div className="flex items-center justify-between p-4 border-b border-neutral-800">
//             <div className="flex items-center gap-2">
//               {step !== 'select-mode' && step !== 'select-team' && (
//                 <button type="button"  
//                   className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-800 transition-colors"
//                   onClick={() => {
//                     if (step === 'select-event') setStep(defaultTeam ? 'select-mode' : 'select-team')
//                     else if (step === 'select-time') setStep('select-event')
//                     else if (step === 'confirm') setStep('select-time')
//                   }}
//                 >
//                   <ChevronLeft className="size-4" />
//                 </button>
//               )}
//               <h2 className="text-lg font-semibold">
//                 {step === 'select-mode' && 'Schedule Meeting'}
//                 {step === 'select-team' && 'Select Team'}
//                 {step === 'select-event' && 'Select Meeting Type'}
//                 {step === 'select-time' && 'Select Time'}
//                 {step === 'confirm' && 'Confirm Meeting'}
//               </h2>
//             </div>
//             <button type="button"  
//               onClick={closeModal} 
//               className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-800 transition-colors"
//             >
//               <X className="size-4" />
//             </button>
//           </div>

//           {/* Body */}
//           <div className="flex-1 overflow-y-auto p-4">
            
//             {/* Step 1: Select Mode (Team vs One-on-One) */}
//             {step === 'select-mode' && (
//               <div className="space-y-4">
//                 <p className="text-sm text-gray-400 mb-2">
//                   How would you like to schedule?
//                 </p>
                
//                 <div className="grid grid-cols-2 gap-3">
//                   <button type="button" 
//                     onClick={() => {
//                       setScheduleMode('team')
//                       setStep('select-event')
//                       fetchEvents()
//                     }}
//                     className={`p-4 rounded-xl border-2 transition-all text-left ${
//                       scheduleMode === 'team' 
//                         ? 'border-blue-500 bg-blue-500/10' 
//                         : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
//                     }`}
//                   >
//                     <Users className="size-8 mb-3 text-blue-400" />
//                     <h3 className="font-medium text-white">Team Meeting</h3>
//                     <p className="text-xs text-gray-400 mt-1">Schedule with entire team</p>
//                   </button>
                  
//                   <button type="button" 
//                     onClick={() => {
//                       setScheduleMode('one-on-one')
//                       setStep('select-event')
//                       fetchEvents()
//                     }}
//                     className={`p-4 rounded-xl border-2 transition-all text-left ${
//                       scheduleMode === 'one-on-one' 
//                         ? 'border-purple-500 bg-purple-500/10' 
//                         : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
//                     }`}
//                   >
//                     <User className="size-8 mb-3 text-purple-400" />
//                     <h3 className="font-medium text-white">One-on-One</h3>
//                     <p className="text-xs text-gray-400 mt-1">Personal meeting slot</p>
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 1b: Select Team (if no defaultTeam) */}
//             {step === 'select-team' && (
//               <div className="space-y-3">
//                 <p className="text-sm text-gray-400 mb-2">
//                   Select a team to schedule with
//                 </p>
                
//                 {isLoadingTeams ? (
//                   <div className="flex items-center justify-center py-8">
//                     <Loader2 className="size-8 animate-spin text-blue-500" />
//                   </div>
//                 ) : teams.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     <Users className="size-12 mx-auto mb-2 opacity-50" />
//                     <p>No teams available</p>
//                   </div>
//                 ) : (
//                   teams.map((team) => (
//                     <button type="button" 
//                       key={team.id}
//                       onClick={() => {
//                         setSelectedTeam(team)
//                         setStep('select-mode')
//                       }}
//                       className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
//                         selectedTeam?.id === team.id
//                           ? 'border-blue-500 bg-blue-500/10'
//                           : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
//                       }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
//                           {team.name.charAt(0).toUpperCase()}
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="font-medium text-white">{team.name}</h3>
//                           <p className="text-xs text-gray-400">@{team.slug}</p>
//                         </div>
//                         {selectedTeam?.id === team.id && (
//                           <Check className="size-5 text-blue-500" />
//                         )}
//                       </div>
//                     </button>
//                   ))
//                 )}
//               </div>
//             )}

//             {/* Step 2: Select Event */}
//             {step === 'select-event' && (
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-sm text-gray-400">
//                     {scheduleMode === 'team' 
//                       ? `Team: ${selectedTeam?.name}` 
//                       : 'One-on-One Meeting'}
//                   </p>
//                   <button type="button" 
//                     onClick={() => setStep('select-mode')}
//                     className="text-xs text-blue-400 hover:text-blue-300"
//                   >
//                     Change
//                   </button>
//                 </div>
                
//                 {isLoadingEvents ? (
//                   <div className="flex items-center justify-center py-8">
//                     <Loader2 className="size-8 animate-spin text-blue-500" />
//                   </div>
//                 ) : error ? (
//                   <div className="text-center py-8">
//                     <Calendar className="size-12 mx-auto mb-3 text-gray-600" />
//                     <p className="text-gray-400 mb-2">{error}</p>
//                     <button type="button"  
//                       onClick={() => window.open('/events', '_blank')}
//                       className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm transition-colors"
//                     >
//                       Create Event Type
//                     </button>
//                   </div>
//                 ) : events.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     <Calendar className="size-12 mx-auto mb-2 opacity-50" />
//                     <p>No meeting types available</p>
//                     <button type="button"  
//                       onClick={() => window.open('/events/new', '_blank')}
//                       className="mt-3 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm transition-colors"
//                     >
//                       Create New Event
//                     </button>
//                   </div>
//                 ) : (
//                   events.map((event) => (
//                     <button type="button" 
//                       key={event.id}
//                       onClick={() => {
//                         setSelectedEvent(event)
//                         setStep('select-time')
//                       }}
//                       className="w-full p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left transition-colors group"
//                     >
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
//                             {event.title}
//                           </h3>
//                           <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
//                             <Clock className="size-3" />
//                             {event.duration} minutes
//                           </p>
//                           {event.description && (
//                             <p className="text-xs text-gray-500 mt-1 line-clamp-1">
//                               {event.description}
//                             </p>
//                           )}
//                         </div>
//                         <div className="size-10 bg-blue-500/10 rounded-full flex items-center justify-center">
//                           <Calendar className="size-5 text-blue-500" />
//                         </div>
//                       </div>
//                     </button>
//                   ))
//                 )}
//               </div>
//             )}

//             {/* Step 3: Select Date & Time */}
//             {step === 'select-time' && selectedEvent && (
//               <div className="space-y-4">
//                 <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
//                   <div className="size-10 bg-blue-500 rounded-lg flex items-center justify-center">
//                     <Calendar className="size-5 text-white" />
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-medium">{selectedEvent.title}</p>
//                     <p className="text-sm text-gray-400">{selectedEvent.duration} minutes</p>
//                   </div>
//                   <button type="button"  
//                     onClick={() => setStep('select-event')}
//                     className="text-sm text-blue-400 hover:text-blue-300"
//                   >
//                     Change
//                   </button>
//                 </div>

//                 <div>
//                   <label className="text-sm text-gray-400 mb-2 block">Select Date</label>
//                   <input
//                     type="date"
//                     value={format(selectedDate, 'yyyy-MM-dd')}
//                     onChange={(e) => setSelectedDate(new Date(e.target.value))}
//                     min={format(new Date(), 'yyyy-MM-dd')}
//                     className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm text-gray-400 mb-2 block">
//                     Available Times for {format(selectedDate, 'EEEE, MMMM d')}
//                   </label>
//                   {timeSlots.length === 0 ? (
//                     <div className="text-center py-6 bg-neutral-900 rounded-lg border border-neutral-800">
//                       <p className="text-sm text-gray-500">No available slots for this date</p>
//                       <p className="text-xs text-gray-600 mt-1">Try selecting a different date</p>
//                     </div>
//                   ) : (
//                     <div className="grid grid-cols-3 gap-2">
//                       {timeSlots.map((time: string) => (
//                         <button type="button" 
//                           key={time}
//                           onClick={() => {
//                             setSelectedTime(time)
//                             setStep('confirm')
//                           }}
//                           className="p-2 rounded-lg text-sm font-medium transition-colors bg-neutral-800 text-gray-300 hover:bg-blue-600 hover:text-white"
//                         >
//                           {time}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Step 4: Confirm */}
//             {step === 'confirm' && selectedEvent && selectedTime && selectedTeam && (
//               <div className="space-y-4">
//                 <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
//                   <h3 className="font-medium mb-3 text-blue-400">Meeting Details</h3>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Mode:</span>
//                       <span className="font-medium">
//                         {scheduleMode === 'team' ? (
//                           <span className="flex items-center gap-1 text-blue-400">
//                             <Users className="size-3" /> Team
//                           </span>
//                         ) : (
//                           <span className="flex items-center gap-1 text-purple-400">
//                             <User className="size-3" /> One-on-One
//                           </span>
//                         )}
//                       </span>
//                     </div>
//                     {scheduleMode === 'team' && (
//                       <div className="flex justify-between">
//                         <span className="text-gray-400">Team:</span>
//                         <span className="font-medium">{selectedTeam.name}</span>
//                       </div>
//                     )}
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Type:</span>
//                       <span>{selectedEvent.title}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Duration:</span>
//                       <span>{selectedEvent.duration} minutes</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Date:</span>
//                       <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Time:</span>
//                       <span className="font-medium text-blue-400">{selectedTime}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="text-sm text-gray-400 mb-2 block">Description/Agenda (Optional)</label>
//                   <textarea
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     placeholder="Add meeting agenda or notes&hellip;"
//                     className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm min-h-[80px] resize-none focus:border-blue-500 focus:outline-none"
//                   />
//                 </div>

//                 <button type="button"  type="button"  
//                   onClick={handleSchedule}
//                   disabled={isLoading}
//                   className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed h-11 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
//                 >
//                   {isLoading ? (
//                     <>
//                       <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       Scheduling&hellip;
//                     </>
//                   ) : (
//                     'Confirm Meeting'
//                   )}
//                 </button>
                
//                 <button type="button"  type="button"  
//                   onClick={() => setStep('select-time')}
//                   className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
//                 >
//                   Back to Time Selection
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

// components/QuickSchedule.tsx
import React, { useState, useEffect, cloneElement, isValidElement } from 'react'
import { format, addMinutes } from 'date-fns'
import { toast } from 'sonner'
import { 
  ChevronLeft, 
  X, 
  Calendar, 
  Clock, 
  Users, 
  User,
  Check,
  Loader2,
  Mail,
  UserCircle
} from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────

interface Team {
  id: string
  name: string
  slug: string
}

interface EventType {
  id: string
  title: string
  description?: string
  duration: number
  slug: string
}

type ScheduleMode = 'team' | 'one-on-one'

interface QuickScheduleProps {
  children: React.ReactElement
  onScheduled?: () => void
  onClose?: () => void
  defaultTeam?: Team
}

interface OneOnOneForm {
  guestName: string
  guestEmail: string
  additionalInfo: string
}

// ── Component ───────────────────────────────────────────────────────────

export function QuickSchedule({ children, onScheduled, onClose, defaultTeam }: QuickScheduleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'select-mode' | 'select-team' | 'select-event' | 'select-time' | 'confirm'>('select-mode')
  
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(defaultTeam || null)
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('team')
  
  const [events, setEvents] = useState<EventType[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availability, setAvailability] = useState<any>(null)
  const [description, setDescription] = useState('')
  
  // One-on-one form state
  const [oneOnOneForm, setOneOnOneForm] = useState<OneOnOneForm>({
    guestName: '',
    guestEmail: '',
    additionalInfo: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Open modal
  const openModal = () => {
    setIsOpen(true)
    setStep(defaultTeam ? 'select-mode' : 'select-team')
    resetState()
    if (!defaultTeam) fetchTeams()
  }

  // Reset state
  const resetState = () => {
    setSelectedEvent(null)
    setSelectedTime(null)
    setSelectedDate(new Date())
    setDescription('')
    setError(null)
    setScheduleMode('team')
    setOneOnOneForm({ guestName: '', guestEmail: '', additionalInfo: '' })
    if (!defaultTeam) setSelectedTeam(null)
  }

  // Close modal
  const closeModal = () => {
    setIsOpen(false)
    onClose?.()
  }

  // Fetch teams
  const fetchTeams = async () => {
    try {
      setIsLoadingTeams(true)
      const res = await fetch('/api/teams')
      if (!res.ok) throw new Error('Failed to fetch teams')
      const data = await res.json()
      setTeams(data.data || data.teams || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load teams')
    } finally {
      setIsLoadingTeams(false)
    }
  }

  // Fetch event types
  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true)
      setError(null)
      
      let response = await fetch('/api/event/all')
      if (!response.ok) response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch meeting types')
      
      const data = await response.json()
      const eventsList = data.events || data.data?.events || data || []
      setEvents(eventsList)
      
      if (eventsList.length === 0) {
        setError('No meeting types found. Create one in your dashboard first.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load meeting types')
    } finally {
      setIsLoadingEvents(false)
    }
  }

  // Fetch availability
  useEffect(() => {
    if (selectedEvent && selectedDate) {
      fetchAvailability()
    }
  }, [selectedEvent, selectedDate])

  const fetchAvailability = async () => {
    if (!selectedEvent) return
    try {
      const res = await fetch(`/api/availability/public/${selectedEvent.id}`)
      if (res.ok) {
        const data = await res.json()
        setAvailability(data)
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error)
    }
  }

  const generateTimeSlots = () => {
    if (!selectedDate || !availability?.data) return []
    const dayName = format(selectedDate, 'EEEE').toUpperCase()
    const dayAvailability = availability.data.find((d: any) => d.day === dayName)
    return dayAvailability?.slots || []
  }

  const validateOneOnOneForm = (): boolean => {
    if (!oneOnOneForm.guestName.trim()) {
      toast.error('Guest name is required')
      return false
    }
    if (!oneOnOneForm.guestEmail.trim()) {
      toast.error('Guest email is required')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(oneOnOneForm.guestEmail)) {
      toast.error('Please enter a valid email address')
      return false
    }
    return true
  }

  const handleSchedule = async () => {
    if (!selectedEvent || !selectedDate || !selectedTime || !selectedTeam) return
    
    // Validate one-on-one form if in that mode
    if (scheduleMode === 'one-on-one' && !validateOneOnOneForm()) {
      return
    }
    
    setIsLoading(true)
    
    const startTime = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(':').map(Number)
    startTime.setHours(hours, minutes, 0, 0)
    const endTime = addMinutes(startTime, selectedEvent.duration)
    
    try {
      let res;
      
      if (scheduleMode === 'team') {
        // Team meeting API
        const payload = {
          eventId: selectedEvent.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          title: `${selectedEvent.title} - ${selectedTeam.name}`,
          description: description,
          teamId: selectedTeam.id,
          selectedMemberIds: [], // Empty = all team members
          externalAttendees: []
        }

        res = await fetch('/api/meetings/team/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        // One-on-one API (public meeting)
        const payload = {
          eventId: selectedEvent.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          guestName: oneOnOneForm.guestName,
          guestEmail: oneOnOneForm.guestEmail,
          additionalInfo: oneOnOneForm.additionalInfo || description
        }

        res = await fetch('/api/meeting/public/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to schedule meeting')
      }
      
      const modeText = scheduleMode === 'team' ? `for ${selectedTeam.name}` : `with ${oneOnOneForm.guestName}`
      toast.success(`Meeting scheduled ${modeText}`)
      onScheduled?.()
      closeModal()
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule meeting')
    } finally {
      setIsLoading(false)
    }
  }

  const timeSlots = generateTimeSlots()

  // Clone child element and inject onClick
  const triggerElement = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          if (children.props.onClick) children.props.onClick(e)
          openModal()
        },
      })
    : children

  if (!isOpen) return <>{triggerElement}</>

  return (
    <>
      {triggerElement}
      
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#0A0A0A] border border-neutral-800 text-white w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              {step !== 'select-mode' && step !== 'select-team' && (
                <button type="button"  
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-800 transition-colors"
                  onClick={() => {
                    if (step === 'select-event') setStep(defaultTeam ? 'select-mode' : 'select-team')
                    else if (step === 'select-time') setStep('select-event')
                    else if (step === 'confirm') setStep('select-time')
                  }}
                >
                  <ChevronLeft className="size-4" />
                </button>
              )}
              <h2 className="text-lg font-semibold">
                {step === 'select-mode' && 'Schedule Meeting'}
                {step === 'select-team' && 'Select Team'}
                {step === 'select-event' && 'Select Meeting Type'}
                {step === 'select-time' && 'Select Time'}
                {step === 'confirm' && 'Confirm Meeting'}
              </h2>
            </div>
            <button type="button"  
              onClick={closeModal} 
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            
            {/* Step 1: Select Mode (Team vs One-on-One) */}
            {step === 'select-mode' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-2">
                  How would you like to schedule?
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" 
                    onClick={() => {
                      setScheduleMode('team')
                      setStep('select-event')
                      fetchEvents()
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      scheduleMode === 'team' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <Users className="size-8 mb-3 text-blue-400" />
                    <h3 className="font-medium text-white">Team Meeting</h3>
                    <p className="text-xs text-gray-400 mt-1">Schedule with entire team</p>
                  </button>
                  
                  <button type="button" 
                    onClick={() => {
                      setScheduleMode('one-on-one')
                      setStep('select-event')
                      fetchEvents()
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      scheduleMode === 'one-on-one' 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <User className="size-8 mb-3 text-purple-400" />
                    <h3 className="font-medium text-white">One-on-One</h3>
                    <p className="text-xs text-gray-400 mt-1">Schedule with a guest</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1b: Select Team (if no defaultTeam) */}
            {step === 'select-team' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-2">
                  Select a team to schedule with
                </p>
                
                {isLoadingTeams ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-8 animate-spin text-blue-500" />
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="size-12 mx-auto mb-2 opacity-50" />
                    <p>No teams available</p>
                  </div>
                ) : (
                  teams.map((team) => (
                    <button type="button" 
                      key={team.id}
                      onClick={() => {
                        setSelectedTeam(team)
                        setStep('select-mode')
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedTeam?.id === team.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{team.name}</h3>
                          <p className="text-xs text-gray-400">@{team.slug}</p>
                        </div>
                        {selectedTeam?.id === team.id && (
                          <Check className="size-5 text-blue-500" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Step 2: Select Event */}
            {step === 'select-event' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">
                    {scheduleMode === 'team' 
                      ? `Team: ${selectedTeam?.name}` 
                      : 'One-on-One Meeting'}
                  </p>
                  <button type="button" 
                    onClick={() => setStep('select-mode')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Change
                  </button>
                </div>
                
                {isLoadingEvents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-8 animate-spin text-blue-500" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <Calendar className="size-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400 mb-2">{error}</p>
                    <button type="button"  
                      onClick={() => window.open('/events', '_blank')}
                      className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm transition-colors"
                    >
                      Create Event Type
                    </button>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="size-12 mx-auto mb-2 opacity-50" />
                    <p>No meeting types available</p>
                    <button type="button"  
                      onClick={() => window.open('/events/new', '_blank')}
                      className="mt-3 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm transition-colors"
                    >
                      Create New Event
                    </button>
                  </div>
                ) : (
                  events.map((event) => (
                    <button type="button" 
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event)
                        setStep('select-time')
                      }}
                      className="w-full p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="size-3" />
                            {event.duration} minutes
                          </p>
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="size-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <Calendar className="size-5 text-blue-500" />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Step 3: Select Date & Time */}
            {step === 'select-time' && selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="size-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{selectedEvent.title}</p>
                    <p className="text-sm text-gray-400">{selectedEvent.duration} minutes</p>
                  </div>
                  <button type="button"  
                    onClick={() => setStep('select-event')}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label htmlFor="quick-meeting-date" className="text-sm text-gray-400 mb-2 block">Select Date</label>
                  <input
                  aria-label="quick-meeting-date"
                    id="quick-meeting-date"
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Available Times for {format(selectedDate, 'EEEE, MMMM d')}
                  </label>
                  {timeSlots.length === 0 ? (
                    <div className="text-center py-6 bg-neutral-900 rounded-lg border border-neutral-800">
                      <p className="text-sm text-gray-500">No available slots for this date</p>
                      <p className="text-xs text-gray-600 mt-1">Try selecting a different date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time: string) => (
                        <button type="button" 
                          key={time}
                          onClick={() => {
                            setSelectedTime(time)
                            setStep('confirm')
                          }}
                          className="p-2 rounded-lg text-sm font-medium transition-colors bg-neutral-800 text-gray-300 hover:bg-blue-600 hover:text-white"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 'confirm' && selectedEvent && selectedTime && selectedTeam && (
              <div className="space-y-4">
                <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                  <h3 className="font-medium mb-3 text-blue-400">Meeting Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mode:</span>
                      <span className="font-medium">
                        {scheduleMode === 'team' ? (
                          <span className="flex items-center gap-1 text-blue-400">
                            <Users className="size-3" /> Team
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-purple-400">
                            <User className="size-3" /> One-on-One
                          </span>
                        )}
                      </span>
                    </div>
                    {scheduleMode === 'team' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Team:</span>
                        <span className="font-medium">{selectedTeam.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span>{selectedEvent.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span>{selectedEvent.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time:</span>
                      <span className="font-medium text-blue-400">{selectedTime}</span>
                    </div>
                  </div>
                </div>

                {/* One-on-One: Guest Name & Email Inputs */}
                {scheduleMode === 'one-on-one' && (
                  <div className="space-y-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <h4 className="text-sm font-medium text-purple-400 mb-2">Guest Information</h4>
                    
                    <div>
                      <label htmlFor="quick-meeting-guest-name" className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <UserCircle className="size-3" /> Guest Name *
                      </label>
                      <input
                      aria-label="quick-meeting-guest-name"
                        id="quick-meeting-guest-name"
                        type="text"
                        value={oneOnOneForm.guestName}
                        onChange={(e) => setOneOnOneForm(prev => ({ ...prev, guestName: e.target.value }))}
                        placeholder="Enter guest name"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="quick-meeting-guest-email" className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Mail className="size-3" /> Guest Email *
                      </label>
                      <input
                      aria-label="quick-meeting-guest-email"
                        id="quick-meeting-guest-email"
                        type="email"
                        value={oneOnOneForm.guestEmail}
                        onChange={(e) => setOneOnOneForm(prev => ({ ...prev, guestEmail: e.target.value }))}
                        placeholder="guest@example.com"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Description / Additional Info */}
                <div>
                  <label htmlFor="quick-meeting-desc" className="text-sm text-gray-400 mb-2 block">
                    {scheduleMode === 'one-on-one' ? 'Additional Info' : 'Description/Agenda'} (Optional)
                  </label>
                  <textarea
                  aria-label="quick-meeting-desc"
                    id="quick-meeting-desc"
                    value={scheduleMode === 'one-on-one' ? oneOnOneForm.additionalInfo : description}
                    onChange={(e) => {
                      if (scheduleMode === 'one-on-one') {
                        setOneOnOneForm(prev => ({ ...prev, additionalInfo: e.target.value }))
                      } else {
                        setDescription(e.target.value)
                      }
                    }}
                    placeholder={scheduleMode === 'one-on-one' ? "Any additional notes..." : "Add meeting agenda or notes..."}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm min-h-[80px] resize-none focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button type="button"  
                  onClick={handleSchedule}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed h-11 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Scheduling&hellip;
                    </>
                  ) : (
                    `Confirm ${scheduleMode === 'team' ? 'Team Meeting' : 'One-on-One'}`
                  )}
                </button>
                
                <button type="button"  
                  onClick={() => setStep('select-time')}
                  className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Back to Time Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
