
// // components/time-tracking/TimeEntryPopover.tsx
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { 
//   Play, 
//   Pause, 
//   Square, 
//   Check, 
//   Clock, 
//   DollarSign, 
//   FileText, 
//   AlertTriangle
// } from 'lucide-react';
// import { format } from 'date-fns';
// import { TaskSelector } from './TaskSelector';
// import { InactivityModal } from './InactivityModal';
// import { Input } from '../ui/input';

// interface TimeEntryPopoverProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onEntryComplete?: () => void;
// }

// // Timer state stored in localStorage for persistence
// interface PersistedTimerState {
//   isRunning: boolean;
//   isPaused: boolean;
//   startTime: string | null;
//   pausedAt: string | null;
//   elapsedBeforePause: number;
//   taskId: string | null;
//   taskTitle: string | null;
//   taskProject: string | null;
//   isBillable: boolean;
//   description: string;
// }

// const INACTIVITY_TIMEOUT = 1 * 60 * 1000;
// const STORAGE_KEY = 'timeEntryWidget_timer';

// // --- NEW: Hook to get live timer state anywhere ---
// export function useLiveTimer() {
//   const [timerState, setTimerState] = useState<{
//     isRunning: boolean;
//     isPaused: boolean;
//     seconds: number;
//     taskTitle: string | null;
//   }>({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });

//   useEffect(() => {
//     const calculateState = () => {
//       try {
//         const saved = localStorage.getItem(STORAGE_KEY);
//         if (!saved) {
//           setTimerState({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });
//           return;
//         }
//         const state: PersistedTimerState = JSON.parse(saved);
//         if (!state.isRunning || !state.startTime) {
//           setTimerState({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });
//           return;
//         }
        
//         let seconds = 0;
//         if (state.isPaused) {
//           seconds = state.elapsedBeforePause || 0;
//         } else {
//           const now = Date.now();
//           const start = new Date(state.startTime).getTime();
//           seconds = Math.max(0, Math.floor((now - start) / 1000));
//         }
        
//         setTimerState({
//           isRunning: true,
//           isPaused: state.isPaused,
//           seconds,
//           taskTitle: state.taskTitle,
//         });
//       } catch {
//         setTimerState({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });
//       }
//     };

//     calculateState();
//     const interval = setInterval(calculateState, 1000);
    
//     // Also recalculate when tab becomes visible
//     const handleVisibility = () => { if (!document.hidden) calculateState(); };
//     document.addEventListener('visibilitychange', handleVisibility);
    
//     // Listen for storage changes from other tabs
//     const handleStorage = () => calculateState();
//     window.addEventListener('storage', handleStorage);

//     return () => {
//       clearInterval(interval);
//       document.removeEventListener('visibilitychange', handleVisibility);
//       window.removeEventListener('storage', handleStorage);
//     };
//   }, []);

//   const formatDisplay = (seconds: number): string => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
//   };

//   return { ...timerState, formattedTime: formatDisplay(timerState.seconds) };
// }
// // --- END HOOK ---

// export function TimeEntryPopover({ isOpen, onClose, onEntryComplete }: TimeEntryPopoverProps) {
//   const [inputValue, setInputValue] = useState('');
//   const [parsedMinutes, setParsedMinutes] = useState<number | null>(null);
  
//   const [isTimerRunning, setIsTimerRunning] = useState(() => {
//     if (typeof window === 'undefined') return false;
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const state: PersistedTimerState = JSON.parse(saved);
//         return state.isRunning ?? false;
//       }
//     } catch { /* ignore */ }
//     return false;
//   });
  
//   const [isPaused, setIsPaused] = useState(() => {
//     if (typeof window === 'undefined') return false;
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const state: PersistedTimerState = JSON.parse(saved);
//         return state.isPaused ?? false;
//       }
//     } catch { /* ignore */ }
//     return false;
//   });
  
//   const [timerSeconds, setTimerSeconds] = useState(() => {
//     if (typeof window === 'undefined') return 0;
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const state: PersistedTimerState = JSON.parse(saved);
//         if (state.isRunning && state.startTime) {
//           if (state.isPaused) {
//             return state.elapsedBeforePause || 0;
//           }
//           const now = Date.now();
//           const start = new Date(state.startTime).getTime();
//           let elapsed = Math.floor((now - start) / 1000);
//           return Math.max(0, elapsed);
//         }
//       }
//     } catch { /* ignore */ }
//     return 0;
//   });
  
//   const [timerStartTime, setTimerStartTime] = useState<Date | null>(() => {
//     if (typeof window === 'undefined') return null;
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const state: PersistedTimerState = JSON.parse(saved);
//         return state.isRunning && state.startTime ? new Date(state.startTime) : null;
//       }
//     } catch { /* ignore */ }
//     return null;
//   });
  
//   const [selectedTask, setSelectedTask] = useState<any>(() => {
//     if (typeof window === 'undefined') return null;
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const state: PersistedTimerState = JSON.parse(saved);
//         if (state.isRunning && state.taskId && state.taskTitle) {
//           return { id: state.taskId, title: state.taskTitle, project: state.taskProject };
//         }
//       }
//     } catch { /* ignore */ }
//     return null;
//   });
  
//   const [isBillable, setIsBillable] = useState(() => {
//     if (typeof window === 'undefined') return true;
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const state: PersistedTimerState = JSON.parse(saved);
//         return state.isRunning ? state.isBillable : true;
//       }
//     } catch { /* ignore */ }
//     return true;
//   });
  
//   const [description, setDescription] = useState(() => {
//     if (typeof window === 'undefined') return '';
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const state: PersistedTimerState = JSON.parse(saved);
//         return state.isRunning ? (state.description || '') : '';
//       }
//     } catch { /* ignore */ }
//     return '';
//   });
  
//   const [showDescription, setShowDescription] = useState(false);
//   const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
//   const [startTimeInput, setStartTimeInput] = useState(() => format(new Date(), 'HH:mm'));
  
//   const [loading, setLoading] = useState(false);
//   const [limitInfo, setLimitInfo] = useState<{ used: number; remaining: number } | null>(null);
  
//   const [showInactivityModal, setShowInactivityModal] = useState(false);
//   const [inactiveMinutes, setInactiveMinutes] = useState(0);
//   const [lastActivityTime, setLastActivityTime] = useState(() => Date.now());
  
//   const inputRef = useRef<HTMLInputElement>(null);
//   const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const popoverRef = useRef<HTMLDivElement>(null);

//   // --- Effects & Helpers ---

//   useEffect(() => {
//     if (!inputValue.trim() || isTimerRunning) {
//       setParsedMinutes(null);
//       return;
//     }
//     const minutes = parseTimeInput(inputValue);
//     setParsedMinutes(minutes);
//   }, [inputValue, isTimerRunning]);

//   useEffect(() => {
//     if (isTimerRunning && !isPaused) {
//       timerIntervalRef.current = setInterval(() => {
//         calculateElapsedTime();
//       }, 1000);
//     } else {
//       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
//     }
//     return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
//   }, [isTimerRunning, isPaused, timerStartTime]);

//   useEffect(() => {
//     try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) JSON.parse(saved); } 
//     catch { localStorage.removeItem(STORAGE_KEY); }
//     checkManualLimit();
//   }, []);

//   useEffect(() => {
//     if (isTimerRunning) {
//       const state: PersistedTimerState = {
//         isRunning: isTimerRunning,
//         isPaused: isPaused,
//         startTime: timerStartTime?.toISOString() || null,
//         pausedAt: isPaused ? new Date().toISOString() : null,
//         elapsedBeforePause: timerSeconds,
//         taskId: selectedTask?.id || null,
//         taskTitle: selectedTask?.title || null,
//         taskProject: selectedTask?.project || null,
//         isBillable,
//         description,
//       };
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
//     } else {
//       localStorage.removeItem(STORAGE_KEY);
//     }
//   }, [isTimerRunning, isPaused, timerStartTime, timerSeconds, selectedTask, isBillable, description]);

//   // Inactivity detection
//   useEffect(() => {
//     if (!isTimerRunning || isPaused) return;
//     const resetActivity = () => {
//       setLastActivityTime(Date.now());
//       if (showInactivityModal) setShowInactivityModal(false);
//     };
//     const checkInactivity = () => {
//       const inactive = Date.now() - lastActivityTime;
//       if (inactive > INACTIVITY_TIMEOUT && !showInactivityModal) {
//         setInactiveMinutes(Math.floor(inactive / 60000));
//         setShowInactivityModal(true);
//         handlePause();
//       }
//     };
//     const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
//     events.forEach(e => document.addEventListener(e, resetActivity));
//     inactivityTimeoutRef.current = setInterval(checkInactivity, 60000);
//     return () => {
//       events.forEach(e => document.removeEventListener(e, resetActivity));
//       if (inactivityTimeoutRef.current) clearInterval(inactivityTimeoutRef.current);
//     };
//   }, [isTimerRunning, isPaused, lastActivityTime, showInactivityModal]);

//   // Tab visibility
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         if (isTimerRunning && timerStartTime) {
//            const state: PersistedTimerState = {
//             isRunning: true, isPaused, startTime: timerStartTime.toISOString(), pausedAt: null,
//             elapsedBeforePause: timerSeconds, taskId: selectedTask?.id, taskTitle: selectedTask?.title,
//             taskProject: selectedTask?.project, isBillable, description,
//           };
//           localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
//         }
//       } else {
//         const saved = localStorage.getItem(STORAGE_KEY);
//         if (saved) {
//            try {
//              const state: PersistedTimerState = JSON.parse(saved);
//              if (state.isRunning && state.startTime) {
//                setTimerSeconds(state.isPaused ? state.elapsedBeforePause : Math.floor((Date.now() - new Date(state.startTime).getTime())/1000));
//              }
//            } catch(e) {}
//         }
//       }
//     };
//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
//   }, [isTimerRunning, isPaused, timerStartTime, timerSeconds, selectedTask, isBillable, description]);

//   // Click outside to close
//   useEffect(() => {
//     if (!isOpen) return;
//     const handleClickOutside = (event: MouseEvent) => {
//       if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
//         onClose();
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isOpen, onClose]);

