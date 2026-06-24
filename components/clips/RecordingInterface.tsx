// // components/RecordingInterface.tsx

// import { useState } from 'react'
// import { useMediaRecorder } from 'hooks/useMediaRecorder'

// interface RecordingInterfaceProps {
//   onRecordingComplete: (blob: Blob, title: string) => void
//   onRecordingStateChange: (isRecording: boolean) => void
// }

// export default function RecordingInterface({ 
//   onRecordingComplete, 
//   onRecordingStateChange 
// }: RecordingInterfaceProps) {
//   const [recordingTitle, setRecordingTitle] = useState('')
//   const [recordingType, setRecordingType] = useState<'screen' | 'audio' | 'both'>('screen')

//   const { isRecording, error, startRecording, stopRecording } = useMediaRecorder({
//     onRecordingComplete: (blob) => {
//       onRecordingComplete(blob, recordingTitle || `Recording_${new Date().toISOString()}`)
//       setRecordingTitle('')
//       onRecordingStateChange(false)
//     },
//   })

//   const handleStartRecording = () => {
//     if (!recordingTitle.trim()) {
//       setRecordingTitle(`Recording_${new Date().toISOString()}`)
//     }
//     startRecording(recordingType)
//     onRecordingStateChange(true)
//   }

//   const handleStopRecording = () => {
//     stopRecording()
//   }

//   return (
//     <div className="">
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <div className="gap-y-1">
//         <div>
         
//           <select
//             value={recordingType}
//             onChange={(e) => setRecordingType(e.target.value as any)}
//             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isRecording}
//           >
//             <option value="screen">Screen Only</option>
//             <option value="audio">Audio Only</option>
//             <option value="both">Screen & Audio</option>
//           </select>
//         </div>

//         <div>
         
//           <input
//           aria-label='recording title'
//             type="text"
//             value={recordingTitle}
//             onChange={(e) => setRecordingTitle(e.target.value)}
//             placeholder="Enter a title for your recording"
//             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isRecording}
//           />
//         </div>

//         <div className="flex justify-start">
//           {!isRecording ? (
//             <button type="button" 
//               onClick={handleStartRecording}
//               className="bg-red-600 hover:bg-red-700 text-white px-6 py-1 rounded-md font-semibold flex items-center gap-x-2"
//             >
//               <div className="size-3 bg-white rounded-full"></div>
//               <span>Start Recording</span>
//             </button>
//           ) : (
//             <button type="button" 
//               onClick={handleStopRecording}
//               className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-x-2"
//             >
//               <div className="size-3 bg-white rounded-full"></div>
//               <span>Stop Recording</span>
//             </button>
//           )}
//         </div>

//         {isRecording && (
//           <div className="text-center">
//             <div className="inline-flex items-center px-4 py-2 bg-red-100 border border-red-300 rounded-full">
//               <div className="size-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
//               <span className="text-red-700 font-medium">Recording in progress&hellip;</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// import { useState } from 'react'
// import { useMediaRecorder } from 'hooks/useMediaRecorder'

// interface RecordingInterfaceProps {
//   onRecordingComplete: (blob: Blob, title: string, type: 'audio' | 'video' | 'both') => void
//   onRecordingStateChange: (isRecording: boolean) => void
// }

// export default function RecordingInterface({ 
//   onRecordingComplete, 
//   onRecordingStateChange 
// }: RecordingInterfaceProps) {
//   const [recordingTitle, setRecordingTitle] = useState('')
//   const [recordingType, setRecordingType] = useState<'audio' | 'video' | 'both'>('video')

//   const { isRecording, error, startRecording, stopRecording } = useMediaRecorder({
//     onRecordingComplete: (blob) => {
//       onRecordingComplete(
//         blob, 
//         recordingTitle || `Recording_${new Date().toISOString()}`,
//         recordingType
//       )
//       setRecordingTitle('')
//       onRecordingStateChange(false)
//     },
//   })

//   const handleStartRecording = () => {
//     if (!recordingTitle.trim()) {
//       setRecordingTitle(`Recording_${new Date().toISOString()}`)
//     }
//     startRecording(recordingType)
//     onRecordingStateChange(true)
//   }

//   const handleStopRecording = () => {
//     stopRecording()
//   }

//   return (
//     <div className="">
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <div className="gap-y-1">
//         <div>
//           <select
//             value={recordingType}
//             onChange={(e) => setRecordingType(e.target.value as 'audio' | 'video' | 'both')}
//             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isRecording}
//           >
//             <option value="video">Screen Only (No Audio)</option>
//             <option value="audio">Audio Only</option>
//             <option value="both">Screen & Audio</option>
//           </select>
//         </div>

//         <div>
//           <input
//             aria-label='recording title'
//             type="text"
//             value={recordingTitle}
//             onChange={(e) => setRecordingTitle(e.target.value)}
//             placeholder="Enter a title for your recording"
//             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isRecording}
//           />
//         </div>

//         <div className="flex justify-start">
//           {!isRecording ? (
//             <button type="button" 
//               onClick={handleStartRecording}
//               className="bg-red-600 hover:bg-red-700 text-white px-6 py-1 rounded-md font-semibold flex items-center gap-x-2"
//             >
//               <div className="size-3 bg-white rounded-full"></div>
//               <span>Start Recording</span>
//             </button>
//           ) : (
//             <button type="button" 
//               onClick={handleStopRecording}
//               className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-x-2"
//             >
//               <div className="size-3 bg-white rounded-full"></div>
//               <span>Stop Recording</span>
//             </button>
//           )}
//         </div>

//         {isRecording && (
//           <div className="text-center">
//             <div className="inline-flex items-center px-4 py-2 bg-red-100 border border-red-300 rounded-full">
//               <div className="size-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
//               <span className="text-red-700 font-medium">Recording in progress&hellip;</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

import { useState } from 'react'
import { useRecording } from 'contexts/RecordingContext'

interface RecordingInterfaceProps {
  onRecordingStateChange?: (isRecording: boolean) => void
  onClose?: () => void
}

export default function RecordingInterface({ 
  onRecordingStateChange,
  onClose
}: RecordingInterfaceProps) {
  const [recordingTitle, setRecordingTitle] = useState('')
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | 'both'>('video')
  const { startRecording, isRecording } = useRecording()

  const handleStartRecording = () => {
    const title = recordingTitle.trim() || `Recording_${new Date().toISOString()}`
    startRecording(recordingType, title)
    onRecordingStateChange?.(true)
    onClose?.() // Close dialog so user can use the app while recording
  }

  return (
    <div className="">
      {isRecording && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
          Recording started! You can close this dialog and use the app freely.
        </div>
      )}

      <div className="gap-y-1">
        <div>
          <select
            value={recordingType}
            onChange={(e) => setRecordingType(e.target.value as 'audio' | 'video' | 'both')}
            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isRecording}
          >
            <option value="video">Screen Only (No Audio)</option>
            <option value="audio">Audio Only</option>
            <option value="both">Screen & Audio</option>
          </select>
        </div>

        <div>
          <input
            aria-label='recording title'
            type="text"
            value={recordingTitle}
            onChange={(e) => setRecordingTitle(e.target.value)}
            placeholder="Enter a title for your recording"
            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isRecording}
          />
        </div>

        <div className="flex justify-start">
          {!isRecording ? (
            <button type="button" 
              onClick={handleStartRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-1 rounded-md font-semibold flex items-center gap-x-2"
            >
              <div className="size-3 bg-white rounded-full"></div>
              <span>Start Recording</span>
            </button>
          ) : (
            <div className="text-sm text-zinc-500 font-medium">
              Recording in progress...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}