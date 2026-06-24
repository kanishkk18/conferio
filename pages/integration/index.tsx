// // ── Slack ──────────────────────────────────────────────────────────────
// import { SlackPanel } from '@/components/integrations/slack/SlackPanel'
// import { NotionImporter } from '@/components/integrations/notion/NotionImporter'
// import { JiraPanel } from '@/components/integrations/jira/JiraPanel'
// import { StorageFilePicker } from '@/components/integrations/storage/StorageFilePicker'
// import { SalesforcePanel } from '@/components/integrations/salesforce/SalesforcePanel'
// import { DiscordPanel } from '@/components/integrations/discord/DiscordPanel'
// import { TeamsPanel } from '@/components/integrations/microsoft/TeamsPanel'

// <SlackPanel
//   onSendToConferio={(message, channelName) => {
//     // Forward Slack message to your chat
//     sendChatMessage({ content: message.text, source: 'slack', channel: channelName })
//   }}
// />

// // ── Notion ────────────────────────────────────────────────────────────
// <NotionImporter
//   workspaceId={currentWorkspaceId}
//   onImported={(conferioPage) => {
//     router.push(`/docs/${currentWorkspaceId}/pages/${conferioPage.id}`)
//   }}
//   onClose={() => setShowNotionImporter(false)}
// />

// // ── Jira ──────────────────────────────────────────────────────────────
//             <JiraPanel
//   onLinkToTask={(jiraIssue) => {
//     // Link a Jira issue to the current Conferio task
//     linkJiraIssue({ taskId: currentTaskId, issueKey: jiraIssue.key, issueUrl: jiraIssue.url })
//   }}
// />

// // ── Box / Dropbox / OneDrive (same component, pass provider) ──────────

// <StorageFilePicker provider="box" mode="import" teamId={teamId}
//   onSelect={(file, action, result) => {
//     if (action === 'import') addFileToTask(result.file)
//     if (action === 'share') sendMessage({ shareUrl: result.shareUrl })
//   }}
// />
// <StorageFilePicker provider="dropbox" mode="share" onSelect={...} />
// <StorageFilePicker provider="onedrive" mode="both" teamId={teamId} onSelect={...} />

// // ── Salesforce ────────────────────────────────────────────────────────
// <SalesforcePanel
//   onSelectContact={(contact) => {
//     // Add contact to task/meeting context
//     addContactToTask({ taskId, contactName: contact.name, contactEmail: contact.email })
//   }}
//   onSelectAccount={(account) => console.log('Account:', account)}
// />

// // ── Discord ───────────────────────────────────────────────────────────
// <DiscordPanel
//   onSendToConferio={(message) => {
//     sendChatMessage({ content: message.content, source: 'discord' })
//   }}
// />

// // ── Microsoft Teams ───────────────────────────────────────────────────
// <TeamsPanel
//   onSendToConferio={(message) => {
//     sendChatMessage({ content: message.content, source: 'teams' })
//   }}
// />

// pages/integrations/index.tsx
// NOTE: In pages router, this file must be index.tsx NOT page.tsx
// Access at: /integrations

// import React, { useState } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/router'
// import { SlackPanel } from '@/components/integrations/slack/SlackPanel'
// import { DiscordPanel } from '@/components/integrations/discord/DiscordPanel'
// import { TeamsPanel } from '@/components/integrations/microsoft/TeamsPanel'
// import { NotionImporter } from '@/components/integrations/notion/NotionImporter'
// import { JiraPanel } from '@/components/integrations/jira/JiraPanel'
// import { SalesforcePanel } from '@/components/integrations/salesforce/SalesforcePanel'
// // import { StorageFilePicker } from '@/components/integrations/storage/StorageFilePicker'
// import { GmailPanel } from '@/components/integrations/google/GmailPanel'
// import { DrivePicker } from '@/components/integrations/google/DrivePicker'
// import Link from 'next/link'

// type Tab =
//   | 'slack'
//   | 'discord'
//   | 'teams'
//   | 'notion'
//   | 'jira'
//   | 'salesforce'
//   | 'box'
//   | 'dropbox'
//   | 'onedrive'
//   | 'gmail'
//   | 'drive'

// const TABS: { id: Tab; label: string; icon: string; color: string }[] = [
//   { id: 'slack', label: 'Slack', icon: '💬', color: '#4A154B' },
//   { id: 'discord', label: 'Discord', icon: '🎮', color: '#5865F2' },
//   { id: 'teams', label: 'Teams', icon: '💼', color: '#6264A7' },
//   { id: 'notion', label: 'Notion', icon: '📝', color: '#000000' },
//   { id: 'jira', label: 'Jira', icon: '🎯', color: '#0052CC' },
//   { id: 'salesforce', label: 'Salesforce', icon: '☁️', color: '#00A1E0' },
//   { id: 'gmail', label: 'Gmail', icon: '📧', color: '#EA4335' },
//   { id: 'drive', label: 'Drive', icon: '📁', color: '#4285F4' },
//   { id: 'box', label: 'Box', icon: '📦', color: '#0061D5' },
//   { id: 'dropbox', label: 'Dropbox', icon: '💧', color: '#0061FF' },
//   { id: 'onedrive', label: 'OneDrive', icon: '☁️', color: '#00A4EF' },
// ]

// export default function IntegrationsHubPage() {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const [activeTab, setActiveTab] = useState<Tab>('slack')
//   const [notionWorkspaceId, setNotionWorkspaceId] = useState('')

//   if (status === 'loading') {
//     return (
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
//         <p style={{ color: '#9CA3AF' }}>Loading…</p>
//       </div>
//     )
//   }

//   if (!session) {
//     router.push('/login')
//     return null
//   }

//   const activeTabMeta = TABS.find(t => t.id === activeTab)!

//   return (
//     <div style={{
//       minHeight: '100vh',
//       backgroundColor: '#F9FAFB',
//       fontFamily: 'system-ui, -apple-system, sans-serif',
//     }}>
//       {/* Header */}
//       <div style={{
//         backgroundColor: '#fff',
//         borderBottom: '1px solid #E5E7EB',
//         padding: '16px 24px',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '12px',
//       }}>
//         <button
//           onClick={() => router.back()}
//           style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '20px', padding: 0 }}
//         >
//           ←
//         </button>
//         <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
//           Integration Hub
//         </h1>
//         <Link
//           href="/settings/integrations"
//           style={{ marginLeft: 'auto', fontSize: '13px', color: '#3B82F6', textDecoration: 'none' }}
//         >
//           Manage connections →
//         </Link>
//       </div>

//       <div style={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
//         {/* Sidebar */}
//         <div style={{
//           width: '200px',
//           backgroundColor: '#fff',
//           borderRight: '1px solid #E5E7EB',
//           padding: '12px 0',
//           flexShrink: 0,
//           overflowY: 'auto',
//         }}>
//           {TABS.map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               style={{
//                 width: '100%',
//                 padding: '10px 16px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px',
//                 border: 'none',
//                 cursor: 'pointer',
//                 backgroundColor: activeTab === tab.id ? `${tab.color}12` : 'transparent',
//                 color: activeTab === tab.id ? tab.color : '#374151',
//                 fontSize: '13.5px',
//                 fontWeight: activeTab === tab.id ? 600 : 400,
//                 fontFamily: 'inherit',
//                 textAlign: 'left',
//                 borderRight: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
//                 transition: 'all 0.1s',
//               }}
//             >
//               <span style={{ fontSize: '18px' }}>{tab.icon}</span>
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* Main content */}
//         <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
//           <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <span style={{ fontSize: '22px' }}>{activeTabMeta.icon}</span>
//             <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
//               {activeTabMeta.label}
//             </h2>
//           </div>

//           {/* ── Slack ── */}
//           {activeTab === 'slack' && (
//             <SlackPanel
//               onSendToConferio={(message, channelName) => {
//                 // You can implement forwarding to your chat here
//                 console.log('Forward to Conferio chat:', message.text, 'from', channelName)
//                 alert(`Message forwarded from #${channelName}`)
//               }}
//             />
//           )}

//           {/* ── Discord ── */}
//           {activeTab === 'discord' && (
//             <DiscordPanel
//               onSendToConferio={(message) => {
//                 console.log('Forward Discord message:', message.content)
//                 alert('Message forwarded to Conferio')
//               }}
//             />
//           )}

//           {/* ── Microsoft Teams ── */}
//           {activeTab === 'teams' && (
//             <TeamsPanel
//               onSendToConferio={(message) => {
//                 console.log('Forward Teams message:', message.content)
//                 alert('Message forwarded to Conferio')
//               }}
//             />
//           )}

//           {/* ── Notion ── */}
//           {activeTab === 'notion' && (
//             <div>
//               {!notionWorkspaceId ? (
//                 <div style={{
//                   padding: '20px',
//                   backgroundColor: '#fff',
//                   borderRadius: '12px',
//                   border: '1px solid #E5E7EB',
//                   marginBottom: '16px',
//                 }}>
//                   <p style={{ fontSize: '13.5px', color: '#374151', marginBottom: '12px', fontWeight: 500 }}>
//                     Select a workspace to import pages into:
//                   </p>
//                   <input
//                     placeholder="Enter your Conferio workspace ID"
//                     style={{
//                       width: '100%',
//                       padding: '8px 12px',
//                       border: '1.5px solid #E5E7EB',
//                       borderRadius: '8px',
//                       fontSize: '13px',
//                       outline: 'none',
//                       fontFamily: 'inherit',
//                       boxSizing: 'border-box',
//                     }}
//                     onChange={e => setNotionWorkspaceId(e.target.value)}
//                   />
//                 </div>
//               ) : (
//                 <NotionImporter
//                   workspaceId={notionWorkspaceId}
//                   onImported={(page) => {
//                     router.push(`/docs/${notionWorkspaceId}/pages/${page.id}`)
//                   }}
//                   onClose={() => setNotionWorkspaceId('')}
//                 />
//               )}
//             </div>
//           )}

//           {/* ── Jira ── */}
//           {activeTab === 'jira' && (
//             <JiraPanel
//               onLinkToTask={(issue) => {
//                 // No task context here — just open Jira issue
//                 window.open(issue.url, '_blank', 'noopener,noreferrer')
//               }}
//             />
//           )}

//           {/* ── Salesforce ── */}
//           {activeTab === 'salesforce' && (
//             <SalesforcePanel
//               onSelectContact={(contact) => {
//                 window.open(contact.url, '_blank', 'noopener,noreferrer')
//               }}
//               onSelectAccount={(account) => {
//                 window.open(account.url, '_blank', 'noopener,noreferrer')
//               }}
//             />
//           )}

//           {/* ── Gmail ── */}
//           {activeTab === 'gmail' && (
//             <GmailPanel />
//           )}

//           {/* ── Google Drive ── */}
//           {activeTab === 'drive' && (
//             <DrivePicker
//               mode="share"
//               onSelect={(file, action, result) => {
//                 if (action === 'share') {
//                   navigator.clipboard.writeText(result.shareUrl)
//                   alert(`Share link copied: ${result.shareUrl}`)
//                 }
//               }}
//             />
//           )}

//           {/* ── Box ── */}
//           {/* {activeTab === 'box' && (
//             <StorageFilePicker
//               provider="box"
//               mode="both"
//               onSelect={(file, action, result) => {
//                 if (action === 'share') {
//                   navigator.clipboard.writeText(result.shareUrl)
//                   alert(`Share link copied: ${result.shareUrl}`)
//                 }
//                 if (action === 'import') {
//                   alert(`File "${file.name}" imported to Conferio`)
//                 }
//               }}
//             />
//           )} */}

//           {/* ── Dropbox ── */}
//           {/* {activeTab === 'dropbox' && (
//             <StorageFilePicker
//               provider="dropbox"
//               mode="both"
//               onSelect={(file, action, result) => {
//                 if (action === 'share') {
//                   navigator.clipboard.writeText(result.shareUrl)
//                   alert(`Share link copied: ${result.shareUrl}`)
//                 }
//                 if (action === 'import') {
//                   alert(`File "${file.name}" imported to Conferio`)
//                 }
//               }}
//             />
//           )} */}

//           {/* ── OneDrive ── */}
//           {/* {activeTab === 'onedrive' && (
//             <StorageFilePicker
//               provider="onedrive"
//               mode="both"
//               onSelect={(file, action, result) => {
//                 if (action === 'share') {
//                   navigator.clipboard.writeText(result.shareUrl)
//                   alert(`Share link copied: ${result.shareUrl}`)
//                 }
//                 if (action === 'import') {
//                   alert(`File "${file.name}" imported to Conferio`)
//                 }
//               }}
//             />
//           )} */}
//         </div>
//       </div>
//     </div>
//   )
// }

export default function IntegrationsHubPage() {
    return (
    <div className="">
        in development
    </div>
    )
}