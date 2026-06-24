'use client';

import { useRecording } from 'contexts/RecordingContext';
import { cn } from '@/lib/utils';
import { Pause, Play, Square } from 'lucide-react';

export function RecordingBar() {
  const { isRecording, isPaused, duration, stopRecording, pauseRecording, resumeRecording } = useRecording();

  if (!isRecording) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-xl border border-zinc-700/50">
      <div className="flex items-center gap-2">
        <div className={cn(
          "size-2.5 rounded-full",
          isPaused ? "bg-yellow-400" : "bg-red-500 animate-pulse"
        )} />
        <span className="text-sm font-semibold tabular-nums tracking-wide">
          {formatTime(duration)}
        </span>
      </div>

      <div className="h-4 w-px bg-zinc-600" />

      <button
        onClick={isPaused ? resumeRecording : pauseRecording}
        className="hover:bg-zinc-700 rounded-md p-1.5 transition-colors"
        title={isPaused ? 'Resume (Ctrl+Alt+P)' : 'Pause (Ctrl+Alt+P)'}
      >
        {isPaused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
      </button>

      <button
        onClick={stopRecording}
        className="hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-md p-1.5 transition-colors"
        title="Stop recording (Ctrl+Alt+S)"
      >
        <Square className="size-4 fill-current" />
      </button>

      <span className="text-xs text-zinc-400 hidden sm:inline font-medium">
        {isPaused ? 'Paused' : 'Recording...'}
      </span>
    </div>
  );
}