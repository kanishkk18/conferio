// // components/integrations/google/DrivePicker.tsx
// /**
//  * Full Google Drive file picker.
//  * Props:
//  *   onSelect(file, action) — called when user picks a file + action
//  *   mode: 'share' | 'import' | 'both'
//  *   teamId / folderId — for import targeting
//  *
//  * Usage:
//  *   <DrivePicker onSelect={(file, action) => ...} mode="both" teamId={teamId} />
//  */
// import Link from 'next/link'
// import React, { useState, useEffect, useCallback, useRef } from 'react'

// interface DriveFile {
//   id: string
//   name: string
//   mimeType: string
//   size?: number
//   modifiedTime: string
//   webViewLink?: string
//   iconLink?: string
//   thumbnailLink?: string
//   category: string
//   formattedSize: string
//   shared: boolean
//   owners?: { displayName: string; emailAddress: string }[]
// }

// interface BreadcrumbItem { id: string; name: string }

// type DriveAction = 'share' | 'import'

// interface DrivePickerProps {
//   onSelect?: (file: DriveFile, action: DriveAction, result?: { shareUrl?: string; file?: any }) => void
//   onClose?: () => void
//   mode?: 'share' | 'import' | 'both'
//   teamId?: string
//   targetFolderId?: string
//   allowedCategories?: string[]  // filter to specific file types
// }

// const CATEGORY_ICONS: Record<string, string> = {
//   folder:       '📁',
//   document:     '📝',
//   spreadsheet:  '📊',
//   presentation: '📽️',
//   pdf:          '📑',
//   image:        '🖼️',
//   video:        '🎬',
//   audio:        '🎵',
//   other:        '📎',
// }

// function formatDate(iso: string) {
//   return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
// }

// export function DrivePicker({
//   onSelect,
//   onClose,
//   mode = 'both',
//   teamId,
//   targetFolderId,
//   allowedCategories,
// }: DrivePickerProps) {
//   const [files, setFiles] = useState<DriveFile[]>([])
//   const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'My Drive' }])
//   const [currentFolderId, setCurrentFolderId] = useState('root')
//   const [search, setSearch] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [selected, setSelected] = useState<DriveFile | null>(null)
//   const [actionLoading, setActionLoading] = useState(false)
//   const [nextPageToken, setNextPageToken] = useState<string | undefined>()
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
//   const searchDebounce = useRef<ReturnType<typeof setTimeout>>()

//   const fetchFiles = useCallback(async (folderId: string, pageToken?: string) => {
//     setIsLoading(true)
//     setError(null)
//     try {
//       const params = new URLSearchParams({ folderId })
//       if (pageToken) params.set('pageToken', pageToken)
//       const res = await fetch(`/api/integrations/google/drive/files?${params}`)
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error ?? 'Failed to load Drive files')
//       setFiles(pageToken ? (prev) => [...prev, ...data.files] : data.files)
//       setBreadcrumb(data.breadcrumb ?? [{ id: 'root', name: 'My Drive' }])
//       setNextPageToken(data.nextPageToken)
//     } catch (e: any) {
//       setError(e.message)
//     } finally {
//       setIsLoading(false)
//     }
//   }, [])

//   const searchFiles = useCallback(async (q: string) => {
//     if (!q.trim()) { fetchFiles(currentFolderId); return }
//     setIsLoading(true)
//     setError(null)
//     try {
//       const res = await fetch(`/api/integrations/google/drive/files?search=${encodeURIComponent(q)}`)
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error ?? 'Search failed')
//       setFiles(data.files)
//       setNextPageToken(undefined)
//     } catch (e: any) {
//       setError(e.message)
//     } finally {
//       setIsLoading(false)
//     }
//   }, [currentFolderId, fetchFiles])

//   useEffect(() => { fetchFiles('root') }, [fetchFiles])

//   const handleSearch = (q: string) => {
//     setSearch(q)
//     if (searchDebounce.current) clearTimeout(searchDebounce.current)
//     searchDebounce.current = setTimeout(() => searchFiles(q), 350)
//   }

//   const openFolder = (file: DriveFile) => {
//     if (file.category !== 'folder') return
//     setCurrentFolderId(file.id)
//     setSearch('')
//     setSelected(null)
//     fetchFiles(file.id)
//   }

//   const navigateBreadcrumb = (item: BreadcrumbItem) => {
//     setCurrentFolderId(item.id)
//     setSearch('')
//     setSelected(null)
//     fetchFiles(item.id)
//   }

