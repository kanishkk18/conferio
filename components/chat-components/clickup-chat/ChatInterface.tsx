

// "use client";

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { format } from 'date-fns';
// import { io, Socket } from 'socket.io-client';
// import { 
//   Send, 
//   Smile, 
//   Plus,
//   X,
//   Reply,
//   Bookmark,
//   Share2,
//   Loader2
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// import data from '@emoji-mart/data';
// import Picker from '@emoji-mart/react';

// interface ChatInterfaceProps {
//   channelId: string;
//   serverId: string;
//   type: 'channel' | 'conversation';
//   currentMember: any;
// }

// export const ClickUpChatInterface: React.FC<ChatInterfaceProps> = ({
//   channelId,
//   serverId,
//   type,
//   currentMember
// }) => {
//   const { data: session } = useSession();
//   const [messages, setMessages] = useState<any[]>([]);
//   const [inputValue, setInputValue] = useState('');
//   const [replyingTo, setReplyingTo] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Initialize socket
//   useEffect(() => {
//     const socketInstance = io({
//       path: '/api/socket/io',
//       addTrailingSlash: false,
//     });

//     socketInstance.on('connect', () => {
//       console.log('[CLIENT] Socket connected:', socketInstance.id);
//       // Join channel room
//       socketInstance.emit('join_channel', channelId);
//     });

//     socketInstance.on('disconnect', (reason) => {
//       console.log('[CLIENT] Socket disconnected:', reason);
//     });

//     setSocket(socketInstance);

//     return () => {
//       socketInstance.emit('leave_channel', channelId);
//       socketInstance.disconnect();
//     };
//   }, [channelId]);

//   // Fetch messages
//   const fetchMessages = useCallback(async () => {
//     try {
//       setLoading(true);
//       const endpoint = type === 'channel' 
//         ? `/api/messages?channelId=${channelId}`
//         : `/api/direct-messages?conversationId=${channelId}`;

//       const res = await fetch(endpoint);
//       if (res.ok) {
//         const data = await res.json();
//         const msgs = data.items || [];
//         setMessages(msgs);
//         console.log('[CLIENT] Fetched messages:', msgs.length);
//       }
//     } catch (error) {
//       console.error('Failed to fetch messages:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [channelId, type]);

//   useEffect(() => {
//     fetchMessages();
//   }, [fetchMessages]);

//   // Socket event listeners
//   useEffect(() => {
//     if (!socket) return;

//     // New message received
//     socket.on('new_message', (message: any) => {
//       console.log('[CLIENT] New message received:', message.id);
//       setMessages(prev => {
//         // Prevent duplicates
//         if (prev.some(m => m.id === message.id)) return prev;
//         return [...prev, message];
//       });
//       scrollToBottom();
//     });

//     // Reaction updated
//     socket.on('message_reaction', (data: any) => {
//       console.log('[CLIENT] Reaction update:', data.messageId);
//       setMessages(prev => prev.map(msg => {
//         if (msg.id === data.messageId) {
//           return { ...msg, reactions: data.reactions };
//         }
//         return msg;
//       }));
//     });

//     // Bookmark updated
//     socket.on('message_bookmark', (data: any) => {
//       console.log('[CLIENT] Bookmark update:', data.messageId);
//       setMessages(prev => prev.map(msg => {
//         if (msg.id === data.messageId) {
//           const bookmarks = data.bookmarked 
//             ? [...(msg.bookmarks || []), { userId: data.userId }]
//             : (msg.bookmarks || []).filter((b: any) => b.userId !== data.userId);
//           return { ...msg, bookmarks };
//         }
//         return msg;
//       }));
//     });

//     return () => {
//       socket.off('new_message');
//       socket.off('message_reaction');
//       socket.off('message_bookmark');
//     };
//   }, [socket]);

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, 100);
//   };

//   const sendMessage = async () => {
//     if (!inputValue.trim() || !socket) return;

//     const body = {
//       content: inputValue,
//       channelId: channelId,
//       serverId: serverId,
//       parentId: replyingTo?.id || null
//     };

//     try {
//       // Optimistic update
//       const tempId = `temp-${Date.now()}`;
//       const optimisticMessage = {
//         id: tempId,
//         content: inputValue,
//         channelId,
//         memberId: currentMember?.id,
//         member: {
//           ...currentMember,
//           user: session?.user
//         },
//         reactions: [],
//         bookmarks: [],
//         createdAt: new Date().toISOString(),
//         parentId: replyingTo?.id || null
//       };

//       setMessages(prev => [...prev, optimisticMessage]);
//       setInputValue('');
//       setReplyingTo(null);
//       scrollToBottom();

//       // Send to server
//       const res = await fetch('/api/socket/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//       });

//       if (!res.ok) {
//         // Remove optimistic message on error
//         setMessages(prev => prev.filter(m => m.id !== tempId));
//         throw new Error('Failed to send');
//       }

//       const savedMessage = await res.json();

//       // Replace temp message with real one
//       setMessages(prev => prev.map(m => 
//         m.id === tempId ? savedMessage : m
//       ));

//     } catch (error) {
//       console.error('Failed to send message:', error);
//     }
//   };

//   const addReaction = async (messageId: string, emoji: string) => {
//     try {
//       const res = await fetch('/api/messages/reactions', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           messageId, 
//           emoji,
//           serverId 
//         })
//       });

//       if (res.ok) {
//         const data = await res.json();
//         // Update local state immediately
//         setMessages(prev => prev.map(msg => {
//           if (msg.id === messageId) {
//             return { ...msg, reactions: data.reactions };
//           }
//           return msg;
//         }));
//       }
//     } catch (error) {
//       console.error('Failed to add reaction:', error);
//     }
//   };

//   const toggleBookmark = async (messageId: string) => {
//     const message = messages.find(m => m.id === messageId);
//     const isCurrentlyBookmarked = message?.bookmarks?.some((b: any) => b.userId === session?.user?.id);

//     try {
//       // Optimistic update
//       setMessages(prev => prev.map(msg => {
//         if (msg.id === messageId) {
//           const bookmarks = isCurrentlyBookmarked
//             ? (msg.bookmarks || []).filter((b: any) => b.userId !== session?.user?.id)
//             : [...(msg.bookmarks || []), { userId: session?.user?.id }];
//           return { ...msg, bookmarks };
//         }
//         return msg;
//       }));

//       const res = await fetch('/api/messages/bookmark', {
//         method: isCurrentlyBookmarked ? 'DELETE' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ messageId })
//       });

//       if (!res.ok) throw new Error('Failed to toggle bookmark');

//     } catch (error) {
//       console.error('Failed to bookmark:', error);
//       // Revert on error
//       fetchMessages();
//     }
//   };

//   const groupedMessages = messages.reduce((groups: any, message) => {
//     const date = format(new Date(message.createdAt), 'MMMM d, yyyy');
//     if (!groups[date]) groups[date] = [];
//     groups[date].push(message);
//     return groups;
//   }, {});

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <Loader2 className="size-8 animate-spin text-zinc-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full bg-[#0a0a0a]">
//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-6">
//         {Object.entries(groupedMessages).map(([date, msgs]: [string, any]) => (
//           <div key={date} className="gap-y-4">
//             <div className="flex items-center justify-center">
//               <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
//                 {date}
//               </span>
//             </div>

//             {msgs.map((message: any, idx: number) => {
//               const isCurrentUser = message.member?.userId === session?.user?.id || 
//                                    message.member?.user?.id === session?.user?.id;
//               const showAvatar = idx === 0 || msgs[idx - 1]?.memberId !== message.memberId;
//               const isBookmarked = message.bookmarks?.some((b: any) => b.userId === session?.user?.id);
//               const isReply = !!message.parentId;
//               const isReplyingToThis = replyingTo?.id === message.id;

//               return (
//                 <MessageItem
//                   key={message.id}
//                   message={message}
//                   isCurrentUser={isCurrentUser}
//                   showAvatar={showAvatar}
//                   isBookmarked={isBookmarked}
//                   isReply={isReply}
//                   isReplyingToThis={isReplyingToThis}
//                   onReply={() => setReplyingTo(message)}
//                   onReact={addReaction}
//                   onBookmark={() => toggleBookmark(message.id)}
//                 />
//               );
//             })}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Reply Preview */}
//       {replyingTo && (
//         <div className="mx-4 mb-2 p-3 bg-zinc-800 rounded-lg border-l-4 border-blue-500">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 text-sm">
//               <Reply className="size-4 text-blue-500" />
//               <span className="text-zinc-400">Replying to</span>
//               <span className="text-white font-medium">{replyingTo.member?.user?.name}</span>
//               <span className="text-zinc-500 truncate max-w-[300px]">
//                 "{replyingTo.content?.substring(0, 60)}..."
//               </span>
//             </div>
//             <button 
//               onClick={() => setReplyingTo(null)}
//               className="text-zinc-500 hover:text-white"
//             >
//               <X className="size-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Input Area */}
//       <div className="p-4 border-t border-zinc-800">
//         <div className="flex items-end gap-2 bg-zinc-900 rounded-lg border border-zinc-800 p-2">
//           <Button variant="ghost" size="icon" className="h-8 w-8">
//             <Plus className="size-4" />
//           </Button>

//           <input
//             ref={inputRef}
//             type="text"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' && !e.shiftKey) {
//                 e.preventDefault();
//                 sendMessage();
//               }
//             }}
//             placeholder={replyingTo ? "Reply to message..." : "Write a message..."}
//             className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 text-white placeholder-zinc-500"
//           />

//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="ghost" size="icon" className="h-8 w-8">
//                 <Smile className="size-4" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" side="top">
//               <Picker
//                 data={data}
//                 onEmojiSelect={(emoji: any) => {
//                   setInputValue(prev => prev + emoji.native);
//                   inputRef.current?.focus();
//                 }}
//               />
//             </PopoverContent>
//           </Popover>

//           <Button 
//             onClick={sendMessage}
//             size="icon" 
//             className="h-8 w-8 bg-blue-600 hover:bg-blue-700"
//           >
//             <Send className="size-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Message Item Component
// const MessageItem = ({ 
//   message, 
//   isCurrentUser, 
//   showAvatar, 
//   isBookmarked,
//   isReply,
//   isReplyingToThis,
//   onReply, 
//   onReact,
//   onBookmark
// }: any) => {
//   const [showActions, setShowActions] = useState(false);

//   // Group reactions by emoji
//   const reactionCounts = message.reactions?.reduce((acc: any, reaction: any) => {
//     if (!acc[reaction.emoji]) {
//       acc[reaction.emoji] = { count: 0, userIds: [] };
//     }
//     acc[reaction.emoji].count++;
//     acc[reaction.emoji].userIds.push(reaction.member?.userId || reaction.memberId);
//     return acc;
//   }, {}) || {};

//   return (
//     <div 
//       className={`group flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${isReplyingToThis ? 'ring-2 ring-blue-500 rounded-lg p-2 bg-blue-500/10' : ''}`}
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => setShowActions(false)}
//     >
//       {showAvatar ? (
//         <Avatar className="size-8 mt-1">
//           <AvatarImage src={message.member?.user?.image} />
//           <AvatarFallback>{message.member?.user?.name?.[0] || '?'}</AvatarFallback>
//         </Avatar>
//       ) : (
//         <div className="w-8" />
//       )}

//       <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col max-w-[80%]`}>
//         {showAvatar && (
//           <div className="flex items-center gap-2 mb-1">
//             <span className="font-semibold text-sm text-white">{message.member?.user?.name || 'Unknown'}</span>
//             <span className="text-xs text-zinc-500">
//               {format(new Date(message.createdAt), 'h:mm a')}
//             </span>
//           </div>
//         )}

//         {/* Reply Badge */}
//         {isReply && (
//           <div className="flex items-center gap-1 mb-1 text-xs text-blue-400">
//             <Reply className="size-3" />
//             <span>Reply</span>
//           </div>
//         )}

//         <div className={`relative px-4 py-2 rounded-2xl ${
//           isCurrentUser 
//             ? 'bg-blue-600 text-white rounded-br-none' 
//             : 'bg-zinc-800 text-white rounded-bl-none'
//         }`}>
//           <p className="text-sm whitespace-pre-wrap">{message.content}</p>

//           {/* Reactions */}
//           {Object.entries(reactionCounts).length > 0 && (
//             <div className="flex flex-wrap gap-1 mt-2">
//               {Object.entries(reactionCounts).map(([emoji, data]: [string, any]) => (
//                 <button
//                   key={emoji}
//                   onClick={() => onReact(message.id, emoji)}
//                   className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/20 hover:bg-white/30 transition"
//                 >
//                   <span>{emoji}</span>
//                   <span className="font-medium">{data.count}</span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Actions */}
//         <div className={`flex items-center gap-1 mt-1 ${showActions ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onReply}>
//                 <Reply className="size-3" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Reply</TooltipContent>
//           </Tooltip>

