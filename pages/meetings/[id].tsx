
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import Head from 'next/head';
// import { useSession } from 'next-auth/react';
// import { Loader2, ArrowLeft, Calendar, Clock, Users, Trash2 } from 'lucide-react';
// import VideoPlayer from '@/components/notetaker/VideoPlayer';
// import TranscriptView from '@/components/notetaker/TranscriptView';
// import SummaryView from '@/components/notetaker/SummaryView';
// import ChatInterface from '@/components/notetaker/ChatInterface';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// interface Meeting {
//   id: string;
//   meetingName: string | null;
//   meetingUrl: string;
//   status: string;
//   videoUrl: string | null;
//   audioUrl: string | null;
//   s3VideoKey: string | null;
//   s3AudioKey: string | null;
//   duration: number | null;
//   transcript: any[];
//   speakers: string[];
//   summary: string | null;
//   actionItems: any[];
//   keyPoints: string[];
//   createdAt: string;
//   chatMessages: any[];
// }

// export default function MeetingDetail({ id, open, onClose }: { id: string | null; open: boolean; onClose: () => void }) {
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const [meeting, setMeeting] = useState<Meeting | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('summary');
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     if (id && session) {
//       fetchMeeting();
//     }
//   }, [id, session]);

//   const fetchMeeting = async () => {
//     try {
//       const response = await fetch(`/api/aimeetings/${id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setMeeting(data);
//       } else {
//         push('/meetings');
//       }
//     } catch (error) {
//       console.error('Error fetching meeting:', error);
//       push('/meetings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteMeeting = async () => {
//     if (!confirm('Are you sure you want to delete this meeting?')) return;

//     setDeleting(true);
//     try {
//       const response = await fetch(`/api/aimeetings/${id}`, {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         push('/meetings');
//       }
//     } catch (error) {
//       console.error('Error deleting meeting:', error);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // if (status === 'loading' || loading) {
//   //   return (
//   //     <div className="min-h-screen flex items-center justify-center" aria-label="Button">
//   //       <Loader2 className="size-8 animate-spin text-blue-600" />
//   //     </div>
//   //   );
//   // }

//   if (!meeting) {
//     return null;
//   }

//   const isPermanent = !!meeting.s3VideoKey || !!meeting.s3AudioKey;

//   return (
//       <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="w-full max-w-[94%] min-w-[94%] h-[95vh] !p-0 flex flex-col overflow-y-auto dark:border-[#333] dark:bg-[#000000]">
//       <Head>
//         <title>{meeting.meetingName || 'Meeting'} | AI Notetaker</title>
//       </Head>

//       {/* Header */}
//       <div className=" border-b" aria-label="Button">
//         <div className="w-full " aria-label="Button">
//           <div className="flex items-center justify-between" aria-label="Button">
//             <div className="flex items-center gap-4" aria-label="Button">
//               <button type="button" 
//                 onClick={() = aria-label="Button"> push('/meetings')}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <ArrowLeft className="size-5" />
//               </button>

//               <div>
//                 <h1 className="text-xl font-semibold text-gray-900">
//                   {meeting.meetingName || 'Untitled Meeting'}
//                 </h1>
//                 <div className="flex items-center gap-4 text-sm text-gray-500 mt-1" aria-label="Button">
//                   <span className="flex items-center gap-1" aria-label="Button">
//                     <Calendar className="size-4" />
//                     {new Date(meeting.createdAt).toLocaleDateString()}
//                   </span>
//                   {meeting.duration && (
//                     <span className="flex items-center gap-1" aria-label="Button">
//                       <Clock className="size-4" />
//                       {Math.floor(meeting.duration / 60)}m {meeting.duration % 60}s
//                     </span>
//                   )}
//                   <span className="flex items-center gap-1" aria-label="Button">
//                     <Users className="size-4" />
//                     {meeting.speakers?.length || 0} speakers
//                   </span>
//                   {isPermanent && (
//                     <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full" aria-label="Button">
//                       ☁️ Permanent Storage
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <button type="button" 
//               onClick={deleteMeeting}
//               disabled={deleting}
//               className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
//              aria-label="Button">
//               {deleting ? (
//                 <Loader2 className="size-4 animate-spin" />
//               ) : (
//                 <Trash2 className="size-4" />
//               )}
//               Delete
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//        <div className="flex justify-start gap-4 pl-4" aria-label="Button">
//         <div className="flex flex-col max-w-xl h-full" aria-label="Button">
//       <div className=" border-b  max-w-xl" aria-label="Button">
//         <div className=" " aria-label="Button">
//           <div className="flex gap-8" aria-label="Button">
//             {[

//               { id: 'transcript', label: 'Transcript', icon: '📝' },
//               { id: 'summary', label: 'Summary', icon: '📋' },
//             ].map((tab) => (
//               <button type="button" 
//                 key={tab.id}
//                 onClick={() = aria-label="Button"> setActiveTab(tab.id as any)}
//                 className={`py-0 px-2 border-b-2 font-medium text-sm transition-colors ${
//                   activeTab === tab.id
//                     ? 'border-blue-600 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 <span className="mr-2" aria-label="Button">{tab.icon}</span>
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Content */}

//       <div className="h-[600px] overflow-y-auto" aria-label="Button">

// {activeTab === 'transcript' && (
//   <TranscriptView
//     transcript={meeting?.transcript || []}
//     speakers={meeting?.speakers || []}
//   />
// )}


// {activeTab === 'summary' && (
//   <SummaryView
//     meetingId={meeting?.id || ''}
//     summary={meeting?.summary}
//     actionItems={meeting?.actionItems || []}
//     keyPoints={meeting?.keyPoints || []}
//     onRegenerate={() => {
//       // Optionally refresh meeting data after regeneration
//       fetchMeeting();
//     }}
//   />
// )}

//  </div>
//   </div>
//   <div className="" aria-label="Button">
//  { !meeting.videoUrl && (
//           <div className="text-center py-12 text-gray-500" aria-label="Button">
//             <p className="text-lg">No video available</p>
//             <p className="text-sm mt-2">The meeting recording is not ready yet</p>
//           </div>
//         )}
//  <VideoPlayer
//     videoUrl={meeting?.videoUrl || ''}
//     meetingId={meeting?.id || ''}
//     isPermanent={!!meeting?.s3VideoKey || !!meeting?.s3AudioKey}
//     hasS3Keys={!!meeting?.s3VideoKey || !!meeting?.s3AudioKey}
//   />
//   </div>

//  <ChatInterface
//     meetingId={meeting?.id || ''}
//     messages={meeting?.chatMessages || []}
//     transcript={meeting?.transcript || []}
//   />


//   </div>
//      </DialogContent>
//     </Dialog>
//   );
// }


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import Head from 'next/head';
// import { useSession } from 'next-auth/react';
// import { Loader2, ArrowLeft, Calendar, Clock, Users, Trash2, Key, Pin } from 'lucide-react';
// // import VideoPlayer from '@/components/notetaker/VideoPlayer';
// // import TranscriptView from '@/components/notetaker/TranscriptView';
// // import SummaryView from '@/components/notetaker/SummaryView';
// // import ChatInterface from '@/components/notetaker/ChatInterface';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useRef } from 'react';
// import { Send, Bot, User } from 'lucide-react';
// import { Play, Pause, Volume2, VolumeX, Maximize, Download, RefreshCw, Upload } from 'lucide-react';
// import { downloadFile } from 'utils/download';
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from "@/components/ui/resizable"

// interface VideoPlayerProps {
//   videoUrl: string;
//   meetingId: string;
//   isPermanent?: boolean;
//   hasS3Keys?: boolean; // New prop to check if S3 keys exist
// }

// interface Message {
//   id: string;
//   role: 'user' | 'assistant' | 'system';
//   content: string;
//   createdAt: string;
// }

// interface ChatInterfaceProps {
//   meetingId: string;
//   messages?: Message[]; // Make optional
//   transcript?: any[]; // Make optional
// }

// interface Meeting {
//   id: string;
//   meetingName: string | null;
//   meetingUrl: string;
//   status: string;
//   videoUrl: string | null;
//   audioUrl: string | null;
//   s3VideoKey: string | null;
//   s3AudioKey: string | null;
//   duration: number | null;
//   transcript: any[];
//   speakers: string[];
//   summary: string | null;
//   actionItems: any[];
//   keyPoints: string[];
//   createdAt: string;
//   chatMessages: any[];
// }

// export default function MeetingDetail({ id, open, onClose }: { id: string | null; open: boolean; onClose: () => void }) {
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const [meeting, setMeeting] = useState<Meeting | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('summary');
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     if (id && session) {
//       fetchMeeting();
//     }
//   }, [id, session]);

//   const fetchMeeting = async () => {
//     try {
//       const response = await fetch(`/api/aimeetings/${id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setMeeting(data);
//       } else {
//         push('/meetings');
//       }
//     } catch (error) {
//       console.error('Error fetching meeting:', error);
//       push('/meetings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteMeeting = async () => {
//     if (!confirm('Are you sure you want to delete this meeting?')) return;

//     setDeleting(true);
//     try {
//       const response = await fetch(`/api/aimeetings/${id}`, {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         push('/meetings');
//       }
//     } catch (error) {
//       console.error('Error deleting meeting:', error);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // if (status === 'loading' || loading) {
//   //   return (
//   //     <div className="min-h-screen flex items-center justify-center" aria-label="Button">
//   //       <Loader2 className="size-8 animate-spin text-blue-600" />
//   //     </div>
//   //   );
//   // }

//   if (!meeting) {
//     return null;
//   }

//   const isPermanent = !!meeting.s3VideoKey || !!meeting.s3AudioKey;

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="w-full max-w-[94%] min-w-[94%] h-[95vh] !p-0 flex flex-col overflow-y-auto dark:border-[#333] bg-[#EEE] dark:bg-[#000]">
//         <Head>
//           <title>{meeting.meetingName || 'Meeting'} | AI Notetaker</title>
//         </Head>

//         {/* Header */}
//         <div className="border-b dark:border-[#333]" aria-label="Button">
//           <div className="w-full " aria-label="Button">
//             <div className="flex items-center justify-between" aria-label="Button">
//               <div className="flex items-center gap-4" aria-label="Button">
//                 <button type="button" 
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                  aria-label="Button">
//                   <ArrowLeft className="size-5" />
//                 </button>

//                 <div>
//                   <h1 className="text-xl font-semibold text-gray-900 dark:text-[#EEE]">
//                     {meeting.meetingName || 'Untitled Meeting'}
//                   </h1>
//                   <div className="flex items-center gap-4 text-sm text-gray-500 mt-1" aria-label="Button">
//                     <span className="flex items-center gap-1" aria-label="Button">
//                       <Calendar className="size-4" />
//                       {new Date(meeting.createdAt).toLocaleDateString()}
//                     </span>
//                     {meeting.duration && (
//                       <span className="flex items-center gap-1" aria-label="Button">
//                         <Clock className="size-4" />
//                         {Math.floor(meeting.duration / 60)}m {meeting.duration % 60}s
//                       </span>
//                     )}
//                     <span className="flex items-center gap-1" aria-label="Button">
//                       <Users className="size-4" />
//                       {meeting.speakers?.length || 0} speakers
//                     </span>
//                     {isPermanent && (
//                       <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full" aria-label="Button">
//                         ☁️ Permanent Storage
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <button type="button" 
//                 onClick={deleteMeeting}
//                 disabled={deleting}
//                 className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
//                aria-label="Button">
//                 {deleting ? (
//                   <Loader2 className="size-4 animate-spin" />
//                 ) : (
//                   <Trash2 className="size-4" />
//                 )}
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>

//         <ResizablePanelGroup
//           direction="horizontal"
//           className="!w-full gap-3 md:h-[82vh] lg:!h-[85vh] rounded-lg  "
//         >
//           <ResizablePanel defaultSize={55} minSize={40} maxSize={60} className='!overflow-auto thin-scrollbar h-full '>
//             <div className="flex w-full items-center justify-center px-2" aria-label="Button">
//               <div className="flex w-full justify-start gap-4 pl-4" aria-label="Button">
//                 <div className="flex flex-col w-full h-full" aria-label="Button">
//                   <div className=" w-full bg-white py-1 px-1 rounded-md" aria-label="Button">
//                     <div className=" w-full" aria-label="Button">
//                       <div className="flex w-full gap-1" aria-label="Button">
//                         {[

//                           { id: 'transcript', label: 'Transcript', icon: '📝' },
//                           { id: 'summary', label: 'Summary', icon: '📋' },
//                         ].map((tab) => (
//                           <button type="button" 
//                             key={tab.id}
//                             onClick={() = aria-label="Button"> setActiveTab(tab.id as any)}
//                             className={`py-2 px-2 font-medium text-sm rounded-md transition-colors ${activeTab === tab.id
//                               ? 'border-blue-600 bg-[#EEE]'
//                               : 'border-transparent text-gray-500 hover:text-gray-700'
//                               }`}
//                           >
//                             <span className="mr-2 " aria-label="Button">{tab.icon}</span>
//                             {tab.label}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Content */}

//                   <div className=" h-full  w-full !min-w-full " aria-label="Button">

//                     {activeTab === 'transcript' && (
//                       <TranscriptView
//                         transcript={meeting?.transcript || []}
//                         speakers={meeting?.speakers || []}
//                       />
//                     )}


//                     {activeTab === 'summary' && (
//                       <SummaryView
//                         meetingId={meeting?.id || ''}
//                         summary={meeting?.summary}
//                         actionItems={meeting?.actionItems || []}
//                         keyPoints={meeting?.keyPoints || []}
//                         onRegenerate={() => {
//                           // Optionally refresh meeting data after regeneration
//                           fetchMeeting();
//                         }}
//                       />
//                     )}

//                   </div>
//                 </div>
//               </div>
//             </div>
//           </ResizablePanel>
//           <ResizableHandle withHandle />
//           <ResizablePanel defaultSize={45} maxSize={60} >
//             <ResizablePanelGroup direction="vertical">
//               <ResizablePanel defaultSize={65} >
//                 <div className="flex h-full items-center justify-center" aria-label="Button">

//                   {!meeting.videoUrl && (
//                     <div className="text-center py-12 text-gray-500" aria-label="Button">
//                       <p className="text-lg">No video available</p>
//                       <p className="text-sm mt-2">The meeting recording is not ready yet</p>
//                     </div>
//                   )}
//                   <VideoPlayer
//                     videoUrl={meeting?.videoUrl || ''}
//                     meetingId={meeting?.id || ''}
//                     isPermanent={!!meeting?.s3VideoKey || !!meeting?.s3AudioKey}
//                     hasS3Keys={!!meeting?.s3VideoKey || !!meeting?.s3AudioKey}
//                   />
//                 </div>

//               </ResizablePanel>
//               <ResizableHandle withHandle />
//               <ResizablePanel defaultSize={35} className='!h-[30vh]'>
//                 <div className="flex h-full items-center overflow-y-auto relative justify-center p-0" aria-label="Button">
//                   <ChatInterface
//                     meetingId={meeting?.id || ''}
//                     messages={meeting?.chatMessages || []}
//                     transcript={meeting?.transcript || []}
//                   />
//                 </div>
//               </ResizablePanel>
//             </ResizablePanelGroup>
//           </ResizablePanel>
//         </ResizablePanelGroup>


//       </DialogContent>
//     </Dialog>
//   );
// }


// function ChatInterface({
//   meetingId,
//   messages: initialMessages = [], // Default to empty array
//   transcript = [] // Default to empty array 
// }: ChatInterfaceProps) {
//   const [messages, setMessages] = useState<Message[]>(initialMessages || []);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Sync with prop changes
//   useEffect(() => {
//     if (initialMessages && initialMessages.length > 0) {
//       setMessages(initialMessages);
//     }
//   }, [initialMessages]);

//   const sendMessage = async () => {
//     if (!input.trim() || isLoading) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: 'user',
//       content: input.trim(),
//       createdAt: new Date().toISOString(),
//     };

//     // Add user message immediately
//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const response = await fetch(`/api/aimeetings/${meetingId}/chat`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           message: userMessage.content,
//           transcript: transcript, // Send transcript for context
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();

//         const assistantMessage: Message = {
//           id: (Date.now() + 1).toString(),
//           role: 'assistant',
//           content: data.response,
//           createdAt: new Date().toISOString(),
//         };

//         setMessages(prev => [...prev, assistantMessage]);
//       } else {
//         throw new Error('Failed to get response');
//       }
//     } catch (error) {
//       console.error('Chat error:', error);

//       // Add error message
//       const errorMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         role: 'assistant',
//         content: 'Sorry, I encountered an error. Please try again.',
//         createdAt: new Date().toISOString(),
//       };

//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   // Ensure messages is always an array
//   const safeMessages = messages || [];

//   return (
//     <div className="flex flex-col h-full bg-white dark:bg-[#121212] " aria-label="Button">
//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-label="Button">
//         {safeMessages.length === 0 ? (
//           <div className="text-center py-12 text-gray-500" aria-label="Button">
//             <Bot className="h-12 w-12 mx-auto mb-3 text-blue-600" />
//             <p className="font-medium">Ask me anything about this meeting</p>
//             <p className="text-sm mt-2">
//               Try: "What were the main points?", "Who said what?", "Summarize the action items"
//             </p>
//           </div>
//         ) : (
//           safeMessages.map((message, index) => (
//             <div
//               key={message.id || index}
//               className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
//                 }`}
//              aria-label="Button">
//               {message.role !== 'user' && (
//                 <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0" aria-label="Button">
//                   <Bot className="size-4 text-blue-600" />
//                 </div>
//               )}

//               <div
//                 className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-900'
//                   }`}
//                aria-label="Button">
//                 <p className="text-sm whitespace-pre-wrap">{message.content}</p>
//                 <span className="text-xs opacity-70 mt-1 block" aria-label="Button">
//                   {new Date(message.createdAt).toLocaleTimeString()}
//                 </span>
//               </div>

//               {message.role === 'user' && (
//                 <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0" aria-label="Button">
//                   <User className="size-4 text-gray-600" />
//                 </div>
//               )}
//             </div>
//           ))
//         )}

//         {isLoading && (
//           <div className="flex gap-3" aria-label="Button">
//             <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center" aria-label="Button">
//               <Bot className="size-4 text-blue-600" />
//             </div>
//             <div className="bg-gray-100 rounded-lg p-3" aria-label="Button">
//               <Loader2 className="size-4 animate-spin" />
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} / aria-label="Button">
//       </div>

