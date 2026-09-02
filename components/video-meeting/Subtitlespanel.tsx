'use client';
import React, { useRef, useEffect } from 'react';
import { X, Globe, Radio, MessageSquareText } from 'lucide-react';

interface TranscriptSegment {
  id: string;
  original: string;
  translated: string;
  speaker: string;
  isFinal: boolean;
  originalLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

interface SubtitlesPanelProps {
  transcriptHistory: TranscriptSegment[];
  liveSubtitle: TranscriptSegment | null;
  isEnabled: boolean;
  onToggle: () => void;
  onClose: () => void;
  preferredLanguage: string;
  onChangeLanguage: (lang: string) => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export default function SubtitlesPanel({
  transcriptHistory,
  liveSubtitle,
  isEnabled,
  onToggle,
  onClose,
  preferredLanguage,
  onChangeLanguage,
}: SubtitlesPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptHistory.length, liveSubtitle]);

  return (
    <div className="flex flex-col h-full bg-[#111]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <MessageSquareText className="size-4 text-blue-400" />
          <h3 className="text-white font-semibold text-sm">Live Transcript</h3>
          {isEnabled && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              <Radio className="size-2.5 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <button type="button" onClick={onClose} className="p-1 text-neutral-500 hover:text-white">
          <X className="size-4" />
        </button>
      </div>

      {/* Language & Controls */}
      <div className="px-4 py-2 border-b border-[#333] space-y-2">
        <div className="flex items-center justify-between">
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-xs text-neutral-300 bg-neutral-800 hover:bg-neutral-700 px-2 py-1.5 rounded-lg transition-colors">
              <Globe className="size-3" />
              <span>{LANGUAGES.find(l => l.code === preferredLanguage)?.flag}</span>
              <span>{LANGUAGES.find(l => l.code === preferredLanguage)?.name}</span>
            </button>
            <div className="absolute top-full left-0 mt-1 w-40 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-10">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onChangeLanguage(lang.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-800 transition-colors ${
                    preferredLanguage === lang.code ? 'text-blue-400 bg-blue-500/10' : 'text-neutral-300'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              isEnabled
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {isEnabled ? 'Stop' : 'Start'} Transcription
          </button>
        </div>
      </div>

      {/* Live Subtitle Area */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#333] bg-neutral-900/50">
        {liveSubtitle ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                {liveSubtitle.speaker}
              </span>
              <span className="text-[9px] text-neutral-500">
                {liveSubtitle.originalLanguage} → {liveSubtitle.targetLanguage}
              </span>
            </div>
            <p className="text-sm text-white font-medium leading-relaxed">
              {liveSubtitle.translated}
            </p>
            {liveSubtitle.original !== liveSubtitle.translated && (
              <p className="text-xs text-neutral-500 italic">{liveSubtitle.original}</p>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-neutral-500">
              {isEnabled ? 'Waiting for speech...' : 'Transcription is off'}
            </p>
          </div>
        )}
      </div>

      {/* Transcript History */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {transcriptHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-2">
            <MessageSquareText className="size-8 opacity-20" />
            <p className="text-xs">No transcript yet</p>
          </div>
        ) : (
          transcriptHistory.map((seg, i) => (
            <div key={seg.id || i} className="group">
              <div className="flex items-center gap-2 mb-1">
                <div className="size-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400">
                  {(seg.speaker || '?')[0].toUpperCase()}
                </div>
                <span className="text-[10px] font-medium text-neutral-300">{seg.speaker}</span>
                <span className="text-[9px] text-neutral-600 ml-auto">
                  {new Date(seg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-neutral-200 leading-relaxed pl-7">
                {seg.translated}
              </p>
              {seg.original !== seg.translated && (
                <p className="text-xs text-neutral-500 italic pl-7 mt-0.5">{seg.original}</p>
              )}
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}