//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="ghost" size="icon" className="h-6 w-6">
//                 <Smile className="size-3" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" side="top">
//               <Picker
//                 data={data}
//                 onEmojiSelect={(emoji: any) => onReact(message.id, emoji.native)}
//               />
//             </PopoverContent>
//           </Popover>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button 
//                 variant="ghost" 
//                 size="icon" 
//                 className={`h-6 w-6 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-400'}`}
//                 onClick={onBookmark}
//               >
//                 <Bookmark className={`size-3 ${isBookmarked ? 'fill-current' : ''}`} />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="icon" className="h-6 w-6">
//                 <Share2 className="size-3" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Share</TooltipContent>
//           </Tooltip>
//         </div>
//       </div>
//     </div>
//   );
// };

// "use client";

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { format } from 'date-fns';
// import { io, Socket } from 'socket.io-client';
// import { Send, Smile, Plus, X, Reply, Bookmark, Share2, Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/animate-ui/components/animate/tooltip';
// import data from '@emoji-mart/data';
// import Picker from '@emoji-mart/react';
// import LazyLoader from '@/components/loader/lazyloader';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';

// interface ChatInterfaceProps {
//   channelId: string;
//   serverId: string;
//   type: 'channel' | 'conversation';
//   currentMember: any;
// }

// export const ClickUpChatInterface: React.FC<ChatInterfaceProps> = ({
//   channelId,
//   serverId,
//   type,
//   currentMember
// }) => {
//   const { data: session } = useSession();
//   const [messages, setMessages] = useState<any[]>([]);
//   const [inputValue, setInputValue] = useState('');
//   const [replyingTo, setReplyingTo] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   // Initialize socket
//   useEffect(() => {
//     // IMPORTANT: Connect to the same path as the server
//     const socketInstance = io({
//       path: '/api/socket/io',
//       transports: ['websocket', 'polling'], // Allow fallback
//       reconnection: true,
//       reconnectionAttempts: 5,
//     });

//     socketInstance.on('connect', () => {
//       console.log('[CLIENT] Connected:', socketInstance.id);
//       // Join channel immediately
//       socketInstance.emit('join_channel', channelId);
//       console.log('[CLIENT] Joined channel:', channelId);
//     });

//     socketInstance.on('connect_error', (err) => {
//       console.error('[CLIENT] Connection error:', err.message);
//     });

//     setSocket(socketInstance);

//     return () => {
//       socketInstance.emit('leave_channel', channelId);
//       socketInstance.disconnect();
//     };
//   }, [channelId]);

//   // Fetch messages
//   const fetchMessages = useCallback(async () => {
//     try {
//       setLoading(true);
//       const endpoint = type === 'channel' 
//         ? `/api/messages?channelId=${channelId}`
//         : `/api/direct-messages?conversationId=${channelId}`;
//         // `/api/messages?channelId=${channelId}`
//       const res = await fetch(endpoint);
//       if (res.ok) {
//         const data = await res.json();
//         const msgs = data.items || [];
//         setMessages(msgs);
//         console.log('[CLIENT] Loaded messages:', msgs.length);
//       }
//     } catch (error) {
//       console.error('Failed to fetch messages:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [channelId, type]);

//   useEffect(() => {
//     fetchMessages();
//   }, [fetchMessages]);

//   // CRITICAL: Socket event listeners
//   useEffect(() => {
//     if (!socket) return;

//     // Listen for NEW MESSAGES from other users
//     // socket.on('new_message', (message: any) => {
//     //   console.log('[CLIENT] Received new_message:', message.id, message.content?.substring(0, 20));

//     //   setMessages(prev => {
//     //     // Check if already exists (from optimistic update)
//     //     if (prev.some(m => m.id === message.id)) {
//     //       console.log('[CLIENT] Message already exists, skipping');
//     //       return prev;
//     //     }
//     //     console.log('[CLIENT] Adding new message to state');
//     //     return [...prev, message];
//     //   });

//     //   // Auto scroll
//     //   setTimeout(() => {
//     //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     //   }, 100);
//     // });

//     socket.on('new_message', (message: any) => {
//   setMessages(prev => {
//     // Check 1: Already have this exact ID (from API response)
//     if (prev.some(m => m.id === message.id)) return prev;

//     // Check 2: Replace temp message if it exists (race condition fix)
//     const tempIndex = prev.findIndex(m => 
//       m.id?.startsWith('temp-') && 
//       m.content === message.content &&
//       m.memberId === message.memberId
//     );

//     if (tempIndex !== -1) {
//       const newMessages = [...prev];
//       newMessages[tempIndex] = message;
//       return newMessages;
//     }

//     // New message from another user
//     return [...prev, message];
//   });
// });

//     // Listen for REACTION updates
//     socket.on('message_reaction', (data: any) => {
//       console.log('[CLIENT] Received reaction:', data.messageId);
//       setMessages(prev => prev.map(msg => {
//         if (msg.id === data.messageId) {
//           return { ...msg, reactions: data.reactions };
//         }
//         return msg;
//       }));
//     });

//     // Listen for BOOKMARK updates
//     socket.on('message_bookmark', (data: any) => {
//       console.log('[CLIENT] Received bookmark:', data.messageId);
//       setMessages(prev => prev.map(msg => {
//         if (msg.id === data.messageId) {
//           const bookmarks = data.bookmarked 
//             ? [...(msg.bookmarks || []), { userId: data.userId }]
//             : (msg.bookmarks || []).filter((b: any) => b.userId !== data.userId);
//           return { ...msg, bookmarks };
//         }
//         return msg;
//       }));
//     });

//     return () => {
//       socket.off('new_message');
//       socket.off('message_reaction');
//       socket.off('message_bookmark');
//     };
//   }, [socket]);

//       const scrollToBottom = () => {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, 100);
//   };

//   const sendMessage = async () => {
//     if (!inputValue.trim() || !socket) return;

//     const tempId = `temp-${Date.now()}`;
//     const optimisticMessage = {
//       id: tempId,
//       content: inputValue,
//       channelId,
//       memberId: currentMember?.id,
//       member: {
//         ...currentMember,
//         user: session?.user
//       },
//       reactions: [],
//       bookmarks: [],
//       createdAt: new Date().toISOString(),
//       parentId: replyingTo?.id || null
//     };

//     // Optimistic update for sender
//     setMessages(prev => [...prev, optimisticMessage]);
//     setInputValue('');
//     setReplyingTo(null);
//     setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
//     scrollToBottom();
//     try {
//       const res = await fetch('/api/socket/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           content: optimisticMessage.content,
//           channelId,
//           serverId,
//           parentId: optimisticMessage.parentId
//         })
//       });

//       if (!res.ok) throw new Error('Failed to send');

//       const savedMessage = await res.json();

//       // Replace temp with real message
//       setMessages(prev => prev.map(m => 
//         m.id === tempId ? savedMessage : m
//       ));

//     } catch (error) {
//       console.error('Failed to send:', error);
//       // Remove optimistic message on error
//       setMessages(prev => prev.filter(m => m.id !== tempId));
//     }
//   };


//   // In your ChatInterface component


// // const sendMessage = async () => {
// //   if (!inputValue.trim() || !socket) return;

// //   const body = {
// //     content: inputValue,
// //     channelId,
// //     serverId,
// //     parentId: replyingTo?.id || null
// //   };

// //   try {
// //     // Clear input immediately for UX
// //     setInputValue('');
// //     setReplyingTo(null);

// //     // Send to server but DON'T add to state yet
// //     const res = await fetch('/api/socket/messages', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify(body)
// //     });

// //     if (!res.ok) throw new Error('Failed to send');

// //     // Message will appear automatically via socket event

// //   } catch (error) {
// //     console.error('Failed to send message:', error);
// //     // Optionally restore input or show error toast
// //   }
// // };

// // Socket listener - handles messages for EVERYONE (sender + receivers)
// useEffect(() => {
//   if (!socket) return;

//   const handleNewMessage = (message: any) => {
//     console.log('[CLIENT] Received:', message.id);

//     setMessages(prev => {
//       // Deduplication guard
//       if (prev.some(m => m.id === message.id)) return prev;
//       return [...prev, message];
//     });

//     scrollToBottom();
//   };

//   socket.on('new_message', handleNewMessage);

//   return () => {
//     socket.off('new_message', handleNewMessage);
//   };
// }, [socket]);

//   const addReaction = async (messageId: string, emoji: string) => {
//     // Optimistic update
//     setMessages(prev => prev.map(msg => {
//       if (msg.id === messageId) {
//         const hasReaction = msg.reactions?.some((r: any) => 
//           r.emoji === emoji && r.member?.userId === session?.user?.id
//         );

//         if (hasReaction) {
//           // Remove
//           return {
//             ...msg,
//             reactions: msg.reactions.filter((r: any) => 
//               !(r.emoji === emoji && r.member?.userId === session?.user?.id)
//             )
//           };
//         } else {
//           // Add
//           return {
//             ...msg,
//             reactions: [...(msg.reactions || []), {
//               emoji,
//               member: { userId: session?.user?.id, user: session?.user }
//             }]
//           };
//         }
//       }
//       return msg;
//     }));

//     try {
//       const res = await fetch('/api/messages/reactions', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ messageId, emoji, serverId })
//       });

//       if (!res.ok) throw new Error('Failed');

//       // Server will emit to all clients including this one
//     } catch (error) {
//       console.error('Failed:', error);
//       fetchMessages(); // Revert
//     }
//   };

//   const toggleBookmark = async (messageId: string) => {
//     const message = messages.find(m => m.id === messageId);
//     const isBookmarked = message?.bookmarks?.some((b: any) => b.userId === session?.user?.id);

//     // Optimistic
//     setMessages(prev => prev.map(msg => {
//       if (msg.id === messageId) {
//         const bookmarks = isBookmarked
//           ? (msg.bookmarks || []).filter((b: any) => b.userId !== session?.user?.id)
//           : [...(msg.bookmarks || []), { userId: session?.user?.id }];
//         return { ...msg, bookmarks };
//       }
//       return msg;
//     }));

//     try {
//       const res = await fetch('/api/messages/bookmark', {
//         method: isBookmarked ? 'DELETE' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ messageId })
//       });

//       if (!res.ok) throw new Error('Failed');
//     } catch (error) {
//       console.error('Failed:', error);
//       fetchMessages();
//     }
//   };

//   const groupedMessages = messages.reduce((groups: any, message) => {
//     const date = format(new Date(message.createdAt), 'MMMM d, yyyy');
//     if (!groups[date]) groups[date] = [];
//     groups[date].push(message);
//     return groups;
//   }, {});

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <LazyLoader />
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col w-full h-full overflow-y-hidden dark:bg-[#020202] relative ">
//       {/* Messages */}
//       <div className=" max-w-full overflow-y-auto scrollbar-thin2 h-[88%] gap-y-3 ">
//         {Object.entries(groupedMessages).map(([date, msgs]: [string, any]) => (
//           <div key={date} className="space-y-0">
//             <div className="flex items-center justify-center relative mb-6">
//               <Separator className='' />
//               <Badge variant="outline" className="text-xs absolute  mx-auto inset-0 dark:bg-black -mt-3.5 text-[#B4B4B4] text-center justify-center items-center flex h-7 w-40 min-w-32 px-3  rounded-full">
//                 {date}
//               </Badge>

//             </div>

//             {msgs.map((message: any, idx: number) => {
//               const isCurrentUser = message.member?.userId === session?.user?.id || 
//                                    message.member?.user?.id === session?.user?.id;
//               const showAvatar = idx === 0 || msgs[idx - 1]?.memberId !== message.memberId;
//               const isBookmarked = message.bookmarks?.some((b: any) => b.userId === session?.user?.id);
//               const isReply = !!message.parentId;
//               const isReplyingToThis = replyingTo?.id === message.id;

//               return (
//                 <MessageItem
//                   key={message.id}
//                   message={message}
//                   isCurrentUser={isCurrentUser}
//                   showAvatar={showAvatar}
//                   isBookmarked={isBookmarked}
//                   isReply={isReply}
//                   isReplyingToThis={isReplyingToThis}
//                   currentUserId={session?.user?.id}
//                   onReply={() => setReplyingTo(message)}
//                   onReact={addReaction}
//                   onBookmark={() => toggleBookmark(message.id)}
//                 />
//               );
//             })}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Reply Preview */}
//       {replyingTo && (
//         <div className="mx-4 p-3 bg-zinc-800 rounded-lg border-l-4 border-blue-500">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 text-sm">
//               <Reply className="size-4 text-blue-500" />
//               <span className="text-zinc-400">Replying to</span>
//               <span className="text-white font-medium">{replyingTo.member?.user?.name}</span>
//               <span className="text-zinc-500 truncate max-w-[300px]">
//                 "{replyingTo.content?.substring(0, 60)}..."
//               </span>
//             </div>
//             <button onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white">
//               <X className="size-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Input */}
//       <div className=" mx-4 h-fit">
//         <div className="flex items-end gap-2 rounded-lg border border-zinc-800 p-2">
//           <Button variant="ghost" size="icon" className="h-8 w-8">
//             <Plus className="size-4" />
//           </Button>

//           <input
//             ref={inputRef}
//             type="text"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' && !e.shiftKey) {
//                 e.preventDefault();
//                 sendMessage();
//               }
//             }}
//             placeholder={replyingTo ? "Reply to message..." : "Write a message..."}
//             className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 text-white placeholder-zinc-500"
//           />

//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="ghost" size="icon" className="h-8 w-8">
//                 <Smile className="size-4" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" side="top">
//               <Picker
//                 data={data}
//                 onEmojiSelect={(emoji: any) => {
//                   setInputValue(prev => prev + emoji.native);
//                   inputRef.current?.focus();
//                 }}
//               />
//             </PopoverContent>
//           </Popover>

//           <Button onClick={sendMessage} size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700">
//             <Send className="size-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Message Item
// const MessageItem = ({ 
//   message, 
//   isCurrentUser, 
//   showAvatar, 
//   isBookmarked,
//   isReply,
//   isReplyingToThis,
//   currentUserId,
//   onReply, 
//   onReact,
//   onBookmark
// }: any) => {
//   const [showActions, setShowActions] = useState(false);

//   const reactionCounts = message.reactions?.reduce((acc: any, reaction: any) => {
//     const emoji = reaction.emoji;
//     if (!acc[emoji]) acc[emoji] = { count: 0, userIds: [] };
//     acc[emoji].count++;
//     acc[emoji].userIds.push(reaction.member?.userId || reaction.memberId);
//     return acc;
//   }, {}) || {};

//   const userReacted = (emoji: string) => {
//     return reactionCounts[emoji]?.userIds?.includes(currentUserId);
//   };

//   return (
//     <div 
//       className={`group hover:dark:bg-[#222222] pt-2 pb-3 px-6 flex gap-3 ${isCurrentUser ? 'flex-row' : 'flex-row'} ${isReplyingToThis ? 'ring-2 ring-blue-500 rounded-lg p-2 bg-blue-500/10' : ''}`}
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => setShowActions(false)}
//     >
//       {showAvatar ? (
//         <Avatar className="size-9 mt-1.5">
//           <AvatarImage src={message.member?.user?.image} />
//           <AvatarFallback>{message.member?.user?.name?.[0] || '?'}</AvatarFallback>
//         </Avatar>
//       ) : <div className="w-8" />}

//       <div className={`flex-1 ${isCurrentUser ? 'items-start' : 'items-start'} flex flex-col max-w-[80%]`}>
//         {showAvatar && (
//           <div className="flex items-center gap-2 mb-0">
//             <span className="font-semibold text-sm text-white">{message.member?.user?.name || 'Unknown'}</span>
//             <span className="text-xs text-zinc-500">
//               {format(new Date(message.createdAt), 'h:mm a')}
//             </span>
//           </div>
//         )}

//         {isReply && (
//           <div className="flex items-center gap-1 mb-1 text-xs text-blue-400">
//             <Reply className="size-3" />
//             <span>Reply</span>
//           </div>
//         )}

//         <div className={`relative   p-0 rounded-2xl text-white ${
//           isCurrentUser ? '' : ''
//         }`}>
//           <p className="text-sm whitespace-pre-wrap">{message.content}</p>

//           {Object.entries(reactionCounts).length > 0 && (
//             <div className="flex flex-wrap gap-1 mt-0">
//               {Object.entries(reactionCounts).map(([emoji, data]: [string, any]) => (
//                 <button
//                   key={emoji}
//                   onClick={() => onReact(message.id, emoji)}
//                   className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition ${
//                     userReacted(emoji) ? 'bg-blue-500 text-white' : 'bg-white/20 hover:bg-white/30'
//                   }`}
//                 >
//                   <span>{emoji}</span>
//                   <span className="font-medium">{data.count}</span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>


//       </div>
//        <div className={`flex items-center h-fit gap-1 -mt-5 ${showActions ? 'opacity-100' : 'opacity-0'} transition-opacity border dark:bg-[#111111] border-[#484848] rounded-lg p-1`}>

//           <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger >
//               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onReply}>
//                 <Reply className="size-3" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Reply</TooltipContent>
//           </Tooltip>

//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="ghost" size="icon" className="h-6 w-6">
//                 <Smile className="size-3" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" side="top">
//               <Picker data={data} onEmojiSelect={(emoji: any) => onReact(message.id, emoji.native)} />
//             </PopoverContent>
//           </Popover>

//           <Tooltip>
//             <TooltipTrigger >
//               <Button 
//                 variant="ghost" 
//                 size="icon" 
//                 className={`h-6 w-6 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-400'}`}
//                 onClick={onBookmark}
//               >
//                 <Bookmark className={`size-3 ${isBookmarked ? 'fill-current' : ''}`} />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger >
//               <Button variant="ghost" size="icon" className="h-6 w-6">
//                 <Share2 className="size-3" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Share</TooltipContent>
//           </Tooltip>
//           </TooltipProvider>
//         </div>
//     </div>
//   );
// };

// "use client";

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { format } from 'date-fns';
// import { io, Socket } from 'socket.io-client';
// import { Send, Smile, Plus, X, Reply, Bookmark, Share2, FileIcon, ImageIcon } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/animate-ui/components/animate/tooltip';
// import data from '@emoji-mart/data';
// import Picker from '@emoji-mart/react';
// import LazyLoader from '@/components/loader/lazyloader';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { FileUpload } from '@/components/chat-components/file-upload'; // adjust path as needed
// import Image from 'next/image';

// interface ChatInterfaceProps {
//   channelId: string;
//   serverId: string;
//   type: 'channel' | 'conversation';
//   currentMember: any;
// }

// export const ClickUpChatInterface: React.FC<ChatInterfaceProps> = ({
//   channelId,
//   serverId,
//   type,
//   currentMember
// }) => {
//   const { data: session } = useSession();
//   const [messages, setMessages] = useState<any[]>([]);
//   const [inputValue, setInputValue] = useState('');
//   const [replyingTo, setReplyingTo] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState<Socket | null>(null);

//   // --- File attachment state ---
//   const [showFileUpload, setShowFileUpload] = useState(false);
//   const [attachedFileUrl, setAttachedFileUrl] = useState<string>('');
//   // Detect file type for endpoint selection: treat all channel uploads as messageFile
//   const uploadEndpoint: 'messageFile' | 'serverImage' = 'messageFile';

//   const inputRef = useRef<HTMLInputElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Initialize socket
//   useEffect(() => {
//     const socketInstance = io({
//       path: '/api/socket/io',
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//     });

//     socketInstance.on('connect', () => {
//       socketInstance.emit('join_channel', channelId);
//     });

//     socketInstance.on('connect_error', (err) => {
//       console.error('[CLIENT] Connection error:', err.message);
//     });

//     setSocket(socketInstance);

//     return () => {
//       socketInstance.emit('leave_channel', channelId);
//       socketInstance.disconnect();
//     };
//   }, [channelId]);

//   // Fetch messages
//   const fetchMessages = useCallback(async () => {
//     try {
//       setLoading(true);
//       const endpoint = type === 'channel'
//         ? `/api/messages?channelId=${channelId}`
//         : `/api/direct-messages?conversationId=${channelId}`;
//       const res = await fetch(endpoint);
//       if (res.ok) {
//         const data = await res.json();
//         setMessages(data.items || []);
//       }
//     } catch (error) {
//       console.error('Failed to fetch messages:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [channelId, type]);

//   useEffect(() => {
//     fetchMessages();
//   }, [fetchMessages]);

//   // Socket event listeners
//   useEffect(() => {
//     if (!socket) return;

//     socket.on('new_message', (message: any) => {
//       setMessages(prev => {
//         if (prev.some(m => m.id === message.id)) return prev;

//         const tempIndex = prev.findIndex(m =>
//           m.id?.startsWith('temp-') &&
//           m.content === message.content &&
//           m.memberId === message.memberId
//         );

//         if (tempIndex !== -1) {
//           const newMessages = [...prev];
//           newMessages[tempIndex] = message;
//           return newMessages;
//         }

//         return [...prev, message];
//       });
//     });

//     socket.on('message_reaction', (data: any) => {
//       setMessages(prev => prev.map(msg =>
//         msg.id === data.messageId ? { ...msg, reactions: data.reactions } : msg
//       ));
//     });

//     socket.on('message_bookmark', (data: any) => {
//       setMessages(prev => prev.map(msg => {
//         if (msg.id !== data.messageId) return msg;
//         const bookmarks = data.bookmarked
//           ? [...(msg.bookmarks || []), { userId: data.userId }]
//           : (msg.bookmarks || []).filter((b: any) => b.userId !== data.userId);
//         return { ...msg, bookmarks };
//       }));
//     });

//     return () => {
//       socket.off('new_message');
//       socket.off('message_reaction');
//       socket.off('message_bookmark');
//     };
//   }, [socket]);

//   // Socket listener for new messages (deduplication)
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewMessage = (message: any) => {
//       setMessages(prev => {
//         if (prev.some(m => m.id === message.id)) return prev;
//         return [...prev, message];
//       });
//       scrollToBottom();
//     };

//     socket.on('new_message', handleNewMessage);
//     return () => { socket.off('new_message', handleNewMessage); };
//   }, [socket]);

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, 66);
//   };

//   // Handle file attachment change from FileUpload
//   const handleFileChange = (url?: string) => {
//     setAttachedFileUrl(url || '');
//     // If a file was uploaded, collapse the uploader area (keep state so preview shows inline)
//     if (url) {
//       setShowFileUpload(false);
//     }
//   };

//   // Clear attachment
//   const clearAttachment = () => {
//     setAttachedFileUrl('');
//     setShowFileUpload(false);
//   };

//   const sendMessage = async () => {
//     // Allow sending if there's text OR a file attached
//     if (!inputValue.trim() && !attachedFileUrl) return;
//     if (!socket) return;

//     const tempId = `temp-${Date.now()}`;
//     const optimisticMessage = {
//       id: tempId,
//       content: inputValue,
//       fileUrl: attachedFileUrl || null,
//       channelId,
//       memberId: currentMember?.id,
//       member: {
//         ...currentMember,
//         user: session?.user
//       },
//       reactions: [],
//       bookmarks: [],
//       createdAt: new Date().toISOString(),
//       parentId: replyingTo?.id || null
//     };

//     setMessages(prev => [...prev, optimisticMessage]);
//     const sentContent = inputValue;
//     const sentFileUrl = attachedFileUrl;
//     setInputValue('');
//     setAttachedFileUrl('');
//     setShowFileUpload(false);
//     setReplyingTo(null);
//     scrollToBottom();

//     try {
//       const res = await fetch('/api/socket/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           content: sentContent,
//           fileUrl: sentFileUrl || undefined,
//           channelId,
//           serverId,
//           parentId: optimisticMessage.parentId
//         })
//       });

//       if (!res.ok) throw new Error('Failed to send');

//       const savedMessage = await res.json();
//       setMessages(prev => prev.map(m => m.id === tempId ? savedMessage : m));
//     } catch (error) {
//       console.error('Failed to send:', error);
//       setMessages(prev => prev.filter(m => m.id !== tempId));
//       // Restore input on failure
//       setInputValue(sentContent);
//       setAttachedFileUrl(sentFileUrl);
//     }
//   };

//   const addReaction = async (messageId: string, emoji: string) => {
//     setMessages(prev => prev.map(msg => {
//       if (msg.id !== messageId) return msg;
//       const hasReaction = msg.reactions?.some((r: any) =>
//         r.emoji === emoji && r.member?.userId === session?.user?.id
//       );
//       return {
//         ...msg,
//         reactions: hasReaction
//           ? msg.reactions.filter((r: any) => !(r.emoji === emoji && r.member?.userId === session?.user?.id))
//           : [...(msg.reactions || []), { emoji, member: { userId: session?.user?.id, user: session?.user } }]
//       };
//     }));

//     try {
//       const res = await fetch('/api/messages/reactions', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ messageId, emoji, serverId })
//       });
//       if (!res.ok) throw new Error('Failed');
//     } catch (error) {
//       console.error('Failed:', error);
//       fetchMessages();
//     }
//   };

//   const toggleBookmark = async (messageId: string) => {
//     const message = messages.find(m => m.id === messageId);
//     const isBookmarked = message?.bookmarks?.some((b: any) => b.userId === session?.user?.id);

//     setMessages(prev => prev.map(msg => {
//       if (msg.id !== messageId) return msg;
//       const bookmarks = isBookmarked
//         ? (msg.bookmarks || []).filter((b: any) => b.userId !== session?.user?.id)
//         : [...(msg.bookmarks || []), { userId: session?.user?.id }];
//       return { ...msg, bookmarks };
//     }));

//     try {
//       const res = await fetch('/api/messages/bookmark', {
//         method: isBookmarked ? 'DELETE' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ messageId })
//       });
//       if (!res.ok) throw new Error('Failed');
//     } catch (error) {
//       console.error('Failed:', error);
//       fetchMessages();
//     }
//   };

//   const groupedMessages = messages.reduce((groups: any, message) => {
//     const date = format(new Date(message.createdAt), 'MMMM d, yyyy');
//     if (!groups[date]) groups[date] = [];
//     groups[date].push(message);
//     return groups;
//   }, {});

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <LazyLoader />
//       </div>
//     );
//   }

//   const fileType = attachedFileUrl?.split('.').pop()?.toLowerCase();
//   const attachedIsPdf = fileType === 'pdf';

//   return (
//     <div className="flex flex-col w-full h-full max-h-full overflow-y-hidden dark:bg-[#060101] relative">
//       {/* Messages */}
//       <div className="max-w-full overflow-y-auto scrollbar-thin2 h-[83%] min-h-[83%] gap-y-3">
//         {Object.entries(groupedMessages).map(([date, msgs]: [string, any]) => (
//           <div key={date} className="space-y-0">
//             <div className="flex items-center justify-center relative my-6">
//               <Separator />
//               <Badge variant="outline" className="text-xs absolute mx-auto inset-0 dark:bg-black -mt-3.5 text-[#B4B4B4] text-center justify-center items-center flex h-7 w-40 min-w-32 px-3 rounded-full">
//                 {date}
//               </Badge>
//             </div>

//             {msgs.map((message: any, idx: number) => {
//               const isCurrentUser = message.member?.userId === session?.user?.id ||
//                 message.member?.user?.id === session?.user?.id;
//               const showAvatar = idx === 0 || msgs[idx - 1]?.memberId !== message.memberId;
//               const isBookmarked = message.bookmarks?.some((b: any) => b.userId === session?.user?.id);
//               const isReply = !!message.parentId;
//               const isReplyingToThis = replyingTo?.id === message.id;

//               return (
//                 <MessageItem
//                   key={message.id}
//                   message={message}
//                   isCurrentUser={isCurrentUser}
//                   showAvatar={showAvatar}
//                   isBookmarked={isBookmarked}
//                   isReply={isReply}
//                   isReplyingToThis={isReplyingToThis}
//                   currentUserId={session?.user?.id}
//                   onReply={() => setReplyingTo(message)}
//                   onReact={addReaction}
//                   onBookmark={() => toggleBookmark(message.id)}
//                 />
//               );
//             })}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Reply Preview */}
//       {replyingTo && (
//         <div className="mx-4 p-3 bg-zinc-800 rounded-lg border-l border-blue-500">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 text-sm">
//               <Reply className="size-4 text-blue-500" />
//               <span className="text-zinc-400">Replying to</span>
//               <span className="text-white font-medium">{replyingTo.member?.user?.name}</span>
//               <span className="text-zinc-500 truncate max-w-[300px]">
//                 "{replyingTo.content?.substring(0, 60)}..."
//               </span>
//             </div>
//             <button type="button" onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white">
//               <X className="size-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Input Area */}
//       <div className="mx-4 h-fit">
//         {/* File Upload Panel — shown when + is clicked */}
//         {showFileUpload && (
//           <div className="mb-2 p-3 rounded-lg border border-zinc-700 dark:bg-[#111111] flex items-center gap-3">
//             <FileUpload
//               endpoint={uploadEndpoint}
//               value={attachedFileUrl}
//               onChange={handleFileChange}
//             />
//             <button type="button"
//               onClick={() => setShowFileUpload(false)}
//               className="ml-auto text-zinc-500 hover:text-white"
//             >
//               <X className="size-4" />
//             </button>
//           </div>
//         )}

//         {/* Attachment Preview Strip (when file attached but uploader collapsed) */}
//         {attachedFileUrl && !showFileUpload && (
//           <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 dark:bg-[#111111]">
//             {attachedIsPdf ? (
//               <>
//                 <FileIcon className="size-5 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
//                 <a
//                   href={attachedFileUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-xs text-indigo-400 hover:underline truncate max-w-[220px]"
//                 >
//                   {attachedFileUrl.split('/').pop()}
//                 </a>
//               </>
//             ) : (
//               <>
//                 <div className="relative size-10 rounded overflow-hidden flex-shrink-0">
//                   <Image
//                     src={attachedFileUrl}
//                     alt="attachment"
//                     width={1000}
//                     height={1000}
//                     unoptimized
//                     className="object-cover"
//                   />
//                 </div>
//                 <span className="text-xs text-zinc-400 truncate max-w-[200px]">
//                   {attachedFileUrl.split('/').pop()}
//                 </span>
//               </>
//             )}
//             <button type="button"
//               onClick={clearAttachment}
//               className="ml-auto text-zinc-500 hover:text-red-400 transition-colors"
//             >
//               <X className="size-4" />
//             </button>
//           </div>
//         )}

//       </div>
//       <div className="flex  items-center gap-2 rounded-lg border -mt-0 mx-4 border-zinc-800 p-2">
//         {/* + button toggles file upload panel */}
//         <Button
//           variant="ghost"
//           size="icon"
//           className={`h-8 w-8 transition-colors ${showFileUpload ? 'text-blue-400' : ''}`}
//           onClick={() => setShowFileUpload(prev => !prev)}
//           type="button"
//         >
//           {showFileUpload ? <X className="size-4" /> : <Plus className="size-4" />}
//         </Button>

//         <input
//         aria-label='Write a message'
//           ref={inputRef}
//           type="text"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter' && !e.shiftKey) {
//               e.preventDefault();
//               sendMessage();
//             }
//           }}
//           placeholder={replyingTo ? 'Reply to message...' : 'Write a message...'}
//           className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 text-white placeholder-zinc-500"
//         />

//         <Popover>
//           <PopoverTrigger asChild>
//             <Button variant="ghost" size="icon" className="h-8 w-8">
//               <Smile className="size-4" />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-0" side="top">
//             <Picker
//               data={data}
//               onEmojiSelect={(emoji: any) => {
//                 setInputValue(prev => prev + emoji.native);
//                 inputRef.current?.focus();
//               }}
//             />
//           </PopoverContent>
//         </Popover>

//         <Button
//           onClick={sendMessage}
//           size="icon"
//           className={`h-8 w-8 transition-colors ${inputValue.trim() || attachedFileUrl
//               ? 'bg-blue-600 hover:bg-blue-700'
//               : 'bg-zinc-700 cursor-not-allowed'
//             }`}
//           disabled={!inputValue.trim() && !attachedFileUrl}
//         >
//           <Send className="size-4" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// // ─── Message Item ────────────────────────────────────────────────────────────

// const MessageItem = ({
//   message,
//   isCurrentUser,
//   showAvatar,
//   isBookmarked,
//   isReply,
//   isReplyingToThis,
//   currentUserId,
//   onReply,
//   onReact,
//   onBookmark
// }: any) => {
//   const [showActions, setShowActions] = useState(false);
//   const [imageError, setImageError] = useState(false);

//   const fileUrl: string | undefined = message.fileUrl;
//   const fileExt = fileUrl?.split('.').pop()?.toLowerCase();
//   const fileIsPdf = fileExt === 'pdf';
//   const fileIsImage = fileUrl && !fileIsPdf;

//   const reactionCounts = message.reactions?.reduce((acc: any, reaction: any) => {
//     const emoji = reaction.emoji;
//     if (!acc[emoji]) acc[emoji] = { count: 0, userIds: [] };
//     acc[emoji].count++;
//     acc[emoji].userIds.push(reaction.member?.userId || reaction.memberId);
//     return acc;
//   }, {}) || {};

//   const userReacted = (emoji: string) =>
//     reactionCounts[emoji]?.userIds?.includes(currentUserId);

//   return (
//     <div
//       className={`group hover:dark:bg-[#222222] pt-2 pb-3 px-6 flex gap-3 ${isReplyingToThis ? 'ring-2 ring-blue-500 rounded-lg p-2 bg-blue-500/10' : ''
//         }`}
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => setShowActions(false)}
//     >
//       {showAvatar ? (
//         <Avatar className="size-9 mt-1.5">
//           <AvatarImage src={message.member?.user?.image} />
//           <AvatarFallback>{message.member?.user?.name?.[0] || '?'}</AvatarFallback>
//         </Avatar>
//       ) : <div className="w-8" />}

//       <div className="flex-1 flex flex-col max-w-[80%]">
//         {showAvatar && (
//           <div className="flex items-center gap-2 mb-0">
//             <span className="font-semibold text-sm text-white">
//               {message.member?.user?.name || 'Unknown'}
//             </span>
//             <span className="text-xs text-zinc-500">
//               {format(new Date(message.createdAt), 'h:mm a')}
//             </span>
//           </div>
//         )}

//         {isReply && (
//           <div className="flex items-center gap-1 mb-1 text-xs text-blue-400">
//             <Reply className="size-3" />
//             <span>Reply</span>
//           </div>
//         )}

//         <div className="relative   p-0 rounded-2xl text-white">
//           {/* Text content */}
//           {message.content && (
//             <p className="text-sm whitespace-pre-wrap">{message.content}</p>
//           )}

//           {/* File/Image attachment */}
//           {fileUrl && (
//             <div className="mt-1.5">
//               {fileIsImage && !imageError && (
//                 <div className="relative rounded-lg overflow-hidden max-w-xs max-h-64 border border-zinc-700">
//                   <Image
//                     src={fileUrl}
//                     alt="attachment"
//                     width={320}
//                     height={240}
//                     unoptimized
//                     className="object-contain w-full h-auto max-h-64"
//                     onError={() => setImageError(true)}
//                   />
//                 </div>
//               )}
//               {fileIsImage && imageError && (
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs max-w-xs">
//                   <ImageIcon className="size-4 flex-shrink-0" />
//                   <span>Image unavailable</span>
//                 </div>
//               )}
//               {fileIsPdf && (
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 max-w-xs">
//                   <FileIcon className="size-5 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
//                   <a
//                     href={fileUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-xs text-indigo-400 hover:underline truncate"
//                   >
//                     {fileUrl.split('/').pop()}
//                   </a>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Reactions */}
//           {Object.entries(reactionCounts).length > 0 && (
//             <div className="flex flex-wrap gap-1 mt-1">
//               {Object.entries(reactionCounts).map(([emoji, data]: [string, any]) => (
//                 <button type="button"
//                   key={emoji}
//                   onClick={() => onReact(message.id, emoji)}
//                   className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition ${userReacted(emoji) ? 'bg-blue-500 text-white' : 'bg-white/20 hover:bg-white/30'
//                     }`}
//                 >
//                   <span>{emoji}</span>
//                   <span className="font-medium">{data.count}</span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Hover Action Bar */}
//       <div className={`flex items-center h-fit gap-1 -mt-5 ${showActions ? 'opacity-100' : 'opacity-0'} transition-opacity border dark:bg-[#111111] border-[#484848] rounded-lg p-1`}>
//         <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger>
//               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onReply}>
//                 <Reply className="size-3" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Reply</TooltipContent>
//           </Tooltip>

//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="ghost" size="icon" className="h-6 w-6">
//                 <Smile className="size-3" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" side="top">
//               <Picker data={data} onEmojiSelect={(emoji: any) => onReact(message.id, emoji.native)} />
//             </PopoverContent>
//           </Popover>

//           <Tooltip>
//             <TooltipTrigger>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className={`h-6 w-6 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-400'}`}
//                 onClick={onBookmark}
//               >
//                 <Bookmark className={`size-3 ${isBookmarked ? 'fill-current' : ''}`} />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger>
//               <Button variant="ghost" size="icon" className="h-6 w-6">
//                 <Share2 className="size-3" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Share</TooltipContent>
//           </Tooltip>
//         </TooltipProvider>
//       </div>
//     </div>
//   );
// };


// "use client";

// import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { format } from 'date-fns';
// import { io, Socket } from 'socket.io-client';
// import {
//   Send, Smile, Plus, X, Reply, Bookmark, Share2,
//   FileIcon, ImageIcon, Pencil, Trash2, Check, Loader2,
//   Forward, Hash, User
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/animate-ui/components/animate/tooltip';
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
// } from '@/components/ui/dialog';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import data from '@emoji-mart/data';
// import Picker from '@emoji-mart/react';
// import LazyLoader from '@/components/loader/lazyloader';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import Image from 'next/image';

// interface ChatInterfaceProps {
//   channelId: string;
//   serverId: string;
//   type: 'channel' | 'conversation';
//   currentMember: any;
// }

// interface Message {
//   id: string;
//   optimisticId?: string;   // ← ADD THIS
//   content: string;
//   fileUrl?: string | null;
//   deleted: boolean;
//   createdAt: string;
//   updatedAt: string;
//   member: {
//     id: string;
//     role: string;
//     user: { id: string; name: string; email: string; image: string };
//   };
//   reactions: Reaction[];
//   bookmarks: Bookmark[];
//   threadParent?: Message | null;
// }

// export const ClickUpChatInterface: React.FC<ChatInterfaceProps> = ({
//   channelId,
//   serverId,
//   type,
//   currentMember
// }) => {
//   const { data: session } = useSession();
//   const [messages, setMessages] = useState<any[]>([]);
//   const [inputValue, setInputValue] = useState('');
//   const [replyingTo, setReplyingTo] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState<Socket | null>(null);

//   // File attachment — deferred upload flow
//   const [showFileUpload, setShowFileUpload] = useState(false);
//   const [pendingFile, setPendingFile] = useState<File | null>(null);
//   const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string>('');
//   const [isUploading, setIsUploading] = useState(false);
//   const uploadEndpoint: 'messageFile' | 'serverImage' = 'messageFile';

//   // Share modal
//   const [shareMessage, setShareMessage] = useState<any>(null);
//   const [shareTargets, setShareTargets] = useState<{ channels: any[]; members: any[] }>({ channels: [], members: [] });
//   const [shareLoading, setShareLoading] = useState(false);
//   const [shareSearch, setShareSearch] = useState('');

//   const inputRef = useRef<HTMLInputElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const messagesContainerRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // ── Socket ────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const socketInstance = io({
//       path: '/api/socket/io',
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//     });
//     socketInstance.on('connect', () => {
//       socketInstance.emit('join_channel', channelId);
//     });
//     socketInstance.on('connect_error', (err) => {
//       console.error('[CLIENT] Connection error:', err.message);
//     });
//     setSocket(socketInstance);
//     return () => {
//       socketInstance.emit('leave_channel', channelId);
//       socketInstance.disconnect();
//     };
//   }, [channelId]);

//   // ── Fetch messages ────────────────────────────────────────────────────────
//   const fetchMessages = useCallback(async () => {
//     try {
//       setLoading(true);
//       const endpoint = type === 'channel'
//         ? `/api/messages?channelId=${channelId}`
//         : `/api/direct-messages?conversationId=${channelId}`;
//       const res = await fetch(endpoint);
//       if (res.ok) {
//         const data = await res.json();
//         setMessages(data.items || []);
//       }
//     } catch (error) {
//       console.error('Failed to fetch messages:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [channelId, type]);

//   useEffect(() => { fetchMessages(); }, [fetchMessages]);

//   // ── Scroll to bottom after first load — no layout shift ──────────────────
//   useLayoutEffect(() => {
//     if (!loading && messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
//     }
//   }, [loading]);

//   // ── Socket listeners ──────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewMessage = (message: any) => {
//       setMessages(prev => {
//         if (prev.some(m => m.id === message.id)) return prev;
//         const tempIndex = prev.findIndex(m =>
//           m.id?.startsWith('temp-') &&
//           m.content === message.content &&
//           m.memberId === message.memberId
//         );
//         if (tempIndex !== -1) {
//           const next = [...prev];
//           next[tempIndex] = message;
//           return next;
//         }
//         return [...prev, message];
//       });
//       scrollToBottom();
//     };

//     const handleEditedMessage = (message: any) => {
//       setMessages(prev => prev.map(m => m.id === message.id ? { ...m, ...message } : m));
//     };

//     const handleDeletedMessage = (data: { messageId: string }) => {
//       setMessages(prev => prev.filter(m => m.id !== data.messageId));
//     };

//     socket.on('new_message', handleNewMessage);
//     socket.on('message_edited', handleEditedMessage);
//     socket.on('message_deleted', handleDeletedMessage);

//     socket.on('message_reaction', (data: any) => {
//       setMessages(prev => prev.map(msg =>
//         msg.id === data.messageId ? { ...msg, reactions: data.reactions } : msg
//       ));
//     });

//     socket.on('message_bookmark', (data: any) => {
//       setMessages(prev => prev.map(msg => {
//         if (msg.id !== data.messageId) return msg;
//         const bookmarks = data.bookmarked
//           ? [...(msg.bookmarks || []), { userId: data.userId }]
//           : (msg.bookmarks || []).filter((b: any) => b.userId !== data.userId);
//         return { ...msg, bookmarks };
//       }));
//     });

//     return () => {
//       socket.off('new_message', handleNewMessage);
//       socket.off('message_edited', handleEditedMessage);
//       socket.off('message_deleted', handleDeletedMessage);
//       socket.off('message_reaction');
//       socket.off('message_bookmark');
//     };
//   }, [socket]);

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, 99);
//   };

//   // ── File handling ─────────────────────────────────────────────────────────
//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const maxSize = 10 * 1024 * 1024;
//     if (file.size > maxSize) return;

//     if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
//     setPendingFile(file);
//     setPendingPreviewUrl(URL.createObjectURL(file));
//     setShowFileUpload(false);
//     // Reset input so same file can be re-selected
//     e.target.value = '';
//   };

//   const clearAttachment = () => {
//     setPendingFile(null);
//     if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
//     setPendingPreviewUrl('');
//     setShowFileUpload(false);
//   };

//   // ── Send ──────────────────────────────────────────────────────────────────
//   const sendMessage = async () => {
//     if (!inputValue.trim() && !pendingFile) return;
//     if (!socket) return;

//     setIsUploading(true);
//     let fileUrl = '';

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
//           body: JSON.stringify({ fileName: pendingFile.name, fileType: pendingFile.type, endpoint: uploadEndpoint, fileData }),
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

//     const tempId = `temp-${Date.now()}`;
//     const optimisticMessage = {
//       id: tempId,
//       content: inputValue,
//       fileUrl: fileUrl || null,
//       channelId,
//       memberId: currentMember?.id,
//       member: { ...currentMember, user: session?.user },
//       reactions: [],
//       bookmarks: [],
//       createdAt: new Date().toISOString(),
//       parentId: replyingTo?.id || null
//     };

//     setMessages(prev => [...prev, optimisticMessage]);
//     const sentContent = inputValue;
//     setInputValue('');
//     clearAttachment();
//     setReplyingTo(null);
//     scrollToBottom();

//     try {
//       const res = await fetch('/api/socket/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           content: sentContent,
//           fileUrl: fileUrl || undefined,
//           channelId,
//           serverId,
//           parentId: optimisticMessage.parentId,
//           tempId
//         })
//       });
//       if (!res.ok) throw new Error('Failed to send');
//       const savedMessage = await res.json();
//       setMessages(prev => prev.map(m => m.id === tempId ? savedMessage : m));
//     } catch (error) {
//       console.error('Failed to send:', error);
//       setMessages(prev => prev.filter(m => m.id !== tempId));
//       setInputValue(sentContent);
//     }
//   };

//   // ── Edit ──────────────────────────────────────────────────────────────────
//   const deleteMessage = async (messageId: string) => {
//   try {
//     const res = await fetch(`/api/messages/${messageId}`, {
//       method: "DELETE",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ serverId })   // serverId from your component state
//     });
 
//     if (!res.ok) throw new Error("Failed");
 
//     // Soft-delete: replace content locally to avoid a full refetch
//     setMessages((prev) =>
//       prev.map((m) =>
//         m.id === messageId
//           ? { ...m, deleted: true, content: "This message has been deleted.", fileUrl: null }
//           : m
//       )
//     );
//   } catch (error) {
//     console.error("Delete failed:", error);
//     // Optionally refetch to restore state
//     fetchMessages();
//   }
// };

// // ─── 4. editMessage ──────────────────────────────────────────────────────────
 
// const editMessage = async (messageId: string, newContent: string) => {
//   try {
//     const res = await fetch(`/api/messages/${messageId}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ content: newContent })
//     });
 
//     if (!res.ok) throw new Error("Edit failed");
 
//     const updated: Message = await res.json();
 
//     setMessages((prev) =>
//       prev.map((m) => (m.id === messageId ? updated : m))
//     );
//   } catch (error) {
//     console.error("Edit failed:", error);
//   }
// };

