// 'use client'

// import React, { useEffect, useRef, useState } from 'react'
// import { useSession } from 'next-auth/react'

// interface Props {
//   roomId: string
// }

// function loadScript(src: string): Promise<void> {
//   return new Promise((resolve, reject) => {
//     if (document.querySelector(`script[src="${src}"]`)) {
//       resolve()
//       return
//     }
//     const script = document.createElement('script')
//     script.src = src
//     script.type = 'module'
//     script.onload = () => resolve()
//     script.onerror = () => reject(new Error(`Failed to load ${src}`))
//     document.head.appendChild(script)
//   })
// }

// export default function BlockSuiteCanvas({ roomId }: Props) {
//   const { data: session } = useSession()
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
//   const [errorMsg, setErrorMsg] = useState('')
//   const cleanupRef = useRef<(() => void) | null>(null)

//   useEffect(() => {
//     if (!session?.user || !containerRef.current) return

//     const init = async () => {
//       try {
//         setStatus('loading')

//         // 1. Fetch token
//         // 1. Fetch token — use your EXISTING endpoint
// const tokenRes = await fetch(`/api/rooms/${roomId}/token`)
// if (!tokenRes.ok) throw new Error('Failed to get token')
// const { token } = await tokenRes.json()

//         // 2. Load script
//         await loadScript('/whiteboard/conferio-whiteboard.js')

//         // 3. Wait for global to be set
//         let retries = 50
//         while (!(window as any).ConferioWhiteboard && retries > 0) {
//           await new Promise(r => setTimeout(r, 100))
//           retries--
//         }

//         const { initWhiteboard } = (window as any).ConferioWhiteboard
//         if (!initWhiteboard) throw new Error('Whiteboard library not loaded')

//         // 4. Initialize
//         const cleanup = await initWhiteboard({
//           container: containerRef.current!,
//           boardId: roomId,
//           token,
//           theme: 'dark',
//           apiUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4002',
//           hocuspocusUrl: process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234',
//           onSave: async (snapshot: string) => {
//             await fetch(`/api/rooms/${roomId}/snapshot`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ snapshot }),
//             })
//           },
//         })

//         cleanupRef.current = cleanup
//         setStatus('ready')
//       } catch (err: any) {
//         console.error('[BlockSuiteCanvas] Init error:', err)
//         setErrorMsg(err?.message || 'Failed to initialize')
//         setStatus('error')
//       }
//     }

//     init()

//     return () => {
//       cleanupRef.current?.()
//     }
//   }, [roomId, session])

//   return (
//     <div ref={containerRef} className="absolute inset-0 bg-[#0f0f0f]">
//       {status === 'loading' && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
//           <div className="size-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
//           <p className="text-zinc-500 text-sm mt-3">Loading BlockSuite whiteboard…</p>
//         </div>
//       )}
//       {status === 'error' && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
//           <p className="text-red-400">{errorMsg}</p>
//         </div>
//       )}
//     </div>
//   )
// }


// components/whiteboard/BlockSuiteCanvas.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import LazyLoader from '../loader/lazyloader'

interface Props {
  roomId: string
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.type = 'module'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

export default function BlockSuiteCanvas({ roomId }: Props) {
  const { data: session } = useSession()
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!session?.user || !containerRef.current) return

    const init = async () => {
      try {
        setStatus('loading')

        // 1. Fetch token (for potential future use)
        const tokenRes = await fetch(`/api/rooms/${roomId}/token`)
        if (!tokenRes.ok) throw new Error('Failed to get token')
        const { token } = await tokenRes.json()

        // 2. Load the script
        await loadScript('/whiteboard/conferio-whiteboard.js')

        // 3. Wait for global
        let retries = 50
        while (!(window as any).ConferioWhiteboard && retries > 0) {
          await new Promise(r => setTimeout(r, 100))
          retries--
        }

        const { initWhiteboard } = (window as any).ConferioWhiteboard
        if (!initWhiteboard) throw new Error('Whiteboard library not loaded')

        // 4. Initialize with BOTH onLoad and onSave
        const cleanup = await initWhiteboard({
          container: containerRef.current!,
          boardId: roomId,
          token,
          theme: 'dark',
          apiUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4002',
          
          // ← CRITICAL: Pass onLoad to load from your API
          onLoad: async () => {
            try {
              const res = await fetch(`/api/rooms/${roomId}/snapshot`)
              if (!res.ok) return null
              const data = await res.json()
              console.log('[BlockSuiteCanvas] Loaded snapshot:', data.snapshot ? `${data.snapshot.length} chars` : 'null')
              return data.snapshot // base64 string or null
            } catch (e) {
              console.error('[BlockSuiteCanvas] Load error:', e)
              return null
            }
          },
          
          // ← CRITICAL: Pass onSave to save to your API
          onSave: async (snapshot: string) => {
            try {
              console.log('[BlockSuiteCanvas] Saving snapshot:', snapshot.length, 'chars')
              const res = await fetch(`/api/rooms/${roomId}/snapshot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ snapshot }),
              })
              if (res.ok) {
                console.log('[BlockSuiteCanvas] ✓ Saved successfully')
              } else {
                console.error('[BlockSuiteCanvas] ✗ Save failed:', res.status)
              }
            } catch (e) {
              console.error('[BlockSuiteCanvas] Save error:', e)
            }
          },
        })

        cleanupRef.current = cleanup
        setStatus('ready')
      } catch (err: any) {
        console.error('[BlockSuiteCanvas] Init error:', err)
        setErrorMsg(err?.message || 'Failed to initialize')
        setStatus('error')
      }
    }

    init()

    return () => {
      cleanupRef.current?.()
    }
  }, [roomId, session])

  return (
    <div ref={containerRef} className="absolute inset-0 bg-[#000000]">
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
         <LazyLoader/>
          {/* <p className="text-zinc-500 text-sm mt-3">Loading whiteboard…</p> */}
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <p className="text-red-400">{errorMsg}</p>
        </div>
      )}
    </div>
  )
}

