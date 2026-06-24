// // components/integrations/salesforce/SalesforcePanel.tsx
// import Link from 'next/link';
// import React, { useState, useEffect, useCallback } from 'react'

// interface SalesforceContact { id: string; name: string; email?: string; phone?: string; title?: string; account?: string; url: string }
// interface SalesforceAccount { id: string; name: string; industry?: string; website?: string; phone?: string; billingCity?: string; employeeCount?: number; url: string }
// interface SalesforceOpportunity { id: string; name: string; stage: string; amount?: number; closeDate?: string; probability?: number; accountName?: string; ownerName?: string; url: string }
// interface SalesforceLead { id: string; name: string; email?: string; company?: string; status: string; url: string }

// type SFView = 'contacts' | 'accounts' | 'opportunities' | 'leads'

// const STAGE_COLORS: Record<string, string> = {
//   'Prospecting': '#6B7280', 'Qualification': '#3B82F6', 'Needs Analysis': '#8B5CF6',
//   'Value Proposition': '#F59E0B', 'Id. Decision Makers': '#F97316',
//   'Perception Analysis': '#EF4444', 'Proposal/Price Quote': '#EC4899',
//   'Negotiation/Review': '#F59E0B', 'Closed Won': '#22C55E', 'Closed Lost': '#EF4444',
// }

// interface SalesforcePanelProps {
//   onSelectContact?: (contact: SalesforceContact) => void
//   onSelectAccount?: (account: SalesforceAccount) => void
// }

// export function SalesforcePanel({ onSelectContact, onSelectAccount }: SalesforcePanelProps) {
//   const [view, setView] = useState<SFView>('contacts')
//   const [contacts, setContacts] = useState<SalesforceContact[]>([])
//   const [accounts, setAccounts] = useState<SalesforceAccount[]>([])
//   const [opportunities, setOpportunities] = useState<SalesforceOpportunity[]>([])
//   const [leads, setLeads] = useState<SalesforceLead[]>([])
//   const [search, setSearch] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const fetchData = useCallback(async (v: SFView, q = '') => {
//     setIsLoading(true); setError(null)
//     try {
//       let url = `/api/integrations/salesforce?action=${v}`
//       if (q && (v === 'contacts' || v === 'accounts')) url += `&search=${encodeURIComponent(q)}`
//       const res = await fetch(url)
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error)
//       if (v === 'contacts') setContacts(data.contacts ?? [])
//       else if (v === 'accounts') setAccounts(data.accounts ?? [])
//       else if (v === 'opportunities') setOpportunities(data.opportunities ?? [])
//       else if (v === 'leads') setLeads(data.leads ?? [])
//     } catch (e: any) { setError(e.message) }
//     finally { setIsLoading(false) }
//   }, [])

//   useEffect(() => { fetchData(view) }, [view, fetchData])

//   useEffect(() => {
//     if (view === 'contacts' || view === 'accounts') {
//       const t = setTimeout(() => fetchData(view, search), 400)
//       return () => clearTimeout(t)
//     }
//   }, [search, view, fetchData])

//   const VIEWS: { id: SFView; label: string; icon: string }[] = [
//     { id: 'contacts', label: 'Contacts', icon: '👤' },
//     { id: 'accounts', label: 'Accounts', icon: '🏢' },
//     { id: 'opportunities', label: 'Deals', icon: '💰' },
//     { id: 'leads', label: 'Leads', icon: '🎯' },
//   ]

//   const currencyFormatter = new Intl.NumberFormat('en-US', {
//   style: 'currency',
//   currency: 'USD',
//   maximumFractionDigits: 0,
// });  

//   const formatCurrency = (amount?: number) => {
//   if (!amount) return '—';
//   return currencyFormatter.format(amount);
// };

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '500px', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
//       {/* Header */}
//       <div style={{ padding: '12px 14px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '10px' }}>
//         <img src="https://salesforce.com/favicon.ico" width={18} height={18} alt="Salesforce" />
//         <span style={{ fontWeight: 600, fontSize: '14px' }}>Salesforce CRM</span>
//       </div>

//       {/* Tabs */}
//       <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6', padding: '0 8px' }}>
//         {VIEWS.map(v => (
//           <button key={v.id} onClick={() => { setView(v.id); setSearch('') }}
//             style={{ padding: '9px 12px', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: view === v.id ? 600 : 400, color: view === v.id ? '#00A1E0' : '#6B7280', backgroundColor: 'transparent', borderBottom: view === v.id ? '2px solid #00A1E0' : '2px solid transparent', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.1s' }}>
//             <span>{v.icon}</span>{v.label}
//           </button>
//         ))}
//       </div>

//       {/* Search bar for contacts/accounts */}
//       {(view === 'contacts' || view === 'accounts') && (
//         <div style={{ padding: '8px 12px', borderBottom: '1px solid #F9FAFB' }}>
//           <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${view}…`}
//             style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
//         </div>
//       )}

