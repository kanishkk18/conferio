// 'use client';

// import React, {
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
//   KeyboardEvent,
// } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import { X, Mic, MicOff, Loader2, Sparkles, Send,
//          CheckSquare, Calendar, Upload, Video, StickyNote,
//          MessageSquare, Timer, FileText } from 'lucide-react';

// // ─── Types ─────────────────────────────────────────────────────────────────
// type ActionType =
//   | 'create_task'
//   | 'schedule_meeting'
//   | 'upload_file'
//   | 'start_meeting'
//   | 'create_note'
//   | 'send_message'
//   | 'start_timer'
//   | 'stop_timer'
//   | 'unknown';

// interface ParsedAction {
//   type: ActionType;
//   data: Record<string, any>;
//   confidence: number;
//   displayText: string;
// }

// interface AIResult {
//   success: boolean;
//   message: string;
//   action?: ParsedAction;
//   data?: any;
// }

// interface SuggestionChip {
//   label: string;
//   prompt: string;
//   icon: React.ReactNode;
// }

// // ─── Suggestion Chips ──────────────────────────────────────────────────────
// const SUGGESTIONS: SuggestionChip[] = [
//   { label: 'Create task', prompt: 'Create a new task', icon: <CheckSquare size={13} /> },
//   { label: 'Schedule meeting', prompt: 'Schedule a meeting', icon: <Calendar size={13} /> },
//   { label: 'Upload file', prompt: 'Upload a file to team', icon: <Upload size={13} /> },
//   { label: 'Start meeting', prompt: 'Start a video meeting now', icon: <Video size={13} /> },
//   { label: 'New note', prompt: 'Create a new note', icon: <StickyNote size={13} /> },
//   { label: 'Send message', prompt: 'Send a message to general channel', icon: <MessageSquare size={13} /> },
//   { label: 'Start timer', prompt: 'Start my work timer', icon: <Timer size={13} /> },
// ];

// // ─── AI Provider call (Gemini → Claude → OpenAI) ──────────────────────────
// async function callAI(prompt: string, context: string): Promise<ParsedAction> {
//   const systemPrompt = `You are an AI assistant for Conferio, a project management app.
// Parse the user's natural language command and return a JSON object.

// Context about the user: ${context}

// Return ONLY valid JSON with this structure:
// {
//   "type": one of ["create_task","schedule_meeting","upload_file","start_meeting","create_note","send_message","start_timer","stop_timer","unknown"],
//   "data": {
//     // For create_task: { title, boardName, columnName, priority, dueDate, assignee }
//     // For schedule_meeting: { eventSlug, guestName, guestEmail, dateTime, duration }
//     // For upload_file: { visibility, description }
//     // For start_meeting: { title }
//     // For create_note: { title, content }
//     // For send_message: { serverName, channelName, message }
//     // For start_timer/stop_timer: { taskId, description }
//     // For unknown: { originalText }
//   },
//   "confidence": 0.0-1.0,
//   "displayText": "Human-readable confirmation of what you understood"
// }`;

//   const userMessage = `User command: "${prompt}"`;

//   // Try Gemini first
//   if (process.env.NEXT_PUBLIC_GOOGLE_AI_KEY) {
//     try {
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GOOGLE_AI_KEY}`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
//             generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
//           }),
//         }
//       );
//       const data = await res.json();
//       const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
//       const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
//       return JSON.parse(cleaned);
//     } catch (_) {}
//   }

//   // Fallback to backend route (which uses Claude/OpenAI server-side)
//   const res = await fetch('/api/ai/parse-command', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ prompt, context }),
//   });

//   if (!res.ok) throw new Error('AI parsing failed');
//   return res.json();
// }

// // ─── Main Component ────────────────────────────────────────────────────────
// interface ConferioAIProps {
//   onFileUpload?: (file: File, visibility: 'PERSONAL' | 'TEAM') => Promise<void>;
//   onNoteCreated?: (noteId: string) => void;
//   onMeetingStarted?: (roomName: string) => void;
// }

// export default function ConferioAI({
//   onFileUpload,
//   onNoteCreated,
//   onMeetingStarted,
// }: ConferioAIProps) {
//   const { data: session } = useSession();
//   const router = useRouter();

//   const [isOpen, setIsOpen] = useState(false);
//   const [input, setInput] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [result, setResult] = useState<AIResult | null>(null);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [pendingAction, setPendingAction] = useState<ParsedAction | null>(null);
//   const [uploadVisibility, setUploadVisibility] = useState<'PERSONAL' | 'TEAM'>('PERSONAL');
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [timerRunning, setTimerRunning] = useState(false);
//   const [timerSeconds, setTimerSeconds] = useState(0);
//   const [history, setHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);

//   const inputRef = useRef<HTMLTextAreaElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const recognitionRef = useRef<any>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const dropZoneRef = useRef<HTMLDivElement>(null);

//   // ─── Keyboard shortcut to open ──────────────────────────────────────────
//   useEffect(() => {
//     const handler = (e: globalThis.KeyboardEvent) => {
//       if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
//         e.preventDefault();
//         setIsOpen(prev => !prev);
//       }
//       if (e.key === 'Escape') setIsOpen(false);
//     };
//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, []);

//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       setTimeout(() => inputRef.current?.focus(), 50);
//     }
//   }, [isOpen]);

//   // ─── Timer logic ────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (timerRunning) {
//       timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
//     } else {
//       if (timerRef.current) clearInterval(timerRef.current);
//     }
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, [timerRunning]);

//   const formatTimer = (s: number) => {
//     const h = Math.floor(s / 3600);
//     const m = Math.floor((s % 3600) / 60);
//     const sec = s % 60;
//     return h > 0
//       ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
//       : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
//   };

//   // ─── Voice recognition ──────────────────────────────────────────────────
//   const startListening = useCallback(() => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) return;

//     const recognition = new SR();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognition.onresult = (e: any) => {
//       const transcript = e.results[0][0].transcript;
//       setInput(transcript);
//       setIsListening(false);
//       setTimeout(() => handleSubmit(transcript), 300);
//     };

//     recognition.onerror = () => setIsListening(false);
//     recognition.onend = () => setIsListening(false);

//     recognitionRef.current = recognition;
//     recognition.start();
//     setIsListening(true);
//   }, []);

//   const stopListening = useCallback(() => {
//     recognitionRef.current?.stop();
//     setIsListening(false);
//   }, []);

//   // ─── Build context string ───────────────────────────────────────────────
//   const buildContext = useCallback(() => {
//     if (!session?.user) return '';
//     return `User: ${session.user.name} (${session.user.email}). Current page: ${router.pathname}`;
//   }, [session, router.pathname]);

//   // ─── Execute parsed action ──────────────────────────────────────────────
//   const executeAction = useCallback(async (action: ParsedAction): Promise<AIResult> => {
//     const { type, data } = action;

//     switch (type) {
//       // ── Create Task ───────────────────────────────────────────────────
//       case 'create_task': {
//         const boards = await fetch('/api/boards').then(r => r.json());
//         const board = boards.find((b: any) =>
//           data.boardName
//             ? b.title.toLowerCase().includes(data.boardName.toLowerCase())
//             : true
//         ) || boards[0];

//         if (!board) return { success: false, message: 'No board found. Create a board first.' };

//         const columns = await fetch(`/api/boards/${board.id}/columns`).then(r => r.json());
//         const column = columns.find((c: any) =>
//           data.columnName
//             ? c.title.toLowerCase().includes(data.columnName.toLowerCase())
//             : c.title.toLowerCase().includes('to do') || c.order === 0
//         ) || columns[0];

//         if (!column) return { success: false, message: 'No column found in board.' };

//         const task = await fetch(`/api/boards/${board.id}/tasks`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             title: data.title || 'New Task',
//             columnId: column.id,
//             boardId: board.id,
//             priority: data.priority?.toUpperCase() || 'MEDIUM',
//             dueDate: data.dueDate || null,
//           }),
//         }).then(r => r.json());

//         return {
//           success: true,
//           message: `✓ Task "${task.title}" created in **${board.title}** → ${column.title}`,
//           data: task,
//         };
//       }

//       // ── Schedule Meeting ──────────────────────────────────────────────
//       case 'schedule_meeting': {
//         const events = await fetch('/api/events').then(r => r.json());
//         const event = events.find((e: any) =>
//           data.eventSlug ? e.slug === data.eventSlug : true
//         ) || events[0];

//         if (!event) return { success: false, message: 'No event type found. Create one in Settings > Events.' };

//         const meeting = await fetch('/api/meetings', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             eventId: event.id,
//             guestName: data.guestName || 'Guest',
//             guestEmail: data.guestEmail || '',
//             startTime: data.dateTime ? new Date(data.dateTime).toISOString() : new Date(Date.now() + 86400000).toISOString(),
//             endTime: data.dateTime
//               ? new Date(new Date(data.dateTime).getTime() + (data.duration || 30) * 60000).toISOString()
//               : new Date(Date.now() + 86400000 + 1800000).toISOString(),
//             meetLink: '',
//             calendarEventId: `ai-${Date.now()}`,
//             calendarAppType: 'GOOGLE_MEET_AND_CALENDAR',
//           }),
//         }).then(r => r.json());

//         return {
//           success: true,
//           message: `✓ Meeting "${event.title}" scheduled with ${data.guestName || 'guest'}`,
//           data: meeting,
//         };
//       }

//       // ── Upload File ───────────────────────────────────────────────────
//       case 'upload_file': {
//         setShowUploadModal(true);
//         setPendingAction(action);
//         return { success: true, message: 'Opening file upload…', action };
//       }

//       // ── Start Meeting ─────────────────────────────────────────────────
//       case 'start_meeting': {
//         const roomName = `conferio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
//         const meeting = await fetch('/api/video-meetings', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ title: data.title || 'Instant Meeting', roomName }),
//         }).then(r => r.json());

//         onMeetingStarted?.(meeting.roomName);
//         router.push(`/video-meeting/${meeting.roomName}`);
//         return { success: true, message: `✓ Meeting started! Joining "${meeting.title}"…`, data: meeting };
//       }

//       // ── Create Note ───────────────────────────────────────────────────
//       case 'create_note': {
//         const note = await fetch('/api/notes', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             title: data.title || 'Untitled Note',
//             content: data.content ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: data.content }] }] } : null,
//           }),
//         }).then(r => r.json());

//         onNoteCreated?.(note.id);
//         // Dispatch event for NoteModal to open
//         window.dispatchEvent(new CustomEvent('conferio:open-note', { detail: { noteId: note.id } }));
//         return { success: true, message: `✓ Note "${note.title}" created and opened`, data: note };
//       }

//       // ── Send Message ──────────────────────────────────────────────────
//       case 'send_message': {
//         const servers = await fetch('/api/servers').then(r => r.json());
//         if (!servers?.length) return { success: false, message: 'No server found. Join or create a server first.' };

//         const server = data.serverName
//           ? servers.find((s: any) => s.name.toLowerCase().includes(data.serverName.toLowerCase())) || servers[0]
//           : servers[0];

//         const channels = await fetch(`/api/servers/${server.id}/channels`).then(r => r.json());
//         const channel = data.channelName
//           ? channels.find((c: any) => c.name.toLowerCase().includes(data.channelName.toLowerCase())) || channels[0]
//           : channels.find((c: any) => c.name === 'general') || channels[0];

//         if (!channel) return { success: false, message: 'No channel found.' };

//         // Get member record
//         const members = await fetch(`/api/servers/${server.id}/members`).then(r => r.json());
//         const member = members.find((m: any) => m.userId === session?.user?.id);
//         if (!member) return { success: false, message: 'You are not a member of this server.' };

//         await fetch(`/api/servers/${server.id}/channels/${channel.id}/messages`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ content: data.message || '', memberId: member.id }),
//         });

//         return {
//           success: true,
//           message: `✓ Message sent to **#${channel.name}** in **${server.name}**`,
//         };
//       }

//       // ── Start Timer ───────────────────────────────────────────────────
//       case 'start_timer': {
//         if (timerRunning) return { success: false, message: 'Timer is already running. Stop it first.' };

//         // Get user's team
//         const teams = await fetch('/api/teams/my-teams').then(r => r.json());
//         const team = teams?.[0];
//         if (!team) return { success: false, message: 'No team found.' };

//         await fetch('/api/time-entries', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             teamId: team.id,
//             taskId: data.taskId || null,
//             description: data.description || 'Voice timer',
//             startTime: new Date().toISOString(),
//             entryType: 'TIMER',
//             isRunning: true,
//           }),
//         });

//         setTimerRunning(true);
//         setTimerSeconds(0);
//         return { success: true, message: '✓ Timer started!' };
//       }

//       // ── Stop Timer ────────────────────────────────────────────────────
//       case 'stop_timer': {
//         if (!timerRunning) return { success: false, message: 'No timer is running.' };

//         const entries = await fetch('/api/time-entries?running=true').then(r => r.json());
//         const running = entries?.[0];
//         if (running) {
//           await fetch(`/api/time-entries/${running.id}`, {
//             method: 'PATCH',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               endTime: new Date().toISOString(),
//               duration: timerSeconds,
//               isRunning: false,
//             }),
//           });
//         }

//         setTimerRunning(false);
//         const elapsed = timerSeconds;
//         setTimerSeconds(0);
//         return { success: true, message: `✓ Timer stopped. Logged **${formatTimer(elapsed)}**` };
//       }

//       default:
//         return { success: false, message: "I didn't understand that. Try rephrasing or use one of the suggestions below." };
//     }
//   }, [timerRunning, timerSeconds, session, router, onMeetingStarted, onNoteCreated]);

//   // ─── Handle submit ──────────────────────────────────────────────────────
//   const handleSubmit = useCallback(async (text?: string) => {
//     const prompt = (text || input).trim();
//     if (!prompt || isProcessing) return;

//     setInput('');
//     setResult(null);
//     setIsProcessing(true);
//     setHistory(h => [...h, { role: 'user', text: prompt }]);

//     try {
//       const context = buildContext();
//       const action = await callAI(prompt, context);
//       const aiResult = await executeAction(action);

//       setResult(aiResult);
//       setHistory(h => [...h, { role: 'ai', text: aiResult.message }]);
//     } catch (err) {
//       const msg = err instanceof Error ? err.message : 'Something went wrong.';
//       setResult({ success: false, message: msg });
//       setHistory(h => [...h, { role: 'ai', text: msg }]);
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [input, isProcessing, buildContext, executeAction]);

//   const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit();
//     }
//   };

//   // ─── File upload handling ───────────────────────────────────────────────
//   const handleFileSelect = async (file: File) => {
//     setSelectedFile(file);
//   };

//   const handleFileConfirm = async () => {
//     if (!selectedFile || !onFileUpload) return;
//     setIsUploading(true);
//     try {
//       await onFileUpload(selectedFile, uploadVisibility);
//       setResult({ success: true, message: `✓ "${selectedFile.name}" uploaded as ${uploadVisibility.toLowerCase()} file` });
//       setHistory(h => [...h, { role: 'ai', text: `✓ File uploaded successfully` }]);
//     } catch {
//       setResult({ success: false, message: 'Upload failed. Please try again.' });
//     } finally {
//       setIsUploading(false);
//       setShowUploadModal(false);
//       setSelectedFile(null);
//     }
//   };

//   // ─── Drag & Drop ────────────────────────────────────────────────────────
//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files[0];
//     if (file) handleFileSelect(file);
//   };

//   // ─── Trigger button (always visible) ────────────────────────────────────
//   return (
//     <>
//       {/* Floating trigger */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 z-50 size-12 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
//           title="AI Assistant (⌘K)"
//           aria-label="Open AI Assistant"
//         >
//           <Sparkles size={20} />
//           {timerRunning && (
//             <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[28px] text-center">
//               {formatTimer(timerSeconds)}
//             </span>
//           )}
//         </button>
//       )}

//       {/* Overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[10vh]"
//           onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}
//         >
//           <div
//             className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
//             style={{ maxHeight: '80vh' }}
//           >
//             {/* Header */}
//             <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
//               <Sparkles size={18} className="text-violet-500 flex-shrink-0" />
//               <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Conferio AI</span>
//               {timerRunning && (
//                 <span className="ml-auto flex items-center gap-1.5 text-xs font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
//                   <span className="size-1.5  bg-green-500 rounded-full animate-pulse" />
//                   {formatTimer(timerSeconds)}
//                 </span>
//               )}
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="ml-auto text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
//                 aria-label="Close"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* Scrollable body */}
//             <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 180px)' }}>
//               {/* Suggestion chips (when no history) */}
//               {history.length === 0 && (
//                 <div className="p-5">
//                   <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
//                     Quick actions
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {SUGGESTIONS.map(s => (
//                       <button
//                         key={s.label}
//                         onClick={() => handleSubmit(s.prompt)}
//                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 hover:text-violet-700 dark:hover:text-violet-300 transition-colors border border-gray-200 dark:border-gray-700"
//                       >
//                         {s.icon}
//                         {s.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Conversation history */}
//               {history.length > 0 && (
//                 <div className="px-5 py-4 gap-y-3">
//                   {history.map((msg, i) => (
//                     <div
//                       key={i}
//                       className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
//                     >
//                       {msg.role === 'ai' && (
//                         <div className="size-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
//                           <Sparkles size={13} className="text-violet-600 dark:text-violet-400" />
//                         </div>
//                       )}
//                       <div
//                         className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
//                           msg.role === 'user'
//                             ? 'bg-violet-600 text-white rounded-br-sm'
//                             : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
//                         }`}
//                       >
//                         {msg.text}
//                       </div>
//                     </div>
//                   ))}

//                   {isProcessing && (
//                     <div className="flex gap-3 justify-start">
//                       <div className="size-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0">
//                         <Loader2 size={13} className="text-violet-600 animate-spin" />
//                       </div>
//                       <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-gray-800 flex items-center gap-1.5">
//                         <span className="size-1.5  bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
//                         <span className="size-1.5  bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
//                         <span className="size-1.5  bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Clear chat */}
//               {history.length > 0 && (
//                 <div className="px-5 pb-3">
//                   <button
//                     onClick={() => { setHistory([]); setResult(null); }}
//                     className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
//                   >
//                     Clear conversation
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Input area */}
//             <div className="border-t border-gray-100 dark:border-gray-800 p-4">
//               <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2">
//                 <textarea
//                   ref={inputRef}
//                   value={input}
//                   onChange={e => setInput(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   placeholder="Ask me anything… create task, schedule meeting, send message…"
//                   rows={1}
//                   disabled={isProcessing}
//                   className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none min-h-[24px] max-h-[120px]"
//                   style={{ lineHeight: '1.5' }}
//                   onInput={e => {
//                     const el = e.currentTarget;
//                     el.style.height = 'auto';
//                     el.style.height = Math.min(el.scrollHeight, 120) + 'px';
//                   }}
//                 />

//                 {/* Voice button */}
//                 <button
//                   onClick={isListening ? stopListening : startListening}
//                   className={`flex-shrink-0 size-8 rounded-lg flex items-center justify-center transition-colors ${
//                     isListening
//                       ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
//                       : 'text-gray-400 hover:text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900/30'
//                   }`}
//                   title={isListening ? 'Stop listening' : 'Voice input'}
//                   aria-label="Voice input"
//                 >
//                   {isListening ? <MicOff size={16} /> : <Mic size={16} />}
//                 </button>

//                 {/* Send button */}
//                 <button
//                   onClick={() => handleSubmit()}
//                   disabled={!input.trim() || isProcessing}
//                   className="flex-shrink-0 size-8 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
//                   aria-label="Send"
//                 >
//                   {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
//                 </button>
//               </div>

//               <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-2 text-center">
//                 ⌘K to toggle · Enter to send · Shift+Enter for new line · 🎤 for voice
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── File Upload Modal ──────────────────────────────────────────── */}
//       {showUploadModal && (
//         <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
//               <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
//                 <Upload size={16} className="text-violet-500" />
//                 Upload File
//               </h3>
//               <button
//                 onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}
//                 className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <div className="p-5 gap-y-4">
//               {/* Drop zone */}
//               <div
//                 ref={dropZoneRef}
//                 onDrop={handleDrop}
//                 onDragOver={e => e.preventDefault()}
//                 onClick={() => fileInputRef.current?.click()}
//                 className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 dark:hover:border-violet-600 dark:hover:bg-violet-900/10 transition-all"
//               >
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   className="hidden"
//                   onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
//                 />
//                 {selectedFile ? (
//                   <div className="gap-y-1">
//                     <FileText size={32} className="mx-auto text-violet-500" />
//                     <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{selectedFile.name}</p>
//                     <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
//                   </div>
//                 ) : (
//                   <div className="gap-y-1">
//                     <Upload size={32} className="mx-auto text-gray-400" />
//                     <p className="text-sm text-gray-600 dark:text-gray-400">Drop a file or click to browse</p>
//                     <p className="text-xs text-gray-400">Any file type supported</p>
//                   </div>
//                 )}
//               </div>

//               {/* Visibility selector */}
//               <div>
//                 <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Visibility</p>
//                 <div className="flex gap-2">
//                   {(['PERSONAL', 'TEAM'] as const).map(v => (
//                     <button
//                       key={v}
//                       onClick={() => setUploadVisibility(v)}
//                       className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
//                         uploadVisibility === v
//                           ? 'bg-violet-600 text-white border-violet-600'
//                           : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-300'
//                       }`}
//                     >
//                       {v === 'PERSONAL' ? '🔒 Personal' : '👥 Team'}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Confirm button */}
//               <button
//                 onClick={handleFileConfirm}
//                 disabled={!selectedFile || isUploading}
//                 className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
//               >
//                 {isUploading ? (
//                   <><Loader2 size={16} className="animate-spin" /> Uploading…</>
//                 ) : (
//                   <><Upload size={16} /> Upload File</>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// 'use client';

// import React, {
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
//   KeyboardEvent,
// } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import { X, Mic, MicOff, Loader2, Sparkles, Send,
//          CheckSquare, Calendar, Upload, Video, StickyNote,
//          MessageSquare, Timer, FileText } from 'lucide-react';

// // ─── Types ─────────────────────────────────────────────────────────────────
// type ActionType =
//   | 'create_task' | 'schedule_meeting' | 'upload_file' | 'start_meeting'
//   | 'create_note' | 'send_message' | 'start_timer' | 'stop_timer' | 'unknown';

// interface ParsedAction {
//   type: ActionType;
//   data: Record<string, any>;
//   confidence: number;
//   displayText: string;
// }

// interface AIResult {
//   success: boolean;
//   message: string;
//   action?: ParsedAction;
//   data?: any;
// }

// interface SuggestionChip {
//   label: string;
//   prompt: string;
//   icon: React.ReactNode;
// }

// const SUGGESTIONS: SuggestionChip[] = [
//   { label: 'Create task', prompt: 'Create a new task', icon: <CheckSquare size={13} /> },
//   { label: 'Schedule meeting', prompt: 'Schedule a meeting', icon: <Calendar size={13} /> },
//   { label: 'Upload file', prompt: 'Upload a file to team', icon: <Upload size={13} /> },
//   { label: 'Start meeting', prompt: 'Start a video meeting now', icon: <Video size={13} /> },
//   { label: 'New note', prompt: 'Create a new note', icon: <StickyNote size={13} /> },
//   { label: 'Send message', prompt: 'Send a message to general channel', icon: <MessageSquare size={13} /> },
//   { label: 'Start timer', prompt: 'Start my work timer', icon: <Timer size={13} /> },
// ];

// // ─── Rule-based parser (client-side, no API needed) ─────────────────────────
// function localParse(prompt: string): ParsedAction {
//   const lower = prompt.toLowerCase().trim();
//   if (lower.match(/\b(stop|end|finish)\b.*\btimer\b/))
//     return { type: 'stop_timer', data: {}, confidence: 0.9, displayText: 'Stop the running timer' };
//   if (lower.match(/\bstart\b.*\btimer\b/) || lower === 'start timer')
//     return { type: 'start_timer', data: { taskId: null, description: 'Work session' }, confidence: 0.9, displayText: 'Start time tracking timer' };
//   if (lower.match(/\b(start|begin|launch|create)\b.*\b(meeting|video|call)\b/)) {
//     const t = prompt.match(/(?:called?|named?)\s+["']?([^"']+?)["']?(?:\s|$)/i);
//     return { type: 'start_meeting', data: { title: t?.[1] || 'Instant Meeting' }, confidence: 0.85, displayText: 'Start a new video meeting' };
//   }
//   if (lower.match(/\b(create|add|new)\b.*\bnote\b/)) {
//     const t = prompt.match(/note\s+(?:called?|named?|titled?)\s+["']?([^"'\n]+?)["']?(?:\s|$)/i)
//            || prompt.match(/["']([^"']+)["']/);
//     return { type: 'create_note', data: { title: t?.[1]?.trim() || 'Untitled Note', content: null }, confidence: 0.85, displayText: `Create note` };
//   }
//   if (lower.match(/\b(create|add|new)\b.*\btask\b/)) {
//     const t = prompt.match(/task\s+(?:called?|named?|titled?|:)?\s*["']?([^"'\n]+?)["']?(?:\s+in\s+|\s*$)/i);
//     const b = prompt.match(/\bin\s+(?:the\s+)?([a-zA-Z0-9\s]+?)\s+board\b/i);
//     const title = t?.[1]?.trim() || prompt.replace(/create|add|new|task/gi, '').trim() || 'New Task';
//     return { type: 'create_task', data: { title, boardName: b?.[1]?.trim() || null, columnName: null, priority: lower.includes('urgent') ? 'URGENT' : lower.includes('high') ? 'HIGH' : 'MEDIUM', dueDate: null, assignee: null }, confidence: 0.8, displayText: `Create task "${title}"` };
//   }
//   if (lower.match(/\b(upload|attach)\b.*\bfile\b/))
//     return { type: 'upload_file', data: { visibility: lower.includes('team') ? 'TEAM' : 'PERSONAL', description: null }, confidence: 0.85, displayText: 'Upload file' };
//   if (lower.match(/\b(schedule|book|arrange)\b.*\bmeeting\b/))
//     return { type: 'schedule_meeting', data: { eventSlug: null, guestName: null, guestEmail: null, dateTime: null, duration: 30 }, confidence: 0.8, displayText: 'Schedule a meeting' };
//   if (lower.match(/\b(send|post|text|write)\b.*\b(message|msg)\b/) || lower.startsWith('send ')) {
//     const cm = prompt.match(/(?:to\s+)?(?:#|channel\s+)?([a-zA-Z0-9-_]+)\s+(?:channel\s+)?(?:say(?:ing)?|that|:)\s+(.+)/i);
//     const gm = prompt.match(/(?:say(?:ing)?|that|:)\s+(.+)/i)?.[1];
//     return { type: 'send_message', data: { serverName: null, channelName: cm?.[1] || 'general', message: cm?.[2] || gm || prompt }, confidence: 0.75, displayText: 'Send message to channel' };
//   }
//   return { type: 'unknown', data: { originalText: prompt }, confidence: 0, displayText: prompt };
// }

// // ─── AI API call with graceful fallback ─────────────────────────────────────
// async function callAI(prompt: string, context: string): Promise<ParsedAction> {
//   // Try client-side Gemini first (fastest, no server round-trip)
//   if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GOOGLE_AI_KEY) {
//     try {
//       const models = ['gemini-2.5-flash-latest', 'gemini-2.5-flash'];
//       for (const model of models) {
//         const res = await fetch(
//           `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.NEXT_PUBLIC_GOOGLE_AI_KEY}`,
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               contents: [{ parts: [{ text: `Parse this workspace command and return ONLY valid JSON with fields: type, data, confidence, displayText.\n\nTypes: create_task, schedule_meeting, upload_file, start_meeting, create_note, send_message, start_timer, stop_timer, unknown\n\nCommand: "${prompt}"\n\nReturn only JSON, no markdown.` }] }],
//               generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
//             }),
//           }
//         );
//         if (!res.ok) continue;
//         const d = await res.json();
//         const text = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
//         const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
//         const match = cleaned.match(/\{[\s\S]*\}/);
//         if (match) {
//           const parsed = JSON.parse(match[0]);
//           if (parsed?.type) return parsed;
//         }
//       }
//     } catch (_) {
//       // silently fall through to server
//     }
//   }

//   // Try server-side AI route
//   try {
//     const res = await fetch('/api/ai/parse-command', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ prompt, context }),
//     });

//     if (!res.ok) {
//       // Server returned error — don't try to parse HTML
//       console.warn('[ConferioAI] Server parse-command returned', res.status);
//       return localParse(prompt);
//     }

//     const contentType = res.headers.get('content-type') || '';
//     if (!contentType.includes('application/json')) {
//       // Got HTML (error page) — fall back
//       console.warn('[ConferioAI] Got non-JSON response from parse-command');
//       return localParse(prompt);
//     }

//     const result = await res.json();
//     if (result?.type) return result;
//     return localParse(prompt);
//   } catch (_) {
//     return localParse(prompt);
//   }
// }

// // ─── Main Component ────────────────────────────────────────────────────────
// interface ConferioAIProps {
//   onFileUpload?: (file: File, visibility: 'PERSONAL' | 'TEAM') => Promise<void>;
//   onNoteCreated?: (noteId: string) => void;
//   onMeetingStarted?: (roomName: string) => void;
// }

// export default function ConferioAI({ onFileUpload, onNoteCreated, onMeetingStarted }: ConferioAIProps) {
//   const { data: session } = useSession();
//   const router = useRouter();

//   const [isOpen, setIsOpen] = useState(false);
//   const [input, setInput] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [uploadVisibility, setUploadVisibility] = useState<'PERSONAL' | 'TEAM'>('PERSONAL');
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [timerRunning, setTimerRunning] = useState(false);
//   const [timerSeconds, setTimerSeconds] = useState(0);
//   const [history, setHistory] = useState<Array<{ role: 'user' | 'ai'; text: string; success?: boolean }>>([]);

//   const inputRef = useRef<HTMLTextAreaElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const recognitionRef = useRef<any>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // ─── Keyboard shortcut ───────────────────────────────────────────────────
//   useEffect(() => {
//     const handler = (e: globalThis.KeyboardEvent) => {
//       if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsOpen(p => !p); }
//       if (e.key === 'Escape' && isOpen) setIsOpen(false);
//     };
//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, [isOpen]);

//   useEffect(() => {
//     if (isOpen) setTimeout(() => inputRef.current?.focus(), 60);
//   }, [isOpen]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [history, isProcessing]);

//   // ─── Timer ───────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (timerRunning) {
//       timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
//     } else {
//       if (timerRef.current) clearInterval(timerRef.current);
//     }
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, [timerRunning]);

