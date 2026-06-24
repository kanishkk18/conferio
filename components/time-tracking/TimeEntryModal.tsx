// // components/time-tracking/TimeEntryWidget.tsx
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
// import { format, parseISO } from 'date-fns';
// import { TaskSelector } from './TaskSelector';
// import { InactivityModal } from './InactivityModal';
// import {
//   FloatingPanelCloseButton,
//   FloatingPanelContent,
//   FloatingPanelFooter,
//   FloatingPanelForm,
//   FloatingPanelLabel,
//   FloatingPanelRoot,
//   FloatingPanelSubmitButton,
//   FloatingPanelTextarea,
//   FloatingPanelTrigger,
// } from "@/components/ui/floatingPanel"
// import { Plus } from '../animate-ui/icons/plus';
// import { Input } from '../ui/input';


// interface TimeEntryWidgetProps {
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

// const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute (Adjusted comment)
// const STORAGE_KEY = 'timeEntryWidget_timer';

// export function TimeEntryWidget({ onEntryComplete}: TimeEntryWidgetProps) {
//   // Input parsing state
//   const [inputValue, setInputValue] = useState('');
//   const [parsedMinutes, setParsedMinutes] = useState<number | null>(null);
  
//   // Timer state (synced with localStorage) — lazy-initialized from persisted state
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
//           const now = Date.now();
//           const start = new Date(state.startTime).getTime();
//           let elapsed = Math.floor((now - start) / 1000);
//           // If paused, we should use the stored elapsed time, not calculate based on start time
//           if (state.isPaused) {
//             elapsed = state.elapsedBeforePause || 0;
//           }
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
  
//   // Task selection
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
  
//   // Entry details
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
//   const [startTime, setStartTime] = useState(() => format(new Date(), 'HH:mm'));
  
//   // UI state
//   const [loading, setLoading] = useState(false);
//   const [limitInfo, setLimitInfo] = useState<{ used: number; remaining: number } | null>(null);
//   const [recentEntries, setRecentEntries] = useState<any[]>([]);
  
//   // Inactivity state
//   const [showInactivityModal, setShowInactivityModal] = useState(false);
//   const [inactiveMinutes, setInactiveMinutes] = useState(0);
//   const [lastActivityTime, setLastActivityTime] = useState(() => Date.now());
  
//   const inputRef = useRef<HTMLInputElement>(null);
//   const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Parse time input (e.g., "2h", "30m", "1h30m", "2:30", "90m")
//   useEffect(() => {
//     if (!inputValue.trim() || isTimerRunning) {
//       setParsedMinutes(null);
//       return;
//     }
    
//     const minutes = parseTimeInput(inputValue);
//     setParsedMinutes(minutes);
//   }, [inputValue, isTimerRunning]);

//   // Timer interval - runs even when tab is hidden
//   useEffect(() => {
//     // Only run interval if running and NOT paused
//     if (isTimerRunning && !isPaused) {
//       timerIntervalRef.current = setInterval(() => {
//         calculateElapsedTime();
//       }, 1000);
//     } else {
//       if (timerIntervalRef.current) {
//         clearInterval(timerIntervalRef.current);
//       }
//     }
    
//     return () => {
//       if (timerIntervalRef.current) {
//         clearInterval(timerIntervalRef.current);
//       }
//     };
//   }, [isTimerRunning, isPaused, timerStartTime]);

//   // On mount: only call checkManualLimit (timer state is restored via lazy initializers above)
//   useEffect(() => {
//     // Clean up corrupt storage
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) JSON.parse(saved);
//     } catch {
//       localStorage.removeItem(STORAGE_KEY);
//     }
//     checkManualLimit();
//   }, []);

//   // Persist timer state to localStorage
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
//     // Only track inactivity if timer is running AND not already paused
//     if (!isTimerRunning || isPaused) return;

//     const resetActivity = () => {
//       setLastActivityTime(Date.now());
//       if (showInactivityModal) {
//         setShowInactivityModal(false);
//       }
//     };

//     const checkInactivity = () => {
//       const inactive = Date.now() - lastActivityTime;
//       if (inactive > INACTIVITY_TIMEOUT && !showInactivityModal) {
//         const minutes = Math.floor(inactive / 60000);
//         setInactiveMinutes(minutes);
//         setShowInactivityModal(true);
//         // Auto-pause timer (Optimistic update ensures no time counts during modal display)
//         handlePause();
//       }
//     };

//     // Activity events
//     const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
//     events.forEach(e => document.addEventListener(e, resetActivity));

//     // Check inactivity every minute
//     inactivityTimeoutRef.current = setInterval(checkInactivity, 60000);

//     return () => {
//       events.forEach(e => document.removeEventListener(e, resetActivity));
//       if (inactivityTimeoutRef.current) {
//         clearInterval(inactivityTimeoutRef.current);
//       }
//     };
//   }, [isTimerRunning, isPaused, lastActivityTime, showInactivityModal]);

//   // Handle page visibility change (tab switching)
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         // Tab hidden - save current state
//         if (isTimerRunning && !isPaused && timerStartTime) {
//           const state: PersistedTimerState = {
//             isRunning: true,
//             isPaused: false,
//             startTime: timerStartTime.toISOString(),
//             pausedAt: null,
//             elapsedBeforePause: timerSeconds,
//             taskId: selectedTask?.id || null,
//             taskTitle: selectedTask?.title || null,
//             taskProject: selectedTask?.project || null,
//             isBillable,
//             description,
//           };
//           localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
//         }
//       } else {
//         // Tab visible - restore and recalculate
//         const saved = localStorage.getItem(STORAGE_KEY);
//         if (saved) {
//           try {
//             const state: PersistedTimerState = JSON.parse(saved);
//             if (state.isRunning && state.startTime) {
//                // If it was paused when hidden, restore the paused state duration
//                if (state.isPaused) {
//                  setTimerSeconds(state.elapsedBeforePause);
//                } else {
//                  // If running, calculate elapsed based on server time saved
//                  const now = Date.now();
//                  const start = new Date(state.startTime).getTime();
//                  const elapsed = Math.floor((now - start) / 1000);
//                  setTimerSeconds(Math.max(0, elapsed));
//                }
//             }
//           } catch (e) {
//             console.error('Failed to restore on visibility change:', e);
//           }
//         }
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
//   }, [isTimerRunning, isPaused, timerStartTime, timerSeconds, selectedTask, isBillable, description]);

//   // Handle beforeunload (page refresh/close)
//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (isTimerRunning && !isPaused) {
//         // Save state before page unloads
//         const state: PersistedTimerState = {
//           isRunning: true,
//           isPaused: false,
//           startTime: timerStartTime?.toISOString() || null,
//           pausedAt: null,
//           elapsedBeforePause: timerSeconds,
//           taskId: selectedTask?.id || null,
//           taskTitle: selectedTask?.title || null,
//           taskProject: selectedTask?.project || null,
//           isBillable,
//           description,
//         };
//         localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, [isTimerRunning, isPaused, timerStartTime, timerSeconds, selectedTask, isBillable, description]);

//   const calculateElapsedTime = useCallback(() => {
//     if (!timerStartTime) return;
    
//     const now = Date.now();
//     const start = timerStartTime.getTime();
//     const elapsed = Math.floor((now - start) / 1000);
//     setTimerSeconds(Math.max(0, elapsed));
//   }, [timerStartTime]);

//   const parseTimeInput = (input: string): number | null => {
//     const trimmed = input.trim().toLowerCase();
    
//     const hourMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:h|hour|hours)?$/);
//     if (hourMatch) return Math.round(parseFloat(hourMatch[1]) * 60);
    
//     const minMatch = trimmed.match(/^(\d+)\s*(?:m|min|minute|minutes)?$/);
//     if (minMatch) return parseInt(minMatch[1]);
    
//     const combinedMatch = trimmed.match(/^(?:(\d+)\s*(?:h|hour|hours)?\s*)?(?:(\d+)\s*(?:m|min|minute|minutes)?)?$/);
//     if (combinedMatch) {
//       const hours = combinedMatch[1] ? parseInt(combinedMatch[1]) : 0;
//       const mins = combinedMatch[2] ? parseInt(combinedMatch[2]) : 0;
//       if (hours > 0 || mins > 0) return hours * 60 + mins;
//     }
    
//     const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
//     if (timeMatch) {
//       const hours = parseInt(timeMatch[1]);
//       const mins = parseInt(timeMatch[2]);
//       if (mins < 60) return hours * 60 + mins;
//     }
    
//     return null;
//   };

//   const formatDuration = (minutes: number): string => {
//     const h = Math.floor(minutes / 60);
//     const m = minutes % 60;
//     if (h === 0) return `${m}m`;
//     if (m === 0) return `${h}h`;
//     return `${h}h ${m}m`;
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
//       if (!res.ok) throw new Error('Failed to fetch');
//       const data = await res.json();
//       setLimitInfo(data);
//     } catch (error) {
//       console.error('Failed to check limit:', error);
//     }
//   };

//   // Start timer
//   const startTimer = async () => {
//     if (!selectedTask) {
//       // Shake animation or focus task selector
//       return;
//     }
    
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
//         // Handle specific scalable error: Timer already running on server
//         if (data.error === 'Timer already running') {
//           console.warn('Timer already running on server. Resetting local state.');
//           resetTimer();
//           // Optionally, you could trigger a toast here
//           alert('A timer is already running. We have reset your local view. Please refresh if you wish to see the active timer.');
//           return; 
//         }
//         throw new Error(data.error || 'Failed to start timer');
//       }
      
//       // Use server time for scalability
//       const serverStartTime = new Date(data.entry.startTime);
      
//       setIsTimerRunning(true);
//       setIsPaused(false);
//       setTimerStartTime(serverStartTime);
//       setTimerSeconds(0); // Will be updated immediately by interval
//       setInputValue('');
//       setLastActivityTime(Date.now());
      
//       // Persist immediately
//       const state: PersistedTimerState = {
//         isRunning: true,
//         isPaused: false,
//         startTime: serverStartTime.toISOString(),
//         pausedAt: null,
//         elapsedBeforePause: 0,
//         taskId: selectedTask.id,
//         taskTitle: selectedTask.title,
//         taskProject: selectedTask.project,
//         isBillable,
//         description,
//       };
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      
//     } catch (error) {
//       console.error('Failed to start timer:', error);
//       // Do not update UI state on failure
//     }
//   };

//   // Pause timer (Optimistic Update)
//   const handlePause = async () => {
//     // 1. Optimistic UI Update: Pause immediately so no time is counted
//     setIsPaused(true);
    
//     // 2. Persist Paused State locally
//     const pausedAt = new Date().toISOString();
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved) {
//       const state: PersistedTimerState = JSON.parse(saved);
//       state.isPaused = true;
//       state.pausedAt = pausedAt;
//       state.elapsedBeforePause = timerSeconds;
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
//     }

//     // 3. Notify Server
//     try {
//       await fetch('/api/time-tracking/timer/pause', { method: 'POST' });
//     } catch (error) {
//       console.error('Failed to sync pause with server:', error);
//       // Timer is paused locally regardless of server success
//     }
//   };

//   // Resume timer
//   const handleResume = async () => {
//     // 1. Calculate new start time to resume from current elapsed duration
//     // We want the timer to continue from 'timerSeconds'
//     const now = Date.now();
//     // The new start time must be (Now - Elapsed), so the elapsed calculation yields 'timerSeconds'
//     const newStartTime = new Date(now - (timerSeconds * 1000));

//     setTimerStartTime(newStartTime);
//     setIsPaused(false);
//     setLastActivityTime(now);

//     // 2. Update LocalStorage
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved) {
//       const state: PersistedTimerState = JSON.parse(saved);
//       state.isPaused = false;
//       state.pausedAt = null;
//       state.startTime = newStartTime.toISOString();
//       // Keep elapsedBeforePause in sync in case we pause again immediately
//       state.elapsedBeforePause = timerSeconds;
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
//     }

//     // 3. Notify Server
//     try {
//       await fetch('/api/time-tracking/timer/resume', { method: 'POST' });
//     } catch (error) {
//       console.error('Failed to sync resume with server:', error);
//     }
//   };

//   // Stop timer and save
//   const stopTimer = async () => {
//     try {
//       const res = await fetch('/api/time-tracking/timer/stop', { method: 'POST' });
//       const data = await res.json();
      
//       if (data.success) {
//         resetTimer();
//         onEntryComplete?.();
//       }
//     } catch (error) {
//       console.error('Failed to stop timer:', error);
//     }
//   };

//   const resetTimer = () => {
//     setIsTimerRunning(false);
//     setIsPaused(false);
//     setTimerSeconds(0);
//     setTimerStartTime(null);
//     localStorage.removeItem(STORAGE_KEY);
//   };

//   // Handle inactivity modal actions
//   const handleInactivityAction = (action: 'continue' | 'stop' | 'pause') => {
//     setShowInactivityModal(false);
    
//     switch (action) {
//       case 'continue':
//         handleResume();
//         break;
//       case 'stop':
//         stopTimer();
//         break;
//       case 'pause':
//         // Already paused by the modal trigger, just stay paused
//         break;
//     }
//   };

//   // Save manual entry
//   const saveManualEntry = async () => {
//     if (!parsedMinutes || parsedMinutes <= 0) return;
    
//     setLoading(true);
//     try {
//       const res = await fetch('/api/time-tracking/manual/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           taskId: selectedTask?.id,
//           date,
//           startTime,
//           duration: parsedMinutes,
//           isBillable,
//           description,
//         }),
//       });

//       if (!res.ok) throw new Error('Failed to save');
      
//       const data = await res.json();
//       if (data.success) {
//         setInputValue('');
//         setDescription('');
//         setParsedMinutes(null);
//         checkManualLimit();
//         onEntryComplete?.();
//       }
//     } catch (error) {
//       console.error('Failed to save entry:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const requiresApproval = limitInfo && limitInfo.remaining === 0;

//   return (
//     <>
//     <FloatingPanelRoot>
//         <FloatingPanelTrigger className='!py-0 !px-0 !h-8 !w-fit'>
//             {isTimerRunning ? (
//              <div className="relative">
//             <input
//               aria-label="time-entry-modal"
//               ref={inputRef}
//               type="text"
//               value={isTimerRunning ? formatTimerDisplay(timerSeconds) : inputValue}
//               onChange={(e) => !isTimerRunning && setInputValue(e.target.value)}
//               placeholder={isTimerRunning ? '' : "Enter time (ex: 3h 20m) or start timer"}
//               disabled={isTimerRunning}
//               className={`py-1 !w-fit border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
//                 isTimerRunning 
//                   ? 'text-center text-2xl tracking-wider border-purple-200' 
//                   : 'text-gray-900 border-gray-200'
//               }`}
//             />
        
//             <button type="button"
//               onClick={() => {
//                 if (isTimerRunning) {
//                   stopTimer();
//                 } else if (parsedMinutes && parsedMinutes > 0) {
//                   saveManualEntry();
//                 } else {
//                   startTimer();
//                 }
//               }}
//               disabled={!isTimerRunning && !parsedMinutes && !selectedTask}
//               className={`absolute right-2 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center rounded-full transition-all ${
//                 isTimerRunning 
//                   ? 'bg-red-100 hover:bg-red-200 text-red-600' 
//                   : parsedMinutes 
//                     ? 'bg-green-100 hover:bg-green-200 text-green-600'
//                     : 'bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50'
//               }`}
//             >
//               {isTimerRunning ? (
//                 <Square className="size-2 fill-current" />
//               ) : parsedMinutes ? (
//                 <Check className="size-2" />
//               ) : (
//                 <Play className="size-2 ml-0.5" />
//               )}
//             </button>
//           </div>
//             ) : (
                
//             <div className="px-2 flex justify-center items-center gap-1">
//              <Plus className="size-4" />
//               Add Time
//             </div>
//         )}
            
//             </FloatingPanelTrigger>
//         <FloatingPanelContent  className='-ml-[22rem] w-full  max-w-md overflow-visible'>
//       <div className="w-full bg-white dark:bg-[#111111] rounded-xl shadow-lg border-gray-200 ">
//         {/* Header */}
//         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#484848]">
//           <div className="flex items-center gap-2">
//             <Clock className="size-4 text-gray-500" />
//             <span className="text-sm font-medium text-[#B4B4B4]">Track Time</span>
//           </div>
//           <div className="text-xs text-gray-500">
//             {limitInfo && `${limitInfo.remaining} free entries left`}
//           </div>
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
//                 isTimerRunning 
//                   ? 'text-center text-2xl tracking-wider bg-purple-50 border-purple-200' 
//                   : 'text-gray-900 dark:text-white border-gray-200'
//               }`}
//             />
            
//             {/* Timer/Manual Toggle Button */}
//             <button type="button"
//               onClick={() => {
//                 if (isTimerRunning) {
//                   stopTimer();
//                 } else if (parsedMinutes && parsedMinutes > 0) {
//                   saveManualEntry();
//                 } else {
//                   startTimer();
//                 }
//               }}
//               disabled={!isTimerRunning && !parsedMinutes && !selectedTask}
//               className={`absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded-full transition-all ${
//                 isTimerRunning 
//                   ? 'bg-red-100 hover:bg-red-200 text-red-600' 
//                   : parsedMinutes 
//                     ? 'bg-green-100 hover:bg-green-200 text-green-600'
//                     : 'bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50'
//               }`}
//             >
//               {isTimerRunning ? (
//                 <Square className="size-3 fill-current" />
//               ) : parsedMinutes ? (
//                 <Check className="size-3" />
//               ) : (
//                 <Play className="size-3 fill-white" />
//               )}
//             </button>
//           </div>

//           {/* Parsed Time Preview */}
//           {!isTimerRunning && parsedMinutes && (
//             <div className="flex items-center justify-between px-3 py-2 bg-purple-50 dark:bg-[#484848] rounded-lg border dark:border-none border-purple-100">
//               <span className="text-sm text-purple-700">
//                 Will log: <strong>{formatDuration(parsedMinutes)}</strong>
//               </span>
//               {requiresApproval && (
//                 <span className="text-xs text-orange-600 flex items-center gap-1">
//                   <AlertTriangle className="size-3" />
//                   Needs approval
//                 </span>
//               )}
//             </div>
//           )}

//           {/* Task Selector - Using your existing component */}
//           <div>
//             <div className="block text-sm font-medium text-gray-700 mb-2">
//               Task <span className="text-gray-400">(Optional)</span>
//             </div>
//             <TaskSelector
//               selectedTaskId={selectedTask?.id || null}
//               onSelectTask={setSelectedTask}
//             />
//           </div>

//           {/* Date/Time - Only show for manual entry */}
//           {!isTimerRunning && parsedMinutes && (
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label htmlFor="time-entry-date" className="block text-xs font-medium text-gray-500 mb-1">Date</label>
//                 <input
//                   aria-label="time-entry-date"
//                   id="time-entry-date"
//                   type="date"
//                   value={date}
//                   onChange={(e) => setDate(e.target.value)}
//                   max={format(new Date(), 'yyyy-MM-dd')}
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="time-entry-time" className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
//                 <input
//                   aria-label="time-entry-time"
//                   id="time-entry-time"
//                   type="time"
//                   value={startTime}
//                   onChange={(e) => setStartTime(e.target.value)}
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Timer Running Info */}
//           {isTimerRunning && (
//             <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
//               <div className={`size-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-blue-500 animate-pulse'}`} />
//               <div className="flex-1">
//                 <p className="text-sm text-blue-900">
//                   {isPaused ? 'Timer paused' : 'Tracking...'}
//                 </p>
//                 <p className="text-xs text-blue-600">
//                   {timerStartTime ? `Started ${format(timerStartTime, 'h:mm a')}` : ''}
//                 </p>
//               </div>
//               {!isPaused && (
//                 <button type="button"
//                   onClick={handlePause}
//                   className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"
//                 >
//                   <Pause className="size-4 text-blue-600" />
//                 </button>
//               )}
//               {isPaused && (
//                 <button type="button"
//                   onClick={handleResume}
//                   className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"
//                 >
//                   <Play className="size-4 text-blue-600" />
//                 </button>
//               )}
//             </div>
//           )}
//            <button type="button"
//             onClick={() => setShowDescription(!showDescription)}
//             className="flex items-center gap-2 text-sm hover:dark:bg-[#222222] w-full py-1 px-2 rounded-sm text-gray-500 hover:text-gray-700 transition-colors"
//           >
//             <FileText className="size-4" />
//             {description ? 'Edit notes' : 'Add notes'}
//           </button>
          