//       {error && (
//         <div style={{ padding: '10px 14px', color: '#EF4444', fontSize: '12.5px' }}>
//           {error.includes('not connected') ? <><span>Salesforce not connected. </span><Link href="/settings/integrations" style={{ color: '#3B82F6' }}>Connect →</Link></> : error}
//         </div>
//       )}

//       {/* Content */}
//       <div style={{ flex: 1, overflowY: 'auto' }}>
//         {isLoading && <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF', fontSize: '13px' }}>Loading…</div>}

//         {/* Contacts */}
//         {view === 'contacts' && !isLoading && contacts.map(c => (
//           <div key={c.id} onClick={() => onSelectContact?.(c)}
//             style={{ padding: '10px 14px', borderBottom: '1px solid #F9FAFB', cursor: onSelectContact ? 'pointer' : 'default', transition: 'background 0.1s' }}
//             onMouseEnter={e => { if (onSelectContact) (e.currentTarget as HTMLDivElement).style.backgroundColor = '#F9FAFB' }}
//             onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//               <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#00A1E020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#00A1E0', flexShrink: 0 }}>
//                 {c.name[0]}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#111827' }}>{c.name}</span>
//                   {c.title && <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{c.title}</span>}
//                 </div>
//                 <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
//                   {c.email && <span>{c.email}</span>}
//                   {c.email && c.account && <span style={{ margin: '0 6px', color: '#D1D5DB' }}>·</span>}
//                   {c.account && <span>🏢 {c.account}</span>}
//                 </div>
//               </div>
//               <Link href={c.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '12px', color: '#9CA3AF' }}>↗</Link>
//             </div>
//           </div>
//         ))}

//         {/* Accounts */}
//         {view === 'accounts' && !isLoading && accounts.map(a => (
//           <div key={a.id} onClick={() => onSelectAccount?.(a)}
//             style={{ padding: '10px 14px', borderBottom: '1px solid #F9FAFB', cursor: onSelectAccount ? 'pointer' : 'default', transition: 'background 0.1s' }}
//             onMouseEnter={e => { if (onSelectAccount) (e.currentTarget as HTMLDivElement).style.backgroundColor = '#F9FAFB' }}
//             onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//               <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#00A1E015', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🏢</div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#111827' }}>{a.name}</div>
//                 <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
//                   {a.industry && <span>{a.industry}</span>}
//                   {a.billingCity && <span>📍 {a.billingCity}</span>}
//                   {a.employeeCount && <span>👥 {a.employeeCount.toLocaleString()}</span>}
//                 </div>
//               </div>
//               <Link href={a.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '12px', color: '#9CA3AF' }}>↗</Link>
//             </div>
//           </div>
//         ))}

//         {/* Opportunities */}
//         {view === 'opportunities' && !isLoading && opportunities.map(opp => (
//           <div key={opp.id} style={{ padding: '10px 14px', borderBottom: '1px solid #F9FAFB' }}>
//             <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' as const }}>
//                   <Link href={opp.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13.5px', fontWeight: 500, color: '#111827', textDecoration: 'none' }}>{opp.name}</Link>
//                   <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', backgroundColor: (STAGE_COLORS[opp.stage] ?? '#6B7280') + '20', color: STAGE_COLORS[opp.stage] ?? '#6B7280' }}>{opp.stage}</span>
//                 </div>
//                 <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
//                   <span style={{ fontWeight: 600, color: '#22C55E', fontSize: '13px' }}>{formatCurrency(opp.amount)}</span>
//                   {opp.probability !== undefined && <span>🎯 {opp.probability}%</span>}
//                   {opp.closeDate && <span>📅 {new Date(opp.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
//                   {opp.accountName && <span>🏢 {opp.accountName}</span>}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Leads */}
//         {view === 'leads' && !isLoading && leads.map(lead => (
//           <div key={lead.id} style={{ padding: '10px 14px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', gap: '10px' }}>
//             <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#F59E0B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#F59E0B', flexShrink: 0 }}>{lead.name[0]}</div>
//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#111827' }}>{lead.name}</div>
//               <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
//                 {lead.company && <span>🏢 {lead.company}</span>}
//                 {lead.email && <span style={{ marginLeft: '8px' }}>{lead.email}</span>}
//               </div>
//             </div>
//             <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#F59E0B20', color: '#B45309' }}>{lead.status}</span>
//             <Link href={lead.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#9CA3AF' }}>↗</Link>
//           </div>
//         ))}

//         {/* Empty state */}
//         {!isLoading && !error && (
//           (view === 'contacts' && contacts.length === 0) ||
//           (view === 'accounts' && accounts.length === 0) ||
//           (view === 'opportunities' && opportunities.length === 0) ||
//           (view === 'leads' && leads.length === 0)
//         ) && (
//           <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
//             <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
//             <p style={{ fontSize: '13px', margin: 0 }}>No {view} found{search ? ` for "${search}"` : ''}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
