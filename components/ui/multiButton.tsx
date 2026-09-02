

// "use client";

// import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import {
//   Maximize2, Minimize2, Send, Smile, Plus, X,
//   Reply, Bookmark, Loader2, ChevronDown, FileIcon,
//   ZoomIn, MessageSquare
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ChannelType } from "@prisma/client";
// import { useSession } from 'next-auth/react';
// import { format } from 'date-fns';
// import { io, Socket } from 'socket.io-client';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import {
//   Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
// } from '@/components/animate-ui/components/animate/tooltip';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle
// } from '@/components/ui/dialog';
// import {
//   DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import data from '@emoji-mart/data';
// import Picker from '@emoji-mart/react';
// import LazyLoader from '@/components/loader/lazyloader';
// import { FamilyButton } from "./familyButton";
// import Image from 'next/image';
// import { Paperclip } from '../animate-ui/icons/paperclip';

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface Channel { id: string; name: string; type: ChannelType; serverId: string; }
// interface User { id: string; name: string; imageUrl: string; email: string; }
// interface Member { id: string; role: string; userId: string; serverId: string; user: User; }
// interface ChatInterfaceProps {
//   channelId?: string;
//   serverId?: string;
//   type?: 'channel' | 'conversation';
//   currentMember?: Member | null;
// }

// const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
// const VIDEO_EXT = /\.(mp4|webm|mov|ogg)$/i;

// // ─── Collapsed preview ────────────────────────────────────────────────────────
// const CollapsedPreview = ({
//   messages, session, channel, hasChannel, isLoading
// }: {
//   messages: any[]; session: any; channel: any; hasChannel: boolean; isLoading: boolean;
// }) => {
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <Loader2 className="size-4 animate-spin text-zinc-500" />
//       </div>
//     );
//   }

//   if (!hasChannel) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full gap-1.5 px-4 text-center">
//         <MessageSquare className="size-7 text-zinc-600 opacity-50" />
//         <p className="text-[11px] text-zinc-500 font-medium">No channel found</p>
//       </div>
//     );
//   }

//   if (messages.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full gap-1.5 px-4 text-center">
//         <MessageSquare className="size-7 text-zinc-600 opacity-50" />
//         <p className="text-[11px] text-zinc-500">{channel ? `# ${channel.name}` : 'Chat'}</p>
//         <p className="text-[10px] text-zinc-600">No messages yet</p>
//       </div>
//     );
//   }

//  const preview = messages.slice(-6);
// return (
//   <div className="flex flex-col justify-end px-2 py-2 gap-1 overflow-x-auto overflow-y-auto">
//     {channel && (
//       <p className="text-[10px] text-zinc-600 font-medium mb-0.5"># {channel.name}</p>
//     )}
//     {preview.map((msg: any, index: number) => {
//       const isMe = msg.member?.userId === session?.user?.id || msg.member?.user?.id === session?.user?.id;
      
//       // Check if this is the last message from this member in the preview
//       const nextMsg = preview[index + 1];
//       const isLastFromMember = !nextMsg || nextMsg.member?.userId !== msg.member?.userId;

//       return (
//         <div 
//           key={msg.id} 
//           className={`flex items-start gap-1 py-1 ${isMe ? 'flex-row' : 'flex-row'}`}
//         >
//           {/* Avatar only on last message of each member's streak */}
//           {isLastFromMember ? (
//             <Avatar className="size-6 flex-shrink-0 mt-0.5">
//               <AvatarImage src={msg.member?.user?.image} />
//               <AvatarFallback className="text-[8px]">{msg.member?.user?.name?.[0] || '?'}</AvatarFallback>
//             </Avatar>
//           ) : (
//             <div className="size-6 flex-shrink-0" /> // Spacer to align content
//           )}

//           <div className="flex flex-col min-w-0 w-full">
//             {/* Name and time together, only on last message of streak */}
//             {isLastFromMember && (
//               <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5">
//                 <span className="font-medium dark:text-zinc-300">{msg.member?.user?.name}</span>
//                 <span>·</span>
//                 <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
//               </div>
//             )}
            
//             {/* Message content */}
//             <div className={`max-w-[16vw] px-2 py-0.5 hover:bg-[#EEE] hover:dark:bg-[#222] rounded-xl text-[12px] truncate leading-snug ${
//               isMe ? ' dark:text-zinc-300 rounded-tl-sm' : ' dark:text-zinc-300 rounded-tl-sm'
//             }`}>
//               {msg.fileUrl ? <div className="flex items-center gap-1">
//                <Paperclip animateOnHover className="size-3.5"/> Attachment
//               </div> : msg.content}
//             </div>
//           </div>
//         </div>
//       );
//     })}
//   </div>
// );
// }
// // ─── Chat panel — the actual chat UI rendered inside FamilyButton's children ──
// // NOTE: FamilyButton renders its children as a portal/popover when open.
// // We do NOT gate this on any `isOpen` state — FamilyButton controls visibility.
// const ChatPanel = ({
//   messages, loading, hasChannel, channel, channels, channelId,
//   serverId, member, session, router,
//   groupedMessages, replyingTo, setReplyingTo,
//   inputValue, setInputValue, inputRef,
//   sendMessage, isSending, isUploading,
//   addReaction, toggleBookmark,
//   pendingFile, pendingPreviewUrl, showFilePanel, setShowFilePanel,
//   clearAttachment, handleFileSelect, fileInputRef,
//   isExpanded, setIsExpanded,
//   handleChannelSwitch, openLightbox, messagesEndRef
// }: any) => {
//   const isPdf = pendingFile?.type === 'application/pdf';
//   const isVideo = pendingFile?.type?.startsWith('video/');

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.92, y: 12 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.92, y: 12 }}
//       transition={{ type: "spring", damping: 22, stiffness: 320 }}
//       className="rounded-xl shadow-2xl overflow-hidden flex flex-col bg-[#111] border border-zinc-800 w-[24.5rem] h-[600px]"
//     >
//       {/* ── Header ──────────────────────────────────────────────────────────── */}
//       <div className="bg-[#212021] text-white px-3 py-2 flex justify-between items-center border-b border-zinc-800 flex-shrink-0">
//         <div className="flex-1 min-w-0">
//           {channels.length > 1 ? (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <button type="button" className="flex items-center gap-1 hover:bg-zinc-800 rounded-md px-2 py-1 transition-colors">
//                   <h3 className="font-semibold text-sm truncate">
//                     {channel ? `# ${channel.name}` : 'Select channel'}
//                   </h3>
//                   <ChevronDown className="size-4 text-zinc-400 shrink-0" />
//                 </button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="start" className="w-56 bg-zinc-900 border-zinc-800">
//                 {channels.map((ch: Channel) => (
//                   <DropdownMenuItem
//                     key={ch.id}
//                     onClick={() => handleChannelSwitch(ch)}
//                     className={`cursor-pointer text-sm ${
//                       channelId === ch.id ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-300 hover:bg-zinc-800'
//                     }`}
//                   >
//                     <span className="truncate"># {ch.name}</span>
//                     {channelId === ch.id && <span className="ml-auto text-xs text-blue-400">●</span>}
//                   </DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           ) : (
//             <h3 className="font-semibold text-sm truncate px-2 py-1">
//               {channel ? `# ${channel.name}` : 'Chat'}
//             </h3>
//           )}
//           <p className="text-[11px] text-zinc-500 px-2">{messages.length} messages</p>
//         </div>
//         <div className="flex gap-x-1">
//           {/* <button type="button"
//             onClick={() => setIsExpanded((p: boolean) => !p)}
//             className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
//           >
//             {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
//           </button> */}
//           <button type="button"
//             onClick={() => serverId && channelId && router.push(`/servers/${serverId}/channels/${channelId}`)}
//             className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
//             title="Open full page"
//           >
//             <Maximize2 size={15} />
//           </button>
//         </div>
//       </div>

//       {/* ── Body ────────────────────────────────────────────────────────────── */}
//       <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#111]">
//         {!hasChannel ? (
//           <div className="flex flex-col items-center justify-center h-full text-zinc-500 px-6 text-center gap-3">
//             <MessageSquare className="size-10 opacity-30" />
//             <p className="text-sm font-medium">No channels available</p>
//             <p className="text-xs opacity-60">Ask your admin to create a channel</p>
//           </div>
//         ) : loading && messages.length === 0 ? (
//           <div className="flex justify-center items-center h-full">
//             <LazyLoader />
//           </div>
//         ) : (
//           <>
//             {/* Messages */}
//             <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin2 py-2">
//               {messages.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 py-16">
//                   <MessageSquare className="size-8 opacity-30" />
//                   <p className="text-xs">No messages yet</p>
//                   <p className="text-[11px] opacity-50">Be the first to say something!</p>
//                 </div>
//               ) : (
//                 Object.entries(groupedMessages).map(([date, msgs]: [string, any]) => (
//                   <div key={date}>
//                     <div className="flex items-center justify-center relative my-3">
//                       <Separator className="bg-zinc-800" />
//                       <Badge variant="outline"
//                         className="text-[10px] absolute mx-auto bg-[#1a1a1a] text-zinc-500 px-2 rounded-full border-zinc-700 h-5">
//                         {date}
//                       </Badge>
//                     </div>
//                     {msgs.map((message: any, idx: number) => {
//                       const isCurrentUser =
//                         message.member?.userId === session?.user?.id ||
//                         message.member?.user?.id === session?.user?.id;
//                       const showAvatar = idx === 0 || msgs[idx - 1]?.memberId !== message.memberId;
//                       const isBookmarked = message.bookmarks?.some((b: any) => b.userId === session?.user?.id);
//                       return (
//                         <MiniMessageItem
//                           key={message.id}
//                           message={message}
//                           isCurrentUser={isCurrentUser}
//                           showAvatar={showAvatar}
//                           isBookmarked={isBookmarked}
//                           isReplyingToThis={replyingTo?.id === message.id}
//                           currentUserId={session?.user?.id}
//                           onReply={() => setReplyingTo(message)}
//                           onReact={addReaction}
//                           onBookmark={() => toggleBookmark(message.id)}
//                           onOpenFile={openLightbox}
//                         />
//                       );
//                     })}
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Reply preview */}
//             {replyingTo && (
//               <div className="mx-3 mb-1 flex-shrink-0 rounded-lg overflow-hidden border-l-2 border-blue-500 bg-zinc-900">
//                 <div className="flex items-center justify-between px-2.5 py-1.5 gap-2">
//                   <div className="flex items-start gap-1.5 min-w-0 flex-1">
//                     <Reply className="size-3 text-blue-400 flex-shrink-0 mt-0.5" />
//                     <div className="min-w-0">
//                       <p className="text-[11px] font-semibold text-blue-400 truncate">
//                         {replyingTo.member?.user?.name}
//                       </p>
//                       <p className="text-[11px] text-zinc-400 truncate">
//                         {replyingTo.fileUrl && !replyingTo.content ? '📎 Attachment' : replyingTo.content?.substring(0, 50)}
//                       </p>
//                     </div>
//                     {replyingTo.fileUrl && IMAGE_EXT.test(replyingTo.fileUrl) && (
//                       <div className="size-7 rounded overflow-hidden flex-shrink-0 ml-auto">
//                         <img src={replyingTo.fileUrl} alt="" className="size-full object-cover" />
//                       </div>
//                     )}
//                   </div>
//                   <button type="button" onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white flex-shrink-0">
//                     <X className="size-3.5" />
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* File preview */}
//             {pendingFile && (
//               <div className="mx-3 mb-1 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0 bg-zinc-900 relative">
//                 {!isPdf && !isVideo ? (
//                   <div className="relative w-full" style={{ maxHeight: 180 }}>
//                     <img src={pendingPreviewUrl} alt="preview" className="w-full object-contain" style={{ maxHeight: 180 }} />
//                     <button type="button" onClick={clearAttachment}
//                       className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5">
//                       <X className="size-3.5" />
//                     </button>
//                     <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full truncate max-w-[55%]">
//                       {pendingFile.name}
//                     </div>
//                   </div>
//                 ) : isVideo ? (
//                   <div className="relative">
//                     <video src={pendingPreviewUrl} className="w-full max-h-32 object-contain" controls />
//                     <button type="button" onClick={clearAttachment}
//                       className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-0.5">
//                       <X className="size-3.5" />
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-2 px-3 py-2">
//                     <FileIcon className="size-6 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
//                     <div className="min-w-0">
//                       <p className="text-xs text-white font-medium truncate">{pendingFile.name}</p>
//                       <p className="text-[10px] text-zinc-400">{(pendingFile.size / 1024).toFixed(1)} KB</p>
//                     </div>
//                     <button type="button" onClick={clearAttachment} className="ml-auto text-zinc-500 hover:text-red-400">
//                       <X className="size-3.5" />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* File picker panel */}
//             {showFilePanel && !pendingFile && (
//               <div className="mx-3 mb-1 p-2.5 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center gap-2 flex-shrink-0">
//                 <label className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs transition-colors flex-shrink-0">
//                   <Plus className="size-3.5" />
//                   Choose File
//                   <input ref={fileInputRef} type="file" className="hidden"
//                     accept="image/*,video/*,application/pdf" onChange={handleFileSelect} />
//                 </label>
//                 <span className="text-[11px] text-zinc-500 truncate">Image, video or PDF</span>
//                 <button type="button" onClick={() => setShowFilePanel(false)} className="ml-auto text-zinc-500 hover:text-white flex-shrink-0">
//                   <X className="size-3.5" />
//                 </button>
//               </div>
//             )}

//             {/* Input */}
//             <div className="mx-3 mb-3 flex-shrink-0">
//               <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-2 py-1.5">
//                 <button
//                   type="button"
//                   onClick={() => { if (pendingFile) { clearAttachment(); return; } setShowFilePanel((p: boolean) => !p); }}
//                   className={`p-1 rounded-full hover:bg-zinc-800 transition-colors flex-shrink-0 ${
//                     showFilePanel ? 'text-blue-400' : 'text-zinc-400 hover:text-white'
//                   }`}
//                 >
//                   {pendingFile || showFilePanel ? <X className="size-4" /> : <Plus className="size-4" />}
//                 </button>

//                 <input
//                   ref={inputRef}
//                   aria-label="message-input"
//                   type="text"
//                   value={inputValue}
//                   onChange={e => setInputValue(e.target.value)}
//                   onKeyDown={e => {
//                     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
//                     if (e.key === 'Escape') setReplyingTo(null);
//                   }}
//                   placeholder={replyingTo ? 'Reply…' : 'Write a message…'}
//                   disabled={isSending}
//                   className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1 text-white placeholder-zinc-500 disabled:opacity-50 min-w-0"
//                 />

//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <button type="button" className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 flex-shrink-0">
//                       <Smile className="size-4" />
//                     </button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" side="top" align="end">
//                     <Picker data={data} onEmojiSelect={(emoji: any) => {
//                       setInputValue((prev: string) => prev + emoji.native);
//                       inputRef.current?.focus();
//                     }} />
//                   </PopoverContent>
//                 </Popover>

