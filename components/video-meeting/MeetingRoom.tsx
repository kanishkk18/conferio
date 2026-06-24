'use client';
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import {
  Room, RoomEvent, LocalParticipant, RemoteParticipant,
  Track, VideoPresets, RoomOptions, Participant,
  TrackPublication, RemoteTrackPublication,
} from 'livekit-client';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff,
  Users, MessageSquare, Hand, Smile, Copy, UserPlus, X,
  AlertCircle, Layout,
} from 'lucide-react';
import MeetingParticipantTile from './Meetingparticipanttile';
import MeetingChat from './Meetingchat';
import ParticipantsPanel from './Participantspanel';
import ReactionOverlay from './Reactionoverlay';

// ── Types ──────────────────────────────────────────────────────────────────

interface MeetingRoomProps {
  roomId: string;
  meeting: {
    id: string;
    title: string;
    isHost: boolean;
    hostId: string;
    requireApproval: boolean;
  };
  user: { id: string; name: string; email: string; image?: string } | null;
  lobbyData: {
    displayName: string;
    audioOn: boolean;
    videoOn: boolean;
    background: string;
    token: string;
  };
}

interface RaisedHand {
  identity: string;
  name: string;
  raisedAt: number;
}

const REACTIONS = [
  { emoji: '👋', label: 'Wave' },
  { emoji: '👍', label: 'Thumbs up' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '👏', label: 'Applause' },
];

const ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
  publishDefaults: {
    simulcast: true,
    videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
  },
};

const MAX_GRID_VISIBLE = 9;

// ── Component ──────────────────────────────────────────────────────────────

export default function MeetingRoom({ roomId, meeting, user, lobbyData }: MeetingRoomProps) {
  const roomRef = useRef<Room | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [dominantSpeaker, setDominantSpeaker] = useState<Participant | null>(null);

  // Screen share
  const [screenShareTrack, setScreenShareTrack] = useState<any>(null);
  const [screenShareOwner, setScreenShareOwner] = useState<string | null>(null); // identity

  const [isMuted, setIsMuted] = useState(!lobbyData.audioOn);
  const [isVideoOn, setIsVideoOn] = useState(lobbyData.videoOn);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Reactions that float up
  const [reactions, setReactions] = useState<
    Array<{ id: string; emoji: string; name: string; image?: string; x: number }>
  >([]);

  // Raised hands map: identity → RaisedHand
  const [raisedHands, setRaisedHands] = useState<Map<string, RaisedHand>>(new Map());

  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showOverflowCarousel, setShowOverflowCarousel] = useState(false);

  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid');
  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [unreadChats, setUnreadChats] = useState(0);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // ── Socket.IO — replaces HTTP polling for waiting room ─────────────────

  useEffect(() => {
    if (!meeting.isHost) return;
    // Bootstrap socket server then connect
    fetch('/api/socket/io').catch(() => { });

    const sock = io({
      path: '/api/socket/io',
      query: { userId: user?.id || 'host', meetingRoom: roomId },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    sock.on('connect', () => {
      sock.emit('join_user', user?.id || 'host');
      sock.emit('join_meeting_host', roomId);
    });

    // Host receives real-time notification when someone enters waiting room
    sock.on('waiting_room_entry', (entry: any) => {
      setWaitingList((prev) => {
        if (prev.find((e) => e.id === entry.id)) return prev;
        return [...prev, entry];
      });
    });

    sock.on('waiting_room_left', (waitingId: string) => {
      setWaitingList((prev) => prev.filter((e) => e.id !== waitingId));
    });

    socketRef.current = sock;

    // One-time fetch to hydrate waiting list on mount (no polling)
    fetch(`/api/video-meetings/${roomId}/waiting-room`)
      .then((r) => r.json())
      .then((d) => setWaitingList(d.waiting || []))
      .catch(() => { });

    return () => {
      sock.close();
      socketRef.current = null;
    };
  }, [meeting.isHost, roomId, user?.id]);

  // ── LiveKit connection ──────────────────────────────────────────────────

  useEffect(() => {
    const connect = async () => {
      const newRoom = new Room(ROOM_OPTIONS);

      // ── Participant state ──
      const updateRemote = () =>
        setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));

      newRoom.on(RoomEvent.ParticipantConnected, updateRemote);
      newRoom.on(RoomEvent.ParticipantDisconnected, (p) => {
        updateRemote();
        // Remove their raised hand when they leave
        setRaisedHands((prev) => {
          const next = new Map(prev);
          next.delete(p.identity);
          return next;
        });
      });

      // ── Track subscribed — handle screen share display ──
      newRoom.on(
        RoomEvent.TrackSubscribed,
        (track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          updateRemote();

          if (
            track.kind === Track.Kind.Video &&
            publication.source === Track.Source.ScreenShare
          ) {
            // Attach remote screen share to dedicated video element
            setScreenShareTrack(track);
            setScreenShareOwner(participant.identity);
            if (screenShareVideoRef.current) {
              track.attach(screenShareVideoRef.current);
            }
          }
        }
      );

      newRoom.on(
        RoomEvent.TrackUnsubscribed,
        (track, publication: RemoteTrackPublication) => {
          updateRemote();
          if (
            track.kind === Track.Kind.Video &&
            publication.source === Track.Source.ScreenShare
          ) {
            setScreenShareTrack(null);
            setScreenShareOwner(null);
          }
        }
      );

      // ── Local track published — handle local screen share ──
      newRoom.on(RoomEvent.LocalTrackPublished, (publication) => {
        setLocalParticipant(newRoom.localParticipant);
        if (publication.source === Track.Source.ScreenShare) {
          // Attach local screen share to the same video element
          if (publication.track && screenShareVideoRef.current) {
            publication.track.attach(screenShareVideoRef.current);
          }
          setScreenShareTrack(publication.track);
          setScreenShareOwner(newRoom.localParticipant.identity);
          setIsScreenSharing(true);
        }
      });

      newRoom.on(RoomEvent.LocalTrackUnpublished, (publication) => {
        setLocalParticipant(newRoom.localParticipant);
        if (publication.source === Track.Source.ScreenShare) {
          setScreenShareTrack(null);
          setScreenShareOwner(null);
          setIsScreenSharing(false);
        }
      });

      // ── Dominant speaker ──
      newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const first = speakers[0] || null;
        setDominantSpeaker(first);
        if (first && !(first instanceof LocalParticipant) && layout === 'spotlight') {
          setSpotlightId(first.identity);
        }
      });

      // ── Data messages: reactions, chat, hand-raise, force-mute, kick ──
      newRoom.on(RoomEvent.DataReceived, (payload, participant) => {
        let msg: any;
        try {
          msg = JSON.parse(new TextDecoder().decode(payload));
        } catch {
          return;
        }

        const senderName =
          msg.name ||
          (() => {
            try {
              return participant?.metadata
                ? JSON.parse(participant.metadata).name
                : participant?.name;
            } catch {
              return participant?.name || 'Someone';
            }
          })();

        switch (msg.type) {
          case 'reaction':
            addReactionBubble(msg.emoji, senderName, msg.image);
            break;

          case 'chat':
            setChatMessages((prev) => [
              ...prev,
              { ...msg, id: Date.now().toString(), isSelf: false },
            ]);
            setUnreadChats((n) => (showChat ? 0 : n + 1));
            break;

          case 'hand_raise': {
            const identity = participant?.identity || '';
            setRaisedHands((prev) => {
              const next = new Map(prev);
              if (msg.raised) {
                next.set(identity, {
                  identity,
                  name: senderName,
                  raisedAt: Date.now(),
                });
              } else {
                next.delete(identity);
              }
              return next;
            });
            break;
          }

          case 'force_mute':
            // Someone is telling us to mute
            newRoom.localParticipant.setMicrophoneEnabled(false);
            setIsMuted(true);
            break;

          case 'kick':
            // Host kicked us
            newRoom.disconnect();
            window.close();
            setTimeout(() => { window.location.href = '/'; }, 300);
            break;
        }
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setRoom(null);
        setLocalParticipant(null);
        setRemoteParticipants([]);
        setScreenShareTrack(null);
        setScreenShareOwner(null);
      });

      // ── Connect ──
      const url = process.env.NEXT_PUBLIC_LIVEKIT_URL!;
      await newRoom.connect(url, lobbyData.token);

      if (lobbyData.videoOn) {
        await newRoom.localParticipant.enableCameraAndMicrophone();
      } else {
        await newRoom.localParticipant.setMicrophoneEnabled(lobbyData.audioOn);
      }
      if (!lobbyData.audioOn) {
        await newRoom.localParticipant.setMicrophoneEnabled(false);
      }

      roomRef.current = newRoom;
      setRoom(newRoom);
      setLocalParticipant(newRoom.localParticipant);
      setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
    };

    connect().catch(console.error);

    return () => {
      roomRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-attach screen share track when ref mounts
  useEffect(() => {
    if (screenShareTrack && screenShareVideoRef.current) {
      try {
        screenShareTrack.attach(screenShareVideoRef.current);
      } catch { /* already attached */ }
    }
  }, [screenShareTrack]);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const addReactionBubble = useCallback(
    (emoji: string, name: string, image?: string) => {
      const id = Math.random().toString(36).slice(2);
      const x = 15 + Math.random() * 70;
      setReactions((prev) => [...prev, { id, emoji, name, image, x }]);
      setTimeout(
        () => setReactions((prev) => prev.filter((r) => r.id !== id)),
        3600
      );
    },
    []
  );

  const sendData = useCallback((data: object) => {
    if (!roomRef.current) return;
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    roomRef.current.localParticipant.publishData(encoded, { reliable: true });
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────

  const toggleMute = () => {
    if (!roomRef.current) return;
    const on = roomRef.current.localParticipant.isMicrophoneEnabled;
    roomRef.current.localParticipant.setMicrophoneEnabled(!on);
    setIsMuted(on);
  };

  const toggleVideo = () => {
    if (!roomRef.current) return;
    const on = roomRef.current.localParticipant.isCameraEnabled;
    roomRef.current.localParticipant.setCameraEnabled(!on);
    setIsVideoOn(!on);
  };

  const toggleScreenShare = async () => {
    if (!roomRef.current) return;
    if (isScreenSharing) {
      await roomRef.current.localParticipant.setScreenShareEnabled(false);
      // setIsScreenSharing handled by LocalTrackUnpublished event
    } else {
      try {
        await roomRef.current.localParticipant.setScreenShareEnabled(true, {
          audio: true,
          selfBrowserSurface: 'include',
        });
        // setIsScreenSharing handled by LocalTrackPublished event
      } catch (err: any) {
        // User cancelled the picker — don't crash
        if (err?.name !== 'NotAllowedError') console.error(err);
      }
    }
  };

  const raiseHand = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);

    // Update own raised-hands map immediately
    const identity = roomRef.current?.localParticipant.identity || '';
    setRaisedHands((prev) => {
      const map = new Map(prev);
      if (next) {
        map.set(identity, { identity, name: lobbyData.displayName, raisedAt: Date.now() });
      } else {
        map.delete(identity);
      }
      return map;
    });

    // Broadcast to all others
    sendData({
      type: 'hand_raise',
      raised: next,
      name: lobbyData.displayName,
      image: user?.image,
    });
  };

  const sendReaction = (emoji: string) => {
    setShowReactions(false);
    // Show locally immediately
    addReactionBubble(emoji, lobbyData.displayName, user?.image);
    // Broadcast to others
    sendData({
      type: 'reaction',
      emoji,
      name: lobbyData.displayName,
      image: user?.image,
    });
  };

  const sendChatMessage = (text: string) => {
    const msg = {
      type: 'chat',
      text,
      name: lobbyData.displayName,
      image: user?.image,
      time: new Date().toISOString(),
    };
    setChatMessages((prev) => [
      ...prev,
      { ...msg, id: Date.now().toString(), isSelf: true },
    ]);
    sendData(msg);
    fetch(`/api/video-meetings/${roomId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, senderName: lobbyData.displayName }),
    }).catch(() => { });
  };

  const approveWaiting = async (waitingId: string, approve: boolean) => {
    await fetch(`/api/video-meetings/${roomId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waitingId, approved: approve }),
    });
    setWaitingList((prev) => prev.filter((w) => w.id !== waitingId));
  };

  const kickParticipant = async (identity: string) => {
    // Send kick signal via LiveKit data channel
    const encoded = new TextEncoder().encode(JSON.stringify({ type: 'kick' }));
    try {
      await roomRef.current?.localParticipant.publishData(encoded, {
        reliable: true,
        destinationIdentities: [identity],
      });
    } catch { /* participant may have already left */ }
    await fetch(`/api/video-meetings/${roomId}/kick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity }),
    }).catch(() => { });
  };

  const muteParticipant = async (identity: string) => {
    const encoded = new TextEncoder().encode(JSON.stringify({ type: 'force_mute' }));
    try {
      await roomRef.current?.localParticipant.publishData(encoded, {
        reliable: true,
        destinationIdentities: [identity],
      });
    } catch { /* ignore */ }
  };

  const leaveMeeting = async () => {
    setIsLeaving(true);
    roomRef.current?.disconnect();
    await fetch(`/api/video-meetings/${roomId}/leave`, { method: 'POST' }).catch(() => { });
    window.close();
    setTimeout(() => { window.location.href = '/'; }, 500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    await fetch(`/api/video-meetings/${roomId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    });
    setInviteEmail('');
    setShowInvite(false);
  };

  // ── Layout helpers ───────────────────────────────────────────────────────

  const allParticipants = useMemo(() => {
    const list: Array<{ p: Participant; isLocal: boolean }> = [];
    if (localParticipant) list.push({ p: localParticipant, isLocal: true });
    remoteParticipants.forEach((p) => list.push({ p, isLocal: false }));
    return list;
  }, [localParticipant, remoteParticipants]);

  const visibleParticipants = allParticipants.slice(0, MAX_GRID_VISIBLE);
  const overflowParticipants = allParticipants.slice(MAX_GRID_VISIBLE);
  const overflowCount = overflowParticipants.length;

  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  const spotlightEntry =
    allParticipants.find((x) => x.p.identity === spotlightId) ||
    (dominantSpeaker
      ? allParticipants.find((x) => x.p.identity === dominantSpeaker.identity)
      : null) ||
    allParticipants[0];

  const sidebarParticipants = allParticipants.filter(
    (x) => x.p.identity !== spotlightEntry?.p.identity
  );

  // Is anyone screen-sharing?
  const hasScreenShare = !!screenShareTrack;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 flex flex-col bg-neutral-950 select-none overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Floating reaction bubbles */}
      <ReactionOverlay reactions={reactions} />

      {/* ── Top bar ── */}
      <div className="h-14 flex items-center justify-between px-4 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/50 flex-shrink-0 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-white font-semibold text-sm truncate max-w-48">
            {meeting.title}
          </span>
          <span className="text-neutral-500 text-xs hidden sm:block">{roomId}</span>
          {/* Raised hands indicator in top bar */}
          {raisedHands.size > 0 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full"
            >
              <span className="text-sm">✋</span>
              <span className="text-yellow-400 text-xs font-semibold">
                {raisedHands.size}
              </span>
              <span className="text-yellow-400 text-xs">
                {Array.from(raisedHands.values())
                  .slice(0, 2)
                  .map((h) => h.name)
                  .join(', ')}
                {raisedHands.size > 2 ? ` +${raisedHands.size - 2}` : ''}
              </span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Waiting room badge (host) */}
          {meeting.isHost && waitingList.length > 0 && (
            <motion.button
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              onClick={() => setShowParticipants(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-400 text-xs font-semibold"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {waitingList.length} waiting
            </motion.button>
          )}

          <button type="button"
            onClick={() => { setShowParticipants((v) => !v); setShowChat(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${showParticipants ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}
          >
            <Users className="size-4" />
            <span className="text-xs font-medium">{allParticipants.length}</span>
        </button>

        <button type="button"
          onClick={() => { setShowChat((v) => !v); setShowParticipants(false); setUnreadChats(0); }}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${showChat ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}
        >
          <MessageSquare className="size-4" />
            {unreadChats > 0 && (
              <span className="absolute -top-1 -right-1 size-4bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
          {unreadChats > 9 ? '9+' : unreadChats}
        </span>
            )}
      </button>

      <button type="button"
        onClick={() => setLayout((v) => (v === 'grid' ? 'spotlight' : 'grid'))}
        className="px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
        title="Toggle layout"
      >
        <Layout className="size-4" />
          </button>

          <button type="button"
            onClick={() => setShowInvite((v) => !v)}
            className="px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
        <UserPlus className="size-4" />
          </button>

          {/* Invite dropdown */}
          <AnimatePresence>
            {showInvite && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-14 right-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl w-80 z-50"
              >
        <h3 className="text-white font-semibold mb-3">Invite to Meeting</h3>
        <div className="flex gap-2 mb-3">
          <input
          aria-label="invite-email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
          />
          <button type="button"
            onClick={sendInvite}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
        <button type="button"
          onClick={copyLink}
          className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm text-neutral-300 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? '✓ Copied!' : 'Copy meeting link'}
        </button>
        <button type="button"
          onClick={() => setShowInvite(false)}
          className="absolute top-3 right-3 p-1 text-neutral-500 hover:text-white"
        >
          <X className="size-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">

          {/* ── Video/screen share area ── */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <div className="flex-1 p-3 overflow-hidden">

              {/* ── Active screen share — takes priority over grid ── */}
              {hasScreenShare ? (
                <div className="h-full flex gap-2">
                  {/* Screen share video */}
                  <div className="flex-1 relative rounded-2xl overflow-hidden bg-black">
                    <video
                    aria-label='screen-share-video'
                      ref={screenShareVideoRef}
                      autoPlay
                      playsInline
                      muted={screenShareOwner === localParticipant?.identity}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Monitor className="size-3 text-blue-400" />
                      {screenShareOwner === localParticipant?.identity
                        ? 'You are sharing'
                        : `${(() => {
                          const p = remoteParticipants.find(
                            (rp) => rp.identity === screenShareOwner
                          );
                          try { return p ? JSON.parse(p.metadata || '{}').name || p.name : 'Someone'; } catch { return p?.name || 'Someone'; }
                        })()
                        } is sharing`}
                    </div>
                  </div>

                  {/* Participant strip (PiP) */}
                  <div className="w-44 flex flex-col gap-2 overflow-y-auto">
                    {allParticipants.slice(0, 6).map(({ p, isLocal }) => (
                      <div key={p.identity} className="flex-shrink-0" style={{ aspectRatio: '16/9' }}>
                        <MeetingParticipantTile
                          participant={p}
                          isLocal={isLocal}
                          isHost={meeting.isHost}
                          compact
                          isSpeaking={dominantSpeaker?.identity === p.identity}
                          isHandRaised={raisedHands.has(p.identity)}
                          onSpotlight={() => { }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : layout === 'spotlight' && spotlightEntry ? (
                // ── Spotlight layout ──
                <div className="h-full flex gap-2">
                  <div className="flex-1">
                    <MeetingParticipantTile
                      participant={spotlightEntry.p}
                      isLocal={spotlightEntry.isLocal}
                      isHost={meeting.isHost}
                      isSpeaking={dominantSpeaker?.identity === spotlightEntry.p.identity}
                      isHandRaised={raisedHands.has(spotlightEntry.p.identity)}
                      onKick={meeting.isHost && !spotlightEntry.isLocal ? () => kickParticipant(spotlightEntry.p.identity) : undefined}
                      onMute={meeting.isHost && !spotlightEntry.isLocal ? () => muteParticipant(spotlightEntry.p.identity) : undefined}
                      onSpotlight={() => { }}
                    />
                  </div>
                  {sidebarParticipants.length > 0 && (
                    <div className="w-44 flex flex-col gap-2 overflow-y-auto">
                      {sidebarParticipants.map(({ p, isLocal }) => (
                        <div key={p.identity} className="flex-shrink-0" style={{ aspectRatio: '16/9' }}>
                          <MeetingParticipantTile
                            participant={p}
                            isLocal={isLocal}
                            isHost={meeting.isHost}
                            compact
                            isSpeaking={dominantSpeaker?.identity === p.identity}
                            isHandRaised={raisedHands.has(p.identity)}
                            onSpotlight={() => setSpotlightId(p.identity)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // ── Grid layout ──
                <div
                  className={`h-full grid ${getGridCols(
                    Math.min(allParticipants.length, MAX_GRID_VISIBLE)
                  )} gap-2 auto-rows-fr`}
                >
                  {visibleParticipants.map(({ p, isLocal }) => (
                    <MeetingParticipantTile
                      key={p.identity}
                      participant={p}
                      isLocal={isLocal}
                      isHost={meeting.isHost}
                      isSpeaking={dominantSpeaker?.identity === p.identity}
                      isHandRaised={raisedHands.has(p.identity)}
                      onKick={meeting.isHost && !isLocal ? () => kickParticipant(p.identity) : undefined}
                      onMute={meeting.isHost && !isLocal ? () => muteParticipant(p.identity) : undefined}
                      onSpotlight={() => { setLayout('spotlight'); setSpotlightId(p.identity); }}
                    />
                  ))}

                  {/* Overflow tile */}
                  {overflowCount > 0 && (
                    <button type="button"
                      onClick={() => setShowOverflowCarousel(true)}
                      className="relative rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex -gap-x-2">
                        {overflowParticipants.slice(0, 3).map(({ p }) => (
                          <div key={p.identity} className="size-10 rounded-full bg-neutral-700 border-2 border-neutral-900 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {(p.name || '?')[0].toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <span className="text-white font-bold text-lg">+{overflowCount}</span>
                      <span className="text-neutral-400 text-xs">more participants</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Overflow carousel */}
            <AnimatePresence>
              {showOverflowCarousel && overflowCount > 0 && (
                <motion.div
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="absolute bottom-20 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 p-4 z-20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">
                      All Participants ({allParticipants.length})
                    </h3>
                    <button type="button" onClick={() => setShowOverflowCarousel(false)} className="p-1 text-neutral-400 hover:text-white">
                      <X className="size-4" />
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                      {overflowParticipants.map(({ p, isLocal }) => (
                        <div key={p.identity} className="flex-shrink-0 w-36" style={{ aspectRatio: '16/9' }}>
                          <MeetingParticipantTile
                            participant={p}
                            isLocal={isLocal}
                            isHost={meeting.isHost}
                            compact
                            isSpeaking={dominantSpeaker?.identity === p.identity}
                            isHandRaised={raisedHands.has(p.identity)}
                            onSpotlight={() => { setLayout('spotlight'); setSpotlightId(p.identity); setShowOverflowCarousel(false); }}
                          />
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Side panels ── */}
          <AnimatePresence>
            {(showChat || showParticipants) && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="flex flex-col border-l border-neutral-800 overflow-hidden flex-shrink-0"
              >
                {showParticipants && (
                  <ParticipantsPanel
                    participants={allParticipants}
                    waitingList={waitingList}
                    isHost={meeting.isHost}
                    dominantSpeakerId={dominantSpeaker?.identity}
                    raisedHands={raisedHands}
                    onClose={() => setShowParticipants(false)}
                    onApprove={approveWaiting}
                    onKick={kickParticipant}
                    onMute={muteParticipant}
                    onSpotlight={(id) => { setLayout('spotlight'); setSpotlightId(id); }}
                  />
                )}
                {showChat && (
                  <MeetingChat
                    messages={chatMessages}
                    onSend={sendChatMessage}
                    onClose={() => setShowChat(false)}
                    displayName={lobbyData.displayName}
                    userImage={user?.image}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom controls ── */}
        <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800/50 px-4 flex-shrink-0">
          <CtrlBtn onClick={toggleMute} active={!isMuted} danger={isMuted}
            icon={isMuted ? MicOff : Mic} label={isMuted ? 'Unmute' : 'Mute'} />

          <CtrlBtn onClick={toggleVideo} active={isVideoOn} danger={!isVideoOn}
            icon={isVideoOn ? Video : VideoOff} label="Camera" />

          <CtrlBtn
            onClick={toggleScreenShare}
            active={isScreenSharing}
            icon={isScreenSharing ? MonitorOff : Monitor}
            label={isScreenSharing ? 'Stop' : 'Share'}
            activeClass="bg-blue-600/20 text-blue-400 border border-blue-500/30"
          />

          {/* Hand raise — shows animated hand when raised */}
          <button type="button"
            onClick={raiseHand}
            className={`flex flex-col items-center gap-1 px-3.5 py-2.5 rounded-2xl text-[10px] font-medium transition-all ${isHandRaised
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-neutral-800/70 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-transparent'
              }`}
          >
            <motion.span
              animate={isHandRaised ? { rotate: [0, 15, -5, 15, 0] } : {}}
              transition={{ repeat: isHandRaised ? Infinity : 0, duration: 1.2 }}
              className="text-xl leading-none"
            >
              ✋
            </motion.span>
            {isHandRaised ? 'Lower' : 'Raise'}
          </button>

          {/* Reactions */}
          <div className="relative">
            <CtrlBtn
              onClick={() => setShowReactions((v) => !v)}
              active={showReactions}
              icon={Smile}
              label="React"
            />
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 rounded-2xl p-3 shadow-2xl z-50"
                >
                  <div className="grid grid-cols-4 gap-1">
                    {REACTIONS.map((r) => (
                      <button type="button"
                        key={r.emoji}
                        onClick={() => sendReaction(r.emoji)}
                        className="size-12 rounded-xl hover:bg-neutral-800 flex items-center justify-center text-2xl transition-all hover:scale-125"
                        title={r.label}
                      >
                        {r.emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-8 bg-neutral-800 mx-1" />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={leaveMeeting}
            disabled={isLeaving}
            className="flex flex-col items-center gap-1 px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-60"
          >
            <PhoneOff className="size-5" />
            <span className="text-[10px] font-medium">{isLeaving ? 'Leaving…' : 'Leave'}</span>
          </motion.button>
        </div>
    </div>
  );
}

function CtrlBtn({
  onClick, active = false, danger = false, icon: Icon, label, activeClass,
}: {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  icon: React.ElementType;
  label: string;
  activeClass?: string;
}) {
  const cls = danger
    ? 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30'
    : active
      ? activeClass || 'bg-neutral-700 text-white hover:bg-neutral-600'
      : 'bg-neutral-800/70 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-transparent';

  return (
    <button type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3.5 py-2.5 rounded-2xl text-[10px] font-medium transition-all ${cls}`}
    >
      <Icon className="size-5" />
      {label}
    </button>
  );
}
