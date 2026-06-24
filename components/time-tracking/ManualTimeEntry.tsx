// // components/time-tracking/ManualTimeEntry.tsx
// import React, { useState, useEffect } from 'react';
// import { X, Clock, AlertCircle, Check } from 'lucide-react';
// import { TaskSelector } from './TaskSelector';
// import { format } from 'date-fns';

// interface ManualTimeEntryProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export function ManualTimeEntry({ isOpen, onClose, onSuccess }: ManualTimeEntryProps) {
//   const [selectedTask, setSelectedTask] = useState<any>(null);
//   const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//   const [startTime, setStartTime] = useState('09:00');
//   const [duration, setDuration] = useState('1:00');
//   const [isBillable, setIsBillable] = useState(true);
//   const [description, setDescription] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [limitInfo, setLimitInfo] = useState<{ used: number; remaining: number; requiresApproval: boolean } | null>(null);
//   const [showSuccess, setShowSuccess] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       checkManualLimit();
//     }
//   }, [isOpen]);

//   const checkManualLimit = async () => {
//     try {
//       const now = new Date();
//       const res = await fetch(`/api/time-tracking/manual/limit?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
//       const data = await res.json();
//       setLimitInfo(data);
//     } catch (error) {
//       console.error('Failed to check limit:', error);
//     }
//   };

//   const parseDuration = (durationStr: string): number => {
//     const [hours, minutes] = durationStr.split(':').map(Number);
//     return (hours * 60) + (minutes || 0);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const durationMinutes = parseDuration(duration);
      
//       const res = await fetch('/api/time-tracking/manual/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           taskId: selectedTask?.id,
//           date,
//           startTime,
//           duration: durationMinutes,
//           isBillable,
//           description,
//         }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         setShowSuccess(true);
//         setTimeout(() => {
//           setShowSuccess(false);
//           onSuccess();
//           onClose();
//           // Reset form
//           setSelectedTask(null);
//           setDescription('');
//           setDuration('1:00');
//         }, 1500);
//       }
//     } catch (error) {
//       console.error('Failed to create manual entry:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900">Add Time Entry</h2>
//             <p className="text-sm text-gray-500">Manually log your work hours</p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X className="size-5 text-gray-500" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-5">
//           {/* Limit Warning */}
//           {limitInfo && limitInfo.remaining < 3 && (
//             <div className={`p-4 rounded-lg flex items-start gap-3 ${
//               limitInfo.remaining === 0 ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'
//             }`}>
//               <AlertCircle className={`size-5 flex-shrink-0 ${
//                 limitInfo.remaining === 0 ? 'text-red-600' : 'text-yellow-600'
//               }`} />
//               <div className="flex-1">
//                 <p className={`text-sm font-medium ${
//                   limitInfo.remaining === 0 ? 'text-red-900' : 'text-yellow-900'
//                 }`}>
//                   {limitInfo.remaining === 0 
//                     ? 'Approval required for this entry' 
//                     : `${limitInfo.remaining} free manual entries remaining this month`}
//                 </p>
//                 <p className={`text-xs mt-1 ${
//                   limitInfo.remaining === 0 ? 'text-red-600' : 'text-yellow-700'
//                 }`}>
//                   {limitInfo.remaining === 0 
//                     ? 'This entry will require admin approval to be billable.' 
//                     : 'After 3 entries, all manual entries require approval.'}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Task Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Task <span className="text-gray-400">(Optional)</span>
//             </label>
//             <TaskSelector
//               selectedTaskId={selectedTask?.id || null}
//               onSelectTask={setSelectedTask}
//             />
//           </div>

//           {/* Date and Time */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 value={date}
//                 max={format(new Date(), 'yyyy-MM-dd')}
//                 onChange={(e) => setDate(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Start Time
//               </label>
//               <input
//                 type="time"
//                 value={startTime}
//                 onChange={(e) => setStartTime(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           </div>

//           {/* Duration */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Duration (HH:MM)
//             </label>
//             <div className="relative">
//               <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4text-gray-400" />
//               <input
//                 type="text"
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//                 placeholder="1:30"
//                 pattern="[0-9]+:[0-5][0-9]"
//                 className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <p className="text-xs text-gray-500 mt-1">Format: hours:minutes (e.g., 1:30)</p>
//           </div>

//           {/* Billable Toggle */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <p className="text-sm font-medium text-gray-900">Billable Time</p>
//               <p className="text-xs text-gray-500">Mark this time as billable</p>
//             </div>
//             <button
//               type="button"
//               onClick={() => setIsBillable(!isBillable)}
//               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                 isBillable ? 'bg-green-500' : 'bg-gray-200'
//               }`}
//             >
//               <span
//                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                   isBillable ? 'translate-x-6' : 'translate-x-1'
//                 }`}
//               />
//             </button>
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="What did you work on?"
//               rows={3}
//               className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//               required
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading || !description}
//             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             {loading ? (
//               <>
//                 <div className="size-4border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 Saving...
//               </>
//             ) : showSuccess ? (
//               <>
//                 <Check className="size-4 />
//                 Saved!
//               </>
//             ) : (
//               'Add Time Entry'
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