//                 <Button
//                   onClick={sendMessage}
//                   disabled={(!inputValue.trim() && !pendingFile) || isSending || isUploading}
//                   size="icon"
//                   className={`size-7 flex-shrink-0 transition-colors ${
//                     (inputValue.trim() || pendingFile) && !isSending && !isUploading
//                       ? 'bg-blue-600 hover:bg-blue-700'
//                       : 'bg-zinc-700 cursor-not-allowed'
//                   }`}
//                 >
//                   {isSending || isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
//                 </Button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// // ─── Main export ──────────────────────────────────────────────────────────────
// export const FamilyButtonDemo: React.FC<ChatInterfaceProps> = ({
//   channelId: propChannelId,
//   serverId: propServerId,
//   currentMember: propCurrentMember
// }) => {
//   const { data: session } = useSession();
//   const router = useRouter();

//   const [messages, setMessages] = useState<any[]>([]);
//   const [inputValue, setInputValue] = useState('');
//   const [replyingTo, setReplyingTo] = useState<any>(null);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [channel, setChannel] = useState<Channel | null>(null);
//   const [member, setMember] = useState<Member | null>(propCurrentMember || null);
//   const [serverId, setServerId] = useState<string | null>(propServerId || null);
//   const [channelId, setChannelId] = useState<string | null>(propChannelId || null);
//   const [channels, setChannels] = useState<Channel[]>([]);
//   const [isSending, setIsSending] = useState(false);
//   const [hasChannel, setHasChannel] = useState(true);
//   const [queryLoading, setQueryLoading] = useState(true);

//   const [pendingFile, setPendingFile] = useState<File | null>(null);
//   const [pendingPreviewUrl, setPendingPreviewUrl] = useState('');
//   const [isUploading, setIsUploading] = useState(false);
//   const [showFilePanel, setShowFilePanel] = useState(false);

//   const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
//   const [lightboxType, setLightboxType] = useState<'image' | 'video' | 'pdf'>('image');

//   const inputRef = useRef<HTMLInputElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const socketInitRef = useRef(false);
//   const joinedChannelRef = useRef<string | null>(null);

//   // ── Socket ──────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (socketInitRef.current) return;
//     const s = io({ path: '/api/socket/io', transports: ['websocket', 'polling'], reconnection: true, reconnectionAttempts: 5 });
//     s.on('connect', () => console.log('[CHAT WIDGET] Connected:', s.id));
//     s.on('connect_error', err => console.error('[CHAT WIDGET] Error:', err.message));
//     setSocket(s);
//     socketInitRef.current = true;
//     return () => { s.disconnect(); socketInitRef.current = false; };
//   }, []);

//   // ── Join channel ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!socket || !channelId) return;
//     if (joinedChannelRef.current && joinedChannelRef.current !== channelId) {
//       socket.emit('leave_channel', joinedChannelRef.current);
//     }
//     socket.emit('join_channel', channelId);
//     joinedChannelRef.current = channelId;
//   }, [socket, channelId]);

//   // ── Fetch messages ──────────────────────────────────────────────────────────
//   const fetchMessages = useCallback(async () => {
//     if (!channelId) return;
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/messages?channelId=${channelId}`);
//       if (!res.ok) throw new Error('Failed');
//       const d = await res.json();
//       setMessages(d.items || []);
//     } catch (e) { console.error(e); }
//     finally { setLoading(false); }
//   }, [channelId]);

//   useEffect(() => { if (channelId) fetchMessages(); }, [channelId, fetchMessages]);

//   // ── Scroll to bottom when messages load ────────────────────────────────────
//   useLayoutEffect(() => {
//     if (!loading && messages.length > 0 && messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
//     }
//   }, [loading, messages.length]);

//   // ── Socket listeners ────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!socket) return;
//     const onNew = (msg: any) => {
//       setMessages(prev => {
//         if (prev.some(m => m.id === msg.id)) return prev;
//         const ti = prev.findIndex(m => m.id?.startsWith('temp-') && m.content === msg.content && m.memberId === msg.memberId);
//         if (ti !== -1) { const n = [...prev]; n[ti] = msg; return n; }
//         return [...prev, msg];
//       });
//       setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
//     };
//     const onReact = (d: any) => setMessages(prev => prev.map(m => m.id === d.messageId ? { ...m, reactions: d.reactions } : m));
//     const onBookmark = (d: any) => setMessages(prev => prev.map(m => {
//       if (m.id !== d.messageId) return m;
//       const bookmarks = d.bookmarked ? [...(m.bookmarks || []), { userId: d.userId }] : (m.bookmarks || []).filter((b: any) => b.userId !== d.userId);
//       return { ...m, bookmarks };
//     }));
//     socket.on('new_message', onNew);
//     socket.on('message_reaction', onReact);
//     socket.on('message_bookmark', onBookmark);
//     return () => { socket.off('new_message', onNew); socket.off('message_reaction', onReact); socket.off('message_bookmark', onBookmark); };
//   }, [socket]);

//   // ── Load channel/server data ────────────────────────────────────────────────
//   useEffect(() => {
//     const load = async () => {
//       setQueryLoading(true);
//       try {
//         if (propServerId && propChannelId) {
//           setServerId(propServerId);
//           setChannelId(propChannelId);
//           if (propCurrentMember) setMember(propCurrentMember);
//           const [chRes, chsRes] = await Promise.all([
//             fetch(`/api/channels/${propChannelId}`),
//             fetch(`/api/servers/${propServerId}/channels`)
//           ]);
//           if (chRes.ok) setChannel(await chRes.json());
//           if (chsRes.ok) {
//             const d = await chsRes.json();
//             const txt = d.filter((c: Channel) => c.type === ChannelType.TEXT);
//             setChannels(txt);
//             setHasChannel(txt.length > 0);
//           }
//           return;
//         }
//         const res = await fetch('/api/chat/default');
//         if (!res.ok) { setHasChannel(false); return; }
//         const d = await res.json();
//         if (d.serverId && d.channelId) {
//           setServerId(d.serverId);
//           setChannelId(d.channelId);
//           setHasChannel(true);
//           const [chRes, memRes] = await Promise.all([
//             fetch(`/api/channels/${d.channelId}`),
//             fetch(`/api/servers/${d.serverId}/member`)
//           ]);
//           if (chRes.ok) setChannel(await chRes.json());
//           if (memRes.ok) setMember(await memRes.json());
//         } else {
//           setHasChannel(false);
//         }
//       } catch { setHasChannel(false); }
//       finally { setQueryLoading(false); setLoading(false); }
//     };
//     load();
//   }, [propServerId, propChannelId, propCurrentMember]);

//   // ── Handlers ────────────────────────────────────────────────────────────────
//   const handleChannelSwitch = (ch: Channel) => {
//     if (ch.id === channelId) return;
//     setMessages([]); setLoading(true); setChannelId(ch.id); setChannel(ch);
//   };

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) { alert('Max 10MB'); return; }
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

//   const openLightbox = (url: string) => {
//     if (IMAGE_EXT.test(url)) { setLightboxType('image'); setLightboxUrl(url); }
//     else if (VIDEO_EXT.test(url)) { setLightboxType('video'); setLightboxUrl(url); }
//     else { setLightboxType('pdf'); setLightboxUrl(url); }
//   };

//   const sendMessage = async () => {
//     if ((!inputValue.trim() && !pendingFile) || !socket || !channelId || isSending) return;
//     setIsSending(true);
//     setIsUploading(!!pendingFile);

//     let fileUrl = '';
//     if (pendingFile) {
//       try {
//         const reader = new FileReader();
//         const fileData = await new Promise<string>((res, rej) => { reader.onload = () => res(reader.result as string); reader.onerror = rej; reader.readAsDataURL(pendingFile); });
//         const up = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: pendingFile.name, fileType: pendingFile.type, endpoint: 'messageFile', fileData }) });
//         const ud = await up.json();
//         if (!up.ok || !ud.success) throw new Error(ud.error || 'Upload failed');
//         fileUrl = ud.fileUrl;
//       } catch (err) { console.error('Upload failed:', err); setIsSending(false); setIsUploading(false); return; }
//     }

//     setIsUploading(false);
//     const content = inputValue.trim();
//     const tempId = `temp-${Date.now()}`;
//     setMessages(prev => [...prev, { id: tempId, content, fileUrl: fileUrl || null, channelId, memberId: member?.id, member: { ...member, user: session?.user }, reactions: [], bookmarks: [], createdAt: new Date().toISOString(), parentId: replyingTo?.id || null }]);
//     setInputValue('');
//     clearAttachment();
//     setReplyingTo(null);
//     setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

//     try {
//       const res = await fetch('/api/socket/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, fileUrl: fileUrl || undefined, channelId, serverId, parentId: replyingTo?.id || undefined }) });
//       if (!res.ok) throw new Error('Failed');
//       const saved = await res.json();
//       setMessages(prev => prev.map(m => m.id === tempId ? saved : m));
//     } catch { setMessages(prev => prev.filter(m => m.id !== tempId)); setInputValue(content); }
//     finally { setIsSending(false); }
//   };

//   const addReaction = async (messageId: string, emoji: string) => {
//     if (!serverId) return;
//     setMessages(prev => prev.map(msg => {
//       if (msg.id !== messageId) return msg;
//       const has = msg.reactions?.some((r: any) => r.emoji === emoji && r.member?.userId === session?.user?.id);
//       return { ...msg, reactions: has ? msg.reactions.filter((r: any) => !(r.emoji === emoji && r.member?.userId === session?.user?.id)) : [...(msg.reactions || []), { emoji, member: { userId: session?.user?.id, user: session?.user } }] };
//     }));
//     try { await fetch('/api/messages/reactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, emoji, serverId }) }); }
//     catch { fetchMessages(); }
//   };

//   const toggleBookmark = async (messageId: string) => {
//     const msg = messages.find(m => m.id === messageId);
//     const isBm = msg?.bookmarks?.some((b: any) => b.userId === session?.user?.id);
//     setMessages(prev => prev.map(m => { if (m.id !== messageId) return m; const bookmarks = isBm ? (m.bookmarks || []).filter((b: any) => b.userId !== session?.user?.id) : [...(m.bookmarks || []), { userId: session?.user?.id }]; return { ...m, bookmarks }; }));
//     try { await fetch('/api/messages/bookmark', { method: isBm ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId }) }); }
//     catch { fetchMessages(); }
//   };

//   const groupedMessages = messages.reduce((g: any, msg: any) => {
//     const d = format(new Date(msg.createdAt), 'MMMM d, yyyy');
//     if (!g[d]) g[d] = [];
//     g[d].push(msg);
//     return g;
//   }, {});

//   // Props bundle passed to ChatPanel to keep JSX clean
//   const panelProps = {
//     messages, loading, hasChannel, channel, channels, channelId, serverId, member, session, router,
//     groupedMessages, replyingTo, setReplyingTo, inputValue, setInputValue, inputRef,
//     sendMessage, isSending, isUploading,
//     addReaction, toggleBookmark,
//     pendingFile, pendingPreviewUrl, showFilePanel, setShowFilePanel,
//     clearAttachment, handleFileSelect, fileInputRef,
//     isExpanded, setIsExpanded,
//     handleChannelSwitch, openLightbox, messagesEndRef
//   };

//   return (
//     <>
//       {/* ── Outer card — always visible ────────────────────────────────────── */}
//       <div className="relative group flex w-full h-2/3 shadow-md justify-center items-start bg-gray-50 dark:bg-[#090909] dark:border-[#171717] border rounded-[14px] flex-col">

//         <div className="w-full h-full overflow-hidden rounded-[14px]">
//           <CollapsedPreview
//             messages={messages}
//             session={session}
//             channel={channel}
//             hasChannel={hasChannel}
//             isLoading={queryLoading && messages.length === 0}
//           />
//         </div>
//         <div className="absolute bottom-4 right-6 ">
//           <FamilyButton>
//             <div className="relative">
//             <ChatPanel {...panelProps} />
//             </div>
//           </FamilyButton>
//         </div>
//       </div>

//       <Dialog open={!!lightboxUrl} onOpenChange={o => !o && setLightboxUrl(null)}>
//         <DialogContent className="max-w-3xl dark:bg-zinc-950 border-zinc-800 p-2">
//           <DialogHeader className="sr-only">
//             <DialogTitle>File Preview</DialogTitle>
//           </DialogHeader>
//           <div className="flex items-center justify-center min-h-[200px] max-h-[80vh]">
//             {lightboxType === 'image' && lightboxUrl && (
//               <Image src={lightboxUrl} alt="Preview" width={900} height={700} unoptimized
//                 className="max-h-[78vh] w-auto object-contain rounded-lg" />
//             )}
//             {lightboxType === 'video' && lightboxUrl && (
//               <video src={lightboxUrl} controls autoPlay className="max-h-[78vh] w-full rounded-lg" />
//             )}
//             {lightboxType === 'pdf' && lightboxUrl && (
//               <div className="flex flex-col items-center gap-4 py-8">
//                 <FileIcon className="size-16 fill-indigo-200 stroke-indigo-400" />
//                 <p className="text-sm text-zinc-300 truncate max-w-[300px]">{lightboxUrl.split('/').pop()}</p>
//                 <a href={lightboxUrl} target="_blank" rel="noopener noreferrer"
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
//                   Open PDF
//                 </a>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// // ─── MiniMessageItem ──────────────────────────────────────────────────────────
// const MiniMessageItem = ({
//   message, isCurrentUser, showAvatar, isBookmarked,
//   isReplyingToThis, currentUserId,
//   onReply, onReact, onBookmark, onOpenFile
// }: any) => {
//   const [showActions, setShowActions] = useState(false);
//   const [imageError, setImageError] = useState(false);

//   const fileUrl: string | undefined = message.fileUrl;
//   const fileIsImage = !!fileUrl && IMAGE_EXT.test(fileUrl) && !imageError;
//   const fileIsVideo = !!fileUrl && VIDEO_EXT.test(fileUrl);
//   const fileIsPdf = !!fileUrl && fileUrl.toLowerCase().endsWith('.pdf');

//   const reactionCounts = (message.reactions || []).reduce((acc: any, r: any) => {
//     const e = r.emoji;
//     if (!acc[e]) acc[e] = { count: 0, userIds: [] };
//     acc[e].count++;
//     acc[e].userIds.push(r.member?.userId || r.memberId);
//     return acc;
//   }, {});

//   return (
//     <div
//       className={`group px-3 pt-1.5 pb-2 flex gap-2 transition-colors hover:bg-white/[0.03] ${
//         isReplyingToThis ? 'bg-blue-500/10 ring-1 ring-blue-500 rounded-lg mx-1' : ''
//       }`}
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => setShowActions(false)}
//     >
//       {showAvatar ? (
//         <Avatar className="size-7 mt-0.5 flex-shrink-0">
//           <AvatarImage src={message.member?.user?.image} />
//           <AvatarFallback className="text-[10px]">{message.member?.user?.name?.[0] || '?'}</AvatarFallback>
//         </Avatar>
//       ) : <div className="w-7 flex-shrink-0" />}

