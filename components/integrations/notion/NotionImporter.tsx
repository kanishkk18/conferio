// // components/integrations/notion/NotionImporter.tsx
// import Link from 'next/link';
// import React, { useState, useEffect } from 'react'

// interface NotionPage { id: string; title: string; icon?: string; lastEditedTime: string; url: string }

// interface NotionImporterProps {
//   workspaceId: string
//   onImported?: (page: any) => void
//   onClose?: () => void
// }

// export function NotionImporter({ workspaceId, onImported, onClose }: NotionImporterProps) {
//   const [pages, setPages] = useState<NotionPage[]>([])
//   const [search, setSearch] = useState('')
//   const [selected, setSelected] = useState<NotionPage | null>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [isImporting, setIsImporting] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [title, setTitle] = useState('')

//   useEffect(() => {
//     const fetchPages = async () => {
//       setIsLoading(true)
//       try {
//         const res = await fetch(`/api/integrations/notion?search=${encodeURIComponent(search)}`)
//         const data = await res.json()
//         if (!res.ok) throw new Error(data.error)
//         setPages(data.pages ?? [])
//       } catch (e: any) { setError(e.message) }
//       finally { setIsLoading(false) }
//     }
//     const t = setTimeout(fetchPages, search ? 350 : 0)
//     return () => clearTimeout(t)
//   }, [search])

//   const handleImport = async () => {
//     if (!selected) return
//     setIsImporting(true)
//     try {
//       const res = await fetch('/api/integrations/notion', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'import', notionPageId: selected.id, workspaceId, title }),
//       })
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error)
//       onImported?.(data.page)
//       onClose?.()
//     } catch (e: any) { setError(e.message) }
//     finally { setIsImporting(false) }
//   }

//   useEffect(() => { if (selected) setTitle(selected.title) }, [selected])

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '460px', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
//       <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '10px' }}>
//         <img src="https://www.notion.so/favicon.ico" width={18} height={18} alt="Notion" />
//         <span style={{ fontWeight: 600, fontSize: '14px' }}>Import from Notion</span>
//         {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '18px', marginLeft: 'auto', padding: 0 }}>×</button>}
//       </div>

//       <div style={{ padding: '10px 14px', borderBottom: '1px solid #F9FAFB' }}>
//         <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Notion pages…"
//           style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
//       </div>

//       {error && <div style={{ padding: '10px 14px', color: '#EF4444', fontSize: '12.5px' }}>{error.includes('not connected') ? <><span>Notion not connected. </span><Link href="/settings/integrations" style={{ color: '#3B82F6' }}>Connect →</Link></> : error}</div>}

//       <div style={{ flex: 1, overflowY: 'auto' }}>
//         {isLoading && <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF', fontSize: '13px' }}>Loading…</div>}
//         {pages.map(page => (
//           <div key={page.id} onClick={() => setSelected(page)}
//             style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #F9FAFB', backgroundColor: selected?.id === page.id ? '#F5F3FF' : 'transparent', borderLeft: selected?.id === page.id ? '3px solid #000' : '3px solid transparent', transition: 'all 0.1s' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//               <span style={{ fontSize: '18px' }}>{page.icon ?? '📄'}</span>
//               <div>
//                 <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#111827' }}>{page.title}</div>
//                 <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Last edited {new Date(page.lastEditedTime).toLocaleDateString()}</div>
//               </div>
//               <Link href={page.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ marginLeft: 'auto', fontSize: '12px', color: '#9CA3AF' }}>↗</Link>
//             </div>
//           </div>
//         ))}
//       </div>

//       {selected && (
//         <div style={{ padding: '12px 14px', borderTop: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
//           <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Page title in Conferio"
//             style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', marginBottom: '8px', boxSizing: 'border-box' as const }} />
//           <button onClick={handleImport} disabled={isImporting}
//             style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', backgroundColor: '#000', color: '#fff', fontSize: '13.5px', fontWeight: 600, cursor: isImporting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: isImporting ? 0.7 : 1 }}>
//             {isImporting ? 'Importing…' : `⬇️ Import "${selected.title}" to Docs`}
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }
