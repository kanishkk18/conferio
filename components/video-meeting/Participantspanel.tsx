'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Users, Clock, Check, XCircle, Mic, MicOff, Pin,
  UserX, Crown, Shield, ChevronDown, Search, Volume2,
} from 'lucide-react';
import { Participant, LocalParticipant } from 'livekit-client';

interface WaitingEntry {
  id: string;
  guestName?: string;
  userId?: string;
  requestedAt: string;
  user?: { name: string; image?: string };
}

interface ParticipantInfo {
  p: Participant;
  isLocal: boolean;
}

interface Props {
  participants: ParticipantInfo[];
  waitingList: WaitingEntry[];
  isHost: boolean;
  dominantSpeakerId?: string;
  onClose: () => void;
  onApprove: (waitingId: string, approve: boolean) => void;
  onKick: (identity: string) => void;
  onMute: (identity: string) => void;
  onSpotlight: (identity: string) => void;
}

function getParticipantName(p: Participant): string {
  try {
    const meta = p.metadata ? JSON.parse(p.metadata) : {};
    return meta.name || p.name || p.identity || 'Guest';
  } catch {
    return p.name || p.identity || 'Guest';
  }
}

function getParticipantImage(p: Participant): string | null {
  try {
    const meta = p.metadata ? JSON.parse(p.metadata) : {};
    return meta.image || null;
  } catch {
    return null;
  }
}

function isMicEnabled(p: Participant): boolean {
  try {
    const pubs: any[] = (p as any).trackPublications
      ? Array.from((p as any).trackPublications.values())
      : [
        ...Array.from(((p as any).audioTracks || new Map()).values()),
        ...Array.from(((p as any).videoTracks || new Map()).values()),
      ];
    const mic = pubs.find((pub: any) => pub.source === 'microphone');
    return !!(mic?.track && !mic.isMuted);
  } catch {
    return false;
  }
}

export default function ParticipantsPanel({
  participants,
  waitingList,
  isHost,
  dominantSpeakerId,
  onClose,
  onApprove,
  onKick,
  onMute,
  onSpotlight,
}: Props) {
  const [search, setSearch] = useState('');
  const [expandWaiting, setExpandWaiting] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = participants.filter(({ p }) =>
    getParticipantName(p).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Users className="size-4text-blue-400" />
          <span className="text-white font-semibold text-sm">Participants</span>
          <span className="text-neutral-500 text-xs bg-neutral-800 px-1.5 py-0.5 rounded-full">
            {participants.length}
          </span>
        </div>
        <button type="button"
          onClick={onClose}
          className="p-1 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-neutral-800 /60 flex-shrink-0">
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
          <input
          aria-label='participant-search'
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participants…"
            className="flex-1 bg-transparent text-white text-sm placeholder-neutral-600 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── Waiting Room (host only) ── */}
        {isHost && waitingList.length > 0 && (
          <div className="border-b border-neutral-800">
            <button type="button"
              onClick={() => setExpandWaiting((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-900/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">
                  Waiting Room
                </span>
                <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {waitingList.length}
                </span>
              </div>
              <motion.div animate={{ rotate: expandWaiting ? 0 : -90 }}>
                <ChevronDown className="size-4text-neutral-500" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandWaiting && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {waitingList.map((entry) => {
                    const name =
                      entry.user?.name || entry.guestName || 'Guest';
                    const image = entry.user?.image;
                    const initials = name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-900/40 transition-colors"
                      >
                        <div className="size-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-xs font-bold">
                              {initials}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {name}
                          </p>
                          <p className="text-neutral-500 text-xs">
                            Waiting to join
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button type="button"
                            onClick={() => onApprove(entry.id, true)}
                            className="p-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/40 transition-colors"
                            title="Admit"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button type="button"
                            onClick={() => onApprove(entry.id, false)}
                            className="p-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/40 transition-colors"
                            title="Deny"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {/* Bulk actions */}
                  <div className="flex gap-2 px-4 py-2 border-t border-neutral-800/60">
                    <button type="button"
                      onClick={() =>
                        waitingList.forEach((e) => onApprove(e.id, true))
                      }
                      className="flex-1 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-600/10 hover:bg-emerald-600/20 rounded-lg border border-emerald-500/20 transition-colors"
                    >
                      Admit All
                    </button>
                    <button type="button"
                      onClick={() =>
                        waitingList.forEach((e) => onApprove(e.id, false))
                      }
                      className="flex-1 py-1.5 text-xs font-medium text-red-400 bg-red-600/10 hover:bg-red-600/20 rounded-lg border border-red-500/20 transition-colors"
                    >
                      Deny All
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── In-Meeting Participants ── */}
        <div className="  p-2   ">
          <p className="text-neutral-600 text-[10px] font-semibold uppercase tracking-wider px-2 mb-2">
            In Meeting ({filtered.length})
          </p>

          {filtered.map(({ p, isLocal }) => {
            const name = getParticipantName(p);
            const image = getParticipantImage(p);
            const micOn = isMicEnabled(p);
            const isSpeaking = dominantSpeakerId === p.identity;
            const initials = name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={p.identity}
                onMouseEnter={() => setHoveredId(p.identity)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex items-center gap-3   p-2    rounded-xl transition-colors ${isSpeaking
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : 'hover:bg-neutral-900'
                  }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`size-9 rounded-full overflow-hidden flex items-center justify-center ${image
                      ? ''
                      : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                      } ${isSpeaking ? 'ring-2 ring-emerald-500' : ''}`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {initials}
                      </span>
                    )}
                  </div>
                  {isSpeaking && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-950 flex items-center justify-center">
                      <Volume2 className="size-2 text-white" />
                    </div>
                  )}
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-sm font-medium truncate">
                      {isLocal ? 'You' : name}
                    </span>
                    {isLocal && (
                      <Crown className="size-3 text-yellow-400 flex-shrink-0" />
                    )}
                    {isHost && !isLocal && (
                      <Shield className="size-3 text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-neutral-600 text-xs truncate">
                    {isSpeaking ? (
                      <span className="text-emerald-400">Speaking…</span>
                    ) : isLocal ? (
                      'You'
                    ) : (
                      'Participant'
                    )}
                  </p>
                </div>

                {/* Mic status */}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center ${micOn
                      ? 'bg-neutral-800 text-neutral-400'
                      : 'bg-red-600/20 text-red-400'
                      }`}
                  >
                    {micOn ? (
                      <Mic className="size-3" />
                    ) : (
                      <MicOff className="size-3" />
                    )}
                  </div>

                  {/* Host controls (shown on hover) */}
                  <AnimatePresence>
                    {isHost && !isLocal && hoveredId === p.identity && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1"
                      >
                        <button type="button"
                          onClick={() => onMute(p.identity)}
                          className="size-6 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                          title="Mute"
                        >
                          <MicOff className="size-3" />
                        </button>
                        <button type="button"
                          onClick={() => onSpotlight(p.identity)}
                          className="size-6 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                          title="Spotlight"
                        >
                          <Pin className="size-3" />
                        </button>
                        <button type="button"
                          onClick={() => onKick(p.identity)}
                          className="size-6 rounded-full bg-red-600/20 hover:bg-red-600/40 flex items-center justify-center text-red-400 transition-colors"
                          title="Remove"
                        >
                          <UserX className="size-3" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <Users className="size-8 text-neutral-800 mx-auto mb-2" />
              <p className="text-neutral-600 text-sm">No participants found</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer: mute all (host only) */}
      {isHost && participants.length > 1 && (
        <div className="border-t border-neutral-800 px-3 py-2.5 flex-shrink-0">
          <button type="button"
            onClick={() =>
              participants
                .filter(({ isLocal }) => !isLocal)
                .forEach(({ p }) => onMute(p.identity))
            }
            className="w-full py-2 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <MicOff className="w-3.5 h-3.5" />
            Mute All Participants
          </button>
        </div>
      )}
    </div>
  );
}
