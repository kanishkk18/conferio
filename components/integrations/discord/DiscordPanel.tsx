// // components/integrations/discord/DiscordPanel.tsx
// import React, { useState, useEffect, useCallback } from 'react'

// interface DiscordGuild { id: string; name: string; icon?: string }
// interface DiscordChannel { id: string; name: string; topic?: string }
// interface DiscordMessage { id: string; content: string; author: { username: string; avatar?: string; bot: boolean }; formattedDate: string; attachments: { id: string; filename: string; url: string }[] }

// interface DiscordPanelProps {
//   onSendToConferio?: (message: DiscordMessage) => void
// }

// export function DiscordPanel({ onSendToConferio }: DiscordPanelProps) {
//   const [guilds, setGuilds] = useState<DiscordGuild[]>([])
//   const [channels, setChannels] = useState<DiscordChannel[]>([])
//   const [messages, setMessages] = useState<DiscordMessage[]>([])
//   const [activeGuild, setActiveGuild] = useState<DiscordGuild | null>(null)
//   const [activeChannel, setActiveChannel] = useState<DiscordChannel | null>(null)
//   const [sendText, setSendText] = useState('')
//   const [isSending, setIsSending] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     setIsLoading(true)
//     fetch('/api/integrations/discord?action=guilds')
//       .then(r => r.json())
//       .then(d => { setGuilds(d.guilds ?? []); setIsLoading(false) })
//       .catch(e => { setError(e.message); setIsLoading(false) })
//   }, [])

//   const loadChannels = useCallback(async (guild: DiscordGuild) => {
//     setActiveGuild(guild); setActiveChannel(null); setMessages([])
//     const res = await fetch(`/api/integrations/discord?action=channels&guildId=${guild.id}`)
//     const data = await res.json()
//     setChannels(data.channels ?? [])
//   }, [])

//   const loadMessages = useCallback(async (channel: DiscordChannel) => {
//     setActiveChannel(channel); setIsLoading(true)
//     try {
//       const res = await fetch(`/api/integrations/discord?action=messages&channelId=${channel.id}&limit=30`)
//       const data = await res.json()
//       setMessages(data.messages ?? [])
//     } catch (e: any) { setError(e.message) }
//     finally { setIsLoading(false) }
//   }, [])

//   const handleSend = async () => {
//     if (!activeChannel || !sendText.trim()) return
//     setIsSending(true)
//     try {
//       await fetch('/api/integrations/discord', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ channelId: activeChannel.id, content: sendText }),
//       })
//       setSendText('')
//       await loadMessages(activeChannel)
//     } catch (e: any) { setError(e.message) }
//     finally { setIsSending(false) }
//   }

//   return (
//     <div style={{ display: 'flex', height: '500px', backgroundColor: '#36393f', borderRadius: '14px', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
//       {/* Server list */}
//       <div style={{ width: '68px', backgroundColor: '#202225', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: '8px', overflowY: 'auto' }}>
//         {guilds.map(g => (
//           <button type="button"  key={g.id} onClick={() => loadChannels(g)} title={g.name}
//             style={{ width: '48px', height: '48px', borderRadius: activeGuild?.id === g.id ? '14px' : '50%', border: activeGuild?.id === g.id ? '2px solid #5865F2' : 'none', cursor: 'pointer', overflow: 'hidden', backgroundColor: '#5865F2', padding: 0, transition: 'border-radius 0.2s, border 0.2s', flexShrink: 0 }}>
//             {g.icon ? (
//               <img src={g.icon} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//             ) : (
//               <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{g.name[0]}</span>
//             )}
//           </button>
//         ))}
//         {isLoading && !guilds.length && <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#40444b' }} />}
//       </div>

//       {/* Channel list */}
//       {activeGuild && (
//         <div style={{ width: '180px', backgroundColor: '#2f3136', display: 'flex', flexDirection: 'column' }}>
//           <div style={{ padding: '12px 14px', borderBottom: '1px solid #202225' }}>
//             <span style={{ color: '#fff', fontWeight: 700, fontSize: '13.5px' }}>{activeGuild.name}</span>
//           </div>
//           <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
//             {channels.map(ch => (
//               <button type="button"  key={ch.id} onClick={() => loadMessages(ch)}
//                 style={{ width: '100%', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer', backgroundColor: activeChannel?.id === ch.id ? '#393c43' : 'transparent', color: activeChannel?.id === ch.id ? '#fff' : '#8e9297', fontSize: '13px', fontFamily: 'inherit', borderRadius: '4px', margin: '1px 6px', textAlign: 'left', maxWidth: 'calc(100% - 12px)' }}>
//                 <span style={{ fontSize: '15px' }}>#</span>
//                 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Message area */}
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
//         {!activeChannel ? (
//           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#8e9297', gap: '8px' }}>
//             <div style={{ fontSize: '36px' }}>💬</div>
//             <p style={{ fontSize: '13.5px', color: '#dcddde', margin: 0 }}>{activeGuild ? 'Select a channel' : 'Select a server'}</p>
//           </div>
//         ) : (
//           <>
//             <div style={{ padding: '12px 16px', borderBottom: '1px solid #202225', display: 'flex', alignItems: 'center', gap: '8px' }}>
//               <span style={{ color: '#8e9297', fontSize: '16px' }}>#</span>
//               <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{activeChannel.name}</span>
//               {activeChannel.topic && <span style={{ fontSize: '12px', color: '#8e9297', marginLeft: '8px', borderLeft: '1px solid #4f545c', paddingLeft: '8px' }}>{activeChannel.topic}</span>}
//             </div>

//             <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
//               {isLoading && <div style={{ textAlign: 'center', color: '#8e9297', fontSize: '13px' }}>Loading messages…</div>}
//               {[...messages].reverse().map(msg => (
//                 <div key={msg.id} style={{ display: 'flex', gap: '10px' }}>
//                   <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#5865F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
//                     {msg.author.avatar
//                       ? <img src={msg.author.avatar} alt={msg.author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                       : <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{msg.author.username[0]}</span>}
//                   </div>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
//                       <span style={{ fontSize: '13.5px', fontWeight: 600, color: msg.author.bot ? '#5865F2' : '#fff' }}>{msg.author.username}</span>
//                       {msg.author.bot && <span style={{ fontSize: '10px', backgroundColor: '#5865F2', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>BOT</span>}
//                       <span style={{ fontSize: '11px', color: '#72767d' }}>{msg.formattedDate}</span>
//                       {onSendToConferio && (
//                         <button type="button"  onClick={() => onSendToConferio(msg)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#72767d', fontFamily: 'inherit' }}>→ Conferio</button>
//                       )}
//                     </div>
//                     {msg.content && <p style={{ fontSize: '13.5px', color: '#dcddde', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.content}</p>}
//                     {msg.attachments?.map(a => (
//                       <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#00b0f4', marginTop: '4px', textDecoration: 'none' }}>📎 {a.filename}</a>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div style={{ padding: '10px 16px', backgroundColor: '#40444b', margin: '0 16px 14px', borderRadius: '8px', display: 'flex', gap: '8px' }}>
//               <input value={sendText} onChange={e => setSendText(e.target.value)}
//                 onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
//                 placeholder={`Message #${activeChannel.name}`}
//                 style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#dcddde', fontSize: '13.5px', fontFamily: 'inherit' }} />
//               <button type="button"  onClick={handleSend} disabled={isSending || !sendText.trim()}
//                 style={{ background: 'none', border: 'none', cursor: 'pointer', color: sendText.trim() ? '#5865F2' : '#72767d', fontSize: '20px', padding: 0 }}>
//                 ➤
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }
