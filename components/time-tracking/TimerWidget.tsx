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
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { TaskSelector } from './TaskSelector';
import { InactivityModal } from './InactivityModal';
import { Input } from '../ui/input';

interface TimeEntryPopoverProps {
  isOpen: boolean;
  onClose: () => void;
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

const INACTIVITY_TIMEOUT = 1 * 60 * 1000;
const STORAGE_KEY = 'timeEntryWidget_timer';

// --- NEW: Hook to get live timer state anywhere ---
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
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          setTimerState({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });
          return;
        }
        const state: PersistedTimerState = JSON.parse(saved);
        if (!state.isRunning || !state.startTime) {
          setTimerState({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });
          return;
        }
        
        let seconds = 0;
        if (state.isPaused) {
          seconds = state.elapsedBeforePause || 0;
        } else {
          const now = Date.now();
          const start = new Date(state.startTime).getTime();
          seconds = Math.max(0, Math.floor((now - start) / 1000));
        }
        
        setTimerState({
          isRunning: true,
          isPaused: state.isPaused,
          seconds,
          taskTitle: state.taskTitle,
        });
      } catch {
        setTimerState({ isRunning: false, isPaused: false, seconds: 0, taskTitle: null });
      }
    };

    calculateState();
    const interval = setInterval(calculateState, 1000);
    
    // Also recalculate when tab becomes visible
    const handleVisibility = () => { if (!document.hidden) calculateState(); };
    document.addEventListener('visibilitychange', handleVisibility);
    
    // Listen for storage changes from other tabs
    const handleStorage = () => calculateState();
    window.addEventListener('storage', handleStorage);

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
// --- END HOOK ---

export function TimeEntryPopover({ isOpen, onClose, onEntryComplete }: TimeEntryPopoverProps) {
  const [inputValue, setInputValue] = useState('');
  const [parsedMinutes, setParsedMinutes] = useState<number | null>(null);
  
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
          if (state.isPaused) {
            return state.elapsedBeforePause || 0;
          }
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
  const [startTimeInput, setStartTimeInput] = useState(() => format(new Date(), 'HH:mm'));
  
  const [loading, setLoading] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ used: number; remaining: number } | null>(null);
  
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactiveMinutes, setInactiveMinutes] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(() => Date.now());
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  // Sync with localStorage when popover opens (in case timer was started elsewhere)
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
          setTimerSeconds(state.isPaused ? (state.elapsedBeforePause || 0) : Math.floor((Date.now() - new Date(state.startTime).getTime()) / 1000));
          if (state.taskId && state.taskTitle) {
            setSelectedTask({ id: state.taskId, title: state.taskTitle, project: state.taskProject });
          }
          setIsBillable(state.isBillable);
          setDescription(state.description || '');
        }
      }
    } catch { /* ignore */ }
  }, [isOpen]);

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
        if (res.status === 400 && data.error === 'Timer already running') {
          const confirmReset = window.confirm(
            "A timer is already running on the server (possibly from a previous session or another tab).\n\n" +
            "Would you like to stop the existing timer and start a new one?"
          );

          if (confirmReset) {
            await fetch('/api/time-tracking/timer/stop', { method: 'POST' });
            resetTimer();
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

  if (!isOpen) return null;

  return (
    <>
      <div 
        ref={popoverRef}
        className="fixed z-50 w-full max-w-md bg-white dark:bg-[#111111] rounded-xl shadow-2xl border border-gray-200 dark:border-[#484848] overflow-visible"
        style={{ top: '60px', right: '20px' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#484848]">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-gray-500" />
            <span className="text-sm font-medium text-[#B4B4B4]">Track Time</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#222222] rounded-md transition-colors"
          >
            <Square className="size-3 rotate-45 text-gray-400" />
          </button>
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

          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Task <span className="text-gray-400">(Optional)</span>
            </div>
            <TaskSelector selectedTaskId={selectedTask?.id || null} onSelectTask={setSelectedTask} />
          </div>

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

          {isTimerRunning && (
            <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className={`size-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-blue-500 animate-pulse'}`} />
              <div className="flex-1">
                <p className="text-sm text-blue-900">{isPaused ? 'Timer paused' : 'Tracking...'}</p>
                <p className="text-xs text-blue-600">{timerStartTime ? `Started ${format(timerStartTime, 'h:mm a')}` : ''}</p>
              </div>
              {!isPaused && <button type="button" onClick={handlePause} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"><Pause className="size-4 text-blue-600" /></button>}
              {isPaused && <button type="button" onClick={handleResume} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"><Play className="size-4 text-blue-600" /></button>}
            </div>
          )}
          
          <button type="button" onClick={() => setShowDescription(!showDescription)} className="flex items-center gap-2 text-sm hover:dark:bg-[#222222] w-full py-1 px-2 rounded-sm text-gray-500 hover:text-gray-700 transition-colors">
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
          
          <div className="">
            <button 
              type="button" 
              onClick={() => setIsBillable(!isBillable)} 
              className={`relative inline-flex h-5 w-[37.5px] items-center rounded-full transition-colors ${isBillable ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`h-4 w-4 transform flex justify-center items-center rounded-full bg-white transition-transform ${isBillable ? 'translate-x-5' : 'translate-x-1'}`}>
                <DollarSign className="size-3 text-gray-400"/>
              </span>
            </button>
          </div>

          {!isTimerRunning && parsedMinutes && (
            <button type="button" onClick={saveManualEntry} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
              {loading ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving&hellip;</> : requiresApproval ? <><AlertTriangle className="size-4" /> Submit for Approval</> : <><Check className="size-4" /> Save Entry</>}
            </button>
          )}
        </div>
      </div>
      
      <InactivityModal isOpen={showInactivityModal} onClose={() => handleInactivityAction('pause')} onAction={handleInactivityAction} inactiveMinutes={inactiveMinutes} />
    </>
  );
}