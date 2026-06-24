// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useSession } from 'next-auth/react';
// import io from 'socket.io-client';
// import { Send, Smile, MessageSquare } from 'lucide-react';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { AnimateIcon } from './animate-ui/icons/icon';
// import { PhoneCall } from './animate-ui/icons/phone-call';
// import { SendIcon } from './animate-ui/icons/send';
// import { Cctv } from './animate-ui/icons/cctv';
// import { Team, TeamMember, User } from '@prisma/client';
// import { useQuery } from '@tanstack/react-query';

// interface TeamMemberWithUser extends TeamMember {
//   user: User;
// }

// interface TeamConversation {
//   id: string;
//   participantOne: TeamMemberWithUser;
//   participantTwo: TeamMemberWithUser;
//   directMessages: any[];
// }

// interface ChatInterfaceProps {
//   team: Team;
//   selectedMember?: TeamMemberWithUser | null;
//   currentMember?: TeamMemberWithUser | null;
// }

// const ChatConversationInterface = ({ team, selectedMember, currentMember }: ChatInterfaceProps) => {
//   const { data: session } = useSession();
//   const [conversation, setConversation] = useState<TeamConversation | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [messages, setMessages] = useState<any[]>([]);
//   const [cursor, setCursor] = useState<string | null>(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const currentUserIdRef = useRef<string | null>(null);
//   const socketRef = useRef<any>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);


//   useEffect(() => {
//     if (currentMember?.userId) {
//       currentUserIdRef.current = currentMember.userId;
//     }
//   }, [currentMember?.userId]);

//   // Initialize socket connection

//   // useEffect(() => {
//   //   if (!session?.user) return;

//   //   const initSocket = async () => {
//   //     // First, initialize the socket server
//   //     await fetch('/api/socket/io');

//   //     const socket = io({
//   //       path: '/api/socket/io',
//   //       transports: ['websocket', 'polling'], // fallback to polling if websocket fails
//   //     });

//   //     socket.on('connect', () => {
//   //       console.log('[SOCKET] Connected:', socket.id);
//   //       setSocketConnected(true);
//   //     });

//   //     socket.on('disconnect', () => {
//   //       console.log('[SOCKET] Disconnected');
//   //       setSocketConnected(false);
//   //     });

//   //     socket.on('new_message', (message: any) => {
//   //       console.log('[SOCKET] Received new_message:', message);

//   //       setMessages(prev => {
//   //         // Prevent duplicates
//   //         if (prev.find(m => m.id === message.id)) {
//   //           console.log('[SOCKET] Message already exists, skipping');
//   //           return prev;
//   //         }
//   //         return [...prev, message];
//   //       });
//   //     });

//   //     socketRef.current = socket;

//   //     return () => {
//   //       socket.close();
//   //     };
//   //   };

//   //   initSocket();
//   // }, [session]);

//   // useEffect(() => {
//   //   if (!session?.user) return;

//   //   const initSocket = async () => {
//   //     await fetch('/api/socket/io');

//   //     const socket = io({
//   //       path: '/api/socket/io',
//   //       transports: ['websocket', 'polling'],
//   //     });

//   //     socket.on('connect', () => {
//   //       console.log('[SOCKET] Connected:', socket.id);
//   //       setSocketConnected(true);
//   //     });

//   //     socket.on('disconnect', () => {
//   //       console.log('[SOCKET] Disconnected');
//   //       setSocketConnected(false);
//   //     });

//   //     socket.on('new_message', (message: any) => {
//   //       console.log('[SOCKET] Received new_message:', message);

//   //       // IMPORTANT: Skip if message was sent by current user
//   //       // (optimistic update already added it)
//   //       if (message.sender?.userId === currentUserIdRef.current) {
//   //         console.log('[SOCKET] Message from self, skipping (already in UI via optimistic)');
//   //         return;
//   //       }

//   //       setMessages(prev => {
//   //         // Also check by ID to prevent any race conditions
//   //         if (prev.find(m => m.id === message.id)) {
//   //           console.log('[SOCKET] Message already exists, skipping');
//   //           return prev;
//   //         }
//   //         return [...prev, message];
//   //       });
//   //     });

//   //     socketRef.current = socket;

//   //     return () => {
//   //       socket.close();
//   //     };
//   //   };

//   //   initSocket();
//   // }, [session]);

//   useQuery({
//     queryKey: ['socket-init'],
//     queryFn: async () => {
//       await fetch('/api/socket/io');
//       return true;
//     },
//     enabled: !!session?.user,
//     staleTime: Infinity,
//   });

//   useEffect(() => {
//   if (!session?.user) return;

//   let socket: ReturnType<typeof io> | null = null;
//   let cancelled = false;

//   const initSocket = async () => {
//     if (cancelled) return;

//     socket = io({
//       path: '/api/socket/io',
//       transports: ['websocket', 'polling'],
//     });

//     socket.on('connect', () => {
//       console.log('[SOCKET] Connected:', socket!.id);
//       setSocketConnected(true);
//     });

//     socket.on('disconnect', () => {
//       console.log('[SOCKET] Disconnected');
//       setSocketConnected(false);
//     });

//     socket.on('new_message', (message: any) => {
//       console.log('[SOCKET] Received new_message:', message);

//       if (message.sender?.userId === currentUserIdRef.current) {
//         console.log('[SOCKET] Message from self, skipping');
//         return;
//       }

//       setMessages(prev => {
//         if (prev.find(m => m.id === message.id)) {
//           console.log('[SOCKET] Message already exists, skipping');
//           return prev;
//         }
//         return [...prev, message];
//       });
//     });

//     socketRef.current = socket;
//   };

//   initSocket();

//   // ── Cleanup runs when session changes or component unmounts ──
//   return () => {
//     cancelled = true;
//     if (socket) {
//       socket.close();
//       socketRef.current = null;
//     }
//   };
// }, [session]);

//   // Join conversation room when conversation changes
//   useEffect(() => {
//     const socket = socketRef.current;
//     if (!socket || !conversation?.id) return;

//     // Leave previous room if any
//     if (socket.conversationId) {
//       console.log('[SOCKET] Leaving room:', socket.conversationId);
//       socket.emit('leave_conversation', socket.conversationId);
//     }

//     // Join new room
//     console.log('[SOCKET] Joining room:', conversation.id);
//     socket.emit('join_conversation', conversation.id);
//     socket.conversationId = conversation.id;

//     return () => {
//       if (socket && conversation?.id) {
//         socket.emit('leave_conversation', conversation.id);
//       }
//     };
//   }, [conversation?.id]);

//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const { data: conversationData, isLoading: isQueryLoading } = useQuery({
//     queryKey: ['conversation', team.slug, currentMember?.id, selectedMember?.id],
//     queryFn: async () => {
//       const response = await fetch(`/api/teams/${team.slug}/conversations`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           memberOneId: currentMember!.id,
//           memberTwoId: selectedMember!.id
//         })
//       });
//       if (!response.ok) throw new Error('Error initializing conversation');
//       return response.json();
//     },
//     enabled: !!selectedMember && !!currentMember && selectedMember.id !== currentMember.id,
//   });

//   useEffect(() => {
//     if (!selectedMember || !currentMember) {
//       setConversation(null);
//       setMessages([]);
//       setIsLoading(false);
//       return;
//     }
//     if (selectedMember.id === currentMember.id) {
//       setIsLoading(false);
//       return;
//     }
    
//     setIsLoading(isQueryLoading);
    
//     if (conversationData && conversation?.id !== conversationData.id) {
//       setConversation(conversationData);
//       fetchMessages(conversationData.id);
//     }
//   }, [conversationData, isQueryLoading, selectedMember, currentMember, conversation?.id]);

//   const fetchMessages = async (convId: string, cursorParam?: string) => {
//     try {
//       const url = new URL(`/api/teams/${team.slug}/messages`, window.location.origin);
//       url.searchParams.set('conversationId', convId);
//       if (cursorParam) url.searchParams.set('cursor', cursorParam);

//       const response = await fetch(url);
//       if (response.ok) {
//         const data = await response.json();

//         if (cursorParam) {
//           setMessages(prev => [...prev, ...data.items]);
//         } else {
//           setMessages(data.items.reverse());
//         }

//         setCursor(data.nextCursor);
//         setHasMore(!!data.nextCursor);
//       }
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//     }
//   };

//   // const handleSendMessage = async (content: string, fileUrl?: string) => {
//   //   if (!conversation?.id || !currentMember) return;

//   //   // Optimistic update - show message immediately
//   //   const tempId = `temp-${Date.now()}`;
//   //   const optimisticMessage = {
//   //     id: tempId,
//   //     content,
//   //     fileUrl: fileUrl || null,
//   //     senderId: currentMember.id,
//   //     sender: { user: currentMember.user },
//   //     createdAt: new Date().toISOString(),
//   //     conversationId: conversation.id
//   //   };

//   //   setMessages(prev => [...prev, optimisticMessage]);

//   //   try {
//   //     const response = await fetch(`/api/teams/${team.slug}/messages/create`, {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify({
//   //         content,
//   //         fileUrl,
//   //         conversationId: conversation.id
//   //       })
//   //     });

//   //     if (!response.ok) {
//   //       // Remove optimistic message on error
//   //       setMessages(prev => prev.filter(m => m.id !== tempId));
//   //       throw new Error('Failed to send');
//   //     }

//   //     const savedMessage = await response.json();

//   //     // Replace optimistic message with real one
//   //     setMessages(prev => 
//   //       prev.map(m => m.id === tempId ? savedMessage : m)
//   //     );

//   //   } catch (error) {
//   //     console.error('Error sending message:', error);
//   //     alert('Failed to send message');
//   //   }
//   // };

//   const handleSendMessage = async (content: string, fileUrl?: string) => {
//     if (!conversation?.id || !currentMember) return;

//     const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

//     const optimisticMessage = {
//       id: tempId,
//       content,
//       fileUrl: fileUrl || null,
//       senderId: currentMember.id,
//       sender: {
//         user: currentMember.user,
//         userId: currentMember.userId // Add this for comparison
//       },
//       createdAt: new Date().toISOString(),
//       conversationId: conversation.id
//     };

//     // Add to UI immediately
//     setMessages(prev => [...prev, optimisticMessage]);

//     try {
//       const response = await fetch(`/api/teams/${team.slug}/messages/create`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           content,
//           fileUrl,
//           conversationId: conversation.id
//         })
//       });

//       if (!response.ok) {
//         // Remove optimistic message on error
//         setMessages(prev => prev.filter(m => m.id !== tempId));
//         throw new Error('Failed to send');
//       }

//       const savedMessage = await response.json();

//       // Replace optimistic message with real one
//       setMessages(prev =>
//         prev.map(m => m.id === tempId ? savedMessage : m)
//       );

//     } catch (error) {
//       console.error('Error sending message:', error);
//       // Remove optimistic message on error
//       setMessages(prev => prev.filter(m => m.id !== tempId));
//       alert('Failed to send message');
//     }
//   };

//   const loadMore = useCallback(() => {
//     if (conversation?.id && cursor && hasMore && !isLoading) {
//       fetchMessages(conversation.id, cursor);
//     }
//   }, [conversation?.id, cursor, hasMore, isLoading]);

//   const getHeaderInfo = () => {
//     if (!selectedMember) {
//       return {
//         name: 'Select a team member',
//         imageUrl: null,
//         status: 'Offline'
//       };
//     }
//     return {
//       name: selectedMember.user.name,
//       imageUrl: selectedMember.user.image,
//       status: socketConnected ? 'Online' : 'Connecting...'
//     };
//   };

//   const headerInfo = getHeaderInfo();
//   const isSelfChat = selectedMember?.id === currentMember?.id;

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
//     if (input.value.trim()) {
//       handleSendMessage(input.value.trim());
//       input.value = '';
//     }
//   };

//   return (
//     <Card className="flex flex-col bg-[#F5F6F7] dark:bg-[#171717] rounded-none border-none overflow-hidden max-h-screen h-full  shadow-none">
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 py-1 border-b dark:border-neutral-800">
//         <div className="flex items-center gap-2">
//           <Avatar className="size-8">
//             <AvatarImage src={headerInfo.imageUrl || ''} />
//             <AvatarFallback>
//               {headerInfo.name.split(' ').map(n => n[0]).join('')}
//             </AvatarFallback>
//           </Avatar>
//           <div>
//             <h3 className="font-semibold capitalize">{headerInfo.name}</h3>
//             <p className={`text-xs ${socketConnected ? 'text-green-500' : 'text-yellow-500'}`}>
//               {headerInfo.status}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <AnimateIcon animateOnHover>
//             <Button variant="ghost" size="icon" className="rounded-full border">
//               <PhoneCall className="size-4" />
//             </Button>
//           </AnimateIcon>
//           <AnimateIcon animateOnHover>
//             <Button variant="ghost" size="icon" className="rounded-full border">
//               <Cctv className="size-7 -rotate-[24deg]" />
//             </Button>
//           </AnimateIcon>
//           <AnimateIcon animateOnHover>
//             <Button

//               variant="ghost"
//               size="icon"
//               className="rounded-full border"
//             >
//               <SendIcon className="size-4" />
//             </Button>
//           </AnimateIcon>
//         </div>
//       </div>

//       {/* Chat Content */}
//       <div className="flex-1 overflow-hidden dark:bg-[#0A0A0A] flex flex-col">
//         {isLoading ? (
//           <div className="flex justify-center items-center h-full">
//             <div className="animate-spin rounded-full  size-8 border-b-2 border-blue-600"></div>
//           </div>
//         ) : isSelfChat ? (
//           <div className="flex flex-col justify-center items-center h-full text-zinc-500">
//             <MessageSquare className="size-12 mb-4 opacity-50" />
//             <p>You cannot chat with yourself</p>
//           </div>
//         ) : !selectedMember ? (
//           <div className="flex flex-col justify-center items-center h-full text-zinc-500">
//             <MessageSquare className="size-12 mb-4 opacity-50" />
//             <p>Select a team member to start chatting</p>
//           </div>
//         ) : !conversation ? (
//           <div className="flex flex-col justify-center items-center h-full text-zinc-500">
//             <div className="animate-spin rounded-full size-8 border-b-2 border-blue-600 mb-4"></div>
//             <p>Starting conversation&hellip;</p>
//           </div>
//         ) : (
//           <>
//             {/* Messages Area */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin2">
//               {hasMore && messages.length >= 20 && (
//                 <div className="flex justify-center py-2">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={loadMore}
//                     disabled={isLoading}
//                   >
//                     Load more messages
//                   </Button>
//                 </div>
//               )}

//               {messages.length === 0 ? (
//                 <div className="flex flex-col justify-center items-center h-full text-zinc-500">
//                   <p>No messages yet</p>
//                   <p className="text-sm opacity-70">Start the conversation!</p>
//                 </div>
//               ) : (
//                 messages.map((message, index) => {
//                   const isCurrentUser = message.senderId === currentMember?.id;
//                   const showAvatar = index === 0 ||
//                     messages[index - 1]?.senderId !== message.senderId;

//                   return (
//                     <div
//                       key={message.id}
//                       className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
//                     >
//                       {showAvatar ? (
//                         <Avatar className="size-6 mt-1">
//                           <AvatarImage src={message.sender?.user?.image || ''} />
//                           <AvatarFallback className="text-xs">
//                             {message.sender?.user?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
//                           </AvatarFallback>
//                         </Avatar>
//                       ) : (
//                         <div className="w-8" />
//                       )}

//                       <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
//                         {/* {showAvatar && (
//                           <span className="text-xs text-muted-foreground mb-1">
//                             {message.sender?.user?.name || 'Unknown'}
//                           </span>
//                         )} */}
//                         <div
//                           className={`px-3 py-1.5 rounded-2xl ${isCurrentUser
//                               ? 'bg-blue-600 text-white rounded-br-none'
//                               : 'bg-neutral-200 dark:bg-neutral-800 rounded-bl-none'
//                             }`}
//                         >
//                           {message.fileUrl && (
//                             <div className="mb-2">
//                               {message.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
//                                 <img
//                                   src={message.fileUrl}
//                                   alt="Shared"
//                                   className="max-w-full rounded-lg max-h-48 object-cover"
//                                 />
//                               ) : (
//                                 <a
//                                   href={message.fileUrl}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="text-sm underline"
//                                 >
//                                   send Attachment
//                                 </a>
//                               )}
//                             </div>
//                           )}
//                           <p className="text-sm">{message.content}</p>
//                         </div>
//                         <span className="text-xs text-muted-foreground mt-1">
//                           {new Date(message.createdAt).toLocaleTimeString([], {
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           })}
//                         </span>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input Area */}
//             <div className="p-4 border-t dark:border-neutral-800">
//               <form
//                 onSubmit={handleSubmit}
//                 className="flex gap-2"
//               >
//                 <Button type="button" variant="ghost" size="icon" className="rounded-full">
//                   <Smile className="size-5" />
//                 </Button>

//                 <input 
//                 aria-label='Write a message'
//                   name="message"
//                   type="text"
//                   placeholder={`Message ${headerInfo.name}...`}
//                   className="flex-1 bg-transparent border dark:border-[#2A2A2A] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
//                   autoComplete="off"
//                 />

//                 <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700">
//                   <Send className="size-4" />
//                 </Button>
//               </form>
//             </div>
//           </>
//         )}
//       </div>
//     </Card>
//   );
// };

// export default ChatConversationInterface; working but without all the features 

// import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import io from 'socket.io-client';
// import {
//   Send, Smile, MessageSquare, Plus, X, Reply, Bookmark,
//   Pencil, Trash2, Check, Loader2, FileIcon, ImageIcon,
//   Heart, Forward, Hash, User, ChevronUp
// } from 'lucide-react';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
// } from '@/components/ui/dialog';
// import {
//   Popover, PopoverContent, PopoverTrigger
// } from '@/components/ui/popover';
// import {
//   Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
// } from '@/components/ui/tooltip';
// import { AnimateIcon } from './animate-ui/icons/icon';
// import { PhoneCall } from './animate-ui/icons/phone-call';
// import { SendIcon } from './animate-ui/icons/send';
// import { Cctv } from './animate-ui/icons/cctv';
// import { Team, TeamMember, User as PrismaUser } from '@prisma/client';
// import { useQuery } from '@tanstack/react-query';
// import { format, isToday, isYesterday } from 'date-fns';
// import Image from 'next/image';
// import data from '@emoji-mart/data';
// import Picker from '@emoji-mart/react';

// interface TeamMemberWithUser extends TeamMember {
//   user: PrismaUser;
// }

// interface TeamConversation {
//   id: string;
//   participantOne: TeamMemberWithUser;
//   participantTwo: TeamMemberWithUser;
//   directMessages: any[];
// }

// interface ChatInterfaceProps {
//   team: Team;
//   selectedMember?: TeamMemberWithUser | null;
//   currentMember?: TeamMemberWithUser | null;
// }

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// const formatDateLabel = (dateStr: string) => {
//   const d = new Date(dateStr);
//   if (isToday(d)) return 'Today';
//   if (isYesterday(d)) return 'Yesterday';
//   return format(d, 'MMMM d, yyyy');
// };

// const groupByDate = (messages: any[]) => {
//   return messages.reduce((groups: Record<string, any[]>, msg) => {
//     const label = formatDateLabel(msg.createdAt);
//     if (!groups[label]) groups[label] = [];
//     groups[label].push(msg);
//     return groups;
//   }, {});
// };

// // ─── Main component ───────────────────────────────────────────────────────────

// const ChatConversationInterface = ({ team, selectedMember, currentMember }: ChatInterfaceProps) => {
//   const { data: session } = useSession();

//   // Core state
//   const [conversation, setConversation] = useState<TeamConversation | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [messages, setMessages] = useState<any[]>([]);
//   const [cursor, setCursor] = useState<string | null>(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [socketConnected, setSocketConnected] = useState(false);

//   // Input state
//   const [inputValue, setInputValue] = useState('');
//   const [replyingTo, setReplyingTo] = useState<any>(null);

//   // File attachment — deferred upload (select → preview → send → upload)
//   const [pendingFile, setPendingFile] = useState<File | null>(null);
//   const [pendingPreviewUrl, setPendingPreviewUrl] = useState('');
//   const [isUploading, setIsUploading] = useState(false);
//   const [showFilePanel, setShowFilePanel] = useState(false);

//   // Share modal
//   const [shareMessage, setShareMessage] = useState<any>(null);
//   const [shareSearch, setShareSearch] = useState('');
//   const [shareLoading, setShareLoading] = useState(false);
//   const [shareTargets, setShareTargets] = useState<{ channels: any[]; members: any[] }>({ channels: [], members: [] });

//   const currentUserIdRef = useRef<string | null>(null);
//   const socketRef = useRef<any>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const messagesContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const uploadEndpoint = 'messageFile' as const;

//   // ── Track current user id for socket dedup ──────────────────────────────
//   useEffect(() => {
//     if (currentMember?.userId) currentUserIdRef.current = currentMember.userId;
//   }, [currentMember?.userId]);

//   // ── Socket init ──────────────────────────────────────────────────────────
//   useQuery({
//     queryKey: ['socket-init'],
//     queryFn: async () => { await fetch('/api/socket/io'); return true; },
//     enabled: !!session?.user,
//     staleTime: Infinity,
//   });

//   useEffect(() => {
//     if (!session?.user) return;
//     let socket: ReturnType<typeof io> | null = null;
//     let cancelled = false;

//     const initSocket = async () => {
//       if (cancelled) return;
//       socket = io({ path: '/api/socket/io', transports: ['websocket', 'polling'] });

//       socket.on('connect', () => { setSocketConnected(true); });
//       socket.on('disconnect', () => { setSocketConnected(false); });

//       // New message from other user
//       socket.on('new_message', (message: any) => {
//         if (message.sender?.userId === currentUserIdRef.current) return;
//         setMessages(prev => {
//           if (prev.find(m => m.id === message.id)) return prev;
//           return [...prev, message];
//         });
//         scrollToBottom();
//       });

//       // Edit / delete broadcasts
//       socket.on('message_edited', (message: any) => {
//         setMessages(prev => prev.map(m => m.id === message.id ? { ...m, ...message } : m));
//       });
//       socket.on('message_deleted', ({ messageId }: { messageId: string }) => {
//         setMessages(prev => prev.filter(m => m.id !== messageId));
//       });
//       // Reaction broadcast
//       socket.on('message_reaction_updated', ({ messageId, reactions }: any) => {
//         setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
//       });

//       socketRef.current = socket;
//     };

//     initSocket();
//     return () => {
//       cancelled = true;
//       if (socket) { socket.close(); socketRef.current = null; }
//     };
//   }, [session]);

//   // ── Join conversation room ───────────────────────────────────────────────
//   useEffect(() => {
//     const socket = socketRef.current;
//     if (!socket || !conversation?.id) return;
//     socket.emit('join_conversation', conversation.id);
//     return () => { socket.emit('leave_conversation', conversation.id); };
//   }, [conversation?.id]);

//   // ── Fetch conversation ───────────────────────────────────────────────────
//   const { data: conversationData, isLoading: isQueryLoading } = useQuery({
//     queryKey: ['conversation', team.slug, currentMember?.id, selectedMember?.id],
//     queryFn: async () => {
//       const response = await fetch(`/api/teams/${team.slug}/conversations`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ memberOneId: currentMember!.id, memberTwoId: selectedMember!.id })
//       });
//       if (!response.ok) throw new Error('Error initializing conversation');
//       return response.json();
//     },
//     enabled: !!selectedMember && !!currentMember && selectedMember.id !== currentMember.id,
//   });

//   useEffect(() => {
//     if (!selectedMember || !currentMember) {
//       setConversation(null); setMessages([]); setIsLoading(false); return;
//     }
//     if (selectedMember.id === currentMember.id) { setIsLoading(false); return; }
//     setIsLoading(isQueryLoading);
//     if (conversationData && conversation?.id !== conversationData.id) {
//       setConversation(conversationData);
//       fetchMessages(conversationData.id);
//     }
//   }, [conversationData, isQueryLoading, selectedMember, currentMember, conversation?.id]);

//   // ── Fetch messages ───────────────────────────────────────────────────────
//   const fetchMessages = async (convId: string, cursorParam?: string) => {
//     try {
//       if (cursorParam) setLoadingMore(true);
//       const url = new URL(`/api/teams/${team.slug}/messages`, window.location.origin);
//       url.searchParams.set('conversationId', convId);
//       if (cursorParam) url.searchParams.set('cursor', cursorParam);
//       const response = await fetch(url);
//       if (response.ok) {
//         const data = await response.json();
//         if (cursorParam) {
//           // Prepend older messages
//           setMessages(prev => [...data.items.reverse(), ...prev]);
//         } else {
//           setMessages(data.items.reverse());
//         }
//         setCursor(data.nextCursor);
//         setHasMore(!!data.nextCursor);
//       }
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   // ── Scroll to bottom on initial load (no layout shift) ──────────────────
//   useLayoutEffect(() => {
//     if (!isLoading && messages.length > 0 && messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
//     }
//   }, [isLoading]);

//   const scrollToBottom = () => {
//     setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 66);
//   };

//   const loadMore = useCallback(() => {
//     if (conversation?.id && cursor && hasMore && !loadingMore) {
//       fetchMessages(conversation.id, cursor);
//     }
//   }, [conversation?.id, cursor, hasMore, loadingMore]);

//   // ── File handling ────────────────────────────────────────────────────────
//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) return; // 10MB cap
//     if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
//     setPendingFile(file);
//     setPendingPreviewUrl(URL.createObjectURL(file));
//     setShowFilePanel(false);
//     e.target.value = '';
//   };

//   const clearAttachment = () => {
//     setPendingFile(null);
//     if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
//     setPendingPreviewUrl('');
//     setShowFilePanel(false);
//   };

//   // ── Send message ─────────────────────────────────────────────────────────
//   const handleSendMessage = async () => {
//     if (!inputValue.trim() && !pendingFile) return;
//     if (!conversation?.id || !currentMember) return;

//     setIsUploading(true);
//     let fileUrl = '';

//     // Upload file on send
//     if (pendingFile) {
//       try {
//         const reader = new FileReader();
//         const fileData = await new Promise<string>((resolve, reject) => {
//           reader.onload = () => resolve(reader.result as string);
//           reader.onerror = reject;
//           reader.readAsDataURL(pendingFile);
//         });
//         const uploadRes = await fetch('/api/upload', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             fileName: pendingFile.name,
//             fileType: pendingFile.type,
//             endpoint: uploadEndpoint,
//             fileData
//           }),
//         });
//         const uploadData = await uploadRes.json();
//         if (!uploadRes.ok || !uploadData.success) throw new Error(uploadData.error || 'Upload failed');
//         fileUrl = uploadData.fileUrl;
//       } catch (err) {
//         console.error('Upload failed:', err);
//         setIsUploading(false);
//         return;
//       }
//     }

//     setIsUploading(false);

//     const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const sentContent = inputValue;

//     const optimisticMessage = {
//       id: tempId,
//       content: sentContent,
//       fileUrl: fileUrl || null,
//       senderId: currentMember.id,
//       sender: { user: currentMember.user, userId: currentMember.userId },
//       reactions: [],
//       createdAt: new Date().toISOString(),
//       conversationId: conversation.id,
//       parentId: replyingTo?.id || null,
//       parent: replyingTo || null,
//     };

//     setMessages(prev => [...prev, optimisticMessage]);
//     setInputValue('');
//     clearAttachment();
//     setReplyingTo(null);
//     scrollToBottom();

//     try {
//       const response = await fetch(`/api/teams/${team.slug}/messages/create`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           content: sentContent,
//           fileUrl: fileUrl || undefined,
//           conversationId: conversation.id,
//           parentId: replyingTo?.id || undefined,
//         })
//       });
//       if (!response.ok) throw new Error('Failed to send');
//       const savedMessage = await response.json();
//       setMessages(prev => prev.map(m => m.id === tempId ? savedMessage : m));
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessages(prev => prev.filter(m => m.id !== tempId));
//       setInputValue(sentContent);
//     }
//   };

//   // ── Edit ─────────────────────────────────────────────────────────────────
//   const handleEdit = async (messageId: string, newContent: string) => {
//     setMessages(prev => prev.map(m =>
//       m.id === messageId ? { ...m, content: newContent, updatedAt: new Date().toISOString() } : m
//     ));
//     try {
//       await fetch(`/api/teams/${team.slug}/messages/${messageId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ content: newContent })
//       });
//     } catch { fetchMessages(conversation!.id); }
//   };

//   // ── Delete ───────────────────────────────────────────────────────────────
//   const handleDelete = async (messageId: string) => {
//     setMessages(prev => prev.filter(m => m.id !== messageId));
//     try {
//       await fetch(`/api/teams/${team.slug}/messages/${messageId}`, {
//         method: 'DELETE',
//       });
//     } catch { fetchMessages(conversation!.id); }
//   };

//   // ── React / like ─────────────────────────────────────────────────────────
//   const handleReact = async (messageId: string, emoji: string) => {
//     setMessages(prev => prev.map(msg => {
//       if (msg.id !== messageId) return msg;
//       const existing = (msg.reactions || []).find(
//         (r: any) => r.emoji === emoji && r.userId === session?.user?.id
//       );
//       const reactions = existing
//         ? (msg.reactions || []).filter((r: any) => !(r.emoji === emoji && r.userId === session?.user?.id))
//         : [...(msg.reactions || []), { emoji, userId: session?.user?.id, user: session?.user }];
//       return { ...msg, reactions };
//     }));
//     try {
//       await fetch(`/api/teams/${team.slug}/messages/${messageId}/reactions`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ emoji })
//       });
//     } catch { fetchMessages(conversation!.id); }
//   };

//   // ── Bookmark ─────────────────────────────────────────────────────────────
//   const handleBookmark = async (messageId: string) => {
//     const msg = messages.find(m => m.id === messageId);
//     const isBookmarked = msg?.bookmarks?.some((b: any) => b.userId === session?.user?.id);
//     setMessages(prev => prev.map(m => {
//       if (m.id !== messageId) return m;
//       const bookmarks = isBookmarked
//         ? (m.bookmarks || []).filter((b: any) => b.userId !== session?.user?.id)
//         : [...(m.bookmarks || []), { userId: session?.user?.id }];
//       return { ...m, bookmarks };
//     }));
//     try {
//       await fetch(`/api/teams/${team.slug}/messages/${messageId}/bookmark`, {
//         method: isBookmarked ? 'DELETE' : 'POST',
//       });
//     } catch { fetchMessages(conversation!.id); }
//   };

//   // ── Share modal ──────────────────────────────────────────────────────────
//   const openShare = async (message: any) => {
//     setShareMessage(message);
//     setShareLoading(true);
//     try {
//       // Fetch channels/members to forward to — adapt endpoint as needed
//       const res = await fetch(`/api/teams/${team.slug}/members`);
//       if (res.ok) {
//         const membersData = await res.json();
//         setShareTargets({
//           channels: [],
//           members: Array.isArray(membersData) ? membersData : (membersData.members || [])
//         });
//       }
//     } catch (e) {
//       console.error('Failed to load share targets:', e);
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const shareToMember = async (targetMember: any) => {
//     if (!shareMessage || !currentMember) return;
//     // Get or create conversation with target member, then send forwarded message
//     try {
//       const convRes = await fetch(`/api/teams/${team.slug}/conversations`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ memberOneId: currentMember.id, memberTwoId: targetMember.id })
//       });
//       if (!convRes.ok) return;
//       const conv = await convRes.json();
//       await fetch(`/api/teams/${team.slug}/messages/create`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           content: shareMessage.content,
//           fileUrl: shareMessage.fileUrl || undefined,
//           conversationId: conv.id,
//         })
//       });
//       setShareMessage(null);
//     } catch (e) { console.error('Forward failed:', e); }
//   };

//   // ── Keyboard shortcut ────────────────────────────────────────────────────
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
//     if (e.key === 'Escape') setReplyingTo(null);
//   };

//   // ── Derived ──────────────────────────────────────────────────────────────
//   const headerName = selectedMember?.user.name || 'Select a team member';
//   const headerImage = selectedMember?.user.image || null;
//   const isSelfChat = selectedMember?.id === currentMember?.id;
//   const grouped = groupByDate(messages);
//   const isPdf = pendingFile?.type === 'application/pdf';

//   const filteredMembers = shareTargets.members.filter(m =>
//     m.user?.name?.toLowerCase().includes(shareSearch.toLowerCase()) &&
//     m.userId !== session?.user?.id &&
//     m.id !== currentMember?.id
//   );

//   // ── Render ───────────────────────────────────────────────────────────────
//   return (
//     <Card className="flex flex-col bg-[#F5F6F7] dark:bg-[#171717] rounded-none border-none overflow-hidden max-h-screen h-full shadow-none">

//       {/* ── Header ──────────────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between px-4 py-2 border-b dark:border-neutral-800 flex-shrink-0">
//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <Avatar className="size-8">
//               <AvatarImage src={headerImage || ''} />
//               <AvatarFallback>{headerName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
//             </Avatar>
//             {socketConnected && selectedMember && (
//               <span className="absolute bottom-0 right-0 size-2 rounded-full bg-green-500 ring-2 ring-[#171717]" />
//             )}
//           </div>
//           <div>
//             <h3 className="font-semibold text-sm capitalize">{headerName}</h3>
//             <p className={`text-xs ${socketConnected ? 'text-green-500' : 'text-yellow-500'}`}>
//               {socketConnected ? 'Online' : 'Connecting...'}
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-1.5">
//           <AnimateIcon animateOnHover>
//             <Button variant="ghost" size="icon" className="rounded-full border size-8">
//               <PhoneCall className="size-4" />
//             </Button>
//           </AnimateIcon>
//           <AnimateIcon animateOnHover>
//             <Button variant="ghost" size="icon" className="rounded-full border size-8">
//               <Cctv className="size-5 -rotate-[24deg]" />
//             </Button>
//           </AnimateIcon>
//           <AnimateIcon animateOnHover>
//             <Button variant="ghost" size="icon" className="rounded-full border size-8">
//               <SendIcon className="size-4" />
//             </Button>
//           </AnimateIcon>
//         </div>
//       </div>

//       {/* ── Body ────────────────────────────────────────────────────────── */}
//       <div className="flex-1 min-h-0 overflow-hidden dark:bg-[#0A0A0A] flex flex-col">

//         {/* States */}
//         {isLoading ? (
//           <div className="flex justify-center items-center h-full">
//             <Loader2 className="size-8 animate-spin text-blue-600" />
//           </div>
//         ) : isSelfChat ? (
//           <div className="flex flex-col justify-center items-center h-full text-zinc-500">
//             <MessageSquare className="size-12 mb-4 opacity-50" />
//             <p>You cannot chat with yourself</p>
//           </div>
//         ) : !selectedMember ? (
//           <div className="flex flex-col justify-center items-center h-full text-zinc-500">
//             <MessageSquare className="size-12 mb-4 opacity-50" />
//             <p>Select a team member to start chatting</p>
//           </div>
//         ) : !conversation ? (
//           <div className="flex flex-col justify-center items-center h-full text-zinc-500">
//             <Loader2 className="size-8 animate-spin text-blue-600 mb-4" />
//             <p>Starting conversation…</p>
//           </div>
//         ) : (
//           <>
//             {/* ── Messages ────────────────────────────────────────────── */}
//             <div
//               ref={messagesContainerRef}
//               className="flex-1 min-h-0 overflow-y-auto scrollbar-thin2 px-4 py-2"
//             >
//               {/* Load more button */}
//               {hasMore && (
//                 <div className="flex justify-center py-3">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={loadMore}
//                     disabled={loadingMore}
//                     className="text-xs text-zinc-400 hover:text-white gap-2"
//                   >
//                     {loadingMore
//                       ? <><Loader2 className="size-3 animate-spin" /> Loading…</>
//                       : <><ChevronUp className="size-3" /> Load older messages</>
//                     }
//                   </Button>
//                 </div>
//               )}

//               {messages.length === 0 ? (
//                 <div className="flex flex-col justify-center items-center h-full text-zinc-500 py-16">
//                   <div className="size-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
//                     <MessageSquare className="size-8 opacity-50" />
//                   </div>
//                   <p className="font-medium">No messages yet</p>
//                   <p className="text-sm opacity-70 mt-1">Start the conversation!</p>
//                 </div>
//               ) : (
//                 Object.entries(grouped).map(([dateLabel, msgs]: [string, any]) => (
//                   <div key={dateLabel}>
//                     {/* Date separator */}
//                     <div className="flex items-center justify-center relative my-4">
//                       <Separator className="dark:bg-neutral-800" />
//                       <Badge variant="outline" className="text-xs absolute mx-auto dark:bg-[#0A0A0A] dark:border-neutral-700 text-zinc-500 px-3 rounded-full">
//                         {dateLabel}
//                       </Badge>
//                     </div>

//                     {msgs.map((message: any, idx: number) => {
//                       const isCurrentUser = message.senderId === currentMember?.id;
//                       const showAvatar = idx === 0 || msgs[idx - 1]?.senderId !== message.senderId;
//                       const isBookmarked = message.bookmarks?.some((b: any) => b.userId === session?.user?.id);

//                       return (
//                         <DmMessageItem
//                           key={message.id}
//                           message={message}
//                           isCurrentUser={isCurrentUser}
//                           showAvatar={showAvatar}
//                           isBookmarked={isBookmarked}
//                           currentUserId={session?.user?.id}
//                           onReply={() => setReplyingTo(message)}
//                           onReact={handleReact}
//                           onEdit={handleEdit}
//                           onDelete={handleDelete}
//                           onBookmark={handleBookmark}
//                           onShare={openShare}
//                         />
//                       );
//                     })}
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* ── Reply preview ────────────────────────────────────────── */}
//             {replyingTo && (
//               <div className="mx-4 mb-1 p-2.5 bg-zinc-900 rounded-lg border-l-2 border-blue-500 flex-shrink-0">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2 text-sm">
//                     <Reply className="size-3.5 text-blue-500" />
//                     <span className="text-zinc-400 text-xs">Replying to</span>
//                     <span className="text-white text-xs font-medium">{replyingTo.sender?.user?.name}</span>
//                     <span className="text-zinc-500 text-xs truncate max-w-[200px]">
//                       "{replyingTo.content?.substring(0, 50)}…"
//                     </span>
//                   </div>
//                   <button type="button" onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white">
//                     <X className="size-3.5" />
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* ── File preview — full container width ──────────────────── */}
//             {pendingFile && (
//               <div className="mx-4 mb-1 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0 bg-zinc-900 relative">
//                 {!isPdf ? (
//                   <div className="relative w-full" style={{ maxHeight: 280 }}>
//                     <img
//                       src={pendingPreviewUrl}
//                       alt="preview"
//                       className="w-full object-contain"
//                       style={{ maxHeight: 280 }}
//                     />
//                     <button
//                       type="button"
//                       onClick={clearAttachment}
//                       className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
//                     >
//                       <X className="size-4" />
//                     </button>
//                     <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full truncate max-w-[60%]">
//                       {pendingFile.name}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-3 px-4 py-3">
//                     <FileIcon className="size-8 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
//                     <div className="flex flex-col min-w-0">
//                       <span className="text-sm text-white font-medium truncate">{pendingFile.name}</span>
//                       <span className="text-xs text-zinc-400">{(pendingFile.size / 1024).toFixed(1)} KB · PDF</span>
//                     </div>
//                     <button type="button" onClick={clearAttachment} className="ml-auto text-zinc-500 hover:text-red-400">
//                       <X className="size-4" />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ── File picker panel ─────────────────────────────────────── */}
//             {showFilePanel && !pendingFile && (
//               <div className="mx-4 mb-1 p-3 rounded-lg border border-zinc-700 dark:bg-[#111111] flex items-center gap-3 flex-shrink-0">
//                 <label className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors">
//                   <Plus className="size-4" />
//                   Choose File
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     className="hidden"
//                     accept="image/*,video/*,application/pdf"
//                     onChange={handleFileSelect}
//                   />
//                 </label>
//                 <span className="text-xs text-zinc-500">Image, video or PDF · uploaded on send</span>
//                 <button type="button" onClick={() => setShowFilePanel(false)} className="ml-auto text-zinc-500 hover:text-white">
//                   <X className="size-4" />
//                 </button>
//               </div>
//             )}

