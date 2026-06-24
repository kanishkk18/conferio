// // pages/settings/integrations.tsx
// import React, { useEffect, useState, useCallback } from 'react'
// import { useRouter } from 'next/router'
// import Head from 'next/head'

// // ── Types ─────────────────────────────────────────────────────────────────
// interface Integration {
//   id: string
//   name: string
//   description: string
//   icon: string
//   color: string
//   category: string
//   features: string[]
//   authUrl: string
//   docsUrl?: string
//   connected: boolean
//   connectedAt?: string
//   accountName?: string
//   accountEmail?: string
//   accountAvatar?: string
// }

// const CATEGORY_LABELS: Record<string, string> = {
//   productivity: '🧠 Productivity',
//   communication: '💬 Communication',
//   storage: '📦 Storage',
//   project: '📌 Project Management',
//   crm: '🤝 CRM',
// }

// const CATEGORY_ORDER = ['productivity', 'communication', 'storage', 'project', 'crm']

// // ── Integration Card ──────────────────────────────────────────────────────
// function IntegrationCard({
//   integration,
//   onConnect,
//   onDisconnect,
//   isLoading,
// }: {
//   integration: Integration
//   onConnect: (id: string) => void
//   onDisconnect: (id: string) => void
//   isLoading: boolean
// }) {
//   const [hovering, setHovering] = useState(false)

//   return (
//     <div
//     className="transition-colors duration-200"
//       onMouseEnter={() => setHovering(true)}
//       onMouseLeave={() => setHovering(false)}
//       style={{
//         backgroundColor: '#fff',
//         borderRadius: '14px',
//         border: integration.connected
//           ? `1.5px solid ${integration.color}40`
//           : '1.5px solid #E5E7EB',
//         padding: '20px',
//         transition: 'box-shadow 0.2s, border-color 0.2s',
//         boxShadow: hovering
//           ? '0 8px 24px rgba(0,0,0,0.08)'
//           : integration.connected
//           ? `0 2px 8px ${integration.color}20`
//           : '0 1px 3px rgba(0,0,0,0.04)',
//         position: 'relative',
//         overflow: 'hidden',
//       }}
//     >
//       {/* Connected accent bar */}
//       {integration.connected && (
//         <div style={{
//           position: 'absolute',
//           top: 0, left: 0, right: 0,
//           height: '3px',
//           backgroundColor: integration.color,
//           borderRadius: '14px 14px 0 0',
//         }} />
//       )}

//       {/* Header */}
//       <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
//         {/* Icon */}
//         <div style={{
//           width: '44px', height: '44px',
//           borderRadius: '10px',
//           backgroundColor: integration.color + '12',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           flexShrink: 0,
//           border: `1px solid ${integration.color}25`,
//         }}>
//           <img
//             src={integration.icon}
//             alt={integration.name}
//             width={24} height={24}
//             style={{ borderRadius: '4px' }}
//             onError={(e) => {
//               // fallback to first letter
//               (e.target as HTMLImageElement).style.display = 'none'
//             }}
//           />
//         </div>

//         {/* Name + status */}
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#111827', margin: 0 }}>
//               {integration.name}
//             </h3>
//             {integration.connected && (
//               <span style={{
//                 fontSize: '10px', fontWeight: 700,
//                 padding: '2px 7px',
//                 borderRadius: '9999px',
//                 backgroundColor: '#D1FAE5',
//                 color: '#065F46',
//                 letterSpacing: '0.3px',
//               }}>
//                 CONNECTED
//               </span>
//             )}
//           </div>
//           <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '3px 0 0', lineHeight: 1.4 }}>
//             {integration.description}
//           </p>
//         </div>
//       </div>

//       {/* Connected account info */}
//       {integration.connected && integration.accountName && (
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: '8px',
//           padding: '8px 12px',
//           backgroundColor: '#F9FAFB',
//           borderRadius: '8px',
//           marginBottom: '14px',
//         }}>
//           {integration.accountAvatar && (
//             <img
//               src={integration.accountAvatar}
//               alt={integration.accountName}
//               width={20} height={20}
//               style={{ borderRadius: '50%' }}
//             />
//           )}
//           <div>
//             <p style={{ fontSize: '12px', fontWeight: 500, color: '#374151', margin: 0 }}>
//               {integration.accountName}
//             </p>
//             {integration.accountEmail && (
//               <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
//                 {integration.accountEmail}
//               </p>
//             )}
//           </div>
//           {integration.connectedAt && (
//             <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: 'auto' }}>
//               Connected {new Date(integration.connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//             </span>
//           )}
//         </div>
//       )}

