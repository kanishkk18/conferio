// 'use client'

// import { useQuery, useMutation } from '@tanstack/react-query'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Clock, Calendar1, ArrowLeft, Check } from 'lucide-react'
// import Link from 'next/link'
// import { useParams } from 'next/navigation'
// import { format, addDays } from 'date-fns'
// import { useState, useEffect } from "react"
// import { Calendar } from "@/components/ui/calendar"
// import { ScrollArea } from "@/components/ui/scroll-area"

// export default function BookingPage() {
//   const params = useParams()
//   const username = params.username as string
//   const slug = params.slug as string

//   const today = new Date()
//   const [date, setDate] = useState<Date>(today)
//   const [time, setTime] = useState<string | null>(null)
//   const [step, setStep] = useState<'select-time' | 'book-meeting' | 'confirmed'>('select-time')
//   const [formData, setFormData] = useState({
//     guestName: '',
//     guestEmail: '',
//     additionalInfo: '',
//   })

//   // Effects to keep selectedDate and selectedTime in sync with date and time states
//   useEffect(() => {
//     if (date && time) {
//       setStep('book-meeting')
//     }
//   }, [date, time])

//   const { data: event, isLoading } = useQuery({
//     queryKey: ['public-event', username, slug],
//     queryFn: async () => {
//       const response = await fetch(`/api/event/public/${username}/${slug}`)
//       if (!response.ok) throw new Error('Failed to fetch event')
//       return response.json()
//     },
//   })

//   const { data: availability } = useQuery({
//     queryKey: ['availability', event?.event?.id],
//     queryFn: async () => {
//       const response = await fetch(`/api/availability/public/${event.event.id}`)
//       if (!response.ok) throw new Error('Failed to fetch availability')
//       return response.json()
//     },
//     enabled: !!event?.event?.id,
//   })

//   const bookMeetingMutation = useMutation({
//     mutationFn: async (bookingData: any) => {
//       const response = await fetch('/api/meeting/public/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(bookingData),
//       })
//       if (!response.ok) throw new Error('Failed to book meeting')
//       return response.json()
//     },
//     onSuccess: () => {
//       setStep('confirmed')
//     },
//   })

//   const handleBookMeeting = (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!date || !time) return

//     const startTime = new Date(date)
//     const [hours, minutes] = time.split(':').map(Number)
//     startTime.setHours(hours, minutes, 0, 0)

//     const endTime = new Date(startTime.getTime() + event.event.duration * 60000)

//     bookMeetingMutation.mutate({
//       eventId: event.event.id,
//       startTime: startTime.toISOString(),
//       endTime: endTime.toISOString(),
//       guestName: formData.guestName,
//       guestEmail: formData.guestEmail,
//       additionalInfo: formData.additionalInfo,
//     })
//   }

//   // Generate time slots based on availability data
//   const generateTimeSlots = () => {
//     if (!date || !availability?.data) return []

//     const selectedDateObj = date
//     const dayName = format(selectedDateObj, 'EEEE').toUpperCase()
//     const dayAvailability = availability.data.find((d: any) => d.day === dayName)

//     if (!dayAvailability?.slots) return []

//     return dayAvailability.slots.map((timeSlot: string) => ({
//       time: timeSlot,
//       available: true
//     }))
//   }

//   const timeSlots = generateTimeSlots()

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     )
//   }

//   if (!event?.event) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
//           <p className="text-gray-600">The event you're looking for doesn't exist.</p>
//         </div>
//       </div>
//     )
//   }

//   if (step === 'confirmed') {
//     const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : ''
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <div className=" size-16  bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Check className="size-8 text-green-600" />
//             </div>
//             <CardTitle className="text-2xl text-green-600">Meeting Booked!</CardTitle>
//             <CardDescription>
//               Your meeting has been successfully scheduled
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="text-center space-y-4">
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-medium text-gray-900 mb-2">{event.event.title}</h3>
//               <p className="text-sm text-gray-600">
//                 {date && time && format(new Date(`${format(date, 'yyyy-MM-dd')}T${time}`), 'PPP p')}
//               </p>
//               <p className="text-sm text-gray-600">
//                 Duration: {event.event.duration} minutes
//               </p>
//             </div>
//             <p className="text-sm text-gray-600">
//               A confirmation email with meeting details has been sent to {formData.guestEmail}
//             </p>
//             <Link href={`/${username}`}>
//               <Button variant="outline" className="w-full">
//                 Back to Profile
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen h-screen bg-blue-500 flex justify-center items-center">


//         <div className="w-9xl bg-red-500 mx-auto">
//           {step === 'select-time' && (
//             <div className="w-full bg-green-500">

//                   <div className="rounded-md flex border">
//                     <div className="space-y-4">
//                     <div className="flex items-center gap-3">
//                       {event.event.user.imageUrl && (
//                         <img
//                           src={event.event.user.imageUrl}
//                           alt={event.event.user.name}
//                           className=" size-12  rounded-full"
//                         />
//                       )}
//                       <div>
//                         <h3 className="font-medium">{event.event.user.name}</h3>
//                         <p className="text-sm text-gray-600">{event.event.title}</p>
//                       </div>
//                     </div>

//                     {event.event.description && (
//                       <p className="text-gray-600">{event.event.description}</p>
//                     )}

//                     <div className="space-y-2 text-sm">
//                       <div className="flex items-center gap-2">
//                         <Clock className="size-4" />
//                         <span>{event.event.duration} minutes</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Calendar1 className="size-4" />
//                         <span>{event.event.locationType.replace('_', ' ')}</span>
//                       </div>
//                     </div>
//                   </div>
//                     <div className="flex max-sm:flex-col">
//                       <Calendar
//                         mode="single"
//                         selected={date}
//                         onSelect={(newDate) => {
//                           if (newDate) {
//                             setDate(newDate)
//                             setTime(null)
//                           }
//                         }}
//                         className="p-2 sm:pe-5"
//                         disabled={[
//                           { before: today }, // Dates before today
//                         ]}
//                       />
//                       <div className="relative w-full max-sm:h-48 sm:w-40">
//                         <div className="absolute inset-0 py-4 max-sm:border-t">
//                           <ScrollArea className="h-full sm:border-s">
//                             <div className="space-y-3">
//                               <div className="flex h-5 shrink-0 items-center px-5">
//                                 <p className="text-sm font-medium">
//                                   {format(date, "EEEE, d")}
//                                 </p>
//                               </div>
//                               <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
//                                 {timeSlots.map(({ time: timeSlot, available }) => (
//                                   <Button
//                                     key={timeSlot}
//                                     variant={time === timeSlot ? "default" : "outline"}
//                                     size="sm"
//                                     className="w-full"
//                                     onClick={() => setTime(timeSlot)}
//                                     disabled={!available}
//                                   >
//                                     {timeSlot}
//                                   </Button>
//                                 ))}
//                               </div>
//                             </div>
//                           </ScrollArea>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {date && time && (
//                     <Button 
//                       onClick={() => setStep('book-meeting')}
//                       className="w-full mt-4"
//                     >
//                       Continue
//                     </Button>
//                   )}


//             </div>
//           )}

//           {step === 'book-meeting' && (
//             <Card className="max-w-2xl mx-auto">
//               <CardHeader>
//                 <CardTitle>Enter Your Details</CardTitle>
//                 <CardDescription>
//                   Please provide your information to complete the booking
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="bg-blue-50 p-4 rounded-lg mb-6">
//                   <h3 className="font-medium text-blue-900 mb-2">Selected Time</h3>
//                   <p className="text-blue-800">
//                     {date && time && format(new Date(`${format(date, 'yyyy-MM-dd')}T${time}`), 'PPP p')}
//                   </p>
//                   <p className="text-sm text-blue-700">
//                     {event.event.title} • {event.event.duration} minutes
//                   </p>
//                 </div>

//                 <form onSubmit={handleBookMeeting} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Your Name *
//                     </label>
//                     <Input
//                       type="text"
//                       value={formData.guestName}
//                       onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email Address *
//                     </label>
//                     <Input
//                       type="email"
//                       value={formData.guestEmail}
//                       onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Additional Information (Optional)
//                     </label>
//                     <textarea
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       rows={3}
//                       value={formData.additionalInfo}
//                       onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
//                       placeholder="Any additional details or questions..."
//                     />
//                   </div>

//                   <div className="flex gap-4">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => setStep('select-time')}
//                       className="flex-1"
//                     >
//                       Back
//                     </Button>
//                     <Button
//                       type="submit"
//                       disabled={bookMeetingMutation.isPending}
//                       className="flex-1"
//                     >
//                       {bookMeetingMutation.isPending ? 'Booking...' : 'Book Meeting'}
//                     </Button>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>
//           )}

//       </div>
//     </div>
//   )
// }

// 'use client'

// import { useQuery, useMutation } from '@tanstack/react-query'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Clock, Calendar1, ArrowLeft, Check } from 'lucide-react'
// import Link from 'next/link'
// import { useParams } from 'next/navigation'
// import { format, addDays, startOfWeek } from 'date-fns'
// import { useState } from "react"
// import { Calendar } from "@/components/ui/calendar"
// import { ScrollArea } from "@/components/ui/scroll-area"

// export default function BookingPage() {
//   const params = useParams()
//   const username = params.username as string
//   const slug = params.slug as string

//   const [selectedDate, setSelectedDate] = useState<string>('')
//   const [selectedTime, setSelectedTime] = useState<string>('')
//   const [step, setStep] = useState<'select-time' | 'book-meeting' | 'confirmed'>('select-time')
//   const [formData, setFormData] = useState({
//     guestName: '',
//     guestEmail: '',
//     additionalInfo: '',
//   })
//    const today = new Date()
//   const [date, setDate] = useState<Date>(today)
//   const [time, setTime] = useState<string | null>(null)

//   // Mock time slots data
//   const timeSlots = [
//     { time: "09:00", available: false },
//     { time: "09:30", available: false },
//     { time: "10:00", available: true },
//     { time: "10:30", available: true },
//     { time: "11:00", available: true },
//     { time: "11:30", available: true },
//     { time: "12:00", available: false },
//     { time: "12:30", available: true },
//     { time: "13:00", available: true },
//     { time: "13:30", available: true },
//     { time: "14:00", available: true },
//     { time: "14:30", available: false },
//     { time: "15:00", available: false },
//     { time: "15:30", available: true },
//     { time: "16:00", available: true },
//     { time: "16:30", available: true },
//     { time: "17:00", available: true },
//     { time: "17:30", available: true },
//   ]


//   const { data: event, isLoading } = useQuery({
//     queryKey: ['public-event', username, slug],
//     queryFn: async () => {
//       const response = await fetch(`/api/event/public/${username}/${slug}`)
//       if (!response.ok) throw new Error('Failed to fetch event')
//       return response.json()
//     },
//   })

//   const { data: availability } = useQuery({
//     queryKey: ['availability', event?.event?.id],
//     queryFn: async () => {
//       const response = await fetch(`/api/availability/public/${event.event.id}`)
//       if (!response.ok) throw new Error('Failed to fetch availability')
//       return response.json()
//     },
//     enabled: !!event?.event?.id,
//   })

//   const bookMeetingMutation = useMutation({
//     mutationFn: async (bookingData: any) => {
//       const response = await fetch('/api/meeting/public/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(bookingData),
//       })
//       if (!response.ok) throw new Error('Failed to book meeting')
//       return response.json()
//     },
//     onSuccess: () => {
//       setStep('confirmed')
//     },
//   })

//   const handleBookMeeting = (e: React.FormEvent) => {
//     e.preventDefault()

//     const startTime = new Date(`${selectedDate}T${selectedTime}:00`)
//     const endTime = new Date(startTime.getTime() + event.event.duration * 60000)

//     bookMeetingMutation.mutate({
//       eventId: event.event.id,
//       startTime: startTime.toISOString(),
//       endTime: endTime.toISOString(),
//       guestName: formData.guestName,
//       guestEmail: formData.guestEmail,
//       additionalInfo: formData.additionalInfo,
//     })
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     )
//   }

//   if (!event?.event) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
//           <p className="text-gray-600">The event you're looking for doesn't exist.</p>
//         </div>
//       </div>
//     )
//   }

//   if (step === 'confirmed') {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <div className=" size-16  bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Check className="size-8 text-green-600" />
//             </div>
//             <CardTitle className="text-2xl text-green-600">Meeting Booked!</CardTitle>
//             <CardDescription>
//               Your meeting has been successfully scheduled
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="text-center space-y-4">
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-medium text-gray-900 mb-2">{event.event.title}</h3>
//               <p className="text-sm text-gray-600">
//                 {format(new Date(`${selectedDate}T${selectedTime}`), 'PPP p')}
//               </p>
//               <p className="text-sm text-gray-600">
//                 Duration: {event.event.duration} minutes
//               </p>
//             </div>
//             <p className="text-sm text-gray-600">
//               A confirmation email with meeting details has been sent to {formData.guestEmail}
//             </p>
//             <Link href={`/${username}`}>
//               <Button variant="outline" className="w-full">
//                 Back to Profile
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white shadow">
//         <div className="container mx-auto px-4 py-6">
//           <div className="flex items-center gap-4">
//             <Link href={`/${username}`}>
//               <Button variant="outline" size="sm">
//                 <ArrowLeft className="size-4" />
//               </Button>
//             </Link>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">{event.event.title}</h1>
//               <div className="flex items-center gap-4 text-gray-600">
//                 <span className="flex items-center gap-1">
//                   <Clock className="size-4" />
//                   {event.event.duration} minutes
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Calendar className="size-4" />
//                   {event.event.locationType.replace('_', ' ').toLowerCase()}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           {step === 'select-time' && (
//             <div className="grid lg:grid-cols-2 gap-8">
//               {/* Calendar */}
//               <Card className='bg-red-500 h-96'>
//                 <CardHeader>
//                   <CardTitle>Select a Date & Time</CardTitle>
//                   <CardDescription>
//                     Choose your preferred meeting time
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className='bg-red-500 h-fit'>
//                   <div className="space-y-4">
//                     {/* Simple date selection */}
//                     <div className="grid grid-cols-7 gap-2">
//                       {Array.from({ length: 14 }, (_, i) => {
//                         const date = addDays(new Date(), i)
//                         const dateStr = format(date, 'yyyy-MM-dd')
//                         const dayAvailability = availability?.data?.find((d: any) => 
//                           d.day === format(date, 'EEEE').toUpperCase()
//                         )

//                         if (!dayAvailability?.isAvailable) return null

//                         return (
//                           <button
//                             key={dateStr}
//                             onClick={() => setSelectedDate(dateStr)}
//                             className={`p-2 text-sm rounded-md border ${
//                               selectedDate === dateStr
//                                 ? 'bg-blue-600 text-white border-blue-600'
//                                 : 'bg-white text-gray-900 border-gray-300 hover:border-blue-600'
//                             }`}
//                           >
//                             <div className="text-xs">{format(date, 'EEE')}</div>
//                             <div>{format(date, 'd')}</div>
//                           </button>
//                         )
//                       })}
//                     </div>

//                     {/* Time slots */}
//                     {selectedDate && (
//                       <div className="space-y-2">
//                         <h3 className="font-medium">Available Times</h3>
//                         <div className="grid grid-cols-3 gap-2">
//                           {(() => {
//                             const selectedDateObj = new Date(selectedDate)
//                             const dayName = format(selectedDateObj, 'EEEE').toUpperCase()
//                             const dayAvailability = availability?.data?.find((d: any) => d.day === dayName)

//                             if (!dayAvailability?.slots) return null

//                             return dayAvailability.slots.map((time: string) => (
//                               <button
//                                 key={time}
//                                 onClick={() => setSelectedTime(time)}
//                                 className={`p-2 text-sm rounded-md border ${
//                                   selectedTime === time
//                                     ? 'bg-blue-600 text-white border-blue-600'
//                                     : 'bg-white text-gray-900 border-gray-300 hover:border-blue-600'
//                                 }`}
//                               >
//                                 {time}
//                               </button>
//                             ))
//                           })()}
//                         </div>
//                       </div>
//                     )}

//                     {selectedDate && selectedTime && (
//                       <Button 
//                         onClick={() => setStep('book-meeting')}
//                         className="w-full"
//                       >
//                         Continue
//                       </Button>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Event Details */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Meeting Details</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="flex items-center gap-3">
//                       {event.event.user.imageUrl && (
//                         <img
//                           src={event.event.user.imageUrl}
//                           alt={event.event.user.name}
//                           className=" size-12  rounded-full"
//                         />
//                       )}
//                       <div>
//                         <h3 className="font-medium">{event.event.user.name}</h3>
//                         <p className="text-sm text-gray-600">{event.event.title}</p>
//                       </div>
//                     </div>

//                     {event.event.description && (
//                       <p className="text-gray-600">{event.event.description}</p>
//                     )}

//                     <div className="space-y-2 text-sm">
//                       <div className="flex items-center gap-2">
//                         <Clock className="size-4" />
//                         <span>{event.event.duration} minutes</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Calendar1 className="size-4" />
//                         <span>{event.event.locationType.replace('_', ' ')}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           )}

//           {step === 'book-meeting' && (
//             <Card className="max-w-2xl mx-auto">
//               <CardHeader>
//                 <CardTitle>Enter Your Details</CardTitle>
//                 <CardDescription>
//                   Please provide your information to complete the booking
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="bg-blue-50 p-4 rounded-lg mb-6">
//                   <h3 className="font-medium text-blue-900 mb-2">Selected Time</h3>
//                   <p className="text-blue-800">
//                     {format(new Date(`${selectedDate}T${selectedTime}`), 'PPP p')}
//                   </p>
//                   <p className="text-sm text-blue-700">
//                     {event.event.title} • {event.event.duration} minutes
//                   </p>
//                 </div>

//                 <form onSubmit={handleBookMeeting} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Your Name *
//                     </label>
//                     <Input
//                       type="text"
//                       value={formData.guestName}
//                       onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email Address *
//                     </label>
//                     <Input
//                       type="email"
//                       value={formData.guestEmail}
//                       onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Additional Information (Optional)
//                     </label>
//                     <textarea
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       rows={3}
//                       value={formData.additionalInfo}
//                       onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
//                       placeholder="Any additional details or questions..."
//                     />
//                   </div>

//                   <div className="flex gap-4">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => setStep('select-time')}
//                       className="flex-1"
//                     >
//                       Back
//                     </Button>
//                     <Button
//                       type="submit"
//                       disabled={bookMeetingMutation.isPending}
//                       className="flex-1"
//                     >
//                       {bookMeetingMutation.isPending ? 'Booking...' : 'Book Meeting'}
//                     </Button>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>

//     </div>
//   )
// }

// import { useRouter } from "next/router";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Clock, Calendar1, Check } from "lucide-react";
// import Link from "next/link";
// import { format } from "date-fns";
// import { useState, useEffect } from "react";
// import { Calendar } from "@/components/ui/calendar";
// import { ScrollArea } from "@/components/ui/scroll-area";

// export default function BookingPage() {
//   const router = useRouter();
//   const { username, slug } = router.query;

//   const today = new Date();
//   const [date, setDate] = useState<Date>(today);
//   const [time, setTime] = useState<string | null>(null);
//   const [step, setStep] = useState<"select-time" | "book-meeting" | "confirmed">("select-time");
//   const [formData, setFormData] = useState({
//     guestName: "",
//     guestEmail: "",
//     additionalInfo: "",
//   });

//   // Auto move to booking step once date+time selected
//   useEffect(() => {
//     if (date && time) {
//       setStep("book-meeting");
//     }
//   }, [date, time]);

//   // Fetch event
//   const { data: event, isLoading } = useQuery({
//     queryKey: ["public-event", username, slug],
//     queryFn: async () => {
//       const response = await fetch(`/api/event/public/${username}/${slug}`);
//       if (!response.ok) throw new Error("Failed to fetch event");
//       return response.json();
//     },
//     enabled: !!username && !!slug,
//   });

//   // Fetch availability
//   const { data: availability } = useQuery({
//     queryKey: ["availability", event?.event?.id],
//     queryFn: async () => {
//       const response = await fetch(`/api/availability/public/${event.event.id}`);
//       if (!response.ok) throw new Error("Failed to fetch availability");
//       return response.json();
//     },
//     enabled: !!event?.event?.id,
//   });

//   // Book meeting mutation
//   const bookMeetingMutation = useMutation({
//     mutationFn: async (bookingData: any) => {
//       const response = await fetch("/api/meeting/public/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(bookingData),
//       });
//       if (!response.ok) throw new Error("Failed to book meeting");
//       return response.json();
//     },
//     onSuccess: () => {
//       setStep("confirmed");
//     },
//   });

//   const handleBookMeeting = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!date || !time) return;

//     const startTime = new Date(date);
//     const [hours, minutes] = time.split(":").map(Number);
//     startTime.setHours(hours, minutes, 0, 0);

//     const endTime = new Date(startTime.getTime() + event.event.duration * 60000);

//     bookMeetingMutation.mutate({
//       eventId: event.event.id,
//       startTime: startTime.toISOString(),
//       endTime: endTime.toISOString(),
//       guestName: formData.guestName,
//       guestEmail: formData.guestEmail,
//       additionalInfo: formData.additionalInfo,
//     });
//   };

//   // Generate time slots
//   const generateTimeSlots = () => {
//     if (!date || !availability?.data) return [];
//     const dayName = format(date, "EEEE").toUpperCase();
//     const dayAvailability = availability.data.find((d: any) => d.day === dayName);
//     if (!dayAvailability?.slots) return [];
//     return dayAvailability.slots.map((timeSlot: string) => ({
//       time: timeSlot,
//       available: true,
//     }));
//   };

//   const timeSlots = generateTimeSlots();

//   // Loading
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   // Not found
//   if (!event?.event) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
//           <p className="text-gray-600">The event you're looking for doesn't exist.</p>
//         </div>
//       </div>
//     );
//   }

//   // Confirmed
//   if (step === "confirmed") {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <div className=" size-16  bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Check className="size-8 text-green-600" />
//             </div>
//             <CardTitle className="text-2xl text-green-600">Meeting Booked!</CardTitle>
//             <CardDescription>Your meeting has been successfully scheduled</CardDescription>
//           </CardHeader>
//           <CardContent className="text-center space-y-4">
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-medium text-gray-900 mb-2">{event.event.title}</h3>
//               <p className="text-sm text-gray-600">
//                 {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
//               </p>
//               <p className="text-sm text-gray-600">Duration: {event.event.duration} minutes</p>
//             </div>
//             <p className="text-sm text-gray-600">
//               A confirmation email with meeting details has been sent to {formData.guestEmail}
//             </p>
//             <Link href={`/${username}`}>
//               <Button variant="outline" className="w-full">
//                 Back to Profile
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }


//   return (
//     <div className="min-h-screen h-screen flex justify-center items-center">

//         {step === "select-time" && (
//           <div className="w-full p-4 max-w-4xl rounded-2xl bg-[#FAFAFA] shadow-md dark:bg-[#141414]">
//               <div className="flex max-w-full w-full h-96"> 
//                  <div className="space-y-4  w-full flex-grow p-2">

//                   {event.event.user.image && (
//                     <img
//                       src={event.event.user.image}
//                       alt={event.event.user.name}
//                       className="size-8 rounded-full"
//                     />
//                   )}

//                     <h3 className="font-medium">{event.event.user.name}</h3>
//                     <p className="text-sm text-gray-600">{event.event.title}</p>


//                 {event.event.description && (
//                   <p className="text-gray-600">{event.event.description}</p>
//                 )}


//                     <Clock className="size-4" />
//                     <span>{event.event.duration} minutes</span>


//                     <Calendar1 className="size-4" />
//                     <span className="text-xs">{event.event.locationType.replace("_", " ")}</span>


//               </div>
//               <div className="relative h-96 flex-grow w-full">

//                 <Calendar
//                   mode="single"
//                   selected={date}
//                   onSelect={(newDate) => {
//                     if (newDate) {
//                       setDate(newDate);
//                       setTime(null);
//                     }
//                   }}
//                   className=" bg-transparent w-full flex-grow h-full"
//                   disabled={[{ before: today }]}
//                 />
//                 </div>
//                 <div className="relative w-full">
//                   {/* <div className="absolute inset-0 py-4 max-sm:border-t"> */}
//                     <ScrollArea className="h-full ">
//                       <div className="space-y-3">
//                         <div className="flex h-5 shrink-0 items-center px-5">
//                           <p className="text-sm font-medium">{format(date, "EEEE, d")}</p>
//                         </div>
//                         <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
//                           {timeSlots.map(({ time: timeSlot, available }) => (
//                             <Button
//                               key={timeSlot}
//                               variant={time === timeSlot ? "default" : "outline"}
//                               size="sm"
//                               className="w-full bg-transparent"
//                               onClick={() => setTime(timeSlot)}
//                               disabled={!available}
//                             >
//                               {timeSlot}
//                             </Button>
//                           ))}
//                         </div>
//                       </div>
//                     </ScrollArea>

//                 </div>
//             </div>

//             {/* {date && time && (
//               <Button onClick={() => setStep("book-meeting")} className="w-full mt-4">
//                 Continue
//               </Button>
//             )} */}
//           </div>
//         )}

//         {step === "book-meeting" && (
//           <Card className="max-w-2xl mx-auto">
//             <CardHeader>
//               <CardTitle>Enter Your Details</CardTitle>
//               <CardDescription>
//                 Please provide your information to complete the booking
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="bg-blue-50 p-4 rounded-lg mb-6">
//                 <h3 className="font-medium text-blue-900 mb-2">Selected Time</h3>
//                 <p className="text-blue-800">
//                   {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
//                 </p>
//                 <p className="text-sm text-blue-700">
//                   {event.event.title} • {event.event.duration} minutes
//                 </p>
//               </div>

//               <form onSubmit={handleBookMeeting} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Your Name *
//                   </label>
//                   <Input
//                     type="text"
//                     value={formData.guestName}
//                     onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address *
//                   </label>
//                   <Input
//                     type="email"
//                     value={formData.guestEmail}
//                     onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Additional Information (Optional)
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows={3}
//                     value={formData.additionalInfo}
//                     onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
//                     placeholder="Any additional details or questions..."
//                   />
//                 </div>

//                 <div className="flex gap-4">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setStep("select-time")}
//                     className="flex-1"
//                   >
//                     Back
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={bookMeetingMutation.isPending}
//                     className="flex-1"
//                   >
//                     {bookMeetingMutation.isPending ? "Booking..." : "Book Meeting"}
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         )}

//     </div>
//   );
// }



// import { useRouter } from "next/router";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Clock, Calendar1, Check, Users, User, X, Plus, Mail, ChevronRight, Loader2 } from "lucide-react";
// import Link from "next/link";
// import { format, addMinutes } from "date-fns";
// import { useState, useEffect } from "react";
// import { Calendar } from "@/components/ui/calendar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// // Types for team functionality
// interface TeamMember {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
//   role: string;
// }

// interface Team {
//   id: string;
//   name: string;
//   slug: string;
//   members: TeamMember[];
// }

// interface ExternalAttendee {
//   email: string;
//   name: string;
// }

// export default function BookingPage() {
//   const router = useRouter();
//   const { username, slug } = router.query;

//   const today = new Date();
//   const [date, setDate] = useState<Date>(today);
//   const [time, setTime] = useState<string | null>(null);
//   const [step, setStep] = useState<"select-time" | "select-attendees" | "book-meeting" | "confirmed">("select-time");

//   // Team-related state
//   const [bookingMode, setBookingMode] = useState<"1on1" | "team">("1on1");
//   const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
//   const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
//   const [selectAllTeam, setSelectAllTeam] = useState(false);
//   const [externalAttendees, setExternalAttendees] = useState<ExternalAttendee[]>([]);
//   const [newExternalEmail, setNewExternalEmail] = useState("");
//   const [newExternalName, setNewExternalName] = useState("");

//   // Form data
//   const [formData, setFormData] = useState({
//     guestName: "",
//     guestEmail: "",
//     additionalInfo: "",
//   });

//   // Auto move to attendee selection once date+time selected
//   useEffect(() => {
//     if (date && time) {
//       if (bookingMode === "team") {
//         setStep("select-attendees");
//       } else {
//         setStep("book-meeting");
//       }
//     }
//   }, [date, time, bookingMode]);

//   // Fetch event
//   const { data: event, isLoading: isLoadingEvent } = useQuery({
//     queryKey: ["public-event", username, slug],
//     queryFn: async () => {
//       const response = await fetch(`/api/event/public/${username}/${slug}`);
//       if (!response.ok) throw new Error("Failed to fetch event");
//       return response.json();
//     },
//     enabled: !!username && !!slug,
//   });

//   // Fetch user's teams (if logged in)
//   const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
//     queryKey: ["user-teams"],
//     queryFn: async () => {
//       const response = await fetch('/api/teams');
//       if (!response.ok) return null;
//       return response.json();
//     },
//     retry: false,
//   });

//   // Fetch team members when team is selected
//   const { data: teamMembersData, isLoading: isLoadingTeamMembers } = useQuery({
//     queryKey: ["team-members", selectedTeam?.slug],
//     queryFn: async () => {
//       if (!selectedTeam) return null;
//       const response = await fetch(`/api/teams/${selectedTeam.slug}/members-for-selection`);
//       if (!response.ok) throw new Error("Failed to fetch team members");
//       return response.json();
//     },
//     enabled: !!selectedTeam,
//   });

//   // Fetch availability
//   const { data: availability } = useQuery({
//     queryKey: ["availability", event?.event?.id],
//     queryFn: async () => {
//       const response = await fetch(`/api/availability/public/${event.event.id}`);
//       if (!response.ok) throw new Error("Failed to fetch availability");
//       return response.json();
//     },
//     enabled: !!event?.event?.id,
//   });

//   // Book meeting mutation (supports both 1on1 and team)
//   const bookMeetingMutation = useMutation({
//     mutationFn: async (bookingData: any) => {
//       // Use team endpoint if team mode, otherwise use existing endpoint
//       const endpoint = bookingMode === "team" 
//         ? "/api/meetings/team/create" 
//         : "/api/meeting/public/create";

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(bookingData),
//       });
//       if (!response.ok) throw new Error("Failed to book meeting");
//       return response.json();
//     },
//     onSuccess: () => {
//       setStep("confirmed");
//     },
//   });

//   const handleBookMeeting = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!date || !time) return;

//     const startTime = new Date(date);
//     const [hours, minutes] = time.split(":").map(Number);
//     startTime.setHours(hours, minutes, 0, 0);

//     const endTime = new Date(startTime.getTime() + event.event.duration * 60000);

//     // Prepare payload based on booking mode
//     const payload = bookingMode === "team" 
//       ? {
//           eventId: event.event.id,
//           startTime: startTime.toISOString(),
//           endTime: endTime.toISOString(),
//           title: event.event.title,
//           description: formData.additionalInfo,
//           teamId: selectAllTeam ? selectedTeam?.id : undefined,
//           selectedMemberIds: Array.from(selectedMembers),
//           externalAttendees,
//         }
//       : {
//           eventId: event.event.id,
//           startTime: startTime.toISOString(),
//           endTime: endTime.toISOString(),
//           guestName: formData.guestName,
//           guestEmail: formData.guestEmail,
//           additionalInfo: formData.additionalInfo,
//         };

//     bookMeetingMutation.mutate(payload);
//   };

//   // Generate time slots
//   const generateTimeSlots = () => {
//     if (!date || !availability?.data) return [];
//     const dayName = format(date, "EEEE").toUpperCase();
//     const dayAvailability = availability.data.find((d: any) => d.day === dayName);
//     if (!dayAvailability?.slots) return [];
//     return dayAvailability.slots.map((timeSlot: string) => ({
//       time: timeSlot,
//       available: true,
//     }));
//   };

//   const timeSlots = generateTimeSlots();

//   // Team selection handlers
//   const handleSelectTeam = (team: Team) => {
//     setSelectedTeam(team);
//     setStep("select-time");
//   };

//   const handleSelectAllTeam = (checked: boolean) => {
//     setSelectAllTeam(checked);
//     if (checked && teamMembersData?.data?.members) {
//       setSelectedMembers(new Set(teamMembersData.data.members.map((m: TeamMember) => m.id)));
//     } else {
//       setSelectedMembers(new Set());
//     }
//   };

//   const handleMemberToggle = (memberId: string) => {
//     const newSelected = new Set(selectedMembers);
//     if (newSelected.has(memberId)) {
//       newSelected.delete(memberId);
//       setSelectAllTeam(false);
//     } else {
//       newSelected.add(memberId);
//     }
//     setSelectedMembers(newSelected);
//   };

//   const addExternalAttendee = () => {
//     if (newExternalEmail && !externalAttendees.find(e => e.email === newExternalEmail)) {
//       setExternalAttendees([...externalAttendees, {
//         email: newExternalEmail,
//         name: newExternalName || newExternalEmail.split('@')[0],
//       }]);
//       setNewExternalEmail("");
//       setNewExternalName("");
//     }
//   };

//   const removeExternalAttendee = (email: string) => {
//     setExternalAttendees(externalAttendees.filter(e => e.email !== email));
//   };

//   const totalAttendees = selectedMembers.size + externalAttendees.length;

//   // Loading
//   if (isLoadingEvent) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   // Not found
//   if (!event?.event) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
//           <p className="text-gray-600">The event youre looking for doesnt exist.</p>
//         </div>
//       </div>
//     );
//   }

//   // Mode Selection Step (New)
//   if (step === "select-time" && !bookingMode) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <CardTitle className="text-2xl">How would you like to meet?</CardTitle>
//             <CardDescription>Choose your booking preference</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <button
//               onClick={() => {
//                 setBookingMode("1on1");
//                 // Keep existing flow
//               }}
//               className="w-full p-6 text-left border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
//             >
//               <div className="flex items-center gap-4">
//                 <div className=" size-12  bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
//                   <User className="size-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg">One-on-One</h3>
//                   <p className="text-sm text-gray-500">Schedule a personal meeting</p>
//                 </div>
//                 <ChevronRight className="ml-auto size-5 text-gray-400" />
//               </div>
//             </button>

//             {teamsData?.data && teamsData.data.length > 0 && (
//               <div className="space-y-2">
//                 <Separator className="my-4" />
//                 <p className="text-sm font-medium text-gray-700 mb-2">Or schedule with your team:</p>
//                 {teamsData.data.map((team: Team) => (
//                   <button
//                     key={team.id}
//                     onClick={() => {
//                       setBookingMode("team");
//                       handleSelectTeam(team);
//                     }}
//                     className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className=" size-10  bg-purple-100 rounded-full flex items-center justify-center">
//                         <Users className="size-5 text-purple-600" />
//                       </div>
//                       <div>
//                         <h3 className="font-medium">{team.name}</h3>
//                         <p className="text-xs text-gray-500">{team.members?.length || 0} members</p>
//                       </div>
//                       <ChevronRight className="ml-auto size-4 text-gray-400" />
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // Confirmed
//   if (step === "confirmed") {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <div className=" size-16  bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Check className="size-8 text-green-600" />
//             </div>
//             <CardTitle className="text-2xl text-green-600">Meeting Booked!</CardTitle>
//             <CardDescription>
//               {bookingMode === "team" 
//                 ? "Your team meeting has been scheduled" 
//                 : "Your meeting has been successfully scheduled"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="text-center space-y-4">
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-medium text-gray-900 mb-2">{event.event.title}</h3>
//               <p className="text-sm text-gray-600">
//                 {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
//               </p>
//               <p className="text-sm text-gray-600">Duration: {event.event.duration} minutes</p>
//               {bookingMode === "team" && (
//                 <p className="text-sm text-blue-600 mt-2">
//                   {totalAttendees} attendees invited
//                 </p>
//               )}
//             </div>
//             <p className="text-sm text-gray-600">
//               {bookingMode === "team" 
//                 ? "Calendar invites have been sent to all attendees"
//                 : `A confirmation email with meeting details has been sent to ${formData.guestEmail}`}
//             </p>
//             <Link href={`/${username}`}>
//               <Button variant="outline" className="w-full">
//                 Back to Profile
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // Attendee Selection Step (New for Team Mode)
//   if (step === "select-attendees") {
//     const members = teamMembersData?.data?.members || [];

//     return (
//       <div className="min-h-screen bg-gray-50 py-8 px-4">
//         <div className="max-w-2xl mx-auto">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle className="flex items-center gap-2">
//                     <Users className="size-5" />
//                     Select Attendees
//                   </CardTitle>
//                   <CardDescription>
//                     Choose team members for {event.event.title}
//                   </CardDescription>
//                 </div>
//                 <Button variant="ghost" size="sm" onClick={() => setStep("select-time")}>
//                   Back to Time
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <Tabs defaultValue="team" className="w-full">
//                 <TabsList className="grid w-full grid-cols-2">
//                   <TabsTrigger value="team">Team Members</TabsTrigger>
//                   <TabsTrigger value="external">
//                     External Guests
//                     {externalAttendees.length > 0 && (
//                       <Badge variant="secondary" className="ml-2">{externalAttendees.length}</Badge>
//                     )}
//                   </TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="team" className="mt-4">
//                   {isLoadingTeamMembers ? (
//                     <div className="flex items-center justify-center py-8">
//                       <Loader2 className="size-6 animate-spin" />
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       {/* Select All */}
//                       <div className="flex items-center !gap-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                         <Checkbox
//                           id="select-all"
//                           checked={selectAllTeam}
//                           onCheckedChange={(checked) => handleSelectAllTeam(checked as boolean)}
//                         />
//                         <label htmlFor="select-all" className="flex-1 cursor-pointer font-medium">
//                           Select All Team Members ({members.length} people)
//                         </label>
//                         <Users className="size-5 text-blue-500" />
//                       </div>

//                       <Separator />

//                       {/* Members List */}
//                       <ScrollArea className="h-[300px]">
//                         <div className="space-y-2">
//                           {members.map((member: TeamMember) => (
//                             <div
//                               key={member.id}
//                               className="flex items-center !gap-x-3 p-3 rounded-lg hover:bg-gray-50 border"
//                             >
//                               <Checkbox
//                                 id={member.id}
//                                 checked={selectedMembers.has(member.id)}
//                                 onCheckedChange={() => handleMemberToggle(member.id)}
//                               />
//                               <Avatar className="size-8">
//                                 <AvatarImage src={member.image} />
//                                 <AvatarFallback>
//                                   {member.name?.charAt(0) || member.email.charAt(0)}
//                                 </AvatarFallback>
//                               </Avatar>
//                               <label htmlFor={member.id} className="flex-1 cursor-pointer">
//                                 <div className="font-medium">{member.name || 'Unnamed'}</div>
//                                 <div className="text-sm text-gray-500">{member.email}</div>
//                               </label>
//                               <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
//                                 {member.role}
//                               </Badge>
//                             </div>
//                           ))}
//                         </div>
//                       </ScrollArea>
//                     </div>
//                   )}
//                 </TabsContent>

//                 <TabsContent value="external" className="mt-4">
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-2">
//                       <Input
//                         placeholder="Name (optional)"
//                         value={newExternalName}
//                         onChange={(e) => setNewExternalName(e.target.value)}
//                       />
//                       <div className="flex gap-2">
//                         <Input
//                           placeholder="email@example.com"
//                           type="email"
//                           value={newExternalEmail}
//                           onChange={(e) => setNewExternalEmail(e.target.value)}
//                           onKeyPress={(e) => e.key === 'Enter' && addExternalAttendee()}
//                         />
//                         <Button onClick={addExternalAttendee} size="icon">
//                           <Plus className="size-4" />
//                         </Button>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       {externalAttendees.map((attendee) => (
//                         <div
//                           key={attendee.email}
//                           className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
//                         >
//                           <div className="flex items-center gap-3">
//                             <Avatar className="size-8">
//                               <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
//                             </Avatar>
//                             <div>
//                               <div className="font-medium">{attendee.name}</div>
//                               <div className="text-sm text-gray-500">{attendee.email}</div>
//                             </div>
//                             <Badge variant="outline">External</Badge>
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => removeExternalAttendee(attendee.email)}
//                           >
//                             <X className="size-4" />
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </TabsContent>
//               </Tabs>

//               {/* Summary */}
//               <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">
//                     Total Attendees: {totalAttendees}
//                   </span>
//                   <div className="flex gap-2">
//                     {selectedMembers.size > 0 && (
//                       <Badge variant="secondary">
//                         <Users className=" size-3   mr-1" />
//                         {selectedMembers.size} team
//                       </Badge>
//                     )}
//                     {externalAttendees.length > 0 && (
//                       <Badge variant="outline">
//                         <Mail className=" size-3   mr-1" />
//                         {externalAttendees.length} external
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end">
//                 <Button
//                   onClick={() => setStep("book-meeting")}
//                   disabled={totalAttendees === 0}
//                 >
//                   Next: Confirm Details
//                   <ChevronRight className="size-4 ml-2" />
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   // Main booking flow
//   return (
//     <div className="min-h-screen h-screen flex justify-center items-center">
//       {step === "select-time" && (
//         <div className="w-full p-4 max-w-4xl rounded-2xl bg-[#FAFAFA] shadow-md dark:bg-[#141414]">
//           {/* Show current mode indicator */}
//           {bookingMode === "team" && selectedTeam && (
//             <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Users className="size-5 text-blue-600" />
//                 <span className="font-medium">Team: {selectedTeam.name}</span>
//               </div>
//               <Button variant="ghost" size="sm" onClick={() => setBookingMode("1on1")}>
//                 Switch to 1-on-1
//               </Button>
//             </div>
//           )}

//           <div className="flex max-w-full w-full h-96">
//             <div className="space-y-4 w-full flex-grow p-2">
//               {event.event.user.image && (
//                 <img
//                   src={event.event.user.image}
//                   alt={event.event.user.name}
//                   className="size-8 rounded-full"
//                 />
//               )}
//               <h3 className="font-medium">{event.event.user.name}</h3>
//               <p className="text-sm text-gray-600">{event.event.title}</p>
//               {event.event.description && (
//                 <p className="text-gray-600">{event.event.description}</p>
//               )}
//               <Clock className="size-4" />
//               <span>{event.event.duration} minutes</span>
//               <Calendar1 className="size-4" />
//               <span className="text-xs">{event.event.locationType.replace("_", " ")}</span>
//             </div>
//             <div className="relative h-96 flex-grow w-full">
//               <Calendar
//                 mode="single"
//                 selected={date}
//                 onSelect={(newDate) => {
//                   if (newDate) {
//                     setDate(newDate);
//                     setTime(null);
//                   }
//                 }}
//                 className="bg-transparent w-full flex-grow h-full"
//                 disabled={[{ before: today }]}
//               />
//             </div>
//             <div className="relative w-full">
//               <ScrollArea className="h-full">
//                 <div className="space-y-3">
//                   <div className="flex h-5 shrink-0 items-center px-5">
//                     <p className="text-sm font-medium">{format(date, "EEEE, d")}</p>
//                   </div>
//                   <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
//                     {timeSlots.map(({ time: timeSlot, available }) => (
//                       <Button
//                         key={timeSlot}
//                         variant={time === timeSlot ? "default" : "outline"}
//                         size="sm"
//                         className="w-full bg-transparent"
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
//       )}

//       {step === "book-meeting" && (
//         <Card className="max-w-2xl mx-auto">
//           <CardHeader>
//             <CardTitle>
//               {bookingMode === "team" ? "Confirm Team Meeting" : "Enter Your Details"}
//             </CardTitle>
//             <CardDescription>
//               {bookingMode === "team" 
//                 ? "Review and confirm your team meeting details"
//                 : "Please provide your information to complete the booking"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="bg-blue-50 p-4 rounded-lg mb-6">
//               <h3 className="font-medium text-blue-900 mb-2">Selected Time</h3>
//               <p className="text-blue-800">
//                 {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
//               </p>
//               <p className="text-sm text-blue-700">
//                 {event.event.title} • {event.event.duration} minutes
//               </p>
//               {bookingMode === "team" && (
//                 <div className="mt-3 pt-3 border-t border-blue-200">
//                   <p className="text-sm font-medium text-blue-900 mb-2">Attendees ({totalAttendees})</p>
//                   <div className="flex flex-wrap gap-2">
//                     {Array.from(selectedMembers).map((memberId) => {
//                       const member = teamMembersData?.data?.members.find((m: TeamMember) => m.id === memberId);
//                       return member ? (
//                         <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
//                           <Avatar className="size-4">
//                             <AvatarFallback className="text-xs">{member.name?.charAt(0)}</AvatarFallback>
//                           </Avatar>
//                           {member.name || member.email}
//                         </Badge>
//                       ) : null;
//                     })}
//                     {externalAttendees.map((attendee) => (
//                       <Badge key={attendee.email} variant="outline" className="flex items-center gap-1">
//                         <Mail className=" size-3  " />
//                         {attendee.name}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <form onSubmit={handleBookMeeting} className="space-y-4">
//               {bookingMode === "1on1" ? (
//                 // Original 1-on-1 form fields
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Your Name *
//                     </label>
//                     <Input
//                       type="text"
//                       value={formData.guestName}
//                       onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email Address *
//                     </label>
//                     <Input
//                       type="email"
//                       value={formData.guestEmail}
//                       onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </>
//               ) : (
//                 // Team mode - show organizer info (optional)
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Meeting Notes (Optional)
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows={3}
//                     value={formData.additionalInfo}
//                     onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
//                     placeholder="Add agenda, topics to discuss, or any additional information for attendees..."
//                   />
//                 </div>
//               )}

//               {bookingMode === "1on1" && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Additional Information (Optional)
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows={3}
//                     value={formData.additionalInfo}
//                     onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
//                     placeholder="Any additional details or questions..."
//                   />
//                 </div>
//               )}

//               <div className="flex gap-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setStep(bookingMode === "team" ? "select-attendees" : "select-time")}
//                   className="flex-1"
//                 >
//                   Back
//                 </Button>
//                 <Button
//                   type="submit"
//                   disabled={bookMeetingMutation.isPending}
//                   className="flex-1"
//                 >
//                   {bookMeetingMutation.isPending 
//                     ? "Booking..." 
//                     : bookingMode === "team" 
//                       ? "Schedule Team Meeting" 
//                       : "Book Meeting"
//                   }
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

// import { useRouter } from "next/router";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Clock, Calendar1, Check, Users, User, X, Plus, Mail, ChevronRight, Loader2 } from "lucide-react";
// import Link from "next/link";
// import { format, addMinutes } from "date-fns";
// import { useState, useEffect } from "react";
// import { Calendar } from "@/components/ui/calendar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { toast } from "sonner"
// import {
//   ExpandableScreen,
//   ExpandableScreenContent,
//   ExpandableScreenTrigger,
// } from "@/components/ui/ExpandableScreen"

// // Types for team functionality
// interface TeamMember {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
//   role: string;
// }

// interface Team {
//   id: string;
//   name: string;
//   slug: string;
//   members: TeamMember[];
// }

// interface ExternalAttendee {
//   email: string;
//   name: string;
// }

// interface BookingPageProps {
//   externalOpen?: boolean;
//   onOpenChange?: (open: boolean) => void;
//   username?: string;
//   slug?: string;
//   eventData?: any; // Pre-fetched event data
// }

// export default function BookingPage({ 
//   externalOpen, 
//   onOpenChange,
//   username: propUsername,
//   slug: propSlug,
//   eventData: propEventData
// }: BookingPageProps) {
//   const router = useRouter();
//   const { username, slug } = router.query;
//   const [internalOpen, setInternalOpen] = useState(false);

//   // Use external control if provided, otherwise internal
//   const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
//   const setIsOpen = onOpenChange || setInternalOpen;
//   const today = new Date();
//   const [date, setDate] = useState<Date>(today);
//   const [time, setTime] = useState<string | null>(null);
//   const [step, setStep] = useState<"select-time" | "select-attendees" | "book-meeting" | "confirmed">("select-time");

//   // Use URL params if props not provided (direct page access)
//   const { username: urlUsername, slug: urlSlug } = router.query;
//   const effectiveUsername = propUsername || urlUsername;
//   const effectiveSlug = propSlug || urlSlug;
//   // Team-related state
//   const [showTeamModal, setShowTeamModal] = useState(false);
//   const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
//   const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
//   const [selectAllTeam, setSelectAllTeam] = useState(false);
//   const [externalAttendees, setExternalAttendees] = useState<ExternalAttendee[]>([]);
//   const [newExternalEmail, setNewExternalEmail] = useState("");
//   const [newExternalName, setNewExternalName] = useState("");
//   const [isTeamMode, setIsTeamMode] = useState(false);

//   // Form data
//   const [formData, setFormData] = useState({
//     guestName: "",
//     guestEmail: "",
//     additionalInfo: "",
//   });

//   // Fetch event
//   const { data: event, isLoading: isLoadingEvent } = useQuery({
//     queryKey: ["public-event", username, slug],
//     queryFn: async () => {
//       const response = await fetch(`/api/event/public/${username}/${slug}`);
//       if (!response.ok) throw new Error("Failed to fetch event");
//       return response.json();
//     },
//     enabled: !!username && !!slug,
//   });



//   // Fetch user's teams (if logged in)
//   const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
//     queryKey: ["user-teams"],
//     queryFn: async () => {
//       const response = await fetch('/api/teams');
//       if (!response.ok) return null;
//       return response.json();
//     },
//     retry: false,
//   });

//   // Fetch team members when team is selected
//   const { data: teamMembersData, isLoading: isLoadingTeamMembers } = useQuery({
//     queryKey: ["team-members", selectedTeam?.slug],
//     queryFn: async () => {
//       if (!selectedTeam) return null;
//       const response = await fetch(`/api/teams/${selectedTeam.slug}/members-for-selection`);
//       if (!response.ok) throw new Error("Failed to fetch team members");
//       return response.json();
//     },
//     enabled: !!selectedTeam,
//   });

//   // Fetch availability
//   const { data: availability } = useQuery({
//     queryKey: ["availability", event?.event?.id],
//     queryFn: async () => {
//       const response = await fetch(`/api/availability/public/${event.event.id}`);
//       if (!response.ok) throw new Error("Failed to fetch availability");
//       return response.json();
//     },
//     enabled: !!event?.event?.id,
//   });

//   // Book meeting mutation (supports both 1on1 and team)
//   const bookMeetingMutation = useMutation({
//     mutationFn: async (bookingData: any) => {
//       const endpoint = isTeamMode 
//         ? "/api/meetings/team/create" 
//         : "/api/meeting/public/create";

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(bookingData),
//       });
//       if (!response.ok) throw new Error("Failed to book meeting");
//       return response.json();
//     },
//     onSuccess: () => {
//       setStep("confirmed");
//     },
//   });

//   const handleBookMeeting = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!date || !time) return;

//     const startTime = new Date(date);
//     const [hours, minutes] = time.split(":").map(Number);
//     startTime.setHours(hours, minutes, 0, 0);

//     const endTime = new Date(startTime.getTime() + event.event.duration * 60000);

//     // Prepare payload based on booking mode
//     const payload = isTeamMode 
//       ? {
//           eventId: event.event.id,
//           startTime: startTime.toISOString(),
//           endTime: endTime.toISOString(),
//           title: event.event.title,
//           description: formData.additionalInfo,
//           teamId: selectAllTeam ? selectedTeam?.id : undefined,
//           selectedMemberIds: Array.from(selectedMembers),
//           externalAttendees,
//         }
//       : {
//           eventId: event.event.id,
//           startTime: startTime.toISOString(),
//           endTime: endTime.toISOString(),
//           guestName: formData.guestName,
//           guestEmail: formData.guestEmail,
//           additionalInfo: formData.additionalInfo,
//         };

//     bookMeetingMutation.mutate(payload);
//   };

//   // Generate time slots
//   const generateTimeSlots = () => {
//     if (!date || !availability?.data) return [];
//     const dayName = format(date, "EEEE").toUpperCase();
//     const dayAvailability = availability.data.find((d: any) => d.day === dayName);
//     if (!dayAvailability?.slots) return [];
//     return dayAvailability.slots.map((timeSlot: string) => ({
//       time: timeSlot,
//       available: true,
//     }));
//   };

//   const timeSlots = generateTimeSlots();

//   // Team selection handlers
//   const handleSelectTeam = (team: Team) => {
//     setSelectedTeam(team);
//     setIsTeamMode(true);
//     setShowTeamModal(false);
//     // Don't change step here - let user continue with date/time selection
//   };

//   const handleSwitchTo1on1 = () => {
//     setIsTeamMode(false);
//     setSelectedTeam(null);
//     setSelectedMembers(new Set());
//     setExternalAttendees([]);
//   };

//   const handleSelectAllTeam = (checked: boolean) => {
//     setSelectAllTeam(checked);
//     if (checked && teamMembersData?.data?.members) {
//       setSelectedMembers(new Set(teamMembersData.data.members.map((m: TeamMember) => m.id)));
//     } else {
//       setSelectedMembers(new Set());
//     }
//   };

//   const handleMemberToggle = (memberId: string) => {
//     const newSelected = new Set(selectedMembers);
//     if (newSelected.has(memberId)) {
//       newSelected.delete(memberId);
//       setSelectAllTeam(false);
//     } else {
//       newSelected.add(memberId);
//     }
//     setSelectedMembers(newSelected);
//   };

//   const addExternalAttendee = () => {
//     if (newExternalEmail && !externalAttendees.find(e => e.email === newExternalEmail)) {
//       setExternalAttendees([...externalAttendees, {
//         email: newExternalEmail,
//         name: newExternalName || newExternalEmail.split('@')[0],
//       }]);
//       setNewExternalEmail("");
//       setNewExternalName("");
//     }
//   };

//   const removeExternalAttendee = (email: string) => {
//     setExternalAttendees(externalAttendees.filter(e => e.email !== email));
//   };

//   const totalAttendees = selectedMembers.size + externalAttendees.length;

//   // Loading
//   if (isLoadingEvent) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   // Not found
//   if (!event?.event) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
//           <p className="text-gray-600">The event you are looking for does not exist.</p>
//         </div>
//       </div>
//     );
//   }

//   // Confirmed
//   if (step === "confirmed") {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <div className=" size-16  bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Check className="size-8 text-green-600" />
//             </div>
//             <CardTitle className="text-2xl text-green-600">Meeting Booked!</CardTitle>
//             <CardDescription>
//               {isTeamMode 
//                 ? "Your team meeting has been scheduled" 
//                 : "Your meeting has been successfully scheduled"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="text-center space-y-4">
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-medium text-gray-900 mb-2">{event.event.title}</h3>
//               <p className="text-sm text-gray-600">
//                 {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
//               </p>
//               <p className="text-sm text-gray-600">Duration: {event.event.duration} minutes</p>
//               {isTeamMode && (
//                 <p className="text-sm text-blue-600 mt-2">
//                   {totalAttendees} attendees invited
//                 </p>
//               )}
//             </div>
//             <p className="text-sm text-gray-600">
//               {isTeamMode 
//                 ? "Calendar invites have been sent to all attendees"
//                 : `A confirmation email with meeting details has been sent to ${formData.guestEmail}`}
//             </p>
//             <Link href={`/${username}`}>
//               <Button variant="outline" className="w-full">
//                 Back to Profile
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // Attendee Selection Step
//   if (step === "select-attendees") {
//     const members = teamMembersData?.data?.members || [];

//     return (

//       <div className="min-h-screen bg-gray-50  py-8 px-4">
//         <div className="max-w-2xl mx-auto">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle className="flex items-center gap-2">
//                     <Users className="size-5" />
//                     Select Attendees
//                   </CardTitle>
//                   <CardDescription>
//                     Choose team members for {event.event.title}
//                   </CardDescription>
//                 </div>
//                 <Button variant="ghost" size="sm" onClick={() => setStep("select-time")}>
//                   Back to Time
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <Tabs defaultValue="team" className="w-full">
//                 <TabsList className="grid w-full grid-cols-2">
//                   <TabsTrigger value="team">Team Members</TabsTrigger>
//                   <TabsTrigger value="external">
//                     External Guests
//                     {externalAttendees.length > 0 && (
//                       <Badge variant="secondary" className="ml-2">{externalAttendees.length}</Badge>
//                     )}
//                   </TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="team" className="mt-4">
//                   {isLoadingTeamMembers ? (
//                     <div className="flex items-center justify-center py-8">
//                       <Loader2 className="size-6 animate-spin" />
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       {/* Select All */}
//                       <div className="flex items-center !gap-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                         <Checkbox
//                           id="select-all"
//                           checked={selectAllTeam}
//                           onCheckedChange={(checked) => handleSelectAllTeam(checked as boolean)}
//                         />
//                         <label htmlFor="select-all" className="flex-1 cursor-pointer font-medium">
//                           Select All Team Members ({members.length} people)
//                         </label>
//                         <Users className="size-5 text-blue-500" />
//                       </div>

//                       <Separator />

//                       {/* Members List */}
//                       <ScrollArea className="h-[300px]">
//                         <div className="space-y-2">
//                           {members.map((member: TeamMember) => (
//                             <div
//                               key={member.id}
//                               className="flex items-center !gap-x-3 p-3 rounded-lg hover:bg-gray-50 border"
//                             >
//                               <Checkbox
//                                 id={member.id}
//                                 checked={selectedMembers.has(member.id)}
//                                 onCheckedChange={() => handleMemberToggle(member.id)}
//                               />
//                               <Avatar className="size-8">
//                                 <AvatarImage src={member.image} />
//                                 <AvatarFallback>
//                                   {member.name?.charAt(0) || member.email.charAt(0)}
//                                 </AvatarFallback>
//                               </Avatar>
//                               <label htmlFor={member.id} className="flex-1 cursor-pointer">
//                                 <div className="font-medium">{member.name || 'Unnamed'}</div>
//                                 <div className="text-sm text-gray-500">{member.email}</div>
//                               </label>
//                               <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
//                                 {member.role}
//                               </Badge>
//                             </div>
//                           ))}
//                         </div>
//                       </ScrollArea>
//                     </div>
//                   )}
//                 </TabsContent>

//                 {/* <TabsContent value="external" className="mt-4">
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-2">
//                       <Input
//                         placeholder="Name (optional)"
//                         value={newExternalName}
//                         onChange={(e) => setNewExternalName(e.target.value)}
//                       />
//                       <div className="flex gap-2">
//                         <Input
//                           placeholder="email@example.com"
//                           type="email"
//                           value={newExternalEmail}
//                           onChange={(e) => setNewExternalEmail(e.target.value)}
//                           onKeyPress={(e) => e.key === 'Enter' && addExternalAttendee()}
//                         />
//                         <Button onClick={addExternalAttendee} size="icon">
//                           <Plus className="size-4" />
//                         </Button>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       {externalAttendees.map((attendee) => (
//                         <div
//                           key={attendee.email}
//                           className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
//                         >
//                           <div className="flex items-center gap-3">
//                             <Avatar className="size-8">
//                               <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
//                             </Avatar>
//                             <div>
//                               <div className="font-medium">{attendee.name}</div>
//                               <div className="text-sm text-gray-500">{attendee.email}</div>
//                             </div>
//                             <Badge variant="outline">External</Badge>
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => removeExternalAttendee(attendee.email)}
//                           >
//                             <X className="size-4" />
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </TabsContent> */}
//                 <TabsContent value="external" className="mt-4">
//   <div className="space-y-4">
//     <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
//       <p className="text-sm text-yellow-800">
//         <Mail className="size-4 inline mr-1" />
//         External attendees will receive an email invitation automatically when you schedule the meeting.
//       </p>
//     </div>

//     <div className="grid grid-cols-2 gap-2">
//       <Input
//         placeholder="Name (optional)"
//         value={newExternalName}
//         onChange={(e) => setNewExternalName(e.target.value)}
//       />
//       <div className="flex gap-2">
//         <Input
//           placeholder="email@example.com"
//           type="email"
//           value={newExternalEmail}
//           onChange={(e) => setNewExternalEmail(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && addExternalAttendee()}
//         />
//         <Button onClick={addExternalAttendee} size="icon" variant="outline">
//           <Plus className="size-4" />
//         </Button>
//       </div>
//     </div>

//     <div className="space-y-2">
//       {externalAttendees.map((attendee) => (
//         <div
//           key={attendee.email}
//           className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
//         >
//           <div className="flex items-center gap-3">
//             <Avatar className="size-8 bg-orange-100">
//               <AvatarFallback className="text-orange-600 text-sm">
//                 {attendee.name.charAt(0).toUpperCase()}
//               </AvatarFallback>
//             </Avatar>
//             <div>
//               <div className="font-medium text-sm">{attendee.name}</div>
//               <div className="text-xs text-gray-500">{attendee.email}</div>
//             </div>
//             <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
//               <Mail className=" size-3   mr-1" />
//               External
//             </Badge>
//           </div>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => removeExternalAttendee(attendee.email)}
//           >
//             <X className="size-4" />
//           </Button>
//         </div>
//       ))}

//       {externalAttendees.length === 0 && (
//         <div className="text-center py-8 text-gray-400">
//           <Mail className=" size-12  mx-auto mb-2 opacity-50" />
//           <p className="text-sm">No external attendees added yet</p>
//           <p className="text-xs">Add email addresses above to invite external guests</p>
//         </div>
//       )}
//     </div>
//   </div>
// </TabsContent>
//               </Tabs>

//               {/* Summary */}
//               {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium">
//                     Total Attendees: {totalAttendees}
//                   </span>
//                   <div className="flex gap-2">
//                     {selectedMembers.size > 0 && (
//                       <Badge variant="secondary">
//                         <Users className=" size-3   mr-1" />
//                         {selectedMembers.size} team
//                       </Badge>
//                     )}
//                     {externalAttendees.length > 0 && (
//                       <Badge variant="outline">
//                         <Mail className=" size-3   mr-1" />
//                         {externalAttendees.length} external
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               </div> */}

// <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//   <div className="flex items-center justify-between mb-3">
//     <span className="text-sm font-medium">
//       Total Attendees: {totalAttendees}
//     </span>
//   </div>

//   {/* Show breakdown */}
//   <div className="flex flex-wrap gap-2">
//     {selectedMembers.size > 0 && (
//       <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//         <Users className=" size-3   mr-1" />
//         {selectedMembers.size} team member{selectedMembers.size !== 1 ? 's' : ''}
//       </Badge>
//     )}
//     {externalAttendees.length > 0 && (
//       <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
//         <Mail className=" size-3   mr-1" />
//         {externalAttendees.length} external guest{externalAttendees.length !== 1 ? 's' : ''}
//       </Badge>
//     )}
//   </div>

//   {/* Preview of external attendees */}
//   {externalAttendees.length > 0 && (
//     <div className="mt-3 pt-3 border-t border-gray-200">
//       <p className="text-xs text-gray-500 mb-2">External guests to be invited:</p>
//       <div className="flex flex-wrap gap-1">
//         {externalAttendees.map(att => (
//           <span key={att.email} className="text-xs bg-white px-2 py-1 rounded border">
//             {att.email}
//           </span>
//         ))}
//       </div>
//     </div>
//   )}
// </div>

//               <div className="mt-6 flex justify-end">
//                 <Button
//                   onClick={() => setStep("book-meeting")}
//                   disabled={totalAttendees === 0}
//                 >
//                   Next: Confirm Details
//                   <ChevronRight className="size-4 ml-2" />
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   // Main booking flow - SELECT TIME or BOOK MEETING
//   return (
//     <ExpandableScreen
//     layoutId="cta-card"
//     triggerRadius="100px"
//     contentRadius="24px"
//     open={isOpen}
//       onOpenChange={setIsOpen}
//   >
//     <ExpandableScreenContent className="bg-primary">
//       {/* <div className="flex h-full items-center justify-center p-8">

//       </div> */}
//       <div className="min-h-screen h-screen flex justify-center items-center">
//       {step === "select-time" && (
//         <div className="w-full p-4 max-w-4xl rounded-2xl bg-[#FAFAFA] shadow-md dark:bg-[#141414]">
//           {/* Header with Team Selection Button */}
//           <div className="flex items-center justify-between mb-4 px-2">
//             <div className="flex items-center gap-2">
//               {event.event.user.image && (
//                 <img
//                   src={event.event.user.image}
//                   alt={event.event.user.name}
//                   className="size-8 rounded-full"
//                 />
//               )}
//               <div>
//                 <h3 className="font-medium dark:text-white">{event.event.user.name}</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">{event.event.title}</p>
//               </div>
//             </div>

//             {/* Team Selection Dropdown/Button */}
//             {teamsData?.data && teamsData.data.length > 0 && (
//               <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
//                 <DialogTrigger asChild>
//                   <Button 
//                     variant={isTeamMode ? "default" : "outline"} 
//                     size="sm"
//                     className="gap-2"
//                   >
//                     <Users className="size-4" />
//                     {isTeamMode ? selectedTeam?.name : "Schedule with Team"}
//                     {isTeamMode && <Badge variant="secondary" className="ml-1 text-xs">{totalAttendees}</Badge>}
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="max-w-md">
//                   <DialogHeader>
//                     <DialogTitle>Schedule with Team</DialogTitle>
//                   </DialogHeader>
//                   <div className="space-y-4 mt-4">
//                     <p className="text-sm text-gray-500">Select a team to schedule this meeting with multiple attendees:</p>

//                     {teamsData.data.map((team: Team) => (
//                       <button
//                         key={team.id}
//                         onClick={() => handleSelectTeam(team)}
//                         className={`w-full p-4 text-left border rounded-xl transition-all ${
//                           selectedTeam?.id === team.id 
//                             ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
//                             : 'hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
//                         }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className=" size-10  bg-purple-100 rounded-full flex items-center justify-center">
//                             <Users className="size-5 text-purple-600" />
//                           </div>
//                           <div className="flex-1">
//                             <h3 className="font-medium">{team.name}</h3>
//                             <p className="text-xs text-gray-500">{team.members?.length || 0} members</p>
//                           </div>
//                           {selectedTeam?.id === team.id && <Check className="size-5 text-blue-500" />}
//                         </div>
//                       </button>
//                     ))}

//                     <Separator />

//                     <button
//                       onClick={() => {
//                         handleSwitchTo1on1();
//                         setShowTeamModal(false);
//                       }}
//                       className="w-full p-4 text-left border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className=" size-10  bg-gray-100 rounded-full flex items-center justify-center">
//                           <User className="size-5 text-gray-600" />
//                         </div>
//                         <div>
//                           <h3 className="font-medium">One-on-One Only</h3>
//                           <p className="text-xs text-gray-500">Personal meeting (default)</p>
//                         </div>
//                       </div>
//                     </button>
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             )}
//           </div>