//   const handleAction = async (action: DriveAction) => {
//     if (!selected) return
//     setActionLoading(true)
//     try {
//       const res = await fetch('/api/integrations/google/drive/files', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action,
//           fileId: selected.id,
//           teamId,
//           folderId: targetFolderId,
//         }),
//       })
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error ?? 'Action failed')
//       onSelect?.(selected, action, data)
//     } catch (e: any) {
//       setError(e.message)
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   const displayFiles = allowedCategories
//     ? files.filter((f) => allowedCategories.includes(f.category) || f.category === 'folder')
//     : files

//   return (
//     <div style={{
//       display: 'flex', flexDirection: 'column',
//       height: '540px',
//       backgroundColor: '#fff',
//       borderRadius: '14px',
//       overflow: 'hidden',
//       border: '1px solid #E5E7EB',
//     }}>
//       {/* Header */}
//       <div style={{
//         padding: '14px 16px',
//         borderBottom: '1px solid #F3F4F6',
//         display: 'flex', alignItems: 'center', gap: '10px',
//       }}>
//         <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="Google" />
//         <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>Google Drive</span>

//         {/* Search */}
//         <div style={{ flex: 1, position: 'relative' }}>
//           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
//             <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
//           </svg>
//           <input
//             value={search}
//             onChange={(e) => handleSearch(e.target.value)}
//             placeholder="Search Drive…"
//             style={{
//               width: '100%', padding: '7px 10px 7px 30px',
//               border: '1px solid #E5E7EB', borderRadius: '8px',
//               fontSize: '13px', outline: 'none',
//               backgroundColor: '#F9FAFB', fontFamily: 'inherit',
//               boxSizing: 'border-box',
//             }}
//           />
//         </div>

//         {/* View toggle */}
//         <div style={{ display: 'flex', gap: '4px' }}>
//           {(['list', 'grid'] as const).map((v) => (
//             <button type="button"  key={v} onClick={() => setViewMode(v)} style={{
//               padding: '5px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
//               backgroundColor: viewMode === v ? '#EFF6FF' : 'transparent',
//               color: viewMode === v ? '#1D4ED8' : '#9CA3AF', fontSize: '13px',
//             }}>
//               {v === 'list' ? '☰' : '⊞'}
//             </button>
//           ))}
//         </div>

//         {onClose && (
//           <button type="button"  onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '18px', padding: 0 }}>×</button>
//         )}
//       </div>

//       {/* Breadcrumb */}
//       {!search && (
//         <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', borderBottom: '1px solid #F9FAFB' }}>
//           {breadcrumb.map((item, idx) => (
//             <React.Fragment key={item.id}>
//               <button type="button" 
//                 onClick={() => navigateBreadcrumb(item)}
//                 style={{
//                   background: 'none', border: 'none', cursor: 'pointer',
//                   fontSize: '12px', color: idx === breadcrumb.length - 1 ? '#374151' : '#3B82F6',
//                   fontWeight: idx === breadcrumb.length - 1 ? 600 : 400,
//                   padding: '2px 4px', borderRadius: '4px',
//                   fontFamily: 'inherit',
//                 }}
//               >
//                 {item.name}
//               </button>
//               {idx < breadcrumb.length - 1 && (
//                 <span style={{ color: '#D1D5DB', fontSize: '12px' }}>/</span>
//               )}
//             </React.Fragment>
//           ))}
//         </div>
//       )}

//       {/* File list */}
//       <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
//         {error && (
//           <div style={{ padding: '16px', color: '#EF4444', fontSize: '13px', textAlign: 'center' }}>
//             {error.includes('not connected')
//               ? <><p>Google Drive not connected.</p>
//               <Link href="/settings/integrations" style={{ color: '#3B82F6' }}>Connect now →</Link></>
//               : error
//             }
//           </div>
//         )}

//         {isLoading && files.length === 0 && (
//           <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
//             <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
//             <p style={{ fontSize: '13px', margin: 0 }}>Loading Drive files…</p>
//           </div>
//         )}

//         {!isLoading && !error && displayFiles.length === 0 && (
//           <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
//             <div style={{ fontSize: '28px', marginBottom: '8px' }}>📁</div>
//             <p style={{ fontSize: '13px', margin: 0 }}>
//               {search ? `No results for "${search}"` : 'This folder is empty'}
//             </p>
//           </div>
//         )}

//         {viewMode === 'list' ? (
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <tbody>
//               {displayFiles.map((file) => (
//                 <tr
//                   key={file.id}
//                   onClick={() => file.category === 'folder' ? openFolder(file) : setSelected(file)}
//                   onDoubleClick={() => file.category === 'folder' && openFolder(file)}
//                   style={{
//                     cursor: 'pointer',
//                     backgroundColor: selected?.id === file.id ? '#EFF6FF' : 'transparent',
//                     borderRadius: '8px',
//                     transition: 'background 0.1s',
//                   }}
//                   onMouseEnter={(e) => {
//                     if (selected?.id !== file.id)
//                       (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F9FAFB'
//                   }}
//                   onMouseLeave={(e) => {
//                     if (selected?.id !== file.id)
//                       (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'
//                   }}
//                 >
//                   <td style={{ padding: '7px 8px', width: '32px' }}>
//                     <span style={{ fontSize: '18px' }}>
//                       {CATEGORY_ICONS[file.category] ?? '📎'}
//                     </span>
//                   </td>
//                   <td style={{ padding: '7px 4px' }}>
//                     <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px' }}>
//                       {file.name}
//                     </div>
//                     {file.owners?.[0] && (
//                       <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{file.owners[0].displayName}</div>
//                     )}
//                   </td>
//                   <td style={{ padding: '7px 8px', textAlign: 'right', color: '#9CA3AF', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
//                     {file.formattedSize !== '—' && <span style={{ marginRight: '12px' }}>{file.formattedSize}</span>}
//                     {formatDate(file.modifiedTime)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
//             {displayFiles.map((file) => (
//               <div
//                 key={file.id}
//                 onClick={() => file.category === 'folder' ? openFolder(file) : setSelected(file)}
//                 onDoubleClick={() => file.category === 'folder' && openFolder(file)}
//                 style={{
//                   padding: '12px 8px',
//                   borderRadius: '10px',
//                   border: selected?.id === file.id ? '2px solid #3B82F6' : '1.5px solid #F3F4F6',
//                   cursor: 'pointer',
//                   textAlign: 'center',
//                   backgroundColor: selected?.id === file.id ? '#EFF6FF' : '#fff',
//                   transition: 'all 0.1s',
//                 }}
//               >
//                 <div style={{ fontSize: '28px', marginBottom: '6px' }}>
//                   {CATEGORY_ICONS[file.category] ?? '📎'}
//                 </div>
//                 <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                   {file.name}
//                 </div>
//                 <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{file.formattedSize}</div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Load more */}
//         {nextPageToken && !search && (
//           <button type="button" 
//             onClick={() => fetchFiles(currentFolderId, nextPageToken)}
//             disabled={isLoading}
//             style={{
//               width: '100%', padding: '8px', marginTop: '8px',
//               border: '1px solid #E5E7EB', borderRadius: '8px',
//               backgroundColor: '#fff', cursor: 'pointer',
//               fontSize: '12.5px', color: '#6B7280', fontFamily: 'inherit',
//             }}
//           >
//             {isLoading ? 'Loading…' : 'Load more'}
//           </button>
//         )}
//       </div>

//       {/* Footer actions */}
//       {selected && (
//         <div style={{
//           padding: '12px 16px',
//           borderTop: '1px solid #F3F4F6',
//           display: 'flex', alignItems: 'center', gap: '10px',
//           backgroundColor: '#F9FAFB',
//         }}>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//               {CATEGORY_ICONS[selected.category]} {selected.name}
//             </p>
//             <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
//               {selected.formattedSize} · Modified {formatDate(selected.modifiedTime)}
//             </p>
//           </div>

//           {(mode === 'share' || mode === 'both') && (
//             <button type="button" 
//               onClick={() => handleAction('share')}
//               disabled={actionLoading}
//               style={{
//                 padding: '8px 16px', borderRadius: '8px', border: 'none',
//                 backgroundColor: '#4285F4', color: '#fff',
//                 fontSize: '13px', fontWeight: 600, cursor: 'pointer',
//                 fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1,
//               }}
//             >
//               {actionLoading ? '…' : '🔗 Share Link'}
//             </button>
//           )}

//           {(mode === 'import' || mode === 'both') && (
//             <button type="button" 
//               onClick={() => handleAction('import')}
//               disabled={actionLoading}
//               style={{
//                 padding: '8px 16px', borderRadius: '8px',
//                 border: '1.5px solid #4285F4',
//                 backgroundColor: 'transparent', color: '#4285F4',
//                 fontSize: '13px', fontWeight: 600, cursor: 'pointer',
//                 fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1,
//               }}
//             >
//               {actionLoading ? '…' : '⬇️ Import to Conferio'}
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }
