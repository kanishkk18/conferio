// hooks/useTimer.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { TimerState } from 'types/timeTracking';

const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes
// const INACTIVITY_THRESHOLD = 1 * 60 * 1000; // 1 minute
const ACTIVITY_CHECK_INTERVAL = 5000; // Check every 5 seconds

export function useTimer() {
  const { data: session } = useSession();
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    startTime: null,
    elapsedSeconds: 0,
    taskId: null,
    entryId: null,
    isBillable: true,
    description: '',
  });
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactivityData, setInactivityData] = useState<{ minutes: number; entryId: string } | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Fetch initial timer status
  useEffect(() => {
    if (session?.user) {
      fetchTimerStatus();
    }
  }, [session]);

  const fetchTimerStatus = async () => {
    try {
      const res = await fetch('/api/time-tracking/timer/status');
      const data = await res.json();
      
      if (data.isRunning) {
        setTimerState({
          isRunning: true,
          isPaused: data.isPaused,
          startTime: new Date(data.startTime),
          elapsedSeconds: data.elapsedSeconds,
          taskId: data.taskId,
          entryId: data.entryId,
          isBillable: data.isBillable,
          description: data.description || '',
        });

        if (data.shouldAutoPause) {
          setInactivityData({ minutes: data.inactiveMinutes, entryId: data.entryId });
          setShowInactivityModal(true);
        } else if (!data.isPaused) {
          startInterval();
        }
      }
    } catch (error) {
      console.error('Failed to fetch timer status:', error);
    }
  };

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setTimerState(prev => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Activity tracking
//   useEffect(() => {
//     if (!timerState.isRunning || timerState.isPaused) return;

//     const handleActivity = () => {
//       lastActivityRef.current = new Date();
//       pingActivity();
//     };

//     const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
//     events.forEach(event => {
//       window.addEventListener(event, handleActivity);
//     });

//     // Activity check interval
//     activityIntervalRef.current = setInterval(() => {
//       const inactiveTime = Date.now() - lastActivityRef.current.getTime();
      
//       if (inactiveTime >= INACTIVITY_THRESHOLD && !timerState.isPaused) {
//         handleAutoPause();
//       }
//     }, ACTIVITY_CHECK_INTERVAL);

//     return () => {
//       events.forEach(event => {
//         window.removeEventListener(event, handleActivity);
//       });
//       if (activityIntervalRef.current) {
//         clearInterval(activityIntervalRef.current);
//       }
//     };
//   }, [timerState.isRunning, timerState.isPaused, timerState.entryId]);

// hooks/useTimer.ts - Update this useEffect

// Activity tracking
useEffect(() => {
    // ADD THIS CHECK - don't run if timer is not running
    if (!timerState.isRunning || timerState.isPaused) {
      // Clean up intervals if timer stops
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
        activityIntervalRef.current = null;
      }
      return;
    }
  
    const handleActivity = () => {
      lastActivityRef.current = new Date();
      pingActivity();
    };
  
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
  
    // Activity check interval
    activityIntervalRef.current = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current.getTime();
      
      if (inactiveTime >= INACTIVITY_THRESHOLD && !timerState.isPaused) {
        handleAutoPause();
      }
    }, ACTIVITY_CHECK_INTERVAL);
  
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.isPaused, timerState.entryId]);

  const pingActivity = async () => {
    try {
      await fetch('/api/time-tracking/timer/activity', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Activity ping failed:', error);
    }
  };

  const handleAutoPause = async () => {
    stopInterval();
    const inactiveMinutes = Math.floor((Date.now() - lastActivityRef.current.getTime()) / 60000);
    
    setInactivityData({ minutes: inactiveMinutes, entryId: timerState.entryId! });
    setShowInactivityModal(true);
    
    // Auto-pause on server
    try {
      await fetch('/api/time-tracking/timer/pause', {
        method: 'POST',
      });
      setTimerState(prev => ({ ...prev, isPaused: true }));
    } catch (error) {
      console.error('Auto-pause failed:', error);
    }
  };

  const startTimer = async (taskId?: string, isBillable: boolean = true, description?: string) => {
    try {
      const res = await fetch('/api/time-tracking/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, isBillable, description }),
      });

      if (!res.ok) throw new Error('Failed to start timer');

      const data = await res.json();
      
      setTimerState({
        isRunning: true,
        isPaused: false,
        startTime: new Date(),
        elapsedSeconds: 0,
        taskId: taskId || null,
        entryId: data.entry.id,
        isBillable,
        description: description || '',
      });

      startInterval();
      lastActivityRef.current = new Date();
      
      return data.entry;
    } catch (error) {
      console.error('Start timer error:', error);
      throw error;
    }
  };

  const stopTimer = async () => {
    try {
      const res = await fetch('/api/time-tracking/timer/stop', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to stop timer');

      const data = await res.json();
      
      stopInterval();
      setTimerState({
        isRunning: false,
        isPaused: false,
        startTime: null,
        elapsedSeconds: 0,
        taskId: null,
        entryId: null,
        isBillable: true,
        description: '',
      });

      return data.entry;
    } catch (error) {
      console.error('Stop timer error:', error);
      throw error;
    }
  };

  const pauseTimer = async () => {
    try {
      const res = await fetch('/api/time-tracking/timer/pause', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to pause timer');

      stopInterval();
      setTimerState(prev => ({ ...prev, isPaused: true }));
    } catch (error) {
      console.error('Pause timer error:', error);
      throw error;
    }
  };

  const resumeTimer = async () => {
    try {
      const res = await fetch('/api/time-tracking/timer/resume', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to resume timer');

      setTimerState(prev => ({ ...prev, isPaused: false }));
      startInterval();
      lastActivityRef.current = new Date();
    } catch (error) {
      console.error('Resume timer error:', error);
      throw error;
    }
  };

  const handleInactivityAction = async (action: 'continue' | 'stop' | 'pause') => {
    setShowInactivityModal(false);
    
    if (action === 'stop') {
      await stopTimer();
    } else if (action === 'pause') {
      // Already paused by auto-pause
    } else if (action === 'continue') {
      await resumeTimer();
    }
    
    setInactivityData(null);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timerState,
    formattedTime: formatTime(timerState.elapsedSeconds),
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    showInactivityModal,
    inactivityData,
    handleInactivityAction,
  };
}