//           {showDescription && (
//             <textarea
//             aria-label="time-entry-notes"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="What are you working on?"
//               rows={2}
//               className="w-full px-3 py-2 bg-transparent dark:bg-[#222222] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
//             />
//           )}
//           {/* Billable Toggle */}
//           <div className="">
           
//             <button type="button"
//               onClick={() => setIsBillable(!isBillable)}
//               className={`relative inline-flex h-5 w-[37.5px] items-center rounded-full transition-colors ${
//                 isBillable ? 'bg-green-500' : 'bg-gray-300'
//               }`}
//             >
//               <span
//                 className={` h-4 w-4 transform flex justify-center items-center rounded-full bg-white transition-transform ${
//                   isBillable ? 'translate-x-5' : 'translate-x-1'
//                 }`} 
//               ><DollarSign className='size-3 text-gray-400'/></span> 
//              </button>
//           </div>

//           {/* Description */}
          

//           {/* Save Button for Manual Entry */}
//           {!isTimerRunning && parsedMinutes && (
//             <button type="button"
//               onClick={saveManualEntry}
//               disabled={loading}
//               className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
//             >
//               {loading ? (
//                 <>
//                   <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   Saving&hellip;
//                 </>
//               ) : requiresApproval ? (
//                 <>
//                   <AlertTriangle className="size-4" />
//                   Submit for Approval
//                 </>
//               ) : (
//                 <>
//                   <Check className="size-4" />
//                   Save Entry
//                 </>
//               )}
//             </button>
//           )}
//         </div>