//   // Sync with localStorage when popover opens (in case timer was started elsewhere)
//   useEffect(() => {
//     if (!isOpen) return;
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const state: PersistedTimerState = JSON.parse(saved);
//         if (state.isRunning && state.startTime) {
//           setIsTimerRunning(true);
//           setIsPaused(state.isPaused);
//           setTimerStartTime(new Date(state.startTime));
//           setTimerSeconds(state.isPaused ? (state.elapsedBeforePause || 0) : Math.floor((Date.now() - new Date(state.startTime).getTime()) / 1000));
//           if (state.taskId && state.taskTitle) {
//             setSelectedTask({ id: state.taskId, title: state.taskTitle, project: state.taskProject });
//           }
//           setIsBillable(state.isBillable);
//           setDescription(state.description || '');
//         }
//       }
//     } catch { /* ignore */ }
//   }, [isOpen]);

//   const calculateElapsedTime = useCallback(() => {
//     if (!timerStartTime) return;
//     const elapsed = Math.floor((Date.now() - timerStartTime.getTime()) / 1000);
//     setTimerSeconds(Math.max(0, elapsed));
//   }, [timerStartTime]);

//   const parseTimeInput = (input: string): number | null => {
//     const trimmed = input.trim().toLowerCase();
//     const hMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:h|hour|hours)?$/);
//     if (hMatch) return Math.round(parseFloat(hMatch[1]) * 60);
//     const mMatch = trimmed.match(/^(\d+)\s*(?:m|min|minute|minutes)?$/);
//     if (mMatch) return parseInt(mMatch[1]);
//     const cMatch = trimmed.match(/^(?:(\d+)\s*(?:h|hour|hours)?\s*)?(?:(\d+)\s*(?:m|min|minute|minutes)?)?$/);
//     if (cMatch) {
//       const h = cMatch[1] ? parseInt(cMatch[1]) : 0;
//       const m = cMatch[2] ? parseInt(cMatch[2]) : 0;
//       if (h > 0 || m > 0) return h * 60 + m;
//     }
//     return null;
//   };

//   const formatDuration = (minutes: number): string => {
//     const h = Math.floor(minutes / 60);
//     const m = minutes % 60;
//     return h === 0 ? `${m}m` : (m === 0 ? `${h}h` : `${h}h ${m}m`);
//   };

//   const formatTimerDisplay = (seconds: number): string => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
//   };

//   const checkManualLimit = async () => {
//     try {
//       const now = new Date();
//       const res = await fetch(`/api/time-tracking/manual/limit?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
//       if (res.ok) setLimitInfo(await res.json());
//     } catch (e) { console.error(e); }
//   };

//   const startTimer = async () => {
//     if (!selectedTask) return;
    
//     try {
//       const res = await fetch('/api/time-tracking/timer/start', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           taskId: selectedTask.id,
//           isBillable,
//           description,
//         }),
//       });
      
//       const data = await res.json();
      
//       if (!res.ok) {
//         if (res.status === 400 && data.error === 'Timer already running') {
//           const confirmReset = window.confirm(
//             "A timer is already running on the server (possibly from a previous session or another tab).\n\n" +
//             "Would you like to stop the existing timer and start a new one?"
//           );

//           if (confirmReset) {
//             await fetch('/api/time-tracking/timer/stop', { method: 'POST' });
//             resetTimer();
//             setTimeout(() => startTimer(), 200); 
//           }
//           return;
//         }
//         throw new Error(data.error || 'Failed to start timer');
//       }
      
//       const serverStartTime = new Date(data.entry.startTime);
//       setIsTimerRunning(true);
//       setIsPaused(false);
//       setTimerStartTime(serverStartTime);
//       setTimerSeconds(0);
//       setInputValue('');
//       setLastActivityTime(Date.now());
      
//       localStorage.setItem(STORAGE_KEY, JSON.stringify({
//         isRunning: true, isPaused: false, startTime: serverStartTime.toISOString(), pausedAt: null, elapsedBeforePause: 0,
//         taskId: selectedTask.id, taskTitle: selectedTask.title, taskProject: selectedTask.project, isBillable, description
//       }));
      
//     } catch (error) {
//       console.error('Failed to start timer:', error);
//     }
//   };

//   const handlePause = async () => {
//     setIsPaused(true);
//     const pausedAt = new Date().toISOString();
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved) {
//       const state: PersistedTimerState = JSON.parse(saved);
//       state.isPaused = true; state.pausedAt = pausedAt; state.elapsedBeforePause = timerSeconds;
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
//     }
//     try { await fetch('/api/time-tracking/timer/pause', { method: 'POST' }); } 
//     catch (e) { console.error('Failed to pause server', e); }
//   };

//   const handleResume = async () => {
//     const now = Date.now();
//     const newStartTime = new Date(now - (timerSeconds * 1000));
//     setTimerStartTime(newStartTime);
//     setIsPaused(false);
//     setLastActivityTime(now);
    
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved) {
//       const state: PersistedTimerState = JSON.parse(saved);
//       state.isPaused = false; state.pausedAt = null; state.startTime = newStartTime.toISOString();
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
//     }
//     try { await fetch('/api/time-tracking/timer/resume', { method: 'POST' }); } 
//     catch (e) { console.error('Failed to resume server', e); }
//   };

//   const stopTimer = async () => {
//     try {
//       const res = await fetch('/api/time-tracking/timer/stop', { method: 'POST' });
//       if ((await res.json()).success) {
//         resetTimer();
//         onEntryComplete?.();
//       }
//     } catch (e) { console.error(e); }
//   };

//   const resetTimer = () => {
//     setIsTimerRunning(false);
//     setIsPaused(false);
//     setTimerSeconds(0);
//     setTimerStartTime(null);
//     localStorage.removeItem(STORAGE_KEY);
//   };

//   const handleInactivityAction = (action: 'continue' | 'stop' | 'pause') => {
//     setShowInactivityModal(false);
//     if (action === 'continue') handleResume();
//     else if (action === 'stop') stopTimer();
//   };

//   const saveManualEntry = async () => {
//     if (!parsedMinutes || parsedMinutes <= 0) return;
//     setLoading(true);
//     try {
//       const res = await fetch('/api/time-tracking/manual/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ taskId: selectedTask?.id, date, startTime: startTimeInput, duration: parsedMinutes, isBillable, description }),
//       });
//       if (res.ok && (await res.json()).success) {
//         setInputValue(''); setDescription(''); setParsedMinutes(null);
//         checkManualLimit(); onEntryComplete?.();
//       }
//     } catch (e) { console.error(e); } finally { setLoading(false); }
//   };

//   const requiresApproval = limitInfo && limitInfo.remaining === 0;

//   if (!isOpen) return null;

//   return (
//     <>
//       <div 
//         ref={popoverRef}
//         className="fixed z-50 w-full max-w-md bg-white dark:bg-[#111111] rounded-xl shadow-2xl border border-gray-200 dark:border-[#484848] overflow-visible"
//         style={{ top: '60px', right: '20px' }}
//       >
//         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#484848]">
//           <div className="flex items-center gap-2">
//             <Clock className="size-4 text-gray-500" />
//             <span className="text-sm font-medium text-[#B4B4B4]">Track Time</span>
//           </div>
          
//           <div className="text-xs text-gray-500">{limitInfo && `${limitInfo.remaining} free entries left`}</div>
//         </div>

//         <div className="p-4 space-y-4">
//           <div className="relative">
//             <Input
//               ref={inputRef}
//               type="text"
//               value={isTimerRunning ? formatTimerDisplay(timerSeconds) : inputValue}
//               onChange={(e) => !isTimerRunning && setInputValue(e.target.value)}
//               placeholder={isTimerRunning ? '' : "Enter time (ex: 3h 20m) or start timer"}
//               disabled={isTimerRunning}
//               className={`w-full pl-2 pr-8 py-1.5 bg-gray-50 dark:bg-transparent border hover:dark:bg-[#222222] dark:border-[#484848] rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
//                 isTimerRunning ? 'text-center text-2xl tracking-wider bg-purple-50 border-purple-200' : 'text-gray-900 dark:text-white border-gray-200'
//               }`}
//             />
//             <button type="button"
//               onClick={() => { if (isTimerRunning) stopTimer(); else if (parsedMinutes) saveManualEntry(); else startTimer(); }}
//               disabled={!isTimerRunning && !parsedMinutes && !selectedTask}
//               className={`absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded-full transition-all ${
//                 isTimerRunning ? 'bg-red-100 hover:bg-red-200 text-red-600' : parsedMinutes ? 'bg-green-100 hover:bg-green-200 text-green-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50'
//               }`}
//             >
//               {isTimerRunning ? <Square className="size-3 fill-current" /> : parsedMinutes ? <Check className="size-3" /> : <Play className="size-3 fill-white" />}
//             </button>
//           </div>

//           {!isTimerRunning && parsedMinutes && (
//             <div className="flex items-center justify-between px-3 py-2 bg-purple-50 dark:bg-[#484848] rounded-lg border dark:border-none border-purple-100">
//               <span className="text-sm text-purple-700">Will log: <strong>{formatDuration(parsedMinutes)}</strong></span>
//               {requiresApproval && <span className="text-xs text-orange-600 flex items-center gap-1"><AlertTriangle className="size-3" /> Needs approval</span>}
//             </div>
//           )}

//           <div>
//             <div className="block text-sm font-medium text-gray-700 mb-2">
//               Task <span className="text-gray-400">(Optional)</span>
//             </div>
//             <TaskSelector selectedTaskId={selectedTask?.id || null} onSelectTask={setSelectedTask} />
//           </div>

//           {!isTimerRunning && parsedMinutes && (
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
//                 <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
//                 <input type="time" value={startTimeInput} onChange={(e) => setStartTimeInput(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
//               </div>
//             </div>
//           )}

//           {isTimerRunning && (
//             <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
//               <div className={`size-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-blue-500 animate-pulse'}`} />
//               <div className="flex-1">
//                 <p className="text-sm text-blue-900">{isPaused ? 'Timer paused' : 'Tracking...'}</p>
//                 <p className="text-xs text-blue-600">{timerStartTime ? `Started ${format(timerStartTime, 'h:mm a')}` : ''}</p>
//               </div>
//               {!isPaused && <button type="button" onClick={handlePause} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"><Pause className="size-4 text-blue-600" /></button>}
//               {isPaused && <button type="button" onClick={handleResume} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"><Play className="size-4 text-blue-600" /></button>}
//             </div>
//           )}
          
//           <button type="button" onClick={() => setShowDescription(!showDescription)} className="flex items-center gap-2 text-sm hover:dark:bg-[#222222] w-full py-1 px-2 rounded-sm text-gray-500 hover:text-gray-700 transition-colors">
//             <FileText className="size-4" />
//             {description ? 'Edit notes' : 'Add notes'}
//           </button>
          
//           {showDescription && (
//             <textarea 
//               aria-label="time-entry-notes" 
//               value={description} 
//               onChange={(e) => setDescription(e.target.value)} 
//               placeholder="What are you working on?" 
//               rows={2} 
//               className="w-full px-3 py-2 bg-transparent dark:bg-[#222222] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" 
//             />
//           )}
          
//           <div className="">
//             <button 
//               type="button" 
//               onClick={() => setIsBillable(!isBillable)} 
//               className={`relative inline-flex h-5 w-[37.5px] items-center rounded-full transition-colors ${isBillable ? 'bg-green-500' : 'bg-gray-300'}`}
//             >
//               <span className={`h-4 w-4 transform flex justify-center items-center rounded-full bg-white transition-transform ${isBillable ? 'translate-x-5' : 'translate-x-1'}`}>
//                 <DollarSign className="size-3 text-gray-400"/>
//               </span>
//             </button>
//           </div>

//           {!isTimerRunning && parsedMinutes && (
//             <button type="button" onClick={saveManualEntry} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
//               {loading ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving&hellip;</> : requiresApproval ? <><AlertTriangle className="size-4" /> Submit for Approval</> : <><Check className="size-4" /> Save Entry</>}
//             </button>
//           )}
//         </div>
//       </div>
      
//       <InactivityModal isOpen={showInactivityModal} onClose={() => handleInactivityAction('pause')} onAction={handleInactivityAction} inactiveMinutes={inactiveMinutes} />
//     </>
//   );
// }

// components/time-tracking/TimeEntryPopover.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Check,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { format } from 'date-fns';
import { TaskSelector } from './TaskSelector';
import { InactivityModal } from './InactivityModal';
import { Input } from '../ui/input';

// ── Persisted state shape ────────────────────────────────────────────────────
interface PersistedTimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: string | null;
  pausedAt: string | null;
  elapsedBeforePause: number;
  taskId: string | null;
  taskTitle: string | null;
  taskProject: string | null;
  isBillable: boolean;
  description: string;
}

const INACTIVITY_TIMEOUT = 1 * 60 * 1000;
const STORAGE_KEY = 'timeEntryWidget_timer';

// ── Retry helper ─────────────────────────────────────────────────────────────
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxAttempts = 3,
  baseDelayMs = 400,
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || (res.status >= 400 && res.status < 500)) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** (attempt - 1)));
    }
  }
  throw lastError;
}

// ── useLiveTimer — read-only hook for the navbar badge ──────────────────────
export function useLiveTimer() {
  const [timerState, setTimerState] = useState<{
    isRunning: boolean;
    isPaused: boolean;
    seconds: number;
    taskTitle: string | null;
  }>({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });

  useEffect(() => {
    const calculateState = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setTimerState({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });
          return;
        }
        const state: PersistedTimerState = JSON.parse(raw);

        // Not running at all
        if (!state.isRunning) {
          setTimerState({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });
          return;
        }

        // Paused — use the frozen elapsed value written at pause time
        if (state.isPaused) {
          setTimerState({
            isRunning: true,
            isPaused: true,
            seconds: state.elapsedBeforePause || 0,
            taskTitle: state.taskTitle,
          });
          return;
        }

        // Running — calculate from startTime
        if (!state.startTime) {
          setTimerState({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });
          return;
        }
        const seconds = Math.max(
          0,
          Math.floor((Date.now() - new Date(state.startTime).getTime()) / 1000),
        );
        setTimerState({ isRunning: true, isPaused: false, seconds, taskTitle: state.taskTitle });
      } catch {
        setTimerState({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });
      }
    };

    calculateState();
    const interval = setInterval(calculateState, 1000);
    const handleVisibility = () => { if (!document.hidden) calculateState(); };
    // 'storage' fires when another tab writes to localStorage
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);
    function handleStorage() { calculateState(); }
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const formatDisplay = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return { ...timerState, formattedTime: formatDisplay(timerState.seconds) };
}

// ── TimeEntry — the navbar trigger component ─────────────────────────────────
// Drop this wherever you want the timer icon + badge in your navbar.
// It owns open/close state and wires up the inline pause/resume/stop controls.
export function TimeEntry() {
  const [isOpen, setIsOpen] = useState(false);
  const { isRunning, isPaused, formattedTime } = useLiveTimer();

  // Inline controls need to call the API directly so the popover doesn't
  // have to be open. We share the same fetchWithRetry + nuclear reset pattern.
  const [actionLoading, setActionLoading] = useState<'pause' | 'resume' | 'stop' | null>(null);

  const handleInlinePause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading('pause');
    // Snapshot elapsed and freeze localStorage BEFORE the API call
    // so useLiveTimer immediately shows the frozen time on next tick
    let revertState: PersistedTimerState | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const state: PersistedTimerState = JSON.parse(raw);
        revertState = { ...state }; // keep a copy in case we need to roll back
        const elapsedNow = state.startTime
          ? Math.max(0, Math.floor((Date.now() - new Date(state.startTime).getTime()) / 1000))
          : (state.elapsedBeforePause || 0);
        state.isPaused = true;
        state.pausedAt = new Date().toISOString();
        state.elapsedBeforePause = elapsedNow;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
      await fetchWithRetry('/api/time-tracking/timer/pause', { method: 'POST' });
    } catch (err) {
      console.error('Inline pause failed', err);
      // Roll back localStorage so the timer keeps ticking
      if (revertState) localStorage.setItem(STORAGE_KEY, JSON.stringify(revertState));
    } finally {
      setActionLoading(null);
    }
  };

  const handleInlineResume = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading('resume');
    let revertState: PersistedTimerState | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const state: PersistedTimerState = JSON.parse(raw);
        revertState = { ...state };
        const newStart = new Date(Date.now() - (state.elapsedBeforePause * 1000));
        state.isPaused = false;
        state.pausedAt = null;
        state.startTime = newStart.toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
      await fetchWithRetry('/api/time-tracking/timer/resume', { method: 'POST' });
    } catch (err) {
      console.error('Inline resume failed', err);
      if (revertState) localStorage.setItem(STORAGE_KEY, JSON.stringify(revertState));
    } finally {
      setActionLoading(null);
    }
  };

  const handleInlineStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Guard: if already stopping, do nothing (prevents double-fire from rapid clicks)
    if (actionLoading === 'stop') return;
    setActionLoading('stop');
    // Optimistically clear localStorage so useLiveTimer hides badge immediately
    localStorage.removeItem(STORAGE_KEY);
    try {
      const res = await fetchWithRetry('/api/time-tracking/timer/stop', { method: 'POST' }, 3);
      // 200 = stopped cleanly, 404 = already stopped (both are fine, localStorage already cleared)
      if (!res.ok && res.status !== 404) {
        // Unexpected error — nuclear reset
        await fetchWithRetry('/api/time-tracking/timer/reset', { method: 'POST' }, 3);
      }
    } catch {
      try {
        await fetchWithRetry('/api/time-tracking/timer/reset', { method: 'POST' }, 2);
      } catch { /* best effort */ }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        {/* Timer icon — only shown when NO timer is running */}
        {!isRunning && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex justify-center items-center relative h-fit"
          >
            <Timer className="size-4" />
          </button>
        )}

        {/* Live badge + inline controls — only shown when timer IS running */}
        {isRunning && (
          <div className="flex items-center rounded-sm gap-0.5 dark:bg-[#242424]">
            {/* Time display — clicking opens the popover */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="py-0.5 text-[12px] font-semibold px-1.5 select-none text-[#B4B4B4]"
            >
              {formattedTime}
            </button>

            {/* Pause / Resume */}
            {isPaused ? (
              <button
                onClick={handleInlineResume}
                disabled={actionLoading !== null}
                title="Resume timer"
                className="flex items-center justify-center size-5 rounded hover:bg-gray-100 dark:hover:bg-[#222] text-[#B4B4B4] hover:text-green-600 transition-colors disabled:opacity-40"
              >
                {actionLoading === 'resume'
                  ? <div className="size-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                  : <Play className="size-2.5 fill-current" />
                }
              </button>
            ) : (
              <button
                onClick={handleInlinePause}
                disabled={actionLoading !== null}
                title="Pause timer"
                className="flex items-center justify-center size-5 rounded hover:bg-gray-100 dark:hover:bg-[#222] text-[#B4B4B4] hover:text-yellow-600 transition-colors disabled:opacity-40"
              >
                {actionLoading === 'pause'
                  ? <div className="size-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                  : <Pause className="size-2.5" />
                }
              </button>
            )}

            {/* Stop */}
            <button
              onClick={handleInlineStop}
              disabled={actionLoading !== null}
              title="Stop timer"
              className="flex items-center justify-center size-5 rounded hover:bg-gray-100 dark:hover:bg-[#222] text-[#B4B4B4] hover:text-red-600 transition-colors disabled:opacity-40"
            >
              {actionLoading === 'stop'
                ? <div className="size-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                : <Square className="size-2.5 fill-current" />
              }
            </button>
          </div>
        )}
      </div>

      <TimeEntryPopover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

// ── TimeEntryPopover ─────────────────────────────────────────────────────────

interface TimeEntryPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryComplete?: () => void;
}