//       {/* Input */}
//       <div className="border-t p-4" aria-label="Button">
//         <div className="flex gap-2" aria-label="Button">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Ask about the meeting..."
//             className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isLoading}
//           />
//           <button type="button" 
//             onClick={sendMessage}
//             disabled={isLoading || !input.trim()}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//            aria-label="Button">
//             {isLoading ? (
//               <Loader2 className="size-4 animate-spin" />
//             ) : (
//               <Send className="size-4" />
//             )}
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// interface TranscriptViewProps {
//   transcript?: any[] | any; // Can be array or object
//   speakers?: string[];
// }

// function TranscriptView({
//   transcript,
//   speakers = []
// }: TranscriptViewProps) {

//   // Handle all possible transcript formats
//   const normalizeTranscript = (raw: any): any[] => {
//     // If null/undefined
//     if (!raw) return [];

//     // If already an array
//     if (Array.isArray(raw)) return raw;

//     // If it's an object with utterances array (AssemblyAI format)
//     if (raw.utterances && Array.isArray(raw.utterances)) {
//       return raw.utterances.map((u: any) => ({
//         speaker: u.speaker || u.speaker_label || 'Unknown',
//         text: u.text || '',
//         startTime: u.start || u.start_time || 0,
//         endTime: u.end || u.end_time || 0,
//         confidence: u.confidence || 0,
//         words: u.words || [],
//       }));
//     }

//     // If it has text but no utterances (single segment)
//     if (raw.text && typeof raw.text === 'string') {
//       return [{
//         speaker: 'Unknown',
//         text: raw.text,
//         startTime: 0,
//         endTime: raw.audio_duration || 0,
//         confidence: raw.confidence || 0,
//       }];
//     }

//     // Unknown format, return empty
//     console.warn('Unknown transcript format:', raw);
//     return [];
//   };

//   // Ensure arrays with fallbacks
//   const safeTranscript = normalizeTranscript(transcript);
//   const safeSpeakers = speakers || [];

//   // Group by speaker for better readability
//   const groupedSegments = safeTranscript.reduce((acc: any[], segment: any, index: number) => {
//     // Validate segment
//     if (!segment || typeof segment !== 'object') return acc;

//     const prevSegment = acc[acc.length - 1];

//     if (prevSegment && prevSegment.speaker === segment.speaker) {
//       // Merge with previous if same speaker
//       prevSegment.text += ' ' + (segment.text || '');
//       prevSegment.endTime = segment.endTime || segment.end || 0;
//     } else {
//       acc.push({
//         speaker: segment.speaker || 'Unknown',
//         text: segment.text || '',
//         startTime: segment.startTime || segment.start || 0,
//         endTime: segment.endTime || segment.end || 0,
//         confidence: segment.confidence || 0,
//       });
//     }

//     return acc;
//   }, []);