//   const fmt = (s: number) => {
//     const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
//     return h > 0
//       ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
//       : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
//   };

//   // ─── Voice ───────────────────────────────────────────────────────────────
//   const startListening = useCallback(() => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert('Speech recognition not supported in this browser.'); return; }
//     const r = new SR();
//     r.continuous = false; r.interimResults = false; r.lang = 'en-US';
//     r.onresult = (e: any) => {
//       const t = e.results[0][0].transcript;
//       setInput(t); setIsListening(false);
//       setTimeout(() => handleSubmit(t), 200);
//     };
//     r.onerror = () => setIsListening(false);
//     r.onend = () => setIsListening(false);
//     recognitionRef.current = r;
//     r.start(); setIsListening(true);
//   }, []);

//   const stopListening = useCallback(() => {
//     recognitionRef.current?.stop(); setIsListening(false);
//   }, []);

//   // ─── Context ─────────────────────────────────────────────────────────────
//   const buildContext = useCallback(() =>
//     session?.user ? `User: ${session.user.name} (${session.user.email}). Page: ${router.pathname}` : '',
//   [session, router.pathname]);

//   // ─── Execute action ───────────────────────────────────────────────────────
//   const executeAction = useCallback(async (action: ParsedAction): Promise<AIResult> => {
//     const { type, data } = action;

//     try {
//       switch (type) {

//         case 'create_task': {
//           const boards = await fetch('/api/boards').then(r => { if (!r.ok) throw new Error('Failed to load boards'); return r.json(); });
//           if (!boards?.length) return { success: false, message: 'No boards found. Create a board first in the Boards section.' };
//           const board = (data.boardName ? boards.find((b: any) => b.title.toLowerCase().includes(data.boardName.toLowerCase())) : null) || boards[0];
//           const columns = await fetch(`/api/boards/${board.id}/columns`).then(r => { if (!r.ok) throw new Error('Failed to load columns'); return r.json(); });
//           if (!columns?.length) return { success: false, message: `Board "${board.title}" has no columns. Add a column first.` };
//           const col = (data.columnName ? columns.find((c: any) => c.title.toLowerCase().includes(data.columnName.toLowerCase())) : null)
//                    || columns.find((c: any) => /to.?do|todo|backlog/i.test(c.title))
//                    || columns[0];
//           const task = await fetch(`/api/boards/${board.id}/tasks`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ title: data.title || 'New Task', columnId: col.id, boardId: board.id, priority: data.priority || 'MEDIUM', dueDate: data.dueDate || null }),
//           }).then(r => { if (!r.ok) throw new Error('Failed to create task'); return r.json(); });
//           return { success: true, message: `✓ Task "${task.title}" created in **${board.title}** → ${col.title}`, data: task };
//         }

//         case 'schedule_meeting': {
//           const events = await fetch('/api/events').then(r => { if (!r.ok) throw new Error('Failed to load events'); return r.json(); });
//           if (!events?.length) return { success: false, message: 'No event types found. Create one in Settings → Events first.' };
//           const event = (data.eventSlug ? events.find((e: any) => e.slug === data.eventSlug) : null) || events[0];
//           const start = data.dateTime ? new Date(data.dateTime) : new Date(Date.now() + 86400000);
//           const end = new Date(start.getTime() + (data.duration || 30) * 60000);
//           const meeting = await fetch('/api/meetings', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ eventId: event.id, guestName: data.guestName || 'Guest', guestEmail: data.guestEmail || `guest-${Date.now()}@placeholder.com`, startTime: start.toISOString(), endTime: end.toISOString(), meetLink: '', calendarEventId: `ai-${Date.now()}`, calendarAppType: 'GOOGLE_MEET_AND_CALENDAR' }),
//           }).then(r => { if (!r.ok) throw new Error('Failed to schedule meeting'); return r.json(); });
//           return { success: true, message: `✓ Meeting "${event.title}" scheduled for ${start.toLocaleDateString()}`, data: meeting };
//         }

//         case 'upload_file': {
//           setShowUploadModal(true);
//           return { success: true, message: 'Opening file upload — drop or select your file.' };
//         }

//         case 'start_meeting': {
//           const roomName = `conf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
//           const meeting = await fetch('/api/video-meetings', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ title: data.title || 'Instant Meeting', roomName }),
//           }).then(r => { if (!r.ok) throw new Error('Failed to create meeting room'); return r.json(); });
//           onMeetingStarted?.(meeting.roomName);
//           setIsOpen(false);
//           setTimeout(() => router.push(`/video-meeting/${meeting.roomName}`), 300);
//           return { success: true, message: `✓ Meeting "${meeting.title}" started! Joining now…`, data: meeting };
//         }

//         case 'create_note': {
//           const note = await fetch('/api/notes', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ title: data.title || 'Untitled Note', content: null }),
//           }).then(r => { if (!r.ok) throw new Error('Failed to create note'); return r.json(); });
//           onNoteCreated?.(note.id);
//           window.dispatchEvent(new CustomEvent('conferio:open-note', { detail: { noteId: note.id } }));
//           return { success: true, message: `✓ Note "${note.title}" created and opened`, data: note };
//         }

//         case 'send_message': {
//           const servers = await fetch('/api/servers').then(r => { if (!r.ok) throw new Error('Failed to load servers'); return r.json(); });
//           if (!servers?.length) return { success: false, message: 'No servers found. Join or create a server first.' };
//           const server = (data.serverName ? servers.find((s: any) => s.name.toLowerCase().includes(data.serverName.toLowerCase())) : null) || servers[0];
//           const [channels, members] = await Promise.all([
//             fetch(`/api/servers/${server.id}/channels`).then(r => r.json()),
//             fetch(`/api/servers/${server.id}/members`).then(r => r.json()),
//           ]);
//           const channel = (data.channelName
//             ? channels.find((c: any) => c.name.toLowerCase().includes(data.channelName.toLowerCase()))
//             : channels.find((c: any) => c.name === 'general')) || channels[0];
//           if (!channel) return { success: false, message: 'No channel found in this server.' };
//           const member = members?.find((m: any) => m.userId === session?.user?.id || m.user?.id === session?.user?.id);
//           if (!member) return { success: false, message: 'You are not a member of this server.' };
//           await fetch(`/api/servers/${server.id}/channels/${channel.id}/messages`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ content: data.message || '', memberId: member.id }),
//           });
//           return { success: true, message: `✓ Message sent to **#${channel.name}** in **${server.name}**` };
//         }

//         case 'start_timer': {
//           if (timerRunning) return { success: false, message: 'A timer is already running. Say "stop timer" first.' };
//           const teams = await fetch('/api/time-tracking/teams').then(r => r.json());
//           const team = teams?.[0];
//           if (!team) return { success: false, message: 'No team found. Create or join a team first.' };
//           await fetch('/api/time-tracking/timer/start', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ teamId: team.id, taskId: data.taskId || null, description: data.description || 'Voice timer', startTime: new Date().toISOString(), entryType: 'TIMER', isRunning: true }),
//           });
//           setTimerRunning(true); setTimerSeconds(0);
//           return { success: true, message: '✓ Timer started! It shows on the button.' };
//         }

//         case 'stop_timer': {
//           if (!timerRunning) return { success: false, message: 'No timer is currently running.' };
//           const entries = await fetch('/api/time-entries?running=true').then(r => r.json());
//           const running = Array.isArray(entries) ? entries[0] : entries?.data?.[0];
//           if (running?.id) {
//             await fetch(`/api/time-entries/${running.id}`, {
//               method: 'PATCH',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ endTime: new Date().toISOString(), duration: timerSeconds, isRunning: false }),
//             });
//           }
//           const elapsed = timerSeconds;
//           setTimerRunning(false); setTimerSeconds(0);
//           return { success: true, message: `✓ Timer stopped. Logged **${fmt(elapsed)}**` };
//         }

//         case 'unknown':
//           return { success: false, message: `I couldn't understand that. Try something like:\n• "Create task Fix bug"\n• "Start a video meeting"\n• "Send message to general saying hello"\n• "Start timer"` };

//         default:
//           return { success: false, message: 'Unknown action type.' };
//       }
//     } catch (err) {
//       const msg = err instanceof Error ? err.message : 'Something went wrong';
//       return { success: false, message: `Error: ${msg}` };
//     }
//   }, [timerRunning, timerSeconds, session, router, onMeetingStarted, onNoteCreated]);

//   // ─── Submit ───────────────────────────────────────────────────────────────
//   const handleSubmit = useCallback(async (text?: string) => {
//     const prompt = (text !== undefined ? text : input).trim();
//     if (!prompt || isProcessing) return;
//     setInput('');
//     setIsProcessing(true);
//     setHistory(h => [...h, { role: 'user', text: prompt }]);

//     try {
//       const context = buildContext();
//       const action = await callAI(prompt, context);
//       const result = await executeAction(action);
//       setHistory(h => [...h, { role: 'ai', text: result.message, success: result.success }]);
//     } catch (err) {
//       const msg = err instanceof Error ? err.message : 'Something went wrong.';
//       setHistory(h => [...h, { role: 'ai', text: msg, success: false }]);
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [input, isProcessing, buildContext, executeAction]);

//   const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
//   };

//   // ─── File upload ─────────────────────────────────────────────────────────
//   const handleFileConfirm = async () => {
//     if (!selectedFile) return;
//     setIsUploading(true);
//     try {
//       if (onFileUpload) {
//         await onFileUpload(selectedFile, uploadVisibility);
//       } else {
//         // Default upload via your existing /api/files endpoint
//         const formData = new FormData();
//         formData.append('file', selectedFile);
//         formData.append('visibility', uploadVisibility);
//         const res = await fetch('/api/files', { method: 'POST', body: formData });
//         if (!res.ok) throw new Error('Upload failed');
//       }
//       setHistory(h => [...h, { role: 'ai', text: `✓ "${selectedFile.name}" uploaded successfully as ${uploadVisibility.toLowerCase()}`, success: true }]);
//     } catch (err) {
//       setHistory(h => [...h, { role: 'ai', text: `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`, success: false }]);
//     } finally {
//       setIsUploading(false); setShowUploadModal(false); setSelectedFile(null);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     const f = e.dataTransfer.files[0];
//     if (f) setSelectedFile(f);
//   };

//   // ─── Render ───────────────────────────────────────────────────────────────
//   return (
//     <>
//       {/* FAB trigger */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 z-50 size-12 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all duration-150"
//           title="AI Assistant (⌘K)"
//           aria-label="Open Conferio AI"
//         >
//           <Sparkles size={20} />
//           {timerRunning && (
//             <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[30px] text-center leading-tight">
//               {fmt(timerSeconds)}
//             </span>
//           )}
//         </button>
//       )}

//       {/* Backdrop + modal */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-start justify-center pt-[8vh] px-4"
//           onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}
//         >
//           <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col" style={{ maxHeight: '82vh' }}>

//             {/* Header */}
//             <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
//               <div className="size-6 rounded-md bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center">
//                 <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
//               </div>
//               <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Conferio AI</span>
//               {timerRunning && (
//                 <div className="ml-2 flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
//                   <span className="size-1.5  bg-emerald-500 rounded-full animate-pulse" />
//                   {fmt(timerSeconds)}
//                 </div>
//               )}
//               <div className="ml-auto flex items-center gap-2">
//                 {history.length > 0 && (
//                   <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded transition-colors">
//                     Clear
//                   </button>
//                 )}
//                 <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors" aria-label="Close">
//                   <X size={17} />
//                 </button>
//               </div>
//             </div>

//             {/* Scrollable body */}
//             <div className="flex-1 overflow-y-auto min-h-0">
//               {/* Suggestions */}
//               {history.length === 0 && (
//                 <div className="p-5">
//                   <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Quick actions</p>
//                   <div className="flex flex-wrap gap-2">
//                     {SUGGESTIONS.map(s => (
//                       <button
//                         key={s.label}
//                         onClick={() => handleSubmit(s.prompt)}
//                         disabled={isProcessing}
//                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/40 hover:text-violet-700 dark:hover:text-violet-300 transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50"
//                       >
//                         <span className="text-gray-400 dark:text-gray-500">{s.icon}</span>
//                         {s.label}
//                       </button>
//                     ))}
//                   </div>
//                   <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
//                     <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Try saying:</p>
//                     {[
//                       '"Create task Fix login bug in Engineering board"',
//                       '"Send message to general saying everyone come on time"',
//                       '"Start a video meeting called Team Standup"',
//                       '"Create a note called Sprint Review"',
//                     ].map(ex => (
//                       <button
//                         key={ex}
//                         onClick={() => handleSubmit(ex.replace(/"/g, ''))}
//                         className="block w-full text-left text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 py-0.5 transition-colors"
//                       >
//                         {ex}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Chat messages */}
//               {history.length > 0 && (
//                 <div className="px-5 py-4 gap-y-3">
//                   {history.map((msg, i) => (
//                     <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                       {msg.role === 'ai' && (
//                         <div className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.success === false ? 'bg-red-100 dark:bg-red-900/40' : 'bg-violet-100 dark:bg-violet-900/50'}`}>
//                           <Sparkles size={12} className={msg.success === false ? 'text-red-500' : 'text-violet-600 dark:text-violet-400'} />
//                         </div>
//                       )}
//                       <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
//                         msg.role === 'user'
//                           ? 'bg-violet-600 text-white rounded-br-sm'
//                           : msg.success === false
//                             ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-bl-sm border border-red-200 dark:border-red-800/50'
//                             : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
//                       }`}>
//                         {msg.text}
//                       </div>
//                     </div>
//                   ))}

//                   {isProcessing && (
//                     <div className="flex gap-2.5 justify-start">
//                       <div className="size-6 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0">
//                         <Loader2 size={12} className="text-violet-600 animate-spin" />
//                       </div>
//                       <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-gray-800 flex items-center gap-1">
//                         {[0, 150, 300].map(d => (
//                           <span key={d} className="size-1.5  bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                   <div ref={messagesEndRef} />
//                 </div>
//               )}
//             </div>

//             {/* Input */}
//             <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex-shrink-0">
//               <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 focus-within:border-violet-400 dark:focus-within:border-violet-600 transition-colors">
//                 <textarea
//                   ref={inputRef}
//                   value={input}
//                   onChange={e => setInput(e.target.value)}
//                   onKeyDown={handleKey}
//                   placeholder="Ask me anything… create task, start meeting, send message…"
//                   rows={1}
//                   disabled={isProcessing}
//                   className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none"
//                   style={{ lineHeight: '1.5', minHeight: '22px', maxHeight: '120px' }}
//                   onInput={e => {
//                     const el = e.currentTarget;
//                     el.style.height = 'auto';
//                     el.style.height = Math.min(el.scrollHeight, 120) + 'px';
//                   }}
//                 />
//                 <button
//                   onClick={isListening ? stopListening : startListening}
//                   className={`flex-shrink-0 size-8 rounded-lg flex items-center justify-center transition-colors ${
//                     isListening ? 'bg-red-100 dark:bg-red-900/40 text-red-500' : 'text-gray-400 hover:text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900/40'
//                   }`}
//                   title={isListening ? 'Stop listening' : 'Voice input'}
//                 >
//                   {isListening ? <MicOff size={15} /> : <Mic size={15} />}
//                 </button>
//                 <button
//                   onClick={() => handleSubmit()}
//                   disabled={!input.trim() || isProcessing}
//                   className="flex-shrink-0 size-8 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
//                 >
//                   {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
//                 </button>
//               </div>
//               <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5 text-center">
//                 ⌘K toggle · Enter send · Shift+Enter new line · 🎤 voice
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── File Upload Modal ──────────────────────────────────────────────── */}
//       {showUploadModal && (
//         <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700">
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
//               <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-2">
//                 <Upload size={15} className="text-violet-500" /> Upload File
//               </h3>
//               <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); }} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
//                 <X size={17} />
//               </button>
//             </div>
//             <div className="p-5 gap-y-4">
//               <div
//                 onDrop={handleDrop} onDragOver={e => e.preventDefault()}
//                 onClick={() => fileInputRef.current?.click()}
//                 className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-7 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 dark:hover:border-violet-600 dark:hover:bg-violet-900/10 transition-all"
//               >
//                 <input ref={fileInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
//                 {selectedFile ? (
//                   <div className="gap-y-1.5">
//                     <FileText size={28} className="mx-auto text-violet-500" />
//                     <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{selectedFile.name}</p>
//                     <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
//                   </div>
//                 ) : (
//                   <div className="gap-y-1.5">
//                     <Upload size={28} className="mx-auto text-gray-300 dark:text-gray-600" />
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Drop file or click to browse</p>
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Visibility</p>
//                 <div className="flex gap-2">
//                   {(['PERSONAL', 'TEAM'] as const).map(v => (
//                     <button key={v} onClick={() => setUploadVisibility(v)}
//                       className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
//                         uploadVisibility === v ? 'bg-violet-600 text-white border-violet-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-300'
//                       }`}
//                     >
//                       {v === 'PERSONAL' ? '🔒 Personal' : '👥 Team'}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <button
//                 onClick={handleFileConfirm} disabled={!selectedFile || isUploading}
//                 className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
//               >
//                 {isUploading ? <><Loader2 size={15} className="animate-spin" /> Uploading…</> : <><Upload size={15} /> Upload File</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// 'use client';

// import React, { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import { X, Mic, MicOff, Loader2, Sparkles, Send, CheckSquare, Calendar, Upload, Video, StickyNote, MessageSquare, Timer, FileText } from 'lucide-react';
// // import { EnhancedFileUploader } from '@/components/file-manager/files/EnhancedFileUploader';
// import { EnhancedFileUploader } from '@/components/file-manager/files/fileuploader-dialog';

// // ─── Types ────────────────────────────────────────────────────────────────────
// type ActionType = 'create_task' | 'schedule_meeting' | 'upload_file' | 'start_meeting' | 'create_note' | 'send_message' | 'start_timer' | 'stop_timer' | 'unknown';

// interface ParsedAction {
//   type: ActionType;
//   data: Record<string, any>;
//   confidence: number;
//   displayText: string;
// }

// interface AIResult { success: boolean; message: string; }

// const SUGGESTIONS = [
//   { label: 'Create task', prompt: 'Create a new task', icon: <CheckSquare size={13} /> },
//   { label: 'Schedule meeting', prompt: 'Schedule a meeting', icon: <Calendar size={13} /> },
//   { label: 'Upload file', prompt: 'Upload a file to team', icon: <Upload size={13} /> },
//   { label: 'Start meeting', prompt: 'Start a video meeting now', icon: <Video size={13} /> },
//   { label: 'New note', prompt: 'Create a new note', icon: <StickyNote size={13} /> },
//   { label: 'Send message', prompt: 'Send a message to general channel', icon: <MessageSquare size={13} /> },
//   { label: 'Start timer', prompt: 'Start my work timer', icon: <Timer size={13} /> },
// ];

// // ─── Helpers ─────────────────────────────────────────────────────────────────
// function arr(v: any): any[] {
//   if (Array.isArray(v)) return v;
//   if (v?.data && Array.isArray(v.data)) return v.data;
//   for (const k of ['boards', 'columns', 'tasks', 'events', 'servers', 'channels', 'members', 'teams', 'notes', 'entries']) {
//     if (v?.[k] && Array.isArray(v[k])) return v[k];
//   }
//   return [];
// }

// async function safeJson(res: Response): Promise<any> {
//   const ct = res.headers.get('content-type') || '';
//   if (!ct.includes('application/json')) {
//     const text = await res.text();
//     throw new Error(`Got HTML instead of JSON (${res.status}). Route may not exist. Body: ${text.slice(0, 80)}`);
//   }
//   return res.json();
// }

// // ─── Local rule-based parser (fallback, zero API calls) ──────────────────────
// function localParse(prompt: string): ParsedAction {
//   const lower = prompt.toLowerCase().trim();
//   if (lower.match(/\b(stop|end|finish)\b.*\btimer\b/) || lower === 'stop timer')
//     return { type: 'stop_timer', data: {}, confidence: 0.9, displayText: 'Stop timer' };
//   if (lower.match(/\bstart\b.*\btimer\b/) || lower === 'start timer')
//     return { type: 'start_timer', data: {}, confidence: 0.9, displayText: 'Start timer' };
//   if (lower.match(/\b(start|begin|launch|create)\b.*\b(video.?meeting|instant.?meeting|call)\b/) || lower === 'start a video meeting now')
//     return { type: 'start_meeting', data: { title: prompt.match(/(?:called?|named?)\s+(.+)/i)?.[1] || 'Instant Meeting' }, confidence: 0.9, displayText: 'Start meeting' };
//   if (lower.match(/\b(create|add|new)\b.*\bnote\b/)) {
//     const t = prompt.match(/note\s+(?:called?|named?|titled?)\s+["']?([^"'\n]+?)["']?(?:\s|$)/i) || prompt.match(/["']([^"']+)["']/);
//     return { type: 'create_note', data: { title: t?.[1]?.trim() || 'Untitled Note' }, confidence: 0.85, displayText: 'Create note' };
//   }
//   if (lower.match(/\b(create|add|new)\b.*\btask\b/)) {
//     const t = prompt.match(/task\s+(?:called?|named?|:)?\s*["']?([^"'\n]+?)["']?(?:\s+in\s+|\s*$)/i);
//     const b = prompt.match(/\bin\s+(?:the\s+)?([a-zA-Z0-9 ]+?)\s+board\b/i);
//     return { type: 'create_task', data: { title: t?.[1]?.trim() || 'New Task', boardName: b?.[1]?.trim() || null, priority: lower.includes('urgent') ? 'URGENT' : lower.includes('high') ? 'HIGH' : 'MEDIUM' }, confidence: 0.85, displayText: 'Create task' };
//   }
//   if (lower.match(/\b(upload|attach)\b.*\bfile\b/))
//     return { type: 'upload_file', data: { visibility: lower.includes('team') ? 'TEAM' : 'PERSONAL' }, confidence: 0.85, displayText: 'Upload file' };
//   if (lower.match(/\b(schedule|book|arrange)\b.*\bmeeting\b/)) {
//     const email = prompt.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0] || null;
//     const slug = prompt.match(/(?:event type|using)\s+([a-z0-9-]+)/i)?.[1] || null;
//     return { type: 'schedule_meeting', data: { eventSlug: slug, guestEmail: email, guestName: null, dateTime: null, duration: 30 }, confidence: 0.85, displayText: 'Schedule meeting' };
//   }
//   if (lower.match(/\b(send|post|text)\b.*\b(message|msg)\b/) || lower.startsWith('send ')) {
//     const cm = prompt.match(/(?:to\s+)?(?:#)?([a-zA-Z0-9-_]+)\s+(?:channel\s+)?(?:say(?:ing)?|that|:)\s+(.+)/i);
//     const gm = prompt.match(/(?:say(?:ing)?|that|:)\s+(.+)/i)?.[1];
//     return { type: 'send_message', data: { channelName: cm?.[1] || 'general', message: cm?.[2] || gm || prompt }, confidence: 0.8, displayText: 'Send message' };
//   }
//   return { type: 'unknown', data: { originalText: prompt }, confidence: 0, displayText: prompt };
// }

// // ─── AI parse (Gemini client-side → server → local) ─────────────────────────
// async function callAI(prompt: string, context: string): Promise<ParsedAction> {
//   // 1. Client-side Gemini
//   const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;
//   if (geminiKey) {
//     for (const model of ['gemini-1.5-flash-latest', 'gemini-2.0-flash']) {
//       try {
//         const res = await fetch(
//           `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               contents: [{ parts: [{ text: `You are a JSON command parser for a project management app. Parse the command and return ONLY valid JSON (no markdown) with these fields:\n- type: one of [create_task, schedule_meeting, upload_file, start_meeting, create_note, send_message, start_timer, stop_timer, unknown]\n- data: object with relevant fields extracted from the command\n- confidence: 0 to 1\n- displayText: short human-readable summary\n\nCommand: "${prompt}"\n\nJSON only:` }] }],
//               generationConfig: { temperature: 0.1, maxOutputTokens: 400 },
//             }),
//           }
//         );
//         if (!res.ok) continue;
//         const d = await res.json();
//         const raw = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
//         const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
//         const match = clean.match(/\{[\s\S]*\}/);
//         if (match) { const p = JSON.parse(match[0]); if (p?.type) return p; }
//       } catch (_) { continue; }
//     }
//   }

//   // 2. Server route
//   try {
//     const res = await fetch('/api/ai/parse-command', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ prompt, context }),
//     });
//     if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
//       const r = await res.json();
//       if (r?.type) return r;
//     }
//   } catch (_) { }

//   // 3. Local fallback — always works
//   return localParse(prompt);
// }

// // ─── Task Selector Modal ──────────────────────────────────────────────────────
// // Uses: GET /api/task (from image 5: tasks folder → [id] → index.ts, tasks index.ts)
// function TaskSelector({ onSelect, onCancel }: { onSelect: (taskId: string | null, description: string) => void; onCancel: () => void }) {
//   const [tasks, setTasks] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     // From image 5: tasks folder at api root, index.ts → GET /api/task (singular, as seen in logs: GET /api/task 304)
//     fetch('/api/task')
//       .then(r => r.ok ? r.json() : null)
//       .then(d => { if (d) setTasks(arr(d)); })
//       .catch(() => { })
//       .finally(() => setLoading(false));
//   }, []);

//   const filtered = search ? tasks.filter(t => t.title?.toLowerCase().includes(search.toLowerCase())) : tasks;

//   return (
//     <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
//       <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700">
//         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
//           <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-2">
//             <Timer size={15} className="text-violet-500" /> Select task for timer
//           </h3>
//           <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"><X size={17} /></button>
//         </div>
//         <div className="p-3">
//           <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…"
//             className="w-full text-sm px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-violet-400 text-gray-800 dark:text-gray-200 placeholder-gray-400"
//           />
//         </div>
//         <div className="max-h-56 overflow-y-auto px-2 pb-3">
//           {loading ? (
//             <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
//           ) : (
//             <>
//               <button onClick={() => onSelect(null, 'General work session')}
//                 className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 italic transition-colors">
//                 No specific task — general session
//               </button>
//               {filtered.map((t: any) => (
//                 <button key={t.id} onClick={() => onSelect(t.id, t.title)}
//                   className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors flex items-center justify-between">
//                   <span>{t.title}</span>
//                   {t.priority && <span className="text-[10px] text-gray-400 uppercase ml-2">{t.priority}</span>}
//                 </button>
//               ))}
//               {!loading && filtered.length === 0 && (
//                 <p className="text-xs text-gray-400 text-center py-4">No tasks found</p>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function ConferioAI({ onNoteCreated, onMeetingStarted }: {
//   onNoteCreated?: (noteId: string) => void;
//   onMeetingStarted?: (roomName: string) => void;
// }) {
//   const { data: session } = useSession();
//   const router = useRouter();

//   const [isOpen, setIsOpen] = useState(false);
//   const [input, setInput] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [history, setHistory] = useState<Array<{ role: 'user' | 'ai'; text: string; success?: boolean }>>([]);

//   // File uploader
//   const [showFileUploader, setShowFileUploader] = useState(false);
//   const [fileUploaderTeamId, setFileUploaderTeamId] = useState<string | undefined>();

//   // Task selector / timer
//   const [showTaskSelector, setShowTaskSelector] = useState(false);
//   const [timerResolve, setTimerResolve] = useState<((r: AIResult) => void) | null>(null);
//   const [timerRunning, setTimerRunning] = useState(false);
//   const [timerSeconds, setTimerSeconds] = useState(0);
//   const [timerEntryId, setTimerEntryId] = useState<string | null>(null);

//   const inputRef = useRef<HTMLTextAreaElement>(null);
//   const recognitionRef = useRef<any>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const messagesEnd = useRef<HTMLDivElement>(null);

//   // Keyboard shortcut
//   useEffect(() => {
//     const h = (e: globalThis.KeyboardEvent) => {
//       if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsOpen(p => !p); }
//       if (e.key === 'Escape' && isOpen) setIsOpen(false);
//     };
//     window.addEventListener('keydown', h);
//     return () => window.removeEventListener('keydown', h);
//   }, [isOpen]);

//   useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 60); }, [isOpen]);
//   useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, isProcessing]);

//   // Timer tick
//   useEffect(() => {
//     if (timerRunning) { timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000); }
//     else if (timerRef.current) clearInterval(timerRef.current);
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, [timerRunning]);

//   const fmt = (s: number) => {
//     const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
//     return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
//   };

//   // Voice
//   const startListening = useCallback(() => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert('Voice not supported'); return; }
//     const r = new SR(); r.continuous = false; r.interimResults = false; r.lang = 'en-US';
//     r.onresult = (e: any) => { const t = e.results[0][0].transcript; setInput(t); setIsListening(false); setTimeout(() => handleSubmit(t), 200); };
//     r.onerror = () => setIsListening(false); r.onend = () => setIsListening(false);
//     recognitionRef.current = r; r.start(); setIsListening(true);
//   }, []);
//   const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false); }, []);