//       {/* Features */}
//       <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none' }}>
//         {integration.features.map((feature) => (
//           <li key={feature} style={{
//             display: 'flex', alignItems: 'center', gap: '7px',
//             fontSize: '12px', color: '#6B7280',
//             padding: '3px 0',
//           }}>
//             <span style={{ color: integration.connected ? integration.color : '#D1D5DB', fontSize: '14px' }}>
//               {integration.connected ? '✓' : '○'}
//             </span>
//             {feature}
//           </li>
//         ))}
//       </ul>

//       {/* Actions */}
//       <div style={{ display: 'flex', gap: '8px' }}>
//         {!integration.connected ? (
//           <button type="button" 
//             onClick={() => onConnect(integration.id)}
//             disabled={isLoading}
//             style={{
//               flex: 1,
//               padding: '9px 16px',
//               borderRadius: '8px',
//               border: 'none',
//               cursor: isLoading ? 'not-allowed' : 'pointer',
//               backgroundColor: integration.color,
//               color: '#fff',
//               fontSize: '13px',
//               fontWeight: 600,
//               fontFamily: 'inherit',
//               opacity: isLoading ? 0.7 : 1,
//               transition: 'opacity 0.15s',
//             }}
//           >
//             Connect {integration.name}
//           </button>
//         ) : (
//           <>
//             <button type="button" 
//               onClick={() => onConnect(integration.id)}
//               disabled={isLoading}
//               style={{
//                 flex: 1,
//                 padding: '9px 16px',
//                 borderRadius: '8px',
//                 border: `1.5px solid ${integration.color}40`,
//                 cursor: isLoading ? 'not-allowed' : 'pointer',
//                 backgroundColor: 'transparent',
//                 color: integration.color,
//                 fontSize: '13px',
//                 fontWeight: 600,
//                 fontFamily: 'inherit',
//               }}
//             >
//               Reconnect
//             </button>
//             <button type="button" 
//               onClick={() => onDisconnect(integration.id)}
//               disabled={isLoading}
//               style={{
//                 padding: '9px 16px',
//                 borderRadius: '8px',
//                 border: '1.5px solid #FEE2E2',
//                 cursor: isLoading ? 'not-allowed' : 'pointer',
//                 backgroundColor: 'transparent',
//                 color: '#EF4444',
//                 fontSize: '13px',
//                 fontWeight: 600,
//                 fontFamily: 'inherit',
//               }}
//             >
//               Disconnect
//             </button>
//           </>
//         )}

//         {integration.docsUrl && (
//           <a
//             href={integration.docsUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             style={{
//               padding: '9px 12px',
//               borderRadius: '8px',
//               border: '1.5px solid #E5E7EB',
//               color: '#6B7280',
//               fontSize: '13px',
//               textDecoration: 'none',
//               display: 'flex', alignItems: 'center',
//             }}
//             title="Setup docs"
//           >
//             ↗
//           </a>
//         )}
//       </div>
//     </div>
//   )
// }

// // ── Toast ─────────────────────────────────────────────────────────────────
// function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
//   useEffect(() => {
//     const t = setTimeout(onClose, 5000)
//     return () => clearTimeout(t)
//   }, [onClose])

//   return (
//     <div style={{
//       position: 'fixed', top: '20px', right: '20px',
//       padding: '12px 18px',
//       backgroundColor: type === 'success' ? '#D1FAE5' : '#FEE2E2',
//       color: type === 'success' ? '#065F46' : '#991B1B',
//       borderRadius: '10px',
//       fontSize: '13.5px',
//       fontWeight: 500,
//       boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
//       zIndex: 9999,
//       display: 'flex', alignItems: 'center', gap: '10px',
//       animation: 'slideIn 0.25s ease',
//       border: `1px solid ${type === 'success' ? '#A7F3D0' : '#FECACA'}`,
//     }}>
//       <span>{type === 'success' ? '✓' : '✕'}</span>
//       {message}
//       <button type="button"  onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '16px', padding: 0 }}>×</button>
//     </div>
//   )
// }

// // ── Main Page ─────────────────────────────────────────────────────────────
// export default function IntegrationsPage() {
//   const router = useRouter()
//     const { replace } = useRouter()

//   const [integrations, setIntegrations] = useState<Integration[]>([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
//   const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [selectedCategory, setSelectedCategory] = useState<string>('all')

