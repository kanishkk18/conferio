// components/meeting/LiveSubtitles.tsx
import { useEffect, useState, useRef } from 'react';
import { useSocket } from 'hooks/useSocket';

interface LiveSubtitleData {
  original: string;
  translated: string;
  speaker: string;
  isFinal: boolean;
  originalLanguage: string;
}

export function LiveSubtitles({ meetingId }: { meetingId: string }) {
  const [subtitle, setSubtitle] = useState<LiveSubtitleData | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const socket = useSocket();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!socket || !isEnabled) return;

    socket.emit('join-meeting', { meetingId });
    socket.emit('start-transcription', { meetingId });

    socket.on('transcription', (data: LiveSubtitleData) => {
      setSubtitle(data);
      
      // Auto-clear after delay
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setSubtitle(null);
      }, data.isFinal ? 8000 : 3000);
    });

    return () => {
      socket.off('transcription');
      socket.emit('stop-transcription', { meetingId });
      clearTimeout(timeoutRef.current);
    };
  }, [socket, meetingId, isEnabled]);

  if (!isEnabled) {
    return (
      <button
        onClick={() => setIsEnabled(true)}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 
          bg-blue-600/90 hover:bg-blue-600 text-white rounded-full text-sm 
          backdrop-blur-sm transition-colors z-50"
      >
        🌐 Enable Live Subtitles
      </button>
    );
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      {subtitle ? (
        <div className="bg-black/80 backdrop-blur-md text-white px-6 py-4 rounded-2xl 
          shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-blue-400">
              {subtitle.speaker}
            </span>
            <span className="text-[10px] text-gray-500">
              {subtitle.originalLanguage} → Your Language
            </span>
          </div>
          <p className="text-lg font-medium leading-relaxed">
            {subtitle.translated}
          </p>
          <p className="text-xs text-gray-500 mt-1.5 italic">
            {subtitle.original}
          </p>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={() => setIsEnabled(false)}
            className="px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white/70 
              hover:text-white rounded-full text-xs backdrop-blur-sm transition-colors"
          >
            🌐 Subtitles On
          </button>
        </div>
      )}
    </div>
  );
}