//   // ── Share ─────────────────────────────────────────────────────────────────
//   const openShareModal = async (message: any) => {
//     setShareMessage(message);
//     setShareLoading(true);
//     try {
//       const res = await fetch(`/api/servers/${serverId}/share-targets`);
//       if (res.ok) {
//         const d = await res.json();
//         setShareTargets(d);
//       }
//     } catch (e) {
//       console.error('Failed to load share targets:', e);
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const shareToChannel = async (targetChannelId: string) => {
//     if (!shareMessage) return;
//     try {
//       await fetch('/api/socket/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           content: shareMessage.content,
//           fileUrl: shareMessage.fileUrl || undefined,
//           channelId: targetChannelId,
//           serverId,
//           forwardedFrom: shareMessage.id
//         })
//       });
//       setShareMessage(null);
//     } catch (e) {
//       console.error('Share failed:', e);
//     }
//   };

//   // ── Reactions & Bookmarks ─────────────────────────────────────────────────
//   const addReaction = async (messageId: string, emoji: string) => {
//     setMessages(prev => prev.map(msg => {
//       if (msg.id !== messageId) return msg;
//       const hasReaction = msg.reactions?.some((r: any) =>
//         r.emoji === emoji && r.member?.userId === session?.user?.id
//       );
//       return {
//         ...msg,
//         reactions: hasReaction
//           ? msg.reactions.filter((r: any) => !(r.emoji === emoji && r.member?.userId === session?.user?.id))
//           : [...(msg.reactions || []), { emoji, member: { userId: session?.user?.id, user: session?.user } }]
//       };
//     }));
//     try {
//       await fetch('/api/messages/reactions', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ messageId, emoji, serverId })
//       });
//     } catch { fetchMessages(); }
//   };

//   const toggleBookmark = async (messageId: string) => {
//     const message = messages.find(m => m.id === messageId);
//     const isBookmarked = message?.bookmarks?.some((b: any) => b.userId === session?.user?.id);
//     setMessages(prev => prev.map(msg => {
//       if (msg.id !== messageId) return msg;
//       const bookmarks = isBookmarked
//         ? (msg.bookmarks || []).filter((b: any) => b.userId !== session?.user?.id)
//         : [...(msg.bookmarks || []), { userId: session?.user?.id }];
//       return { ...msg, bookmarks };
//     }));
//     try {
//       await fetch('/api/messages/bookmark', {
//         method: isBookmarked ? 'DELETE' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ messageId })
//       });
//     } catch { fetchMessages(); }
//   };

//   // ── Group by date ─────────────────────────────────────────────────────────
//   const groupedMessages = messages.reduce((groups: any, message) => {
//     const date = format(new Date(message.createdAt), 'MMMM d, yyyy');
//     if (!groups[date]) groups[date] = [];
//     groups[date].push(message);
//     return groups;
//   }, {});

//   const isPdf = pendingFile?.type === 'application/pdf';

//   // ── Share modal filtered targets ──────────────────────────────────────────
//   const filteredChannels = shareTargets.channels.filter(c =>
//     c.name?.toLowerCase().includes(shareSearch.toLowerCase()) && c.id !== channelId
//   );
//   const filteredMembers = shareTargets.members.filter(m =>
//     m.user?.name?.toLowerCase().includes(shareSearch.toLowerCase()) &&
//     m.userId !== session?.user?.id
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <LazyLoader />
//       </div>
//     );
//   }

//   return (
//     // Key layout constraint: this container must be a fixed height flex column
//     // so internal scroll doesn't push the parent. Parent must give this a bounded height.
//     <div className="flex flex-col w-full h-full overflow-hidden dark:bg-[#060101] relative">

//       {/* ── Messages scroll area ─────────────────────────────────────────── */}
//       <div
//         ref={messagesContainerRef}
//         className="flex-1 min-h-0 overflow-y-auto scrollbar-thin2"
//       >
//         {Object.entries(groupedMessages).map(([date, msgs]: [string, any]) => (
//           <div key={date}>
//             <div className="flex items-center justify-center relative my-6">
//               <Separator />
//               <Badge variant="outline" className="text-xs absolute mx-auto inset-0 dark:bg-black -mt-3.5 text-[#B4B4B4] text-center justify-center items-center flex h-7 w-40 min-w-32 px-3 rounded-full">
//                 {date}
//               </Badge>
//             </div>
//             {msgs.map((message: any, idx: number) => {
//               const isCurrentUser =
//                 message.member?.userId === session?.user?.id ||
//                 message.member?.user?.id === session?.user?.id;
//               const showAvatar = idx === 0 || msgs[idx - 1]?.memberId !== message.memberId;
//               const isBookmarked = message.bookmarks?.some((b: any) => b.userId === session?.user?.id);
//               return (
//                 <MessageItem
//                   key={message.id}
//                   message={message}
//                   isCurrentUser={isCurrentUser}
//                   showAvatar={showAvatar}
//                   isBookmarked={isBookmarked}
//                   isReply={!!message.parentId}
//                   isReplyingToThis={replyingTo?.id === message.id}
//                   currentUserId={session?.user?.id}
//                   onReply={() => setReplyingTo(message)}
//                   onReact={addReaction}
//                   onBookmark={() => toggleBookmark(message.id)}
//                   onEdit={editMessage}
//                   onDelete={deleteMessage}
//                   onShare={openShareModal}
//                 />
//               );
//             })}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* ── Reply preview ────────────────────────────────────────────────── */}
//       {replyingTo && (
//         <div className="mx-4 mb-1 p-3 bg-zinc-800 rounded-lg border-l border-blue-500 flex-shrink-0">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 text-sm">
//               <Reply className="size-4 text-blue-500" />
//               <span className="text-zinc-400">Replying to</span>
//               <span className="text-white font-medium">{replyingTo.member?.user?.name}</span>
//               <span className="text-zinc-500 truncate max-w-[300px]">
//                 "{replyingTo.content?.substring(0, 60)}..."
//               </span>
//             </div>
//             <button type="button" onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white">
//               <X className="size-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── File selected — full-width preview overlay ───────────────────── */}
//       {pendingFile && (
//         <div className="mx-4 mb-1 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0 relative bg-zinc-900">
//           {!isPdf ? (
//             // Image: fill full container width, natural height capped
//             <div className="relative w-full" style={{ maxHeight: 320 }}>
//               <img
//                 src={pendingPreviewUrl}
//                 alt="preview"
//                 className="w-full object-contain"
//                 style={{ maxHeight: 320 }}
//               />
//               {/* Dismiss */}
//               <button
//                 type="button"
//                 onClick={clearAttachment}
//                 className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
//               >
//                 <X className="size-4" />
//               </button>
//               {/* File name badge */}
//               <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full truncate max-w-[60%]">
//                 {pendingFile.name}
//               </div>
//             </div>
//           ) : (
//             <div className="flex items-center gap-3 px-4 py-3">
//               <FileIcon className="size-8 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
//               <div className="flex flex-col min-w-0">
//                 <span className="text-sm text-white font-medium truncate">{pendingFile.name}</span>
//                 <span className="text-xs text-zinc-400">{(pendingFile.size / 1024).toFixed(1)} KB · PDF</span>
//               </div>
//               <button
//                 type="button"
//                 onClick={clearAttachment}
//                 className="ml-auto text-zinc-500 hover:text-red-400 transition-colors"
//               >
//                 <X className="size-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── File picker dropdown ─────────────────────────────────────────── */}
//       {showFileUpload && !pendingFile && (
//         <div className="mx-4 mb-1 p-3 rounded-lg border border-zinc-700 dark:bg-[#111111] flex items-center gap-3 flex-shrink-0">
//           <label className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors">
//             <Plus className="size-4" />
//             Choose File
//             <input
//               ref={fileInputRef}
//               type="file"
//               className="hidden"
//               accept="image/*,application/pdf"
//               onChange={handleFileSelect}
//             />
//           </label>
//           <span className="text-xs text-zinc-500"> Select Image or PDF</span>
//           <button type="button" onClick={() => setShowFileUpload(false)} className="ml-auto text-zinc-500 hover:text-white">
//             <X className="size-4" />
//           </button>
//         </div>
//       )}

//       {/* ── Input row ────────────────────────────────────────────────────── */}
//       <div className="flex items-center gap-2 rounded-lg border mx-4 mb-3 mt-1 border-zinc-800 p-2 flex-shrink-0">
//         <Button
//           variant="ghost"
//           size="icon"
//           className={`h-8 w-8 transition-colors ${showFileUpload ? 'text-blue-400' : ''}`}
//           onClick={() => {
//             if (pendingFile) { clearAttachment(); return; }
//             setShowFileUpload(prev => !prev);
//           }}
//           type="button"
//         >
//           {pendingFile || showFileUpload ? <X className="size-4" /> : <Plus className="size-4" />}
//         </Button>

//         <input
//           aria-label="Write a message"
//           ref={inputRef}
//           type="text"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
//           }}
//           placeholder={replyingTo ? 'Reply to message...' : 'Write a message...'}
//           className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 text-white placeholder-zinc-500"
//         />

//         <Popover>
//           <PopoverTrigger asChild>
//             <Button variant="ghost" size="icon" className="h-8 w-8">
//               <Smile className="size-4" />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-0" side="top">
//             <Picker data={data} onEmojiSelect={(emoji: any) => {
//               setInputValue(prev => prev + emoji.native);
//               inputRef.current?.focus();
//             }} />
//           </PopoverContent>
//         </Popover>

//         <Button
//           onClick={sendMessage}
//           size="icon"
//           disabled={(!inputValue.trim() && !pendingFile) || isUploading}
//           className={`h-8 w-8 transition-colors ${
//             (inputValue.trim() || pendingFile) && !isUploading
//               ? 'bg-blue-600 hover:bg-blue-700'
//               : 'bg-zinc-700 cursor-not-allowed'
//           }`}
//         >
//           {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
//         </Button>
//       </div>

//       {/* ── Share Modal ──────────────────────────────────────────────────── */}
//       <Dialog open={!!shareMessage} onOpenChange={(o) => !o && setShareMessage(null)}>
//         <DialogContent className="dark:bg-[#111111] border-zinc-800 max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-white flex items-center gap-2">
//               <Forward className="size-4 text-blue-400" />
//               Forward Message
//             </DialogTitle>
//             <DialogDescription className="text-zinc-500 text-xs truncate">
//               "{shareMessage?.content?.substring(0, 80) || (shareMessage?.fileUrl ? '📎 Attachment' : '')}"
//             </DialogDescription>
//           </DialogHeader>

//           <input
//             type="text"
//             placeholder="Search channels or members..."
//             value={shareSearch}
//             onChange={e => setShareSearch(e.target.value)}
//             className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
//           />

//           {shareLoading ? (
//             <div className="flex items-center justify-center py-8">
//               <Loader2 className="size-5 animate-spin text-zinc-400" />
//             </div>
//           ) : (
//             <ScrollArea className="max-h-64">
//               {filteredChannels.length > 0 && (
//                 <div className="mb-3">
//                   <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 px-1">Channels</p>
//                   {filteredChannels.map(ch => (
//                     <button
//                       key={ch.id}
//                       type="button"
//                       onClick={() => shareToChannel(ch.id)}
//                       className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left transition-colors group"
//                     >
//                       <div className="size-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center flex-shrink-0">
//                         <Hash className="size-4 text-zinc-400" />
//                       </div>
//                       <span className="text-sm text-white">{ch.name}</span>
//                     </button>
//                   ))}
//                 </div>
//               )}
//               {filteredMembers.length > 0 && (
//                 <div>
//                   <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 px-1">Members</p>
//                   {filteredMembers.map(m => (
//                     <button
//                       key={m.id}
//                       type="button"
//                       onClick={() => {
//                         // Forward as DM — adapt to your DM conversation API
//                         console.log('Forward to member DM:', m.userId);
//                         setShareMessage(null);
//                       }}
//                       className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left transition-colors"
//                     >
//                       <Avatar className="size-8 flex-shrink-0">
//                         <AvatarImage src={m.user?.image} />
//                         <AvatarFallback>{m.user?.name?.[0] || '?'}</AvatarFallback>
//                       </Avatar>
//                       <span className="text-sm text-white">{m.user?.name}</span>
//                     </button>
//                   ))}
//                 </div>
//               )}
//               {filteredChannels.length === 0 && filteredMembers.length === 0 && (
//                 <p className="text-center text-zinc-500 text-sm py-8">No results found</p>
//               )}
//             </ScrollArea>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// // ─── MessageItem ─────────────────────────────────────────────────────────────

// const MessageItem = ({
//   message,
//   isCurrentUser,
//   showAvatar,
//   isBookmarked,
//   isReply,
//   isReplyingToThis,
//   currentUserId,
//   onReply,
//   onReact,
//   onBookmark,
//   onEdit,
//   onDelete,
//   onShare,
// }: any) => {
//   const [showActions, setShowActions] = useState(false);
//   const [imageError, setImageError] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editValue, setEditValue] = useState(message.content || '');
//   const [confirmDelete, setConfirmDelete] = useState(false);
//   const editInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (isEditing) editInputRef.current?.focus();
//   }, [isEditing]);

//   const fileUrl: string | undefined = message.fileUrl;
//   const fileExt = fileUrl?.split('.').pop()?.toLowerCase();
//   const fileIsPdf = fileExt === 'pdf';
//   const fileIsImage = fileUrl && !fileIsPdf;

//   const reactionCounts = message.reactions?.reduce((acc: any, r: any) => {
//     const e = r.emoji;
//     if (!acc[e]) acc[e] = { count: 0, userIds: [] };
//     acc[e].count++;
//     acc[e].userIds.push(r.member?.userId || r.memberId);
//     return acc;
//   }, {}) || {};

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
//       className={`group hover:dark:bg-[#222222] pt-2 pb-3 px-6 flex gap-3 relative ${
//         isReplyingToThis ? 'ring-2 ring-blue-500 rounded-lg bg-blue-500/10' : ''
//       }`}
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => { setShowActions(false); setConfirmDelete(false); }}
//     >
//       {showAvatar ? (
//         <Avatar className="size-8 mt-1.5 flex-shrink-0">
//           <AvatarImage src={message.member?.user?.image} />
//           <AvatarFallback>{message.member?.user?.name?.[0] || '?'}</AvatarFallback>
//         </Avatar>
//       ) : <div className="w-8 flex-shrink-0" />}

//       <div className="flex-1 min-w-0 flex flex-col">
//         {showAvatar && (
//           <div className="flex items-center gap-2 mb-0.5">
//             <span className="font-semibold text-sm text-white">{message.member?.user?.name || 'Unknown'}</span>
//             <span className="text-xs text-zinc-500">{format(new Date(message.createdAt), 'h:mm a')}</span>
//             {message.updatedAt && message.updatedAt !== message.createdAt && (
//               <span className="text-xs text-zinc-600 italic">(edited)</span>
//             )}
//           </div>
//         )}

//         {isReply && (
//           <div className="flex items-center gap-1 mb-1 text-xs text-blue-400">
//             <Reply className="size-3" />
//             <span>Reply</span>
//           </div>
//         )}

//         {/* Content — normal or edit mode */}
//         {isEditing ? (
//           <div className="flex items-center gap-2 mt-0.5">
//             <input
//               ref={editInputRef}
//               value={editValue}
//               onChange={e => setEditValue(e.target.value)}
//               onKeyDown={e => {
//                 if (e.key === 'Enter') { e.preventDefault(); handleEditSubmit(); }
//                 if (e.key === 'Escape') setIsEditing(false);
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
//           <div className="text-white">
//             {message.content && (
//               <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
//             )}

//             {/* File attachment in message */}
//             {fileUrl && (
//               <div className="mt-1.5">
//                 {fileIsImage && !imageError && (
//                   <div className="relative rounded-lg overflow-hidden border border-zinc-700 inline-block max-w-xs">
//                     <Image
//                       src={fileUrl}
//                       alt="attachment"
//                       width={320}
//                       height={240}
//                       unoptimized
//                       className="object-contain w-full h-auto max-h-64"
//                       onError={() => setImageError(true)}
//                     />
//                   </div>
//                 )}
//                 {fileIsImage && imageError && (
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs max-w-xs">
//                     <ImageIcon className="size-4 flex-shrink-0" />
//                     <span>Image unavailable</span>
//                   </div>
//                 )}
//                 {fileIsPdf && (
//                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 max-w-xs">
//                     <FileIcon className="size-5 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
//                     <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline truncate">
//                       {fileUrl.split('/').pop()}
//                     </a>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Reactions */}
//             {Object.entries(reactionCounts).length > 0 && (
//               <div className="flex flex-wrap gap-1 mt-1.5">
//                 {Object.entries(reactionCounts).map(([emoji, d]: [string, any]) => (
//                   <button
//                     key={emoji}
//                     type="button"
//                     onClick={() => onReact(message.id, emoji)}
//                     className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
//                       d.userIds?.includes(currentUserId) ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20'
//                     }`}
//                   >
//                     <span>{emoji}</span>
//                     <span className="font-medium">{d.count}</span>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Hover action bar ──────────────────────────────────────────────── */}
//       {!isEditing && (
//         <div className={`
//           absolute right-4 -top-3
//           flex items-center gap-0.5
//           ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}
//           transition-all duration-150
//           border dark:bg-[#111111] border-[#484848] rounded-lg p-1 z-10
//         `}>
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onReply}>
//                   <Reply className="size-3" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>Reply</TooltipContent>
//             </Tooltip>

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

