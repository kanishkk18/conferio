// // components/time-tracking/TimerWidget.tsx
// import React, { useState } from 'react';
// import { Play, Pause, Square, Clock, DollarSign, FileText, X } from 'lucide-react';
// import { useTimer } from 'hooks/useTimer';
// import { TaskSelector } from './TaskSelector';
// import { InactivityModal } from './InactivityModal';

// interface TimerWidgetProps {
//   onEntryComplete?: () => void;
// }

// export function TimerWidget({ onEntryComplete }: TimerWidgetProps) {
//   const {
//     timerState,
//     formattedTime,
//     startTimer,
//     stopTimer,
//     pauseTimer,
//     resumeTimer,
//     showInactivityModal,
//     inactivityData,
//     handleInactivityAction,
//   } = useTimer();

//   const [selectedTask, setSelectedTask] = useState<any>(null);
//   const [isBillable, setIsBillable] = useState(true);
//   const [description, setDescription] = useState('');
//   const [showDescription, setShowDescription] = useState(false);

//   const handleStart = async () => {
//     try {
//       await startTimer(selectedTask?.id, isBillable, description);
//     } catch (error) {
//       console.error('Failed to start timer:', error);
//     }
//   };

//   const handleStop = async () => {
//     try {
//       await stopTimer();
//       onEntryComplete?.();
//       setSelectedTask(null);
//       setDescription('');
//     } catch (error) {
//       console.error('Failed to stop timer:', error);
//     }
//   };

//   return (
//     <>
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         {/* Header */}
//         <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//           <div className="flex items-center gap-2">
//             <Clock className="size-4text-gray-500" />
//             <span className="text-sm font-medium text-gray-700">Track Time</span>
//           </div>
//           {timerState.isRunning && (
//             <div className="flex items-center gap-2">
//               <span className={`size-2 rounded-full ${timerState.isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
//               <span className="text-xs text-gray-500">
//                 {timerState.isPaused ? 'Paused' : 'Tracking'}
//               </span>
//             </div>
//           )}
//         </div>

//         <div className="p-4 gap-y-4">
//           {/* Timer Display */}
//           <div className="text-center py-4">
//             <div className={`text-5xl font-mono font-bold tracking-tight ${
//               timerState.isRunning ? 'text-gray-900' : 'text-gray-300'
//             }`}>
//               {formattedTime}
//             </div>
//             <div className="text-sm text-gray-500 mt-1">
//               {timerState.isRunning 
//                 ? timerState.isPaused 
//                   ? 'Timer paused' 
//                   : 'Recording time...'
//                 : 'Ready to track'}
//             </div>
//           </div>

//           {/* Task Selection */}
//           {!timerState.isRunning && (
//             <div className="gap-y-3">
//               <TaskSelector
//                 selectedTaskId={selectedTask?.id || null}
//                 onSelectTask={setSelectedTask}
//               />
              
//               {/* Billable Toggle */}
//               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <DollarSign className={`size-4${isBillable ? 'text-green-600' : 'text-gray-400'}`} />
//                   <span className="text-sm font-medium text-gray-700">Billable</span>
//                 </div>
//                 <button
//                   onClick={() => setIsBillable(!isBillable)}
//                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                     isBillable ? 'bg-green-500' : 'bg-gray-200'
//                   }`}
//                 >
//                   <span
//                     className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                       isBillable ? 'translate-x-6' : 'translate-x-1'
//                     }`}
//                   />
//                 </button>
//               </div>

//               {/* Description */}
//               <button
//                 onClick={() => setShowDescription(!showDescription)}
//                 className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
//               >
//                 <FileText className="size-4 />
//                 {description ? 'Edit description' : 'Add description'}
//               </button>
              
//               {showDescription && (
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="What are you working on?"
//                   className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                   rows={2}
//                 />
//               )}
//             </div>
//           )}

//           {/* Active Task Info */}
//           {timerState.isRunning && selectedTask && (
//             <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
//               <div className="flex items-start gap-2">
//                 <div className="size-2 rounded-full bg-blue-500 mt-1.5" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-gray-900 truncate">
//                     {selectedTask.title}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {selectedTask.column.board.title}
//                   </p>
//                 </div>
//               </div>
//               {description && (
//                 <p className="text-xs text-gray-600 mt-2 line-clamp-2">
//                   {description}
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Control Buttons */}
//           <div className="flex gap-2">
//             {!timerState.isRunning ? (
//               <button
//                 onClick={handleStart}
//                 disabled={!selectedTask}
//                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Play className="size-4 />
//                 Start Timer
//               </button>
//             ) : (
//               <>
//                 {timerState.isPaused ? (
//                   <button
//                     onClick={resumeTimer}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
//                   >
//                     <Play className="size-4 />
//                     Resume
//                   </button>
//                 ) : (
//                   <button
//                     onClick={pauseTimer}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
//                   >
//                     <Pause className="size-4 />
//                     Pause
//                   </button>
//                 )}
//                 <button
//                   onClick={handleStop}
//                   className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
//                 >
//                   <Square className="size-4 />
//                   Stop
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Inactivity Modal */}
//       <InactivityModal
//         isOpen={showInactivityModal}
//         onClose={() => handleInactivityAction('pause')}
//         onAction={handleInactivityAction}
//         inactiveMinutes={inactivityData?.minutes || 0}
//       />
//     </>
//   );
// }