//           {/* Show selected team info if in team mode */}
//           {isTeamMode && selectedTeam && (
//             <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Users className="size-5 text-blue-600" />
//                 <div>
//                   <span className="font-medium text-sm">Team: {selectedTeam.name}</span>
//                   <p className="text-xs text-gray-500">
//                     {totalAttendees > 0 
//                       ? `${totalAttendees} attendees selected` 
//                       : "Click 'Select Attendees' to choose members"}
//                   </p>
//                 </div>
//               </div>
//               <Button 
//                 size="sm" 
//                 variant="outline"
//                 onClick={() => setStep("select-attendees")}
//               >
//                 {totalAttendees > 0 ? "Edit Attendees" : "Select Attendees"}
//               </Button>
//             </div>
//           )}


// {isTeamMode && (
//   <div className="mt-4 pt-4 border-t">
//     <p className="text-sm font-medium text-gray-700 mb-2">Attendees ({totalAttendees})</p>
//     <div className="space-y-2">
//       {Array.from(selectedMembers).map((memberId) => {
//         const member = teamMembersData?.data?.members.find((m: TeamMember) => m.id === memberId);
//         return member ? (
//           <div key={member.id} className="flex items-center gap-2 text-sm">
//             <Avatar className="size-6">
//               <AvatarFallback className="text-xs">{member.name?.charAt(0)}</AvatarFallback>
//             </Avatar>
//             <span>{member.name || member.email}</span>
//             <Badge variant="secondary" className="text-xs">Team</Badge>
//           </div>
//         ) : null;
//       })}
//       {externalAttendees.map((attendee) => (
//         <div key={attendee.email} className="flex items-center gap-2 text-sm">
//           <Avatar className="size-6 bg-orange-100">
//             <AvatarFallback className="text-xs text-orange-600">{attendee.name.charAt(0)}</AvatarFallback>
//           </Avatar>
//           <span>{attendee.name}</span>
//           <span className="text-gray-500 text-xs">({attendee.email})</span>
//           <Badge variant="outline" className="text-xs">External</Badge>
//         </div>
//       ))}
//     </div>
//     <p className="text-xs text-green-600 mt-2">
//       ✓ Calendar invites sent to all attendees
//     </p>
//   </div>
// )}

//           <div className="flex max-w-full w-full h-96">
//             <div className="space-y-4 w-full flex-grow p-2">
//               {event.event.description && (
//                 <p className="text-gray-600 dark:text-gray-400 text-sm">{event.event.description}</p>
//               )}

//               <div className="flex items-center gap-2 text-sm dark:text-gray-300">
//                 <Clock className="size-4" />
//                 <span>{event.event.duration} minutes</span>
//               </div>

//               <div className="flex items-center gap-2 text-sm dark:text-gray-300">
//                 <Calendar1 className="size-4" />
//                 <span className="text-xs">{event.event.locationType.replace("_", " ")}</span>
//               </div>
//             </div>

//             <div className="relative h-96 flex-grow w-full">
//               <Calendar
//                 mode="single"
//                 selected={date}
//                 onSelect={(newDate) => {
//                   if (newDate) {
//                     setDate(newDate);
//                     setTime(null);
//                   }
//                 }}
//                 className="bg-transparent w-full flex-grow h-full"
//                 disabled={[{ before: today }]}
//               />
//             </div>

//             <div className="relative w-full">
//               <ScrollArea className="h-full">
//                 <div className="space-y-3">
//                   <div className="flex h-5 shrink-0 items-center px-5">
//                     <p className="text-sm font-medium dark:text-white">{format(date, "EEEE, d")}</p>
//                   </div>
//                   <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
//                     {timeSlots.map(({ time: timeSlot, available }) => (
//                       <Button
//                         key={timeSlot}
//                         variant={time === timeSlot ? "default" : "outline"}
//                         size="sm"
//                         className="w-full bg-transparent dark:text-white dark:border-gray-600"
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

//           {/* Continue button for team mode */}
//           {/* {isTeamMode && time && (
//             <div className="mt-4 flex justify-end">
//               <Button 
//                 onClick={() => setStep("select-attendees")}
//                 className="gap-2"
//               >
//                 Continue to Attendees
//                 <ChevronRight className="size-4" />
//               </Button>
//             </div>
//           )} */}
//           {/* Continue button */}
// {time && (
//   <div className="mt-4 flex justify-end">
//     <Button 
//       onClick={() => isTeamMode ? setStep("select-attendees") : setStep("book-meeting")}
//       className="gap-2"
//     >
//       {isTeamMode ? "Continue to Attendees" : "Continue"}
//       <ChevronRight className="size-4" />
//     </Button>
//   </div>
// )}
//         </div>
//       )}

//       {step === "book-meeting" && (
//         <Card className="max-w-2xl mx-auto">
//           <CardHeader>
//             <CardTitle>
//               {isTeamMode ? "Confirm Team Meeting" : "Enter Your Details"}
//             </CardTitle>
//             <CardDescription>
//               {isTeamMode 
//                 ? "Review and confirm your team meeting details"
//                 : "Please provide your information to complete the booking"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="bg-blue-50 p-4 rounded-lg mb-6">
//               <h3 className="font-medium text-blue-900 mb-2">Selected Time</h3>
//               <p className="text-blue-800">
//                 {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
//               </p>
//               <p className="text-sm text-blue-700">
//                 {event.event.title} • {event.event.duration} minutes
//               </p>

//               {isTeamMode && (
//                 <div className="mt-3 pt-3 border-t border-blue-200">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-medium text-blue-900">Attendees ({totalAttendees})</p>
//                     <Button 
//                       variant="ghost" 
//                       size="sm" 
//                       onClick={() => setStep("select-attendees")}
//                     >
//                       Edit
//                     </Button>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {Array.from(selectedMembers).map((memberId) => {
//                       const member = teamMembersData?.data?.members.find((m: TeamMember) => m.id === memberId);
//                       return member ? (
//                         <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
//                           <Avatar className="size-4">
//                             <AvatarFallback className="text-xs">{member.name?.charAt(0)}</AvatarFallback>
//                           </Avatar>
//                           {member.name || member.email}
//                         </Badge>
//                       ) : null;
//                     })}
//                     {externalAttendees.map((attendee) => (
//                       <Badge key={attendee.email} variant="outline" className="flex items-center gap-1">
//                         <Mail className=" size-3  " />
//                         {attendee.name}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <form onSubmit={handleBookMeeting} className="space-y-4">
//               {!isTeamMode ? (
//                 // Original 1-on-1 form fields
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Your Name *
//                     </label>
//                     <Input
//                       type="text"
//                       value={formData.guestName}
//                       onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email Address *
//                     </label>
//                     <Input
//                       type="email"
//                       value={formData.guestEmail}
//                       onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </>
//               ) : (
//                 // Team mode - show organizer info (optional)
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Meeting Notes (Optional)
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
//                     rows={3}
//                     value={formData.additionalInfo}
//                     onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
//                     placeholder="Add agenda, topics to discuss, or any additional information for attendees..."
//                   />
//                 </div>
//               )}

//               {!isTeamMode && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Additional Information (Optional)
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
//                     rows={3}
//                     value={formData.additionalInfo}
//                     onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
//                     placeholder="Any additional details or questions..."
//                   />
//                 </div>
//               )}

//               <div className="flex gap-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setStep(isTeamMode ? "select-attendees" : "select-time")}
//                   className="flex-1"
//                 >
//                   Back
//                 </Button>
//                 <Button
//                   type="submit"
//                   disabled={bookMeetingMutation.isPending || (isTeamMode && totalAttendees === 0)}
//                   className="flex-1"
//                 >
//                   {bookMeetingMutation.isPending 
//                     ? "Booking..." 
//                     : isTeamMode 
//                       ? "Schedule Team Meeting" 
//                       : "Book Meeting"
//                   }
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//     </ExpandableScreenContent>
//   </ExpandableScreen>


//   );
// }

// import { useRouter } from "next/router";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Clock, Calendar1, Check, Users, User, X, Plus, Mail, ChevronRight, Loader2 } from "lucide-react";
// import Link from "next/link";
// import { format, addMinutes } from "date-fns";
// import { useState, useEffect } from "react";
// import { Calendar } from "@/components/ui/calendar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { toast } from "sonner"
// import {
//   ExpandableScreen,
//   ExpandableScreenContent,
//   ExpandableScreenTrigger,
// } from "@/components/ui/ExpandableScreen"

// // Types for team functionality
// interface TeamMember {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
//   role: string;
// }

// interface Team {
//   id: string;
//   name: string;
//   slug: string;
//   members: TeamMember[];
// }

// interface ExternalAttendee {
//   email: string;
//   name: string;
// }

// interface BookingPageProps {
//   externalOpen?: boolean;
//   onOpenChange?: (open: boolean) => void;
//   username?: string;
//   slug?: string;
//   eventData?: any;
// }

// export default function BookingPage({ 
//   externalOpen, 
//   onOpenChange,
//   username: propUsername,
//   slug: propSlug,
//   eventData: propEventData
// }: BookingPageProps) {
//   const router = useRouter();
//   const [internalOpen, setInternalOpen] = useState(false);

//   // Use external control if provided, otherwise internal
//   const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
//   const setIsOpen = onOpenChange || setInternalOpen;

//   const today = new Date();
//   const [date, setDate] = useState<Date>(today);
//   const [time, setTime] = useState<string | null>(null);
//   const [step, setStep] = useState<"select-time" | "select-attendees" | "book-meeting" | "confirmed">("select-time");

//   // Team-related state
//   const [showTeamModal, setShowTeamModal] = useState(false);
//   const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
//   const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
//   const [selectAllTeam, setSelectAllTeam] = useState(false);
//   const [externalAttendees, setExternalAttendees] = useState<ExternalAttendee[]>([]);
//   const [newExternalEmail, setNewExternalEmail] = useState("");
//   const [newExternalName, setNewExternalName] = useState("");
//   const [isTeamMode, setIsTeamMode] = useState(false);

//   // Form data
//   const [formData, setFormData] = useState({
//     guestName: "",
//     guestEmail: "",
//     additionalInfo: "",
//   });

//   // Use URL params if props not provided (direct page access)
//   const { username: urlUsername, slug: urlSlug } = router.query;
//   const effectiveUsername = propUsername || urlUsername;
//   const effectiveSlug = propSlug || urlSlug;

//   // Fetch event - use prop data as initial if available
//   const { data: event, isLoading: isLoadingEvent } = useQuery({
//     queryKey: ["public-event", effectiveUsername, effectiveSlug],
//     queryFn: async () => {
//       const response = await fetch(`/api/event/public/${effectiveUsername}/${effectiveSlug}`);
//       if (!response.ok) throw new Error("Failed to fetch event");
//       return response.json();
//     },
//     enabled: !!effectiveUsername && !!effectiveSlug,
//     initialData: propEventData || undefined,
//   });

//   // Fetch user's teams (if logged in)
//   const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
//     queryKey: ["user-teams"],
//     queryFn: async () => {
//       const response = await fetch('/api/teams');
//       if (!response.ok) return null;
//       return response.json();
//     },
//     retry: false,
//   });

//   // Fetch team members when team is selected
//   const { data: teamMembersData, isLoading: isLoadingTeamMembers } = useQuery({
//     queryKey: ["team-members", selectedTeam?.slug],
//     queryFn: async () => {
//       if (!selectedTeam) return null;
//       const response = await fetch(`/api/teams/${selectedTeam.slug}/members-for-selection`);
//       if (!response.ok) throw new Error("Failed to fetch team members");
//       return response.json();
//     },
//     enabled: !!selectedTeam,
//   });

//   // Fetch availability
//   const { data: availability } = useQuery({
//     queryKey: ["availability", event?.event?.id],
//     queryFn: async () => {
//       const response = await fetch(`/api/availability/public/${event.event.id}`);
//       if (!response.ok) throw new Error("Failed to fetch availability");
//       return response.json();
//     },
//     enabled: !!event?.event?.id,
//   });

//   // Book meeting mutation (supports both 1on1 and team)
//   const bookMeetingMutation = useMutation({
//     mutationFn: async (bookingData: any) => {
//       const endpoint = isTeamMode 
//         ? "/api/meetings/team/create" 
//         : "/api/meeting/public/create";

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(bookingData),
//       });
//       if (!response.ok) throw new Error("Failed to book meeting");
//       return response.json();
//     },
//     onSuccess: () => {
//       setStep("confirmed");
//     },
//   });

//   const handleBookMeeting = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!date || !time || !event?.event) return;

//     const startTime = new Date(date);
//     const [hours, minutes] = time.split(":").map(Number);
//     startTime.setHours(hours, minutes, 0, 0);

//     const endTime = new Date(startTime.getTime() + event.event.duration * 60000);

//     // Prepare payload based on booking mode
//     const payload = isTeamMode 
//       ? {
//           eventId: event.event.id,
//           startTime: startTime.toISOString(),
//           endTime: endTime.toISOString(),
//           title: event.event.title,
//           description: formData.additionalInfo,
//           teamId: selectAllTeam ? selectedTeam?.id : undefined,
//           selectedMemberIds: Array.from(selectedMembers),
//           externalAttendees,
//         }
//       : {
//           eventId: event.event.id,
//           startTime: startTime.toISOString(),
//           endTime: endTime.toISOString(),
//           guestName: formData.guestName,
//           guestEmail: formData.guestEmail,
//           additionalInfo: formData.additionalInfo,
//         };

//     bookMeetingMutation.mutate(payload);
//   };

//   // Generate time slots
//   const generateTimeSlots = () => {
//     if (!date || !availability?.data) return [];
//     const dayName = format(date, "EEEE").toUpperCase();
//     const dayAvailability = availability.data.find((d: any) => d.day === dayName);
//     if (!dayAvailability?.slots) return [];
//     return dayAvailability.slots.map((timeSlot: string) => ({
//       time: timeSlot,
//       available: true,
//     }));
//   };

//   const timeSlots = generateTimeSlots();

//   // Team selection handlers
//   const handleSelectTeam = (team: Team) => {
//     setSelectedTeam(team);
//     setIsTeamMode(true);
//     setShowTeamModal(false);
//   };

//   const handleSwitchTo1on1 = () => {
//     setIsTeamMode(false);
//     setSelectedTeam(null);
//     setSelectedMembers(new Set());
//     setExternalAttendees([]);
//   };

//   const handleSelectAllTeam = (checked: boolean) => {
//     setSelectAllTeam(checked);
//     if (checked && teamMembersData?.data?.members) {
//       setSelectedMembers(new Set(teamMembersData.data.members.map((m: TeamMember) => m.id)));
//     } else {
//       setSelectedMembers(new Set());
//     }
//   };

//   const handleMemberToggle = (memberId: string) => {
//     const newSelected = new Set(selectedMembers);
//     if (newSelected.has(memberId)) {
//       newSelected.delete(memberId);
//       setSelectAllTeam(false);
//     } else {
//       newSelected.add(memberId);
//     }
//     setSelectedMembers(newSelected);
//   };

//   const addExternalAttendee = () => {
//     if (newExternalEmail && !externalAttendees.find(e => e.email === newExternalEmail)) {
//       setExternalAttendees([...externalAttendees, {
//         email: newExternalEmail,
//         name: newExternalName || newExternalEmail.split('@')[0],
//       }]);
//       setNewExternalEmail("");
//       setNewExternalName("");
//     }
//   };

//   const removeExternalAttendee = (email: string) => {
//     setExternalAttendees(externalAttendees.filter(e => e.email !== email));
//   };

//   const totalAttendees = selectedMembers.size + externalAttendees.length;

//   // Don't render if modal is closed (when used as modal)
//   if (externalOpen !== undefined && !isOpen) return null;

//   // Loading state
//   if (isLoadingEvent) {
//     return (
//       <ExpandableScreen
//         layoutId="cta-card"
//         triggerRadius="100px"
//         contentRadius="24px"
//         open={isOpen}
//         onOpenChange={setIsOpen}
//       >
//         <ExpandableScreenContent className="bg-primary">
//           <div className="min-h-screen h-screen flex justify-center items-center">
//             <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//           </div>
//         </ExpandableScreenContent>
//       </ExpandableScreen>
//     );
//   }

//   // Not found
//   if (!event?.event) {
//     return (
//       <ExpandableScreen
//         layoutId="cta-card"
//         triggerRadius="100px"
//         contentRadius="24px"
//         open={isOpen}
//         onOpenChange={setIsOpen}
//       >
//         <ExpandableScreenContent className="bg-primary">
//           <div className="min-h-screen h-screen flex justify-center items-center">
//             <div className="text-center">
//               <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
//               <p className="text-gray-600">The event you are looking for does not exist.</p>
//             </div>
//           </div>
//         </ExpandableScreenContent>
//       </ExpandableScreen>
//     );
//   }

