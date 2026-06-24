// // // components/integrations/google/GmailPanel.tsx
// // /**
// //  * Full Gmail panel — inbox list + message reader + compose.
// //  *
// //  * Usage:
// //  *   <GmailPanel />                         — standalone inbox
// //  *   <GmailPanel defaultCompose={true} />   — open compose immediately
// //  *   <GmailPanel replyTo={message} />       — open compose as reply
// //  */
// // import React, { useState, useEffect, useCallback, useRef } from 'react'

// // interface GmailAddress { name?: string; email: string }
// // interface GmailMessage {
// //   id: string
// //   threadId: string
// //   subject: string
// //   from: GmailAddress
// //   to: GmailAddress[]
// //   snippet: string
// //   body: string
// //   bodyPlain: string
// //   date: string
// //   isRead: boolean
// //   isStarred: boolean
// //   hasAttachments: boolean
// //   labelIds: string[]
// // }

// // interface GmailPanelProps {
// //   defaultCompose?: boolean
// //   replyTo?: GmailMessage
// //   defaultTo?: string
// //   defaultSubject?: string
// //   onSent?: () => void
// //   compact?: boolean  // smaller height for embedding in sidebar
// // }

// // const LABELS = [
// //   { id: 'INBOX',  label: 'Inbox',   icon: '📥' },
// //   { id: 'SENT',   label: 'Sent',    icon: '📤' },
// //   { id: 'STARRED',label: 'Starred', icon: '⭐' },
// //   { id: 'DRAFT',  label: 'Drafts',  icon: '📋' },
// // ]

// // function formatDate(iso: string) {
// //   const d = new Date(iso)
// //   const now = new Date()
// //   const diff = now.getTime() - d.getTime()
// //   if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
// //   if (diff < 7 * 86400000) return d.toLocaleDateString('en-US', { weekday: 'short' })
// //   return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
// // }

// // // ── Compose Modal ─────────────────────────────────────────────────────────
// // function ComposeModal({
// //   onClose,
// //   onSent,
// //   replyTo,
// //   defaultTo = '',
// //   defaultSubject = '',
// // }: {
// //   onClose: () => void
// //   onSent?: () => void
// //   replyTo?: GmailMessage
// //   defaultTo?: string
// //   defaultSubject?: string
// // }) {
// //   const [to, setTo] = useState(replyTo ? replyTo.from.email : defaultTo)
// //   const [subject, setSubject] = useState(
// //     replyTo ? `Re: ${replyTo.subject}` : defaultSubject
// //   )
// //   const [body, setBody] = useState(
// //     replyTo
// //       ? `\n\n---\nOn ${formatDate(replyTo.date)}, ${replyTo.from.name ?? replyTo.from.email} wrote:\n${replyTo.bodyPlain.slice(0, 300)}…`
// //       : ''
// //   )
// //   const [cc, setCc] = useState('')
// //   const [showCc, setShowCc] = useState(false)
// //   const [isSending, setIsSending] = useState(false)
// //   const [error, setError] = useState<string | null>(null)

// //   const handleSend = async () => {
// //     if (!to.trim() || !subject.trim() || !body.trim()) {
// //       setError('To, subject, and body are required')
// //       return
// //     }
// //     setIsSending(true)
// //     setError(null)
// //     try {
// //       const res = await fetch('/api/integrations/google/gmail/messages', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           action: 'send',
// //           to: to.split(',').map((e) => e.trim()),
// //           subject,
// //           emailBody: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">${body.replace(/\n/g, '<br>')}</div>`,
// //           cc: cc ? cc.split(',').map((e) => e.trim()) : undefined,
// //           replyToMessageId: replyTo?.id,
// //           threadId: replyTo?.threadId,
// //         }),
// //       })
// //       const data = await res.json()
// //       if (!res.ok) throw new Error(data.error ?? 'Send failed')
// //       onSent?.()
// //       onClose()
// //     } catch (e: any) {
// //       setError(e.message)
// //     } finally {
// //       setIsSending(false)
// //     }
// //   }

// //   return (
// //     <div style={{
// //       position: 'fixed', bottom: '20px', right: '20px',
// //       width: '520px',
// //       backgroundColor: '#fff',
// //       borderRadius: '14px',
// //       boxShadow: '0 20px 60px rgba(0,0,0,0.20)',
// //       border: '1px solid #E5E7EB',
// //       zIndex: 9990,
// //       display: 'flex', flexDirection: 'column',
// //       overflow: 'hidden',
// //     }}>
// //       {/* Header */}
// //       <div style={{
// //         padding: '12px 16px',
// //         backgroundColor: '#1a1a2e',
// //         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
// //       }}>
// //         <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff' }}>
// //           {replyTo ? '↩️ Reply' : '✉️ New Message'}
// //         </span>
// //         <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '16px', padding: 0 }}>×</button>
// //       </div>

// //       {/* Fields */}
// //       <div style={{ padding: '0', borderBottom: '1px solid #F3F4F6' }}>
// //         {[
// //           { label: 'To', value: to, onChange: setTo, placeholder: 'recipient@email.com' },
// //           ...(showCc ? [{ label: 'Cc', value: cc, onChange: setCc, placeholder: 'cc@email.com' }] : []),
// //           { label: 'Subject', value: subject, onChange: setSubject, placeholder: 'Subject' },
// //         ].map(({ label, value, onChange, placeholder }) => (
// //           <div key={label} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #F9FAFB', padding: '0 16px' }}>
// //             <span style={{ fontSize: '12px', color: '#9CA3AF', width: '52px', flexShrink: 0 }}>{label}</span>
// //             <input
// //               value={value}
// //               onChange={(e) => onChange(e.target.value)}
// //               placeholder={placeholder}
// //               style={{
// //                 flex: 1, border: 'none', outline: 'none',
// //                 padding: '10px 0', fontSize: '13.5px', color: '#111827',
// //                 fontFamily: 'inherit', backgroundColor: 'transparent',
// //               }}
// //             />
// //             {label === 'To' && !showCc && (
// //               <button onClick={() => setShowCc(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '11.5px', fontFamily: 'inherit' }}>Cc</button>
// //             )}
// //           </div>
// //         ))}
// //       </div>

// //       {/* Body */}
// //       <textarea
// //         value={body}
// //         onChange={(e) => setBody(e.target.value)}
// //         placeholder="Write your message…"
// //         style={{
// //           flex: 1, border: 'none', outline: 'none', padding: '14px 16px',
// //           fontSize: '13.5px', color: '#111827', resize: 'none',
// //           fontFamily: 'inherit', lineHeight: 1.6, minHeight: '180px',
// //           backgroundColor: 'transparent',
// //         }}
// //       />

// //       {error && (
// //         <div style={{ padding: '8px 16px', backgroundColor: '#FEF2F2', color: '#991B1B', fontSize: '12.5px' }}>
// //           {error}
// //         </div>
// //       )}

// //       {/* Footer */}
// //       <div style={{ padding: '10px 16px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
// //         <button
// //           onClick={handleSend}
// //           disabled={isSending}
// //           style={{
// //             padding: '9px 24px', borderRadius: '8px', border: 'none',
// //             backgroundColor: '#4285F4', color: '#fff',
// //             fontSize: '13.5px', fontWeight: 600, cursor: isSending ? 'not-allowed' : 'pointer',
// //             fontFamily: 'inherit', opacity: isSending ? 0.7 : 1,
// //           }}
// //         >
// //           {isSending ? 'Sending…' : '📤 Send'}
// //         </button>
// //         <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '13px', fontFamily: 'inherit' }}>
// //           Discard
// //         </button>
// //       </div>
// //     </div>
// //   )
// // }

// // // ── Main Gmail Panel ──────────────────────────────────────────────────────
// // export function GmailPanel({ defaultCompose = false, replyTo, defaultTo, defaultSubject, onSent, compact = false }: GmailPanelProps) {
// //   const [messages, setMessages] = useState<GmailMessage[]>([])
// //   const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null)
// //   const [isLoading, setIsLoading] = useState(false)
// //   const [error, setError] = useState<string | null>(null)
// //   const [activeLabel, setActiveLabel] = useState('INBOX')
// //   const [searchQuery, setSearchQuery] = useState('')
// //   const [nextPageToken, setNextPageToken] = useState<string | undefined>()
// //   const [showCompose, setShowCompose] = useState(defaultCompose)
// //   const [composeReplyTo, setComposeReplyTo] = useState<GmailMessage | undefined>(replyTo)
// //   const [unreadCount, setUnreadCount] = useState(0)
// //   const searchDebounce = useRef<ReturnType<typeof setTimeout>>()

// //   const fetchMessages = useCallback(async (label: string, q?: string, pageToken?: string) => {
// //     setIsLoading(true)
// //     setError(null)
// //     try {
// //       const params = new URLSearchParams({ label })
// //       if (q) params.set('q', q)
// //       if (pageToken) params.set('pageToken', pageToken)
// //       const res = await fetch(`/api/integrations/google/gmail/messages?${params}`)
// //       const data = await res.json()
// //       if (!res.ok) throw new Error(data.error ?? 'Failed to load Gmail')
// //       setMessages(pageToken ? (prev) => [...prev, ...data.messages] : data.messages)
// //       setNextPageToken(data.nextPageToken)
// //     } catch (e: any) {
// //       setError(e.message)
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }, [])

// //   const fetchUnread = useCallback(async () => {
// //     const res = await fetch('/api/integrations/google/gmail/messages?unreadCount=true')
// //     const data = await res.json()
// //     if (res.ok) setUnreadCount(data.unreadCount ?? 0)
// //   }, [])

// //   useEffect(() => {
// //     fetchMessages('INBOX')
// //     fetchUnread()
// //   }, [fetchMessages, fetchUnread])

// //   const handleLabelChange = (label: string) => {
// //     setActiveLabel(label)
// //     setSearchQuery('')
// //     setSelectedMessage(null)
// //     fetchMessages(label)
// //   }

// //   const handleSearch = (q: string) => {
// //     setSearchQuery(q)
// //     if (searchDebounce.current) clearTimeout(searchDebounce.current)
// //     searchDebounce.current = setTimeout(() => {
// //       if (q.trim()) fetchMessages(activeLabel, q)
// //       else fetchMessages(activeLabel)
// //     }, 350)
// //   }

// //   const openMessage = async (message: GmailMessage) => {
// //     setSelectedMessage(message)
// //     if (!message.isRead) {
// //       await fetch('/api/integrations/google/gmail/messages', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ action: 'read', messageId: message.id }),
// //       })
// //       setMessages((prev) => prev.map((m) => m.id === message.id ? { ...m, isRead: true } : m))
// //       setUnreadCount((c) => Math.max(0, c - 1))
// //     }
// //   }

// //   const handleReply = (message: GmailMessage) => {
// //     setComposeReplyTo(message)
// //     setShowCompose(true)
// //   }

// //   const handleStar = async (e: React.MouseEvent, message: GmailMessage) => {
// //     e.stopPropagation()
// //     const newStarred = !message.isStarred
// //     setMessages((prev) => prev.map((m) => m.id === message.id ? { ...m, isStarred: newStarred } : m))
// //     await fetch('/api/integrations/google/gmail/messages', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ action: 'star', messageId: message.id, starred: newStarred }),
// //     })
// //   }

// //   // const panelHeight = compact ? '420px' : '900px'

// //   return (
// //     <div style={{
// //       display: 'flex',
// //       overflow: 'hidden',
// //       fontFamily: 'system-ui, -apple-system, sans-serif',
// //     }} className='h-screen bg-[#EEE] dark:bg-[#111]'>
// //       {/* Left sidebar */}
// //       <div style={{ width: '180px', borderRight: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
// //         {/* Compose button */}
// //         <div style={{ padding: '14px 12px' }}>
// //           <button
// //             onClick={() => { setComposeReplyTo(undefined); setShowCompose(true) }}
// //             style={{
// //               width: '100%', padding: '9px 14px',
// //               borderRadius: '24px', border: 'none',
// //               backgroundColor: '#4285F4', color: '#fff',
// //               fontSize: '13px', fontWeight: 600, cursor: 'pointer',
// //               fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px',
// //               justifyContent: 'center',
// //             }}
// //           >
// //             ✏️ Compose
// //           </button>
// //         </div>

// //         {/* Labels */}
// //         <div style={{ flex: 1, overflowY: 'auto' }}>
// //           {LABELS.map(({ id, label, icon }) => (
// //             <button
// //               key={id}
// //               onClick={() => handleLabelChange(id)}
// //               style={{
// //                 width: '100%', padding: '8px 14px',
// //                 display: 'flex', alignItems: 'center', gap: '8px',
// //                 border: 'none', cursor: 'pointer',
// //                 backgroundColor: activeLabel === id ? '#EFF6FF' : 'transparent',
// //                 color: activeLabel === id ? '#1D4ED8' : '#374151',
// //                 fontSize: '13px', fontWeight: activeLabel === id ? 600 : 400,
// //                 fontFamily: 'inherit', textAlign: 'left',
// //                 borderRadius: '0 24px 24px 0', marginRight: '8px',
// //               }}
// //             >
// //               <span>{icon}</span>
// //               <span style={{ flex: 1 }}>{label}</span>
// //               {id === 'INBOX' && unreadCount > 0 && (
// //                 <span style={{
// //                   fontSize: '11px', fontWeight: 700,
// //                   backgroundColor: '#3B82F6', color: '#fff',
// //                   borderRadius: '9999px', padding: '1px 6px',
// //                 }}>
// //                   {unreadCount}
// //                 </span>
// //               )}
// //             </button>
// //           ))}
// //         </div>

// //         {/* Gmail branding */}
// //         <div style={{ padding: '10px 14px', borderTop: '1px solid #F9FAFB' }}>
// //           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
// //             <img src="https://www.google.com/favicon.ico" width={14} height={14} alt="G" />
// //             <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Gmail</span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Message list */}
// //       <div style={{ width: '280px', borderRight: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
// //         {/* Search */}
// //         <div style={{ padding: '10px 12px', borderBottom: '1px solid #F9FAFB' }}>
// //           <div style={{ position: 'relative' }}>
// //             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }}>
// //               <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
// //             </svg>
// //             <input
// //               value={searchQuery}
// //               onChange={(e) => handleSearch(e.target.value)}
// //               placeholder="Search mail…"
// //               style={{
// //                 width: '100%', padding: '7px 9px 7px 28px',
// //                 border: '1px solid #E5E7EB', borderRadius: '8px',
// //                 fontSize: '12.5px', outline: 'none',
// //                 backgroundColor: '#F9FAFB', fontFamily: 'inherit',
// //                 boxSizing: 'border-box',
// //               }}
// //             />
// //           </div>
// //         </div>

// //         <div style={{ flex: 1, overflowY: 'auto' }}>
// //           {isLoading && messages.length === 0 && (
// //             <div style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>Loading…</div>
// //           )}
// //           {error && (
// //             <div style={{ padding: '16px', color: '#EF4444', fontSize: '12.5px' }}>
// //               {error.includes('not connected')
// //                 ? <><p style={{ margin: '0 0 8px' }}>Gmail not connected.</p><a href="/settings/integrations" style={{ color: '#3B82F6' }}>Connect →</a></>
// //                 : error}
// //             </div>
// //           )}
// //           {messages.map((message) => (
// //             <div
// //               key={message.id}
// //               onClick={() => openMessage(message)}
// //               style={{
// //                 padding: '10px 12px',
// //                 cursor: 'pointer',
// //                 borderBottom: '1px solid #F9FAFB',
// //                 backgroundColor: selectedMessage?.id === message.id
// //                   ? '#EFF6FF'
// //                   : !message.isRead ? '#FAFBFF' : 'transparent',
// //                 borderLeft: selectedMessage?.id === message.id ? '3px solid #4285F4' : '3px solid transparent',
// //                 transition: 'background 0.1s',
// //               }}
// //             >
// //               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
// //                 <span style={{ fontSize: '12.5px', fontWeight: message.isRead ? 400 : 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
// //                   {message.from.name ?? message.from.email}
// //                 </span>
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
// //                   <button onClick={(e) => handleStar(e, message)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, opacity: message.isStarred ? 1 : 0.3 }}>⭐</button>
// //                   <span style={{ fontSize: '10.5px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{formatDate(message.date)}</span>
// //                 </div>
// //               </div>
// //               <div style={{ fontSize: '12px', fontWeight: message.isRead ? 400 : 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// //                 {message.subject}
// //               </div>
// //               <div style={{ fontSize: '11.5px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
// //                 {message.snippet}
// //               </div>
// //               {message.hasAttachments && <span style={{ fontSize: '11px', color: '#9CA3AF' }}>📎</span>}
// //             </div>
// //           ))}
// //           {nextPageToken && (
// //             <button onClick={() => fetchMessages(activeLabel, searchQuery || undefined, nextPageToken)} style={{ width: '100%', padding: '8px', border: 'none', backgroundColor: '#F9FAFB', cursor: 'pointer', fontSize: '12px', color: '#6B7280', fontFamily: 'inherit' }}>
// //               {isLoading ? 'Loading…' : 'Load more'}
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {/* Message reader */}
// //       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
// //         {!selectedMessage ? (
// //           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', flexDirection: 'column', gap: '8px' }}>
// //             <div style={{ fontSize: '36px' }}>✉️</div>
// //             <p style={{ fontSize: '13.5px', fontWeight: 500, color: '#374151', margin: 0 }}>Select a message</p>
// //             <p style={{ fontSize: '12px', margin: 0 }}>Choose a message from the list to read it</p>
// //           </div>
// //         ) : (
// //           <>
// //             <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
// //               <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
// //                 {selectedMessage.subject}
// //               </h2>
// //               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
// //                 <div style={{
// //                   width: '32px', height: '32px', borderRadius: '50%',
// //                   backgroundColor: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center',
// //                   color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0,
// //                 }}>
// //                   {(selectedMessage.from.name ?? selectedMessage.from.email)[0].toUpperCase()}
// //                 </div>
// //                 <div>
// //                   <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
// //                     {selectedMessage.from.name ?? selectedMessage.from.email}
// //                     <span style={{ color: '#9CA3AF', fontWeight: 400, marginLeft: '6px', fontSize: '12px' }}>
// //                       &lt;{selectedMessage.from.email}&gt;
// //                     </span>
// //                   </div>
// //                   <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>
// //                     to {selectedMessage.to.map((t) => t.email).join(', ')} · {new Date(selectedMessage.date).toLocaleString()}
// //                   </div>
// //                 </div>
// //                 <button
// //                   onClick={() => handleReply(selectedMessage)}
// //                   style={{
// //                     marginLeft: 'auto', padding: '7px 16px',
// //                     borderRadius: '8px', border: '1.5px solid #E5E7EB',
// //                     backgroundColor: '#fff', color: '#374151',
// //                     fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
// //                   }}
// //                 >
// //                   ↩️ Reply
// //                 </button>
// //               </div>
// //             </div>

// //             <div
// //               style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}
// //               dangerouslySetInnerHTML={{ __html: selectedMessage.body }}
// //             />
// //           </>
// //         )}
// //       </div>

// //       {/* Compose window */}
// //       {showCompose && (
// //         <ComposeModal
// //           onClose={() => { setShowCompose(false); setComposeReplyTo(undefined) }}
// //           onSent={onSent}
// //           replyTo={composeReplyTo}
// //           defaultTo={defaultTo}
// //           defaultSubject={defaultSubject}
// //         />
// //       )}
// //     </div>
// //   )
// // }

// 'use client';

// import {
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
//   type ReactNode,
// } from 'react';
// import { X, Expand } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';
// import {
//   HoverCard,
//   HoverCardContent,
//   HoverCardTrigger,
// } from '@/components/ui/hover-card';
// import {
//   ResizablePanel,
// } from '@/components/ui/resizable';

// // ── Icons from Conferio icons/icons.tsx (exact SVG paths) ──────────────────

// const ArrowsPointingIn = ({ className }: { className?: string }) => (
//   <svg width="20" height="20" viewBox="0 -1 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path
//       fillRule="evenodd"
//       clipRule="evenodd"
//       className={className}
//       d="M0.219671 0.21967C0.512564 -0.0732233 0.987438 -0.0732233 1.28033 0.21967L5.25 4.18934L5.25 1.5C5.25 1.08579 5.58579 0.75 6 0.75C6.41421 0.75 6.75 1.08579 6.75 1.5L6.75 6C6.75 6.41421 6.41421 6.75 6 6.75H1.5C1.08579 6.75 0.75 6.41421 0.75 6C0.75 5.58579 1.08579 5.25 1.5 5.25L4.18934 5.25L0.219671 1.28033C-0.0732224 0.987437 -0.0732223 0.512563 0.219671 0.21967ZM17.7803 0.21967C18.0732 0.512564 18.0732 0.987437 17.7803 1.28033L13.8107 5.25H16.5C16.9142 5.25 17.25 5.58579 17.25 6C17.25 6.41421 16.9142 6.75 16.5 6.75H12C11.5858 6.75 11.25 6.41421 11.25 6V1.5C11.25 1.08579 11.5858 0.75 12 0.75C12.4142 0.75 12.75 1.08579 12.75 1.5V4.18934L16.7197 0.21967C17.0126 -0.0732228 17.4874 -0.0732228 17.7803 0.21967ZM0.75 12C0.75 11.5858 1.08579 11.25 1.5 11.25L6 11.25C6.41421 11.25 6.75 11.5858 6.75 12V16.5C6.75 16.9142 6.41421 17.25 6 17.25C5.58579 17.25 5.25 16.9142 5.25 16.5L5.25 13.8107L1.28033 17.7803C0.987437 18.0732 0.512563 18.0732 0.21967 17.7803C-0.0732233 17.4874 -0.0732233 17.0126 0.21967 16.7197L4.18934 12.75H1.5C1.08579 12.75 0.75 12.4142 0.75 12ZM11.25 12C11.25 11.5858 11.5858 11.25 12 11.25H16.5C16.9142 11.25 17.25 11.5858 17.25 12C17.25 12.4142 16.9142 12.75 16.5 12.75H13.8107L17.7803 16.7197C18.0732 17.0126 18.0732 17.4874 17.7803 17.7803C17.4874 18.0732 17.0126 18.0732 16.7197 17.7803L12.75 13.8107V16.5C12.75 16.9142 12.4142 17.25 12 17.25C11.5858 17.25 11.25 16.9142 11.25 16.5L11.25 12Z"
//     />
//   </svg>
// );

// const PanelLeftOpen = ({ className }: { className?: string }) => (
//   <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path
//       fillRule="evenodd"
//       clipRule="evenodd"
//       d="M4.8 12C3.11984 12 2.27976 12 1.63803 11.673C1.07354 11.3854 0.614601 10.9265 0.32698 10.362C0 9.72024 0 8.88016 0 7.2V4.8C0 3.11984 0 2.27976 0.32698 1.63803C0.614601 1.07354 1.07354 0.614601 1.63803 0.32698C2.27976 0 3.11984 0 4.8 0H9.2C10.8802 0 11.7202 0 12.362 0.32698C12.9265 0.614601 13.3854 1.07354 13.673 1.63803C14 2.27976 14 3.11984 14 4.8V7.2C14 8.88016 14 9.72024 13.673 10.362C13.3854 10.9265 12.9265 11.3854 12.362 11.673C11.7202 12 10.8802 12 9.2 12H4.8ZM10.1 1.5C10.9401 1.5 11.3601 1.5 11.681 1.66349C11.9632 1.8073 12.1927 2.03677 12.3365 2.31901C12.5 2.63988 12.5 3.05992 12.5 3.9V8.1C12.5 8.94008 12.5 9.36012 12.3365 9.68099C12.1927 9.96323 11.9632 10.1927 11.681 10.3365C11.3601 10.5 10.9401 10.5 10.1 10.5H9.9C9.05992 10.5 8.63988 10.5 8.31901 10.3365C8.03677 10.1927 7.8073 9.96323 7.66349 9.68099C7.5 9.36012 7.5 8.94008 7.5 8.1V3.9C7.5 3.05992 7.5 2.63988 7.66349 2.31901C7.8073 2.03677 8.03677 1.8073 8.31901 1.66349C8.63988 1.5 9.05992 1.5 9.9 1.5H10.1ZM1.96094 2.82422C1.96094 2.47904 2.24076 2.19922 2.58594 2.19922H4.08594C4.43112 2.19922 4.71094 2.47904 4.71094 2.82422C4.71094 3.1694 4.43112 3.44922 4.08594 3.44922H2.58594C2.24076 3.44922 1.96094 3.1694 1.96094 2.82422ZM2.58594 4.19531C2.24076 4.19531 1.96094 4.47513 1.96094 4.82031C1.96094 5.16549 2.24076 5.44531 2.58594 5.44531H4.08594C4.43112 5.44531 4.71094 5.16549 4.71094 4.82031C4.71094 4.47513 4.43112 4.19531 4.08594 4.19531H2.58594Z"
//     />
//   </svg>
// );

// const Phone = ({ className }: { className?: string }) => (
//   <svg width="14" height="24" viewBox="0 0 14 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path d="M5.5 18.75C5.08579 18.75 4.75 19.0858 4.75 19.5C4.75 19.9142 5.08579 20.25 5.5 20.25H8.5C8.91421 20.25 9.25 19.9142 9.25 19.5C9.25 19.0858 8.91421 18.75 8.5 18.75H5.5Z" fill="currentColor" />
//     <path fillRule="evenodd" clipRule="evenodd" d="M3.625 0.75C1.76104 0.75 0.25 2.26104 0.25 4.125V19.875C0.25 21.739 1.76104 23.25 3.625 23.25H10.375C12.239 23.25 13.75 21.739 13.75 19.875V4.125C13.75 2.26104 12.239 0.75 10.375 0.75H3.625ZM2.5 4.125C2.5 3.50368 3.00368 3 3.625 3H4.75V3.375C4.75 3.99632 5.25368 4.5 5.875 4.5H8.125C8.74632 4.5 9.25 3.99632 9.25 3.375V3H10.375C10.9963 3 11.5 3.50368 11.5 4.125V19.875C11.5 20.4963 10.9963 21 10.375 21H3.625C3.00368 21 2.5 20.4963 2.5 19.875V4.125Z" />
//   </svg>
// );

// const Star2 = ({ className }: { className?: string }) => (
//   <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path fillRule="evenodd" clipRule="evenodd" d="M7.99934 1.75C8.30229 1.75 8.57549 1.93226 8.69183 2.21198L10.1029 5.60466L13.7656 5.8983C14.0676 5.92251 14.3254 6.12601 14.419 6.41413C14.5126 6.70226 14.4237 7.01841 14.1936 7.21549L11.403 9.60592L12.2556 13.1801C12.3259 13.4748 12.212 13.7828 11.9669 13.9609C11.7218 14.1389 11.3936 14.1521 11.1351 13.9942L7.99934 12.0788L4.86357 13.9942C4.60503 14.1521 4.27688 14.1389 4.03179 13.9609C3.7867 13.7828 3.6728 13.4748 3.7431 13.1801L4.59566 9.60592L1.80508 7.21549C1.57501 7.01841 1.48609 6.70226 1.57971 6.41413C1.67333 6.12601 1.93109 5.92251 2.23307 5.8983L5.89575 5.60466L7.30685 2.21198C7.42319 1.93226 7.69639 1.75 7.99934 1.75Z" />
//   </svg>
// );

// const Archive2 = ({ className }: { className?: string }) => (
//   <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M3 2C2.44772 2 2 2.44772 2 3V4C2 4.55228 2.44772 5 3 5H13C13.5523 5 14 4.55228 14 4V3C14 2.44772 13.5523 2 13 2H3Z" />
//     <path fillRule="evenodd" clipRule="evenodd" d="M3 6H13V12C13 13.1046 12.1046 14 11 14H5C3.89543 14 3 13.1046 3 12V6ZM6 8.75C6 8.33579 6.33579 8 6.75 8H9.25C9.66421 8 10 8.33579 10 8.75C10 9.16421 9.66421 9.5 9.25 9.5H6.75C6.33579 9.5 6 9.16421 6 8.75Z" />
//   </svg>
// );

// const Trash = ({ className }: { className?: string }) => (
//   <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path fillRule="evenodd" clipRule="evenodd" d="M5 3.25V4H2.75C2.33579 4 2 4.33579 2 4.75C2 5.16421 2.33579 5.5 2.75 5.5H3.05L3.86493 13.6493C3.94161 14.4161 4.58685 15 5.35748 15H10.6425C11.4131 15 12.0584 14.4161 12.1351 13.6493L12.95 5.5H13.25C13.6642 5.5 14 5.16421 14 4.75C14 4.33579 13.6642 4 13.25 4H11V3.25C11 2.00736 9.99264 1 8.75 1H7.25C6.00736 1 5 2.00736 5 3.25ZM7.25 2.5C6.83579 2.5 6.5 2.83579 6.5 3.25V4H9.5V3.25C9.5 2.83579 9.16421 2.5 8.75 2.5H7.25ZM6.05044 6.00094C6.46413 5.98025 6.81627 6.29885 6.83696 6.71255L7.11195 12.2125C7.13264 12.6262 6.81404 12.9784 6.40034 12.9991C5.98665 13.0197 5.63451 12.7011 5.61383 12.2875L5.33883 6.78745C5.31814 6.37376 5.63674 6.02162 6.05044 6.00094ZM9.95034 6.00094C10.364 6.02162 10.6826 6.37376 10.662 6.78745L10.387 12.2875C10.3663 12.7011 10.0141 13.0197 9.60044 12.9991C9.18674 12.9784 8.86814 12.6262 8.88883 12.2125L9.16383 6.71255C9.18451 6.29885 9.53665 5.98025 9.95034 6.00094Z" />
//   </svg>
// );

// // ── Types ──────────────────────────────────────────────────────────────────

// export interface GmailAddress {
//   name?: string;
//   email: string;
// }

// export interface GmailMessage {
//   id: string;
//   threadId: string;
//   subject: string;
//   from: GmailAddress;
//   to: GmailAddress[];
//   snippet: string;
//   body: string;
//   bodyPlain: string;
//   date: string;
//   isRead: boolean;
//   isStarred: boolean;
//   hasAttachments: boolean;
//   labelIds: string[];
// }

// export type ViewMode = 'sidebar' | 'popup' | 'fullscreen';

// export interface GmailPanelProps {
//   defaultCompose?: boolean;
//   replyTo?: GmailMessage;
//   defaultTo?: string;
//   defaultSubject?: string;
//   onSent?: () => void;
//   viewMode?: ViewMode;
//   onClose?: () => void;
// }

// // ── Helpers ────────────────────────────────────────────────────────────────

// function formatDate(iso: string) {
//   const d = new Date(iso);
//   const now = new Date();
//   const diff = now.getTime() - d.getTime();
//   if (diff < 86_400_000)
//     return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//   if (diff < 7 * 86_400_000)
//     return d.toLocaleDateString('en-US', { weekday: 'short' });
//   return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
// }

// const LABELS = [
//   { id: 'INBOX',   label: 'Inbox',   icon: '📥' },
//   { id: 'SENT',    label: 'Sent',    icon: '📤' },
//   { id: 'STARRED', label: 'Starred', icon: '⭐' },
//   { id: 'DRAFT',   label: 'Drafts',  icon: '📋' },
// ] as const;

// // ── ChatHeader — exact copy of ChatHeader in displayThreadSidebar.tsx ───────
// // Substituting ThreadDisplay with GmailPanel content, but header is identical.

// interface GmailChatHeaderProps {
//   onClose: () => void;
//   onToggleFullScreen: () => void;
//   onToggleViewMode: () => void;
//   isFullScreen: boolean;
//   isPopup: boolean;
// }

// function GmailChatHeader({
//   onClose,
//   onToggleFullScreen,
//   onToggleViewMode,
//   isFullScreen,
//   isPopup,
// }: GmailChatHeaderProps) {
//   return (
//     // Exact class string from displayThreadSidebar.tsx ChatHeader
//     <div className="relative flex items-center justify-between px-2.5 pb-[4px] pt-[5px]">
//       <TooltipProvider delayDuration={0}>
//         <Tooltip>
//           <TooltipTrigger asChild>
//             <Button onClick={onClose} variant="ghost" className="md:h-fit md:px-2">
//               <X className="dark:text-iconDark text-iconLight" />
//               <span className="sr-only">Close</span>
//             </Button>
//           </TooltipTrigger>
//           <TooltipContent>Close</TooltipContent>
//         </Tooltip>
//       </TooltipProvider>

//       <div className="flex items-center gap-2">
//         {isFullScreen ? (
//           <TooltipProvider delayDuration={0}>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   onClick={onToggleFullScreen}
//                   variant="ghost"
//                   className="hidden md:flex md:h-fit md:px-2"
//                 >
//                   <ArrowsPointingIn className="dark:fill-iconDark fill-iconLight" />
//                   <span className="sr-only">Toggle view mode</span>
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>Remove full screen</TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         ) : (
//           <>
//             <TooltipProvider delayDuration={0}>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     onClick={onToggleFullScreen}
//                     variant="ghost"
//                     className="hidden md:flex md:h-fit md:px-2"
//                   >
//                     <Expand className="dark:text-iconDark text-iconLight" />
//                     <span className="sr-only">Toggle view mode</span>
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>Go to full screen</TooltipContent>
//               </Tooltip>
//             </TooltipProvider>

//             <TooltipProvider delayDuration={0}>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     onClick={onToggleViewMode}
//                     variant="ghost"
//                     className="hidden md:flex md:h-fit md:px-2"
//                   >
//                     {isPopup ? (
//                       <PanelLeftOpen className="dark:fill-iconDark fill-iconLight" />
//                     ) : (
//                       <Phone className="dark:fill-iconDark fill-iconLight" />
//                     )}
//                     <span className="sr-only"></span>
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>Go to {isPopup ? 'sidebar' : 'popup'}</TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── ComposeModal — fixed bottom-right compose window ──────────────────────

// interface ComposeModalProps {
//   onClose: () => void;
//   onSent?: () => void;
//   replyTo?: GmailMessage;
//   defaultTo?: string;
//   defaultSubject?: string;
// }

// function ComposeModal({
//   onClose,
//   onSent,
//   replyTo,
//   defaultTo = '',
//   defaultSubject = '',
// }: ComposeModalProps) {
//   const [to, setTo] = useState(replyTo ? replyTo.from.email : defaultTo);
//   const [subject, setSubject] = useState(
//     replyTo ? `Re: ${replyTo.subject}` : defaultSubject,
//   );
//   const [body, setBody] = useState(
//     replyTo
//       ? `\n\n---\nOn ${formatDate(replyTo.date)}, ${replyTo.from.name ?? replyTo.from.email} wrote:\n${replyTo.bodyPlain.slice(0, 300)}…`
//       : '',
//   );
//   const [cc, setCc] = useState('');
//   const [showCc, setShowCc] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSend = async () => {
//     if (!to.trim() || !subject.trim() || !body.trim()) {
//       setError('To, subject, and body are required');
//       return;
//     }
//     setIsSending(true);
//     setError(null);
//     try {
//       const res = await fetch('/api/integrations/google/gmail/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'send',
//           to: to.split(',').map((e) => e.trim()),
//           subject,
//           emailBody: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">${body.replace(/\n/g, '<br>')}</div>`,
//           cc: cc ? cc.split(',').map((e) => e.trim()) : undefined,
//           replyToMessageId: replyTo?.id,
//           threadId: replyTo?.threadId,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error ?? 'Send failed');
//       onSent?.();
//       onClose();
//     } catch (e: unknown) {
//       setError(e instanceof Error ? e.message : 'Unknown error');
//     } finally {
//       setIsSending(false);
//     }
//   };

//   return (
//     // Fixed bottom-right overlay — identical positioning to original
//     <div className="fixed bottom-5 right-5 z-[9990] flex w-[520px] max-w-[96vw] flex-col overflow-hidden rounded-[14px] border border-border bg-panelLight shadow-[0_20px_60px_rgba(0,0,0,0.20)] dark:bg-panelDark">
//       {/* Header */}
//       <div className="flex items-center justify-between bg-[#1a1a2e] px-4 py-3">
//         <span className="text-[13.5px] font-semibold text-white">
//           {replyTo ? '↩️ Reply' : '✉️ New Message'}
//         </span>
//         <button
//           onClick={onClose}
//           className="cursor-pointer border-none bg-transparent p-0 text-base leading-none text-[#9CA3AF] hover:text-white"
//         >
//           ×
//         </button>
//       </div>

//       {/* Fields */}
//       <div className="border-b border-border">
//         {[
//           { label: 'To', value: to, onChange: setTo, placeholder: 'recipient@email.com' },
//           ...(showCc
//             ? [{ label: 'Cc', value: cc, onChange: setCc, placeholder: 'cc@email.com' }]
//             : []),
//           { label: 'Subject', value: subject, onChange: setSubject, placeholder: 'Subject' },
//         ].map(({ label, value, onChange, placeholder }) => (
//           <div
//             key={label}
//             className="flex items-center border-b border-muted/50 px-4 last:border-b-0"
//           >
//             <span className="w-[52px] flex-shrink-0 text-[12px] text-muted-foreground">
//               {label}
//             </span>
//             <input
//               value={value}
//               onChange={(e) => onChange(e.target.value)}
//               placeholder={placeholder}
//               className="flex-1 border-none bg-transparent py-[10px] text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground"
//             />
//             {label === 'To' && !showCc && (
//               <button
//                 onClick={() => setShowCc(true)}
//                 className="cursor-pointer border-none bg-transparent text-[11.5px] text-muted-foreground hover:text-foreground"
//               >
//                 Cc
//               </button>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Body */}
//       <textarea
//         value={body}
//         onChange={(e) => setBody(e.target.value)}
//         placeholder="Write your message…"
//         className="min-h-[180px] flex-1 resize-none border-none bg-transparent px-4 py-[14px] text-[13.5px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
//       />

//       {error && (
//         <div className="bg-destructive/10 px-4 py-2 text-[12.5px] text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Footer */}
//       <div className="flex items-center justify-between border-t border-border px-4 py-[10px]">
//         <button
//           onClick={handleSend}
//           disabled={isSending}
//           className={cn(
//             'cursor-pointer rounded-lg border-none bg-[#4285F4] px-6 py-[9px] text-[13.5px] font-semibold text-white transition-colors hover:bg-[#3b78e7]',
//             isSending && 'cursor-not-allowed opacity-70',
//           )}
//         >
//           {isSending ? 'Sending…' : '📤 Send'}
//         </button>
//         <button
//           onClick={onClose}
//           className="cursor-pointer border-none bg-transparent text-[13px] text-muted-foreground hover:text-foreground"
//         >
//           Discard
//         </button>
//       </div>
//     </div>
//   );
// }

// // ── Gmail Panel Body — the actual three-column inbox UI ────────────────────

// interface GmailPanelBodyProps {
//   defaultCompose?: boolean;
//   replyTo?: GmailMessage;
//   defaultTo?: string;
//   defaultSubject?: string;
//   onSent?: () => void;
// }

// function GmailPanelBody({
//   defaultCompose = false,
//   replyTo: replyToProp,
//   defaultTo,
//   defaultSubject,
//   onSent,
// }: GmailPanelBodyProps) {
//   const [messages, setMessages] = useState<GmailMessage[]>([]);
//   const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [activeLabel, setActiveLabel] = useState('INBOX');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [nextPageToken, setNextPageToken] = useState<string | undefined>();
//   const [showCompose, setShowCompose] = useState(defaultCompose);
//   const [composeReplyTo, setComposeReplyTo] = useState<GmailMessage | undefined>(replyToProp);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

//   const fetchMessages = useCallback(
//     async (label: string, q?: string, pageToken?: string) => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const params = new URLSearchParams({ label });
//         if (q) params.set('q', q);
//         if (pageToken) params.set('pageToken', pageToken);
//         const res = await fetch(`/api/integrations/google/gmail/messages?${params}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error ?? 'Failed to load Gmail');
//         setMessages((prev) =>
//           pageToken ? [...prev, ...data.messages] : data.messages,
//         );
//         setNextPageToken(data.nextPageToken);
//       } catch (e: unknown) {
//         setError(e instanceof Error ? e.message : 'Unknown error');
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [],
//   );

//   const fetchUnread = useCallback(async () => {
//     const res = await fetch('/api/integrations/google/gmail/messages?unreadCount=true');
//     const data = await res.json();
//     if (res.ok) setUnreadCount(data.unreadCount ?? 0);
//   }, []);

//   useEffect(() => {
//     fetchMessages('INBOX');
//     fetchUnread();
//   }, [fetchMessages, fetchUnread]);

//   const handleLabelChange = (label: string) => {
//     setActiveLabel(label);
//     setSearchQuery('');
//     setSelectedMessage(null);
//     fetchMessages(label);
//   };

//   const handleSearch = (q: string) => {
//     setSearchQuery(q);
//     if (searchDebounce.current) clearTimeout(searchDebounce.current);
//     searchDebounce.current = setTimeout(() => {
//       if (q.trim()) fetchMessages(activeLabel, q);
//       else fetchMessages(activeLabel);
//     }, 350);
//   };

//   const openMessage = async (message: GmailMessage) => {
//     setSelectedMessage(message);
//     if (!message.isRead) {
//       await fetch('/api/integrations/google/gmail/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'read', messageId: message.id }),
//       });
//       setMessages((prev) =>
//         prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m)),
//       );
//       setUnreadCount((c) => Math.max(0, c - 1));
//     }
//   };

//   const handleReply = (message: GmailMessage) => {
//     setComposeReplyTo(message);
//     setShowCompose(true);
//   };

//   const handleStar = async (e: React.MouseEvent, message: GmailMessage) => {
//     e.stopPropagation();
//     const newStarred = !message.isStarred;
//     setMessages((prev) =>
//       prev.map((m) => (m.id === message.id ? { ...m, isStarred: newStarred } : m)),
//     );
//     await fetch('/api/integrations/google/gmail/messages', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ action: 'star', messageId: message.id, starred: newStarred }),
//     });
//   };

//   const handleDelete = async (e: React.MouseEvent, message: GmailMessage) => {
//     e.stopPropagation();
//     setMessages((prev) => prev.filter((m) => m.id !== message.id));
//     if (selectedMessage?.id === message.id) setSelectedMessage(null);
//     await fetch('/api/integrations/google/gmail/messages', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ action: 'trash', messageId: message.id }),
//     });
//   };

//   const handleArchive = async (e: React.MouseEvent, message: GmailMessage) => {
//     e.stopPropagation();
//     setMessages((prev) => prev.filter((m) => m.id !== message.id));
//     if (selectedMessage?.id === message.id) setSelectedMessage(null);
//     await fetch('/api/integrations/google/gmail/messages', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ action: 'archive', messageId: message.id }),
//     });
//   };

//   return (
//     // Outer wrapper — same as mail.tsx ResizablePanel inner div
//     <div className="flex h-full overflow-hidden">

//       {/* ── Left sidebar ──────────────────────────────────────── */}
//       <div className="flex w-[180px] flex-shrink-0 flex-col border-r border-border">

//         {/* Compose — matches the compose button style from the original GmailPanel */}
//         <div className="  p-3 .5">
//           <button
//             onClick={() => { setComposeReplyTo(undefined); setShowCompose(true); }}
//             className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border-none bg-[#4285F4] px-3.5 py-[9px] text-[13px] font-semibold text-white transition-colors hover:bg-[#3b78e7]"
//           >
//             ✏️ Compose
//           </button>
//         </div>

//         {/* Label list — same rounded-r-3xl active style as the original */}
//         <div className="flex-1 overflow-y-auto">
//           {LABELS.map(({ id, label, icon }) => (
//             <button
//               key={id}
//               onClick={() => handleLabelChange(id)}
//               className={cn(
//                 'mr-2 flex w-full cursor-pointer items-center gap-2 border-none py-2 pl-3.5 pr-2 text-left text-[13px] transition-colors',
//                 'rounded-r-3xl',
//                 activeLabel === id
//                   ? 'bg-[#EFF6FF] font-semibold text-[#1D4ED8] dark:bg-blue-950/40 dark:text-blue-400'
//                   : 'bg-transparent font-normal text-foreground hover:bg-offsetLight dark:hover:bg-primary/5',
//               )}
//             >
//               <span>{icon}</span>
//               <span className="flex-1">{label}</span>
//               {id === 'INBOX' && unreadCount > 0 && (
//                 <span className="rounded-full bg-[#3B82F6] px-1.5 py-px text-[11px] font-bold text-white">
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Gmail branding */}
//         <div className="flex items-center gap-1.5 border-t border-border px-3.5 py-2.5">
//           <img src="https://www.google.com/favicon.ico" width={14} height={14} alt="Gmail" />
//           <span className="text-[11px] text-muted-foreground">Gmail</span>
//         </div>
//       </div>

//       {/* ── Message list ──────────────────────────────────────── */}
//       <div className="flex w-[280px] flex-shrink-0 flex-col border-r border-border">

//         {/* Search bar */}
//         <div className="border-b border-border px-3 py-2.5">
//           <div className="relative">
//             <svg
//               width="13" height="13" viewBox="0 0 24 24" fill="none"
//               stroke="currentColor" strokeWidth="2"
//               className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
//             >
//               <circle cx="11" cy="11" r="8" />
//               <path d="m21 21-4.35-4.35" />
//             </svg>
//             <input
//               value={searchQuery}
//               onChange={(e) => handleSearch(e.target.value)}
//               placeholder="Search mail…"
//               className="w-full rounded-lg border border-input bg-background py-[7px] pl-7 pr-3 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
//             />
//           </div>
//         </div>

//         {/* List */}
//         <div className="flex-1 overflow-y-auto">
//           {isLoading && messages.length === 0 && (
//             <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
//               Loading…
//             </div>
//           )}
//           {error && (
//             <div className="  p-4  text-[12.5px] text-destructive">
//               {error.includes('not connected') ? (
//                 <>
//                   <p className="mb-2">Gmail not connected.</p>
//                   <a href="/settings/integrations" className="text-[#3B82F6] underline">
//                     Connect →
//                   </a>
//                 </>
//               ) : (
//                 error
//               )}
//             </div>
//           )}

//           {messages.map((message, index) => (
//             // MailHoverCard — exact same as MailHoverCard.tsx: openDelay=300, side="right", align="start"
//             <HoverCard key={message.id} openDelay={300} closeDelay={100}>
//               <HoverCardTrigger asChild>
//                 {/* Thread row — same group/hover/selected pattern as mail-list.tsx Thread */}
//                 <div
//                   onClick={() => openMessage(message)}
//                   className={cn(
//                     // From Thread in mail-list.tsx: select-none border-b md:my-1 md:border-none
//                     'select-none border-b md:my-1 md:border-none',
//                   )}
//                 >
//                   <div
//                     className={cn(
//                       // From Thread div in mail-list.tsx — exact classes
//                       'hover:bg-offsetLight dark:hover:bg-primary/5 group relative mx-1 flex cursor-pointer flex-col items-start rounded-lg py-2 text-left text-sm hover:opacity-100',
//                       (selectedMessage?.id === message.id) && 'border-border bg-primary/5 opacity-100',
//                       'relative group',
//                     )}
//                   >
//                     {/* Hover action bar — exact same as Thread in mail-list.tsx */}
//                     <div
//                       className={cn(
//                         'dark:bg-panelDark z-25 absolute right-2 flex -translate-y-1/2 items-center gap-1 rounded-xl border bg-white p-1 opacity-0 shadow-sm group-hover:opacity-100',
//                         index === 0 ? 'top-4' : 'top-[-1px]',
//                       )}
//                     >
//                       {/* Star */}
//                       <TooltipProvider delayDuration={0}>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-6 w-6 overflow-visible [&_svg]:size-3.5"
//                               onClick={(e) => handleStar(e, message)}
//                             >
//                               <Star2
//                                 className={cn(
//                                   'h-4 w-4',
//                                   message.isStarred
//                                     ? 'fill-yellow-400 stroke-yellow-400'
//                                     : 'fill-transparent stroke-[#9D9D9D] dark:stroke-[#9D9D9D]',
//                                 )}
//                               />
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent side={index === 0 ? 'bottom' : 'top'} className="mb-1 bg-white dark:bg-[#1A1A1A]">
//                             {message.isStarred ? 'Unstar' : 'Star'}
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>

//                       {/* Archive */}
//                       <TooltipProvider delayDuration={0}>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-6 w-6 [&_svg]:size-3.5"
//                               onClick={(e) => handleArchive(e, message)}
//                             >
//                               <Archive2 className="fill-[#9D9D9D]" />
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent side={index === 0 ? 'bottom' : 'top'} className="dark:bg-panelDark mb-1 bg-white">
//                             Archive
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>

//                       {/* Delete */}
//                       <TooltipProvider delayDuration={0}>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-6 w-6 hover:bg-[#FDE4E9] dark:hover:bg-[#411D23] [&_svg]:size-3.5"
//                               onClick={(e) => handleDelete(e, message)}
//                             >
//                               <Trash className="fill-[#F43F5E]" />
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent side={index === 0 ? 'bottom' : 'top'} className="dark:bg-panelDark mb-1 bg-white">
//                             Delete
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     </div>

//                     {/* Row content — same px-6 layout as Thread */}
//                     <div className={`relative flex w-full items-center justify-between gap-4 px-6 ${!message.isRead ? '' : 'opacity-60'}`}>
//                       {/* Unread dot — exact from Thread */}
//                       {!message.isRead && selectedMessage?.id !== message.id && (
//                         <span className="absolute left-2 top-3.5 size-1.5 rounded bg-[#006FFE]" />
//                       )}

//                       {/* Avatar initials circle */}
//                       <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#4285F4] text-[13px] font-bold text-white">
//                         {(message.from.name ?? message.from.email)[0].toUpperCase()}
//                       </div>

//                       <div className="flex w-full justify-between">
//                         <div className="w-full">
//                           <div className="flex w-full flex-row items-center justify-between">
//                             {/* Sender name */}
//                             <span
//                               className={cn(
//                                 'text-md flex items-baseline gap-1 group-hover:opacity-100',
//                                 !message.isRead && selectedMessage?.id !== message.id
//                                   ? 'font-bold'
//                                   : 'font-medium',
//                               )}
//                             >
//                               <span className="line-clamp-1 overflow-hidden text-sm">
//                                 {message.from.name ?? message.from.email}
//                               </span>
//                             </span>
//                             {/* Date */}
//                             <p className="text-muted-foreground text-nowrap text-xs font-normal opacity-70 transition-opacity group-hover:opacity-100 dark:text-[#8C8C8C]">
//                               {formatDate(message.date)}
//                             </p>
//                           </div>
//                           {/* Subject */}
//                           <p
//                             className={cn(
//                               'mt-1 line-clamp-1 w-[95%] min-w-0 overflow-hidden text-start text-sm text-[#8C8C8C]',
//                             )}
//                           >
//                             {message.subject}
//                           </p>
//                           {/* Snippet */}
//                           <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
//                             {message.snippet}
//                           </div>
//                           {message.hasAttachments && (
//                             <span className="text-muted-foreground mt-0.5 block text-[11px]">📎</span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </HoverCardTrigger>

//               {/* HoverCard content — exact from MailHoverCard.tsx */}
//               <HoverCardContent
//                 side="right"
//                 align="start"
//                 className="w-[420px] max-h-[320px] overflow-hidden p-4"
//               >
//                 <div className="gap-y-2">
//                   <div className="truncate text-sm font-semibold">
//                     {message.subject || 'No subject'}
//                   </div>
//                   <div className="text-xs text-muted-foreground">
//                     From: {message.from.name} &lt;{message.from.email}&gt;
//                   </div>
//                   <div className="text-xs text-muted-foreground">
//                     {new Date(message.date).toLocaleString('en-US', {
//                       month: 'short', day: 'numeric', year: 'numeric',
//                       hour: '2-digit', minute: '2-digit',
//                     })}
//                   </div>
//                   <div className="line-clamp-5 border-t pt-2 text-sm">
//                     <div dangerouslySetInnerHTML={{ __html: message.body }} />
//                   </div>
//                 </div>
//               </HoverCardContent>
//             </HoverCard>
//           ))}

//           {nextPageToken && (
//             <button
//               onClick={() => fetchMessages(activeLabel, searchQuery || undefined, nextPageToken)}
//               className="w-full cursor-pointer border-none bg-muted/40 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-muted/70"
//             >
//               {isLoading ? 'Loading…' : 'Load more'}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ── Message reader ────────────────────────────────────── */}
//       <div className="flex flex-1 flex-col overflow-hidden">
//         {!selectedMessage ? (
//           // Empty state — matches mail-list.tsx empty state style
//           <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground -mt-8">
//             <div className="text-4xl">✉️</div>
//             <p className="mt-2 text-[13.5px] font-medium text-foreground">Select a message</p>
//             <p className="text-[12px]">Choose a message from the list to read it</p>
//           </div>
//         ) : (
//           <>
//             {/* Reader header */}
//             <div className="flex-shrink-0 border-b border-border px-5 py-4">
//               <h2 className="mb-2 text-base font-semibold text-foreground">
//                 {selectedMessage.subject}
//               </h2>
//               <div className="flex items-center gap-2.5">
//                 {/* Avatar */}
//                 <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#4285F4] text-[13px] font-bold text-white">
//                   {(selectedMessage.from.name ?? selectedMessage.from.email)[0].toUpperCase()}
//                 </div>
//                 <div>
//                   <div className="text-[13px] font-medium text-foreground">
//                     {selectedMessage.from.name ?? selectedMessage.from.email}
//                     <span className="ml-1.5 text-[12px] font-normal text-muted-foreground">
//                       &lt;{selectedMessage.from.email}&gt;
//                     </span>
//                   </div>
//                   <div className="text-[11.5px] text-muted-foreground">
//                     to {selectedMessage.to.map((t) => t.email).join(', ')}
//                     {' · '}
//                     {new Date(selectedMessage.date).toLocaleString()}
//                   </div>
//                 </div>
//                 {/* Reply button — matches outline button style from mail-display.tsx */}
//                 <Button
//                   variant="outline"
//                   className="ml-auto"
//                   onClick={() => handleReply(selectedMessage)}
//                 >
//                   ↩️ Reply
//                 </Button>
//               </div>
//             </div>

//             {/* Email body */}
//             <div
//               className="flex-1 overflow-y-auto px-5 py-4"
//               dangerouslySetInnerHTML={{ __html: selectedMessage.body }}
//             />
//           </>
//         )}
//       </div>

//       {/* Compose overlay */}
//       {showCompose && (
//         <ComposeModal
//           onClose={() => { setShowCompose(false); setComposeReplyTo(undefined); }}
//           onSent={onSent}
//           replyTo={composeReplyTo}
//           defaultTo={defaultTo}
//           defaultSubject={defaultSubject}
//         />
//       )}
//     </div>
//   );
// }

// // ── Main GmailPanel export ─────────────────────────────────────────────────
// // Three display modes — JSX structure taken 1:1 from displayThreadSidebar.tsx return block

// export function GmailPanel({
//   defaultCompose = false,
//   replyTo,
//   defaultTo,
//   defaultSubject,
//   onSent,
//   viewMode,
//   onClose,
// }: GmailPanelProps) {
//   const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode ?? 'popup');
//   const [isOpen, setIsOpen] = useState(true);

//   const handleClose = () => {
//     setIsOpen(false);
//     onClose?.();
//   };

//   const toggleFullScreen = () =>
//     setCurrentViewMode((prev) => (prev === 'fullscreen' ? 'popup' : 'fullscreen'));

//   const toggleViewMode = () =>
//     setCurrentViewMode((prev) => (prev === 'popup' ? 'sidebar' : 'popup'));

//   const isFullScreen = currentViewMode === 'fullscreen';
//   const isSidebar = currentViewMode === 'sidebar';
//   const isPopup = currentViewMode === 'popup';

//   const bodyProps = { defaultCompose, replyTo, defaultTo, defaultSubject, onSent };

//   // Standalone — no viewMode passed, just fill container
//   if (!viewMode) {
//     return (
//       <div className="h-screen bg-background">
//         <GmailPanelBody {...bodyProps} />
//       </div>
//     );
//   }

//   if (!isOpen) return null;

//   return (
//     <>
//       {/* ── Sidebar mode — exact from displayThreadSidebar.tsx isSidebar block ── */}
//       {isSidebar && !isFullScreen && (
//         <>
//           <div className="w-px opacity-0" />
//           <ResizablePanel
//             defaultSize={70}
//             minSize={70}
//             maxSize={70}
//             className="bg-panelLight dark:bg-[#101010] border dark:border-[#27272A] mb-1 mr-1 hidden h-[calc(100dvh-8px)] shadow-sm md:block md:rounded-2xl md:shadow-sm"
//           >
//             <div className={cn('h-[calc(98vh)]', 'flex flex-col')}>
//               <div className="flex h-full flex-col">
//                 <GmailChatHeader
//                   onClose={handleClose}
//                   onToggleFullScreen={toggleFullScreen}
//                   onToggleViewMode={toggleViewMode}
//                   isFullScreen={isFullScreen}
//                   isPopup={isPopup}
//                 />
//                 <div className="relative flex-1 overflow-hidden">
//                   <GmailPanelBody {...bodyProps} />
//                 </div>
//               </div>
//             </div>
//           </ResizablePanel>
//         </>
//       )}

//       {/* ── Popup / Fullscreen — exact from displayThreadSidebar.tsx popup div block ── */}
//       <div
//         tabIndex={0}
//         className={cn(
//           'fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4 backdrop-blur-sm transition-opacity duration-150 sm:inset-auto sm:bottom-4 sm:right-4 sm:flex-col sm:items-end sm:justify-end sm:p-0 lg:opacity-40 lg:hover:opacity-100',
//           'md:hidden',
//           isPopup && !isFullScreen && 'md:flex',
//           isFullScreen && 'inset-0! flex! p-0! opacity-100! backdrop-blur-none!',
//           'rounded-2xl focus:opacity-100',
//           isSidebar && 'hidden',
//         )}
//       >
//         <div
//           className={cn(
//             'bg-panelLight dark:bg-panelDark w-full overflow-hidden rounded-2xl border border-[#E7E7E7] shadow-lg dark:border-[#252525]',
//             'md:hidden',
//             isPopup && !isFullScreen && 'w-[700px] max-w-[96vw] sm:w-[400px] md:block',
//             isFullScreen && 'block! max-w-none! rounded-none! border-none!',
//           )}
//         >
//           <div
//             className={cn(
//               'flex w-full flex-col',
//               isFullScreen ? 'h-screen' : 'h-[90vh] sm:h-[600px] sm:max-h-[85vh]',
//             )}
//           >
//             <GmailChatHeader
//               onClose={handleClose}
//               onToggleFullScreen={toggleFullScreen}
//               onToggleViewMode={toggleViewMode}
//               isFullScreen={isFullScreen}
//               isPopup={isPopup}
//             />
//             <div className="relative flex-1 overflow-hidden">
//               <GmailPanelBody {...bodyProps} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