//   // ─── Execute Action ─────────────────────────────────────────────────────────
//   const executeAction = useCallback(async (action: ParsedAction): Promise<AIResult> => {
//     const { type, data } = action;
//     try {
//       switch (type) {

//         // ── CREATE TASK ─────────────────────────────────────────────────────
//         // From images:
//         //   GET  /api/boards          → boards index.ts (image 6: boards/[id]/index.ts + boards root)
//         //   GET  /api/columns?boardId=XXX → columns/index.ts (image 6: columns is TOP-LEVEL with [id].ts + index.ts)
//         //   POST /api/task            → tasks/index.ts (image 5: task folder at root)
//         case 'create_task': {
//           const boardsRes = await fetch('/api/boards');
//           if (!boardsRes.ok) throw new Error('Cannot load boards (GET /api/boards returned ' + boardsRes.status + ')');
//           const boards = arr(await safeJson(boardsRes));
//           if (!boards.length) return { success: false, message: 'No boards found. Create a board first.' };

//           const board = data.boardName
//             ? boards.find((b: any) => b.title?.toLowerCase().includes(data.boardName.toLowerCase())) || boards[0]
//             : boards[0];

//           // Columns are top-level: GET /api/columns?boardId=boardId (image 6 shows columns/ at root level)
//           const colRes = await fetch(`/api/columns?boardId=${board.id}`);
//           if (!colRes.ok) throw new Error(`Cannot load columns (GET /api/columns?boardId=${board.id} returned ${colRes.status})`);
//           const columns = arr(await safeJson(colRes));
//           if (!columns.length) return { success: false, message: `Board "${board.title}" has no columns.` };

//           const col = data.columnName
//             ? columns.find((c: any) => c.title?.toLowerCase().includes(data.columnName.toLowerCase())) || columns[0]
//             : columns.find((c: any) => /to.?do|todo|backlog/i.test(c.title || '')) || columns[0];

//           // POST /api/task (singular — image 5: tasks folder → index.ts, logs show GET /api/task)
//           const taskRes = await fetch('/api/task', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               title: data.title || 'New Task',
//               columnId: col.id,
//               boardId: board.id,
//               priority: data.priority || 'MEDIUM',
//               dueDate: data.dueDate || null,
//             }),
//           });
//           if (!taskRes.ok) throw new Error('Task creation failed (' + taskRes.status + ')');
//           const task = await safeJson(taskRes);
//           return { success: true, message: `✓ Task "${task.title || data.title}" created in **${board.title}** → ${col.title}` };
//         }

//         // ── SCHEDULE MEETING ────────────────────────────────────────────────
//         // From image 4:
//         //   GET  /api/event/all       → event/all/index.ts
//         //   POST /api/event/create    → event/create/index.ts (but 405 means it exists, wrong method or needs body)
//         //   GET  /api/events          → ??? (logs show 200 for /api/events so this exists too)
//         //   POST /api/meeting/public/create → seen in code on line 1022 of image 4
//         case 'schedule_meeting': {
//           // Logs show GET /api/events returns 200 — use that
//           const evRes = await fetch('/api/events');
//           if (!evRes.ok) throw new Error('Cannot load events (GET /api/events returned ' + evRes.status + ')');
//           const events = arr(await safeJson(evRes));
//           if (!events.length) return { success: false, message: 'No event types found. Go to Events page → create one first.' };

//           const event = data.eventSlug
//             ? events.find((e: any) => e.slug === data.eventSlug || e.slug?.includes(data.eventSlug)) || events[0]
//             : events[0];

//           const start = data.dateTime ? new Date(data.dateTime) : new Date(Date.now() + 86400000);
//           const end = new Date(start.getTime() + (data.duration || 30) * 60000);

//           // From image 4 line 1022: fetch('/api/meeting/public/create', { method: 'POST', ... })
//           const meetRes = await fetch('/api/meeting/public/create', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               eventId: event.id,
//               guestName: data.guestName || 'Guest',
//               guestEmail: data.guestEmail || `guest-${Date.now()}@placeholder.com`,
//               startTime: start.toISOString(),
//               endTime: end.toISOString(),
//               meetLink: '',
//               calendarEventId: `ai-${Date.now()}`,
//               calendarAppType: 'GOOGLE_MEET_AND_CALENDAR',
//             }),
//           });
//           if (!meetRes.ok) throw new Error('Meeting creation failed (' + meetRes.status + '). Route: POST /api/meeting/public/create');
//           return { success: true, message: `✓ Meeting "${event.title}" scheduled for ${start.toLocaleDateString('en-IN')} at ${start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} with ${data.guestEmail || 'guest'}` };
//         }

//         // ── UPLOAD FILE ─────────────────────────────────────────────────────
//         // From image 4: files/[field]/index.ts, files/upload.ts → POST /api/files/upload
//         // Open existing EnhancedFileUploader — it already calls /api/files/upload internally
//         case 'upload_file': {
//           let teamId: string | undefined;
//           if (data.visibility === 'TEAM') {
//             // From image 2: teams folder under api → GET /api/teams
//             const teamsRes = await fetch('/api/teams').catch(() => null);
//             if (teamsRes?.ok) { const list = arr(await teamsRes.json().catch(() => [])); teamId = list[0]?.id; }
//           }
//           setFileUploaderTeamId(teamId);
//           setShowFileUploader(true);
//           return { success: true, message: 'Opening file uploader…' };
//         }

//         // ── START MEETING ── opens in NEW TAB ──────────────────────────────
//         // From image 2: video-meetings/[roomId]/ → POST /api/video-meetings
//         // Logs confirm: POST /api/video-meetings 200
//         case 'start_meeting': {
//           const roomName = `conf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
//           const res = await fetch('/api/video-meetings', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ title: data.title || 'Instant Meeting', roomName }),
//           });
//           if (!res.ok) throw new Error('Cannot create meeting (' + res.status + ')');
//           const meeting = await safeJson(res);
//           const room = meeting.roomName || meeting.data?.roomName || roomName;
//           onMeetingStarted?.(room);
//           setIsOpen(false);
//           // Open in new tab
//           window.open(`${window.location.origin}/video-meeting/${room}`, '_blank', 'noopener,noreferrer');
//           return { success: true, message: `✓ Meeting "${meeting.title || data.title}" started — opened in new tab!` };
//         }

//         // ── CREATE NOTE ─────────────────────────────────────────────────────
//         // notes folder visible in codebase. Logs show GET /api/notes 200 → POST /api/notes
//         case 'create_note': {
//           const res = await fetch('/api/notes', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ title: data.title || 'Untitled Note', content: null }),
//           });
//           if (!res.ok) throw new Error('Cannot create note (' + res.status + ')');
//           const note = await safeJson(res);
//           const noteId = note.id || note.data?.id;
//           onNoteCreated?.(noteId);
//           window.dispatchEvent(new CustomEvent('conferio:open-note', { detail: { noteId } }));
//           return { success: true, message: `✓ Note "${note.title || data.title}" created and opened` };
//         }

//         // ── SEND MESSAGE ────────────────────────────────────────────────────
//         // From image 5: servers/[serverId]/ has: member.ts, members.ts, [serverId].ts, index.ts
//         //   GET /api/servers → list servers
//         //   GET /api/servers/[serverId]/members → members.ts
//         //   channels is TOP-LEVEL (image 6: channels/ folder at root)
//         //   GET /api/channels?serverId=XXX → channels/index.ts
//         //   POST /api/channels/[channelId]/messages → via socket or direct
//         //   Looking at image 5 also: socket folder exists → messages go via socket API
//         case 'send_message': {
//           // 1. Get servers
//           const srvRes = await fetch('/api/servers');
//           if (!srvRes.ok) throw new Error('Cannot load servers (' + srvRes.status + ')');
//           const servers = arr(await safeJson(srvRes));
//           if (!servers.length) return { success: false, message: 'No servers found. Join or create a server first.' };
//           const server = servers[0]; // Use first server (or could match by name)

//           // 2. Get channels — top level route with serverId param (image 6: channels/ is root-level)
//           const chRes = await fetch(`/api/channels?serverId=${server.id}`);
//           if (!chRes.ok) throw new Error('Cannot load channels (GET /api/channels?serverId=' + server.id + ' returned ' + chRes.status + ')');
//           const channels = arr(await safeJson(chRes));
//           if (!channels.length) return { success: false, message: `No channels found in server "${server.name}".` };

//           const channel = data.channelName
//             ? channels.find((c: any) => c.name?.toLowerCase().includes(data.channelName.toLowerCase())) || channels.find((c: any) => c.name === 'general') || channels[0]
//             : channels.find((c: any) => c.name === 'general') || channels[0];

//           // 3. Get member record — from image 5: servers/[serverId]/members.ts
//           const memRes = await fetch(`/api/servers/${server.id}/members`);
//           if (!memRes.ok) throw new Error('Cannot load members (' + memRes.status + ')');
//           const members = arr(await safeJson(memRes));
//           const member = members.find((m: any) =>
//             m.userId === session?.user?.id ||
//             m.user?.id === session?.user?.id ||
//             m.user?.email === session?.user?.email
//           );
//           if (!member) return { success: false, message: 'You are not a member of this server.' };

//           // 4. Send message — image 5 shows socket/ folder, messages likely go via /api/socket/messages
//           // Try direct channel messages route first, then socket route
//           let sent = false;
//           const msgBody = { content: data.message || '', channelId: channel.id, memberId: member.id };

//           const attempt1 = await fetch(`/api/messages`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(msgBody),
//           }).catch(() => null);

//           if (attempt1?.ok) {
//             sent = true;
//           } else {
//             // Try socket messages route
//             const attempt2 = await fetch(`/api/socket/messages`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(msgBody),
//             }).catch(() => null);
//             if (attempt2?.ok) sent = true;
//           }

//           if (!sent) return { success: false, message: `Could not send message. Tried POST /api/messages and POST /api/socket/messages — check which route your channel messages use.` };
//           return { success: true, message: `✓ Sent to **#${channel.name}** in **${server.name}**: "${(data.message || '').slice(0, 60)}"` };
//         }