//   // Safely access event data with fallbacks
//   const eventData = event.event;
//   const userData = eventData.user || {};
//   const userImage = userData.image || "";
//   const userName = userData.name || "User";
//   const eventTitle = eventData.title || "Event";
//   const eventDuration = eventData.duration || 30;
//   const eventDescription = eventData.description || "";
//   const eventLocationType = eventData.locationType || "ONLINE";
//   const meetingsCount = eventData._count?.meetings || 0;

//   // Confirmed step
//   if (step === "confirmed") {
//     return (
//       <ExpandableScreen
//         layoutId="cta-card"
//         triggerRadius="100px"
//         contentRadius="24px"
//         open={isOpen}
//         onOpenChange={setIsOpen}
//       >
//         <ExpandableScreenContent className="bg-primary">
//           <div className="min-h-screen h-screen flex justify-center items-center">
//             <Card className="w-full max-w-md">
//               <CardHeader className="text-center">
//                 <div className=" size-16  bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Check className="size-8 text-green-600" />
//                 </div>
//                 <CardTitle className="text-2xl text-green-600">Meeting Booked!</CardTitle>
//                 <CardDescription>
//                   {isTeamMode 
//                     ? "Your team meeting has been scheduled" 
//                     : "Your meeting has been successfully scheduled"}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="text-center space-y-4">
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h3 className="font-medium text-gray-900 mb-2">{eventTitle}</h3>
//                   <p className="text-sm text-gray-600">
//                     {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
//                   </p>
//                   <p className="text-sm text-gray-600">Duration: {eventDuration} minutes</p>
//                   {isTeamMode && (
//                     <p className="text-sm text-blue-600 mt-2">
//                       {totalAttendees} attendees invited
//                     </p>
//                   )}
//                 </div>
//                 <p className="text-sm text-gray-600">
//                   {isTeamMode 
//                     ? "Calendar invites have been sent to all attendees"
//                     : `A confirmation email with meeting details has been sent to ${formData.guestEmail}`}
//                 </p>
//                 <Button 
//                   variant="outline" 
//                   className="w-full"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Close
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </ExpandableScreenContent>
//       </ExpandableScreen>
//     );
//   }

//   // Attendee Selection Step
//   if (step === "select-attendees") {
//     const members = teamMembersData?.data?.members || [];

//     return (
//       <ExpandableScreen
//         layoutId="cta-card"
//         triggerRadius="100px"
//         contentRadius="24px"
//         open={isOpen}
//         onOpenChange={setIsOpen}
//       >
//         <ExpandableScreenContent className="bg-primary">
//           <div className="min-h-screen h-screen flex justify-center items-center py-8 px-4">
//             <div className="max-w-2xl mx-auto w-full">
//               <Card>
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <CardTitle className="flex items-center gap-2">
//                         <Users className="size-5" />
//                         Select Attendees
//                       </CardTitle>
//                       <CardDescription>
//                         Choose team members for {eventTitle}
//                       </CardDescription>
//                     </div>
//                     <Button variant="ghost" size="sm" onClick={() => setStep("select-time")}>
//                       Back to Time
//                     </Button>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <Tabs defaultValue="team" className="w-full">
//                     <TabsList className="grid w-full grid-cols-2">
//                       <TabsTrigger value="team">Team Members</TabsTrigger>
//                       <TabsTrigger value="external">
//                         External Guests
//                         {externalAttendees.length > 0 && (
//                           <Badge variant="secondary" className="ml-2">{externalAttendees.length}</Badge>
//                         )}
//                       </TabsTrigger>
//                     </TabsList>

//                     <TabsContent value="team" className="mt-4">
//                       {isLoadingTeamMembers ? (
//                         <div className="flex items-center justify-center py-8">
//                           <Loader2 className="size-6 animate-spin" />
//                         </div>
//                       ) : (
//                         <div className="space-y-4">
//                           <div className="flex items-center !gap-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                             <Checkbox
//                               id="select-all"
//                               checked={selectAllTeam}
//                               onCheckedChange={(checked) => handleSelectAllTeam(checked as boolean)}
//                             />
//                             <label htmlFor="select-all" className="flex-1 cursor-pointer font-medium">
//                               Select All Team Members ({members.length} people)
//                             </label>
//                             <Users className="size-5 text-blue-500" />
//                           </div>

//                           <Separator />

//                           <ScrollArea className="h-[300px]">
//                             <div className="space-y-2">
//                               {members.map((member: TeamMember) => (
//                                 <div
//                                   key={member.id}
//                                   className="flex items-center !gap-x-3 p-3 rounded-lg hover:bg-gray-50 border"
//                                 >
//                                   <Checkbox
//                                     id={member.id}
//                                     checked={selectedMembers.has(member.id)}
//                                     onCheckedChange={() => handleMemberToggle(member.id)}
//                                   />
//                                   <Avatar className="size-8">
//                                     <AvatarImage src={member.image} />
//                                     <AvatarFallback>
//                                       {member.name?.charAt(0) || member.email.charAt(0)}
//                                     </AvatarFallback>
//                                   </Avatar>
//                                   <label htmlFor={member.id} className="flex-1 cursor-pointer">
//                                     <div className="font-medium">{member.name || 'Unnamed'}</div>
//                                     <div className="text-sm text-gray-500">{member.email}</div>
//                                   </label>
//                                   <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
//                                     {member.role}
//                                   </Badge>
//                                 </div>
//                               ))}
//                             </div>
//                           </ScrollArea>
//                         </div>
//                       )}
//                     </TabsContent>

//                     <TabsContent value="external" className="mt-4">
//                       <div className="space-y-4">
//                         <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
//                           <p className="text-sm text-yellow-800">
//                             <Mail className="size-4 inline mr-1" />
//                             External attendees will receive an email invitation automatically when you schedule the meeting.
//                           </p>
//                         </div>

//                         <div className="grid grid-cols-2 gap-2">
//                           <Input
//                             placeholder="Name (optional)"
//                             value={newExternalName}
//                             onChange={(e) => setNewExternalName(e.target.value)}
//                           />
//                           <div className="flex gap-2">
//                             <Input
//                               placeholder="email@example.com"
//                               type="email"
//                               value={newExternalEmail}
//                               onChange={(e) => setNewExternalEmail(e.target.value)}
//                               onKeyPress={(e) => e.key === 'Enter' && addExternalAttendee()}
//                             />
//                             <Button onClick={addExternalAttendee} size="icon" variant="outline">
//                               <Plus className="size-4" />
//                             </Button>
//                           </div>
//                         </div>

//                         <div className="space-y-2">
//                           {externalAttendees.map((attendee) => (
//                             <div
//                               key={attendee.email}
//                               className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
//                             >
//                               <div className="flex items-center gap-3">
//                                 <Avatar className="size-8 bg-orange-100">
//                                   <AvatarFallback className="text-orange-600 text-sm">
//                                     {attendee.name.charAt(0).toUpperCase()}
//                                   </AvatarFallback>
//                                 </Avatar>
//                                 <div>
//                                   <div className="font-medium text-sm">{attendee.name}</div>
//                                   <div className="text-xs text-gray-500">{attendee.email}</div>
//                                 </div>
//                                 <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
//                                   <Mail className=" size-3   mr-1" />
//                                   External
//                                 </Badge>
//                               </div>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 onClick={() => removeExternalAttendee(attendee.email)}
//                               >
//                                 <X className="size-4" />
//                               </Button>
//                             </div>
//                           ))}

//                           {externalAttendees.length === 0 && (
//                             <div className="text-center py-8 text-gray-400">
//                               <Mail className=" size-12  mx-auto mb-2 opacity-50" />
//                               <p className="text-sm">No external attendees added yet</p>
//                               <p className="text-xs">Add email addresses above to invite external guests</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </TabsContent>
//                   </Tabs>

//                   <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center justify-between mb-3">
//                       <span className="text-sm font-medium">
//                         Total Attendees: {totalAttendees}
//                       </span>
//                     </div>

//                     <div className="flex flex-wrap gap-2">
//                       {selectedMembers.size > 0 && (
//                         <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//                           <Users className=" size-3   mr-1" />
//                           {selectedMembers.size} team member{selectedMembers.size !== 1 ? 's' : ''}
//                         </Badge>
//                       )}
//                       {externalAttendees.length > 0 && (
//                         <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
//                           <Mail className=" size-3   mr-1" />
//                           {externalAttendees.length} external guest{externalAttendees.length !== 1 ? 's' : ''}
//                         </Badge>
//                       )}
//                     </div>

//                     {externalAttendees.length > 0 && (
//                       <div className="mt-3 pt-3 border-t border-gray-200">
//                         <p className="text-xs text-gray-500 mb-2">External guests to be invited:</p>
//                         <div className="flex flex-wrap gap-1">
//                           {externalAttendees.map(att => (
//                             <span key={att.email} className="text-xs bg-white px-2 py-1 rounded border">
//                               {att.email}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="mt-6 flex justify-end">
//                     <Button
//                       onClick={() => setStep("book-meeting")}
//                       disabled={totalAttendees === 0}
//                     >
//                       Next: Confirm Details
//                       <ChevronRight className="size-4 ml-2" />
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </ExpandableScreenContent>
//       </ExpandableScreen>
//     );
//   }

//   // Main booking flow - SELECT TIME or BOOK MEETING
//   return (
//     <ExpandableScreen
//       layoutId="cta-card"
//       triggerRadius="100px"
//       contentRadius="24px"
//       open={isOpen}
//       onOpenChange={setIsOpen}
//     >
//       <ExpandableScreenContent className="bg-primary">
//         <div className="min-h-screen h-screen flex justify-center items-center">
//           {step === "select-time" && (
//             <div className="w-full p-4 max-w-4xl rounded-2xl bg-[#FAFAFA] shadow-md dark:bg-[#141414]">
//               {/* Header with Team Selection Button */}
//               <div className="flex items-center justify-between mb-4 px-2">
//                 <div className="flex items-center gap-2">
//                   {userImage && (
//                     <img
//                       src={userImage}
//                       alt={userName}
//                       className="size-8 rounded-full"
//                     />
//                   )}
//                   <div>
//                     <h3 className="font-medium dark:text-white">{userName}</h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">{eventTitle}</p>
//                   </div>
//                 </div>

//                 {teamsData?.data && teamsData.data.length > 0 && (
//                   <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
//                     <DialogTrigger asChild>
//                       <Button 
//                         variant={isTeamMode ? "default" : "outline"} 
//                         size="sm"
//                         className="gap-2"
//                       >
//                         <Users className="size-4" />
//                         {isTeamMode ? selectedTeam?.name : "Schedule with Team"}
//                         {isTeamMode && <Badge variant="secondary" className="ml-1 text-xs">{totalAttendees}</Badge>}
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent className="max-w-md">
//                       <DialogHeader>
//                         <DialogTitle>Schedule with Team</DialogTitle>
//                       </DialogHeader>
//                       <div className="space-y-4 mt-4">
//                         <p className="text-sm text-gray-500">Select a team to schedule this meeting with multiple attendees:</p>

//                         {teamsData.data.map((team: Team) => (
//                           <button
//                             key={team.id}
//                             onClick={() => handleSelectTeam(team)}
//                             className={`w-full p-4 text-left border rounded-xl transition-all ${
//                               selectedTeam?.id === team.id 
//                                 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
//                                 : 'hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
//                             }`}
//                           >
//                             <div className="flex items-center gap-3">
//                               <div className=" size-10  bg-purple-100 rounded-full flex items-center justify-center">
//                                 <Users className="size-5 text-purple-600" />
//                               </div>
//                               <div className="flex-1">
//                                 <h3 className="font-medium">{team.name}</h3>
//                                 <p className="text-xs text-gray-500">{team.members?.length || 0} members</p>
//                               </div>
//                               {selectedTeam?.id === team.id && <Check className="size-5 text-blue-500" />}
//                             </div>
//                           </button>
//                         ))}

//                         <Separator />

//                         <button
//                           onClick={() => {
//                             handleSwitchTo1on1();
//                             setShowTeamModal(false);
//                           }}
//                           className="w-full p-4 text-left border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
//                         >
//                           <div className="flex items-center gap-3">
//                             <div className=" size-10  bg-gray-100 rounded-full flex items-center justify-center">
//                               <User className="size-5 text-gray-600" />
//                             </div>
//                             <div>
//                               <h3 className="font-medium">One-on-One Only</h3>
//                               <p className="text-xs text-gray-500">Personal meeting (default)</p>
//                             </div>
//                           </div>
//                         </button>
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                 )}
//               </div>

//               {isTeamMode && selectedTeam && (
//                 <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <Users className="size-5 text-blue-600" />
//                     <div>
//                       <span className="font-medium text-sm">Team: {selectedTeam.name}</span>
//                       <p className="text-xs text-gray-500">
//                         {totalAttendees > 0 
//                           ? `${totalAttendees} attendees selected` 
//                           : "Click 'Select Attendees' to choose members"}
//                       </p>
//                     </div>
//                   </div>
//                   <Button 
//                     size="sm" 
//                     variant="outline"
//                     onClick={() => setStep("select-attendees")}
//                   >
//                     {totalAttendees > 0 ? "Edit Attendees" : "Select Attendees"}
//                   </Button>
//                 </div>
//               )}

//               {isTeamMode && (
//                 <div className="mt-4 pt-4 border-t">
//                   <p className="text-sm font-medium text-gray-700 mb-2">Attendees ({totalAttendees})</p>
//                   <div className="space-y-2">
//                     {Array.from(selectedMembers).map((memberId) => {
//                       const member = teamMembersData?.data?.members.find((m: TeamMember) => m.id === memberId);
//                       return member ? (
//                         <div key={member.id} className="flex items-center gap-2 text-sm">
//                           <Avatar className="size-6">
//                             <AvatarFallback className="text-xs">{member.name?.charAt(0)}</AvatarFallback>
//                           </Avatar>
//                           <span>{member.name || member.email}</span>
//                           <Badge variant="secondary" className="text-xs">Team</Badge>
//                         </div>
//                       ) : null;
//                     })}
//                     {externalAttendees.map((attendee) => (
//                       <div key={attendee.email} className="flex items-center gap-2 text-sm">
//                         <Avatar className="size-6 bg-orange-100">
//                           <AvatarFallback className="text-xs text-orange-600">{attendee.name.charAt(0)}</AvatarFallback>
//                         </Avatar>
//                         <span>{attendee.name}</span>
//                         <span className="text-gray-500 text-xs">({attendee.email})</span>
//                         <Badge variant="outline" className="text-xs">External</Badge>
//                       </div>
//                     ))}
//                   </div>
//                   <p className="text-xs text-green-600 mt-2">
//                     ✓ Calendar invites sent to all attendees
//                   </p>
//                 </div>
//               )}

//               <div className="flex max-w-full w-full h-96">
//                 <div className="space-y-4 w-full flex-grow p-2">
//                   {eventDescription && (
//                     <p className="text-gray-600 dark:text-gray-400 text-sm">{eventDescription}</p>
//                   )}

//                   <div className="flex items-center gap-2 text-sm dark:text-gray-300">
//                     <Clock className="size-4" />
//                     <span>{eventDuration} minutes</span>
//                   </div>

//                   <div className="flex items-center gap-2 text-sm dark:text-gray-300">
//                     <Calendar1 className="size-4" />
//                     <span className="text-xs">{eventLocationType.replace("_", " ")}</span>
//                   </div>
//                 </div>

//                 <div className="relative h-96 flex-grow w-full">
//                   <Calendar
//                     mode="single"
//                     selected={date}
//                     onSelect={(newDate) => {
//                       if (newDate) {
//                         setDate(newDate);
//                         setTime(null);
//                       }
//                     }}
//                     className="bg-transparent w-full flex-grow h-full"
//                     disabled={[{ before: today }]}
//                   />
//                 </div>

//                 <div className="relative w-full">
//                   <ScrollArea className="h-full">
//                     <div className="space-y-3">
//                       <div className="flex h-5 shrink-0 items-center px-5">
//                         <p className="text-sm font-medium dark:text-white">{format(date, "EEEE, d")}</p>
//                       </div>
//                       <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
//                         {timeSlots.map(({ time: timeSlot, available }) => (
//                           <Button
//                             key={timeSlot}
//                             variant={time === timeSlot ? "default" : "outline"}
//                             size="sm"
//                             className="w-full bg-transparent dark:text-white dark:border-gray-600"
//                             onClick={() => setTime(timeSlot)}
//                             disabled={!available}
//                           >
//                             {timeSlot}
//                           </Button>
//                         ))}
//                       </div>
//                     </div>
//                   </ScrollArea>
//                 </div>
//               </div>

