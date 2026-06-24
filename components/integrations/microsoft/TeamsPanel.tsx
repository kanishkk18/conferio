// // components/integrations/microsoft/TeamsPanel.tsx
// import Link from 'next/link';
// import React, { useState, useEffect, useCallback } from 'react'

// interface TeamsTeam { id: string; displayName: string; description?: string }
// interface TeamsChannel { id: string; displayName: string; description?: string }
// interface TeamsMessage { id: string; content: string; from: { displayName: string }; createdDateTime: string; attachments: { id: string; name: string; contentUrl: string }[] }

// interface TeamsPanelProps {
//   onSendToConferio?: (message: TeamsMessage) => void
// }

// export function TeamsPanel({ onSendToConferio }: TeamsPanelProps) {
//   const [teams, setTeams] = useState<TeamsTeam[]>([])
//   const [channels, setChannels] = useState<TeamsChannel[]>([])
//   const [messages, setMessages] = useState<TeamsMessage[]>([])
//   const [activeTeam, setActiveTeam] = useState<TeamsTeam | null>(null)
//   const [activeChannel, setActiveChannel] = useState<TeamsChannel | null>(null)
//   const [sendText, setSendText] = useState('')
//   const [isSending, setIsSending] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     setIsLoading(true)
//     fetch('/api/integrations/microsoft?service=teams&action=list')
//       .then(r => r.json())
//       .then(d => { setTeams(d.teams ?? []); setIsLoading(false) })
//       .catch(e => { setError(e.message); setIsLoading(false) })
//   }, [])

//   const loadChannels = useCallback(async (team: TeamsTeam) => {
//     setActiveTeam(team); setActiveChannel(null); setMessages([])
//     const res = await fetch(`/api/integrations/microsoft?service=teams&action=channels&teamId=${team.id}`)
//     const data = await res.json()
//     setChannels(data.channels ?? [])
//   }, [])

//   const loadMessages = useCallback(async (channel: TeamsChannel) => {
//     if (!activeTeam) return
//     setActiveChannel(channel); setIsLoading(true)
//     try {
//       const res = await fetch(`/api/integrations/microsoft?service=teams&action=messages&teamId=${activeTeam.id}&channelId=${channel.id}`)
//       const data = await res.json()
//       setMessages(data.messages ?? [])
//     } catch (e: any) { setError(e.message) }
//     finally { setIsLoading(false) }
//   }, [activeTeam])

//   const handleSend = async () => {
//     if (!activeTeam || !activeChannel || !sendText.trim()) return
//     setIsSending(true)
//     try {
//       await fetch('/api/integrations/microsoft', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'teams-send', teamId: activeTeam.id, channelId: activeChannel.id, content: sendText }),
//       })
//       setSendText('')
//       await loadMessages(activeChannel)
//     } catch (e: any) { setError(e.message) }
//     finally { setIsSending(false) }
//   }

//   return (
//     <div style={{ display: 'flex', height: '500px', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
//       {/* Team sidebar */}
//       <div style={{ width: '200px', borderRight: '1px solid #F3F4F6', backgroundColor: '#6264A7', display: 'flex', flexDirection: 'column' }}>
//         <div style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <img src="https://microsoft.com/favicon.ico" width={16} height={16} alt="Teams" />
//           <span style={{ color: '#fff', fontWeight: 700, fontSize: '13.5px' }}>Teams</span>
//         </div>
//         <div style={{ flex: 1, overflowY: 'auto' }}>
//           {isLoading && !teams.length && <div style={{ padding: '20px', color: '#ffffff80', fontSize: '12px', textAlign: 'center' }}>Loading…</div>}
//           {teams.map(team => (
//             <button key={team.id} onClick={() => loadChannels(team)}
//               style={{ width: '100%', padding: '8px 14px', border: 'none', cursor: 'pointer', backgroundColor: activeTeam?.id === team.id ? '#ffffff20' : 'transparent', color: '#fff', fontSize: '12.5px', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.1s' }}>
//               <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#ffffff30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
//                 {team.displayName[0]}
//               </div>
//               <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.displayName}</span>
//             </button>
//           ))}
//           {error && <div style={{ padding: '10px 14px', color: '#ffcccc', fontSize: '11.5px' }}>{error.includes('not connected') ? <Link href="/settings/integrations" style={{ color: '#fff' }}>Connect Microsoft →</Link> : error}</div>}
//         </div>

//         {/* Channels in active team */}
//         {channels.length > 0 && activeTeam && (
//           <div style={{ borderTop: '1px solid #ffffff20' }}>
//             <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: 700, color: '#ffffff80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Channels</div>
//             {channels.map(ch => (
//               <button key={ch.id} onClick={() => loadMessages(ch)}
//                 style={{ width: '100%', padding: '6px 14px', border: 'none', cursor: 'pointer', backgroundColor: activeChannel?.id === ch.id ? '#ffffff20' : 'transparent', color: activeChannel?.id === ch.id ? '#fff' : '#ffffffb0', fontSize: '12.5px', fontFamily: 'inherit', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                 # {ch.displayName}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Messages area */}
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
//         {!activeChannel ? (
//           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9CA3AF', gap: '8px' }}>
//             <div style={{ fontSize: '36px' }}>💼</div>
//             <p style={{ fontSize: '13.5px', fontWeight: 500, color: '#374151', margin: 0 }}>
//               {activeTeam ? 'Select a channel' : 'Select a team'}
//             </p>
//           </div>
//         ) : (
//           <>
//             <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
//               <span style={{ color: '#6264A7', fontSize: '16px' }}>#</span>
//               <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{activeChannel.displayName}</span>
//               {activeChannel.description && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>— {activeChannel.description}</span>}
//             </div>

//             <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
//               {isLoading && <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>Loading…</div>}
//               {messages.map(msg => (
//                 <div key={msg.id} style={{ display: 'flex', gap: '10px' }}>
//                   <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#6264A720', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                     <span style={{ fontSize: '13px', fontWeight: 700, color: '#6264A7' }}>{msg.from.displayName[0]}</span>
//                   </div>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
//                       <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{msg.from.displayName}</span>
//                       <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{new Date(msg.createdDateTime).toLocaleString()}</span>
//                       {onSendToConferio && (
//                         <button onClick={() => onSendToConferio(msg)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#9CA3AF', fontFamily: 'inherit' }}>→ Conferio</button>
//                       )}
//                     </div>
//                     {msg.content && <p style={{ fontSize: '13.5px', color: '#374151', margin: 0, lineHeight: 1.5 }}>{msg.content}</p>}
//                     {msg.attachments?.map(a => (
//                       <Link key={a.id} href={a.contentUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6264A7', marginTop: '4px', textDecoration: 'none' }}>📎 {a.name}</Link>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div style={{ padding: '10px 16px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: '8px' }}>
//               <input value={sendText} onChange={e => setSendText(e.target.value)}
//                 onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
//                 placeholder={`Message #${activeChannel.displayName}…`}
//                 style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13.5px', outline: 'none', fontFamily: 'inherit' }} />
//               <button onClick={handleSend} disabled={isSending || !sendText.trim()}
//                 style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#6264A7', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: isSending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: isSending ? 0.7 : 1 }}>
//                 {isSending ? '…' : 'Send'}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }
