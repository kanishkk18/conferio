// components/integrations/google/DriveButton.tsx
/**
 * Small "Attach from Drive" button that opens a Drive picker modal.
 * Drop this anywhere — chat input, task form, file upload section.
 *
 * Usage:
 *   // In chat input toolbar:
 *   <DriveButton
 *     mode="share"
 *     onSelect={(file, action, result) => {
 *       if (action === 'share') sendMessage({ type: 'drive_link', url: result.shareUrl, name: file.name })
 *     }}
 *   />
 *
 *   // In task attachment section:
 *   <DriveButton
 *     mode="import"
 *     teamId={teamId}
 *     onSelect={(file, action, result) => {
 *       if (action === 'import') addAttachment(result.file)
 *     }}
 *   />
 */
// import React, { useState } from 'react'
// import { DrivePicker } from './DrivePicker'

// interface DriveButtonProps {
//   mode?: 'share' | 'import' | 'both'
//   teamId?: string
//   targetFolderId?: string
//   onSelect?: (file: any, action: 'share' | 'import', result?: any) => void
//   label?: string
//   compact?: boolean  // icon-only
//   allowedCategories?: string[]
// }

// export function DriveButton({
//   mode = 'both',
//   teamId,
//   targetFolderId,
//   onSelect,
//   label,
//   compact = false,
//   allowedCategories,
// }: DriveButtonProps) {
//   const [open, setOpen] = useState(false)

//   const handleSelect = (file: any, action: 'share' | 'import', result?: any) => {
//     onSelect?.(file, action, result)
//     setOpen(false)
//   }

//   return (
//     <>
//       <button
//         onClick={() => setOpen(true)}
//         title="Attach from Google Drive"
//         style={{
//           display: 'inline-flex',
//           alignItems: 'center',
//           gap: compact ? 0 : '6px',
//           padding: compact ? '6px' : '7px 12px',
//           borderRadius: '8px',
//           border: '1.5px solid #E5E7EB',
//           backgroundColor: '#fff',
//           cursor: 'pointer',
//           fontSize: '13px',
//           color: '#374151',
//           fontFamily: 'inherit',
//           transition: 'color 0.12s, border-color 0.12s',
//         }}
//         onMouseEnter={(e) => {
//           (e.currentTarget as HTMLButtonElement).style.borderColor = '#4285F4'
//           ;(e.currentTarget as HTMLButtonElement).style.color = '#4285F4'
//         }}
//         onMouseLeave={(e) => {
//           (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'
//           ;(e.currentTarget as HTMLButtonElement).style.color = '#374151'
//         }}
//       >
//         <img
//           src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
//           width={16} height={16} alt="Drive"
//           style={{ flexShrink: 0 }}
//         />
//         {!compact && <span>{label ?? 'Drive'}</span>}
//       </button>

//       {/* Picker Modal */}
//       {open && (
//         <>
//           <div
//             onClick={() => setOpen(false)}
//             style={{
//               position: 'fixed', inset: 0,
//               backgroundColor: 'rgba(0,0,0,0.4)',
//               backdropFilter: 'blur(4px)',
//               zIndex: 9990,
//             }}
//           />
//           <div style={{
//             position: 'fixed',
//             top: '50%', left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: '700px',
//             maxWidth: 'calc(100vw - 40px)',
//             zIndex: 9991,
//           }}>
//             <DrivePicker
//               mode={mode}
//               teamId={teamId}
//               targetFolderId={targetFolderId}
//               onSelect={handleSelect}
//               onClose={() => setOpen(false)}
//               allowedCategories={allowedCategories}
//             />
//           </div>
//         </>
//       )}
//     </>
//   )
// }
