// // components/integrations/slack/SlackPanel.tsx
// import React, { useState, useEffect, useCallback } from 'react'

// interface SlackChannel { id: string; name: string; memberCount: number; topic?: string; isMember: boolean }
// interface SlackMessage { ts: string; text: string; userName?: string; userAvatar?: string; isBot: boolean; formattedDate: string }

// interface SlackPanelProps {
//   onSendToConferio?: (message: SlackMessage, channelName: string) => void
// }

// export function SlackPanel({ onSendToConferio }: SlackPanelProps) {
//   const [channels, setChannels] = useState<SlackChannel[]>([])
//   const [messages, setMessages] = useState<SlackMessage[]>([])
//   const [activeChannel, setActiveChannel] = useState<SlackChannel | null>(null)
//   const [sendText, setSendText] = useState('')
//   const [search, setSearch] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [isSending, setIsSending] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     setIsLoading(true)
//     fetch('/api/integrations/slack?action=channels')
//       .then(r => r.json())
//       .then(d => { setChannels(d.channels ?? []); setIsLoading(false) })
//       .catch(e => { setError(e.message); setIsLoading(false) })
//   }, [])

//   const loadMessages = useCallback(async (channel: SlackChannel) => {
//     setActiveChannel(channel)
//     setIsLoading(true)
//     try {
//       const res = await fetch(`/api/integrations/slack?action=messages&channelId=${channel.id}`)
//       const data = await res.json()
//       setMessages(data.messages ?? [])
//     } catch (e: any) { setError(e.message) }
//     finally { setIsLoading(false) }
//   }, [])

//   const handleSend = async () => {
//     if (!activeChannel || !sendText.trim()) return
//     setIsSending(true)
//     try {
//       await fetch('/api/integrations/slack', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ channelId: activeChannel.id, text: sendText }),
//       })
//       setSendText('')
//       await loadMessages(activeChannel)
//     } catch (e: any) { setError(e.message) }
//     finally { setIsSending(false) }
//   }

//   const filteredChannels = search
//     ? channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
//     : channels

//   const styles = {
//     container: { display: 'flex', height: '500px', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
//     sidebar: { width: '220px', borderRight: '1px solid #F3F4F6', backgroundColor: '#1a1a2e', display: 'flex', flexDirection: 'column' as const },
//     sidebarHeader: { padding: '14px 14px 8px', display: 'flex', alignItems: 'center', gap: '8px' },
//     channelItem: (active: boolean) => ({ padding: '7px 14px', cursor: 'pointer', borderRadius: '0 20px 20px 0', marginRight: '8px', backgroundColor: active ? '#4A154B' : 'transparent', color: active ? '#fff' : '#CCC', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.1s' }) as React.CSSProperties,
//     main: { flex: 1, display: 'flex', flexDirection: 'column' as const },
//     messageList: { flex: 1, overflowY: 'auto' as const, padding: '12px' },
//     messageItem: { display: 'flex', gap: '10px', marginBottom: '14px' },
//     avatar: { width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#4A154B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0 },
//     sendBar: { padding: '10px 12px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: '8px' },
//   }

//   return (
//     <div style={styles.container}>
//       <div style={styles.sidebar}>
//         <div style={styles.sidebarHeader}>
//           <img src="https://slack.com/favicon.ico" width={16} height={16} alt="Slack" />
//           <span style={{ color: '#fff', fontWeight: 700, fontSize: '13.5px' }}>Slack</span>
//         </div>
//         <div style={{ padding: '4px 10px 8px' }}>
//           <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter channels…"
//             style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#ffffff20', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' as const }} />
//         </div>
//         <div style={{ overflowY: 'auto', flex: 1 }}>
//           {filteredChannels.map(ch => (
//             <div key={ch.id} onClick={() => loadMessages(ch)} style={styles.channelItem(activeChannel?.id === ch.id)}>
//               <span># {ch.name}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div style={styles.main}>
//         {!activeChannel ? (
//           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9CA3AF', gap: '8px' }}>
//             <div style={{ fontSize: '32px' }}>💬</div>
//             <p style={{ fontSize: '13.5px', margin: 0 }}>Select a channel</p>
//           </div>
//         ) : (
//           <>
//             <div style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
//               <span style={{ fontSize: '14px', fontWeight: 600 }}>#{activeChannel.name}</span>
//               {activeChannel.topic && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>— {activeChannel.topic}</span>}
//               <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: 'auto' }}>{activeChannel.memberCount} members</span>
//             </div>

//             <div style={styles.messageList}>
//               {isLoading && <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>Loading…</div>}
//               {[...messages].reverse().map(msg => (
//                 <div key={msg.ts} style={styles.messageItem}>
//                   <div style={styles.avatar}>{(msg.userName ?? 'U')[0].toUpperCase()}</div>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
//                       <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{msg.userName ?? 'Unknown'}</span>
//                       <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{msg.formattedDate}</span>
//                       {onSendToConferio && (
//                         <button onClick={() => onSendToConferio(msg, activeChannel.name)}
//                           style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#9CA3AF', fontFamily: 'inherit' }}>
//                           → Send to Conferio
//                         </button>
//                       )}
//                     </div>
//                     <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div style={styles.sendBar}>
//               <input value={sendText} onChange={e => setSendText(e.target.value)}
//                 onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
//                 placeholder={`Message #${activeChannel.name}…`}
//                 style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
//               <button onClick={handleSend} disabled={isSending || !sendText.trim()}
//                 style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#4A154B', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: isSending ? 0.7 : 1 }}>
//                 {isSending ? '…' : 'Send'}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }
