// // components/WhiteboardEmbed.tsx
// // Drop this anywhere in Conferio — it handles token fetch, postMessage auth,
// // connection state display, and theme sync automatically.

// import { useEffect, useRef, useState, useCallback } from 'react'
// import { useSession } from 'next-auth/react'
// import { useTheme } from 'next-themes'

// type ConnectionState = 'loading' | 'connecting' | 'connected' | 'disconnected' | 'error'

// interface WhiteboardEmbedProps {
//   boardId: string
//   /** Height of the whiteboard — defaults to 100vh */
//   height?: string
//   /** Make the board read-only (viewers can't draw) */
//   readonly?: boolean
//   className?: string
// }

// export default function WhiteboardEmbed({
//   boardId,
//   height = '100vh',
//   readonly = false,
//   className = '',
// }: WhiteboardEmbedProps) {
//   const { data: session } = useSession()
//   const { resolvedTheme } = useTheme() 
//   const iframeRef = useRef<HTMLIFrameElement>(null)
//   const [connectionState, setConnectionState] = useState<ConnectionState>('loading')
//   const [error, setError] = useState<string | null>(null)
//   const [iframeReady, setIframeReady] = useState(false)
//   const tokenRef = useRef<string | null>(null)

//   // ── Step 1: Fetch short-lived JWT from Conferio API ──────────────────────
//   // useEffect(() => {
//   //   if (!session || !boardId) return

//   //   setConnectionState('loading')
//   //   setError(null)

//   //   fetch(`/api/whiteboard/token?boardId=${boardId}`)
//   //     .then(r => {
//   //       if (!r.ok) throw new Error(`Token fetch failed: ${r.status}`)
//   //       return r.json()
//   //     })
//   //     .then(({ token }) => {
//   //       tokenRef.current = token
//   //       setConnectionState('connecting')
//   //       // If iframe is already loaded and waiting, send init now
//   //       if (iframeReady) sendInit(token)
//   //     })
//   //     .catch(e => {
//   //       console.error('[WhiteboardEmbed] Token fetch error:', e)
//   //       setError('Failed to authenticate. Please refresh.')
//   //       setConnectionState('error')
//   //     })
//   // }, [session, boardId])

//  useEffect(() => {
//   if (!session || !boardId) return

//   setConnectionState('loading')
//   setError(null)

//   fetch(`/api/whiteboard/token?boardId=${boardId}`)
//     .then(r => {
//       if (!r.ok) throw new Error(`Token fetch failed: ${r.status}`)
//       return r.json()
//     })
//     .then(({ token }) => {
//       tokenRef.current = token
//       setConnectionState('connecting')
//       // Always try to send — iframe might already be ready
//       sendInit(token)
//     })
//     .catch(e => {
//       setError('Failed to authenticate. Please refresh.')
//       setConnectionState('error')
//     })
// }, [session, boardId]) 

//   // ── Step 2: Listen for messages from the iframe ──────────────────────────
//   // useEffect(() => {
//   //   function onMessage(event: MessageEvent) {
//   //     // Only accept messages from the whiteboard origin
//   //     const whiteboardOrigin = process.env.NEXT_PUBLIC_WHITEBOARD_URL
//   //       ? new URL(process.env.NEXT_PUBLIC_WHITEBOARD_URL).origin
//   //       : null

//   //     if (whiteboardOrigin && event.origin !== whiteboardOrigin) return

//   //     switch (event.data?.type) {
//   //       case 'CONFERIO_WB_READY':
//   //         // Iframe finished loading — send init params
//   //                 console.log('[Embed] Iframe ready, sending init')
//   //         setIframeReady(true)
//   //         if (tokenRef.current) sendInit(tokenRef.current)
//   //         break
//   //       case 'CONFERIO_WB_MOUNTED':
//   //         setConnectionState('connected')
//   //         break
//   //       case 'CONFERIO_WB_CONNECTED':
//   //         setConnectionState('connected')
//   //         break
//   //       case 'CONFERIO_WB_DISCONNECTED':
//   //         setConnectionState('disconnected')
//   //         break
//   //       case 'CONFERIO_WB_AUTH_FAILED':
//   //         setError('Session expired. Please refresh the page.')
//   //         setConnectionState('error')
//   //         break
//   //     }
//   //   }

//   //   window.addEventListener('message', onMessage)
//   //   return () => window.removeEventListener('message', onMessage)
//   // }, [])

//   useEffect(() => {
//   function onMessage(event: MessageEvent) {
//     // In dev, skip origin check
//     if (process.env.NODE_ENV === 'production') {
//       const whiteboardOrigin = process.env.NEXT_PUBLIC_WHITEBOARD_URL
//         ? new URL(process.env.NEXT_PUBLIC_WHITEBOARD_URL).origin
//         : null
//       if (whiteboardOrigin && event.origin !== whiteboardOrigin) return
//     }

//     switch (event.data?.type) {
//       case 'CONFERIO_WB_READY':
//         setIframeReady(true)
//         // Iframe is ready — send token if we already have it
//         if (tokenRef.current) {
//           sendInit(tokenRef.current)
//         }
//         break
//       case 'CONFERIO_WB_MOUNTED':
//       case 'CONFERIO_WB_CONNECTED':
//         setConnectionState('connected')
//         break
//       case 'CONFERIO_WB_DISCONNECTED':
//         setConnectionState('disconnected')
//         break
//       case 'CONFERIO_WB_AUTH_FAILED':
//         setError('Session expired. Please refresh the page.')
//         setConnectionState('error')
//         break
//     }
//   }

//   window.addEventListener('message', onMessage)
//   return () => window.removeEventListener('message', onMessage)
// }, [])

//   // ── Step 3: Sync theme changes to iframe ─────────────────────────────────
//   useEffect(() => {
//     if (!iframeReady || !iframeRef.current?.contentWindow) return
//     const themeToSend = resolvedTheme === 'dark' ? 'dark' : 'light'
//     console.log('[WhiteboardEmbed] Sending theme:', themeToSend)
//     iframeRef.current.contentWindow.postMessage(
//       { type: 'CONFERIO_WB_SET_THEME', theme: themeToSend },
//       process.env.NEXT_PUBLIC_WHITEBOARD_URL ?? '*'
//     )
//   }, [resolvedTheme, iframeReady])

//   // ── Send init params to iframe ────────────────────────────────────────────
//   const sendInit = useCallback((token: string) => {
//     if (!iframeRef.current?.contentWindow) return
//     iframeRef.current.contentWindow.postMessage(
//       {
//         type: 'CONFERIO_WB_INIT',
//         payload: {
//           boardId,
//           token,
//           theme: resolvedTheme === 'dark' ? 'dark' : 'light',
//           readonly,
//         },
//       },
//       process.env.NEXT_PUBLIC_WHITEBOARD_URL ?? '*'
//     )
//   }, [boardId, readonly, resolvedTheme])

//   // ─── Render ───────────────────────────────────────────────────────────────

//   const whiteboardUrl = process.env.NEXT_PUBLIC_WHITEBOARD_URL

//   if (!whiteboardUrl) {
//     return (
//       <div className="flex items-center justify-center h-64 text-red-500 text-sm">
//         NEXT_PUBLIC_WHITEBOARD_URL is not set in your environment.
//       </div>
//     )
//   }

//   return (
//     <div className={`relative w-full ${className}`} style={{ height }}>
//       {/* Connection status badge */}
//       {connectionState !== 'connected' && (
//         <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-background/90 border border-border shadow-sm backdrop-blur-sm">
//           {connectionState === 'loading' && (
//             <>
//               <span className="size-2 rounded-full bg-yellow-500 animate-pulse" />
//               Authenticating...
//             </>
//           )}
//           {connectionState === 'connecting' && (
//             <>
//               <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
//               Connecting to whiteboard...
//             </>
//           )}
//           {connectionState === 'disconnected' && (
//             <>
//               <span className="size-2 rounded-full bg-orange-500" />
//               Reconnecting...
//             </>
//           )}
//           {connectionState === 'error' && (
//             <>
//               <span className="size-2 rounded-full bg-red-500" />
//               {error ?? 'Connection error'}
//             </>
//           )}
//         </div>
//       )}

//       {/* The iframe — src never changes, auth is done via postMessage */}
//       <iframe
//         ref={iframeRef}
//         src={whiteboardUrl}
//         style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
//         allow="clipboard-read; clipboard-write; fullscreen"
//         title="Whiteboard"
//       />
//     </div>
//   )
// }