//             {/* Edit — only own messages */}
//             {isCurrentUser && message.content && (
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white"
//                     onClick={() => { setEditValue(message.content); setIsEditing(true); }}>
//                     <Pencil className="size-3" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>Edit</TooltipContent>
//               </Tooltip>
//             )}

//             {/* Delete — only own messages */}
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
//                 <TooltipContent>{confirmDelete ? 'Click again to confirm' : 'Delete'}</TooltipContent>
//               </Tooltip>
//             )}

//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className={`h-6 w-6 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-400'}`}
//                   onClick={onBookmark}
//                 >
//                   <Bookmark className={`size-3 ${isBookmarked ? 'fill-current' : ''}`} />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</TooltipContent>
//             </Tooltip>

//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white"
//                   onClick={() => onShare(message)}>
//                   <Share2 className="size-3" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>Forward</TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       )}
//     </div>
//   );
// };

"use client";

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import {
  Send, Smile, Plus, X, Reply, Bookmark, Share2,
  FileIcon, ImageIcon, Pencil, Trash2, Check, Loader2,
  Forward, Hash, ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/animate-ui/components/animate/tooltip';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import LazyLoader from '@/components/loader/lazyloader';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface ChatInterfaceProps {
  channelId: string;
  serverId: string;
  type: 'channel' | 'conversation';
  currentMember: any;
}

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|ogg)$/i;

export const ClickUpChatInterface: React.FC<ChatInterfaceProps> = ({
  channelId,
  serverId,
  type,
  currentMember
}) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  // File attachment — deferred upload flow
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const uploadEndpoint: 'messageFile' | 'serverImage' = 'messageFile';

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxType, setLightboxType] = useState<'image' | 'video' | 'pdf'>('image');

  // Share modal
  const [shareMessage, setShareMessage] = useState<any>(null);
  const [shareTargets, setShareTargets] = useState<{ channels: any[]; members: any[] }>({ channels: [], members: [] });
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSearch, setShareSearch] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ── Ref map for scroll-to-parent ─────────────────────────────────────────
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sentMessageIds = useRef<Set<string>>(new Set());


  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const socketInstance = io({
      path: '/api/socket/io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketInstance.on('connect', () => {
      socketInstance.emit('join_channel', channelId);
    });
    socketInstance.on('connect_error', (err) => {
      console.error('[CLIENT] Connection error:', err.message);
    });
    setSocket(socketInstance);
    return () => {
      socketInstance.emit('leave_channel', channelId);
      socketInstance.disconnect();
    };
  }, [channelId]);

  // ── Fetch messages ────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = type === 'channel'
        ? `/api/messages?channelId=${channelId}`
        : `/api/direct-messages?conversationId=${channelId}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const d = await res.json();
        setMessages(d.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [channelId, type]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ── Scroll to bottom after first load ────────────────────────────────────
  useLayoutEffect(() => {
    if (!loading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }
  }, [loading]);

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
  setMessages(prev => {
    // 1. Already have this exact ID — covers both:
    //    a) Our own message that came back via API response (sentMessageIds)
    //    b) Any other duplicate
    if (prev.some(m => m.id === message.id)) return prev;

    // 2. Replace temp by optimisticId (sent in POST body, echoed by server)
    if (message.optimisticId) {
      const ti = prev.findIndex(m => m.id === message.optimisticId);
      if (ti !== -1) {
        const next = [...prev];
        next[ti] = message;
        return next;
      }
    }

    // 3. Fallback temp match (for messages without optimisticId echo)
    const tempIndex = prev.findIndex(m =>
      m.id?.startsWith('temp-') &&
      m.content === message.content &&
      m.memberId === message.memberId
    );
    if (tempIndex !== -1) {
      const next = [...prev];
      next[tempIndex] = message;
      return next;
    }

    // 4. New message from another user
    return [...prev, message];
  });
  scrollToBottom();
};

    const handleEditedMessage = (message: any) => {
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, ...message } : m));
    };

    const handleDeletedMessage = (d: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m.id !== d.messageId));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_edited', handleEditedMessage);
    socket.on('message_deleted', handleDeletedMessage);

    socket.on('message_reaction', (d: any) => {
      setMessages(prev => prev.map(msg =>
        msg.id === d.messageId ? { ...msg, reactions: d.reactions } : msg
      ));
    });

    socket.on('message_bookmark', (d: any) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id !== d.messageId) return msg;
        const bookmarks = d.bookmarked
          ? [...(msg.bookmarks || []), { userId: d.userId }]
          : (msg.bookmarks || []).filter((b: any) => b.userId !== d.userId);
        return { ...msg, bookmarks };
      }));
    });

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_edited', handleEditedMessage);
      socket.off('message_deleted', handleDeletedMessage);
      socket.off('message_reaction');
      socket.off('message_bookmark');
    };
  }, [socket]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 99);
  };

  // ── Scroll to a specific message (reply click) ────────────────────────────
  const scrollToMessage = (messageId: string) => {
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('!bg-blue-500/20');
      setTimeout(() => el.classList.remove('!bg-blue-500/20'), 1500);
    }
  };

  // ── Lightbox ──────────────────────────────────────────────────────────────
  const openLightbox = (url: string) => {
    if (IMAGE_EXT.test(url)) { setLightboxType('image'); setLightboxUrl(url); }
    else if (VIDEO_EXT.test(url)) { setLightboxType('video'); setLightboxUrl(url); }
    else { setLightboxType('pdf'); setLightboxUrl(url); }
  };

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return;
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(file);
    setPendingPreviewUrl(URL.createObjectURL(file));
    setShowFileUpload(false);
    e.target.value = '';
  };

  const clearAttachment = () => {
    setPendingFile(null);
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingPreviewUrl('');
    setShowFileUpload(false);
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
  if (!inputValue.trim() && !pendingFile) return;
  if (!socket) return;

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
          endpoint: uploadEndpoint,
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

  const tempId = `temp-${Date.now()}`;
  const optimisticMessage = {
    id: tempId,
    content: inputValue,
    fileUrl: fileUrl || null,
    channelId,
    memberId: currentMember?.id,
    member: { ...currentMember, user: session?.user },
    reactions: [],
    bookmarks: [],
    createdAt: new Date().toISOString(),
    parentId: replyingTo?.id || null,
    parent: replyingTo || null,
  };

  setMessages(prev => [...prev, optimisticMessage]);
  const sentContent = inputValue;
  setInputValue('');
  clearAttachment();
  setReplyingTo(null);
  scrollToBottom();

  try {
    const res = await fetch('/api/socket/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: sentContent,
        fileUrl: fileUrl || undefined,
        channelId,
        serverId,
        parentId: optimisticMessage.parentId,
        tempId, // echoed back as optimisticId by the server
      })
    });

    if (!res.ok) throw new Error('Failed to send');

    const savedMessage = await res.json();

    // KEY FIX: update state with the real message.
    // Because prev.some(m => m.id === message.id) in handleNewMessage
    // will now return true for this ID, the socket broadcast is ignored.
    setMessages(prev => prev.map(m =>
      m.id === tempId
        ? { ...savedMessage, parent: savedMessage.parent || optimisticMessage.parent }
        : m
    ));

  } catch (error) {
    console.error('Failed to send:', error);
    setMessages(prev => prev.filter(m => m.id !== tempId));
    setInputValue(sentContent);
  }
};

  // ── Edit ──────────────────────────────────────────────────────────────────
  const editMessage = async (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, content: newContent, updatedAt: new Date().toISOString() } : m
    ));
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      if (!res.ok) throw new Error('Edit failed');
      const updated = await res.json();
      setMessages(prev => prev.map(m => m.id === messageId ? updated : m));
    } catch (error) {
      console.error('Edit failed:', error);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId })
      });
      if (!res.ok) throw new Error('Failed');
      setMessages(prev =>
        prev.map(m => m.id === messageId
          ? { ...m, deleted: true, content: 'This message has been deleted.', fileUrl: null }
          : m
        )
      );
    } catch (error) {
      console.error('Delete failed:', error);
      fetchMessages();
    }
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const openShareModal = async (message: any) => {
    setShareMessage(message);
    setShareLoading(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/share-targets`);
      if (res.ok) {
        const d = await res.json();
        setShareTargets(d);
      }
    } catch (e) { console.error('Failed to load share targets:', e); }
    finally { setShareLoading(false); }
  };

  const shareToChannel = async (targetChannelId: string) => {
    if (!shareMessage) return;
    try {
      await fetch('/api/socket/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: shareMessage.content,
          fileUrl: shareMessage.fileUrl || undefined,
          channelId: targetChannelId,
          serverId,
          forwardedFrom: shareMessage.id
        })
      });
      setShareMessage(null);
    } catch (e) { console.error('Share failed:', e); }
  };

  // ── Reactions & Bookmarks ─────────────────────────────────────────────────
  const addReaction = async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      const hasReaction = msg.reactions?.some((r: any) =>
        r.emoji === emoji && r.member?.userId === session?.user?.id
      );
      return {
        ...msg,
        reactions: hasReaction
          ? msg.reactions.filter((r: any) => !(r.emoji === emoji && r.member?.userId === session?.user?.id))
          : [...(msg.reactions || []), { emoji, member: { userId: session?.user?.id, user: session?.user } }]
      };
    }));
    try {
      await fetch('/api/messages/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji, serverId })
      });
    } catch { fetchMessages(); }
  };

  const toggleBookmark = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    const isBookmarked = message?.bookmarks?.some((b: any) => b.userId === session?.user?.id);
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      const bookmarks = isBookmarked
        ? (msg.bookmarks || []).filter((b: any) => b.userId !== session?.user?.id)
        : [...(msg.bookmarks || []), { userId: session?.user?.id }];
      return { ...msg, bookmarks };
    }));
    try {
      await fetch('/api/messages/bookmark', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });
    } catch { fetchMessages(); }
  };

  // ── Group by date ─────────────────────────────────────────────────────────
  const groupedMessages = messages.reduce((groups: any, message) => {
    const date = format(new Date(message.createdAt), 'MMMM d, yyyy');
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  const isPdf = pendingFile?.type === 'application/pdf';

  const filteredChannels = shareTargets.channels.filter(c =>
    c.name?.toLowerCase().includes(shareSearch.toLowerCase()) && c.id !== channelId
  );
  const filteredMembers = shareTargets.members.filter(m =>
    m.user?.name?.toLowerCase().includes(shareSearch.toLowerCase()) &&
    m.userId !== session?.user?.id
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LazyLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden dark:bg-[#060101] relative">

      {/* ── Messages scroll area ─────────────────────────────────────────── */}
      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-thin2">
        {Object.entries(groupedMessages).map(([date, msgs]: [string, any]) => (
          <div key={date}>
            <div className="flex items-center justify-center relative my-6">
              <Separator />
              <Badge variant="outline" className="text-xs absolute mx-auto inset-0 dark:bg-black -mt-3.5 text-[#B4B4B4] text-center justify-center items-center flex h-7 w-40 min-w-32 px-3 rounded-full">
                {date}
              </Badge>
            </div>
            {msgs.map((message: any, idx: number) => {
              const isCurrentUser =
                message.member?.userId === session?.user?.id ||
                message.member?.user?.id === session?.user?.id;
              const showAvatar = idx === 0 || msgs[idx - 1]?.memberId !== message.memberId;
              const isBookmarked = message.bookmarks?.some((b: any) => b.userId === session?.user?.id);
              return (
                <div
                  key={message.id}
                  ref={el => { messageRefs.current[message.id] = el; }}
                  className="transition-colors duration-500 rounded-xl"
                >
                  <MessageItem
                    message={message}
                    isCurrentUser={isCurrentUser}
                    showAvatar={showAvatar}
                    isBookmarked={isBookmarked}
                    isReplyingToThis={replyingTo?.id === message.id}
                    currentUserId={session?.user?.id}
                    onReply={() => setReplyingTo(message)}
                    onReact={addReaction}
                    onBookmark={() => toggleBookmark(message.id)}
                    onEdit={editMessage}
                    onDelete={deleteMessage}
                    onShare={openShareModal}
                    onScrollToParent={scrollToMessage}
                    onOpenFile={openLightbox}
                  />
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Reply preview ────────────────────────────────────────────────── */}
      {replyingTo && (
        <div className="mx-4 mb-1 flex-shrink-0 rounded-xl overflow-hidden border-l-2 border-blue-500 bg-zinc-900/80">
          <div className="flex items-center justify-between px-3 py-2 gap-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <Reply className="size-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-400 truncate">{replyingTo.member?.user?.name}</p>
                <p className="text-xs text-zinc-400 truncate">
                  {replyingTo.fileUrl && !replyingTo.content ? '📎 Attachment' : replyingTo.content?.substring(0, 60)}
                </p>
              </div>
              {replyingTo.fileUrl && IMAGE_EXT.test(replyingTo.fileUrl) && (
                <div className="size-8 rounded overflow-hidden flex-shrink-0 ml-auto">
                  <img src={replyingTo.fileUrl} alt="" className="size-full object-cover" />
                </div>
              )}
            </div>
            <button type="button" onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white flex-shrink-0">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── File selected — full-width preview ───────────────────────────── */}
      {pendingFile && (
        <div className="mx-4 mb-1 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0 relative bg-zinc-900">
          {!isPdf ? (
            <div className="relative w-full" style={{ maxHeight: 320 }}>
              <img src={pendingPreviewUrl} alt="preview" className="w-full object-contain" style={{ maxHeight: 320 }} />
              <button type="button" onClick={clearAttachment}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1">
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

      {/* ── File picker ──────────────────────────────────────────────────── */}
      {showFileUpload && !pendingFile && (
        <div className="mx-4 mb-1 p-3 rounded-lg border border-zinc-700 dark:bg-[#111111] flex items-center gap-3 flex-shrink-0">
          <label className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors">
            <Plus className="size-4" />
            Choose File
            <input ref={fileInputRef} type="file" className="hidden"
              accept="image/*,application/pdf" onChange={handleFileSelect} />
          </label>
          <span className="text-xs text-zinc-500">Select Image or PDF</span>
          <button type="button" onClick={() => setShowFileUpload(false)} className="ml-auto text-zinc-500 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ── Input row ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 rounded-lg border mx-4 mb-3 mt-1 border-zinc-800 p-2 flex-shrink-0">
        <Button
          variant="ghost" size="icon"
          className={`h-8 w-8 transition-colors ${showFileUpload ? 'text-blue-400' : ''}`}
          onClick={() => { if (pendingFile) { clearAttachment(); return; } setShowFileUpload(p => !p); }}
          type="button"
        >
          {pendingFile || showFileUpload ? <X className="size-4" /> : <Plus className="size-4" />}
        </Button>

        <input
          aria-label="Write a message"
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            if (e.key === 'Escape') setReplyingTo(null);
          }}
          placeholder={replyingTo ? 'Reply to message...' : 'Write a message...'}
          className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 text-white placeholder-zinc-500"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" side="top">
            <Picker data={data} onEmojiSelect={(emoji: any) => {
              setInputValue(prev => prev + emoji.native);
              inputRef.current?.focus();
            }} />
          </PopoverContent>
        </Popover>

        <Button
          onClick={sendMessage}
          size="icon"
          disabled={(!inputValue.trim() && !pendingFile) || isUploading}
          className={`h-8 w-8 transition-colors ${
            (inputValue.trim() || pendingFile) && !isUploading
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-zinc-700 cursor-not-allowed'
          }`} >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>

      {/* ── Share Modal ──────────────────────────────────────────────────── */}
      <Dialog open={!!shareMessage} onOpenChange={(o) => !o && setShareMessage(null)}>
        <DialogContent className="dark:bg-[#111111] border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Forward className="size-4 text-blue-400" />
              Forward Message
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs truncate">
              "{shareMessage?.content?.substring(0, 80) || (shareMessage?.fileUrl ? '📎 Attachment' : '')}"
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            placeholder="Search channels or members..."
            value={shareSearch}
            onChange={e => setShareSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          {shareLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              {filteredChannels.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 px-1">Channels</p>
                  {filteredChannels.map(ch => (
                    <button key={ch.id} type="button" onClick={() => shareToChannel(ch.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left transition-colors group">
                      <div className="size-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                        <Hash className="size-4 text-zinc-400" />
                      </div>
                      <span className="text-sm text-white">{ch.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {filteredMembers.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 px-1">Members</p>
                  {filteredMembers.map(m => (
                    <button key={m.id} type="button"
                      onClick={() => { console.log('Forward to member DM:', m.userId); setShareMessage(null); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left transition-colors">
                      <Avatar className="size-8 flex-shrink-0">
                        <AvatarImage src={m.user?.image} />
                        <AvatarFallback>{m.user?.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white">{m.user?.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {filteredChannels.length === 0 && filteredMembers.length === 0 && (
                <p className="text-center text-zinc-500 text-sm py-8">No results found</p>
              )}
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <Dialog open={!!lightboxUrl} onOpenChange={o => !o && setLightboxUrl(null)}>
        <DialogContent className="max-w-3xl dark:bg-zinc-950 border-zinc-800 p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[200px] max-h-[80vh]">
            {lightboxType === 'image' && lightboxUrl && (
              <Image src={lightboxUrl} alt="Preview" width={900} height={700} unoptimized
                className="max-h-[78vh] w-auto object-contain rounded-lg" />
            )}
            {lightboxType === 'video' && lightboxUrl && (
              <video src={lightboxUrl} controls autoPlay className="max-h-[78vh] w-full rounded-lg" />
            )}
            {lightboxType === 'pdf' && lightboxUrl && (
              <div className="flex flex-col items-center gap-4 py-8">
                <FileIcon className="size-16 fill-indigo-200 stroke-indigo-400" />
                <p className="text-sm text-zinc-300 truncate max-w-[300px]">{lightboxUrl.split('/').pop()}</p>
                <a href={lightboxUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                  Open PDF
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── MessageItem ──────────────────────────────────────────────────────────────

const MessageItem = ({
  message, isCurrentUser, showAvatar, isBookmarked,
  isReplyingToThis, currentUserId,
  onReply, onReact, onBookmark, onEdit, onDelete, onShare,
  onScrollToParent, onOpenFile,
}: any) => {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content || '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isEditing) editInputRef.current?.focus(); }, [isEditing]);

  const fileUrl: string | undefined = message.fileUrl;
  const fileExt = fileUrl?.split('.').pop()?.toLowerCase();
  const fileIsPdf = fileExt === 'pdf';
  const fileIsVideo = !!fileUrl && VIDEO_EXT.test(fileUrl);
  const fileIsImage = !!fileUrl && IMAGE_EXT.test(fileUrl) && !fileIsPdf && !imageError;

  const reactionCounts = (message.reactions || []).reduce((acc: any, r: any) => {
    const e = r.emoji;
    if (!acc[e]) acc[e] = { count: 0, userIds: [] };
    acc[e].count++;
    acc[e].userIds.push(r.member?.userId || r.memberId);
    return acc;
  }, {});

  const handleEditSubmit = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === message.content) { setIsEditing(false); return; }
    onEdit(message.id, trimmed);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (confirmDelete) { onDelete(message.id); }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }
  };

  const isEdited = message.updatedAt && message.updatedAt !== message.createdAt;

  return (
    <div
      className={`group hover:dark:bg-[#222222] pt-2 pb-3 px-6 flex gap-3 relative transition-colors duration-500 ${
        isReplyingToThis ? 'ring-2 ring-blue-500 rounded-lg bg-blue-500/10' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setConfirmDelete(false); }}
    >
      {showAvatar ? (
        <Avatar className="size-8 mt-1.5 flex-shrink-0">
          <AvatarImage src={message.member?.user?.image} />
          <AvatarFallback>{message.member?.user?.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
      ) : <div className="w-8 flex-shrink-0" />}

      <div className="flex-1 min-w-0 flex flex-col">
        {showAvatar && (
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm text-white">{message.member?.user?.name || 'Unknown'}</span>
            <span className="text-xs text-zinc-500">{format(new Date(message.createdAt), 'h:mm a')}</span>
            {isEdited && <span className="text-xs text-zinc-600 italic">(edited)</span>}
          </div>
        )}

        {/* ── FIX: Reply parent context — always visible, clickable ─────── */}
        {message.parent && (
          <button
            type="button"
            onClick={() => onScrollToParent(message.parent.id)}
            className="flex items-start gap-1.5 mb-1.5 text-xs bg-zinc-800/60 hover:bg-zinc-800 rounded-lg px-2.5 py-1.5 border-l-2 border-blue-500/60 w-full text-left transition-colors group/reply"
          >
            {/* Thumbnail if parent had an image */}
            {message.parent?.fileUrl && IMAGE_EXT.test(message.parent.fileUrl) && (
              <div className="size-8 rounded overflow-hidden flex-shrink-0">
                <img src={message.parent.fileUrl} alt="" className="size-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-blue-300 group-hover/reply:text-blue-200 truncate">
                {message.parent?.member?.user?.name || 'Unknown'}
              </p>
              <p className="text-zinc-500 truncate leading-snug">
                {message.parent?.fileUrl && !message.parent?.content
                  ? '📎 Attachment'
                  : message.parent?.content?.substring(0, 80)}
              </p>
            </div>
          </button>
        )}

        {/* Fallback: legacy isReply flag without parent data */}
        {!message.parent && message.parentId && (
          <div className="flex items-center gap-1 mb-1 text-xs text-blue-400/60">
            <Reply className="size-3" />
            <span className="italic">reply</span>
          </div>
        )}

        {/* Content or edit mode */}
        {isEditing ? (
          <div className="flex items-center gap-2 mt-0.5">
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
          <div className="text-white">
            {message.content && (
              <p className={`text-sm whitespace-pre-wrap break-words ${message.deleted ? 'italic text-zinc-500' : ''}`}>
                {message.content}
              </p>
            )}

            {/* File attachment — clickable to open lightbox */}
            {fileUrl && !message.deleted && (
              <div className="mt-1.5">
                {fileIsImage && (
                  <button
                    type="button"
                    onClick={() => onOpenFile(fileUrl)}
                    className="relative rounded-lg overflow-hidden border border-zinc-700 inline-block max-w-xs group/img"
                  >
                    <Image src={fileUrl} alt="attachment" width={320} height={240} unoptimized
                      className="object-contain w-full h-auto max-h-64"
                      onError={() => setImageError(true)} />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                      <ZoomIn className="size-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )}
                {!fileIsImage && fileUrl && IMAGE_EXT.test(fileUrl) && imageError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs max-w-xs">
                    <ImageIcon className="size-4 flex-shrink-0" />
                    <span>Image unavailable</span>
                  </div>
                )}
                {fileIsVideo && (
                  <button type="button" onClick={() => onOpenFile(fileUrl)}
                    className="relative rounded-lg overflow-hidden border border-zinc-700 inline-block max-w-xs group/vid">
                    <video src={fileUrl} className="w-full max-h-48 object-contain rounded-lg" />
                    <div className="absolute inset-0 bg-black/30 group-hover/vid:bg-black/50 transition-colors flex items-center justify-center">
                      <ZoomIn className="size-6 text-white opacity-80" />
                    </div>
                  </button>
                )}
                {fileIsPdf && (
                  <button type="button" onClick={() => onOpenFile(fileUrl)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 max-w-xs hover:border-zinc-600 transition-colors">
                    <FileIcon className="size-5 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
                    <span className="text-xs text-indigo-400 hover:underline truncate">{fileUrl.split('/').pop()}</span>
                  </button>
                )}
              </div>
            )}

            {/* Reactions */}
            {Object.entries(reactionCounts).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {Object.entries(reactionCounts).map(([emoji, d]: [string, any]) => (
                  <button key={emoji} type="button" onClick={() => onReact(message.id, emoji)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                      d.userIds?.includes(currentUserId) ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20'
                    }`}>
                    <span>{emoji}</span>
                    <span className="font-medium">{d.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Hover action bar ──────────────────────────────────────────────── */}
      {!isEditing && !message.deleted && (
        <div className={`
          absolute right-4 -top-3
          flex items-center gap-0.5
          ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}
          transition-all duration-150
          border dark:bg-[#111111] border-[#484848] rounded-lg p-1 z-10
        `}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onReply}>
                  <Reply className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reply</TooltipContent>
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

            {isCurrentUser && message.content && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white"
                    onClick={() => { setEditValue(message.content); setIsEditing(true); }}>
                    <Pencil className="size-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
            )}

            {isCurrentUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon"
                    className={`h-6 w-6 transition-colors ${confirmDelete ? 'text-red-400 bg-red-400/10' : 'text-zinc-400 hover:text-red-400'}`}
                    onClick={handleDeleteClick}>
                    <Trash2 className="size-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{confirmDelete ? 'Click again to confirm' : 'Delete'}</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon"
                  className={`h-6 w-6 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-400'}`}
                  onClick={onBookmark}>
                  <Bookmark className={`size-3 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white"
                  onClick={() => onShare(message)}>
                  <Share2 className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Forward</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};
