'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  LocalParticipant,
  RemoteParticipant,
  Track,
  TrackPublication,
} from 'livekit-client';
import { MicOff, VideoOff, Pin, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ParticipantTileProps {
  participant: LocalParticipant | RemoteParticipant;
  isLocal?: boolean;
  compact?: boolean;
  showVideo?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
}

/**
 * Safely get all TrackPublications from a participant.
 * Works with both LiveKit v1 (separate videoTracks/audioTracks maps)
 * and LiveKit v2 (unified trackPublications map).
 */
function getTrackPublications(
  participant: LocalParticipant | RemoteParticipant
): TrackPublication[] {
  try {
    // LiveKit v2 API
    if ((participant as any).trackPublications instanceof Map) {
      return Array.from(
        (participant as any).trackPublications.values() as IterableIterator<TrackPublication>
      );
    }
    // LiveKit v1 API - separate maps
    const pubs: TrackPublication[] = [];
    if ((participant as any).videoTracks instanceof Map) {
      pubs.push(
        ...Array.from(
          ((participant as any).videoTracks as Map<string, TrackPublication>).values()
        )
      );
    }
    if ((participant as any).audioTracks instanceof Map) {
      pubs.push(
        ...Array.from(
          ((participant as any).audioTracks as Map<string, TrackPublication>).values()
        )
      );
    }
    return pubs;
  } catch {
    return [];
  }
}

export const ParticipantTile = React.memo(
  ({
    participant,
    isLocal = false,
    compact = false,
    showVideo = true,
    isPinned = false,
    onPin,
  }: ParticipantTileProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [name, setName] = useState('Unknown');
    const [image, setImage] = useState<string | null>(null);
    const [hasVideoTrack, setHasVideoTrack] = useState(false);

    // Parse metadata
    useEffect(() => {
      try {
        const meta = participant.metadata
          ? JSON.parse(participant.metadata)
          : {};
        setName(
          meta.name || participant.name || participant.identity || 'Unknown'
        );
        setImage(meta.image || null);
      } catch {
        setName(participant.name || participant.identity || 'Unknown');
      }
    }, [participant.metadata, participant.name, participant.identity]);

    // Read current track state and update UI
    const syncTrackState = useCallback(() => {
      const pubs = getTrackPublications(participant);

      const camPub = pubs.find((p) => p.source === Track.Source.Camera);
      const cameraOn = !!(camPub && camPub.track && !camPub.isMuted);
      setIsCameraOff(!cameraOn);
      setHasVideoTrack(cameraOn);

      const micPub = pubs.find((p) => p.source === Track.Source.Microphone);
      setIsMuted(!micPub?.track || micPub.isMuted);
    }, [participant]);

    // Attach camera track to video element
    const attachVideoTrack = useCallback(() => {
      if (!videoRef.current || !showVideo) return;

      const pubs = getTrackPublications(participant);
      const camPub = pubs.find(
        (p) => p.source === Track.Source.Camera && p.track && !p.isMuted
      );

      if (camPub?.track) {
        try {
          (camPub.track as any).attach(videoRef.current);
          setHasVideoTrack(true);
          setIsCameraOff(false);
        } catch (e) {
          console.warn('[ParticipantTile] attach video error:', e);
        }
      }
    }, [participant, showVideo]);

    // Attach microphone track to audio element (remote only)
    const attachAudioTrack = useCallback(() => {
      if (isLocal || !audioRef.current) return;

      const pubs = getTrackPublications(participant);
      const micPub = pubs.find(
        (p) => p.source === Track.Source.Microphone && p.track
      );

      if (micPub?.track) {
        try {
          (micPub.track as any).attach(audioRef.current);
        } catch (e) {
          console.warn('[ParticipantTile] attach audio error:', e);
        }
      }
    }, [participant, isLocal]);

    // Subscribe to participant lifecycle events
    useEffect(() => {
      if (!participant) return;

      // Initial sync
      syncTrackState();
      attachVideoTrack();
      attachAudioTrack();

      const onAny = () => {
        syncTrackState();
        attachVideoTrack();
        attachAudioTrack();
      };
      const onSpeaking = (speaking: boolean) => setIsSpeaking(speaking);

      participant.on('trackPublished', onAny);
      participant.on('trackUnpublished', onAny);
      participant.on('trackMuted', onAny);
      participant.on('trackUnmuted', onAny);
      participant.on('trackSubscribed', onAny);
      participant.on('trackUnsubscribed', onAny);
      participant.on('isSpeakingChanged', onSpeaking);

      return () => {
        participant.off('trackPublished', onAny);
        participant.off('trackUnpublished', onAny);
        participant.off('trackMuted', onAny);
        participant.off('trackUnmuted', onAny);
        participant.off('trackSubscribed', onAny);
        participant.off('trackUnsubscribed', onAny);
        participant.off('isSpeakingChanged', onSpeaking);
      };
    }, [participant, syncTrackState, attachVideoTrack, attachAudioTrack]);

    // Re-attach when showVideo toggles
    useEffect(() => {
      if (showVideo) attachVideoTrack();
    }, [showVideo, attachVideoTrack]);

    const initials =
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?';

    const showVideoFeed = showVideo && hasVideoTrack && !isCameraOff;

    // ─── Compact tile ──────────────────────────────────────────────────────
    if (compact) {
      return (
        <div
          className={`relative rounded-2xl overflow-hidden bg-neutral-900 ${isSpeaking ? 'ring-2 ring-emerald-500/80' : ''
            }`}
          style={{ aspectRatio: '16/9' }}
         aria-label="Button">
          <video
          aria-label="Video stream"
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              display: showVideoFeed ? 'block' : 'none',
              transform: isLocal ? 'scaleX(-1)' : 'none',
            }}
          />

          {!showVideoFeed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900" aria-label="Button">
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  className="size-12 rounded-full object-cover"
                  width={50}
                  height={50}
                />
              ) : (
                <div className="size-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center" aria-label="Button">
                  <span className="text-white font-bold" aria-label="Button">{initials}</span>
                </div>
              )}
              {!showVideo && isSpeaking && (
                <div className="mt-2 flex gap-0.5" aria-label="Button">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: [0.3, 1, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.7,
                        delay: i * 0.12,
                      }}
                      className="w-1 h-3.5 bg-emerald-400 rounded-full origin-bottom"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between" aria-label="Button">
            <span className="text-white text-xs font-medium drop-shadow-lg truncate" aria-label="Button">
              {isLocal ? 'You' : name}
            </span>
            <div className="flex gap-1" aria-label="Button">
              {isMuted && (
                <div className="bg-red-600/90 rounded-full p-0.5" aria-label="Button">
                  <MicOff className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          </div>

          {!isLocal && (
            <audio
            aria-label="Audio stream"
            ref={audioRef} autoPlay   className="hidden" />
          )}
        </div>
      );
    }

    // ─── Full-size tile ────────────────────────────────────────────────────
    return (
      <div
        className={`relative rounded-2xl overflow-hidden bg-neutral-900 group ${isSpeaking ? 'ring-2 ring-emerald-500' : ''
          } ${isPinned ? 'ring-2 ring-blue-500' : ''}`}
        style={{ aspectRatio: '16/9', minHeight: 120 }}
       aria-label="Button">
        <video
        aria-label="Video stream"
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            display: showVideoFeed ? 'block' : 'none',
            transform: isLocal ? 'scaleX(-1)' : 'none',
          }}
        />

        {!showVideoFeed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950" aria-label="Button">
            {image ? (
              <Image
                src={image}
                alt={name}
                className=" size-24  rounded-full object-cover border-4 border-neutral-700"
                width={300}
                height={300}
              />
            ) : (
              <div className=" size-24  rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border-4 border-neutral-700" aria-label="Button">
                <span className="text-white font-bold text-3xl" aria-label="Button">{initials}</span>
              </div>
            )}
            {!showVideo && isSpeaking && (
              <div className="mt-4 flex items-end gap-1" aria-label="Button">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.12,
                    }}
                    className="w-1.5 h-6 bg-emerald-500 rounded-full origin-bottom"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {onPin && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Button">
            <button type="button"
              onClick={onPin}
              className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors ${isPinned
                ? 'bg-blue-600 text-white'
                : 'bg-black/50 text-white hover:bg-black/70'
                }`}
             aria-label="Button">
              <Pin className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5 flex items-center justify-between" aria-label="Button">
          <div className="flex items-center gap-2" aria-label="Button">
            {isSpeaking && (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="text-white text-sm font-medium" aria-label="Button">
              {isLocal ? 'You' : name}
            </span>
          </div>
          <div className="flex items-center gap-1" aria-label="Button">
            {isMuted && (
              <div className="size-6 rounded-full bg-red-600/90 flex items-center justify-center" aria-label="Button">
                <MicOff className="size-3 text-white" />
              </div>
            )}
            {isCameraOff && showVideo && (
              <div className="size-6 rounded-full bg-neutral-600/90 flex items-center justify-center" aria-label="Button">
                <VideoOff className="size-3 text-white" />
              </div>
            )}
          </div>
        </div>

        {!isLocal && (
          <audio
          aria-label="Audio stream"
          ref={audioRef} autoPlay className="hidden" />
        )}
      </div>
    );
  }
);

ParticipantTile.displayName = 'ParticipantTile';
