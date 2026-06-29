// components/time-tracking/TimeEntryModal.tsx
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
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
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

// ── Retry helper ─────────────────────────────────────────────────────────────
// Retries a fetch up to `maxAttempts` times with exponential backoff.
// Returns the Response on success, throws on final failure.
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
      // Treat server errors (5xx) as retryable; 4xx are definitive
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        return res;
      }
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
// ─────────────────────────────────────────────────────────────────────────────

// Read initial state from localStorage safely
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

export function TimeEntryWidget({ onEntryComplete }: TimeEntryWidgetProps) {
  const persisted = readPersistedState();

  // Input parsing state
  const [inputValue, setInputValue] = useState('');
  const [parsedMinutes, setParsedMinutes] = useState<number | null>(null);

  // Timer state (synced with localStorage)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(
    persisted?.isRunning ?? false
  );
  const [isPaused, setIsPaused] = useState<boolean>(persisted?.isPaused ?? false);
  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    if (!persisted?.isRunning || !persisted.startTime) return 0;
    if (persisted.isPaused) return persisted.elapsedBeforePause || 0;
    return Math.max(
      0,
      Math.floor((Date.now() - new Date(persisted.startTime).getTime()) / 1000)
    );
  });
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(
    persisted?.isRunning && persisted.startTime ? new Date(persisted.startTime) : null
  );

  // Task selection
  const [selectedTask, setSelectedTask] = useState<any>(
    persisted?.isRunning && persisted.taskId
      ? { id: persisted.taskId, title: persisted.taskTitle, project: persisted.taskProject }
      : null
  );

  // Entry details
  const [isBillable, setIsBillable] = useState<boolean>(
    persisted?.isRunning ? persisted.isBillable : true
  );
  const [description, setDescription] = useState<string>(
    persisted?.isRunning ? (persisted.description || '') : ''
  );
  const [showDescription, setShowDescription] = useState(false);
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [startTimeInput, setStartTimeInput] = useState(() => format(new Date(), 'HH:mm'));

  // UI state
  const [loading, setLoading] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ used: number; remaining: number } | null>(null);

  // Recovery state — shown when stop fails even after retries + reset
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  // Inactivity
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactiveMinutes, setInactiveMinutes] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(() => Date.now());

  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!inputValue.trim() || isTimerRunning) { setParsedMinutes(null); return; }
    setParsedMinutes(parseTimeInput(inputValue));
  }, [inputValue, isTimerRunning]);

  // Tick interval
  useEffect(() => {
    if (isTimerRunning && !isPaused) {
      timerIntervalRef.current = setInterval(calculateElapsedTime, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isTimerRunning, isPaused, timerStartTime]);

  // On mount: validate localStorage vs server
  useEffect(() => {
    checkManualLimit();
    // If local state says running, verify with server so we don't show a phantom timer
    if (persisted?.isRunning) {
      verifyServerTimerState();
    }
  }, []);

  // Persist to localStorage whenever relevant state changes
  useEffect(() => {
    if (isTimerRunning) {
      const state: PersistedTimerState = {
        isRunning: true,
        isPaused,
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

  // ── Helpers ───────────────────────────────────────────────────────────────

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

  // On page load, if localStorage says running, check with server.
  // If server says nothing is running, clear local state (phantom timer).
  const verifyServerTimerState = async () => {
    try {
      const res = await fetch('/api/time-tracking/timer/status');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.isRunning) {
        // Server has no running timer — our local state is stale
        resetTimerLocal();
      }
    } catch {
      // Network error — leave local state as-is, user can manually reset
    }
  };

  // ── Core timer logic ──────────────────────────────────────────────────────

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
          // Server has a stuck timer — silently reset it and retry once
          await fetchWithRetry('/api/time-tracking/timer/reset', { method: 'POST' });
          return startTimer(); // one recursive retry
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
    const elapsedBeforePause = timerSeconds;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: PersistedTimerState = JSON.parse(saved);
        state.isPaused = true;
        state.pausedAt = new Date().toISOString();
        state.elapsedBeforePause = elapsedBeforePause;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { /* ignore */ }
    }
    try {
      await fetchWithRetry('/api/time-tracking/timer/pause', { method: 'POST' });
    } catch (e) {
      console.error('Failed to pause server', e);
    }
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
    try {
      await fetchWithRetry('/api/time-tracking/timer/resume', { method: 'POST' });
    } catch (e) {
      console.error('Failed to resume server', e);
    }
  };

  // Stop with retry → nuclear reset fallback
  const stopTimer = async () => {
    setLoading(true);
    setRecoveryError(null);
    try {
      const res = await fetchWithRetry('/api/time-tracking/timer/stop', { method: 'POST' }, 3);

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          resetTimerLocal();
          onEntryComplete?.();
          return;
        }
      }

      // Stop endpoint returned an error (e.g. 404 no running timer) — 
      // still clear local state so user isn't stuck
      if (res.status === 404) {
        resetTimerLocal();
        onEntryComplete?.();
        return;
      }

      throw new Error(`Stop returned ${res.status}`);
    } catch (err) {
      console.error('Stop failed after retries, attempting nuclear reset:', err);
      await nuclearReset();
    } finally {
      setLoading(false);
    }
  };

  // Last-resort: call /reset which kills all running entries for this user
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
        body: JSON.stringify({
          taskId: selectedTask?.id,
          date,
          startTime: startTimeInput,
          duration: parsedMinutes,
          isBillable,
          description,
        }),
      });
      if (res.ok && (await res.json()).success) {
        setInputValue('');
        setDescription('');
        setParsedMinutes(null);
        checkManualLimit();
        onEntryComplete?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
                className="py-1 !w-fit border rounded-lg text-sm font-medium focus:outline-none text-center tracking-wider border-purple-200"
              />
              <button
                type="button"
                onClick={stopTimer}
                disabled={loading || isRecovering}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 disabled:opacity-50"
              >
                {loading || isRecovering
                  ? <div className="size-2 border border-red-400 border-t-transparent rounded-full animate-spin" />
                  : <Square className="size-2 fill-current" />
                }
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
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-gray-500" />
                <span className="text-sm font-medium text-[#B4B4B4]">Track Time</span>
              </div>
              <div className="text-xs text-gray-500">
                {limitInfo && `${limitInfo.remaining} free entries left`}
              </div>
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
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTimeInput}
                      onChange={(e) => setStartTimeInput(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              {isTimerRunning && (
                <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <div className={`size-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-blue-500 animate-pulse'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900">{isPaused ? 'Timer paused' : 'Tracking…'}</p>
                    <p className="text-xs text-blue-600">
                      {timerStartTime ? `Started ${format(timerStartTime, 'h:mm a')}` : ''}
                    </p>
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

              <div>
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
        </FloatingPanelContent>
      </FloatingPanelRoot>

      <InactivityModal
        isOpen={showInactivityModal}
        onClose={() => handleInactivityAction('pause')}
        onAction={handleInactivityAction}
        inactiveMinutes={inactiveMinutes}
      />
    </>
  );
}

// // components/time-tracking/TimeEntryModal.tsx
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

// const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute
// const STORAGE_KEY = 'timeEntryWidget_timer';

// export function TimeEntryWidget({ onEntryComplete}: TimeEntryWidgetProps) {
//   // Input parsing state
//   const [inputValue, setInputValue] = useState('');
//   const [parsedMinutes, setParsedMinutes] = useState<number | null>(null);
  
//   // Timer state (synced with localStorage)
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
//           // If paused, restore the last known elapsed time
//           if (state.isPaused) {
//             return state.elapsedBeforePause || 0;
//           }
//           // If running, calculate based on start time
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
//   const [startTimeInput, setStartTimeInput] = useState(() => format(new Date(), 'HH:mm')); // Renamed to avoid conflict with function
  
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

//   // --- Core Timer Logic ---

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
//         // INDUSTRY LEVEL LOGIC: Conflict Resolution
//         if (res.status === 400 && data.error === 'Timer already running') {
//           const confirmReset = window.confirm(
//             "A timer is already running on the server (possibly from a previous session or another tab).\n\n" +
//             "Would you like to stop the existing timer and start a new one?"
//           );

//           if (confirmReset) {
//             // 1. Stop the orphaned server timer
//             await fetch('/api/time-tracking/timer/stop', { method: 'POST' });
            
//             // 2. Clean up local state to ensure a fresh start
//             resetTimer();
            
//             // 3. Retry starting the timer immediately
//             // We use a small timeout to allow the server state to propagate
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
//               value={formatTimerDisplay(timerSeconds)}
//               disabled
//               className="py-1 !w-fit border rounded-lg text-sm font-medium focus:outline-none text-center  tracking-wider border-purple-200"
//             />
//             <button type="button" onClick={stopTimer} className="absolute right-2 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600">
//               <Square className="size-2 fill-current" />
//             </button>
//           </div>
//             ) : (
//             <div className="px-2 flex justify-center items-center gap-1">
//              <Plus className="size-4" /> Add Time
//             </div>
//         )}
//         </FloatingPanelTrigger>
//         <FloatingPanelContent className='-ml-[22rem] w-full max-w-md overflow-visible'>
//       <div className="w-full bg-white dark:bg-[#111111] rounded-xl shadow-lg border-gray-200">
//         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#484848]">
//           <div className="flex items-center gap-2"><Clock className="size-4 text-gray-500" /><span className="text-sm font-medium text-[#B4B4B4]">Track Time</span></div>
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

//           <div><div className="block text-sm font-medium text-gray-700 mb-2">Task <span className="text-gray-400">(Optional)</span></div><TaskSelector selectedTaskId={selectedTask?.id || null} onSelectTask={setSelectedTask} /></div>

//           {!isTimerRunning && parsedMinutes && (
//             <div className="grid grid-cols-2 gap-3">
//               <div><label className="block text-xs font-medium text-gray-500 mb-1">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
//               <div><label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label><input type="time" value={startTimeInput} onChange={(e) => setStartTimeInput(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
//             </div>
//           )}

//           {isTimerRunning && (
//             <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
//               <div className={`size-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-blue-500 animate-pulse'}`} />
//               <div className="flex-1"><p className="text-sm text-blue-900">{isPaused ? 'Timer paused' : 'Tracking...'}</p><p className="text-xs text-blue-600">{timerStartTime ? `Started ${format(timerStartTime, 'h:mm a')}` : ''}</p></div>
//               {!isPaused && <button type="button" onClick={handlePause} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"><Pause className="size-4 text-blue-600" /></button>}
//               {isPaused && <button type="button" onClick={handleResume} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"><Play className="size-4 text-blue-600" /></button>}
//             </div>
//           )}
//            <button type="button" onClick={() => setShowDescription(!showDescription)} className="flex items-center gap-2 text-sm hover:dark:bg-[#222222] w-full py-1 px-2 rounded-sm text-gray-500 hover:text-gray-700 transition-colors"><FileText className="size-4" />{description ? 'Edit notes' : 'Add notes'}</button>
//           {showDescription && <textarea aria-label="time-entry-notes" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you working on?" rows={2} className="w-full px-3 py-2 bg-transparent dark:bg-[#222222] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />}
//           <div className=""><button type="button" onClick={() => setIsBillable(!isBillable)} className={`relative inline-flex h-5 w-[37.5px] items-center rounded-full transition-colors ${isBillable ? 'bg-green-500' : 'bg-gray-300'}`}><span className={`h-4 w-4 transform flex justify-center items-center rounded-full bg-white transition-transform ${isBillable ? 'translate-x-5' : 'translate-x-1'}`} ><DollarSign className="size-3 text-gray-400"/>
//           </span></button></div>

//           {!isTimerRunning && parsedMinutes && (
//             <button type="button" onClick={saveManualEntry} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
//               {loading ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving&hellip;</> : requiresApproval ? <><AlertTriangle className="size-4" /> Submit for Approval</> : <><Check className="size-4" /> Save Entry</>}
//             </button>
//           )}
//         </div>
//       </div>
//  </FloatingPanelContent>
//       </FloatingPanelRoot>
      
//       <InactivityModal isOpen={showInactivityModal} onClose={() => handleInactivityAction('pause')} onAction={handleInactivityAction} inactiveMinutes={inactiveMinutes} />
//     </>
//   );
// }