//               {time && (
//                 <div className="mt-4 flex justify-end">
//                   <Button 
//                     onClick={() => isTeamMode ? setStep("select-attendees") : setStep("book-meeting")}
//                     className="gap-2"
//                   >
//                     {isTeamMode ? "Continue to Attendees" : "Continue"}
//                     <ChevronRight className="size-4" />
//                   </Button>
//                 </div>
//               )}
//             </div>
//           )}

//           {step === "book-meeting" && (
//             <Card className="max-w-2xl mx-auto">
//               <CardHeader>
//                 <CardTitle>
//                   {isTeamMode ? "Confirm Team Meeting" : "Enter Your Details"}
//                 </CardTitle>
//                 <CardDescription>
//                   {isTeamMode 
//                     ? "Review and confirm your team meeting details"
//                     : "Please provide your information to complete the booking"}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="bg-blue-50 p-4 rounded-lg mb-6">
//                   <h3 className="font-medium text-blue-900 mb-2">Selected Time</h3>
//                   <p className="text-blue-800">
//                     {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
//                   </p>
//                   <p className="text-sm text-blue-700">
//                     {eventTitle} • {eventDuration} minutes
//                   </p>

//                   {isTeamMode && (
//                     <div className="mt-3 pt-3 border-t border-blue-200">
//                       <div className="flex items-center justify-between mb-2">
//                         <p className="text-sm font-medium text-blue-900">Attendees ({totalAttendees})</p>
//                         <Button 
//                           variant="ghost" 
//                           size="sm" 
//                           onClick={() => setStep("select-attendees")}
//                         >
//                           Edit
//                         </Button>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {Array.from(selectedMembers).map((memberId) => {
//                           const member = teamMembersData?.data?.members.find((m: TeamMember) => m.id === memberId);
//                           return member ? (
//                             <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
//                               <Avatar className="size-4">
//                                 <AvatarFallback className="text-xs">{member.name?.charAt(0)}</AvatarFallback>
//                               </Avatar>
//                               {member.name || member.email}
//                             </Badge>
//                           ) : null;
//                         })}
//                         {externalAttendees.map((attendee) => (
//                           <Badge key={attendee.email} variant="outline" className="flex items-center gap-1">
//                             <Mail className=" size-3  " />
//                             {attendee.name}
//                           </Badge>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <form onSubmit={handleBookMeeting} className="space-y-4">
//                   {!isTeamMode ? (
//                     <>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Your Name *
//                         </label>
//                         <Input
//                           type="text"
//                           value={formData.guestName}
//                           onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Email Address *
//                         </label>
//                         <Input
//                           type="email"
//                           value={formData.guestEmail}
//                           onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
//                           required
//                         />
//                       </div>
//                     </>
//                   ) : (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Meeting Notes (Optional)
//                       </label>
//                       <textarea
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
//                         rows={3}
//                         value={formData.additionalInfo}
//                         onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
//                         placeholder="Add agenda, topics to discuss, or any additional information for attendees..."
//                       />
//                     </div>
//                   )}

//                   {!isTeamMode && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Additional Information (Optional)
//                       </label>
//                       <textarea
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
//                         rows={3}
//                         value={formData.additionalInfo}
//                         onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
//                         placeholder="Any additional details or questions..."
//                       />
//                     </div>
//                   )}

//                   <div className="flex gap-4">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => setStep(isTeamMode ? "select-attendees" : "select-time")}
//                       className="flex-1"
//                     >
//                       Back
//                     </Button>
//                     <Button
//                       type="submit"
//                       disabled={bookMeetingMutation.isPending || (isTeamMode && totalAttendees === 0)}
//                       className="flex-1"
//                     >
//                       {bookMeetingMutation.isPending 
//                         ? "Booking..." 
//                         : isTeamMode 
//                           ? "Schedule Team Meeting" 
//                           : "Book Meeting"
//                       }
//                     </Button>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </ExpandableScreenContent>
//     </ExpandableScreen>
//   );
// }

import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Calendar1, Check, Users, User, X, Plus, Mail, ChevronRight, Loader2, ChevronLeft, Video } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Calendar } from "@/components/ui/bookingCalendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/animate-ui/components/animate/animated-dialog";
// import { toast } from "sonner"
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu"
import {
  ExternalLink,
  MapPin,
  FileText,
} from 'lucide-react';

// Types for team functionality
interface TeamMember {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  slug: string;
  members: TeamMember[];
}

interface ExternalAttendee {
  email: string;
  name: string;
}

interface BookingPageProps {
  externalOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  username?: string;
  slug?: string;
  eventData?: any;
}

export default function BookingPage({
  externalOpen,
  onOpenChange,
  username: propUsername,
  slug: propSlug,
  eventData: propEventData
}: BookingPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external control if provided, otherwise internal
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const today = new Date();
  const [date, setDate] = useState<Date>(today);
  const [time, setTime] = useState<string | null>(null);
  const [step, setStep] = useState<"select-time" | "select-attendees" | "book-meeting" | "confirmed">("select-time");

  // Team-related state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectAllTeam, setSelectAllTeam] = useState(false);
  const [externalAttendees, setExternalAttendees] = useState<ExternalAttendee[]>([]);
  const [newExternalEmail, setNewExternalEmail] = useState("");
  const [newExternalName, setNewExternalName] = useState("");
  const [isTeamMode, setIsTeamMode] = useState(false);
  // Form data
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    additionalInfo: "",
    externalLink: "",
    eventLocationType: "",
  });

  // Use URL params if props not provided (direct page access)
  const { username: urlUsername, slug: urlSlug } = router.query;
  const effectiveUsername = propUsername || urlUsername;
  const effectiveSlug = propSlug || urlSlug;

  // Fetch event - use prop data as initial if available
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["public-event", effectiveUsername, effectiveSlug],
    queryFn: async () => {
      const response = await fetch(`/api/event/public/${effectiveUsername}/${effectiveSlug}`);
      if (!response.ok) throw new Error("Failed to fetch event");
      return response.json();
    },
    enabled: !!effectiveUsername && !!effectiveSlug,
    initialData: propEventData || undefined,
  });

  // Fetch user's teams (if logged in)
  const { data: teamsData } = useQuery({
    queryKey: ["user-teams"],
    queryFn: async () => {
      const response = await fetch('/api/teams');
      if (!response.ok) return null;
      return response.json();
    },
    retry: false,
  });

  // Fetch team members when team is selected
  // const { data: teamMembersData, isLoading: isLoadingTeamMembers } = useQuery({
  //   queryKey: ["team-members", selectedTeam?.slug],
  //   queryFn: async () => {
  //     if (!selectedTeam) return null;
  //     const response = await fetch(`/api/teams/${selectedTeam.slug}/members-for-selection`);
  //     if (!response.ok) throw new Error("Failed to fetch team members");
  //     return response.json();
  //   },
  //   enabled: !!selectedTeam,
  // });

  // Fetch team members when team is selected
const { data: teamMembersData, isLoading: isLoadingTeamMembers } = useQuery({
    queryKey: ["team-members", selectedTeam?.id],
    queryFn: async () => {
      if (!selectedTeam) return null;
      const identifier = selectedTeam.slug || selectedTeam.id;
      const response = await fetch(`/api/teams/${identifier}/members-for-selection`);
      if (!response.ok) throw new Error("Failed to fetch team members");
      return response.json();
    },
    enabled: !!selectedTeam?.id,
  });

  // Fetch availability
  const { data: availability } = useQuery({
    queryKey: ["availability", event?.event?.id],
    queryFn: async () => {
      const response = await fetch(`/api/availability/public/${event.event.id}`);
      if (!response.ok) throw new Error("Failed to fetch availability");
      return response.json();
    },
    enabled: !!event?.event?.id,
  });

  // Book meeting mutation (supports both 1on1 and team)
  const bookMeetingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const endpoint = isTeamMode
        ? "/api/meetings/team/create"
        : "/api/meeting/public/create";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) throw new Error("Failed to book meeting");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setStep("confirmed");
    },
  });

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !event?.event) return;

    const startTime = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime.getTime() + event.event.duration * 60000);

    // Prepare payload based on booking mode
    const payload = isTeamMode
      ? {
        eventId: event.event.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        title: event.event.title,
        description: formData.additionalInfo,
        teamId: selectAllTeam ? selectedTeam?.id : undefined,
        selectedMemberIds: Array.from(selectedMembers),
        externalAttendees,
      }
      : {
        eventId: event.event.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        additionalInfo: formData.additionalInfo,
      };

    bookMeetingMutation.mutate(payload);
  };

  // Generate time slots
  const generateTimeSlots = () => {
    if (!date || !availability?.data) return [];
    const dayName = format(date, "EEEE").toUpperCase();
    const dayAvailability = availability.data.find((d: any) => d.day === dayName);
    if (!dayAvailability?.slots) return [];
    return dayAvailability.slots.map((timeSlot: string) => ({
      time: timeSlot,
      available: true,
    }));
  };

  const timeSlots = generateTimeSlots();

  // Team selection handlers
  // const handleSelectTeam = (team: Team) => {
  //   setSelectedTeam(team);
  //   setIsTeamMode(true);
  //   setShowTeamModal(false);
  // };

  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsTeamMode(true);
    setShowTeamModal(false);
    // Clear previous selections when switching teams
    setSelectedMembers(new Set());
    setSelectAllTeam(false);
  };

  const handleSwitchTo1on1 = () => {
    setIsTeamMode(false);
    setSelectedTeam(null);
    setSelectedMembers(new Set());
    setExternalAttendees([]);
  };

  // const handleSelectAllTeam = (checked: boolean) => {
  //   setSelectAllTeam(checked);
  //   if (checked && teamMembersData?.data?.members) {
  //     setSelectedMembers(new Set(teamMembersData.data.members.map((m: TeamMember) => m.id)));
  //   } else {
  //     setSelectedMembers(new Set());
  //   }
  // };
  const handleSelectAllTeam = (checked: boolean) => {
    setSelectAllTeam(checked);
    const members = teamMembersData?.data?.members || teamMembersData?.members || [];
    if (checked && members.length > 0) {
      setSelectedMembers(new Set(members.map((m: TeamMember) => m.id)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleMemberToggle = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
      setSelectAllTeam(false);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const addExternalAttendee = () => {
    if (newExternalEmail && !externalAttendees.find(e => e.email === newExternalEmail)) {
      setExternalAttendees([...externalAttendees, {
        email: newExternalEmail,
        name: newExternalName || newExternalEmail.split('@')[0],
      }]);
      setNewExternalEmail("");
      setNewExternalName("");
    }
  };

  const removeExternalAttendee = (email: string) => {
    setExternalAttendees(externalAttendees.filter(e => e.email !== email));
  };

  const totalAttendees = selectedMembers.size + externalAttendees.length;

  // Don't render if modal is closed (when used as modal)
  if (externalOpen !== undefined && !isOpen) return null;

  // Loading state
  if (isLoadingEvent) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Not found
  if (!event?.event) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Event not found</h1>
            <p className="text-gray-600">The event you are looking for does not exist.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Safely access event data with fallbacks
  const eventDataSafe = event.event;
  const userData = eventDataSafe.user || {};
  const userImage = userData.image || "";
  const userName = userData.name || "User";
  const eventTitle = eventDataSafe.title || "Event";
  const eventDuration = eventDataSafe.duration || 30;
  const eventDescription = eventDataSafe.description || "";
  const eventLocationType = eventDataSafe.locationType || "ONLINE";

  // Confirmed step
  if (step === "confirmed") {
    return (

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="!px-0 !py-0 bg-transparent !h-[80vh] !max-w-fit border-none">
          {/* <CardHeader className="text-center">
            <div className=" size-16  bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="size-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Meeting Booked!</CardTitle>
            <CardDescription>
              {isTeamMode
                ? "Your team meeting has been scheduled"
                : "Your meeting has been successfully scheduled"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{eventTitle}</h3>
              <p className="text-sm text-gray-600">
                {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
              </p>
              <p className="text-sm text-gray-600">Duration: {eventDuration} minutes</p>
              {isTeamMode && (
                <p className="text-sm text-blue-600 mt-2">
                  {totalAttendees} attendees invited
                </p>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {isTeamMode
                ? "Calendar invites have been sent to all attendees"
                : `A confirmation email with meeting details has been sent to ${formData.guestEmail}`}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>

          </CardContent> */}
          <div className="w-full max-w-[420px] rounded-2xl border border-gray-200 dark:border-[#222] bg-white dark:bg-[#0f0f0f] shadow-sm overflow-hidden text-gray-900 dark:text-white">
            {/* Header Section */}
            <div className="px-8 pt-8 pb-6 text-center">
              {/* Green Check Icon */}
              <div className="mx-auto  size-12  rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Check className="size-6 text-green-500 stroke-[3]" />
              </div>

              <h2 className="text-xl font-semibold mb-2 tracking-tight">
                This meeting is scheduled
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                We sent an email with a calendar invitation<br />
                with the details to everyone.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Details Section */}
            <div className="px-8 py-6 space-y-5">
              {/* Details */}
              <div>
                <h3 className="text-sm font-semibold mb-1.5">Details</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {eventTitle} meeting between You and {isTeamMode ? (
                    <p className="">
                      {totalAttendees} Team Members
                    </p>
                  ) : (
                    <div className="">
                      {formData.guestEmail}
                    </div>
                  )}
                </p>
              </div>

              {/* When */}
              <div>
                <h3 className="text-sm font-semibold mb-1.5">When</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
                </p>
              </div>

              {/* Invited */}
              <div>
                <h3 className="text-sm font-semibold mb-1.5">Invited</h3>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>
                      {isTeamMode ? (
                        <p className="">
                          {totalAttendees} attendees invited
                        </p>
                      ) : (
                        <div className="">
                          {formData.guestEmail}
                        </div>
                      )}

                    </span>


                    {/* <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-500 rounded border border-blue-500/20">
                Host
              </span> */}
                  </div>
                  {/* <div className="text-sm text-gray-500 dark:text-gray-400">
              John Thompson (john.thompson@email.com)
            </div> */}
                </div>
              </div>

              {/* Where */}
              {/* <div>
                <h3 className="text-sm font-semibold mb-1.5">Where</h3>
                <p

                  className="text-sm text-gray-500 dark:text-gray-400 hover:underline inline-flex items-center gap-1"
                >
                  {formData.eventLocationType === "online" ? formData.externalLink : "Zoom"}
                  {formData.externalLink}
                   <ExternalLink className=" size-3  " />
                </p>
              </div> */}

              {/* Additional Notes */}
              <div>
                <h3 className="text-sm font-semibold mb-1.5">Additional notes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.additionalInfo || "No additional notes"}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Reschedule/Cancel Section */}
            <div className="px-8 py-4 flex justify-center">
              <div className="text-sm flex text-gray-500 dark:text-gray-400 text-center">
                Need to make a change?{' '}
                <div tabIndex={0} role='button' onClick={() => setIsOpen(false)} className="underline cursor-pointer hover:no-underline text-inherit">
                  Reschedule
                </div>
                <p> or</p>

                <p className="underline hover:no-underline text-inherit">
                  Cancel
                </p>
              </div>
            </div>


            {/* <div className="px-8 py-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">
          Add to calendar
        </p>
        
        <div className="flex justify-center items-center gap-3">
         
          <button className="w-9 h-9 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:opacity-80 transition-opacity">
            <svg viewBox="0 0 24 24" className="size-5" fill="none">
              <path d="M22 12h-2v-2h-2V8h-2V6h-2V4h-2V2h-2v2h-2v2H8v2H6v2H4v2H2v2h2v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2z" fill="#4285F4"/>
              <path d="M8 8h8v8H8V8z" fill="#fff"/>
            </svg>
          </button>
          
          
          <button className="w-9 h-9 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:opacity-80 transition-opacity">
            <svg viewBox="0 0 24 24" className="size-5" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/>
              <path d="M2 8h20v12H2V8z" fill="#0078D4"/>
              <rect x="6" y="2" width="12" height="20" rx="1" fill="#0078D4" opacity="0.3"/>
            </svg>
          </button>
          
         
          <button className="w-9 h-9 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:opacity-80 transition-opacity">
            <svg viewBox="0 0 24 24" className="size-5" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="2" fill="#fff" stroke="#FF3B30" strokeWidth="2"/>
              <path d="M3 10h18" stroke="#FF3B30" strokeWidth="2"/>
              <path d="M8 2v4M16 2v4" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
              <rect x="7" y="13" width="4" height="4" rx="0.5" fill="#FF3B30"/>
            </svg>
          </button>
          
          
          <button className="w-9 h-9 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:opacity-80 transition-opacity">
            <svg className="size-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div> */}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Attendee Selection Step
  if (step === "select-attendees") {
    // const members = teamMembersData?.data?.members || [];
    const members = teamMembersData?.data?.members || teamMembersData?.members || [];

    return (
      <>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-[60rem]  dark:bg-[#171717] min-w-[60rem] w-[60rem] h-[58vh] dark:border-[#1E1E21] rounded-xl thin-scrollbar overflow-y-hidden p-0">
            <div className="w-full h-[58vh] flex">

              <div className="space-y-4 min-w-[27%] p-6 bg-black/20 w-[27%] max-w-[27%] ">

                {userImage && (
                  <Image
                    src={userImage}
                    alt={userName}
                    className="size-8 rounded-full"
                    height={1000}
                    width={1000}
                  />
                )}
                <div>
                  <h3 className="font-medium dark:text-white">{userName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{eventTitle}</p>
                </div>

                {eventDescription && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{eventDescription}</p>
                )}

                <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                  <Clock className="size-4" />
                  <span>{eventDuration}m</span>
                </div>

                <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                  <Calendar1 className="size-4" />
                  <span className="text-xs">{eventLocationType.replace("google", " ")}</span>
                </div>
              </div>

              <ScrollArea className="flex w-full h-full !overflow-y-auto">

                <Separator orientation="vertical" />
                <Tabs defaultValue="team" className="relative min-w-[100%] h-full   ">

                  <Card className="bg-transparent w-full border-none">
                    <CardHeader className="bg-transparent py-3">
                      <div className="flex items-center justify-between">

                        <div className="flex justify-center items-center gap-2">
                          <Button variant="outline" className="border-none" size="icon" onClick={() => setStep("select-time")}>
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="size-5" />
                              Select Attendees
                            </CardTitle>

                          </>
                        </div>
                        <div className=" flex justify-center items-center gap-2">

                          <TabsList className="flex w-fit h-8 py-0 divide-x divide-x-red-500 !px-0 border dark:border-[#333]">
                            <TabsTrigger className="rounded-r-none" value="team">Team</TabsTrigger>
                            <TabsTrigger className="rounded-l-none" value="external">
                              Guest
                              {externalAttendees.length > 0 && (
                                <Badge variant="secondary" className="ml-2">{externalAttendees.length}</Badge>
                              )}
                            </TabsTrigger>
                          </TabsList>
                          
                          {totalAttendees > 0 ? (
                        <Button
                        variant="default"
                        size="sm"
                        className="dark:bg-white hover:dark:text-black h-8 py-0 rounded-xl"
                          onClick={() => setStep("book-meeting")}
                          disabled={totalAttendees === 0}
                        >
                          Next: Confirm
                          <ChevronRight className="size-4 " />
                        </Button>
                        ) : (
                       <div className="hidden">

                       </div> )}
                    
                          </div>
                      </div>
                    </CardHeader>
                    <CardContent>

                      <TabsContent value="team" className="">
                        {isLoadingTeamMembers ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="size-6 animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-x-3 px-3 py-1.5 dark:bg-[#222] bg-blue-50 rounded-md">
                              <Checkbox
                                id="select-all"
                                checked={selectAllTeam}
                                onCheckedChange={(checked) => handleSelectAllTeam(checked as boolean)}
                              />

                              <Label htmlFor="select-all" className="flex-1 cursor-pointer font-normal">
                                Select All Team Members ({members.length} people)
                              </Label>
                            </div>

                            <Separator />

                            <ScrollArea className="h-[300px]">
                              <div className="space-y-2">
                                {members.map((member: TeamMember) => (
                                  <div
                                    key={member.id}
                                    className="flex w-full items-center gap-x-3 p-3 dark:bg-[#111] dark:border-[#333] rounded-lg hover:bg-gray-50 border"
                                  >
                                    <Checkbox
                                      id={member.id}
                                      checked={selectedMembers.has(member.id)}
                                      onCheckedChange={() => handleMemberToggle(member.id)}
                                    />
                                    <Avatar className="size-8">
                                      <AvatarImage src={member.image} />
                                      <AvatarFallback>
                                        {member.name?.charAt(0) || member.email.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <label htmlFor={member.id} className="flex-1 cursor-pointer">
                                      <div className="font-medium">{member.name || 'Unnamed'}</div>
                                      <div className="text-sm text-gray-500">{member.email}</div>
                                    </label>
                                    <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                                      {member.role}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="external" className="mt-4">
                        <div className="space-y-4">
                          <div className=" p-3 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              <Mail className="size-4 inline mr-1" />
                              External attendees will receive an email invitation automatically when you schedule the meeting.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Name (optional)"
                              type="text"
                              value={newExternalName}
                              onChange={(e) => setNewExternalName(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Input
                                placeholder="email@example.com"
                                type="email"
                                value={newExternalEmail}
                                onChange={(e) => setNewExternalEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addExternalAttendee()}
                              />
                              <Button onClick={addExternalAttendee} size="icon" variant="outline">
                                <Plus className="size-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {externalAttendees.map((attendee) => (
                              <div
                                key={attendee.email}
                                className="flex items-center justify-between p-3 rounded-lg border border-orange-200"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-8 bg-orange-100">
                                    <AvatarFallback className="text-orange-600 text-sm">
                                      {attendee.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-sm">{attendee.name}</div>
                                    <div className="text-xs text-gray-500">{attendee.email}</div>
                                  </div>
                                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                    <Mail className=" size-3   mr-1" />
                                    External
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeExternalAttendee(attendee.email)}
                                >
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ))}

                            {externalAttendees.length === 0 && (
                              <div className="text-center py-8 text-gray-400">
                                <Mail className=" size-12  mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No external attendees added yet</p>
                                <p className="text-xs">Add email addresses above to invite external guests</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>


                      <div className="mt-3 p-4  rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Total Attendees: {totalAttendees}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {selectedMembers.size > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              <Users className=" size-3   mr-1" />
                              {selectedMembers.size} team member{selectedMembers.size !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          {externalAttendees.length > 0 && (
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                              <Mail className=" size-3   mr-1" />
                              {externalAttendees.length} external guest{externalAttendees.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>

                        {externalAttendees.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">External guests to be invited:</p>
                            <div className="flex flex-wrap gap-1">
                              {externalAttendees.map(att => (
                                <span key={att.email} className="text-xs bg-white px-2 py-1 rounded border">
                                  {att.email}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                </Tabs>
              </ScrollArea>


            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Main booking flow - SELECT TIME or BOOK MEETING
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[60rem] dark:bg-[#171717] min-w-[60rem] w-[60rem] h-[58vh] dark:border-[#1E1E21] rounded-xl thin-scrollbar overflow-y-auto p-0">
        {step === "select-time" && (
          <div className="w-full">

            {/* {isTeamMode && selectedTeam && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-blue-600" />
                  <div>
                    <span className="font-medium text-sm">Team: {selectedTeam.name}</span>
                    <p className="text-xs text-gray-500">
                      {totalAttendees > 0 
                        ? `${totalAttendees} attendees selected` 
                        : "Click 'Select Attendees' to choose members"}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setStep("select-attendees")}
                >
                  {totalAttendees > 0 ? "Edit Attendees" : "Select Attendees"}
                </Button>
              </div>
            )} */}

            {/* {isTeamMode && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Attendees ({totalAttendees})</p>
                <div className="space-y-2">
                  {Array.from(selectedMembers).map((memberId) => {
                    const member = teamMembersData?.data?.members.find((m: TeamMember) => m.id === memberId);
                    return member ? (
                      <div key={member.id} className="flex items-center gap-2 text-sm">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-xs">{member.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{member.name || member.email}</span>
                        <Badge variant="secondary" className="text-xs">Team</Badge>
                      </div>
                    ) : null;
                  })}
                  {externalAttendees.map((attendee) => (
                    <div key={attendee.email} className="flex items-center gap-2 text-sm">
                      <Avatar className="size-6 bg-orange-100">
                        <AvatarFallback className="text-xs text-orange-600">{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{attendee.name}</span>
                      <span className="text-gray-500 text-xs">({attendee.email})</span>
                      <Badge variant="outline" className="text-xs">External</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-green-600 mt-2">
                  ✓ Calendar invites sent to all attendees
                </p>
              </div>
            )} */}

            <div className="flex  w-full h-full">
              <div className="space-y-4 min-w-[27%] p-6 bg-[#EEE] dark:bg-black/20 w-[27%] max-w-[27%] ">

                {userImage && (
                  <Image
                    src={userImage}
                    alt={userName}
                    className="size-8 rounded-full"
                    height={1000}
                    width={1000}
                  />
                )}
                <div>
                  <h3 className="font-normal text-xs dark:text-gray-400 ">{userName}</h3>
                  <p className="text-md font-semibold capitalize text-gray-600 dark:text-white ">{eventTitle}</p>
                </div>

                {eventDescription && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{eventDescription}</p>
                )}

                <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                  <Clock className="size-4" />
                  <span>{eventDuration}m</span>
                </div>

                <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                  <Calendar1 className="size-4" />
                  <span className="text-xs">{eventLocationType.replace("google", " ")}</span>
                </div>
              </div>

              <div className="relative h-full p-3 flex-grow w-full">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      setDate(newDate);
                      setTime(null);
                    }
                  }}
                  className="!gap-10 w-full text-[#D4D4D4] flex-grow h-full "
                  disabled={[{ before: today }]}
                />
              </div>
              <Separator orientation="vertical" />
              <div className="relative min-w-[30%] h-full pt-2 w-[30%] max-w-[30%]">
                <ScrollArea className="h-full max-h-96">
                  <div className="space-y-3">
                    <div className="flex justify-between gap-4 shrink-0 items-center px-5 pr-8">
                      <p className="text-sm font-medium dark:text-[#D4D4D4]">{format(date, "EEEE, d")}</p>
                      {
                        teamsData?.data && teamsData.data.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant={isTeamMode ? "default" : "outline"}
                                size="icon"
                                className="!py-1.5 h-6 dark:text-white bg-transparent border dark:border-[#222] px-2"
                              >
                                <Users className="size-4" />
                                {/* {isTeamMode ? selectedTeam?.name : "Schedule with Team"} */}
                                {/* {isTeamMode && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {totalAttendees}
            </Badge>
          )} */}
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-72">
                              <DropdownMenuLabel>Select a team</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              {teamsData.data.map((team: Team) => (
                                <DropdownMenuItem
                                  key={team.id}
                                  onClick={() => handleSelectTeam(team)}
                                  className="flex items-center gap-3 py-3 cursor-pointer"
                                >
                                  <div className="size-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                                    <Users className="size-4 text-purple-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{team.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {team.members?.length || 0} members
                                    </p>
                                  </div>
                                  {selectedTeam?.id === team.id && (
                                    <Check className="size-4 text-blue-500 shrink-0" />
                                  )}
                                </DropdownMenuItem>
                              ))}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => {
                                  handleSwitchTo1on1();
                                }}
                                className="flex items-center gap-3 py-3 cursor-pointer"
                              >
                                <div className="size-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                                  <User className="size-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">One-on-One Only</p>
                                  <p className="text-xs text-muted-foreground">Personal meeting (default)</p>
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                      }
                    </div>
                    <div className="grid gap-1.5 px-5 py-2">
                      {timeSlots.map(({ time: timeSlot, available }) => (
                        <div className="flex justify-center gap-1 items-center">
                          <Button
                            key={timeSlot}
                            variant={time === timeSlot ? "default" : "outline"}
                            size="sm"
                            className="w-full flex flex-1 border dark:border-[#333] dark:!text-[#A1A1AA] !py-2 h-9 rounded-xl dark:!bg-[#111]"
                            onClick={() => setTime(timeSlot)}
                            disabled={!available}
                          >
                            {timeSlot}
                          </Button>
                          {timeSlot && time == timeSlot && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => isTeamMode ? setStep("select-attendees") : setStep("book-meeting")}
                              className="gap-1 flex-1 text-black hover:bg-blue-600 rounded-xl !py-2 h-9 bg-white"
                            >
                              {isTeamMode ? "Attendees" : "Continue"}
                              <ChevronRight className="size-4" />
                            </Button>

                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>


          </div>
        )}

        {step === "book-meeting" && (
          <>


            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="max-w-[60rem]  dark:bg-[#171717] min-w-[60rem] w-[60rem] h-[58vh] dark:border-[#1E1E21] rounded-xl thin-scrollbar overflow-y-hidden p-0">
                <div className="w-full h-[58vh] flex">

                  <div className="space-y-4 min-w-[27%] p-6 bg-black/20 w-[27%] max-w-[27%] ">

                    {userImage && (
                      <Image
                        src={userImage}
                        alt={userName}
                        className="size-8 rounded-full"
                        height={1000}
                        width={1000}
                      />
                    )}
                    <div>
                      <h3 className="font-medium dark:text-white">{userName}</h3>
                      <p className="text-sm text-gray-600 dark:text-[#A1A1AA]">{eventTitle}</p>
                    </div>

                    {eventDescription && (
                      <p className="text-gray-600 dark:text-[#A1A1AA] text-sm">{eventDescription}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm dark:text-[#A1A1AA]">
                      <Calendar1 className="size-4" />
                      <p className="text-xs font-semibold">
                        {date && time && format(new Date(`${format(date, "yyyy-MM-dd")}T${time}`), "PPP p")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm dark:text-[#A1A1AA]">
                      <Clock className="size-4" />
                      <span className="text-xs font-semibold">{eventDuration}m</span>
                    </div>


                    <div className="flex items-center gap-2 text-sm dark:text-[#A1A1AA]">
                      <Video className="size-4" />
                      <span className="text-xs font-semibold">{eventLocationType.replace("google", " ")}</span>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="w-[0.2px]" />
                  <ScrollArea className="flex w-full h-full !overflow-y-auto">
                    <Card className="max-w-full border-none shadow-none bg-transparent">
                      <CardHeader className="py-4">
                        <CardTitle>
                          {isTeamMode ? "Confirm Team Meeting" : "Enter Your Details"}
                        </CardTitle>
                        <CardDescription>
                          {isTeamMode
                            ? "Review and confirm your team meeting details"
                            : "Please provide your information to complete the booking"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="border-none bg-transparent shadow-none">
                        <div className="rounded-lg ">


                          {isTeamMode && (
                            <div className="mt-1 mb-3 rounded-xl border dark:border-[#222] p-3 bg-[#EEE] dark:bg-[#222]">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-blue-900">Attendees ({totalAttendees})</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setStep("select-attendees")}
                                >
                                  Edit
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {Array.from(selectedMembers).map((memberId) => {
                                  const member = teamMembersData?.data?.members.find((m: TeamMember) => m.id === memberId);
                                  return member ? (
                                    <Badge key={member.id} variant="default" className="flex items-center gap-1 ">
                                      <Avatar className="size-5">
                                        <AvatarImage src={member.image} alt="" />
                                        <AvatarFallback className="text-xs">{member.name?.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      {member.name || member.email}
                                    </Badge>
                                  ) : null;
                                })}
                                {externalAttendees.map((attendee) => (
                                  <Badge key={attendee.email} variant="outline" className="flex items-center gap-1">
                                    <Mail className=" size-3  " />
                                    {attendee.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <form onSubmit={handleBookMeeting} className="space-y-4">
                          {!isTeamMode ? (
                            <>
                              <div>
                                <Label className="block text-sm font-medium mb-2">
                                  Your Name *
                                </Label>
                                <Input
                                  className="dark:bg-[#27272A] border-none"
                                  type="text"
                                  value={formData.guestName}
                                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label className="block text-sm font-medium  mb-2">
                                  Email Address *
                                </Label>
                                <Input
                                  type="email"
                                  className="dark:bg-[#27272A] border-none"
                                  value={formData.guestEmail}
                                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                                  required
                                />
                              </div>
                            </>
                          ) : (
                            <div>
                              <Label className="block text-sm font-medium mb-2">
                                Meeting Notes (Optional)
                              </Label>
                              <Textarea
                                className="w-full px-3 dark:bg-[#27272A] border-none py-2 rounded-md focus:outline-none "
                                rows={3}
                                value={formData.additionalInfo}
                                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                                placeholder=""
                              />
                            </div>
                          )}

                          {!isTeamMode && (
                            <div>
                              <Label className="block text-sm font-medium mb-2">
                                Additional Information (Optional)
                              </Label>
                              <Textarea
                                className="w-full px-3 dark:bg-[#27272A] border-none py-2 rounded-md focus:outline-none "
                                rows={3}
                                value={formData.additionalInfo}
                                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                                placeholder=""
                              />
                            </div>
                          )}

                          <div className="flex gap-2 items-center justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setStep(isTeamMode ? "select-attendees" : "select-time")}
                              className="rounded-lg py-1"
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              variant="default"
                              disabled={bookMeetingMutation.isPending || (isTeamMode && totalAttendees === 0)}
                              className=" rounded-lg py-1 dark:text-black dark:bg-white"
                            >
                              {bookMeetingMutation.isPending
                                ? "Booking..."
                                : isTeamMode
                                  ? "Schedule Team Meeting"
                                  : "Schedule"
                              }
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                    </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </DialogContent>
    </Dialog>

  );
}