function readPersistedState(): PersistedTimerState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as PersistedTimerState;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function TimeEntryPopover({ isOpen, onClose, onEntryComplete }: TimeEntryPopoverProps) {
  const persisted = readPersistedState();

  const [inputValue, setInputValue] = useState('');
  const [parsedMinutes, setParsedMinutes] = useState<number | null>(null);

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(persisted?.isRunning ?? false);
  const [isPaused, setIsPaused] = useState<boolean>(persisted?.isPaused ?? false);
  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    if (!persisted?.isRunning || !persisted.startTime) return 0;
    if (persisted.isPaused) return persisted.elapsedBeforePause || 0;
    return Math.max(0, Math.floor((Date.now() - new Date(persisted.startTime).getTime()) / 1000));
  });
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(
    persisted?.isRunning && persisted.startTime ? new Date(persisted.startTime) : null
  );
  const [selectedTask, setSelectedTask] = useState<any>(
    persisted?.isRunning && persisted.taskId
      ? { id: persisted.taskId, title: persisted.taskTitle, project: persisted.taskProject }
      : null
  );
  const [isBillable, setIsBillable] = useState<boolean>(persisted?.isRunning ? persisted.isBillable : true);
  const [description, setDescription] = useState<string>(persisted?.isRunning ? (persisted.description || '') : '');
  const [showDescription, setShowDescription] = useState(false);
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [startTimeInput, setStartTimeInput] = useState(() => format(new Date(), 'HH:mm'));

  const [loading, setLoading] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ used: number; remaining: number } | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactiveMinutes, setInactiveMinutes] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(() => Date.now());

  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // ── Effects ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!inputValue.trim() || isTimerRunning) { setParsedMinutes(null); return; }
    setParsedMinutes(parseTimeInput(inputValue));
  }, [inputValue, isTimerRunning]);

  useEffect(() => {
    if (isTimerRunning && !isPaused) {
      timerIntervalRef.current = setInterval(calculateElapsedTime, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isTimerRunning, isPaused, timerStartTime]);

  useEffect(() => {
    checkManualLimit();
    if (persisted?.isRunning) verifyServerTimerState();
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isTimerRunning) {
      const state: PersistedTimerState = {
        isRunning: true, isPaused,
        startTime: timerStartTime?.toISOString() || null,
        pausedAt: isPaused ? new Date().toISOString() : null,
        elapsedBeforePause: timerSeconds,
        taskId: selectedTask?.id || null,
        taskTitle: selectedTask?.title || null,
        taskProject: selectedTask?.project || null,
        isBillable, description,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isTimerRunning, isPaused, timerStartTime, timerSeconds, selectedTask, isBillable, description]);

  // Inactivity detection
  useEffect(() => {
    if (!isTimerRunning || isPaused) return;
    const resetActivity = () => {
      setLastActivityTime(Date.now());
      if (showInactivityModal) setShowInactivityModal(false);
    };
    const checkInactivity = () => {
      const inactive = Date.now() - lastActivityTime;
      if (inactive > INACTIVITY_TIMEOUT && !showInactivityModal) {
        setInactiveMinutes(Math.floor(inactive / 60000));
        setShowInactivityModal(true);
        handlePause();
      }
    };
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => document.addEventListener(e, resetActivity));
    inactivityTimeoutRef.current = setInterval(checkInactivity, 60000);
    return () => {
      events.forEach(e => document.removeEventListener(e, resetActivity));
      if (inactivityTimeoutRef.current) clearInterval(inactivityTimeoutRef.current);
    };
  }, [isTimerRunning, isPaused, lastActivityTime, showInactivityModal]);

  // Tab visibility sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const state: PersistedTimerState = JSON.parse(saved);
            if (state.isRunning && state.startTime) {
              setTimerSeconds(
                state.isPaused
                  ? state.elapsedBeforePause
                  : Math.floor((Date.now() - new Date(state.startTime).getTime()) / 1000)
              );
            }
          } catch { /* ignore */ }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Sync state when popover opens (timer may have changed via inline controls)
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: PersistedTimerState = JSON.parse(saved);
        if (state.isRunning && state.startTime) {
          setIsTimerRunning(true);
          setIsPaused(state.isPaused);
          setTimerStartTime(new Date(state.startTime));
          setTimerSeconds(
            state.isPaused
              ? (state.elapsedBeforePause || 0)
              : Math.floor((Date.now() - new Date(state.startTime).getTime()) / 1000)
          );
          if (state.taskId && state.taskTitle) {
            setSelectedTask({ id: state.taskId, title: state.taskTitle, project: state.taskProject });
          }
          setIsBillable(state.isBillable);
          setDescription(state.description || '');
        } else {
          // localStorage cleared by inline stop — sync popover state
          setIsTimerRunning(false);
          setIsPaused(false);
          setTimerSeconds(0);
          setTimerStartTime(null);
        }
      } else {
        setIsTimerRunning(false);
        setIsPaused(false);
        setTimerSeconds(0);
        setTimerStartTime(null);
      }
    } catch { /* ignore */ }
  }, [isOpen]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const calculateElapsedTime = useCallback(() => {
    if (!timerStartTime) return;
    setTimerSeconds(Math.max(0, Math.floor((Date.now() - timerStartTime.getTime()) / 1000)));
  }, [timerStartTime]);

  const parseTimeInput = (input: string): number | null => {
    const trimmed = input.trim().toLowerCase();
    const hOnly = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:h|hour|hours)$/);
    if (hOnly) return Math.round(parseFloat(hOnly[1]) * 60);
    const mOnly = trimmed.match(/^(\d+)\s*(?:m|min|minute|minutes)$/);
    if (mOnly) return parseInt(mOnly[1]);
    const combined = trimmed.match(/^(?:(\d+)\s*(?:h|hour|hours))?\s*(?:(\d+)\s*(?:m|min|minute|minutes))?$/);
    if (combined) {
      const h = combined[1] ? parseInt(combined[1]) : 0;
      const m = combined[2] ? parseInt(combined[2]) : 0;
      if (h > 0 || m > 0) return h * 60 + m;
    }
    return null;
  };

  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  const formatTimerDisplay = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const checkManualLimit = async () => {
    try {
      const now = new Date();
      const res = await fetch(`/api/time-tracking/manual/limit?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
      if (res.ok) setLimitInfo(await res.json());
    } catch (e) { console.error(e); }
  };

  const verifyServerTimerState = async () => {
    try {
      const res = await fetch('/api/time-tracking/timer/status');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.isRunning) resetTimerLocal();
    } catch { /* leave local state, let user reset manually */ }
  };

  // ── Core timer logic ─────────────────────────────────────────────────────

  const resetTimerLocal = () => {
    setIsTimerRunning(false);
    setIsPaused(false);
    setTimerSeconds(0);
    setTimerStartTime(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const startTimer = async () => {
    if (!selectedTask) return;
    setLoading(true);
    setRecoveryError(null);
    try {
      const res = await fetchWithRetry('/api/time-tracking/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: selectedTask.id, isBillable, description }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.error === 'Timer already running') {
          await fetchWithRetry('/api/time-tracking/timer/reset', { method: 'POST' });
          setLoading(false);
          return startTimer();
        }
        throw new Error(data.error || 'Failed to start timer');
      }

      const serverStartTime = new Date(data.entry.startTime);
      setIsTimerRunning(true);
      setIsPaused(false);
      setTimerStartTime(serverStartTime);
      setTimerSeconds(0);
      setInputValue('');
      setLastActivityTime(Date.now());
    } catch (error) {
      console.error('Failed to start timer:', error);
      setRecoveryError('Could not start timer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    setIsPaused(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: PersistedTimerState = JSON.parse(saved);
        state.isPaused = true;
        state.pausedAt = new Date().toISOString();
        state.elapsedBeforePause = timerSeconds;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { /* ignore */ }
    }
    try { await fetchWithRetry('/api/time-tracking/timer/pause', { method: 'POST' }); }
    catch (e) { console.error('Failed to pause server', e); }
  };

  const handleResume = async () => {
    const now = Date.now();
    const newStartTime = new Date(now - timerSeconds * 1000);
    setTimerStartTime(newStartTime);
    setIsPaused(false);
    setLastActivityTime(now);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: PersistedTimerState = JSON.parse(saved);
        state.isPaused = false;
        state.pausedAt = null;
        state.startTime = newStartTime.toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { /* ignore */ }
    }
    try { await fetchWithRetry('/api/time-tracking/timer/resume', { method: 'POST' }); }
    catch (e) { console.error('Failed to resume server', e); }
  };

  const stopTimer = async () => {
    setLoading(true);
    setRecoveryError(null);
    try {
      const res = await fetchWithRetry('/api/time-tracking/timer/stop', { method: 'POST' }, 3);
      if (res.ok) {
        const data = await res.json();
        if (data.success) { resetTimerLocal(); onEntryComplete?.(); return; }
      }
      if (res.status === 404) { resetTimerLocal(); onEntryComplete?.(); return; }
      throw new Error(`Stop returned ${res.status}`);
    } catch (err) {
      console.error('Stop failed after retries, attempting nuclear reset:', err);
      await nuclearReset();
    } finally {
      setLoading(false);
    }
  };

  const nuclearReset = async () => {
    setIsRecovering(true);
    try {
      const res = await fetchWithRetry('/api/time-tracking/timer/reset', { method: 'POST' }, 3);
      const data = await res.json();
      if (data.success) {
        resetTimerLocal();
        onEntryComplete?.();
        setRecoveryError(null);
      } else {
        setRecoveryError('Timer could not be stopped. Please refresh the page.');
      }
    } catch {
      setRecoveryError('Timer could not be stopped. Please refresh the page.');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleInactivityAction = (action: 'continue' | 'stop' | 'pause') => {
    setShowInactivityModal(false);
    if (action === 'continue') handleResume();
    else if (action === 'stop') stopTimer();
  };

  const saveManualEntry = async () => {
    if (!parsedMinutes || parsedMinutes <= 0) return;
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/time-tracking/manual/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: selectedTask?.id, date, startTime: startTimeInput, duration: parsedMinutes, isBillable, description }),
      });
      if (res.ok && (await res.json()).success) {
        setInputValue(''); setDescription(''); setParsedMinutes(null);
        checkManualLimit(); onEntryComplete?.();
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const requiresApproval = limitInfo && limitInfo.remaining === 0;

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={popoverRef}
        className="fixed z-50 w-full max-w-md bg-white dark:bg-[#111111] rounded-xl shadow-2xl border-[1px] border-gray-200 dark:border-[#222] overflow-visible"
        style={{ top: '60px', right: '20px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#222]">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-gray-500" />
            <span className="text-sm font-medium text-[#B4B4B4]">Track Time</span>
          </div>
          <div className="text-xs text-gray-500">{limitInfo && `${limitInfo.remaining} free entries left`}</div>
        </div>

        <div className="p-4 space-y-4">
          {/* Recovery error banner */}
          {recoveryError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="size-4 text-red-500 shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300 flex-1">{recoveryError}</span>
              <button
                type="button"
                onClick={nuclearReset}
                disabled={isRecovering}
                className="text-xs font-medium text-red-600 hover:text-red-800 underline disabled:opacity-50 whitespace-nowrap"
              >
                {isRecovering ? 'Resetting…' : 'Force reset'}
              </button>
            </div>
          )}

          {/* Main input */}
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={isTimerRunning ? formatTimerDisplay(timerSeconds) : inputValue}
              onChange={(e) => !isTimerRunning && setInputValue(e.target.value)}
              placeholder={isTimerRunning ? '' : "Enter time (ex: 3h 20m) or start timer"}
              disabled={isTimerRunning}
              className={`w-full pl-2 pr-8 py-1.5 bg-gray-50 dark:bg-transparent border hover:dark:bg-[#222222] dark:border-[#484848] rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                isTimerRunning
                  ? 'text-center text-2xl tracking-wider bg-purple-50 border-purple-200'
                  : 'text-gray-900 dark:text-white border-gray-200'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                if (isTimerRunning) stopTimer();
                else if (parsedMinutes) saveManualEntry();
                else startTimer();
              }}
              disabled={loading || isRecovering || (!isTimerRunning && !parsedMinutes && !selectedTask)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded-full transition-all ${
                isTimerRunning
                  ? 'bg-red-100 hover:bg-red-200 text-red-600'
                  : parsedMinutes
                    ? 'bg-green-100 hover:bg-green-200 text-green-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50'
              }`}
            >
              {loading || isRecovering
                ? <div className="size-3 border border-current border-t-transparent rounded-full animate-spin" />
                : isTimerRunning
                  ? <Square className="size-3 fill-current" />
                  : parsedMinutes
                    ? <Check className="size-3" />
                    : <Play className="size-3 fill-white" />
              }
            </button>
          </div>

          {/* Manual duration preview */}
          {!isTimerRunning && parsedMinutes && (
            <div className="flex items-center justify-between px-3 py-2 bg-purple-50 dark:bg-[#484848] rounded-lg border dark:border-none border-purple-100">
              <span className="text-sm text-purple-700">Will log: <strong>{formatDuration(parsedMinutes)}</strong></span>
              {requiresApproval && (
                <span className="text-xs text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="size-3" /> Needs approval
                </span>
              )}
            </div>
          )}

          {/* Task selector */}
          <div>
            <div className="block text-start text-sm font-medium text-gray-700 dark:text-white mb-2">
              Select Task
            </div>
            <TaskSelector selectedTaskId={selectedTask?.id || null} onSelectTask={setSelectedTask} />
          </div>

          {/* Date / start time — manual only */}
          {!isTimerRunning && parsedMinutes && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                <input type="time" value={startTimeInput} onChange={(e) => setStartTimeInput(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
          )}

          {/* Timer status bar */}
          {isTimerRunning && (
            <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className={`size-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-blue-500 animate-pulse'}`} />
              <div className="flex-1">
                <p className="text-sm text-blue-900">{isPaused ? 'Timer paused' : 'Tracking...'}</p>
                <p className="text-xs text-blue-600">{timerStartTime ? `Started ${format(timerStartTime, 'h:mm a')}` : ''}</p>
              </div>
              {!isPaused && (
                <button type="button" onClick={handlePause} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors">
                  <Pause className="size-4 text-blue-600" />
                </button>
              )}
              {isPaused && (
                <button type="button" onClick={handleResume} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors">
                  <Play className="size-4 text-blue-600" />
                </button>
              )}
            </div>
          )}

          {/* Notes toggle */}
          <button
            type="button"
            onClick={() => setShowDescription(!showDescription)}
            className="flex items-center gap-2 text-sm hover:dark:bg-[#222222] w-full py-1 px-2 rounded-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FileText className="size-4" />
            {description ? 'Edit notes' : 'Add notes'}
          </button>

          {showDescription && (
            <textarea
              aria-label="time-entry-notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              rows={2}
              className="w-full px-3 py-2 bg-transparent dark:bg-[#222222] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          )}

          {/* Billable toggle */}
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => setIsBillable(!isBillable)}
              className={`relative inline-flex h-5 w-[37.5px] items-center rounded-full transition-colors ${isBillable ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`h-4 w-4 transform flex justify-center items-center rounded-full bg-white transition-transform ${isBillable ? 'translate-x-5' : 'translate-x-1'}`}>
                <DollarSign className="size-3 text-gray-400" />
              </span>
            </button>
          </div>

          {/* Save manual entry */}
          {!isTimerRunning && parsedMinutes && (
            <button
              type="button"
              onClick={saveManualEntry}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading
                ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving&hellip;</>
                : requiresApproval
                  ? <><AlertTriangle className="size-4" /> Submit for Approval</>
                  : <><Check className="size-4" /> Save Entry</>
              }
            </button>
          )}
        </div>
      </div>

      <InactivityModal
        isOpen={showInactivityModal}
        onClose={() => handleInactivityAction('pause')}
        onAction={handleInactivityAction}
        inactiveMinutes={inactiveMinutes}
      />
    </>
  );
}