//   return (
//     <div className="bg-transparent w-full" aria-label="Button">
//       {/* Speakers List */}
//       {safeSpeakers.length > 0 && (
//         <div className="border-b p-4" aria-label="Button">
//           <h3 className="text-sm font-medium text-gray-700 mb-2">Speakers</h3>
//           <div className="flex flex-wrap gap-2" aria-label="Button">
//             {safeSpeakers.map((speaker, index) => (
//               <span
//                 key={index}
//                 className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
//                aria-label="Button">
//                 {speaker}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Transcript */}
//       <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto w-full" aria-label="Button">
//         {groupedSegments.length === 0 ? (
//           <div className="text-center py-12 text-gray-500" aria-label="Button">
//             <p>No transcript available yet.</p>
//             <p className="text-sm mt-2">
//               Transcript will appear when the meeting is complete and processed.
//             </p>
//           </div>
//         ) : (
//           groupedSegments.map((segment: any, index: number) => (
//             <div key={index} className="flex gap-4" aria-label="Button">
//               <div className="w-12 flex-shrink-0 text-xs text-gray-400 pt-1" aria-label="Button">
//                 {formatTime(segment.startTime)}
//               </div>
//               <div className="flex-1" aria-label="Button">
//                 <div className="font-medium text-sm text-blue-600 mb-1" aria-label="Button">
//                   {segment.speaker}
//                 </div>
//                 <p className="text-gray-700 leading-relaxed">
//                   {segment.text}
//                 </p>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// function formatTime(seconds: number): string {
//   if (!seconds || isNaN(seconds)) return '0:00';
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs.toString().padStart(2, '0')}`;
// }


// function VideoPlayer({
//   videoUrl: initialVideoUrl,
//   meetingId,
//   isPermanent,
//   hasS3Keys
// }: VideoPlayerProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [error, setError] = useState(false);
//   const [uploadMessage, setUploadMessage] = useState('');
//   const videoRef = useRef<HTMLVideoElement>(null);

//   // Auto-refresh URL if it's expired (for permanent storage)
//   useEffect(() => {
//     if (error) {
//       if (hasS3Keys || isPermanent) {
//         // Try to refresh from S3
//         refreshVideoUrl();
//       }
//     }
//   }, [error, hasS3Keys, isPermanent]);

//   const refreshVideoUrl = async () => {
//     setIsRefreshing(true);
//     try {
//       const response = await fetch(`/api/aimeetings/${meetingId}/refresh-urls`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.videoUrl) {
//           setVideoUrl(data.videoUrl);
//           setError(false);
//           setUploadMessage('');

//           // Reload video with new URL
//           if (videoRef.current) {
//             const currentTime = videoRef.current.currentTime;
//             videoRef.current.src = data.videoUrl;
//             videoRef.current.currentTime = currentTime;
//             if (isPlaying) {
//               videoRef.current.play();
//             }
//           }
//         } else {
//           setUploadMessage('No video URL available');
//         }
//       } else {
//         const errorData = await response.json();
//         setUploadMessage(errorData.error || 'Failed to refresh URL');
//       }
//     } catch (error) {
//       console.error('Failed to refresh URL:', error);
//       setUploadMessage('Failed to refresh URL');
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const uploadToS3 = async () => {
//     setIsUploading(true);
//     setUploadMessage('Uploading... This may take a few minutes.');

//     try {
//       const response = await fetch(`/api/aimeetings/${meetingId}/upload-to-s3`, {
//         method: 'POST',
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setVideoUrl(data.videoUrl);
//         setError(false);
//         setUploadMessage('✅ Uploaded! Video will now be available permanently.');

//         // Reload video
//         if (videoRef.current) {
//           videoRef.current.src = data.videoUrl;
//         }
//       } else {
//         const errorData = await response.json();
//         setUploadMessage(`❌ ${errorData.error || 'Upload failed'}`);
//       }
//     } catch (error) {
//       console.error('Upload error:', error);
//       setUploadMessage('❌ Upload failed. Please try again.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const togglePlay = () => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   const toggleMute = () => {
//     if (videoRef.current) {
//       videoRef.current.muted = !isMuted;
//       setIsMuted(!isMuted);
//     }
//   };

//   const handleTimeUpdate = () => {
//     if (videoRef.current) {
//       const current = videoRef.current.currentTime;
//       const total = videoRef.current.duration;
//       setCurrentTime(current);
//       setDuration(total);
//       setProgress((current / total) * 100);
//     }
//   };

//   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const seekTime = (parseFloat(e.target.value) / 100) * duration;
//     if (videoRef.current) {
//       videoRef.current.currentTime = seekTime;
//       setProgress(parseFloat(e.target.value));
//     }
//   };

//   const formatTime = (time: number) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   };

//   const handleFullscreen = () => {
//     if (videoRef.current) {
//       if (document.fullscreenElement) {
//         document.exitFullscreen();
//       } else {
//         videoRef.current.requestFullscreen();
//       }
//     }
//   };

//   const handleError = () => {
//     console.error('Video failed to load');
//     setError(true);
//     setIsPlaying(false);
//   };

//   return (
//     <div className="" aria-label="Button">
//       {/* Video Element */}
//       <div className="relative aspect-video rounded-2xl overflow-hidden" aria-label="Button">
//         <video
//           ref={videoRef}
//           src={videoUrl}
//           className="w-full object-cover"
//           onTimeUpdate={handleTimeUpdate}
//           onEnded={() => setIsPlaying(false)}
//           onError={handleError}
//           muted={isMuted}
//         />

//         {/* Error Overlay */}
//         {error && (
//           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-8" aria-label="Button">
//             <p className="text-lg mb-2">Video failed to load</p>
//             <p className="text-sm text-gray-400 mb-6 text-center">
//               The original URL has expired. Meeting BaaS URLs are only valid for 2-4 hours.
//             </p>

//             {uploadMessage && (
//               <p className={`text-sm mb-4 ${uploadMessage.includes('✅') ? 'text-green-400' : uploadMessage.includes('❌') ? 'text-red-400' : 'text-yellow-400'}`}>
//                 {uploadMessage}
//               </p>
//             )}

//             <div className="flex gap-4" aria-label="Button">
//               {/* If has S3 keys, try to refresh */}
//               {(hasS3Keys || isPermanent) && (
//                 <button type="button" 
//                   onClick={refreshVideoUrl}
//                   disabled={isRefreshing}
//                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                  aria-label="Button">
//                   {isRefreshing ? (
//                     <Loader2 className="size-4 animate-spin" />
//                   ) : (
//                     <RefreshCw className="size-4" />
//                   )}
//                   {isRefreshing ? 'Refreshing...' : 'Refresh from S3'}
//                 </button>
//               )}


//             </div>
//             {/* {(!hasS3Keys && !isPermanent) && ( */}
//             <button type="button" 
//               onClick={uploadToS3}
//               disabled={isUploading}
//               className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
//              aria-label="Button">
//               {isUploading ? (
//                 <Loader2 className="size-4 animate-spin" />
//               ) : (
//                 <Upload className="size-4" />
//               )}
//               {/* {isUploading ? 'Uploading...' : 'Upload to S3 (Permanent)'} */}
//             </button>
//             {/* )} */}
//           </div>
//         )}

//         {/* Play/Pause Overlay (when paused) */}
//         {!isPlaying && !error && (
//           <div
//             className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
//             onClick={togglePlay}
//            aria-label="Button">
//             <div className=" size-16  bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm" aria-label="Button">
//               <Play className="size-8 text-white fill-white" />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Controls */}
//       <div className="" aria-label="Button">
//         {/* Progress Bar */}
//         <input
//           type="range"
//           min="0"
//           max="100"
//           value={progress}
//           onChange={handleSeek}
//           className="w-full h-1 bg-[#EEE] rounded-lg border-none cursor-pointer mb-1"
//         />
//         <div className="text-sm text-gray-400 flex justify-between items-center" aria-label="Button">
//              <p>{formatTime(currentTime)}</p>   <p>{formatTime(duration)}</p>
//             </div>

//         {/* Control Buttons */}
//         <div className="flex items-center justify-center" aria-label="Button">
//           <div className="flex items-center gap-4" aria-label="Button">


//             <button type="button" 
//               onClick={toggleMute}
//               className="text-white hover:text-blue-400 transition-colors"
//              aria-label="Button">
//               {isMuted ? <VolumeX className="size-6" /> : <Volume2 className="size-6" />}
//             </button>

//             <button type="button" 
//               onClick={togglePlay}
//               className="text-white hover:text-blue-400 transition-colors"
//              aria-label="Button">
//               {isPlaying ? <Pause className="size-6" /> : <Play className="size-6" />}
//             </button>
//           </div>

//           <div className="flex items-center gap-4" aria-label="Button">
//             {/* S3 Status Badge */}
//             {/* {(hasS3Keys || isPermanent) && (
//               <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded-full" aria-label="Button">
//                 Permanent
//               </span>
//             )} */}

//             <button type="button" 
//               onClick={handleFullscreen}
//               className="text-white hover:text-blue-400 transition-colors"
//              aria-label="Button">
//               <Maximize className="size-5" />
//             </button>

//             <button type="button" 
//               onClick={() = aria-label="Button"> downloadFile(videoUrl, `meeting-${meetingId}.mp4`)}
//               className="text-white hover:text-blue-400 transition-colors"
//               title="Download"
//             >
//               <Download className="size-5" />
//             </button>
//             <button type="button" 
//               onClick={uploadToS3}
//               disabled={isUploading}
//               className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
//              aria-label="Button">
//               {isUploading ? (
//                 <Loader2 className="size-4 animate-spin" />
//               ) : (
//                 <Upload className="size-4" />
//               )}
//               {/* {isUploading ? 'Uploading...' : 'Upload to S3 (Permanent)'} */}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// interface SummaryViewProps {
//   meetingId: string;
//   summary?: string | null;
//   actionItems?: any[];
//   keyPoints?: string[];
//   onRegenerate?: () => void; // Optional callback after regeneration
// }

// function SummaryView({
//   meetingId,
//   summary,
//   actionItems = [],
//   keyPoints = [],
//   onRegenerate
// }: SummaryViewProps) {
//   const [isRegenerating, setIsRegenerating] = useState(false);
//   const [localSummary, setLocalSummary] = useState(summary);
//   const [localActionItems, setLocalActionItems] = useState(actionItems);
//   const [localKeyPoints, setLocalKeyPoints] = useState(keyPoints);

//   // Ensure arrays with fallbacks
//   const safeActionItems = localActionItems || [];
//   const safeKeyPoints = localKeyPoints || [];

//   const handleRegenerate = async () => {
//     setIsRegenerating(true);
//     try {
//       const response = await fetch(`/api/aimeetings/${meetingId}/regenerate-summary`, {
//         method: 'POST',
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setLocalSummary(data.summary);
//         setLocalActionItems(data.actionItems);
//         setLocalKeyPoints(data.keyPoints);
//         onRegenerate?.(); // Call parent callback if provided
//       } else {
//         const error = await response.json();
//         alert(error.error || 'Failed to regenerate summary');
//       }
//     } catch (error) {
//       console.error('Regenerate error:', error);
//       alert('Failed to regenerate summary. Please try again.');
//     } finally {
//       setIsRegenerating(false);
//     }
//   };

//   return (
//     <div className="space-y-3" aria-label="Button">
//       {/* Regenerate Button */}
//       <div className="flex justify-end" aria-label="Button">
//         {/* <button type="button" 
//           onClick={handleRegenerate}
//           disabled={isRegenerating}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
//          aria-label="Button">
//           {isRegenerating ? (
//             <>
//               <Loader2 className="size-4 animate-spin" />
//               Regenerating...
//             </>
//           ) : (
//             <>
//               <RefreshCw className="size-4" />

//             </>
//           )}
//         </button> */}
//       </div>

//       {/* Summary Section */}
//       <div className="bg-white dark:bg-[#111] rounded-lg border dark:border-[#222] p-4 h-[30vh] overflow-y-auto" aria-label="Button">
//         <h2 className="text-lg font-semibold text-gray-900 dark:text-[#EEE] mb-4">📝 Meeting Summary</h2>
//         {localSummary ? (
//           <div className="prose max-w-none" aria-label="Button">
//             <p className="text-gray-700 dark:text-[#c9c9c9] whitespace-pre-wrap">{localSummary}</p>
//           </div>
//         ) : (
//           <div className="text-center py-8 text-gray-500" aria-label="Button">
//             <p>No summary available yet.</p>
//             <p className="text-sm mt-2">Click (Regenerate Summary) to create one.</p>
//           </div>
//         )}
//       </div>
//       <div className=" flex bg-white dark:bg-[#111] border dark:border-[#222] justify-center items-center rounded-lg p-3 gap-2 h-[60vh] overflow-y-auto" aria-label="Button">
//         {/* Action Items */}
//         {safeActionItems.length > 0 && (
//           <div className="bg-white dark:bg-[#000] rounded-lg border p-3 h-full w-full" aria-label="Button">
//             <h2 className="text-lg font-semibold text-gray-900 ">✅ Action Items</h2>
//             <ul className="space-y-3">
//               {safeActionItems.map((item, index) => (
//                 <li key={index} className="flex items-start gap-3">
//                   <span className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium flex-shrink-0" aria-label="Button">
//                     {index + 1}
//                   </span>
//                   <span className="text-gray-700" aria-label="Button">
//                     {typeof item === 'string' ? item : item.text || item.description || JSON.stringify(item)}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Key Points */}
//         {safeKeyPoints.length > 0 && (
//           <div className="bg-white rounded-lg border p-3 w-full h-full" aria-label="Button">
//             <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"> <Pin className="size-4" /> <p>Key Points</p></h2>
//             <ul className="space-y-2">
//               {safeKeyPoints.map((point, index) => (
//                 <li key={index} className="flex items-start gap-2">
//                   <span className="text-blue-600 mt-1" aria-label="Button">•</span>
//                   <span className="text-gray-700" aria-label="Button">{point}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { Loader2, ArrowLeft, Calendar, Clock, Users, Trash2, Key, Pin } from 'lucide-react';
// import VideoPlayer from '@/components/notetaker/VideoPlayer';
// import TranscriptView from '@/components/notetaker/TranscriptView';
// import SummaryView from '@/components/notetaker/SummaryView';
// import ChatInterface from '@/components/notetaker/ChatInterface';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Play, Pause, Volume2, VolumeX, Maximize, Download, RefreshCw, Upload } from 'lucide-react';
import { downloadFile } from 'utils/download';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

interface VideoPlayerProps {
  videoUrl: string;
  meetingId: string;
  isPermanent?: boolean;
  hasS3Keys?: boolean; // New prop to check if S3 keys exist
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface ChatInterfaceProps {
  meetingId: string;
  messages?: Message[]; // Make optional
  transcript?: any[]; // Make optional
}

interface Meeting {
  id: string;
  meetingName: string | null;
  meetingUrl: string;
  status: string;
  videoUrl: string | null;
  audioUrl: string | null;
  s3VideoKey: string | null;
  s3AudioKey: string | null;
  duration: number | null;
  transcript: any[];
  speakers: string[];
  summary: string | null;
  actionItems: any[];
  keyPoints: string[];
  createdAt: string;
  chatMessages: any[];
}

const EMPTY_MESSAGES: Message[] = []
const EMPTY_TRANSCRIPT: any[] = []
const EMPTY_ACTION_ITEMS: any[] = []
const EMPTY_KEY_POINTS: string[] = []
const EMPTY_SPEAKERS: string[] = []

export default function MeetingDetail({ id, open, onClose }: { id: string | null; open: boolean; onClose: () => void }) {
  const { push } = useRouter()
  const { reload } = useRouter()

  const { data: session, status } = useSession();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('summary');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id && session) {
      fetchMeeting();
    }
  }, [id, session]);

  const fetchMeeting = async () => {
    try {
      const response = await fetch(`/api/aimeetings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMeeting(data);
      } else {
        push('/meetings');
      }
    } catch (error) {
      console.error('Error fetching meeting:', error);
      push('/meetings');
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async () => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/aimeetings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        reload();
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
    } finally {
      setDeleting(false);
    }
  };

  // if (status === 'loading' || loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center" aria-label="Button">
  //       <Loader2 className="size-8 animate-spin text-blue-600" />
  //     </div>
  //   );
  // }

  if (!meeting) {
    return null;
  }

  const isPermanent = !!meeting.s3VideoKey || !!meeting.s3AudioKey;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[94%] min-w-[94%] h-[95vh] !p-0 flex flex-col overflow-hidden dark:border-[#333] bg-[#EEE] dark:bg-[#111]">
        <Head>
          <title>{meeting.meetingName || 'Meeting'} | AI Notetaker</title>
        </Head>

        {/* Header */}
        <div className="border-b dark:border-[#333] bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm flex-shrink-0 z-10" aria-label="Button">
          <div className="px-6 py-2" aria-label="Button">
            <div className="flex items-center justify-between" aria-label="Button">
              <div className="flex items-center gap-4" aria-label="Button">
                <button type="button"
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-[#222] rounded-xl transition-colors"
                  aria-label="Button">
                  <ArrowLeft className="size-5 text-gray-700 dark:text-gray-300" />
                </button>

                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-[#EEE] tracking-tight">
                    {meeting.meetingName || 'Untitled Meeting'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1.5" aria-label="Button">
                    <span className="flex items-center gap-1.5" aria-label="Button">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(meeting.createdAt).toLocaleDateString()}
                    </span>
                    {meeting.duration && (
                      <span className="flex items-center gap-1.5" aria-label="Button">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.floor(meeting.duration / 60)}m {meeting.duration % 60}s
                      </span>
                    )}
                    <span className="flex items-center gap-1.5" aria-label="Button">
                      <Users className="w-3.5 h-3.5" />
                      {meeting.speakers?.length || 0} speakers
                    </span>
                    {isPermanent && (
                      <span className="px-2.5 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full font-medium" aria-label="Button">
                        ☁️ Permanent Storage
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button type="button"
                onClick={deleteMeeting}
                disabled={deleting}
                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50"
                title="Delete meeting"
                aria-label="Button">
                {deleting ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Trash2 className="size-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 gap-4 px-3 py-1"
        >
          <ResizablePanel defaultSize={55} minSize={40} maxSize={60} className="!overflow-hidden">
            <div className="flex flex-col h-full gap-2" aria-label="Button">
              {/* Tabs */}
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border dark:border-[#333] p-1 shadow-sm flex-shrink-0" aria-label="Button">
                <div className="flex gap-1 w-[40%]" aria-label="Button">
                  {[
                    { id: 'transcript', label: 'Transcript', icon: '📝' },
                    { id: 'summary', label: 'Summary', icon: '📋' },
                  ].map((tab) => (
                    <button type="button"
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-1.5 px-4 font-medium text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === tab.id
                        ? 'bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      aria-label="Button"
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden min-h-0" aria-label="Button">
                {activeTab === 'transcript' && (
                  <div className="h-full overflow-y-auto thin-scrollbar" aria-label="Button">
                    <TranscriptView
                      transcript={meeting?.transcript ?? EMPTY_TRANSCRIPT}
                      speakers={meeting?.speakers ?? EMPTY_SPEAKERS}
                    />
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div className="h-full overflow-y-auto thin-scrollbar " aria-label="Button">
                    <SummaryView
                      meetingId={meeting?.id || ''}
                      summary={meeting?.summary}
                      actionItems={meeting?.actionItems ?? EMPTY_ACTION_ITEMS}
                      keyPoints={meeting?.keyPoints ?? EMPTY_KEY_POINTS}
                      onRegenerate={() => {
                        fetchMeeting();
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-gray-300 dark:bg-[#333]" />

          <ResizablePanel defaultSize={45} maxSize={60} className="!overflow-hidden">
            <ResizablePanelGroup direction="vertical" className="gap-2">
              <ResizablePanel defaultSize={60} className="!overflow-hidden">
                <div className="h-full" aria-label="Button">
                  {!meeting.videoUrl ? (
                    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] rounded-2xl border dark:border-[#333] text-gray-500 shadow-sm" aria-label="Button">
                      <div className=" size-16  rounded-2xl bg-gray-100 dark:bg-[#222] flex items-center justify-center mb-4" aria-label="Button">
                        <Play className="size-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-200">No video available</p>
                      <p className="text-sm mt-2 text-gray-500">The meeting recording is not ready yet</p>
                    </div>
                  ) : (
                    <VideoPlayer
                      videoUrl={meeting?.videoUrl || ''}
                      meetingId={meeting?.id || ''}
                      isPermanent={!!meeting?.s3VideoKey || !!meeting?.s3AudioKey}
                      hasS3Keys={!!meeting?.s3VideoKey || !!meeting?.s3AudioKey}
                    />
                  )}
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-gray-300 dark:bg-[#222]" />

              <ResizablePanel defaultSize={40} className="!overflow-hidden">
                <div className="h-full" aria-label="Button">
                  <ChatInterface
                    meetingId={meeting?.id || ''}
                    messages={meeting?.chatMessages ?? EMPTY_MESSAGES}
                    transcript={meeting?.transcript ?? EMPTY_TRANSCRIPT}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DialogContent>
    </Dialog>
  );
}


function ChatInterface({
  meetingId,
 messages: initialMessages = EMPTY_MESSAGES,  // ✅ was []
  transcript = EMPTY_TRANSCRIPT // Default to empty array 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync with prop changes
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/aimeetings/${meetingId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          transcript: transcript, // Send transcript for context
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Ensure messages is always an array
  const safeMessages = messages || [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212] rounded-xl border dark:border-[#333] overflow-hidden shadow-sm" aria-label="Button">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-label="Button">
        {safeMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 px-6" aria-label="Button">
            <div className=" size-16  rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4" aria-label="Button">
              <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Ask me anything</p>
            <p className="text-sm mt-2 text-center text-gray-500 dark:text-gray-400 max-w-xs">
              Try: "What were the main points?", "Who said what?", "Summarize the action items"
            </p>
          </div>
        ) : (
          safeMessages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              aria-label="Button">
              {message.role !== 'user' && (
                <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0" aria-label="Button">
                  <Bot className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-3.5 ${message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                  : 'bg-gray-100 dark:bg-[#222] text-gray-900 dark:text-gray-100 rounded-tl-sm border dark:border-[#333]'
                  }`}
                aria-label="Button">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <span className={`text-xs mt-2 block ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                  }`} aria-label="Button">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {message.role === 'user' && (
                <div className="size-8 rounded-full bg-gray-200 dark:bg-[#333] flex items-center justify-center flex-shrink-0" aria-label="Button">
                  <User className="size-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3" aria-label="Button">
            <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center" aria-label="Button">
              <Bot className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-gray-100 dark:bg-[#222] rounded-2xl rounded-tl-sm p-4 border dark:border-[#333]" aria-label="Button">
              {/* <div className="flex gap-1" aria-label="Button">
                <div className=" size-2  rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} / aria-label="Button">
                <div className=" size-2  rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} / aria-label="Button">
                <div className=" size-2  rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} / aria-label="Button">
              </div> */}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-label="Button" />
      </div>

      {/* Input */}
      <div className="border-t dark:border-[#333] p-2 px-3 bg-white dark:bg-[#121212]" aria-label="Button">
        <div className="flex gap-2 items-center bg-gray-100 dark:bg-[#222] rounded-xl px-3 py-2 border dark:border-[#333] focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all" aria-label="Button">
          <input
          aria-label='text-input'
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the meeting..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
            disabled={isLoading}
          />
          <button type="button"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
            aria-label="Button">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-white" />
            ) : (
              <Send className="size-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TranscriptViewProps {
  transcript?: any[] | any; // Can be array or object
  speakers?: string[];
}

function TranscriptView({
  transcript,
   speakers = EMPTY_SPEAKERS
}: TranscriptViewProps) {

  // Handle all possible transcript formats
  const normalizeTranscript = (raw: any): any[] => {
    // If null/undefined
    if (!raw) return [];

    // If already an array
    if (Array.isArray(raw)) return raw;

    // If it's an object with utterances array (AssemblyAI format)
    if (raw.utterances && Array.isArray(raw.utterances)) {
      return raw.utterances.map((u: any) => ({
        speaker: u.speaker || u.speaker_label || 'Unknown',
        text: u.text || '',
        startTime: u.start || u.start_time || 0,
        endTime: u.end || u.end_time || 0,
        confidence: u.confidence || 0,
        words: u.words || [],
      }));
    }

    // If it has text but no utterances (single segment)
    if (raw.text && typeof raw.text === 'string') {
      return [{
        speaker: 'Unknown',
        text: raw.text,
        startTime: 0,
        endTime: raw.audio_duration || 0,
        confidence: raw.confidence || 0,
      }];
    }

    // Unknown format, return empty
    console.warn('Unknown transcript format:', raw);
    return [];
  };

  // Ensure arrays with fallbacks
  const safeTranscript = normalizeTranscript(transcript);
  const safeSpeakers = speakers || [];

  // Group by speaker for better readability
  const groupedSegments = safeTranscript.reduce((acc: any[], segment: any, index: number) => {
    // Validate segment
    if (!segment || typeof segment !== 'object') return acc;

    const prevSegment = acc[acc.length - 1];

    if (prevSegment && prevSegment.speaker === segment.speaker) {
      // Merge with previous if same speaker
      prevSegment.text += ' ' + (segment.text || '');
      prevSegment.endTime = segment.endTime || segment.end || 0;
    } else {
      acc.push({
        speaker: segment.speaker || 'Unknown',
        text: segment.text || '',
        startTime: segment.startTime || segment.start || 0,
        endTime: segment.endTime || segment.end || 0,
        confidence: segment.confidence || 0,
      });
    }

    return acc;
  }, []);

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border dark:border-[#333] shadow-sm h-full overflow-hidden flex flex-col" aria-label="Button">
      {/* Speakers List */}
      {safeSpeakers.length > 0 && (
        <div className="border-b dark:border-[#333] p-5" aria-label="Button">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Speakers</h3>
          <div className="flex flex-wrap gap-2" aria-label="Button">
            {safeSpeakers.map((speaker, index) => (
              <span
                key={`${index}-${speaker}`}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                aria-label="Button">
                {speaker}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6" aria-label="Button">
        {groupedSegments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12" aria-label="Button">
            <div className=" size-16  rounded-2xl bg-gray-100 dark:bg-[#222] flex items-center justify-center mb-4" aria-label="Button">
              <span className="text-2xl" aria-label="Button">📝</span>
            </div>
            <p className="font-medium text-gray-900 dark:text-gray-200">No transcript available yet</p>
            <p className="text-sm mt-2 text-center max-w-xs">
              Transcript will appear when the meeting is complete and processed.
            </p>
          </div>
        ) : (
          groupedSegments.map((segment: any, index: number) => (
            <div key={`${index}-${segment.text}`} className="group" aria-label="Button">
              <div className="flex items-center gap-3 mb-2" aria-label="Button">
                <div className="size-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm" aria-label="Button">
                  {(segment.speaker || 'U')[0]}
                </div>
                <div className="flex items-center gap-2" aria-label="Button">
                  <div className="font-semibold text-sm text-blue-600 dark:text-blue-400" aria-label="Button">
                    {segment.speaker}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono" aria-label="Button">
                    {formatTime(segment.startTime)}
                  </span>
                </div>
              </div>
              <div className="pl-11" aria-label="Button">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
                  {segment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}


function VideoPlayer({
  videoUrl: initialVideoUrl,
  meetingId,
  isPermanent,
  hasS3Keys
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-refresh URL if it's expired (for permanent storage)
  useEffect(() => {
    if (error) {
      if (hasS3Keys || isPermanent) {
        // Try to refresh from S3
        refreshVideoUrl();
      }
    }
  }, [error, hasS3Keys, isPermanent]);

  const refreshVideoUrl = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/aimeetings/${meetingId}/refresh-urls`);
      if (response.ok) {
        const data = await response.json();
        if (data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setError(false);
          setUploadMessage('');

          // Reload video with new URL
          if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            videoRef.current.src = data.videoUrl;
            videoRef.current.currentTime = currentTime;
            if (isPlaying) {
              videoRef.current.play();
            }
          }
        } else {
          setUploadMessage('No video URL available');
        }
      } else {
        const errorData = await response.json();
        setUploadMessage(errorData.error || 'Failed to refresh URL');
      }
    } catch (error) {
      console.error('Failed to refresh URL:', error);
      setUploadMessage('Failed to refresh URL');
    } finally {
      setIsRefreshing(false);
    }
  };

  const uploadToS3 = async () => {
    setIsUploading(true);
    setUploadMessage('Uploading... This may take a few minutes.');

    try {
      const response = await fetch(`/api/aimeetings/${meetingId}/upload-to-s3`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setVideoUrl(data.videoUrl);
        setError(false);
        setUploadMessage('✅ Uploaded! Video will now be available permanently.');

        // Reload video
        if (videoRef.current) {
          videoRef.current.src = data.videoUrl;
        }
      } else {
        const errorData = await response.json();
        setUploadMessage(`❌ ${errorData.error || 'Upload failed'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage('❌ Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleError = () => {
    console.error('Video failed to load');
    setError(true);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#b54b4b] rounded-xl border dark:border-[#333] overflow-hidden shadow-sm" aria-label="Button">
      {/* Video Element */}
      <div className="relative h-full w-full aspect-video bg-black rounded-t-xl overflow-hidden group" aria-label="Button">
        <video
          aria-label="video-element"
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onError={handleError}
          muted={isMuted}
        />

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-8" aria-label="Button">
            <p className="text-lg mb-2 font-medium">Video failed to load</p>
            <p className="text-sm text-gray-400 mb-6 text-center max-w-md">
              The original URL has expired. Meeting BaaS URLs are only valid for 2-4 hours.
            </p>

            {uploadMessage && (
              <p className={`text-sm mb-4 ${uploadMessage.includes('✅') ? 'text-green-400' : uploadMessage.includes('❌') ? 'text-red-400' : 'text-yellow-400'}`}>
                {uploadMessage}
              </p>
            )}

            <div className="flex flex-wrap gap-3 justify-center" aria-label="Button">
              {(hasS3Keys || isPermanent) && (
                <button type="button"
                  onClick={refreshVideoUrl}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
                  aria-label="Button">
                  {isRefreshing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  {isRefreshing ? 'Refreshing...' : 'Refresh Video'}
                </button>
              )}

              <button type="button"
                onClick={uploadToS3}
                disabled={isUploading}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                aria-label="Button">
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {isUploading ? 'Uploading...' : 'Upload Video Permanently'}
              </button>
            </div>
          </div>
        )}

        {/* Play/Pause Overlay (when paused) */}
        {!isPlaying && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={togglePlay}
            aria-label="Button">
            <div className=" size-16  bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30" aria-label="Button">
              <Play className="size-8 text-white fill-white" />
            </div>
          </div>
        )}
        <div className="px-4 py-1 space-y-1 absolute top-auto  cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-50 !bottom-0 inset-0 h-fit" aria-label="Button">
          {/* Progress Bar */}
          <div className="relative group" aria-label="Button">
            <input
              aria-label='progress-range'
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-gray-200 dark:bg-[#333] rounded-full appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 flex justify-between items-center font-mono" aria-label="Button">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between" aria-label="Button">
            <div className="flex items-center gap-2" aria-label="Button">
              <button type="button"
                onClick={togglePlay}
                className=" size-10  rounded-full bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] flex items-center justify-center transition-colors"
                aria-label="Button">
                {isPlaying ? <Pause className="size-5 text-gray-700 dark:text-gray-200" /> : <Play className="size-5 text-gray-700 dark:text-gray-200" />}
              </button>

              <button type="button"
                onClick={toggleMute}
                className=" size-10  rounded-full bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] flex items-center justify-center transition-colors"
                aria-label="Button">
                {isMuted ? <VolumeX className="size-5 text-gray-700 dark:text-gray-200" /> : <Volume2 className="size-5 text-gray-700 dark:text-gray-200" />}
              </button>
            </div>

            <div className="flex items-center gap-2" aria-label="Button">

              <button type="button"
                onClick={handleFullscreen}
                className=" size-10  rounded-full bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] flex items-center justify-center transition-colors"
                aria-label="Button">
                <Maximize className="size-5 text-gray-700 dark:text-gray-200" />
              </button>

              <button type="button"
                onClick={() => downloadFile(videoUrl, `meeting-${meetingId}.mp4`)}
                className=" size-10  rounded-full bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] flex items-center justify-center transition-colors"
                title="Download"
              >
                <Download className="size-5 text-gray-700 dark:text-gray-200" />
              </button>
              <button type="button"
                onClick={uploadToS3}
                disabled={isUploading}
                className=" size-10  rounded-full bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 flex items-center justify-center transition-colors disabled:opacity-50"
                title="Upload to S3"
                aria-label="Button">
                {isUploading ? (
                  <Loader2 className="size-5 animate-spin text-green-700 dark:text-green-400" />
                ) : (
                  <Upload className="size-5 text-green-700 dark:text-green-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}

    </div>
  );
}

interface SummaryViewProps {
  meetingId: string;
  summary?: string | null;
  actionItems?: any[];
  keyPoints?: string[];
  onRegenerate?: () => void; // Optional callback after regeneration
}

function SummaryView({
  meetingId,
  summary,
  actionItems = EMPTY_ACTION_ITEMS,
  keyPoints = EMPTY_KEY_POINTS, 
  onRegenerate,
}: SummaryViewProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localSummary, setLocalSummary] = useState(summary);
  const [localActionItems, setLocalActionItems] = useState(actionItems);
  const [localKeyPoints, setLocalKeyPoints] = useState(keyPoints);

  // Ensure arrays with fallbacks
  const safeActionItems = localActionItems || [];
  const safeKeyPoints = localKeyPoints || [];

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/aimeetings/${meetingId}/regenerate-summary`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setLocalSummary(data.summary);
        setLocalActionItems(data.actionItems);
        setLocalKeyPoints(data.keyPoints);
        onRegenerate?.(); // Call parent callback if provided
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to regenerate summary');
      }
    } catch (error) {
      console.error('Regenerate error:', error);
      alert('Failed to regenerate summary. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-3 pb-4" aria-label="Button">
      {/* Regenerate Button */}
      <div className="flex justify-end" aria-label="Button">
        {/* <button type="button" 
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
         aria-label="Button">
          {isRegenerating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="size-4" />

            </>
          )}
        </button> */}
      </div>

      {/* Summary Section */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border dark:border-[#333] p-6 shadow-sm" aria-label="Button">
        <div className="flex items-center gap-2 mb-4" aria-label="Button">
          <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center" aria-label="Button">
            <span className="text-blue-600 dark:text-blue-400 text-lg" aria-label="Button">📝</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#EEE]">Overview</h2>
        </div>
        {localSummary ? (
          <div className="prose max-w-none" aria-label="Button">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-[15px]">{localSummary}</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500" aria-label="Button">
            <div className=" size-12  rounded-xl bg-gray-100 dark:bg-[#222] flex items-center justify-center mx-auto mb-3" aria-label="Button">
              <span className="text-xl" aria-label="Button">📋</span>
            </div>
            <p className="font-medium text-gray-900 dark:text-gray-200">No summary available yet</p>
            <p className="text-sm mt-2">Click (Regenerate Summary) to create one.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-[#1a1a1a] border dark:border-[#333]" aria-label="Button">
        {/* Action Items */}
        {safeActionItems.length > 0 && (
          <div className="bg-white dark:bg-[#101010] rounded-xl border dark:border-[#222] p-6 shadow-sm" aria-label="Button">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#EEE] mb-4 flex items-center gap-2">
              <span className="text-green-600 text-xl" aria-label="Button">✅</span>
              Action Items
            </h2>
            <ul className="space-y-3">
              {safeActionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3 group">
                  <span className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0" aria-label="Button">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pt-0.5" aria-label="Button">
                    {typeof item === 'string' ? item : item.text || item.description || JSON.stringify(item)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Points */}
        {safeKeyPoints.length > 0 && (
          <div className="bg-white dark:bg-[#101010] rounded-xl border dark:border-[#222] p-6 shadow-sm" aria-label="Button">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#EEE] flex items-center gap-2 mb-4">
              <Pin className="size-5 text-blue-600 dark:text-blue-400" />
              Key Points
            </h2>
            <ul className="space-y-3">
              {safeKeyPoints.map((point, index) => (
                <li key={`${index}-${point}`} className="flex items-start gap-3">
                  <span className="size-1.5  rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0" aria-label="Button" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed" aria-label="Button">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}