//         // ── START TIMER ─────────────────────────────────────────────────────
//         // From image 2: time-tracking/timer/start.ts → POST /api/time-tracking/timer/start
//         // Also: time-tracking/timer/status.ts, stop.ts, pause.ts, resume.ts
//         case 'start_timer': {
//           if (timerRunning) return { success: false, message: 'Timer already running. Say "stop timer" first.' };

//           // Show task selector, return a promise that resolves when user picks
//           return new Promise<AIResult>((resolve) => {
//             setTimerResolve(() => async (taskId: string | null, description: string) => {
//               setShowTaskSelector(false);
//               setTimerResolve(null);
//               try {
//                 // GET /api/teams for teamId
//                 const teams = arr(await fetch('/api/teams').then(r => r.ok ? r.json() : []).catch(() => []));
//                 const team = teams[0];
//                 if (!team) { resolve({ success: false, message: 'No team found.' }); return; }

//                 // POST /api/time-tracking/timer/start (from image 2: timer/start.ts)
//                 const res = await fetch('/api/time-tracking/timer/start', {
//                   method: 'POST',
//                   headers: { 'Content-Type': 'application/json' },
//                   body: JSON.stringify({
//                     teamId: team.id,
//                     taskId: taskId || null,
//                     description: description || 'Voice timer',
//                     startTime: new Date().toISOString(),
//                     entryType: 'TIMER',
//                     isBillable: true,
//                   }),
//                 });
//                 if (!res.ok) throw new Error('Timer start failed (' + res.status + ')');
//                 const entry = await safeJson(res);
//                 setTimerEntryId(entry.id || entry.data?.id || null);
//                 setTimerRunning(true);
//                 setTimerSeconds(0);
//                 resolve({ success: true, message: `✓ Timer started${taskId ? ` for "${description}"` : ' (general session)'}! Visible on the button.` });
//               } catch (err) {
//                 resolve({ success: false, message: `Timer failed: ${err instanceof Error ? err.message : err}` });
//               }
//             });
//             setShowTaskSelector(true);
//           });
//         }

//         // ── STOP TIMER ──────────────────────────────────────────────────────
//         // From image 2: time-tracking/timer/stop.ts → POST /api/time-tracking/timer/stop
//         case 'stop_timer': {
//           if (!timerRunning) return { success: false, message: 'No timer is currently running.' };
//           const elapsed = timerSeconds;

//           // POST /api/time-tracking/timer/stop
//           const stopRes = await fetch('/api/time-tracking/timer/stop', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               entryId: timerEntryId,
//               endTime: new Date().toISOString(),
//               duration: elapsed,
//             }),
//           }).catch(() => null);

//           // Fallback: PATCH the entry directly if stop route doesn't exist
//           if (!stopRes?.ok && timerEntryId) {
//             await fetch(`/api/time-entries/${timerEntryId}`, {
//               method: 'PATCH',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ endTime: new Date().toISOString(), duration: elapsed, isRunning: false }),
//             }).catch(() => { });
//           }

//           setTimerRunning(false); setTimerSeconds(0); setTimerEntryId(null);
//           return { success: true, message: `✓ Timer stopped. Logged **${fmt(elapsed)}**` };
//         }

//         case 'unknown':
//           return { success: false, message: `Couldn't understand that. Try:\n• "Create task Fix bug"\n• "Start a video meeting"\n• "Schedule a meeting for tomorrow 10am with john@acme.com"\n• "Send message to general saying hello"\n• "Start my timer" / "Stop timer"` };

//         default:
//           return { success: false, message: 'Unhandled command type.' };
//       }
//     } catch (err) {
//       return { success: false, message: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` };
//     }
//   }, [timerRunning, timerSeconds, timerEntryId, session, onMeetingStarted, onNoteCreated]);

//   // ─── Submit ───────────────────────────────────────────────────────────────
//   const handleSubmit = useCallback(async (text?: string) => {
//     const prompt = (text !== undefined ? text : input).trim();
//     if (!prompt || isProcessing) return;
//     setInput('');
//     setIsProcessing(true);
//     setHistory(h => [...h, { role: 'user', text: prompt }]);
//     try {
//       const context = session?.user ? `User: ${session.user.name} (${session.user.email})` : '';
//       const action = await callAI(prompt, context);
//       const result = await executeAction(action);
//       setHistory(h => [...h, { role: 'ai', text: result.message, success: result.success }]);
//     } catch (err) {
//       setHistory(h => [...h, { role: 'ai', text: `Error: ${err instanceof Error ? err.message : err}`, success: false }]);
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [input, isProcessing, session, executeAction]);

//   const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
//   };

//   // ─── Render ───────────────────────────────────────────────────────────────
//   return (
//     <>
//       {/* FAB */}
//       {!isOpen && (
//         <button onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 z-50 size-12 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all"
//           title="Conferio AI (⌘K)">
//           <Sparkles size={20} />
//           {timerRunning && (
//             <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[32px] text-center">
//               {fmt(timerSeconds)}
//             </span>
//           )}
//         </button>
//       )}

//       {/* Main modal */}
//       {isOpen && (
//         <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-start justify-center pt-[8vh] px-4"
//           onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}>
//           <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col" style={{ maxHeight: '82vh' }}>

//             {/* Header */}
//             <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
//               <div className="size-6 rounded-md bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center">
//                 <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
//               </div>
//               <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Conferio AI</span>
//               {timerRunning && (
//                 <div className="ml-2 flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
//                   <span className="size-1.5  bg-emerald-500 rounded-full animate-pulse" />
//                   {fmt(timerSeconds)}
//                 </div>
//               )}
//               <div className="ml-auto flex items-center gap-2">
//                 {history.length > 0 && (
//                   <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded">Clear</button>
//                 )}
//                 <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded">
//                   <X size={17} />
//                 </button>
//               </div>
//             </div>

//             {/* Body */}
//             <div className="flex-1 overflow-y-auto min-h-0">
//               {history.length === 0 && (
//                 <div className="p-5">
//                   <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Quick actions</p>
//                   <div className="flex flex-wrap gap-2 mb-5">
//                     {SUGGESTIONS.map(s => (
//                       <button key={s.label} onClick={() => handleSubmit(s.prompt)} disabled={isProcessing}
//                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/40 hover:text-violet-700 dark:hover:text-violet-300 transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50">
//                         <span className="text-gray-400 dark:text-gray-500">{s.icon}</span>{s.label}
//                       </button>
//                     ))}
//                   </div>
//                   <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
//                     <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Try saying:</p>
//                     {[
//                       'Create task Fix login bug in Engineering board',
//                       'Schedule a meeting for tomorrow 10am with kanishkkb18@gmail.com',
//                       'Send message to general saying everyone come on time',
//                       'Start a video meeting called Team Standup',
//                       'Start my timer',
//                     ].map(ex => (
//                       <button key={ex} onClick={() => handleSubmit(ex)}
//                         className="block w-full text-left text-xs text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 py-0.5 transition-colors">
//                         "{ex}"
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {history.length > 0 && (
//                 <div className="px-5 py-4 gap-y-3">
//                   {history.map((msg, i) => (
//                     <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                       {msg.role === 'ai' && (
//                         <div className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.success === false ? 'bg-red-100 dark:bg-red-900/40' : 'bg-violet-100 dark:bg-violet-900/50'}`}>
//                           <Sparkles size={12} className={msg.success === false ? 'text-red-500' : 'text-violet-600 dark:text-violet-400'} />
//                         </div>
//                       )}
//                       <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-sm'
//                         : msg.success === false ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-bl-sm border border-red-200 dark:border-red-800/50'
//                           : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
//                         }`}>
//                         {msg.text}
//                       </div>
//                     </div>
//                   ))}
//                   {isProcessing && (
//                     <div className="flex gap-2.5 justify-start">
//                       <div className="size-6 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0">
//                         <Loader2 size={12} className="text-violet-600 animate-spin" />
//                       </div>
//                       <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-gray-800 flex items-center gap-1">
//                         {[0, 150, 300].map(d => <span key={d} className="size-1.5  bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
//                       </div>
//                     </div>
//                   )}
//                   <div ref={messagesEnd} />
//                 </div>
//               )}
//             </div>

//             {/* Input */}
//             <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex-shrink-0">
//               <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 focus-within:border-violet-400 dark:focus-within:border-violet-600 transition-colors">
//                 <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
//                   placeholder="Ask me anything… create task, start meeting, send message…"
//                   rows={1} disabled={isProcessing}
//                   className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none"
//                   style={{ lineHeight: '1.5', minHeight: '22px', maxHeight: '120px' }}
//                   onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }}
//                 />
//                 <button onClick={isListening ? stopListening : startListening}
//                   className={`flex-shrink-0 size-8 rounded-lg flex items-center justify-center transition-colors ${isListening ? 'bg-red-100 dark:bg-red-900/40 text-red-500' : 'text-gray-400 hover:text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900/40'}`}>
//                   {isListening ? <MicOff size={15} /> : <Mic size={15} />}
//                 </button>
//                 <button onClick={() => handleSubmit()} disabled={!input.trim() || isProcessing}
//                   className="flex-shrink-0 size-8 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all">
//                   {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
//                 </button>
//               </div>
//               <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5 text-center">
//                 ⌘K toggle · Enter send · Shift+Enter new line · 🎤 voice
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Reuse your existing EnhancedFileUploader — it handles everything */}
//       <EnhancedFileUploader
//         open={showFileUploader}
//         onClose={() => {
//           setShowFileUploader(false);
//           setHistory(h => [...h, { role: 'ai', text: '✓ File uploader closed. Check Files section for your uploads.', success: true }]);
//         }}
//         teamId={fileUploaderTeamId}
//       />

//       {/* Task selector for timer */}
//       {showTaskSelector && timerResolve && (
//         <TaskSelector
//           onSelect={(taskId, desc) => timerResolve(taskId, desc)}
//           onCancel={() => {
//             setShowTaskSelector(false);
//             setTimerResolve(null);
//             setIsProcessing(false);
//             setHistory(h => [...h, { role: 'ai', text: 'Timer cancelled.', success: false }]);
//           }}
//         />
//       )}
//     </>
//   );
// }