//   const fetchIntegrations = useCallback(async () => {
//     setIsLoading(true)
//     try {
//       const res = await fetch('/api/integrations')
//       const data = await res.json()
//       setIntegrations(data.integrations ?? [])
//     } catch {
//       setToast({ message: 'Failed to load integrations', type: 'error' })
//     } finally {
//       setIsLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     fetchIntegrations()
//   }, [fetchIntegrations])

//   // Handle redirect from OAuth callback
//   useEffect(() => {
//     const { success, error, provider } = router.query
//     if (success === 'true' && provider) {
//       setToast({ message: `${provider} connected successfully!`, type: 'success' })
//       fetchIntegrations()
//       replace('/settings/integrations', undefined, { shallow: true })
//     } else if (error && provider) {
//       setToast({ message: `Failed to connect ${provider}: ${error}`, type: 'error' })
//       replace('/settings/integrations', undefined, { shallow: true })
//     }
//   }, [router.query, fetchIntegrations, router])

//   const handleConnect = useCallback((providerId: string) => {
//     setLoadingProvider(providerId)
//     window.location.href = `/api/integrations/${providerId}/connect`
//   }, [])

//   const handleDisconnect = useCallback(async (providerId: string) => {
//     setLoadingProvider(providerId)
//     try {
//       const res = await fetch(`/api/integrations?provider=${providerId}`, { method: 'DELETE' })
//       if (res.ok) {
//         setToast({ message: `${providerId} disconnected`, type: 'success' })
//         await fetchIntegrations()
//       } else {
//         throw new Error('Disconnect failed')
//       }
//     } catch {
//       setToast({ message: `Failed to disconnect ${providerId}`, type: 'error' })
//     } finally {
//       setLoadingProvider(null)
//     }
//   }, [fetchIntegrations])

//   // Filter integrations
//   const filtered = integrations.filter((i) => {
//     const matchesSearch =
//       !searchQuery ||
//       i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       i.description.toLowerCase().includes(searchQuery.toLowerCase())
//     const matchesCategory = selectedCategory === 'all' || i.category === selectedCategory
//     return matchesSearch && matchesCategory
//   })

//   const grouped = CATEGORY_ORDER.reduce<Record<string, Integration[]>>((acc, cat) => {
//     const items = filtered.filter((i) => i.category === cat)
//     if (items.length > 0) acc[cat] = items
//     return acc
//   }, {})

//   const connectedCount = integrations.filter((i) => i.connected).length

//   return (
//     <>
//       <Head>
//         <title>Integrations . Conferio</title>
//       </Head>

//       <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
//         <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

//           {/* Header */}
//           <div style={{ marginBottom: '32px' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
//               <h1 style={{ fontSize: '26px', fontWeight: 500, color: '#111827', margin: 0 }}>
//                 Integrations
//               </h1>
//               {connectedCount > 0 && (
//                 <span style={{
//                   fontSize: '12px', fontWeight: 700,
//                   padding: '3px 10px', borderRadius: '9999px',
//                   backgroundColor: '#EFF6FF', color: '#1D4ED8',
//                 }}>
//                   {connectedCount} connected
//                 </span>
//               )}
//             </div>
//             <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
//               Connect your favourite tools to use them directly inside Conferio.
//             </p>
//           </div>

//           {/* Search + filter bar */}
//           <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
//             <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
//                 <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
//               </svg>
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search integrations…"
//                 style={{
//                   width: '100%', padding: '9px 12px 9px 36px',
//                   border: '1.5px solid #E5E7EB', borderRadius: '10px',
//                   fontSize: '13.5px', color: '#374151',
//                   backgroundColor: '#fff', fontFamily: 'inherit',
//                   boxSizing: 'border-box',
//                 }}
//               />
//             </div>

//             {/* Category pills */}
//             <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
//               {[{ id: 'all', label: 'All' }, ...CATEGORY_ORDER.map((c) => ({ id: c, label: CATEGORY_LABELS[c] }))].map((cat) => (
//                 <button type="button" 
//                   key={cat.id}
//                   onClick={() => setSelectedCategory(cat.id)}
//                   style={{
//                     padding: '7px 14px',
//                     borderRadius: '8px',
//                     border: 'none',
//                     cursor: 'pointer',
//                     fontSize: '12.5px',
//                     fontWeight: selectedCategory === cat.id ? 600 : 400,
//                     color: selectedCategory === cat.id ? '#1D4ED8' : '#6B7280',
//                     backgroundColor: selectedCategory === cat.id ? '#EFF6FF' : '#fff',
//                     fontFamily: 'inherit',
//                     transition: 'color 0.12s, background-color 0.12s, border-color 0.12s',
//                     border: selectedCategory === cat.id ? '1.5px solid #BFDBFE' : '1.5px solid #E5E7EB',
//                   } as React.CSSProperties}
//                 >
//                   {cat.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Loading state */}
//           {isLoading && integrations.length === 0 && (
//             <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
//               <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</div>
//               <p style={{ fontSize: '14px' }}>Loading integrations…</p>
//             </div>
//           )}

//           {/* Grouped cards */}
//           {Object.entries(grouped).map(([category, items]) => (
//             <div key={category} style={{ marginBottom: '36px' }}>
//               <h2 style={{
//                 fontSize: '12px', fontWeight: 500,
//                 letterSpacing: '0.08em', textTransform: 'uppercase',
//                 color: '#9CA3AF', marginBottom: '14px',
//               }}>
//                 {CATEGORY_LABELS[category]}
//               </h2>
//               <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
//                 gap: '16px',
//               }}>
//                 {items.map((integration) => (
//                   <IntegrationCard
//                     key={integration.id}
//                     integration={integration}
//                     onConnect={handleConnect}
//                     onDisconnect={handleDisconnect}
//                     isLoading={loadingProvider === integration.id}
//                   />
//                 ))}
//               </div>
//             </div>
//           ))}

//           {/* No results */}
//           {filtered.length === 0 && !isLoading && (
//             <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
//               <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔌</div>
//               <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', margin: '0 0 4px' }}>
//                 No integrations found
//               </p>
//               <p style={{ fontSize: '12.5px', margin: 0 }}>Try a different search or category</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {toast && (
//         <Toast
//           message={toast.message}
//           type={toast.type}
//           onClose={() => setToast(null)}
//         />
//       )}

//       <style>{`
//         @keyframes slideIn {
//           from { opacity: 0; transform: translateX(20px) }
//           to   { opacity: 1; transform: translateX(0) }
//         }
//       `}</style>
//     </>
//   )
// }


// pages/settings/integrations.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import {
  Search,
  ChevronRight,
  Link as LinkIcon,
  Unlink,
  ExternalLink,
  Check,
  X,
  Brain,
  MessageSquare,
  Package,
  Pin,
  Handshake,
  Settings,
  Plug,
  ArrowUpRight,
  ShieldCheck,
  Clock,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────
interface Integration {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  features: string[]
  authUrl: string
  docsUrl?: string
  connected: boolean
  connectedAt?: string
  accountName?: string
  accountEmail?: string
  accountAvatar?: string
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  productivity: <Brain className="w-4 h-4" />,
  communication: <MessageSquare className="w-4 h-4" />,
  storage: <Package className="w-4 h-4" />,
  project: <Pin className="w-4 h-4" />,
  crm: <Handshake className="w-4 h-4" />,
}

const CATEGORY_LABELS: Record<string, string> = {
  productivity: 'Productivity',
  communication: 'Communication',
  storage: 'Storage',
  project: 'Project Management',
  crm: 'CRM',
}

const CATEGORY_ORDER = ['productivity', 'communication', 'storage', 'project', 'crm']

// ── Apple-style Design Tokens ──────────────────────────────────────────────
// iOS System Colors - Light Mode (Apple HIG)
const SYSTEM = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  separator: '#E5E5EA',
  separatorLight: '#F2F2F7',
  label: '#000000',
  labelSecondary: '#8E8E93',
  labelTertiary: '#C7C7CC',
  blue: '#007AFF',
  green: '#34C759',
  red: '#FF3B30',
  gray: '#8E8E93',
  gray2: '#AEAEB2',
  gray5: '#E5E5EA',
  gray6: '#F2F2F7',
}

// ── Integration Card (Apple-style) ─────────────────────────────────────────
function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  isLoading,
}: {
  integration: Integration
  onConnect: (id: string) => void
  onDisconnect: (id: string) => void
  isLoading: boolean
}) {
  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden transition-all duration-200"
      style={{
        boxShadow: integration.connected
          ? '0 1px 3px rgba(0,0,0,0.04)'
          : '0 1px 2px rgba(0,0,0,0.02)',
      }}
    >
      {/* Connected indicator strip */}
      {integration.connected && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: integration.color }}
        />
      )}

      <div className="p-5">
        {/* Header: Icon + Name + Status */}
        <div className="flex items-start gap-4">
          {/* Service Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${integration.color}10`,
            }}
          >
            <img
              src={integration.icon}
              alt={integration.name}
              width={28}
              height={28}
              className="rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[17px] font-semibold text-black tracking-[-0.01em]">
                {integration.name}
              </h3>
              {integration.connected && (
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${SYSTEM.green}15`,
                    color: SYSTEM.green,
                  }}
                >
                  Active
                </span>
              )}
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              {integration.description}
            </p>
          </div>

          {/* Chevron for connected state */}
          {integration.connected && (
            <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 mt-1" />
          )}
        </div>

        {/* Connected Account Info */}
        {integration.connected && integration.accountName && (
          <div
            className="mt-4 p-3 rounded-lg flex items-center gap-3"
            style={{ backgroundColor: SYSTEM.gray6 }}
          >
            {integration.accountAvatar ? (
              <img
                src={integration.accountAvatar}
                alt={integration.accountName}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div
                className="size-8  rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${integration.color}15` }}
              >
                <span className="text-xs font-semibold" style={{ color: integration.color }}>
                  {integration.accountName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-black">
                {integration.accountName}
              </p>
              {integration.accountEmail && (
                <p className="text-[12px] text-gray-400">
                  {integration.accountEmail}
                </p>
              )}
            </div>
            {integration.connectedAt && (
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <Clock className="w-3 h-3" />
                {new Date(integration.connectedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>
        )}

        {/* Features List */}
        <ul className="mt-4 space-y-1.5">
          {integration.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-[13px]"
            >
              {integration.connected ? (
                <ShieldCheck
                  className="w-4 h-4 shrink-0"
                  style={{ color: SYSTEM.green }}
                />
              ) : (
                <div
                  className="w-4 h-4 rounded-full shrink-0 border-2"
                  style={{ borderColor: SYSTEM.gray5 }}
                />
              )}
              <span
                className={
                  integration.connected
                    ? 'text-gray-700'
                    : 'text-gray-400'
                }
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          {!integration.connected ? (
            <button
              type="button"
              onClick={() => onConnect(integration.id)}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl text-[15px] font-semibold text-white transition-opacity duration-150 active:scale-[0.98]"
              style={{
                backgroundColor: SYSTEM.blue,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Connect
              </span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onConnect(integration.id)}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl text-[15px] font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: SYSTEM.gray6,
                  color: SYSTEM.label,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowUpRight className="w-4 h-4" />
                  Reconnect
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDisconnect(integration.id)}
                disabled={isLoading}
                className="py-2.5 px-4 rounded-xl text-[15px] font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: `${SYSTEM.red}10`,
                  color: SYSTEM.red,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <span className="flex items-center gap-2">
                  <Unlink className="w-4 h-4" />
                  Disconnect
                </span>
              </button>
            </>
          )}

          {integration.docsUrl && (
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl transition-colors duration-150"
              style={{
                backgroundColor: SYSTEM.gray6,
                color: SYSTEM.gray,
              }}
              title="Documentation"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Apple-style Toast ────────────────────────────────────────────────────
function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        backgroundColor: type === 'success' ? SYSTEM.green : SYSTEM.red,
        color: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        animation: 'toastSlide 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        minWidth: '280px',
        maxWidth: '90vw',
      }}
    >
      {type === 'success' ? (
        <Check className="w-5 h-5 shrink-0" />
      ) : (
        <X className="w-5 h-5 shrink-0" />
      )}
      <span className="text-[14px] font-medium">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── Main Page (Apple-style) ────────────────────────────────────────────────
export default function IntegrationsPage() {
  const router = useRouter()
  const { replace } = useRouter()

  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const fetchIntegrations = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/integrations')
      const data = await res.json()
      setIntegrations(data.integrations ?? [])
    } catch {
      setToast({ message: 'Failed to load integrations', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIntegrations()
  }, [fetchIntegrations])

  // Handle redirect from OAuth callback
  useEffect(() => {
    const { success, error, provider } = router.query
    if (success === 'true' && provider) {
      setToast({
        message: `${provider} connected successfully`,
        type: 'success',
      })
      fetchIntegrations()
      replace('/settings/integrations', undefined, { shallow: true })
    } else if (error && provider) {
      setToast({
        message: `Failed to connect ${provider}: ${error}`,
        type: 'error',
      })
      replace('/settings/integrations', undefined, { shallow: true })
    }
  }, [router.query, fetchIntegrations, router])

  const handleConnect = useCallback((providerId: string) => {
    setLoadingProvider(providerId)
    window.location.href = `/api/integrations/${providerId}/connect`
  }, [])

  const handleDisconnect = useCallback(
    async (providerId: string) => {
      setLoadingProvider(providerId)
      try {
        const res = await fetch(
          `/api/integrations?provider=${providerId}`,
          { method: 'DELETE' }
        )
        if (res.ok) {
          setToast({ message: `${providerId} disconnected`, type: 'success' })
          await fetchIntegrations()
        } else {
          throw new Error('Disconnect failed')
        }
      } catch {
        setToast({
          message: `Failed to disconnect ${providerId}`,
          type: 'error',
        })
      } finally {
        setLoadingProvider(null)
      }
    },
    [fetchIntegrations]
  )

  // Filter integrations
  const filtered = integrations.filter((i) => {
    const matchesSearch =
      !searchQuery ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || i.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const grouped = CATEGORY_ORDER.reduce<Record<string, Integration[]>>(
    (acc, cat) => {
      const items = filtered.filter((i) => i.category === cat)
      if (items.length > 0) acc[cat] = items
      return acc
    },
    {}
  )

  const connectedCount = integrations.filter((i) => i.connected).length

  return (
    <>
      <Head>
        <title>Integrations</title>
      </Head>

      {/* iOS-style page background */}
      <div
        className="min-h-screen"
        style={{
          backgroundColor: SYSTEM.background,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
        }}
      >
        <div className="max-w-[980px] mx-auto px-5 pt-8 pb-20">
          {/* Navigation Bar (iOS-style) */}
          <nav className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="text-[28px] font-semibold text-black tracking-[-0.02em]"
                style={{ fontFamily: 'inherit' }}
              >
                Integrations
              </h1>
              {connectedCount > 0 && (
                <p className="text-[13px] text-gray-500 mt-1">
                  {connectedCount} of {integrations.length} connected
                </p>
              )}
            </div>
          </nav>

          {/* Search Bar (iOS-style) */}
          <div className="mb-6">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150"
              style={{ backgroundColor: SYSTEM.gray6 }}
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                aria-label='search-input'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integrations"
                className="flex-1 bg-transparent text-[16px] text-black placeholder:text-gray-400 outline-none"
                style={{ fontFamily: 'inherit' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Category Segmented Control (iOS-style) */}
          <div className="mb-8">
            <div
              className="inline-flex p-1 rounded-xl"
              style={{ backgroundColor: SYSTEM.gray6 }}
            >
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
                style={{
                  backgroundColor:
                    selectedCategory === 'all' ? SYSTEM.surface : 'transparent',
                  color:
                    selectedCategory === 'all'
                      ? SYSTEM.label
                      : SYSTEM.labelSecondary,
                  boxShadow:
                    selectedCategory === 'all'
                      ? '0 1px 3px rgba(0,0,0,0.08)'
                      : 'none',
                }}
              >
                All
              </button>
              {CATEGORY_ORDER.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
                  style={{
                    backgroundColor:
                      selectedCategory === cat
                        ? SYSTEM.surface
                        : 'transparent',
                    color:
                      selectedCategory === cat
                        ? SYSTEM.label
                        : SYSTEM.labelSecondary,
                    boxShadow:
                      selectedCategory === cat
                        ? '0 1px 3px rgba(0,0,0,0.08)'
                        : 'none',
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && integrations.length === 0 && (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <Settings className="size-8  mb-3 animate-spin" />
              <p className="text-[15px]">Loading integrations…</p>
            </div>
          )}

          {/* Grouped Cards */}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-10">
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-4 px-1">
                <span style={{ color: SYSTEM.labelSecondary }}>
                  {CATEGORY_ICONS[category]}
                </span>
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-gray-500">
                  {CATEGORY_LABELS[category]}
                </h2>
                <span className="text-[13px] text-gray-400 ml-auto">
                  {items.length}
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    isLoading={loadingProvider === integration.id}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filtered.length === 0 && !isLoading && (
            <div className="flex flex-col items-center py-24 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: SYSTEM.gray6 }}
              >
                <Plug className="size-8  text-gray-300" />
              </div>
              <h3 className="text-[17px] font-semibold text-black mb-1">
                No integrations found
              </h3>
              <p className="text-[13px] text-gray-500 max-w-[280px]">
                Try a different search term or browse all categories
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Animations */}
      <style>{`
        @keyframes toastSlide {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-16px) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}