//             {/* ── Input row ─────────────────────────────────────────────── */}
//             <div className="flex items-center gap-2 px-4 py-3 border-t dark:border-neutral-800 flex-shrink-0">
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="icon"
//                 className={`rounded-full size-8 flex-shrink-0 ${showFilePanel ? 'text-blue-400' : ''}`}
//                 onClick={() => {
//                   if (pendingFile) { clearAttachment(); return; }
//                   setShowFilePanel(p => !p);
//                 }}
//               >
//                 {pendingFile || showFilePanel ? <X className="size-4" /> : <Plus className="size-4" />}
//               </Button>

//               <input
//                 ref={inputRef}
//                 aria-label="Write a message"
//                 type="text"
//                 value={inputValue}
//                 onChange={e => setInputValue(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder={replyingTo ? 'Reply…' : `Message ${headerName}…`}
//                 className="flex-1 bg-transparent border dark:border-[#2A2A2A] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
//                 autoComplete="off"
//               />

//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button variant="ghost" size="icon" className="rounded-full size-8 flex-shrink-0">
//                     <Smile className="size-4" />
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0" side="top" align="end">
//                   <Picker
//                     data={data}
//                     onEmojiSelect={(emoji: any) => {
//                       setInputValue(prev => prev + emoji.native);
//                       inputRef.current?.focus();
//                     }}
//                   />
//                 </PopoverContent>
//               </Popover>

//               <Button
//                 type="button"
//                 onClick={handleSendMessage}
//                 size="icon"
//                 disabled={(!inputValue.trim() && !pendingFile) || isUploading}
//                 className={`rounded-full size-8 flex-shrink-0 transition-colors ${
//                   (inputValue.trim() || pendingFile) && !isUploading
//                     ? 'bg-blue-600 hover:bg-blue-700'
//                     : 'bg-zinc-700 cursor-not-allowed'
//                 }`}
//               >
//                 {isUploading
//                   ? <Loader2 className="size-4 animate-spin" />
//                   : <Send className="size-4" />
//                 }
//               </Button>
//             </div>
//           </>
//         )}
//       </div>

//       {/* ── Share / Forward modal ──────────────────────────────────────────── */}
//       <Dialog open={!!shareMessage} onOpenChange={o => !o && setShareMessage(null)}>
//         <DialogContent className="dark:bg-[#111111] border-zinc-800 max-w-sm">
//           <DialogHeader>
//             <DialogTitle className="text-white flex items-center gap-2 text-sm">
//               <Forward className="size-4 text-blue-400" />
//               Forward Message
//             </DialogTitle>
//             <DialogDescription className="text-zinc-500 text-xs truncate">
//               "{shareMessage?.content?.substring(0, 80) || (shareMessage?.fileUrl ? '📎 Attachment' : '')}"
//             </DialogDescription>
//           </DialogHeader>
//           <input
//             type="text"
//             placeholder="Search members…"
//             value={shareSearch}
//             onChange={e => setShareSearch(e.target.value)}
//             className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
//           />
//           {shareLoading ? (
//             <div className="flex items-center justify-center py-8">
//               <Loader2 className="size-5 animate-spin text-zinc-400" />
//             </div>
//           ) : (
//             <ScrollArea className="max-h-56">
//               {filteredMembers.length === 0 ? (
//                 <p className="text-center text-zinc-500 text-sm py-6">No members found</p>
//               ) : (
//                 filteredMembers.map(m => (
//                   <button
//                     key={m.id}
//                     type="button"
//                     onClick={() => shareToMember(m)}
//                     className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-800 text-left transition-colors"
//                   >
//                     <Avatar className="size-7 flex-shrink-0">
//                       <AvatarImage src={m.user?.image} />
//                       <AvatarFallback className="text-xs">{m.user?.name?.[0] || '?'}</AvatarFallback>
//                     </Avatar>
//                     <span className="text-sm text-white">{m.user?.name}</span>
//                   </button>
//                 ))
//               )}
//             </ScrollArea>
//           )}
//         </DialogContent>
//       </Dialog>
//     </Card>
//   );
// };

// export default ChatConversationInterface;

// // ─── DM Message Item ──────────────────────────────────────────────────────────

// const DmMessageItem = ({
//   message,
//   isCurrentUser,
//   showAvatar,
//   isBookmarked,
//   currentUserId,
//   onReply,
//   onReact,
//   onEdit,
//   onDelete,
//   onBookmark,
//   onShare,
// }: any) => {
//   const [showActions, setShowActions] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editValue, setEditValue] = useState(message.content || '');
//   const [confirmDelete, setConfirmDelete] = useState(false);
//   const [imageError, setImageError] = useState(false);
//   const editInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => { if (isEditing) editInputRef.current?.focus(); }, [isEditing]);

//   const fileUrl: string | undefined = message.fileUrl;
//   const fileExt = fileUrl?.split('.').pop()?.toLowerCase();
//   const fileIsPdf = fileExt === 'pdf';
//   const fileIsVideo = fileUrl && ['mp4', 'webm', 'mov', 'ogg'].includes(fileExt || '');
//   const fileIsImage = fileUrl && !fileIsPdf && !fileIsVideo;

//   // Reaction counts
//   const reactionCounts = (message.reactions || []).reduce((acc: any, r: any) => {
//     const e = r.emoji;
//     if (!acc[e]) acc[e] = { count: 0, userIds: [] };
//     acc[e].count++;
//     acc[e].userIds.push(r.userId || r.member?.userId);
//     return acc;
//   }, {});

//   const handleEditSubmit = () => {
//     const trimmed = editValue.trim();
//     if (!trimmed || trimmed === message.content) { setIsEditing(false); return; }
//     onEdit(message.id, trimmed);
//     setIsEditing(false);
//   };

//   const handleDeleteClick = () => {
//     if (confirmDelete) {
//       onDelete(message.id);
//     } else {
//       setConfirmDelete(true);
//       setTimeout(() => setConfirmDelete(false), 3000);
//     }
//   };

//   return (
//     <div
//       className="group relative flex gap-2 py-0.5 px-1 rounded-lg hover:dark:bg-[#141414] transition-colors"
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => { setShowActions(false); setConfirmDelete(false); }}
//     >
//       {/* Avatar or spacer */}
//       {showAvatar ? (
//         <Avatar className="size-7 mt-1 flex-shrink-0">
//           <AvatarImage src={message.sender?.user?.image || ''} />
//           <AvatarFallback className="text-xs">
//             {message.sender?.user?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
//           </AvatarFallback>
//         </Avatar>
//       ) : (
//         <div className="w-7 flex-shrink-0" />
//       )}

//       <div className="flex-1 min-w-0">
//         {/* Name + timestamp */}
//         {showAvatar && (
//           <div className="flex items-center gap-2 mb-0.5">
//             <span className="text-sm font-semibold text-white">
//               {message.sender?.user?.name || 'Unknown'}
//             </span>
//             <span className="text-xs text-zinc-500">
//               {format(new Date(message.createdAt), 'h:mm a')}
//             </span>
//             {message.updatedAt && message.updatedAt !== message.createdAt && (
//               <span className="text-xs text-zinc-600 italic">(edited)</span>
//             )}
//           </div>
//         )}

//         {/* Reply context */}
//         {message.parent && (
//           <div className="flex items-center gap-1.5 mb-1 text-xs text-zinc-500 bg-zinc-800/50 rounded px-2 py-1 border-l-2 border-zinc-600">
//             <Reply className="size-3 flex-shrink-0" />
//             <span className="font-medium text-zinc-400">{message.parent?.sender?.user?.name}</span>
//             <span className="truncate max-w-[200px]">{message.parent?.content?.substring(0, 50)}</span>
//           </div>
//         )}

//         {/* Content or edit input */}
//         {isEditing ? (
//           <div className="flex items-center gap-2">
//             <input
//               ref={editInputRef}
//               value={editValue}
//               onChange={e => setEditValue(e.target.value)}
//               onKeyDown={e => {
//                 if (e.key === 'Enter') { e.preventDefault(); handleEditSubmit(); }
//                 if (e.key === 'Escape') { setIsEditing(false); setEditValue(message.content); }
//               }}
//               className="flex-1 bg-zinc-800 border border-zinc-600 focus:border-blue-500 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
//             />
//             <button type="button" onClick={handleEditSubmit} className="text-green-400 hover:text-green-300">
//               <Check className="size-4" />
//             </button>
//             <button type="button" onClick={() => { setIsEditing(false); setEditValue(message.content); }} className="text-zinc-500 hover:text-white">
//               <X className="size-4" />
//             </button>
//           </div>
//         ) : (
//           <>
//             {message.content && (
//               <p className="text-sm whitespace-pre-wrap break-words text-neutral-100">
//                 {message.content}
//               </p>
//             )}

//             {/* File attachment */}
//             {fileUrl && (
//               <div className="mt-1.5 max-w-xs">
//                 {fileIsImage && !imageError && (
//                   <div className="rounded-xl overflow-hidden border border-zinc-700">
//                     <Image
//                       src={fileUrl}
//                       alt="attachment"
//                       width={320}
//                       height={240}
//                       unoptimized
//                       className="object-contain w-full h-auto max-h-60"
//                       onError={() => setImageError(true)}
//                     />
//                   </div>
//                 )}
//                 {fileIsImage && imageError && (
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs">
//                     <ImageIcon className="size-4 flex-shrink-0" />
//                     <span>Image unavailable</span>
//                   </div>
//                 )}
//                 {fileIsVideo && (
//                   <video
//                     src={fileUrl}
//                     controls
//                     className="rounded-xl border border-zinc-700 max-w-xs max-h-48 w-full"
//                   />
//                 )}
//                 {fileIsPdf && (
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700">
//                     <FileIcon className="size-5 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
//                     <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline truncate">
//                       {fileUrl.split('/').pop()}
//                     </a>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Reactions */}
//             {Object.keys(reactionCounts).length > 0 && (
//               <div className="flex flex-wrap gap-1 mt-1.5">
//                 {Object.entries(reactionCounts).map(([emoji, d]: [string, any]) => (
//                   <button
//                     key={emoji}
//                     type="button"
//                     onClick={() => onReact(message.id, emoji)}
//                     className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border ${
//                       d.userIds?.includes(currentUserId)
//                         ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
//                         : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
//                     }`}
//                   >
//                     <span>{emoji}</span>
//                     <span className="font-medium">{d.count}</span>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* ── Hover action bar ───────────────────────────────────────────────── */}
//       {!isEditing && (
//         <div className={`
//           absolute right-2 -top-4
//           flex items-center gap-0.5
//           ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none'}
//           transition-all duration-150
//           border dark:bg-[#1a1a1a] dark:border-zinc-700 rounded-lg p-1 z-10 shadow-lg
//         `}>
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onReply}>
//                   <Reply className="size-3" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent side="top">Reply</TooltipContent>
//             </Tooltip>

//             {/* Emoji react */}
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button variant="ghost" size="icon" className="h-6 w-6">
//                   <Smile className="size-3" />
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0" side="top">
//                 <Picker data={data} onEmojiSelect={(emoji: any) => onReact(message.id, emoji.native)} />
//               </PopoverContent>
//             </Popover>

//             {/* Quick ❤️ reaction */}
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-6 w-6 text-zinc-400 hover:text-red-400"
//                   onClick={() => onReact(message.id, '❤️')}
//                 >
//                   <Heart className="size-3" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent side="top">Like</TooltipContent>
//             </Tooltip>

//             {/* Edit — own messages only */}
//             {isCurrentUser && message.content && (
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-6 w-6 text-zinc-400 hover:text-white"
//                     onClick={() => { setEditValue(message.content); setIsEditing(true); }}
//                   >
//                     <Pencil className="size-3" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent side="top">Edit</TooltipContent>
//               </Tooltip>
//             )}

//             {/* Delete — own messages only */}
//             {isCurrentUser && (
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className={`h-6 w-6 transition-colors ${confirmDelete ? 'text-red-400 bg-red-400/10' : 'text-zinc-400 hover:text-red-400'}`}
//                     onClick={handleDeleteClick}
//                   >
//                     <Trash2 className="size-3" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent side="top">{confirmDelete ? 'Click again to confirm' : 'Delete'}</TooltipContent>
//               </Tooltip>
//             )}

//             {/* Bookmark */}
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className={`h-6 w-6 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-400 hover:text-yellow-500'}`}
//                   onClick={() => onBookmark(message.id)}
//                 >
//                   <Bookmark className={`size-3 ${isBookmarked ? 'fill-current' : ''}`} />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent side="top">{isBookmarked ? 'Saved' : 'Save'}</TooltipContent>
//             </Tooltip>

//             {/* Forward */}
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-6 w-6 text-zinc-400 hover:text-white"
//                   onClick={() => onShare(message)}
//                 >
//                   <Forward className="size-3" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent side="top">Forward</TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       )}
//     </div>
//   );
// };

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';
import {
  Send, Smile, MessageSquare, Plus, X, Reply, Bookmark,
  Pencil, Trash2, Check, Loader2, FileIcon, ImageIcon,
  Heart, Forward, ChevronUp
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { AnimateIcon } from './animate-ui/icons/icon';
import { PhoneCall } from './animate-ui/icons/phone-call';
import { SendIcon } from './animate-ui/icons/send';
import { Cctv } from './animate-ui/icons/cctv';
import { Team, TeamMember, User as PrismaUser } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isYesterday } from 'date-fns';
import Image from 'next/image';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface TeamMemberWithUser extends TeamMember {
  user: PrismaUser;
}

interface TeamConversation {
  id: string;
  participantOne: TeamMemberWithUser;
  participantTwo: TeamMemberWithUser;
  directMessages: any[];
}

interface ChatInterfaceProps {
  team: Team;
  selectedMember?: TeamMemberWithUser | null;
  currentMember?: TeamMemberWithUser | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
};

const groupByDate = (messages: any[]) =>
  messages.reduce((groups: Record<string, any[]>, msg) => {
    const label = formatDateLabel(msg.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
    return groups;
  }, {});

// ─── Main component ───────────────────────────────────────────────────────────

const ChatConversationInterface = ({ team, selectedMember, currentMember }: ChatInterfaceProps) => {
  const { data: session } = useSession();

  const [conversation, setConversation] = useState<TeamConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);

  // File state — deferred upload
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showFilePanel, setShowFilePanel] = useState(false);

  // Share modal
  const [shareMessage, setShareMessage] = useState<any>(null);
  const [shareSearch, setShareSearch] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareTargets, setShareTargets] = useState<any[]>([]);

  const currentUserIdRef = useRef<string | null>(null);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Track current user id ─────────────────────────────────────────────────
  useEffect(() => {
    if (currentMember?.userId) currentUserIdRef.current = currentMember.userId;
  }, [currentMember?.userId]);

  // ── Socket init ───────────────────────────────────────────────────────────
  useQuery({
    queryKey: ['socket-init'],
    queryFn: async () => { await fetch('/api/socket/io'); return true; },
    enabled: !!session?.user,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!session?.user) return;
    let socket: ReturnType<typeof io> | null = null;
    let cancelled = false;

    const initSocket = async () => {
      if (cancelled) return;
      socket = io({ path: '/api/socket/io', transports: ['websocket', 'polling'] });

      socket.on('connect', () => setSocketConnected(true));
      socket.on('disconnect', () => setSocketConnected(false));

      // New message from OTHER user only (sender handles via optimistic → real replace)
      socket.on('new_message', (message: any) => {
        if (message.sender?.userId === currentUserIdRef.current) return;
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      });

      // Edit broadcast
      socket.on('message_edited', (message: any) => {
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, ...message } : m));
      });

      // Delete broadcast
      socket.on('message_deleted', ({ messageId }: { messageId: string }) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      });

      // ── REACTIONS: server sends back the full reactions array ──────────────
      // Shape from API: [{ id, emoji, userId, user: { id, name, image } }]
      socket.on('message_reaction_updated', ({ messageId, reactions }: any) => {
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, reactions } : m
        ));
      });

      socketRef.current = socket;
    };

    initSocket();
    return () => {
      cancelled = true;
      if (socket) { socket.close(); socketRef.current = null; }
    };
  }, [session]);

  // ── Join conversation room ────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversation?.id) return;
    socket.emit('join_conversation', conversation.id);
    return () => { socket.emit('leave_conversation', conversation.id); };
  }, [conversation?.id]);

  // ── Fetch conversation ────────────────────────────────────────────────────
  const { data: conversationData, isLoading: isQueryLoading } = useQuery({
    queryKey: ['conversation', team.slug, currentMember?.id, selectedMember?.id],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${team.slug}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberOneId: currentMember!.id, memberTwoId: selectedMember!.id })
      });
      if (!res.ok) throw new Error('Error initializing conversation');
      return res.json();
    },
    enabled: !!selectedMember && !!currentMember && selectedMember.id !== currentMember.id,
  });

  useEffect(() => {
    if (!selectedMember || !currentMember) {
      setConversation(null); setMessages([]); setIsLoading(false); return;
    }
    if (selectedMember.id === currentMember.id) { setIsLoading(false); return; }
    setIsLoading(isQueryLoading);
    if (conversationData && conversation?.id !== conversationData.id) {
      setConversation(conversationData);
      fetchMessages(conversationData.id);
    }
  }, [conversationData, isQueryLoading, selectedMember, currentMember, conversation?.id]);

  // ── Fetch messages ────────────────────────────────────────────────────────
  const fetchMessages = async (convId: string, cursorParam?: string) => {
    try {
      if (cursorParam) setLoadingMore(true);
      const url = new URL(`/api/teams/${team.slug}/messages`, window.location.origin);
      url.searchParams.set('conversationId', convId);
      if (cursorParam) url.searchParams.set('cursor', cursorParam);
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        const items: any[] = d.items.reverse();
        if (cursorParam) {
          setMessages(prev => [...items, ...prev]);
        } else {
          setMessages(items);
        }
        setCursor(d.nextCursor);
        setHasMore(!!d.nextCursor);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Scroll to bottom on first load — no layout shift ─────────────────────
  useLayoutEffect(() => {
    if (!isLoading && messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 66);
  };

  // ── Scroll to a specific message (for reply click) ────────────────────────
  const scrollToMessage = (messageId: string) => {
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flash highlight
      el.classList.add('bg-blue-500/20');
      setTimeout(() => el.classList.remove('bg-blue-500/20'), 1500);
    }
  };

  const loadMore = useCallback(() => {
    if (conversation?.id && cursor && hasMore && !loadingMore) {
      fetchMessages(conversation.id, cursor);
    }
  }, [conversation?.id, cursor, hasMore, loadingMore]);

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(file);
    setPendingPreviewUrl(URL.createObjectURL(file));
    setShowFilePanel(false);
    e.target.value = '';
  };

  const clearAttachment = () => {
    setPendingFile(null);
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingPreviewUrl('');
    setShowFilePanel(false);
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!inputValue.trim() && !pendingFile) return;
    if (!conversation?.id || !currentMember) return;

    setIsUploading(true);
    let fileUrl = '';

    if (pendingFile) {
      try {
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(pendingFile);
        });
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: pendingFile.name,
            fileType: pendingFile.type,
            endpoint: 'messageFile',
            fileData
          }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) throw new Error(uploadData.error || 'Upload failed');
        fileUrl = uploadData.fileUrl;
      } catch (err) {
        console.error('Upload failed:', err);
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sentContent = inputValue;
    const sentReplyingTo = replyingTo;

    const optimisticMessage = {
      id: tempId,
      content: sentContent,
      fileUrl: fileUrl || null,
      senderId: currentMember.id,
      sender: { user: currentMember.user, userId: currentMember.userId },
      // reactions shape must match what the DB/API returns: [{ emoji, userId, ... }]
      reactions: [],
      bookmarks: [],
      createdAt: new Date().toISOString(),
      conversationId: conversation.id,
      parentId: sentReplyingTo?.id || null,
      parent: sentReplyingTo || null,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInputValue('');
    clearAttachment();
    setReplyingTo(null);
    scrollToBottom();

    try {
      const res = await fetch(`/api/teams/${team.slug}/messages/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: sentContent,
          fileUrl: fileUrl || undefined,
          conversationId: conversation.id,
          parentId: sentReplyingTo?.id || undefined,
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send');
      }

      const savedMessage = await res.json();
      // Replace temp with real message (which has real id, createdAt, reactions from DB)
      setMessages(prev => prev.map(m => m.id === tempId ? { ...savedMessage, reactions: savedMessage.reactions || [] } : m));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInputValue(sentContent);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = async (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, content: newContent, updatedAt: new Date().toISOString() } : m
    ));
    try {
      await fetch(`/api/teams/${team.slug}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
    } catch { fetchMessages(conversation!.id); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    try {
      await fetch(`/api/teams/${team.slug}/messages/${messageId}`, { method: 'DELETE' });
    } catch { fetchMessages(conversation!.id); }
  };

  // ── Reactions ─────────────────────────────────────────────────────────────
  // Optimistic shape must match what API returns so socket broadcast doesn't clobber it.
  // DB shape: [{ id, emoji, userId, user: { id, name, image } }]
  // We use `userId` as the identifier everywhere — no `member.userId` nesting.
  const handleReact = async (messageId: string, emoji: string) => {
    const myId = session?.user?.id;

    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      const existing = (msg.reactions || []).find(
        (r: any) => r.emoji === emoji && r.userId === myId
      );
      const reactions = existing
        ? (msg.reactions || []).filter((r: any) => !(r.emoji === emoji && r.userId === myId))
        : [...(msg.reactions || []), { id: `opt-${Date.now()}`, emoji, userId: myId, user: session?.user }];
      return { ...msg, reactions };
    }));

    try {
      const res = await fetch(`/api/teams/${team.slug}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });
      if (!res.ok) throw new Error('Failed');
      const { reactions } = await res.json();
      // Update with authoritative server state — this is the single source of truth
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, reactions: reactions || [] } : m
      ));
    } catch {
      // Revert on failure
      fetchMessages(conversation!.id);
    }
  };

  // ── Bookmark ──────────────────────────────────────────────────────────────
  const handleBookmark = async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    const isBookmarked = (msg?.bookmarks || []).some((b: any) => b.userId === session?.user?.id);

    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const bookmarks = isBookmarked
        ? (m.bookmarks || []).filter((b: any) => b.userId !== session?.user?.id)
        : [...(m.bookmarks || []), { userId: session?.user?.id }];
      return { ...m, bookmarks };
    }));

    try {
      await fetch(`/api/teams/${team.slug}/messages/${messageId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
      });
    } catch { fetchMessages(conversation!.id); }
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const openShare = async (message: any) => {
    setShareMessage(message);
    setShareLoading(true);
    try {
      const res = await fetch(`/api/teams/${team.slug}/members`);
      if (res.ok) {
        const d = await res.json();
        setShareTargets(Array.isArray(d) ? d : (d.members || []));
      }
    } catch (e) { console.error('Failed to load share targets:', e); }
    finally { setShareLoading(false); }
  };

  const shareToMember = async (targetMember: any) => {
    if (!shareMessage || !currentMember) return;
    try {
      const convRes = await fetch(`/api/teams/${team.slug}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberOneId: currentMember.id, memberTwoId: targetMember.id })
      });
      if (!convRes.ok) return;
      const conv = await convRes.json();
      await fetch(`/api/teams/${team.slug}/messages/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: shareMessage.content,
          fileUrl: shareMessage.fileUrl || undefined,
          conversationId: conv.id,
        })
      });
      setShareMessage(null);
    } catch (e) { console.error('Forward failed:', e); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    if (e.key === 'Escape') setReplyingTo(null);
  };

  const isSelfChat = selectedMember?.id === currentMember?.id;
  const grouped = groupByDate(messages);
  const isPdf = pendingFile?.type === 'application/pdf';
  const filteredMembers = shareTargets.filter((m: any) =>
    m.user?.name?.toLowerCase().includes(shareSearch.toLowerCase()) &&
    m.userId !== session?.user?.id && m.id !== currentMember?.id
  );

  return (
    <Card className="flex flex-col bg-[#F5F6F7] dark:bg-[#171717] rounded-none border-none overflow-hidden max-h-screen h-full shadow-none">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b dark:border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-8">
              <AvatarImage src={selectedMember?.user?.image || ''} />
              <AvatarFallback>
                {(selectedMember?.user?.name || 'U').split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {socketConnected && selectedMember && (
              <span className="absolute bottom-0 right-0 size-2 rounded-full bg-green-500 ring-2 ring-[#171717]" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm capitalize">
              {selectedMember?.user?.name || 'Select a team member'}
            </h3>
            <p className={`text-xs ${socketConnected ? 'text-green-500' : 'text-yellow-500'}`}>
              {socketConnected ? 'Online' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <AnimateIcon animateOnHover>
            <Button variant="ghost" size="icon" className="rounded-full border size-8">
              <PhoneCall className="size-4" />
            </Button>
          </AnimateIcon>
          <AnimateIcon animateOnHover>
            <Button variant="ghost" size="icon" className="rounded-full border size-8">
              <Cctv className="size-5 -rotate-[24deg]" />
            </Button>
          </AnimateIcon>
          <AnimateIcon animateOnHover>
            <Button variant="ghost" size="icon" className="rounded-full border size-8">
              <SendIcon className="size-4" />
            </Button>
          </AnimateIcon>
        </div>
      </div>

      {/* ── Chat body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden dark:bg-[#0A0A0A] flex flex-col">

        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="size-8 animate-spin text-blue-600" />
          </div>
        ) : isSelfChat ? (
          <div className="flex flex-col justify-center items-center h-full text-zinc-500">
            <MessageSquare className="size-12 mb-4 opacity-50" />
            <p>You cannot chat with yourself</p>
          </div>
        ) : !selectedMember ? (
          <div className="flex flex-col justify-center items-center h-full text-zinc-500">
            <MessageSquare className="size-12 mb-4 opacity-50" />
            <p>Select a team member to start chatting</p>
          </div>
        ) : !conversation ? (
          <div className="flex flex-col justify-center items-center h-full text-zinc-500">
            <Loader2 className="size-8 animate-spin text-blue-600 mb-4" />
            <p>Starting conversation…</p>
          </div>
        ) : (
          <>
            {/* ── Messages scroll area ──────────────────────────────────── */}
            <div
              ref={messagesContainerRef}
              className="flex-1 min-h-0 overflow-y-auto scrollbar-thin2 px-4 py-2"
            >
              {hasMore && (
                <div className="flex justify-center py-3">
                  <Button
                    variant="ghost" size="sm"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="text-xs text-zinc-400 hover:text-white gap-2"
                  >
                    {loadingMore
                      ? <><Loader2 className="size-3 animate-spin" />Loading…</>
                      : <><ChevronUp className="size-3" />Load older messages</>}
                  </Button>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-zinc-500 py-16">
                  <div className="size-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                    <MessageSquare className="size-8 opacity-50" />
                  </div>
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm opacity-70 mt-1">Start the conversation!</p>
                </div>
              ) : (
                Object.entries(grouped).map(([dateLabel, msgs]: [string, any]) => (
                  <div key={dateLabel}>
                    <div className="flex items-center justify-center relative my-4">
                      <Separator className="dark:bg-neutral-800" />
                      <Badge variant="outline" className="text-xs absolute mx-auto dark:bg-[#0A0A0A] dark:border-neutral-700 text-zinc-500 px-3 rounded-full">
                        {dateLabel}
                      </Badge>
                    </div>
                    {msgs.map((message: any, idx: number) => {
                      const isCurrentUser = message.senderId === currentMember?.id;
                      const showAvatar = idx === 0 || msgs[idx - 1]?.senderId !== message.senderId;
                      const isBookmarked = (message.bookmarks || []).some((b: any) => b.userId === session?.user?.id);
                      return (
                        <div
                          key={message.id}
                          ref={el => { messageRefs.current[message.id] = el; }}
                          className="transition-colors duration-500 rounded-lg"
                        >
                          <DmMessageItem
                            message={message}
                            isCurrentUser={isCurrentUser}
                            showAvatar={showAvatar}
                            isBookmarked={isBookmarked}
                            currentUserId={session?.user?.id}
                            onReply={() => setReplyingTo(message)}
                            onReact={handleReact}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onBookmark={handleBookmark}
                            onShare={openShare}
                            onScrollToParent={scrollToMessage}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Reply preview strip ──────────────────────────────────── */}
            {replyingTo && (
              <div className="mx-4 mb-1 p-2.5 bg-zinc-900 rounded-lg border-l-2 border-blue-500 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <Reply className="size-3.5 text-blue-500 flex-shrink-0" />
                    <span className="text-zinc-400 text-xs flex-shrink-0">Replying to</span>
                    <span className="text-white text-xs font-medium flex-shrink-0">
                      {replyingTo.sender?.user?.name}
                    </span>
                    <span className="text-zinc-500 text-xs truncate">
                      {replyingTo.fileUrl && !replyingTo.content ? '📎 Attachment' : `"${replyingTo.content?.substring(0, 50)}"`}
                    </span>
                  </div>
                  <button type="button" onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white ml-2 flex-shrink-0">
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── File preview — full width ────────────────────────────── */}
            {pendingFile && (
              <div className="mx-4 mb-1 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0 bg-zinc-900 relative">
                {!isPdf ? (
                  <div className="relative w-full" style={{ maxHeight: 280 }}>
                    <img
                      src={pendingPreviewUrl}
                      alt="preview"
                      className="w-full object-contain"
                      style={{ maxHeight: 280 }}
                    />
                    <button
                      type="button"
                      onClick={clearAttachment}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                    >
                      <X className="size-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full truncate max-w-[60%]">
                      {pendingFile.name}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <FileIcon className="size-8 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-white font-medium truncate">{pendingFile.name}</span>
                      <span className="text-xs text-zinc-400">{(pendingFile.size / 1024).toFixed(1)} KB · PDF</span>
                    </div>
                    <button type="button" onClick={clearAttachment} className="ml-auto text-zinc-500 hover:text-red-400">
                      <X className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── File picker panel ────────────────────────────────────── */}
            {showFilePanel && !pendingFile && (
              <div className="mx-4 mb-1 p-3 rounded-lg border border-zinc-700 dark:bg-[#111111] flex items-center gap-3 flex-shrink-0">
                <label className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors">
                  <Plus className="size-4" />
                  Choose File
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,application/pdf"
                    onChange={handleFileSelect}
                  />
                </label>
                <span className="text-xs text-zinc-500">Image, video or PDF · uploaded on send</span>
                <button type="button" onClick={() => setShowFilePanel(false)} className="ml-auto text-zinc-500 hover:text-white">
                  <X className="size-4" />
                </button>
              </div>
            )}

            {/* ── Input row ────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-4 py-3 border-t dark:border-neutral-800 flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`rounded-full size-8 flex-shrink-0 ${showFilePanel ? 'text-blue-400' : ''}`}
                onClick={() => {
                  if (pendingFile) { clearAttachment(); return; }
                  setShowFilePanel(p => !p);
                }}
              >
                {pendingFile || showFilePanel ? <X className="size-4" /> : <Plus className="size-4" />}
              </Button>

              <input
                ref={inputRef}
                aria-label="Write a message"
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={replyingTo ? `Reply to ${replyingTo.sender?.user?.name}…` : `Message ${selectedMember?.user?.name || ''}…`}
                className="flex-1 bg-transparent border dark:border-[#2A2A2A] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                autoComplete="off"
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full size-8 flex-shrink-0">
                    <Smile className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" side="top" align="end">
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji: any) => {
                      setInputValue(prev => prev + emoji.native);
                      inputRef.current?.focus();
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Button
                type="button"
                onClick={handleSendMessage}
                size="icon"
                disabled={(!inputValue.trim() && !pendingFile) || isUploading}
                className={`rounded-full size-8 flex-shrink-0 transition-colors ${
                  (inputValue.trim() || pendingFile) && !isUploading
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-zinc-700 cursor-not-allowed'
                }`}
              >
                {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ── Share modal ───────────────────────────────────────────────────── */}
      <Dialog open={!!shareMessage} onOpenChange={o => !o && setShareMessage(null)}>
        <DialogContent className="dark:bg-[#111111] border-zinc-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-sm">
              <Forward className="size-4 text-blue-400" />
              Forward Message
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs truncate">
              "{shareMessage?.content?.substring(0, 80) || (shareMessage?.fileUrl ? '📎 Attachment' : '')}"
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            placeholder="Search members…"
            value={shareSearch}
            onChange={e => setShareSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          {shareLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <ScrollArea className="max-h-56">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-zinc-500 text-sm py-6">No members found</p>
              ) : filteredMembers.map((m: any) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => shareToMember(m)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-800 text-left transition-colors"
                >
                  <Avatar className="size-7 flex-shrink-0">
                    <AvatarImage src={m.user?.image} />
                    <AvatarFallback className="text-xs">{m.user?.name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white">{m.user?.name}</span>
                </button>
              ))}
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ChatConversationInterface;

// ─── DmMessageItem ────────────────────────────────────────────────────────────

interface DmMessageItemProps {
  message: any;
  isCurrentUser: boolean;
  showAvatar: boolean;
  isBookmarked: boolean;
  currentUserId?: string;
  onReply: () => void;
  onReact: (id: string, emoji: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onBookmark: (id: string) => void;
  onShare: (message: any) => void;
  onScrollToParent: (parentId: string) => void;
}

const DmMessageItem = ({
  message,
  isCurrentUser,
  showAvatar,
  isBookmarked,
  currentUserId,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onBookmark,
  onShare,
  onScrollToParent,
}: DmMessageItemProps) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content || '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imageError, setImageError] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isEditing) editInputRef.current?.focus(); }, [isEditing]);

  const fileUrl: string | undefined = message.fileUrl;
  const fileExt = fileUrl?.split('.').pop()?.toLowerCase();
  const fileIsPdf = fileExt === 'pdf';
  const fileIsVideo = !!fileUrl && ['mp4', 'webm', 'mov', 'ogg'].includes(fileExt || '');
  const fileIsImage = !!fileUrl && !fileIsPdf && !fileIsVideo;

  // Group reactions: { emoji -> { count, userIds[] } }
  // Reactions shape from DB: [{ id, emoji, userId, user }]
  const reactionCounts = (message.reactions || []).reduce((acc: any, r: any) => {
    const e = r.emoji;
    if (!acc[e]) acc[e] = { count: 0, userIds: [] };
    acc[e].count++;
    // Support both flat userId and nested member.userId (for compatibility)
    const uid = r.userId ?? r.member?.userId;
    if (uid) acc[e].userIds.push(uid);
    return acc;
  }, {});

  const handleEditSubmit = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === message.content) { setIsEditing(false); return; }
    onEdit(message.id, trimmed);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(message.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const isEdited = message.updatedAt && message.updatedAt !== message.createdAt;

  return (
    <div
      className="group relative flex gap-2 py-0.5 px-1 rounded-lg hover:dark:bg-[#141414] transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setConfirmDelete(false); }}
    >
      {/* Avatar / spacer */}
      {showAvatar ? (
        <Avatar className="size-7 mt-1 flex-shrink-0">
          <AvatarImage src={message.sender?.user?.image || ''} />
          <AvatarFallback className="text-xs">
            {(message.sender?.user?.name || '?').split(' ').map((n: string) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-7 flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        {/* Name + time */}
        {showAvatar && (
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-white">
              {message.sender?.user?.name || 'Unknown'}
            </span>
            <span className="text-xs text-zinc-500">
              {format(new Date(message.createdAt), 'h:mm a')}
            </span>
            {isEdited && <span className="text-xs text-zinc-600 italic">(edited)</span>}
          </div>
        )}

        {/* ── Reply context — always visible, clickable ─────────────── */}
        {message.parent && (
          <button
            type="button"
            onClick={() => onScrollToParent(message.parent.id)}
            className="flex items-start gap-1.5 mb-1.5 text-xs text-zinc-500 bg-zinc-800/60 hover:bg-zinc-800 rounded-lg px-2.5 py-1.5 border-l-2 border-blue-500/60 w-full text-left transition-colors group/reply"
          >
            <Reply className="size-3 flex-shrink-0 mt-0.5 text-blue-400" />
            <div className="min-w-0">
              <span className="font-medium text-zinc-300 group-hover/reply:text-white">
                {message.parent?.sender?.user?.name || 'Unknown'}
              </span>
              <span className="ml-1.5 text-zinc-500 truncate block">
                {message.parent?.fileUrl && !message.parent?.content
                  ? '📎 Attachment'
                  : message.parent?.content?.substring(0, 80)}
              </span>
            </div>
          </button>
        )}

        {/* Content or edit input */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={editInputRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); handleEditSubmit(); }
                if (e.key === 'Escape') { setIsEditing(false); setEditValue(message.content); }
              }}
              className="flex-1 bg-zinc-800 border border-zinc-600 focus:border-blue-500 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
            />
            <button type="button" onClick={handleEditSubmit} className="text-green-400 hover:text-green-300">
              <Check className="size-4" />
            </button>
            <button type="button" onClick={() => { setIsEditing(false); setEditValue(message.content); }} className="text-zinc-500 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words text-neutral-100">
                {message.content}
              </p>
            )}

            {/* File attachment */}
            {fileUrl && (
              <div className="mt-1.5 max-w-sm">
                {fileIsImage && !imageError && (
                  <div className="rounded-xl overflow-hidden border border-zinc-700 inline-block">
                    <Image
                      src={fileUrl}
                      alt="attachment"
                      width={320}
                      height={240}
                      unoptimized
                      className="object-contain w-full h-auto max-h-60"
                      onError={() => setImageError(true)}
                    />
                  </div>
                )}
                {fileIsImage && imageError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs max-w-xs">
                    <ImageIcon className="size-4 flex-shrink-0" />
                    <span>Image unavailable</span>
                  </div>
                )}
                {fileIsVideo && (
                  <video
                    src={fileUrl}
                    controls
                    className="rounded-xl border border-zinc-700 max-w-xs max-h-48 w-full"
                  />
                )}
                {fileIsPdf && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 max-w-xs">
                    <FileIcon className="size-5 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline truncate">
                      {fileUrl.split('/').pop()}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Reaction pills */}
            {Object.keys(reactionCounts).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {Object.entries(reactionCounts).map(([emoji, d]: [string, any]) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onReact(message.id, emoji)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border ${
                      d.userIds?.includes(currentUserId)
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-zinc-300'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span className="font-medium">{d.count}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Hover action bar ─────────────────────────────────────────────── */}
      {!isEditing && (
        <div className={`
          absolute right-2 -top-4
          flex items-center gap-0.5
          ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none'}
          transition-all duration-150
          border dark:bg-[#1a1a1a] dark:border-zinc-700 rounded-lg p-1 z-10 shadow-lg
        `}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onReply}>
                  <Reply className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Reply</TooltipContent>
            </Tooltip>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Smile className="size-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="top">
                <Picker data={data} onEmojiSelect={(emoji: any) => onReact(message.id, emoji.native)} />
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="h-6 w-6 text-zinc-400 hover:text-red-400"
                  onClick={() => onReact(message.id, '❤️')}
                >
                  <Heart className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Like</TooltipContent>
            </Tooltip>

            {isCurrentUser && message.content && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6 text-zinc-400 hover:text-white"
                    onClick={() => { setEditValue(message.content); setIsEditing(true); }}
                  >
                    <Pencil className="size-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Edit</TooltipContent>
              </Tooltip>
            )}

            {isCurrentUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon"
                    className={`h-6 w-6 transition-colors ${confirmDelete ? 'text-red-400 bg-red-400/10' : 'text-zinc-400 hover:text-red-400'}`}
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{confirmDelete ? 'Click again to confirm' : 'Delete'}</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className={`h-6 w-6 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-400 hover:text-yellow-500'}`}
                  onClick={() => onBookmark(message.id)}
                >
                  <Bookmark className={`size-3 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{isBookmarked ? 'Saved' : 'Save'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="h-6 w-6 text-zinc-400 hover:text-white"
                  onClick={() => onShare(message)}
                >
                  <Forward className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Forward</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};