//       <div className="flex-1 min-w-0 flex flex-col">
//         {showAvatar && (
//           <div className="flex items-center gap-1.5 mb-0.5">
//             <span className="font-semibold text-xs text-white">{message.member?.user?.name || 'Unknown'}</span>
//             <span className="text-[10px] text-zinc-500">{format(new Date(message.createdAt), 'h:mm a')}</span>
//           </div>
//         )}

//         {message.parentId && (
//           <div className="flex items-center gap-1 mb-1 px-2 py-0.5 rounded bg-zinc-800/60 border-l-2 border-blue-500/60 text-[10px] text-zinc-500">
//             <Reply className="size-2.5 flex-shrink-0 text-blue-400" />
//             <span className="truncate">{message.parent?.content?.substring(0, 40) || '📎 Attachment'}</span>
//           </div>
//         )}

//         {message.content && (
//           <p className="text-xs text-zinc-200 whitespace-pre-wrap break-words leading-snug">{message.content}</p>
//         )}

//         {fileUrl && (
//           <div className="mt-1">
//             {fileIsImage && (
//               <button type="button" onClick={() => onOpenFile(fileUrl)}
//                 className="relative rounded-lg overflow-hidden border border-zinc-700 max-w-[180px] group/img block">
//                 <Image src={fileUrl} alt="attachment" width={180} height={120} unoptimized
//                   className="object-cover w-full max-h-32" onError={() => setImageError(true)} />
//                 <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
//                   <ZoomIn className="size-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
//                 </div>
//               </button>
//             )}
//             {fileIsVideo && (
//               <button type="button" onClick={() => onOpenFile(fileUrl)}
//                 className="text-xs text-blue-400 hover:underline flex items-center gap-1">
//                 <FileIcon className="size-3" /> Video — click to play
//               </button>
//             )}
//             {fileIsPdf && (
//               <button type="button" onClick={() => onOpenFile(fileUrl)}
//                 className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 max-w-[180px] hover:border-zinc-600 transition-colors">
//                 <FileIcon className="size-4 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
//                 <span className="text-[10px] text-indigo-400 truncate">{fileUrl.split('/').pop()}</span>
//               </button>
//             )}
//             {fileUrl && !fileIsImage && !fileIsVideo && !fileIsPdf && (
//               <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline">📎 Attachment</a>
//             )}
//           </div>
//         )}

//         {Object.keys(reactionCounts).length > 0 && (
//           <div className="flex flex-wrap gap-1 mt-1">
//             {Object.entries(reactionCounts).map(([emoji, d]: [string, any]) => (
//               <button key={emoji} type="button" onClick={() => onReact(message.id, emoji)}
//                 className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors ${
//                   d.userIds?.includes(currentUserId)
//                     ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
//                     : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
//                 }`}>
//                 <span>{emoji}</span>
//                 {d.count > 1 && <span className="font-medium">{d.count}</span>}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className={`flex items-center h-fit gap-0.5 -mt-4 transition-opacity flex-shrink-0 ${
//         showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'
//       } border bg-[#111111] border-[#484848] rounded-lg p-0.5`}>
//         <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="icon" className="size-5" onClick={onReply}>
//                 <Reply className="size-2.5" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent className="text-[10px]">Reply</TooltipContent>
//           </Tooltip>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="ghost" size="icon" className="size-5">
//                 <Smile className="size-2.5" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" side="top">
//               <Picker data={data} onEmojiSelect={(emoji: any) => onReact(message.id, emoji.native)} />
//             </PopoverContent>
//           </Popover>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="icon"
//                 className={`size-5 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-400'}`}
//                 onClick={onBookmark}>
//                 <Bookmark className={`size-2.5 ${isBookmarked ? 'fill-current' : ''}`} />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent className="text-[10px]">{isBookmarked ? 'Saved' : 'Save'}</TooltipContent>
//           </Tooltip>
//         </TooltipProvider>
//       </div>
//     </div>
//   );
// };

"use client";

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Maximize2, Minimize2, Send, Smile, Plus, X,
  Reply, Bookmark, Loader2, ChevronDown, FileIcon,
  ZoomIn, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChannelType } from "@prisma/client";
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/animate-ui/components/animate/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import LazyLoader from '@/components/loader/lazyloader';
import { FamilyButton } from "./familyButton";
import Image from 'next/image';
import { Paperclip } from '../animate-ui/icons/paperclip';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Channel { id: string; name: string; type: ChannelType; teamId: string; }
interface User { id: string; name: string; image: string; email: string; }
interface TeamMemberEntry { id: string; role: string; userId: string; teamId: string; user: User; }
interface ChatInterfaceProps {
  channelId?: string;
  teamSlug?: string;
  type?: 'channel' | 'conversation';
  currentMember?: TeamMemberEntry | null;
}

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|ogg)$/i;

// ─── Collapsed preview ────────────────────────────────────────────────────────
const CollapsedPreview = ({
  messages, session, channel, hasChannel, isLoading
}: {
  messages: any[]; session: any; channel: any; hasChannel: boolean; isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-4 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!hasChannel) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1.5 px-4 text-center">
        <MessageSquare className="size-7 text-zinc-600 opacity-50" />
        <p className="text-[11px] text-zinc-500 font-medium">No channel found</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1.5 px-4 text-center">
        <MessageSquare className="size-7 text-zinc-600 opacity-50" />
        <p className="text-[11px] text-zinc-500">{channel ? `# ${channel.name}` : 'Chat'}</p>
        <p className="text-[10px] text-zinc-600">No messages yet</p>
      </div>
    );
  }

 const preview = messages.slice(-6);
return (
  <div className="flex flex-col justify-end px-2 py-2 gap-1 overflow-x-auto overflow-y-auto">
    {channel && (
      <p className="text-[10px] text-zinc-600 font-medium mb-0.5"># {channel.name}</p>
    )}
    {preview.map((msg: any, index: number) => {
      const isMe = msg.sender?.userId === session?.user?.id || msg.sender?.user?.id === session?.user?.id;

      // Check if this is the last message from this sender in the preview
      const nextMsg = preview[index + 1];
      const isLastFromMember = !nextMsg || nextMsg.senderId !== msg.senderId;

      return (
        <div 
          key={msg.id} 
          className={`flex items-start gap-1 py-1 ${isMe ? 'flex-row' : 'flex-row'}`}
        >
          {/* Avatar only on last message of each sender's streak */}
          {isLastFromMember ? (
            <Avatar className="size-6 flex-shrink-0 mt-0.5">
              <AvatarImage src={msg.sender?.user?.image} />
              <AvatarFallback className="text-[8px]">{msg.sender?.user?.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="size-6 flex-shrink-0" /> // Spacer to align content
          )}

          <div className="flex flex-col min-w-0 w-full">
            {/* Name and time together, only on last message of streak */}
            {isLastFromMember && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5">
                <span className="font-medium dark:text-zinc-300">{msg.sender?.user?.name}</span>
                <span>·</span>
                <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
              </div>
            )}
            
            {/* Message content */}
            <div className={`max-w-[16vw] px-2 py-0.5 hover:bg-[#EEE] hover:dark:bg-[#222] rounded-xl text-[12px] truncate leading-snug ${
              isMe ? ' dark:text-zinc-300 rounded-tl-sm' : ' dark:text-zinc-300 rounded-tl-sm'
            }`}>
              {msg.fileUrl ? <div className="flex items-center gap-1">
               <Paperclip animateOnHover className="size-3.5"/> Attachment
              </div> : msg.content}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
}
// ─── Chat panel — the actual chat UI rendered inside FamilyButton's children ──
const ChatPanel = ({
  messages, loading, hasChannel, channel, channels, channelId,
  teamId, teamSlug, member, session, router,
  groupedMessages, replyingTo, setReplyingTo,
  inputValue, setInputValue, inputRef,
  sendMessage, isSending, isUploading,
  addReaction, toggleBookmark,
  pendingFile, pendingPreviewUrl, showFilePanel, setShowFilePanel,
  clearAttachment, handleFileSelect, fileInputRef,
  isExpanded, setIsExpanded,
  handleChannelSwitch, openLightbox, messagesEndRef
}: any) => {
  const isPdf = pendingFile?.type === 'application/pdf';
  const isVideo = pendingFile?.type?.startsWith('video/');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 12 }}
      transition={{ type: "spring", damping: 22, stiffness: 320 }}
      className="rounded-xl shadow-2xl overflow-hidden flex flex-col bg-[#111] border border-zinc-800 w-[24.5rem] h-[600px]"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#212021] text-white px-3 py-2 flex justify-between items-center border-b border-zinc-800 flex-shrink-0">
        <div className="flex-1 min-w-0">
          {channels.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-1 hover:bg-zinc-800 rounded-md px-2 py-1 transition-colors">
                  <h3 className="font-semibold text-sm truncate">
                    {channel ? `# ${channel.name}` : 'Select channel'}
                  </h3>
                  <ChevronDown className="size-4 text-zinc-400 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-zinc-900 border-zinc-800">
                {channels.map((ch: Channel) => (
                  <DropdownMenuItem
                    key={ch.id}
                    onClick={() => handleChannelSwitch(ch)}
                    className={`cursor-pointer text-sm ${
                      channelId === ch.id ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="truncate"># {ch.name}</span>
                    {channelId === ch.id && <span className="ml-auto text-xs text-blue-400">●</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <h3 className="font-semibold text-sm truncate px-2 py-1">
              {channel ? `# ${channel.name}` : 'Chat'}
            </h3>
          )}
          <p className="text-[11px] text-zinc-500 px-2">{messages.length} messages</p>
        </div>
        <div className="flex gap-x-1">
          <button type="button"
            onClick={() => teamSlug && channelId && router.push(`/team/${teamSlug}/channels/${channelId}`)}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Open full page"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#111]">
        {!hasChannel ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 px-6 text-center gap-3">
            <MessageSquare className="size-10 opacity-30" />
            <p className="text-sm font-medium">No channels available</p>
            <p className="text-xs opacity-60">Ask your admin to create a channel</p>
          </div>
        ) : loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <LazyLoader />
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin2 py-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 py-16">
                  <MessageSquare className="size-8 opacity-30" />
                  <p className="text-xs">No messages yet</p>
                  <p className="text-[11px] opacity-50">Be the first to say something!</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]: [string, any]) => (
                  <div key={date}>
                    <div className="flex items-center justify-center relative my-3">
                      <Separator className="bg-zinc-800" />
                      <Badge variant="outline"
                        className="text-[10px] absolute mx-auto bg-[#1a1a1a] text-zinc-500 px-2 rounded-full border-zinc-700 h-5">
                        {date}
                      </Badge>
                    </div>
                    {msgs.map((message: any, idx: number) => {
                      const isCurrentUser =
                        message.sender?.userId === session?.user?.id ||
                        message.sender?.user?.id === session?.user?.id;
                      const showAvatar = idx === 0 || msgs[idx - 1]?.senderId !== message.senderId;
                      const isBookmarked = message.bookmarks?.some((b: any) => b.userId === session?.user?.id);
                      return (
                        <MiniMessageItem
                          key={message.id}
                          message={message}
                          isCurrentUser={isCurrentUser}
                          showAvatar={showAvatar}
                          isBookmarked={isBookmarked}
                          isReplyingToThis={replyingTo?.id === message.id}
                          currentUserId={session?.user?.id}
                          onReply={() => setReplyingTo(message)}
                          onReact={addReaction}
                          onBookmark={() => toggleBookmark(message.id)}
                          onOpenFile={openLightbox}
                        />
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply preview */}
            {replyingTo && (
              <div className="mx-3 mb-1 flex-shrink-0 rounded-lg overflow-hidden border-l-2 border-blue-500 bg-zinc-900">
                <div className="flex items-center justify-between px-2.5 py-1.5 gap-2">
                  <div className="flex items-start gap-1.5 min-w-0 flex-1">
                    <Reply className="size-3 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-blue-400 truncate">
                        {replyingTo.sender?.user?.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {replyingTo.fileUrl && !replyingTo.content ? '📎 Attachment' : replyingTo.content?.substring(0, 50)}
                      </p>
                    </div>
                    {replyingTo.fileUrl && IMAGE_EXT.test(replyingTo.fileUrl) && (
                      <div className="size-7 rounded overflow-hidden flex-shrink-0 ml-auto">
                        <img src={replyingTo.fileUrl} alt="" className="size-full object-cover" />
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white flex-shrink-0">
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* File preview */}
            {pendingFile && (
              <div className="mx-3 mb-1 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0 bg-zinc-900 relative">
                {!isPdf && !isVideo ? (
                  <div className="relative w-full" style={{ maxHeight: 180 }}>
                    <img src={pendingPreviewUrl} alt="preview" className="w-full object-contain" style={{ maxHeight: 180 }} />
                    <button type="button" onClick={clearAttachment}
                      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5">
                      <X className="size-3.5" />
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full truncate max-w-[55%]">
                      {pendingFile.name}
                    </div>
                  </div>
                ) : isVideo ? (
                  <div className="relative">
                    <video src={pendingPreviewUrl} className="w-full max-h-32 object-contain" controls />
                    <button type="button" onClick={clearAttachment}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-0.5">
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <FileIcon className="size-6 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-white font-medium truncate">{pendingFile.name}</p>
                      <p className="text-[10px] text-zinc-400">{(pendingFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={clearAttachment} className="ml-auto text-zinc-500 hover:text-red-400">
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* File picker panel */}
            {showFilePanel && !pendingFile && (
              <div className="mx-3 mb-1 p-2.5 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center gap-2 flex-shrink-0">
                <label className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs transition-colors flex-shrink-0">
                  <Plus className="size-3.5" />
                  Choose File
                  <input ref={fileInputRef} type="file" className="hidden"
                    accept="image/*,video/*,application/pdf" onChange={handleFileSelect} />
                </label>
                <span className="text-[11px] text-zinc-500 truncate">Image, video or PDF</span>
                <button type="button" onClick={() => setShowFilePanel(false)} className="ml-auto text-zinc-500 hover:text-white flex-shrink-0">
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* Input */}
            <div className="mx-3 mb-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => { if (pendingFile) { clearAttachment(); return; } setShowFilePanel((p: boolean) => !p); }}
                  className={`p-1 rounded-full hover:bg-zinc-800 transition-colors flex-shrink-0 ${
                    showFilePanel ? 'text-blue-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {pendingFile || showFilePanel ? <X className="size-4" /> : <Plus className="size-4" />}
                </button>

                <input
                  ref={inputRef}
                  aria-label="message-input"
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    if (e.key === 'Escape') setReplyingTo(null);
                  }}
                  placeholder={replyingTo ? 'Reply…' : 'Write a message…'}
                  disabled={isSending}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1 text-white placeholder-zinc-500 disabled:opacity-50 min-w-0"
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 flex-shrink-0">
                      <Smile className="size-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top" align="end">
                    <Picker data={data} onEmojiSelect={(emoji: any) => {
                      setInputValue((prev: string) => prev + emoji.native);
                      inputRef.current?.focus();
                    }} />
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={sendMessage}
                  disabled={(!inputValue.trim() && !pendingFile) || isSending || isUploading}
                  size="icon"
                  className={`size-7 flex-shrink-0 transition-colors ${
                    (inputValue.trim() || pendingFile) && !isSending && !isUploading
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-zinc-700 cursor-not-allowed'
                  }`}
                >
                  {isSending || isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
export const FamilyButtonDemo: React.FC<ChatInterfaceProps> = ({
  channelId: propChannelId,
  teamSlug: propTeamSlug,
  currentMember: propCurrentMember
}) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [member, setMember] = useState<TeamMemberEntry | null>(propCurrentMember || null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamSlug, setTeamSlug] = useState<string | null>(propTeamSlug || null);
  const [channelId, setChannelId] = useState<string | null>(propChannelId || null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [hasChannel, setHasChannel] = useState(true);
  const [queryLoading, setQueryLoading] = useState(true);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showFilePanel, setShowFilePanel] = useState(false);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxType, setLightboxType] = useState<'image' | 'video' | 'pdf'>('image');

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketInitRef = useRef(false);
  const joinedChannelRef = useRef<string | null>(null);

  // ── Socket ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (socketInitRef.current) return;
    const s = io({ path: '/api/socket/io', transports: ['websocket', 'polling'], reconnection: true, reconnectionAttempts: 5 });
    s.on('connect', () => console.log('[CHAT WIDGET] Connected:', s.id));
    s.on('connect_error', err => console.error('[CHAT WIDGET] Error:', err.message));
    setSocket(s);
    socketInitRef.current = true;
    return () => { s.disconnect(); socketInitRef.current = false; };
  }, []);

  // ── Join channel ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !channelId) return;
    if (joinedChannelRef.current && joinedChannelRef.current !== channelId) {
      socket.emit('leave_channel', joinedChannelRef.current);
    }
    socket.emit('join_channel', channelId);
    joinedChannelRef.current = channelId;
  }, [socket, channelId]);

  // ── Fetch messages ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/messages?channelId=${channelId}`);
      if (!res.ok) throw new Error('Failed');
      const d = await res.json();
      setMessages(d.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [channelId]);

  useEffect(() => { if (channelId) fetchMessages(); }, [channelId, fetchMessages]);

  // ── Scroll to bottom when messages load ────────────────────────────────────
  useLayoutEffect(() => {
    if (!loading && messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }
  }, [loading, messages.length]);

  // ── Socket listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onNew = (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        const ti = prev.findIndex(m => m.id?.startsWith('temp-') && m.content === msg.content && m.senderId === msg.senderId);
        if (ti !== -1) { const n = [...prev]; n[ti] = msg; return n; }
        return [...prev, msg];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    const onReact = (d: any) => setMessages(prev => prev.map(m => m.id === d.messageId ? { ...m, reactions: d.reactions } : m));
    const onBookmark = (d: any) => setMessages(prev => prev.map(m => {
      if (m.id !== d.messageId) return m;
      const bookmarks = d.bookmarked ? [...(m.bookmarks || []), { userId: d.userId }] : (m.bookmarks || []).filter((b: any) => b.userId !== d.userId);
      return { ...m, bookmarks };
    }));
    socket.on('new_message', onNew);
    socket.on('message_reaction', onReact);
    socket.on('message_bookmark', onBookmark);
    return () => { socket.off('new_message', onNew); socket.off('message_reaction', onReact); socket.off('message_bookmark', onBookmark); };
  }, [socket]);

  // ── Load channel/team data ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setQueryLoading(true);
      try {
        if (propTeamSlug && propChannelId) {
          setTeamSlug(propTeamSlug);
          setChannelId(propChannelId);
          if (propCurrentMember) setMember(propCurrentMember);
          const [chRes, chsRes, meRes] = await Promise.all([
            fetch(`/api/team/${propTeamSlug}/channels/${propChannelId}`),
            fetch(`/api/team/${propTeamSlug}/channels`),
            fetch(`/api/team/${propTeamSlug}/members/me`),
          ]);
          if (chRes.ok) setChannel(await chRes.json());
          if (chsRes.ok) {
            const d = await chsRes.json();
            const txt = d.filter((c: Channel) => c.type === ChannelType.TEXT);
            setChannels(txt);
            setHasChannel(txt.length > 0);
          }
          if (meRes.ok) {
            const me = await meRes.json();
            setMember(me);
            setTeamId(me?.teamId || null);
          }
          return;
        }
        const res = await fetch('/api/chat/default');
        if (!res.ok) { setHasChannel(false); return; }
        const d = await res.json();
        if (d.teamSlug && d.channelId) {
          setTeamSlug(d.teamSlug);
          setTeamId(d.teamId);
          setChannelId(d.channelId);
          setHasChannel(true);
          const [chRes, memRes] = await Promise.all([
            fetch(`/api/team/${d.teamSlug}/channels/${d.channelId}`),
            fetch(`/api/team/${d.teamSlug}/members/me`)
          ]);
          if (chRes.ok) setChannel(await chRes.json());
          if (memRes.ok) setMember(await memRes.json());
        } else {
          setHasChannel(false);
        }
      } catch { setHasChannel(false); }
      finally { setQueryLoading(false); setLoading(false); }
    };
    load();
  }, [propTeamSlug, propChannelId, propCurrentMember]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChannelSwitch = (ch: Channel) => {
    if (ch.id === channelId) return;
    setMessages([]); setLoading(true); setChannelId(ch.id); setChannel(ch);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Max 10MB'); return; }
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

  const openLightbox = (url: string) => {
    if (IMAGE_EXT.test(url)) { setLightboxType('image'); setLightboxUrl(url); }
    else if (VIDEO_EXT.test(url)) { setLightboxType('video'); setLightboxUrl(url); }
    else { setLightboxType('pdf'); setLightboxUrl(url); }
  };

  const sendMessage = async () => {
    if ((!inputValue.trim() && !pendingFile) || !socket || !channelId || !teamId || isSending) return;
    setIsSending(true);
    setIsUploading(!!pendingFile);

    let fileUrl = '';
    if (pendingFile) {
      try {
        const reader = new FileReader();
        const fileData = await new Promise<string>((res, rej) => { reader.onload = () => res(reader.result as string); reader.onerror = rej; reader.readAsDataURL(pendingFile); });
        const up = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: pendingFile.name, fileType: pendingFile.type, endpoint: 'messageFile', fileData }) });
        const ud = await up.json();
        if (!up.ok || !ud.success) throw new Error(ud.error || 'Upload failed');
        fileUrl = ud.fileUrl;
      } catch (err) { console.error('Upload failed:', err); setIsSending(false); setIsUploading(false); return; }
    }

    setIsUploading(false);
    const content = inputValue.trim();
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, content, fileUrl: fileUrl || null, channelId, senderId: member?.id, sender: { ...member, user: session?.user }, reactions: [], bookmarks: [], createdAt: new Date().toISOString(), parentId: replyingTo?.id || null }]);
    setInputValue('');
    clearAttachment();
    setReplyingTo(null);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const res = await fetch('/api/socket/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, fileUrl: fileUrl || undefined, channelId, teamId, parentId: replyingTo?.id || undefined, tempId }) });
      if (!res.ok) throw new Error('Failed');
      const saved = await res.json();
      setMessages(prev => prev.map(m => m.id === tempId ? saved : m));
    } catch { setMessages(prev => prev.filter(m => m.id !== tempId)); setInputValue(content); }
    finally { setIsSending(false); }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!teamId) return;
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      const has = msg.reactions?.some((r: any) => r.emoji === emoji && r.teamMember?.userId === session?.user?.id);
      return { ...msg, reactions: has ? msg.reactions.filter((r: any) => !(r.emoji === emoji && r.teamMember?.userId === session?.user?.id)) : [...(msg.reactions || []), { emoji, teamMember: { userId: session?.user?.id, user: session?.user } }] };
    }));
    try { await fetch('/api/messages/reactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, emoji, teamId }) }); }
    catch { fetchMessages(); }
  };

  const toggleBookmark = async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    const isBm = msg?.bookmarks?.some((b: any) => b.userId === session?.user?.id);
    setMessages(prev => prev.map(m => { if (m.id !== messageId) return m; const bookmarks = isBm ? (m.bookmarks || []).filter((b: any) => b.userId !== session?.user?.id) : [...(m.bookmarks || []), { userId: session?.user?.id }]; return { ...m, bookmarks }; }));
    try { await fetch('/api/messages/bookmark', { method: isBm ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId }) }); }
    catch { fetchMessages(); }
  };

  const groupedMessages = messages.reduce((g: any, msg: any) => {
    const d = format(new Date(msg.createdAt), 'MMMM d, yyyy');
    if (!g[d]) g[d] = [];
    g[d].push(msg);
    return g;
  }, {});

  // Props bundle passed to ChatPanel to keep JSX clean
  const panelProps = {
    messages, loading, hasChannel, channel, channels, channelId, teamId, teamSlug, member, session, router,
    groupedMessages, replyingTo, setReplyingTo, inputValue, setInputValue, inputRef,
    sendMessage, isSending, isUploading,
    addReaction, toggleBookmark,
    pendingFile, pendingPreviewUrl, showFilePanel, setShowFilePanel,
    clearAttachment, handleFileSelect, fileInputRef,
    isExpanded, setIsExpanded,
    handleChannelSwitch, openLightbox, messagesEndRef
  };

  return (
    <>
      {/* ── Outer card — always visible ────────────────────────────────────── */}
      <div className="relative group flex w-full h-2/3 shadow-md justify-center items-start bg-gray-50 dark:bg-[#090909] dark:border-[#171717] border rounded-[14px] flex-col">

        <div className="w-full h-full overflow-hidden rounded-[14px]">
          <CollapsedPreview
            messages={messages}
            session={session}
            channel={channel}
            hasChannel={hasChannel}
            isLoading={queryLoading && messages.length === 0}
          />
        </div>
        <div className="absolute bottom-4 right-6 ">
          <FamilyButton>
            <div className="relative">
            <ChatPanel {...panelProps} />
            </div>
          </FamilyButton>
        </div>
      </div>

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
    </>
  );
};

// ─── MiniMessageItem ──────────────────────────────────────────────────────────
const MiniMessageItem = ({
  message, isCurrentUser, showAvatar, isBookmarked,
  isReplyingToThis, currentUserId,
  onReply, onReact, onBookmark, onOpenFile
}: any) => {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileUrl: string | undefined = message.fileUrl;
  const fileIsImage = !!fileUrl && IMAGE_EXT.test(fileUrl) && !imageError;
  const fileIsVideo = !!fileUrl && VIDEO_EXT.test(fileUrl);
  const fileIsPdf = !!fileUrl && fileUrl.toLowerCase().endsWith('.pdf');

  const reactionCounts = (message.reactions || []).reduce((acc: any, r: any) => {
    const e = r.emoji;
    if (!acc[e]) acc[e] = { count: 0, userIds: [] };
    acc[e].count++;
    acc[e].userIds.push(r.teamMember?.userId || r.teamMemberId);
    return acc;
  }, {});

  return (
    <div
      className={`group px-3 pt-1.5 pb-2 flex gap-2 transition-colors hover:bg-white/[0.03] ${
        isReplyingToThis ? 'bg-blue-500/10 ring-1 ring-blue-500 rounded-lg mx-1' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar ? (
        <Avatar className="size-7 mt-0.5 flex-shrink-0">
          <AvatarImage src={message.sender?.user?.image} />
          <AvatarFallback className="text-[10px]">{message.sender?.user?.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
      ) : <div className="w-7 flex-shrink-0" />}

      <div className="flex-1 min-w-0 flex flex-col">
        {showAvatar && (
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-xs text-white">{message.sender?.user?.name || 'Unknown'}</span>
            <span className="text-[10px] text-zinc-500">{format(new Date(message.createdAt), 'h:mm a')}</span>
          </div>
        )}

        {message.parentId && (
          <div className="flex items-center gap-1 mb-1 px-2 py-0.5 rounded bg-zinc-800/60 border-l-2 border-blue-500/60 text-[10px] text-zinc-500">
            <Reply className="size-2.5 flex-shrink-0 text-blue-400" />
            <span className="truncate">{message.parent?.content?.substring(0, 40) || '📎 Attachment'}</span>
          </div>
        )}

        {message.content && (
          <p className="text-xs text-zinc-200 whitespace-pre-wrap break-words leading-snug">{message.content}</p>
        )}

        {fileUrl && (
          <div className="mt-1">
            {fileIsImage && (
              <button type="button" onClick={() => onOpenFile(fileUrl)}
                className="relative rounded-lg overflow-hidden border border-zinc-700 max-w-[180px] group/img block">
                <Image src={fileUrl} alt="attachment" width={180} height={120} unoptimized
                  className="object-cover w-full max-h-32" onError={() => setImageError(true)} />
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn className="size-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
              </button>
            )}
            {fileIsVideo && (
              <button type="button" onClick={() => onOpenFile(fileUrl)}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                <FileIcon className="size-3" /> Video — click to play
              </button>
            )}
            {fileIsPdf && (
              <button type="button" onClick={() => onOpenFile(fileUrl)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 max-w-[180px] hover:border-zinc-600 transition-colors">
                <FileIcon className="size-4 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
                <span className="text-[10px] text-indigo-400 truncate">{fileUrl.split('/').pop()}</span>
              </button>
            )}
            {fileUrl && !fileIsImage && !fileIsVideo && !fileIsPdf && (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline">📎 Attachment</a>
            )}
          </div>
        )}

        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(reactionCounts).map(([emoji, d]: [string, any]) => (
              <button key={emoji} type="button" onClick={() => onReact(message.id, emoji)}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors ${
                  d.userIds?.includes(currentUserId)
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}>
                <span>{emoji}</span>
                {d.count > 1 && <span className="font-medium">{d.count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`flex items-center h-fit gap-0.5 -mt-4 transition-opacity flex-shrink-0 ${
        showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } border bg-[#111111] border-[#484848] rounded-lg p-0.5`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-5" onClick={onReply}>
                <Reply className="size-2.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px]">Reply</TooltipContent>
          </Tooltip>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="size-5">
                <Smile className="size-2.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="top">
              <Picker data={data} onEmojiSelect={(emoji: any) => onReact(message.id, emoji.native)} />
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"
                className={`size-5 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-400'}`}
                onClick={onBookmark}>
                <Bookmark className={`size-2.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px]">{isBookmarked ? 'Saved' : 'Save'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};