//         {/* Recent Entries */}
//         {recentEntries.length > 0 && (
//           <div className="border-t border-gray-100">
//             <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Recent Entries
//             </div>
//             <div className="divide-y divide-gray-100">
//               {recentEntries.slice(0, 3).map((entry) => (
//                 <div key={entry.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
//                   <div className="flex items-center gap-3">
//                     <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center">
//                       {entry.task ? (
//                         <div className={`size-2 rounded-full ${
//                           entry.task.status === 'Complete' ? 'bg-green-500' : 'bg-blue-500'
//                         }`} />
//                       ) : (
//                         <Clock className="size-4 text-gray-400" />
//                       )}
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-900">
//                         {entry.task?.title || 'No task'}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {format(parseISO(entry.date), 'MMM d, h:mm a')}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-medium text-gray-700">
//                       {formatDuration(entry.duration)}
//                     </span>
//                     {entry.isBillable && <DollarSign className="size-3 text-green-500" />}
//                     <button type="button" 
//                       onClick={() => {
//                         setSelectedTask(entry.task);
//                         startTimer();
//                       }}
//                       className="p-1 hover:bg-gray-200 rounded"
//                     >
//                       <Play className="size-3 text-gray-400" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
            
//             {/* Footer Links */}
//             <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-gray-100">
//               <button type="button" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
//                 <Clock className="w-3.5 h-3.5" />
//                 My Timesheet
//               </button>
//               <button type="button" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
//                 <FileText className="w-3.5 h-3.5" />
//                 Dashboard
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//  </FloatingPanelContent>
//       </FloatingPanelRoot>
//       {/* Inactivity Modal */}
//       <InactivityModal
//         isOpen={showInactivityModal}
//         onClose={() => handleInactivityAction('pause')}
//         onAction={handleInactivityAction}
//         inactiveMinutes={inactiveMinutes}
//       />
//     </>
//   );
// }

// components/time-tracking/TimeEntryWidget.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Check, 
  Clock, 
  DollarSign, 
  FileText, 
  AlertTriangle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TaskSelector } from './TaskSelector';
import { InactivityModal } from './InactivityModal';
import {
  FloatingPanelCloseButton,
  FloatingPanelContent,
  FloatingPanelFooter,
  FloatingPanelForm,
  FloatingPanelLabel,
  FloatingPanelRoot,
  FloatingPanelSubmitButton,
  FloatingPanelTextarea,
  FloatingPanelTrigger,
} from "@/components/ui/floatingPanel"
import { Plus } from '../animate-ui/icons/plus';
import { Input } from '../ui/input';


interface TimeEntryWidgetProps {
  onEntryComplete?: () => void;
}

// Timer state stored in localStorage for persistence
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

const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute
const STORAGE_KEY = 'timeEntryWidget_timer';

export function TimeEntryWidget({ onEntryComplete}: TimeEntryWidgetProps) {
  // Input parsing state
  const [inputValue, setInputValue] = useState('');
  const [parsedMinutes, setParsedMinutes] = useState<number | null>(null);
  
  // Timer state (synced with localStorage)
  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: PersistedTimerState = JSON.parse(saved);
        return state.isRunning ?? false;
      }
    } catch { /* ignore */ }
    return false;
  });
  const [isPaused, setIsPaused] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: PersistedTimerState = JSON.parse(saved);
        return state.isPaused ?? false;
      }
    } catch { /* ignore */ }
    return false;
  });
  const [timerSeconds, setTimerSeconds] = useState(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: PersistedTimerState = JSON.parse(saved);
        if (state.isRunning && state.startTime) {
          // If paused, restore the last known elapsed time
          if (state.isPaused) {
            return state.elapsedBeforePause || 0;
          }
          // If running, calculate based on start time
          const now = Date.now();
          const start = new Date(state.startTime).getTime();
          let elapsed = Math.floor((now - start) / 1000);
          return Math.max(0, elapsed);
        }
      }
    } catch { /* ignore */ }
    return 0;
  });
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: PersistedTimerState = JSON.parse(saved);
        return state.isRunning && state.startTime ? new Date(state.startTime) : null;
      }
    } catch { /* ignore */ }
    return null;
  });
  
  // Task selection
  const [selectedTask, setSelectedTask] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: PersistedTimerState = JSON.parse(saved);
        if (state.isRunning && state.taskId && state.taskTitle) {
          return { id: state.taskId, title: state.taskTitle, project: state.taskProject };
        }
      }
    } catch { /* ignore */ }
    return null;
  });
  
  // Entry details
  const [isBillable, setIsBillable] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: PersistedTimerState = JSON.parse(saved);
        return state.isRunning ? state.isBillable : true;
      }
    } catch { /* ignore */ }
    return true;
  });
  const [description, setDescription] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: PersistedTimerState = JSON.parse(saved);
        return state.isRunning ? (state.description || '') : '';
      }
    } catch { /* ignore */ }
    return '';
  });
  const [showDescription, setShowDescription] = useState(false);
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [startTimeInput, setStartTimeInput] = useState(() => format(new Date(), 'HH:mm')); // Renamed to avoid conflict with function
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ used: number; remaining: number } | null>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  
  // Inactivity state
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactiveMinutes, setInactiveMinutes] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(() => Date.now());
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Effects & Helpers ---

  useEffect(() => {
    if (!inputValue.trim() || isTimerRunning) {
      setParsedMinutes(null);
      return;
    }
    const minutes = parseTimeInput(inputValue);
    setParsedMinutes(minutes);
  }, [inputValue, isTimerRunning]);

  useEffect(() => {
    if (isTimerRunning && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        calculateElapsedTime();
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isTimerRunning, isPaused, timerStartTime]);

  useEffect(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) JSON.parse(saved); } 
    catch { localStorage.removeItem(STORAGE_KEY); }
    checkManualLimit();
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      const state: PersistedTimerState = {
        isRunning: isTimerRunning,
        isPaused: isPaused,
        startTime: timerStartTime?.toISOString() || null,
        pausedAt: isPaused ? new Date().toISOString() : null,
        elapsedBeforePause: timerSeconds,
        taskId: selectedTask?.id || null,
        taskTitle: selectedTask?.title || null,
        taskProject: selectedTask?.project || null,
        isBillable,
        description,
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

  // Tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isTimerRunning && timerStartTime) {
           const state: PersistedTimerState = {
            isRunning: true, isPaused, startTime: timerStartTime.toISOString(), pausedAt: null,
            elapsedBeforePause: timerSeconds, taskId: selectedTask?.id, taskTitle: selectedTask?.title,
            taskProject: selectedTask?.project, isBillable, description,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
           try {
             const state: PersistedTimerState = JSON.parse(saved);
             if (state.isRunning && state.startTime) {
               setTimerSeconds(state.isPaused ? state.elapsedBeforePause : Math.floor((Date.now() - new Date(state.startTime).getTime())/1000));
             }
           } catch(e) {}
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTimerRunning, isPaused, timerStartTime, timerSeconds, selectedTask, isBillable, description]);

  const calculateElapsedTime = useCallback(() => {
    if (!timerStartTime) return;
    const elapsed = Math.floor((Date.now() - timerStartTime.getTime()) / 1000);
    setTimerSeconds(Math.max(0, elapsed));
  }, [timerStartTime]);

  const parseTimeInput = (input: string): number | null => {
    const trimmed = input.trim().toLowerCase();
    const hMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:h|hour|hours)?$/);
    if (hMatch) return Math.round(parseFloat(hMatch[1]) * 60);
    const mMatch = trimmed.match(/^(\d+)\s*(?:m|min|minute|minutes)?$/);
    if (mMatch) return parseInt(mMatch[1]);
    const cMatch = trimmed.match(/^(?:(\d+)\s*(?:h|hour|hours)?\s*)?(?:(\d+)\s*(?:m|min|minute|minutes)?)?$/);
    if (cMatch) {
      const h = cMatch[1] ? parseInt(cMatch[1]) : 0;
      const m = cMatch[2] ? parseInt(cMatch[2]) : 0;
      if (h > 0 || m > 0) return h * 60 + m;
    }
    return null;
  };

  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h === 0 ? `${m}m` : (m === 0 ? `${h}h` : `${h}h ${m}m`);
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

  // --- Core Timer Logic ---

  const startTimer = async () => {
    if (!selectedTask) return;
    
    try {
      const res = await fetch('/api/time-tracking/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTask.id,
          isBillable,
          description,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // INDUSTRY LEVEL LOGIC: Conflict Resolution
        if (res.status === 400 && data.error === 'Timer already running') {
          const confirmReset = window.confirm(
            "A timer is already running on the server (possibly from a previous session or another tab).\n\n" +
            "Would you like to stop the existing timer and start a new one?"
          );

          if (confirmReset) {
            // 1. Stop the orphaned server timer
            await fetch('/api/time-tracking/timer/stop', { method: 'POST' });
            
            // 2. Clean up local state to ensure a fresh start
            resetTimer();
            
            // 3. Retry starting the timer immediately
            // We use a small timeout to allow the server state to propagate
            setTimeout(() => startTimer(), 200); 
          }
          return;
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
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isRunning: true, isPaused: false, startTime: serverStartTime.toISOString(), pausedAt: null, elapsedBeforePause: 0,
        taskId: selectedTask.id, taskTitle: selectedTask.title, taskProject: selectedTask.project, isBillable, description
      }));
      
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const handlePause = async () => {
    setIsPaused(true);
    const pausedAt = new Date().toISOString();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state: PersistedTimerState = JSON.parse(saved);
      state.isPaused = true; state.pausedAt = pausedAt; state.elapsedBeforePause = timerSeconds;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    try { await fetch('/api/time-tracking/timer/pause', { method: 'POST' }); } 
    catch (e) { console.error('Failed to pause server', e); }
  };

  const handleResume = async () => {
    const now = Date.now();
    const newStartTime = new Date(now - (timerSeconds * 1000));
    setTimerStartTime(newStartTime);
    setIsPaused(false);
    setLastActivityTime(now);
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state: PersistedTimerState = JSON.parse(saved);
      state.isPaused = false; state.pausedAt = null; state.startTime = newStartTime.toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    try { await fetch('/api/time-tracking/timer/resume', { method: 'POST' }); } 
    catch (e) { console.error('Failed to resume server', e); }
  };

  const stopTimer = async () => {
    try {
      const res = await fetch('/api/time-tracking/timer/stop', { method: 'POST' });
      if ((await res.json()).success) {
        resetTimer();
        onEntryComplete?.();
      }
    } catch (e) { console.error(e); }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsPaused(false);
    setTimerSeconds(0);
    setTimerStartTime(null);
    localStorage.removeItem(STORAGE_KEY);
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
      const res = await fetch('/api/time-tracking/manual/create', {
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

  return (
    <>
    <FloatingPanelRoot>
        <FloatingPanelTrigger className='!py-0 !px-0 !h-8 !w-fit'>
            {isTimerRunning ? (
             <div className="relative">
            <input
              aria-label="time-entry-modal"
              ref={inputRef}
              type="text"
              value={formatTimerDisplay(timerSeconds)}
              disabled
              className="py-1 !w-fit border rounded-lg text-sm font-medium focus:outline-none text-center  tracking-wider border-purple-200"
            />
            <button type="button" onClick={stopTimer} className="absolute right-2 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600">
              <Square className="size-2 fill-current" />
            </button>
          </div>
            ) : (
            <div className="px-2 flex justify-center items-center gap-1">
             <Plus className="size-4" /> Add Time
            </div>
        )}
        </FloatingPanelTrigger>
        <FloatingPanelContent className='-ml-[22rem] w-full max-w-md overflow-visible'>
      <div className="w-full bg-white dark:bg-[#111111] rounded-xl shadow-lg border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#484848]">
          <div className="flex items-center gap-2"><Clock className="size-4 text-gray-500" /><span className="text-sm font-medium text-[#B4B4B4]">Track Time</span></div>
          <div className="text-xs text-gray-500">{limitInfo && `${limitInfo.remaining} free entries left`}</div>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={isTimerRunning ? formatTimerDisplay(timerSeconds) : inputValue}
              onChange={(e) => !isTimerRunning && setInputValue(e.target.value)}
              placeholder={isTimerRunning ? '' : "Enter time (ex: 3h 20m) or start timer"}
              disabled={isTimerRunning}
              className={`w-full pl-2 pr-8 py-1.5 bg-gray-50 dark:bg-transparent border hover:dark:bg-[#222222] dark:border-[#484848] rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                isTimerRunning ? 'text-center text-2xl tracking-wider bg-purple-50 border-purple-200' : 'text-gray-900 dark:text-white border-gray-200'
              }`}
            />
            <button type="button"
              onClick={() => { if (isTimerRunning) stopTimer(); else if (parsedMinutes) saveManualEntry(); else startTimer(); }}
              disabled={!isTimerRunning && !parsedMinutes && !selectedTask}
              className={`absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded-full transition-all ${
                isTimerRunning ? 'bg-red-100 hover:bg-red-200 text-red-600' : parsedMinutes ? 'bg-green-100 hover:bg-green-200 text-green-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50'
              }`}
            >
              {isTimerRunning ? <Square className="size-3 fill-current" /> : parsedMinutes ? <Check className="size-3" /> : <Play className="size-3 fill-white" />}
            </button>
          </div>

          {!isTimerRunning && parsedMinutes && (
            <div className="flex items-center justify-between px-3 py-2 bg-purple-50 dark:bg-[#484848] rounded-lg border dark:border-none border-purple-100">
              <span className="text-sm text-purple-700">Will log: <strong>{formatDuration(parsedMinutes)}</strong></span>
              {requiresApproval && <span className="text-xs text-orange-600 flex items-center gap-1"><AlertTriangle className="size-3" /> Needs approval</span>}
            </div>
          )}

          <div><div className="block text-sm font-medium text-gray-700 mb-2">Task <span className="text-gray-400">(Optional)</span></div><TaskSelector selectedTaskId={selectedTask?.id || null} onSelectTask={setSelectedTask} /></div>

          {!isTimerRunning && parsedMinutes && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label><input type="time" value={startTimeInput} onChange={(e) => setStartTimeInput(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
            </div>
          )}

          {isTimerRunning && (
            <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className={`size-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-blue-500 animate-pulse'}`} />
              <div className="flex-1"><p className="text-sm text-blue-900">{isPaused ? 'Timer paused' : 'Tracking...'}</p><p className="text-xs text-blue-600">{timerStartTime ? `Started ${format(timerStartTime, 'h:mm a')}` : ''}</p></div>
              {!isPaused && <button type="button" onClick={handlePause} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"><Pause className="size-4 text-blue-600" /></button>}
              {isPaused && <button type="button" onClick={handleResume} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"><Play className="size-4 text-blue-600" /></button>}
            </div>
          )}
           <button type="button" onClick={() => setShowDescription(!showDescription)} className="flex items-center gap-2 text-sm hover:dark:bg-[#222222] w-full py-1 px-2 rounded-sm text-gray-500 hover:text-gray-700 transition-colors"><FileText className="size-4" />{description ? 'Edit notes' : 'Add notes'}</button>
          {showDescription && <textarea aria-label="time-entry-notes" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you working on?" rows={2} className="w-full px-3 py-2 bg-transparent dark:bg-[#222222] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />}
          <div className=""><button type="button" onClick={() => setIsBillable(!isBillable)} className={`relative inline-flex h-5 w-[37.5px] items-center rounded-full transition-colors ${isBillable ? 'bg-green-500' : 'bg-gray-300'}`}><span className={`h-4 w-4 transform flex justify-center items-center rounded-full bg-white transition-transform ${isBillable ? 'translate-x-5' : 'translate-x-1'}`} ><DollarSign className="size-3 text-gray-400"/>
          </span></button></div>

          {!isTimerRunning && parsedMinutes && (
            <button type="button" onClick={saveManualEntry} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
              {loading ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving&hellip;</> : requiresApproval ? <><AlertTriangle className="size-4" /> Submit for Approval</> : <><Check className="size-4" /> Save Entry</>}
            </button>
          )}
        </div>
      </div>
 </FloatingPanelContent>
      </FloatingPanelRoot>
      
      <InactivityModal isOpen={showInactivityModal} onClose={() => handleInactivityAction('pause')} onAction={handleInactivityAction} inactiveMinutes={inactiveMinutes} />
    </>
  );
}