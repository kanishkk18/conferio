// // components/integrations/jira/JiraPanel.tsx
// import Link from 'next/link';
// import React, { useState, useEffect, useCallback } from 'react'

// interface JiraIssue {
//   id: string; key: string; summary: string; status: string; statusCategory: string
//   priority?: string; issueType: string; assignee?: { displayName: string; avatarUrl?: string }
//   project: { name: string; key: string }; created: string; updated: string; url: string
// }

// interface JiraPanelProps {
//   onLinkToTask?: (issue: JiraIssue) => void
// }

// const STATUS_COLORS: Record<string, string> = { todo: '#6B7280', inprogress: '#3B82F6', done: '#22C55E' }
// const PRIORITY_ICONS: Record<string, string> = { Highest: '🔴', High: '🟠', Medium: '🟡', Low: '🔵', Lowest: '⚪' }

// export function JiraPanel({ onLinkToTask }: JiraPanelProps) {
//   const [issues, setIssues] = useState<JiraIssue[]>([])
//   const [projects, setProjects] = useState<{ id: string; key: string; name: string }[]>([])
//   const [search, setSearch] = useState('')
//   const [selectedProject, setSelectedProject] = useState('')
//   const [view, setView] = useState<'my-issues' | 'search'>('my-issues')
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const fetchMyIssues = useCallback(async () => {
//     setIsLoading(true); setError(null)
//     try {
//       const res = await fetch('/api/integrations/jira?action=my-issues')
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error)
//       setIssues(data.issues ?? [])
//     } catch (e: any) { setError(e.message) }
//     finally { setIsLoading(false) }
//   }, [])

//   const fetchSearch = useCallback(async () => {
//     if (!search.trim()) return
//     setIsLoading(true); setError(null)
//     try {
//       const params = new URLSearchParams({ action: 'search', search })
//       if (selectedProject) params.set('projectKey', selectedProject)
//       const res = await fetch(`/api/integrations/jira?${params}`)
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error)
//       setIssues(data.issues ?? [])
//     } catch (e: any) { setError(e.message) }
//     finally { setIsLoading(false) }
//   }, [search, selectedProject])

//   useEffect(() => {
//     fetchMyIssues()
//     fetch('/api/integrations/jira?action=projects').then(r => r.json()).then(d => setProjects(d.projects ?? []))
//   }, [fetchMyIssues])

//   useEffect(() => {
//     if (view === 'my-issues') fetchMyIssues()
//   }, [view, fetchMyIssues])

//   useEffect(() => {
//     if (view !== 'search') return
//     const t = setTimeout(fetchSearch, 350)
//     return () => clearTimeout(t)
//   }, [search, fetchSearch, view])

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '480px', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
//       {/* Header */}
//       <div style={{ padding: '12px 14px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '10px' }}>
//         <img src="https://jira.atlassian.com/favicon.ico" width={18} height={18} alt="Jira" />
//         <span style={{ fontWeight: 600, fontSize: '14px' }}>Jira Issues</span>
//         <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
//           {(['my-issues', 'search'] as const).map(v => (
//             <button key={v} onClick={() => setView(v)}
//               style={{ padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: view === v ? 600 : 400, color: view === v ? '#0052CC' : '#6B7280', backgroundColor: view === v ? '#EFF6FF' : 'transparent', fontFamily: 'inherit' }}>
//               {v === 'my-issues' ? 'My Issues' : 'Search'}
//             </button>
//           ))}
//         </div>
//       </div>

//       {view === 'search' && (
//         <div style={{ padding: '8px 12px', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: '8px' }}>
//           <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search issues…"
//             style={{ flex: 1, padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
//           <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
//             style={{ padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '12.5px', fontFamily: 'inherit', outline: 'none' }}>
//             <option value="">All Projects</option>
//             {projects.map(p => <option key={p.id} value={p.key}>{p.name}</option>)}
//           </select>
//         </div>
//       )}

//       {error && <div style={{ padding: '10px 14px', color: '#EF4444', fontSize: '12.5px' }}>{error.includes('not connected') ? <><span>Jira not connected. </span><Link href="/settings/integrations" style={{ color: '#3B82F6' }}>Connect →</Link></> : error}</div>}

//       <div style={{ flex: 1, overflowY: 'auto' }}>
//         {isLoading && <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF', fontSize: '13px' }}>Loading…</div>}
//         {!isLoading && issues.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}><div style={{ fontSize: '28px', marginBottom: '8px' }}>🎯</div><p style={{ fontSize: '13px', margin: 0 }}>No issues found</p></div>}
//         {issues.map(issue => (
//           <div key={issue.id} style={{ padding: '10px 14px', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
//                 <Link href={issue.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: '#0052CC', textDecoration: 'none' }}>{issue.key}</Link>
//                 <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '9999px', backgroundColor: (STATUS_COLORS[issue.statusCategory] ?? '#6B7280') + '20', color: STATUS_COLORS[issue.statusCategory] ?? '#6B7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{issue.status}</span>
//                 {issue.priority && <span title={issue.priority} style={{ fontSize: '14px' }}>{PRIORITY_ICONS[issue.priority] ?? '⚪'}</span>}
//               </div>
//               <p style={{ fontSize: '13px', color: '#111827', margin: '0 0 4px', fontWeight: 500 }}>{issue.summary}</p>
//               <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{issue.project.name} · {issue.issueType} {issue.assignee && `· ${issue.assignee.displayName}`}</div>
//             </div>
//             {onLinkToTask && (
//               <button onClick={() => onLinkToTask(issue)}
//                 style={{ padding: '5px 10px', borderRadius: '7px', border: '1.5px solid #0052CC', backgroundColor: 'transparent', color: '#0052CC', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
//                 Link
//               </button>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }
