'use client';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import {
  Room,
  RoomEvent,
  LocalParticipant,
  RemoteParticipant,
  RoomOptions,
  VideoPresets,
} from 'livekit-client';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────

export type CallType = 'AUDIO' | 'VIDEO';
export type CallStatus =
  | 'PENDING'
  | 'CONNECTING'
  | 'ONGOING'
  | 'ON_HOLD'
  | 'ENDED';

export interface CallParticipantInfo {
  userId: string;
  name: string;
  image?: string;
  isMuted: boolean;
  isVideoOn: boolean;
}

export interface ActiveCall {
  id: string;
  roomName: string;
  type: CallType;
  status: CallStatus;
  isGroupCall: boolean;
  participants: CallParticipantInfo[];
  callerName?: string;
  callerImage?: string;
  callerId?: string;
  calleeId?: string;
  startedAt?: Date;
}

export interface IncomingCall {
  callId: string;
  roomName: string;
  type: CallType;
  isGroup: boolean;
  callerId: string;
  callerName: string;
  callerImage?: string;
}

interface CallContextValue {
  currentCall: ActiveCall | null;
  heldCalls: ActiveCall[];
  incomingCall: IncomingCall | null;
  isInCall: boolean;
  isCalling: boolean;
  room: Room | null;
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  minimizedCalls: string[];
  whiteboardElements: any[];
  annotations: any[];
  startCall: (
    userId: string,
    type: CallType,
    userName: string,
    userImage?: string
  ) => Promise<void>;
  joinCall: (callId: string, roomName: string, type: CallType) => Promise<void>;
  declineCall: (callId: string, callerId: string) => void;
  endCall: (callId?: string) => Promise<void>;
  holdCall: (callId: string) => void;
  resumeCall: (callId: string) => Promise<void>;
  mergeCalls: () => Promise<void>;
  addParticipant: (userId: string, name: string, image?: string) => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  minimizeCall: (callId: string) => void;
  maximizeCall: (callId: string) => void;
  updateWhiteboard: (elements: any[]) => void;
  addAnnotation: (annotation: any) => void;
  clearAnnotations: () => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const CallContext = createContext<CallContextValue | undefined>(undefined);

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
};

// ── LiveKit room config ────────────────────────────────────────────────────

const ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
  publishDefaults: {
    simulcast: true,
    videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
  },
};

// ── Provider ───────────────────────────────────────────────────────────────

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();

  // ── Refs (stable across renders) ────────────────────────────────────────
  const socketRef = useRef<Socket | null>(null);
  const roomRef = useRef<Room | null>(null);
  const currentCallRef = useRef<ActiveCall | null>(null);
  const incomingCallRef = useRef<IncomingCall | null>(null);
  const heldCallsRef = useRef<ActiveCall[]>([]);

  // ── State ────────────────────────────────────────────────────────────────
  const [room, setRoom] = useState<Room | null>(null);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);

  const [currentCall, setCurrentCall] = useState<ActiveCall | null>(null);
  const [heldCalls, setHeldCalls] = useState<ActiveCall[]>([]);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [minimizedCalls, setMinimizedCalls] = useState<string[]>([]);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [whiteboardElements, setWhiteboardElements] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);

  // Keep refs in sync
  currentCallRef.current = currentCall;
  incomingCallRef.current = incomingCall;
  heldCallsRef.current = heldCalls;

  // ── LiveKit helpers ──────────────────────────────────────────────────────

  const getLiveKitToken = async (roomName: string, isCreator: boolean) => {
    const res = await fetch('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, isCreator }),
    });
    if (!res.ok) throw new Error('Failed to get LiveKit token');
    const { token } = await res.json();
    return token as string;
  };

  const cleanupRoom = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setRoom(null);
    setLocalParticipant(null);
    setRemoteParticipants([]);
    setIsScreenSharing(false);
  }, []);

  const connectToRoom = useCallback(
    async (roomName: string, token: string, type: CallType) => {
      cleanupRoom();

      const newRoom = new Room(ROOM_OPTIONS);

      const updateRemote = () =>
        setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));

      newRoom.on(RoomEvent.ParticipantConnected, updateRemote);
      newRoom.on(RoomEvent.ParticipantDisconnected, updateRemote);
      newRoom.on(RoomEvent.TrackSubscribed, updateRemote);
      newRoom.on(RoomEvent.TrackUnsubscribed, updateRemote);
      newRoom.on(RoomEvent.LocalTrackPublished, () =>
        setLocalParticipant(newRoom.localParticipant)
      );
      newRoom.on(RoomEvent.LocalTrackUnpublished, () =>
        setLocalParticipant(newRoom.localParticipant)
      );
      newRoom.on(RoomEvent.Disconnected, () => {
        setRoom(null);
        setLocalParticipant(null);
        setRemoteParticipants([]);
        roomRef.current = null;
      });

      const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!url) throw new Error('NEXT_PUBLIC_LIVEKIT_URL not set');

      await newRoom.connect(url, token);

      if (type === 'VIDEO') {
        await newRoom.localParticipant.enableCameraAndMicrophone();
        setIsVideoOn(true);
      } else {
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        setIsVideoOn(false);
      }

      setIsMuted(false);
      setRoom(newRoom);
      setLocalParticipant(newRoom.localParticipant);
      setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
      roomRef.current = newRoom;

      return newRoom;
    },
    [cleanupRoom]
  );

  const cleanupCall = useCallback(
    (callId?: string) => {
      const target = callId || currentCallRef.current?.id;
      cleanupRoom();
      setWhiteboardElements([]);
      setAnnotations([]);
      setIsCalling(false);
      setCurrentCall((prev) => (!target || prev?.id === target ? null : prev));
      setHeldCalls((prev) => (!target ? [] : prev.filter((c) => c.id !== target)));
    },
    [cleanupRoom]
  );

  // ── Socket initialization ────────────────────────────────────────────────
  // Uses YOUR existing socket at /api/socket/io with join_user pattern

  useEffect(() => {
    if (!session?.user?.id) return;

    // Bootstrap the socket server endpoint
    // fetch('/api/socket/io').catch(() => {});

    const sock = io({
      path: '/api/socket/io',
      query: { userId: session.user.id },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    sock.on('connect', () => {
      console.log('[CallContext] Socket connected:', sock.id);
      // YOUR existing socket uses join_user event
      sock.emit('join_user', session.user.id);

      // Rejoin active call room on reconnect
      if (currentCallRef.current?.id) {
        sock.emit('join_call', currentCallRef.current.id);
      }
    });

    sock.on('connect_error', (err) =>
      console.warn('[CallContext] connect_error:', err.message)
    );

    // ── Incoming call ──
    // YOUR socket server emits 'incoming-call' with the full call object
    // We need to adapt it to our IncomingCall shape
    sock.on('incoming-call', (callData: any) => {
      console.log('[CallContext] incoming-call received:', callData);

      // callData may be the raw DB Call object (from old code) or our shaped object
      const shaped: IncomingCall = callData.callId
        ? callData // already shaped by our new startCall
        : {
            callId: callData.id,
            roomName: callData.roomName,
            type: callData.type as CallType,
            isGroup: callData.isGroupCall || false,
            callerId: callData.callerId,
            callerName: callData.caller?.name || callData.callerName || 'Unknown',
            callerImage: callData.caller?.image || callData.callerImage,
          };

      setIncomingCall(shaped);
      // Auto-dismiss after 60s
      setTimeout(() => {
        setIncomingCall((prev) =>
          prev?.callId === shaped.callId ? null : prev
        );
      }, 60_000);
    });

    // ── Call accepted (callee answered) ──
    sock.on('call-answered', (data: any) => {
      console.log('[CallContext] call-answered:', data);
      setIsCalling(false);
      setCurrentCall((prev) =>
        prev ? { ...prev, status: 'ONGOING' } : prev
      );
    });

    // ── Call declined ──
    sock.on('call-declined', (data: any) => {
      console.log('[CallContext] call-declined:', data);
      cleanupCall(data?.call?.id || data?.callId);
    });

    // ── Call ended by other party ──
    sock.on('call-ended', (data: any) => {
      console.log('[CallContext] call-ended:', data);
      cleanupCall(data?.call?.id || data?.callId);
    });

    // ── Missed (timeout from server) ──
    sock.on('call-missed', (data: any) => {
      console.log('[CallContext] call-missed:', data);
      cleanupCall(data?.callId);
    });

    // ── WebRTC (forwarded by your socket server) ──
    sock.on('call-offer', async (data: any) => {
      // handled by WebRTC layer if you use it — no-op here for LiveKit path
      console.log('[CallContext] call-offer received (WebRTC path)');
    });

    // ── Whiteboard / annotations ──
    sock.on('whiteboard-sync', (data: { elements: any[] }) => {
      setWhiteboardElements(data.elements);
    });
    sock.on('annotation-sync', (data: { annotation: any }) => {
      setAnnotations((prev) => [...prev, data.annotation]);
    });

        // ── Incoming meeting invite ──
    sock.on('incoming-meeting-invite', (data: any) => {
      console.log('[CallContext] incoming-meeting-invite received:', data);
      // Trigger the meeting invite modal
      if (typeof window !== 'undefined' && (window as any).onIncomingMeetingInvite) {
        (window as any).onIncomingMeetingInvite(data);
      }
      // Also store socket ref for the modal to use
      (window as any).socketRef = sock;
      (window as any).__USER_ID__ = session.user.id;
    });

    sock.on('meeting-invite-accepted', (data: any) => {
      console.log('[CallContext] meeting-invite-accepted:', data);
      toast.success('User joined the meeting');
    });

    sock.on('meeting-invite-declined', (data: any) => {
      console.log('[CallContext] meeting-invite-declined:', data);
      toast.error('User declined the meeting invitation');
    });

    socketRef.current = sock;

    return () => {
      sock.close();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const startCall = useCallback(
    async (
      userId: string,
      type: CallType,
      userName: string,
      userImage?: string
    ) => {
      const sock = socketRef.current;
      if (!sock?.connected) throw new Error('Socket not connected');
      if (!session?.user?.id) throw new Error('Not authenticated');

      setIsCalling(true);

      try {
        // 1. Create call record in DB
        const res = await fetch('/api/calls/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ calleeId: userId, type, isGroupCall: false }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to create call');
        }

        const callData = await res.json();
        console.log('[CallContext] Call created:', callData.id, callData.roomName);

        // 2. Build local call state
        const newCall: ActiveCall = {
          id: callData.id,
          roomName: callData.roomName,
          type,
          status: 'PENDING',
          isGroupCall: false,
          callerId: session.user.id,
          calleeId: userId,
          participants: [
            {
              userId,
              name: userName,
              image: userImage,
              isMuted: false,
              isVideoOn: type === 'VIDEO',
            },
          ],
          callerName: session.user.name || 'Unknown',
          callerImage: session.user.image || undefined,
          startedAt: new Date(),
        };

        setCurrentCall(newCall);

        // 3. Join the call socket room
        sock.emit('join_call', callData.id);

        // 4. Emit 'call-initiated' — YOUR socket server listens for this
        //    and emits 'incoming-call' to the callee's user room
        console.log('[CallContext] Emitting call-initiated to userId:', userId);
        sock.emit('call-initiated', {
          call: {
            // Include shape that your IncomingCallModal expects
            id: callData.id,
            roomName: callData.roomName,
            type,
            isGroupCall: false,
            callerId: session.user.id,
            calleeId: userId,
            callerName: session.user.name || 'Unknown',
            callerImage: session.user.image || undefined,
            // Also include our shaped fields so the receiver can use either format
            callId: callData.id,
            isGroup: false,
            caller: {
              id: session.user.id,
              name: session.user.name,
              image: session.user.image,
            },
          },
          to: userId,
        });

        // 5. Get LiveKit token and connect
        const token = await getLiveKitToken(callData.roomName, true);
        await connectToRoom(callData.roomName, token, type);

        setCurrentCall((prev) =>
          prev?.id === callData.id ? { ...prev, status: 'ONGOING' } : prev
        );
        setIsCalling(false);
      } catch (err) {
        setIsCalling(false);
        cleanupCall();
        throw err;
      }
    },
    [session, connectToRoom, cleanupCall]
  );

  const joinCall = useCallback(
    async (callId: string, roomName: string, type: CallType) => {
      const sock = socketRef.current;
      if (!sock) return;

      const caller = incomingCallRef.current?.callerId;

      try {
        // 1. Notify caller via your socket server pattern
        //    YOUR server listens for 'call-answered' and forwards to caller
        sock.emit('call-answered', {
          call: {
            id: callId,
            roomName,
            type,
            callerId: caller,
          },
          to: caller,
        });

        // 2. Update DB
        await fetch(`/api/calls/${callId}/join`, { method: 'POST' }).catch(
          console.error
        );

        // 3. Join socket room
        sock.emit('join_call', callId);

        // 4. Set state
        const newCall: ActiveCall = {
          id: callId,
          roomName,
          type,
          status: 'CONNECTING',
          isGroupCall: incomingCallRef.current?.isGroup || false,
          participants: [],
          callerId: caller,
        };

        setCurrentCall(newCall);
        setIncomingCall(null);
        setIsCalling(false);

        // 5. Connect to LiveKit
        const token = await getLiveKitToken(roomName, false);
        await connectToRoom(roomName, token, type);

        setCurrentCall((prev) =>
          prev?.id === callId ? { ...prev, status: 'ONGOING' } : prev
        );
      } catch (err) {
        console.error('[CallContext] joinCall error:', err);
        cleanupCall(callId);
      }
    },
    [connectToRoom, cleanupCall]
  );

  const declineCall = useCallback((callId: string, callerId: string) => {
    const sock = socketRef.current;
    // YOUR socket server listens for 'call-declined' and forwards to caller
    sock?.emit('call-declined', {
      call: { id: callId, callerId },
      to: callerId,
    });
    setIncomingCall(null);
    fetch(`/api/calls/${callId}/decline`, { method: 'POST' }).catch(
      console.error
    );
  }, []);

  const endCall = useCallback(
    async (callId?: string) => {
      const targetId = callId || currentCallRef.current?.id;
      if (!targetId) return;

      const call =
        currentCallRef.current?.id === targetId
          ? currentCallRef.current
          : heldCallsRef.current.find((c) => c.id === targetId);

      const otherPartyId =
        call?.calleeId !== session?.user?.id
          ? call?.calleeId
          : call?.callerId;

      if (otherPartyId) {
        // YOUR socket server listens for 'call-end' and emits 'call-ended'
        socketRef.current?.emit('call-end', {
          callId: targetId,
          to: otherPartyId,
        });
      }

      socketRef.current?.emit('leave_call', targetId);
      cleanupCall(targetId);

      await fetch(`/api/calls/${targetId}/end`, { method: 'POST' }).catch(
        console.error
      );
    },
    [session, cleanupCall]
  );

  const holdCall = useCallback((callId: string) => {
    if (!currentCallRef.current || currentCallRef.current.id !== callId) return;
    roomRef.current?.localParticipant.setMicrophoneEnabled(false);
    roomRef.current?.localParticipant.setCameraEnabled(false);
    const held = { ...currentCallRef.current, status: 'ON_HOLD' as CallStatus };
    setHeldCalls((prev) => [...prev, held]);
    setCurrentCall(null);
  }, []);

  const resumeCall = useCallback(
    async (callId: string) => {
      const call = heldCallsRef.current.find((c) => c.id === callId);
      if (!call) return;
      if (currentCallRef.current) holdCall(currentCallRef.current.id);
      setHeldCalls((prev) => prev.filter((c) => c.id !== callId));
      setCurrentCall({ ...call, status: 'ONGOING' });
      roomRef.current?.localParticipant.setMicrophoneEnabled(true);
      if (call.type === 'VIDEO') {
        roomRef.current?.localParticipant.setCameraEnabled(true);
      }
    },
    [holdCall]
  );

  const mergeCalls = useCallback(async () => {
    if (!currentCallRef.current || heldCallsRef.current.length === 0) return;
    const heldCall = heldCallsRef.current[0];
    await fetch('/api/calls/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callId1: currentCallRef.current.id,
        callId2: heldCall.id,
      }),
    }).catch(console.error);
    setCurrentCall((prev) =>
      prev
        ? {
            ...prev,
            isGroupCall: true,
            participants: [...prev.participants, ...heldCall.participants],
          }
        : null
    );
    setHeldCalls((prev) => prev.filter((c) => c.id !== heldCall.id));
  }, []);

  const addParticipant = useCallback(
    async (userId: string, name: string, image?: string) => {
      if (!currentCallRef.current || !socketRef.current || !session?.user) return;

      socketRef.current.emit('call-initiated', {
        call: {
          id: currentCallRef.current.id,
          roomName: currentCallRef.current.roomName,
          type: currentCallRef.current.type,
          isGroupCall: true,
          callerId: session.user.id,
          calleeId: userId,
          callerName: session.user.name || 'Unknown',
          callerImage: session.user.image || undefined,
          callId: currentCallRef.current.id,
          isGroup: true,
          caller: { id: session.user.id, name: session.user.name, image: session.user.image },
        },
        to: userId,
      });

      await fetch(`/api/calls/${currentCallRef.current.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).catch(console.error);

      setCurrentCall((prev) =>
        prev
          ? {
              ...prev,
              isGroupCall: true,
              participants: [
                ...prev.participants,
                { userId, name, image, isMuted: false, isVideoOn: true },
              ],
            }
          : null
      );
    },
    [session]
  );

  const toggleMute = useCallback(() => {
    if (!roomRef.current) return;
    const enabled = roomRef.current.localParticipant.isMicrophoneEnabled;
    roomRef.current.localParticipant.setMicrophoneEnabled(!enabled);
    setIsMuted(enabled);
  }, []);

  const toggleVideo = useCallback(() => {
    if (!roomRef.current) return;
    const enabled = roomRef.current.localParticipant.isCameraEnabled;
    roomRef.current.localParticipant.setCameraEnabled(!enabled);
    setIsVideoOn(!enabled);
  }, []);

  const startScreenShare = useCallback(async () => {
    if (!roomRef.current) return;
    await roomRef.current.localParticipant.setScreenShareEnabled(true);
    setIsScreenSharing(true);
  }, []);

  const stopScreenShare = useCallback(async () => {
    if (!roomRef.current) return;
    await roomRef.current.localParticipant.setScreenShareEnabled(false);
    setIsScreenSharing(false);
  }, []);

  const minimizeCall = useCallback((callId: string) => {
    setMinimizedCalls((prev) => [...new Set([...prev, callId])]);
  }, []);

  const maximizeCall = useCallback((callId: string) => {
    setMinimizedCalls((prev) => prev.filter((id) => id !== callId));
  }, []);

  const updateWhiteboard = useCallback((elements: any[]) => {
    setWhiteboardElements(elements);
    if (currentCallRef.current) {
      socketRef.current?.emit('whiteboard-update', {
        callId: currentCallRef.current.id,
        elements,
      });
    }
  }, []);

  const addAnnotation = useCallback(
    (annotation: any) => {
      const ann = { ...annotation, id: Date.now(), userId: session?.user?.id };
      setAnnotations((prev) => [...prev, ann]);
      if (currentCallRef.current) {
        socketRef.current?.emit('annotation-update', {
          callId: currentCallRef.current.id,
          annotation: ann,
        });
      }
    },
    [session]
  );

  const clearAnnotations = useCallback(() => setAnnotations([]), []);

  // ── Value ────────────────────────────────────────────────────────────────

  return (
    <CallContext.Provider
      value={{
        currentCall,
        heldCalls,
        incomingCall,
        isInCall: !!currentCall,
        isCalling,
        room,
        localParticipant,
        remoteParticipants,
        isMuted,
        isVideoOn,
        isScreenSharing,
        minimizedCalls,
        whiteboardElements,
        annotations,
        startCall,
        joinCall,
        declineCall,
        endCall,
        holdCall,
        resumeCall,
        mergeCalls,
        addParticipant,
        toggleMute,
        toggleVideo,
        startScreenShare,
        stopScreenShare,
        minimizeCall,
        maximizeCall,
        updateWhiteboard,
        addAnnotation,
        clearAnnotations,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};


// 'use client';
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useEffect,
//   useRef,
//   ReactNode,
// } from 'react';
// import { useSession } from 'next-auth/react';
// import { io, Socket } from 'socket.io-client';
// import {
//   Room,
//   RoomEvent,
//   LocalParticipant,
//   RemoteParticipant,
//   RoomOptions,
//   VideoPresets,
// } from 'livekit-client';

// // ── Types ──────────────────────────────────────────────────────────────────

// export type CallType = 'AUDIO' | 'VIDEO';
// export type CallStatus =
//   | 'PENDING'
//   | 'CONNECTING'
//   | 'ONGOING'
//   | 'ON_HOLD'
//   | 'ENDED';

// export interface CallParticipantInfo {
//   userId: string;
//   name: string;
//   image?: string;
//   isMuted: boolean;
//   isVideoOn: boolean;
// }

// export interface ActiveCall {
//   id: string;
//   roomName: string;
//   type: CallType;
//   status: CallStatus;
//   isGroupCall: boolean;
//   participants: CallParticipantInfo[];
//   callerName?: string;
//   callerImage?: string;
//   startedAt?: Date;
// }

// export interface IncomingCall {
//   callId: string;
//   roomName: string;
//   type: CallType;
//   isGroup: boolean;
//   callerId: string;
//   callerName: string;
//   callerImage?: string;
// }

// interface CallContextValue {
//   currentCall: ActiveCall | null;
//   heldCalls: ActiveCall[];
//   incomingCall: IncomingCall | null;
//   isInCall: boolean;
//   room: Room | null;
//   localParticipant: LocalParticipant | null;
//   remoteParticipants: RemoteParticipant[];
//   isMuted: boolean;
//   isVideoOn: boolean;
//   isScreenSharing: boolean;
//   minimizedCalls: string[];
//   whiteboardElements: any[];
//   annotations: any[];
//   startCall: (
//     userId: string,
//     type: CallType,
//     userName: string,
//     userImage?: string
//   ) => Promise<void>;
//   joinCall: (
//     callId: string,
//     roomName: string,
//     type: CallType
//   ) => Promise<void>;
//   declineCall: (callId: string, callerId: string) => void;
//   endCall: (callId?: string) => Promise<void>;
//   holdCall: (callId: string) => void;
//   resumeCall: (callId: string) => Promise<void>;
//   mergeCalls: () => Promise<void>;
//   addParticipant: (
//     userId: string,
//     name: string,
//     image?: string
//   ) => Promise<void>;
//   toggleMute: () => void;
//   toggleVideo: () => void;
//   startScreenShare: () => Promise<void>;
//   stopScreenShare: () => Promise<void>;
//   minimizeCall: (callId: string) => void;
//   maximizeCall: (callId: string) => void;
//   updateWhiteboard: (elements: any[]) => void;
//   addAnnotation: (annotation: any) => void;
//   clearAnnotations: () => void;
// }

// // ── Context ────────────────────────────────────────────────────────────────

// const CallContext = createContext<CallContextValue | undefined>(undefined);

// export const useCall = () => {
//   const ctx = useContext(CallContext);
//   if (!ctx) throw new Error('useCall must be used within CallProvider');
//   return ctx;
// };

// // ── Room options ───────────────────────────────────────────────────────────

// const ROOM_OPTIONS: RoomOptions = {
//   adaptiveStream: true,
//   dynacast: true,
//   videoCaptureDefaults: {
//     resolution: VideoPresets.h720.resolution,
//   },
//   publishDefaults: {
//     simulcast: true,
//     videoSimulcastLayers: [
//       VideoPresets.h180,
//       VideoPresets.h360,
//     ],
//   },
// };

// // ── Provider ───────────────────────────────────────────────────────────────

// export const CallProvider = ({ children }: { children: ReactNode }) => {
//   const { data: session } = useSession();

//   const socketRef = useRef<Socket | null>(null);
//   const roomRef = useRef<Room | null>(null);
//   const currentCallRef = useRef<ActiveCall | null>(null);
//   const incomingCallRef = useRef<IncomingCall | null>(null);

//   const [room, setRoom] = useState<Room | null>(null);
//   const [localParticipant, setLocalParticipant] =
//     useState<LocalParticipant | null>(null);
//   const [remoteParticipants, setRemoteParticipants] = useState<
//     RemoteParticipant[]
//   >([]);

//   const [currentCall, setCurrentCall] = useState<ActiveCall | null>(null);
//   const [heldCalls, setHeldCalls] = useState<ActiveCall[]>([]);
//   const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
//   const [minimizedCalls, setMinimizedCalls] = useState<string[]>([]);

//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);

//   const [whiteboardElements, setWhiteboardElements] = useState<any[]>([]);
//   const [annotations, setAnnotations] = useState<any[]>([]);

//   // Keep refs in sync
//   currentCallRef.current = currentCall;
//   incomingCallRef.current = incomingCall;

//   // ── Socket init ──────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (!session?.user?.id) return;

//     // Ensure socket server is initialized
//     fetch('/api/socket').catch(() => {});

//     const sock = io({
//       path: '/api/socket',
//       query: { userId: session.user.id },
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 10,
//       reconnectionDelay: 1000,
//     });

//     sock.on('connect', () => {
//       console.log('[CallContext] Socket connected:', sock.id);
//     });

//     sock.on('connect_error', (err) => {
//       console.warn('[CallContext] Socket connect_error:', err.message);
//     });

//     sock.on('incoming-call', (data: IncomingCall) => {
//       console.log('[CallContext] incoming-call received:', data);
//       setIncomingCall(data);
//       // Auto-dismiss after 60s
//       setTimeout(() => {
//         setIncomingCall((prev) =>
//           prev?.callId === data.callId ? null : prev
//         );
//       }, 60_000);
//     });

//     sock.on('call-accepted', (data: { callId: string }) => {
//       console.log('[CallContext] call-accepted:', data);
//       setCurrentCall((prev) =>
//         prev?.id === data.callId ? { ...prev, status: 'ONGOING' } : prev
//       );
//     });

//     sock.on('call-declined', (data: { callId: string }) => {
//       console.log('[CallContext] call-declined:', data);
//       if (currentCallRef.current?.id === data.callId) {
//         cleanupCall(data.callId);
//       }
//     });

//     sock.on('call-ended', (data: { callId: string }) => {
//       console.log('[CallContext] call-ended:', data);
//       cleanupCall(data.callId);
//     });

//     sock.on('whiteboard-sync', (data: { elements: any[] }) => {
//       setWhiteboardElements(data.elements);
//     });

//     sock.on('annotation-sync', (data: { annotation: any }) => {
//       setAnnotations((prev) => [...prev, data.annotation]);
//     });

//     socketRef.current = sock;

//     return () => {
//       sock.close();
//       socketRef.current = null;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [session?.user?.id]);

//   // ── Helpers ──────────────────────────────────────────────────────────────

//   const cleanupCall = useCallback((callId: string) => {
//     if (roomRef.current) {
//       roomRef.current.disconnect();
//       roomRef.current = null;
//     }
//     setRoom(null);
//     setLocalParticipant(null);
//     setRemoteParticipants([]);
//     setIsScreenSharing(false);
//     setWhiteboardElements([]);
//     setAnnotations([]);

//     setCurrentCall((prev) => (prev?.id === callId ? null : prev));
//     setHeldCalls((prev) => prev.filter((c) => c.id !== callId));
//   }, []);

//   const getLiveKitToken = async (
//     roomName: string,
//     isCreator: boolean
//   ): Promise<string> => {
//     const res = await fetch('/api/livekit/token', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ roomName, isCreator }),
//     });
//     if (!res.ok) throw new Error('Failed to get LiveKit token');
//     const { token } = await res.json();
//     return token;
//   };

//   const connectToRoom = useCallback(
//     async (roomName: string, token: string, type: CallType) => {
//       // Disconnect any existing room first
//       if (roomRef.current) {
//         roomRef.current.disconnect();
//       }

//       const newRoom = new Room(ROOM_OPTIONS);

//       const updateParticipants = () => {
//         setRemoteParticipants(
//           Array.from(newRoom.remoteParticipants.values())
//         );
//       };

//       newRoom.on(RoomEvent.ParticipantConnected, updateParticipants);
//       newRoom.on(RoomEvent.ParticipantDisconnected, updateParticipants);
//       newRoom.on(RoomEvent.TrackSubscribed, updateParticipants);
//       newRoom.on(RoomEvent.TrackUnsubscribed, updateParticipants);
//       newRoom.on(RoomEvent.LocalTrackPublished, () => {
//         setLocalParticipant(newRoom.localParticipant);
//       });
//       newRoom.on(RoomEvent.LocalTrackUnpublished, () => {
//         setLocalParticipant(newRoom.localParticipant);
//       });
//       newRoom.on(RoomEvent.Disconnected, () => {
//         setRoom(null);
//         setLocalParticipant(null);
//         setRemoteParticipants([]);
//         roomRef.current = null;
//       });

//       const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
//       if (!livekitUrl) throw new Error('NEXT_PUBLIC_LIVEKIT_URL not set');

//       await newRoom.connect(livekitUrl, token);

//       // Enable media based on call type
//       if (type === 'VIDEO') {
//         await newRoom.localParticipant.enableCameraAndMicrophone();
//         setIsVideoOn(true);
//       } else {
//         await newRoom.localParticipant.setMicrophoneEnabled(true);
//         setIsVideoOn(false);
//       }

//       setIsMuted(false);
//       setRoom(newRoom);
//       setLocalParticipant(newRoom.localParticipant);
//       setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
//       roomRef.current = newRoom;

//       return newRoom;
//     },
//     []
//   );

//   // ── Actions ──────────────────────────────────────────────────────────────

//   const startCall = useCallback(
//     async (
//       userId: string,
//       type: CallType,
//       userName: string,
//       userImage?: string
//     ) => {
//       const sock = socketRef.current;
//       if (!sock || !session?.user?.id) {
//         throw new Error('Not connected');
//       }

//       // 1. Create call record
//       const res = await fetch('/api/calls/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           calleeId: userId,
//           type,
//           isGroupCall: false,
//         }),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         throw new Error(err.error || 'Failed to create call');
//       }

//       const callData = await res.json();
//       console.log('[CallContext] Call created:', callData.id, callData.roomName);

//       // 2. Get LiveKit token
//       const token = await getLiveKitToken(callData.roomName, true);

//       // 3. Set up local state immediately (so UI shows)
//       const newCall: ActiveCall = {
//         id: callData.id,
//         roomName: callData.roomName,
//         type,
//         status: 'PENDING',
//         isGroupCall: false,
//         participants: [
//           {
//             userId,
//             name: userName,
//             image: userImage,
//             isMuted: false,
//             isVideoOn: type === 'VIDEO',
//           },
//         ],
//         startedAt: new Date(),
//       };

//       setCurrentCall(newCall);
//       currentCallRef.current = newCall;

//       // 4. Join the call socket room
//       sock.emit('join-call-room', callData.id);

//       // 5. Emit initiate-call — this signals the callee
//       console.log('[CallContext] Emitting initiate-call to userId:', userId);
//       sock.emit('initiate-call', {
//         callId: callData.id,
//         roomName: callData.roomName,
//         calleeId: userId,
//         type,
//         isGroup: false,
//         callerName: session.user.name || 'Unknown',
//         callerImage: session.user.image || undefined,
//         participantIds: [userId],
//       });

//       // 6. Connect to LiveKit
//       await connectToRoom(callData.roomName, token, type);

//       setCurrentCall((prev) =>
//         prev?.id === callData.id ? { ...prev, status: 'ONGOING' } : prev
//       );
//     },
//     [session, connectToRoom]
//   );

//   const joinCall = useCallback(
//     async (callId: string, roomName: string, type: CallType) => {
//       const sock = socketRef.current;
//       if (!sock) return;

//       const caller = incomingCallRef.current?.callerId;

//       // 1. Notify caller
//       sock.emit('accept-call', { callId, callerId: caller });

//       // 2. Get token
//       const token = await getLiveKitToken(roomName, false);

//       // 3. Update DB
//       await fetch(`/api/calls/${callId}/join`, { method: 'POST' }).catch(
//         console.error
//       );

//       // 4. Set state
//       const newCall: ActiveCall = {
//         id: callId,
//         roomName,
//         type,
//         status: 'CONNECTING',
//         isGroupCall: incomingCallRef.current?.isGroup || false,
//         participants: [],
//       };

//       setCurrentCall(newCall);
//       setIncomingCall(null);
//       sock.emit('join-call-room', callId);

//       // 5. Connect to room
//       await connectToRoom(roomName, token, type);

//       setCurrentCall((prev) =>
//         prev?.id === callId ? { ...prev, status: 'ONGOING' } : prev
//       );
//     },
//     [connectToRoom]
//   );

//   const declineCall = useCallback((callId: string, callerId: string) => {
//     socketRef.current?.emit('decline-call', { callId, callerId });
//     setIncomingCall(null);
//     fetch(`/api/calls/${callId}/decline`, { method: 'POST' }).catch(
//       console.error
//     );
//   }, []);

//   const endCall = useCallback(
//     async (callId?: string) => {
//       const targetId = callId || currentCallRef.current?.id;
//       if (!targetId) return;

//       const call =
//         currentCallRef.current?.id === targetId
//           ? currentCallRef.current
//           : heldCalls.find((c) => c.id === targetId);

//       const participantIds = call?.participants.map((p) => p.userId) || [];

//       socketRef.current?.emit('end-call', {
//         callId: targetId,
//         participantIds,
//       });
//       socketRef.current?.emit('leave-call-room', targetId);

//       cleanupCall(targetId);

//       await fetch(`/api/calls/${targetId}/end`, { method: 'POST' }).catch(
//         console.error
//       );
//     },
//     [heldCalls, cleanupCall]
//   );

//   const holdCall = useCallback((callId: string) => {
//     if (!currentCallRef.current || currentCallRef.current.id !== callId)
//       return;

//     roomRef.current?.localParticipant.setMicrophoneEnabled(false);
//     roomRef.current?.localParticipant.setCameraEnabled(false);

//     const held = { ...currentCallRef.current, status: 'ON_HOLD' as CallStatus };
//     setHeldCalls((prev) => [...prev, held]);
//     setCurrentCall(null);
//   }, []);

//   const resumeCall = useCallback(
//     async (callId: string) => {
//       const call = heldCalls.find((c) => c.id === callId);
//       if (!call) return;

//       if (currentCallRef.current) holdCall(currentCallRef.current.id);

//       setHeldCalls((prev) => prev.filter((c) => c.id !== callId));
//       setCurrentCall({ ...call, status: 'ONGOING' });

//       roomRef.current?.localParticipant.setMicrophoneEnabled(true);
//       if (call.type === 'VIDEO') {
//         roomRef.current?.localParticipant.setCameraEnabled(true);
//       }
//     },
//     [heldCalls, holdCall]
//   );

//   const mergeCalls = useCallback(async () => {
//     if (!currentCallRef.current || heldCalls.length === 0) return;
//     const heldCall = heldCalls[0];

//     await fetch('/api/calls/merge', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         callId1: currentCallRef.current.id,
//         callId2: heldCall.id,
//       }),
//     }).catch(console.error);

//     setCurrentCall((prev) =>
//       prev
//         ? {
//             ...prev,
//             isGroupCall: true,
//             participants: [...prev.participants, ...heldCall.participants],
//           }
//         : null
//     );
//     setHeldCalls((prev) => prev.filter((c) => c.id !== heldCall.id));
//   }, [heldCalls]);

//   const addParticipant = useCallback(
//     async (userId: string, name: string, image?: string) => {
//       if (!currentCallRef.current || !socketRef.current || !session?.user)
//         return;

//       socketRef.current.emit('invite-to-call', {
//         callId: currentCallRef.current.id,
//         userId,
//         roomName: currentCallRef.current.roomName,
//         type: currentCallRef.current.type,
//         inviterName: session.user.name || 'Unknown',
//       });

//       await fetch(
//         `/api/calls/${currentCallRef.current.id}/invite`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ userId }),
//         }
//       ).catch(console.error);

//       setCurrentCall((prev) =>
//         prev
//           ? {
//               ...prev,
//               isGroupCall: true,
//               participants: [
//                 ...prev.participants,
//                 { userId, name, image, isMuted: false, isVideoOn: true },
//               ],
//             }
//           : null
//       );
//     },
//     [session]
//   );

//   const toggleMute = useCallback(() => {
//     if (!roomRef.current) return;
//     const enabled = roomRef.current.localParticipant.isMicrophoneEnabled;
//     roomRef.current.localParticipant.setMicrophoneEnabled(!enabled);
//     setIsMuted(enabled);
//   }, []);

//   const toggleVideo = useCallback(() => {
//     if (!roomRef.current) return;
//     const enabled = roomRef.current.localParticipant.isCameraEnabled;
//     roomRef.current.localParticipant.setCameraEnabled(!enabled);
//     setIsVideoOn(!enabled);
//   }, []);

//   const startScreenShare = useCallback(async () => {
//     if (!roomRef.current) return;
//     await roomRef.current.localParticipant.setScreenShareEnabled(true);
//     setIsScreenSharing(true);
//   }, []);

//   const stopScreenShare = useCallback(async () => {
//     if (!roomRef.current) return;
//     await roomRef.current.localParticipant.setScreenShareEnabled(false);
//     setIsScreenSharing(false);
//   }, []);

//   const minimizeCall = useCallback((callId: string) => {
//     setMinimizedCalls((prev) => [...new Set([...prev, callId])]);
//   }, []);

//   const maximizeCall = useCallback((callId: string) => {
//     setMinimizedCalls((prev) => prev.filter((id) => id !== callId));
//   }, []);

//   const updateWhiteboard = useCallback(
//     (elements: any[]) => {
//       setWhiteboardElements(elements);
//       if (currentCallRef.current) {
//         socketRef.current?.emit('whiteboard-update', {
//           callId: currentCallRef.current.id,
//           elements,
//         });
//       }
//     },
//     []
//   );

//   const addAnnotation = useCallback(
//     (annotation: any) => {
//       const ann = {
//         ...annotation,
//         id: Date.now(),
//         userId: session?.user?.id,
//       };
//       setAnnotations((prev) => [...prev, ann]);
//       if (currentCallRef.current) {
//         socketRef.current?.emit('annotation-update', {
//           callId: currentCallRef.current.id,
//           annotation: ann,
//         });
//       }
//     },
//     [session]
//   );

//   const clearAnnotations = useCallback(() => setAnnotations([]), []);

//   // ── Value ──────────────────────────────────────────────────────────────────

//   return (
//     <CallContext.Provider
//       value={{
//         currentCall,
//         heldCalls,
//         incomingCall,
//         isInCall: !!currentCall,
//         room,
//         localParticipant,
//         remoteParticipants,
//         isMuted,
//         isVideoOn,
//         isScreenSharing,
//         minimizedCalls,
//         whiteboardElements,
//         annotations,
//         startCall,
//         joinCall,
//         declineCall,
//         endCall,
//         holdCall,
//         resumeCall,
//         mergeCalls,
//         addParticipant,
//         toggleMute,
//         toggleVideo,
//         startScreenShare,
//         stopScreenShare,
//         minimizeCall,
//         maximizeCall,
//         updateWhiteboard,
//         addAnnotation,
//         clearAnnotations,
//       }}
//     >
//       {children}
//     </CallContext.Provider>
//   );
// };


// 'use client';
// import React, {
//   createContext, useContext, useState, useCallback,
//   useEffect, useRef, ReactNode,
// } from 'react';
// import { useSession } from 'next-auth/react';
// import { io, Socket } from 'socket.io-client';
// import {
//   Room, RoomEvent, LocalTrack, RemoteParticipant,
//   LocalParticipant, Track, RoomOptions, VideoPresets,
// } from 'livekit-client';

// // ── Types ──────────────────────────────────────────────────────────────────

// export type CallType = 'AUDIO' | 'VIDEO';
// export type CallStatus = 'PENDING' | 'CONNECTING' | 'ONGOING' | 'ON_HOLD' | 'ENDED';

// export interface CallParticipant {
//   userId: string;
//   name: string;
//   image?: string;
//   isMuted: boolean;
//   isVideoOn: boolean;
// }

// export interface ActiveCall {
//   id: string;
//   roomName: string;
//   type: CallType;
//   status: CallStatus;
//   isGroupCall: boolean;
//   participants: CallParticipant[];
//   callerName?: string;
//   callerImage?: string;
//   startedAt?: Date;
// }

// export interface IncomingCall {
//   callId: string;
//   roomName: string;
//   type: CallType;
//   isGroup: boolean;
//   callerId: string;
//   callerName: string;
//   callerImage?: string;
// }

// interface CallContextValue {
//   // State
//   currentCall: ActiveCall | null;
//   heldCalls: ActiveCall[];
//   incomingCall: IncomingCall | null;
//   isInCall: boolean;

//   // LiveKit
//   room: Room | null;
//   localParticipant: LocalParticipant | null;
//   remoteParticipants: RemoteParticipant[];

//   // Controls
//   isMuted: boolean;
//   isVideoOn: boolean;
//   isScreenSharing: boolean;
//   minimizedCalls: string[];

//   // Whiteboard / Annotations
//   whiteboardElements: any[];
//   annotations: any[];

//   // Actions
//   startCall: (userId: string, type: CallType, userName: string, userImage?: string) => Promise<void>;
//   joinCall: (callId: string, roomName: string, type: CallType) => Promise<void>;
//   declineCall: (callId: string, callerId: string) => void;
//   endCall: (callId?: string) => Promise<void>;
//   holdCall: (callId: string) => void;
//   resumeCall: (callId: string) => Promise<void>;
//   mergeCalls: () => Promise<void>;
//   addParticipant: (userId: string, name: string, image?: string) => Promise<void>;
//   toggleMute: () => void;
//   toggleVideo: () => void;
//   startScreenShare: () => Promise<void>;
//   stopScreenShare: () => Promise<void>;
//   minimizeCall: (callId: string) => void;
//   maximizeCall: (callId: string) => void;
//   updateWhiteboard: (elements: any[]) => void;
//   addAnnotation: (annotation: any) => void;
//   clearAnnotations: () => void;
// }

// // ── Context ────────────────────────────────────────────────────────────────

// const CallContext = createContext<CallContextValue | undefined>(undefined);

// export const useCall = () => {
//   const ctx = useContext(CallContext);
//   if (!ctx) throw new Error('useCall must be used within CallProvider');
//   return ctx;
// };

// // ── Provider ───────────────────────────────────────────────────────────────

// const ROOM_OPTIONS: RoomOptions = {
//   adaptiveStream: true,
//   dynacast: true,
//   videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
//   publishDefaults: { simulcast: true, videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360] },
// };

// export const CallProvider = ({ children }: { children: ReactNode }) => {
//   const { data: session } = useSession();

//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [room, setRoom] = useState<Room | null>(null);
//   const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
//   const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);

//   const [currentCall, setCurrentCall] = useState<ActiveCall | null>(null);
//   const [heldCalls, setHeldCalls] = useState<ActiveCall[]>([]);
//   const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
//   const [minimizedCalls, setMinimizedCalls] = useState<string[]>([]);

//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);

//   const [whiteboardElements, setWhiteboardElements] = useState<any[]>([]);
//   const [annotations, setAnnotations] = useState<any[]>([]);

//   const currentCallRef = useRef<ActiveCall | null>(null);
//   const roomRef = useRef<Room | null>(null);

//   currentCallRef.current = currentCall;
//   roomRef.current = room;

//   // ── Socket Initialization ──────────────────────────────────────────────

//   useEffect(() => {
//     if (!session?.user?.id) return;

//     const sock = io(process.env.NEXT_PUBLIC_APP_URL || '', {
//       query: { userId: session.user.id },
//       path: '/api/socket',
//       transports: ['websocket', 'polling'],
//     });

//     sock.on('connect', () => console.log('Socket connected'));

//     sock.on('incoming-call', (data: IncomingCall) => {
//       setIncomingCall(data);
//       // Auto-dismiss after 60s
//       setTimeout(() => {
//         setIncomingCall(prev => prev?.callId === data.callId ? null : prev);
//       }, 60_000);
//     });

//     sock.on('call-accepted', (data: { callId: string }) => {
//       setCurrentCall(prev => prev?.id === data.callId
//         ? { ...prev, status: 'ONGOING' } : prev);
//     });

//     sock.on('call-declined', (data: { callId: string }) => {
//       if (currentCallRef.current?.id === data.callId) {
//         handleCallEndedLocally(data.callId);
//       }
//     });

//     sock.on('call-ended', (data: { callId: string }) => {
//       handleCallEndedLocally(data.callId);
//     });

//     sock.on('whiteboard-sync', (data: { elements: any[] }) => {
//       setWhiteboardElements(data.elements);
//     });

//     sock.on('annotation-sync', (data: { annotation: any }) => {
//       setAnnotations(prev => [...prev, data.annotation]);
//     });

//     setSocket(sock);

//     return () => { sock.close(); };
//   }, [session?.user?.id]);

//   // ── LiveKit Room ───────────────────────────────────────────────────────

//   const connectToRoom = useCallback(async (
//     roomName: string, token: string, type: CallType
//   ) => {
//     const newRoom = new Room(ROOM_OPTIONS);

//     newRoom.on(RoomEvent.ParticipantConnected, () => {
//       setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
//     });
//     newRoom.on(RoomEvent.ParticipantDisconnected, () => {
//       setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
//     });
//     newRoom.on(RoomEvent.TrackSubscribed, () => {
//       setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
//     });
//     newRoom.on(RoomEvent.TrackUnsubscribed, () => {
//       setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
//     });
//     newRoom.on(RoomEvent.LocalTrackPublished, () => {
//       setLocalParticipant(newRoom.localParticipant);
//     });
//     newRoom.on(RoomEvent.Disconnected, () => {
//       setRoom(null);
//       setLocalParticipant(null);
//       setRemoteParticipants([]);
//     });

//     await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

//     if (type === 'VIDEO') {
//       await newRoom.localParticipant.enableCameraAndMicrophone();
//       setIsVideoOn(true);
//     } else {
//       await newRoom.localParticipant.setMicrophoneEnabled(true);
//       setIsVideoOn(false);
//     }

//     setIsMuted(false);
//     setRoom(newRoom);
//     setLocalParticipant(newRoom.localParticipant);
//     setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
//     roomRef.current = newRoom;

//     return newRoom;
//   }, []);

//   // ── Actions ────────────────────────────────────────────────────────────

//   const startCall = useCallback(async (
//     userId: string, type: CallType, userName: string, userImage?: string
//   ) => {
//     if (!socket || !session?.user) return;

//     try {
//       // Create call record
//       const res = await fetch('/api/calls/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ calleeId: userId, type, isGroupCall: false }),
//       });

//       if (!res.ok) throw new Error('Failed to create call');
//       const callData = await res.json();

//       // Get LiveKit token
//       const tokenRes = await fetch('/api/livekit/token', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ roomName: callData.roomName, isCreator: true }),
//       });

//       const { token } = await tokenRes.json();

//       const newCall: ActiveCall = {
//         id: callData.id,
//         roomName: callData.roomName,
//         type,
//         status: 'PENDING',
//         isGroupCall: false,
//         participants: [{ userId, name: userName, image: userImage, isMuted: false, isVideoOn: type === 'VIDEO' }],
//         startedAt: new Date(),
//       };

//       setCurrentCall(newCall);

//       // Notify callee
//       socket.emit('initiate-call', {
//         callId: callData.id,
//         roomName: callData.roomName,
//         calleeId: userId,
//         type,
//         isGroup: false,
//         callerName: session.user.name || 'Unknown',
//         callerImage: session.user.image || undefined,
//       });

//       socket.emit('join-call-room', callData.id);

//       // Connect to LiveKit
//       await connectToRoom(callData.roomName, token, type);
//       setCurrentCall(prev => prev ? { ...prev, status: 'ONGOING' } : null);

//     } catch (err) {
//       console.error('startCall error:', err);
//       throw err;
//     }
//   }, [socket, session, connectToRoom]);

//   const joinCall = useCallback(async (
//     callId: string, roomName: string, type: CallType
//   ) => {
//     if (!socket) return;

//     try {
//       // Notify caller
//       socket.emit('accept-call', {
//         callId,
//         callerId: incomingCall?.callerId,
//       });

//       // Get token
//       const tokenRes = await fetch('/api/livekit/token', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ roomName, isCreator: false }),
//       });

//       const { token } = await tokenRes.json();

//       // Update call DB
//       await fetch(`/api/calls/${callId}/join`, { method: 'POST' });

//       const newCall: ActiveCall = {
//         id: callId,
//         roomName,
//         type,
//         status: 'CONNECTING',
//         isGroupCall: incomingCall?.isGroup || false,
//         participants: [],
//       };

//       setCurrentCall(newCall);
//       setIncomingCall(null);
//       socket.emit('join-call-room', callId);

//       await connectToRoom(roomName, token, type);
//       setCurrentCall(prev => prev ? { ...prev, status: 'ONGOING' } : null);

//     } catch (err) {
//       console.error('joinCall error:', err);
//     }
//   }, [socket, incomingCall, connectToRoom]);

//   const declineCall = useCallback((callId: string, callerId: string) => {
//     socket?.emit('decline-call', { callId, callerId });
//     setIncomingCall(null);
//     fetch(`/api/calls/${callId}/decline`, { method: 'POST' }).catch(console.error);
//   }, [socket]);

//   const handleCallEndedLocally = useCallback((callId: string) => {
//     if (roomRef.current) {
//       roomRef.current.disconnect();
//       setRoom(null);
//       setLocalParticipant(null);
//       setRemoteParticipants([]);
//     }

//     setCurrentCall(prev => {
//       if (prev?.id === callId) return null;
//       return prev;
//     });
//     setHeldCalls(prev => prev.filter(c => c.id !== callId));
//     setIsScreenSharing(false);
//     setWhiteboardElements([]);
//     setAnnotations([]);
//   }, []);

//   const endCall = useCallback(async (callId?: string) => {
//     const targetId = callId || currentCallRef.current?.id;
//     if (!targetId) return;

//     const call = currentCallRef.current?.id === targetId
//       ? currentCallRef.current
//       : heldCalls.find(c => c.id === targetId);

//     const participantIds = call?.participants.map(p => p.userId) || [];
//     socket?.emit('end-call', { callId: targetId, participantIds });
//     socket?.emit('leave-call-room', targetId);

//     handleCallEndedLocally(targetId);
//     await fetch(`/api/calls/${targetId}/end`, { method: 'POST' }).catch(console.error);
//   }, [socket, heldCalls, handleCallEndedLocally]);

//   const holdCall = useCallback((callId: string) => {
//     if (!currentCallRef.current || currentCallRef.current.id !== callId) return;

//     roomRef.current?.localParticipant.setMicrophoneEnabled(false);
//     roomRef.current?.localParticipant.setCameraEnabled(false);

//     const call = { ...currentCallRef.current, status: 'ON_HOLD' as CallStatus };
//     setHeldCalls(prev => [...prev, call]);
//     setCurrentCall(null);
//   }, []);

//   const resumeCall = useCallback(async (callId: string) => {
//     const call = heldCalls.find(c => c.id === callId);
//     if (!call) return;

//     // Hold current if any
//     if (currentCallRef.current) {
//       holdCall(currentCallRef.current.id);
//     }

//     setHeldCalls(prev => prev.filter(c => c.id !== callId));
//     setCurrentCall({ ...call, status: 'ONGOING' });

//     roomRef.current?.localParticipant.setMicrophoneEnabled(true);
//     if (call.type === 'VIDEO') {
//       roomRef.current?.localParticipant.setCameraEnabled(true);
//     }
//   }, [heldCalls, holdCall]);

//   const mergeCalls = useCallback(async () => {
//     if (!currentCallRef.current || heldCalls.length === 0) return;
//     const heldCall = heldCalls[0];

//     await fetch('/api/calls/merge', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         callId1: currentCallRef.current.id,
//         callId2: heldCall.id,
//       }),
//     });

//     setCurrentCall(prev => prev ? {
//       ...prev,
//       isGroupCall: true,
//       participants: [...prev.participants, ...heldCall.participants],
//     } : null);
//     setHeldCalls(prev => prev.filter(c => c.id !== heldCall.id));
//   }, [heldCalls]);

//   const addParticipant = useCallback(async (
//     userId: string, name: string, image?: string
//   ) => {
//     if (!currentCallRef.current || !socket || !session?.user) return;

//     socket.emit('invite-to-call', {
//       callId: currentCallRef.current.id,
//       userId,
//       roomName: currentCallRef.current.roomName,
//       type: currentCallRef.current.type,
//       inviterName: session.user.name || 'Unknown',
//     });

//     await fetch(`/api/calls/${currentCallRef.current.id}/invite`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ userId }),
//     });

//     setCurrentCall(prev => prev ? {
//       ...prev,
//       isGroupCall: true,
//       participants: [...prev.participants, { userId, name, image, isMuted: false, isVideoOn: true }],
//     } : null);
//   }, [socket, session]);

//   const toggleMute = useCallback(() => {
//     if (!roomRef.current) return;
//     const enabled = roomRef.current.localParticipant.isMicrophoneEnabled;
//     roomRef.current.localParticipant.setMicrophoneEnabled(!enabled);
//     setIsMuted(enabled);
//   }, []);

//   const toggleVideo = useCallback(() => {
//     if (!roomRef.current) return;
//     const enabled = roomRef.current.localParticipant.isCameraEnabled;
//     roomRef.current.localParticipant.setCameraEnabled(!enabled);
//     setIsVideoOn(!enabled);
//   }, []);

//   const startScreenShare = useCallback(async () => {
//     if (!roomRef.current) return;
//     await roomRef.current.localParticipant.setScreenShareEnabled(true);
//     setIsScreenSharing(true);
//   }, []);

//   const stopScreenShare = useCallback(async () => {
//     if (!roomRef.current) return;
//     await roomRef.current.localParticipant.setScreenShareEnabled(false);
//     setIsScreenSharing(false);
//   }, []);

//   const minimizeCall = useCallback((callId: string) => {
//     setMinimizedCalls(prev => [...new Set([...prev, callId])]);
//   }, []);

//   const maximizeCall = useCallback((callId: string) => {
//     setMinimizedCalls(prev => prev.filter(id => id !== callId));
//   }, []);

//   const updateWhiteboard = useCallback((elements: any[]) => {
//     setWhiteboardElements(elements);
//     if (currentCallRef.current) {
//       socket?.emit('whiteboard-update', { callId: currentCallRef.current.id, elements });
//     }
//   }, [socket]);

//   const addAnnotation = useCallback((annotation: any) => {
//     const ann = { ...annotation, id: Date.now(), userId: session?.user?.id };
//     setAnnotations(prev => [...prev, ann]);
//     if (currentCallRef.current) {
//       socket?.emit('annotation-update', { callId: currentCallRef.current.id, annotation: ann });
//     }
//   }, [socket, session]);

//   const clearAnnotations = useCallback(() => setAnnotations([]), []);

//   // ── Value ──────────────────────────────────────────────────────────────

//   return (
//     <CallContext.Provider value={{
//       currentCall, heldCalls, incomingCall, isInCall: !!currentCall,
//       room, localParticipant, remoteParticipants,
//       isMuted, isVideoOn, isScreenSharing, minimizedCalls,
//       whiteboardElements, annotations,
//       startCall, joinCall, declineCall, endCall,
//       holdCall, resumeCall, mergeCalls, addParticipant,
//       toggleMute, toggleVideo, startScreenShare, stopScreenShare,
//       minimizeCall, maximizeCall,
//       updateWhiteboard, addAnnotation, clearAnnotations,
//     }}>
//       {children}
//     </CallContext.Provider>
//   );
// };

// import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
// import { useSession } from 'next-auth/react';
// import { io, Socket } from 'socket.io-client';
// import { Room, RoomEvent, VideoPresets, ScreenSharePresets, LocalTrack, RemoteParticipant } from 'livekit-client';

// interface CallParticipant {
//   id: string;
//   userId: string;
//   name: string;
//   image?: string;
//   isMuted: boolean;
//   isVideoOn: boolean;
//   isScreenSharing: boolean;
//   joinedAt: Date;
// }

// interface Call {
//   id: string;
//   roomName: string;
//   type: 'AUDIO' | 'VIDEO';
//   status: 'PENDING' | 'ONGOING' | 'ON_HOLD' | 'ENDED';
//   isGroupCall: boolean;
//   participants: CallParticipant[];
//   caller?: { id: string; name: string; image?: string };
//   startedAt?: Date;
//   isScreenSharing: boolean;
//   whiteboardData?: any;
// }

// interface CallContextType {
//   // Active calls (for simultaneous calls support)
//   activeCalls: Call[];
//   currentCall: Call | null;
//   heldCalls: Call[];
  
//   // States
//   isInCall: boolean;
//   isCalling: boolean;
//   incomingCall: any | null;
  
//   // Actions
//   startCall: (userId: string, type: 'AUDIO' | 'VIDEO', isGroup?: boolean) => Promise<void>;
//   joinCall: (callId: string) => Promise<void>;
//   endCall: (callId?: string) => Promise<void>;
//   holdCall: (callId: string) => Promise<void>;
//   resumeCall: (callId: string) => Promise<void>;
//   mergeCalls: (callId1: string, callId2: string) => Promise<void>;
//   addParticipant: (callId: string, userId: string) => Promise<void>;
  
//   // LiveKit Room
//   room: Room | null;
//   localTracks: LocalTrack[];
//   remoteParticipants: RemoteParticipant[];
  
//   // Controls
//   toggleMute: () => void;
//   toggleVideo: () => void;
//   startScreenShare: () => Promise<void>;
//   stopScreenShare: () => Promise<void>;
//   isMuted: boolean;
//   isVideoOn: boolean;
//   isScreenSharing: boolean;
  
//   // Whiteboard & Annotations
//   whiteboardData: any;
//   updateWhiteboard: (data: any) => void;
//   saveAnnotation: (annotation: any) => void;
  
//   // UI
//   minimizeCall: (callId: string) => void;
//   maximizeCall: (callId: string) => void;
//   minimizedCalls: string[];
// }

// const CallContext = createContext<CallContextType | undefined>(undefined);

// export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { data: session } = useSession();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [room, setRoom] = useState<Room | null>(null);
//   const [activeCalls, setActiveCalls] = useState<Call[]>([]);
//   const [currentCall, setCurrentCall] = useState<Call | null>(null);
//   const [heldCalls, setHeldCalls] = useState<Call[]>([]);
//   const [incomingCall, setIncomingCall] = useState<any | null>(null);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [minimizedCalls, setMinimizedCalls] = useState<string[]>([]);
//   const [whiteboardData, setWhiteboardData] = useState<any>(null);
//   const [handleCallEnded, setHandleCallEnded] = useState<any>(null);
//   const [updateCallParticipants, setUpdateCallParticipants] = useState<any>(null);
//   // Refs for current call state
//   const currentCallRef = useRef<Call | null>(null);
//   const roomRef = useRef<Room | null>(null);

//   // Initialize socket connection
//   useEffect(() => {
//     if (session?.user?.id) {
//       const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
//         query: { userId: session.user.id }
//       });
      
//       newSocket.on('incoming-call', (data) => {
//         setIncomingCall(data);
//       });
      
//       newSocket.on('call-accepted', async (data) => {
//         await connectToLiveKitRoom(data.roomName, data.token);
//       });
      
//       newSocket.on('call-ended', (data) => {
//         handleCallEnded(data.callId);
//       });
      
//       newSocket.on('participant-joined', (data) => {
//         updateCallParticipants(data.callId, data.participant);
//       });
      
//       setSocket(newSocket);
      
//       return () => {
//         newSocket.close();
//       };
//     }
//   }, [session?.user?.id]);
  
//   // In CallContext, add:
// const addParticipant = async (callId: string, userId: string) => {
//   socket?.emit('invite-to-call', { callId, userId });
  
//   await fetch(`/api/calls/${callId}/invite`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ userId }),
//   });
// };

//   const connectToLiveKitRoom = async (roomName: string, token: string) => {
//     try {
//       const newRoom = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//         videoCaptureDefaults: {
//           resolution: VideoPresets.h720.resolution,
//         },
//         screenShareCaptureDefaults: {
//           resolution: ScreenSharePresets.h1080fps30.resolution,
//         },
//       });

//       newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
//         console.log('Track subscribed:', track.kind, 'from', participant.identity);
//       });

//       newRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
//         console.log('Track unsubscribed:', track.kind, 'from', participant.identity);
//       });

//       newRoom.on(RoomEvent.Disconnected, () => {
//         console.log('Disconnected from room');
//         setCurrentCall(null);
//         setRoom(null);
//       });

//       await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || '', token);
//       await newRoom.enableCameraAndMicrophone();
      
//       setRoom(newRoom);
//       roomRef.current = newRoom;
      
//       // Update call status
//       if (currentCall) {
//         setCurrentCall({ ...currentCall, status: 'ONGOING' });
//       }
//     } catch (error) {
//       console.error('Failed to connect to LiveKit:', error);
//     }
//   };

//   const startCall = async (userId: string, type: 'AUDIO' | 'VIDEO', isGroup = false) => {
//     if (!socket) return;
    
//     try {
//       // Create call in database
//       const res = await fetch('/api/calls/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ calleeId: userId, type, isGroupCall: isGroup }),
//       });
      
//       const data = await res.json();
      
//       // Get LiveKit token
//       const tokenRes = await fetch('/api/livekit/token', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           roomName: data.roomName, 
//           isCreator: true 
//         }),
//       });
      
//       const { token } = await tokenRes.json();
      
//       // Emit socket event
//       socket.emit('initiate-call', {
//         callId: data.id,
//         roomName: data.roomName,
//         calleeId: userId,
//         type,
//         isGroup,
//       });
      
//       // Connect to LiveKit
//       await connectToLiveKitRoom(data.roomName, token);
      
//       const newCall: Call = {
//         id: data.id,
//         roomName: data.roomName,
//         type,
//         status: 'ONGOING',
//         isGroupCall: isGroup,
//         participants: [],
//         isScreenSharing: false,
//       };
      
//       setCurrentCall(newCall);
//       setActiveCalls(prev => [...prev, newCall]);
      
//     } catch (error) {
//       console.error('Start call error:', error);
//       throw error;
//     }
//   };

//   const joinCall = async (callId: string) => {
//     if (!socket) return;
    
//     try {
//       const res = await fetch(`/api/calls/${callId}/join`, { method: 'POST' });
//       const data = await res.json();
      
//       const tokenRes = await fetch('/api/livekit/token', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ roomName: data.roomName }),
//       });
      
//       const { token } = await tokenRes.json();
      
//       await connectToLiveKitRoom(data.roomName, token);
      
//       socket.emit('accept-call', { callId });
//       setIncomingCall(null);
//      console.log('Connecting with:', { 
//   roomName: data.roomName, 
//   url: process.env.NEXT_PUBLIC_LIVEKIT_URL 
// });
//     } catch (error) {
//       console.error('Join call error:', error);
//     }
//   };

//   const endCall = async (callId?: string) => {
//     const targetCallId = callId || currentCall?.id;
//     if (!targetCallId) return;
    
//     // Disconnect from LiveKit
//     if (room) {
//       room.disconnect();
//       setRoom(null);
//     }
    
//     // Notify server
//     await fetch(`/api/calls/${targetCallId}/end`, { method: 'POST' });
    
//     socket?.emit('end-call', { callId: targetCallId });
    
//     // Update local state
//     setActiveCalls(prev => prev.filter(c => c.id !== targetCallId));
//     setHeldCalls(prev => prev.filter(c => c.id !== targetCallId));
    
//     if (currentCall?.id === targetCallId) {
//       setCurrentCall(null);
//     }
//   };

//   const holdCall = async (callId: string) => {
//     // Mute all tracks
//     room?.localParticipant.setMicrophoneEnabled(false);
//     room?.localParticipant.setCameraEnabled(false);
    
//     setCurrentCall(prev => {
//       if (prev?.id === callId) {
//         setHeldCalls(h => [...h, { ...prev, status: 'ON_HOLD' }]);
//         return null;
//       }
//       return prev;
//     });
    
//     await fetch(`/api/calls/${callId}/hold`, { method: 'POST' });
//   };

//   const resumeCall = async (callId: string) => {
//     const call = heldCalls.find(c => c.id === callId);
//     if (!call) return;
    
//     // Re-enable tracks
//     room?.localParticipant.setMicrophoneEnabled(true);
//     if (call.type === 'VIDEO') {
//       room?.localParticipant.setCameraEnabled(true);
//     }
    
//     setHeldCalls(prev => prev.filter(c => c.id !== callId));
//     setCurrentCall(call);
//   };

//   const mergeCalls = async (callId1: string, callId2: string) => {
//     await fetch('/api/calls/merge', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ callId1, callId2 }),
//     });
//   };

//   const toggleMute = () => {
//     if (room) {
//       const enabled = room.localParticipant.isMicrophoneEnabled;
//       room.localParticipant.setMicrophoneEnabled(!enabled);
//       setIsMuted(enabled);
//     }
//   };

//   const toggleVideo = () => {
//     if (room) {
//       const enabled = room.localParticipant.isCameraEnabled;
//       room.localParticipant.setCameraEnabled(!enabled);
//       setIsVideoOn(!enabled);
//     }
//   };

//   const startScreenShare = async () => {
//     if (room) {
//       await room.localParticipant.setScreenShareEnabled(true);
//       setIsScreenSharing(true);
//     }
//   };

//   const stopScreenShare = async () => {
//     if (room) {
//       await room.localParticipant.setScreenShareEnabled(false);
//       setIsScreenSharing(false);
//     }
//   };

//   const updateWhiteboard = (data: any) => {
//     setWhiteboardData(data);
//     if (currentCall) {
//       socket?.emit('whiteboard-update', { callId: currentCall.id, data });
//     }
//   };

//   const saveAnnotation = (annotation: any) => {
//     if (currentCall) {
//       socket?.emit('annotation', { callId: currentCall.id, annotation });
//     }
//   };

//   const minimizeCall = (callId: string) => {
//     setMinimizedCalls(prev => [...prev, callId]);
//   };

//   const maximizeCall = (callId: string) => {
//     setMinimizedCalls(prev => prev.filter(id => id !== callId));
//   };
  

//   return (
//     <CallContext.Provider value={{
//       activeCalls,
//       currentCall,
//       heldCalls,
//       isInCall: !!currentCall,
//       isCalling: false,
//       incomingCall,
//       startCall,
//       joinCall,
//       endCall,
//       holdCall,
//       resumeCall,
//       mergeCalls,
//       addParticipant: async () => {},
//       room,
//       localTracks: [],
//       remoteParticipants: Array.from(room?.remoteParticipants.values() || []),
//       toggleMute,
//       toggleVideo,
//       startScreenShare,
//       stopScreenShare,
//       isMuted,
//       isVideoOn,
//       isScreenSharing,
//       whiteboardData,
//       updateWhiteboard,
//       saveAnnotation,
//       minimizeCall,
//       maximizeCall,
//       minimizedCalls,
//     }}>
//       {children}
//     </CallContext.Provider>
//   );
// };

// export const useCall = () => {
//   const context = useContext(CallContext);
//   if (!context) throw new Error('useCall must be used within CallProvider');
//   return context;
// };

// import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { io, Socket } from 'socket.io-client';
// import { Call, CallStatus, CallType } from '@prisma/client';
// import { toast } from 'sonner';

// interface CallContextType {
//   isInCall: boolean;
//   isCalling: boolean;
//   incomingCall: Call | null;
//   currentCall: Call | null;
//   callType: CallType;
//   isMuted: boolean;
//   isOnHold: boolean;
//   isRecording: boolean;
//   remoteStream: MediaStream | null;
//   localStream: MediaStream | null;
//   callDuration: number;
//   connectionState: string;
//   iceConnectionState: string;
//   startCall: (calleeId: string, type: CallType) => Promise<void>;
//   answerCall: () => Promise<void>;
//   declineCall: () => Promise<void>;
//   endCall: () => Promise<void>;
//   toggleMute: () => void;
//   toggleHold: () => void;
//   toggleRecording: () => void;
// }

// const CallContext = createContext<CallContextType | undefined>(undefined);

// // Simple beep sounds using Web Audio API
// const useAudio = () => {
//   const audioContext = useRef<AudioContext | null>(null);

//   const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
//     try {
//       if (!audioContext.current) {
//         audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
//       }
      
//       const ctx = audioContext.current;
//       const oscillator = ctx.createOscillator();
//       const gainNode = ctx.createGain();
      
//       oscillator.connect(gainNode);
//       gainNode.connect(ctx.destination);
      
//       oscillator.frequency.value = frequency;
//       oscillator.type = type;
      
//       gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
//       gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
//       oscillator.start(ctx.currentTime);
//       oscillator.stop(ctx.currentTime + duration);
//     } catch (e) {
//       console.error('Audio error:', e);
//     }
//   }, []);

//   const playRinging = useCallback(() => {
//     const ring = () => {
//       playTone(440, 0.5);
//       setTimeout(() => playTone(440, 0.5), 200);
//     };
//     ring();
//     return setInterval(ring, 4000);
//   }, [playTone]);

//   const playConnected = useCallback(() => {
//     playTone(523.25, 0.1);
//     setTimeout(() => playTone(659.25, 0.1), 100);
//     setTimeout(() => playTone(783.99, 0.2), 200);
//   }, [playTone]);

//   const playEnded = useCallback(() => {
//     playTone(392, 0.3);
//     setTimeout(() => playTone(196, 0.5), 300);
//   }, [playTone]);

//   const playIncoming = useCallback(() => {
//     const ring = () => {
//       playTone(880, 0.3);
//     };
//     ring();
//     return setInterval(ring, 1000);
//   }, [playTone]);

//   return { playRinging, playConnected, playEnded, playIncoming };
// };

// export function CallProvider({ children }: { children: React.ReactNode }) {
//   const { data: session } = useSession();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isInCall, setIsInCall] = useState(false);
//   const [isCalling, setIsCalling] = useState(false);
//   const [incomingCall, setIncomingCall] = useState<Call | null>(null);
//   const [currentCall, setCurrentCall] = useState<Call | null>(null);
//   const [callType, setCallType] = useState<CallType>('AUDIO');
//   const [isMuted, setIsMuted] = useState(false);
//   const [isOnHold, setIsOnHold] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [callDuration, setCallDuration] = useState(0);
//   const [connectionState, setConnectionState] = useState('new');
//   const [iceConnectionState, setIceConnectionState] = useState('new');

//   // CRITICAL: Use refs to track state for socket callbacks
//   const currentCallRef = useRef<Call | null>(null);
//   const isCallingRef = useRef(false);
//   const isInCallRef = useRef(false);
//   const socketRef = useRef<Socket | null>(null);
//   const peerConnection = useRef<RTCPeerConnection | null>(null);
//   const mediaRecorder = useRef<MediaRecorder | null>(null);
//   const recordedChunks = useRef<Blob[]>([]);
//   const ringingInterval = useRef<NodeJS.Timeout | null>(null);
//   const durationInterval = useRef<NodeJS.Timeout | null>(null);
  
//   // Perfect Negotiation pattern refs
//   const makingOffer = useRef(false);
//   const ignoreOffer = useRef(false);
//   const isSettingRemoteAnswerPending = useRef(false);
//   const polite = useRef(false); // Will be set based on role

//   const { playRinging, playConnected, playEnded, playIncoming } = useAudio();

//   // Keep refs in sync with state
//   useEffect(() => {
//     currentCallRef.current = currentCall;
//   }, [currentCall]);

//   useEffect(() => {
//     isCallingRef.current = isCalling;
//   }, [isCalling]);

//   useEffect(() => {
//     isInCallRef.current = isInCall;
//   }, [isInCall]);

//   // Get RTC configuration with TURN servers
//   const getRTCConfiguration = (): RTCConfiguration => ({
//     iceServers: [
//       { urls: 'stun:stun.l.google.com:19302' },
//       { urls: 'stun:stun1.l.google.com:19302' },
//       { urls: 'stun:stun2.l.google.com:19302' },
//       // Free TURN servers for cross-network calls
//       {
//         urls: 'turn:openrelay.metered.ca:80',
//         username: 'openrelayproject',
//         credential: 'openrelayproject'
//       },
//       {
//         urls: 'turn:openrelay.metered.ca:443',
//         username: 'openrelayproject',
//         credential: 'openrelayproject'
//       },
//       {
//         urls: 'turn:openrelay.metered.ca:443?transport=tcp',
//         username: 'openrelayproject',
//         credential: 'openrelayproject'
//       }
//     ],
//     iceCandidatePoolSize: 10,
//     bundlePolicy: 'max-bundle',
//     rtcpMuxPolicy: 'require',
//     iceTransportPolicy: 'all'
//   });

//   // Initialize socket
//   useEffect(() => {
//     if (!session?.user?.id) return;

//     let isSubscribed = true;

//     const initSocket = async () => {
//       try {
//         await fetch('/api/socket/io');
        
//         const newSocket = io({
//           path: '/api/socket/io',
//           transports: ['websocket', 'polling'],
//           reconnection: true,
//           reconnectionAttempts: 5,
//           reconnectionDelay: 1000,
//         });

//         if (!isSubscribed) return;

//         newSocket.on('connect', () => {
//           console.log('[CALL] Socket connected:', newSocket.id);
//           newSocket.emit('join_user', session.user.id);
          
//           // Re-join call room if in a call
//           if (currentCallRef.current?.id) {
//             newSocket.emit('join_call', currentCallRef.current.id);
//           }
//         });

//         newSocket.on('connect_error', (error) => {
//           console.error('[CALL] Socket connection error:', error);
//         });

//         // Listen for incoming calls
//         newSocket.on('incoming-call', (call: Call) => {
//           console.log('[CALL] Incoming call received:', call);
          
//           if (isInCallRef.current || isCallingRef.current) {
//             fetch(`/api/calls/${call.id}/decline`, { method: 'POST' });
//             return;
//           }

//           setIncomingCall(call);
          
//           if (ringingInterval.current) clearInterval(ringingInterval.current);
//           ringingInterval.current = playIncoming();
          
//           toast.info(`Incoming ${call.type.toLowerCase()} call from ${(call as any).caller?.name || 'Unknown'}`, {
//             duration: 30000,
//           });
//         });

//         // CRITICAL: Listen for call-answered - this triggers WebRTC init for caller
//         newSocket.on('call-answered', async (data: { call: Call }) => {
//           console.log('[CALL] ⭐ CALL ANSWERED EVENT RECEIVED:', data);
          
//           // Prevent duplicate handling
//           if (isInCallRef.current) {
//             console.log('[CALL] Already in call, ignoring duplicate call-answered');
//             return;
//           }
          
//           // Stop ringing immediately
//           if (ringingInterval.current) {
//             clearInterval(ringingInterval.current);
//             ringingInterval.current = null;
//           }
          
//           playConnected();
//           toast.success('Call answered! Establishing connection...');
          
//           // Update states
//           setIsCalling(false);
//           setIsInCall(true);
//           setCurrentCall(data.call);
          
//           // Update refs immediately
//           isCallingRef.current = false;
//           isInCallRef.current = true;
//           currentCallRef.current = data.call;
          
//           // Join call room
//           newSocket.emit('join_call', data.call.id);
          
//           // CRITICAL: Set role - caller is impolite (wins collisions)
//           polite.current = false;
          
//           // Initialize WebRTC as caller (impolite peer)
//           console.log('[WEBRTC] Initializing as CALLER (impolite)...');
//           await initWebRTC(newSocket, data.call.id, data.call.calleeId, false);
          
//           // Start duration timer
//           if (durationInterval.current) clearInterval(durationInterval.current);
//           durationInterval.current = setInterval(() => {
//             setCallDuration(prev => prev + 1);
//           }, 1000);
//         });

//         // Listen for call-declined
//         newSocket.on('call-declined', (data: { call: Call }) => {
//           console.log('[CALL] Call declined:', data);
          
//           if (ringingInterval.current) {
//             clearInterval(ringingInterval.current);
//             ringingInterval.current = null;
//           }
          
//           playEnded();
//           toast.error('Call declined');
//           cleanupCall();
//         });

//         // Listen for call-ended
//         newSocket.on('call-ended', (data: { call: Call }) => {
//           console.log('[CALL] Call ended by other party:', data);
          
//           if (ringingInterval.current) {
//             clearInterval(ringingInterval.current);
//             ringingInterval.current = null;
//           }
          
//           playEnded();
//           toast.info('Call ended by other party');
//           cleanupCall();
//         });

//         // WebRTC signaling - handle offer (callee receives this)
//         newSocket.on('call-offer', async (data: { callId: string; offer: any; from: string }) => {
//           console.log('[WEBRTC] Received offer from:', data.from);
//           await handleSignalingMessage(newSocket, data, 'offer');
//         });

//         // WebRTC signaling - handle answer (caller receives this)
//         newSocket.on('call-answer', async (data: { callId: string; answer: any; from: string }) => {
//           console.log('[WEBRTC] Received answer from:', data.from);
//           await handleSignalingMessage(newSocket, data, 'answer');
//         });

//         // WebRTC signaling - handle ICE candidates
//         newSocket.on('ice-candidate', async (data: { callId: string; candidate: any; from: string }) => {
//           console.log('[WEBRTC] Received ICE candidate from:', data.from);
//           await handleICECandidate(data.candidate);
//         });

//         socketRef.current = newSocket;
//         setSocket(newSocket);

//       } catch (error) {
//         console.error('[CALL] Socket init error:', error);
//       }
//     };

//     initSocket();

//     return () => {
//       isSubscribed = false;
//       cleanupCall();
//       if (socketRef.current) {
//         socketRef.current.close();
//       }
//     };
//   }, [session?.user?.id]);

//   const cleanupCall = useCallback(() => {
//     console.log('[CALL] Cleaning up call');
    
//     if (ringingInterval.current) {
//       clearInterval(ringingInterval.current);
//       ringingInterval.current = null;
//     }
    
//     if (durationInterval.current) {
//       clearInterval(durationInterval.current);
//       durationInterval.current = null;
//     }
    
//     setIsInCall(false);
//     setIsCalling(false);
//     setIncomingCall(null);
//     setCurrentCall(null);
//     setIsMuted(false);
//     setIsOnHold(false);
//     setIsRecording(false);
//     setRemoteStream(null);
//     setCallDuration(0);
//     setConnectionState('new');
//     setIceConnectionState('new');
    
//     // Reset refs
//     isInCallRef.current = false;
//     isCallingRef.current = false;
//     currentCallRef.current = null;
//     makingOffer.current = false;
//     ignoreOffer.current = false;
//     isSettingRemoteAnswerPending.current = false;
    
//     if (localStream) {
//       localStream.getTracks().forEach(track => {
//         track.stop();
//       });
//       setLocalStream(null);
//     }
    
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }

//     if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
//       mediaRecorder.current.stop();
//     }
//   }, [localStream]);

//   // PERFECT NEGOTIATION: Handle all signaling messages
//   const handleSignalingMessage = async (socket: Socket, data: any, type: 'offer' | 'answer') => {
//     try {
//       const pc = peerConnection.current;
//       if (!pc) {
//         console.error('[WEBRTC] No peer connection available');
//         return;
//       }

//       const description = data.offer || data.answer;
      
//       if (type === 'offer') {
//         // Handle offer collision (glare)
//         const readyForOffer = !makingOffer.current && 
//           (pc.signalingState === 'stable' || isSettingRemoteAnswerPending.current);
//         const offerCollision = !readyForOffer;

//         console.log('[WEBRTC] Offer collision check:', { 
//           readyForOffer, 
//           offerCollision, 
//           makingOffer: makingOffer.current,
//           signalingState: pc.signalingState,
//           polite: polite.current 
//         });

//         // If impolite and collision, ignore the offer
//         ignoreOffer.current = !polite.current && offerCollision;
//         if (ignoreOffer.current) {
//           console.log('[WEBRTC] Ignoring offer (impolite peer collision)');
//           return;
//         }

//         // Set remote description (this will rollback if needed for polite peer)
//         console.log('[WEBRTC] Setting remote description (offer)');
//         await pc.setRemoteDescription(new RTCSessionDescription(description));
//         console.log('[WEBRTC] Remote description set, creating answer');

//         // Create and send answer
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
        
//         console.log('[WEBRTC] Sending answer to:', data.from);
//         socket.emit('call-answer', {
//           callId: data.callId,
//           answer,
//           to: data.from,
//           from: session?.user?.id
//         });
        
//       } else if (type === 'answer') {
//         // Handle answer
//         isSettingRemoteAnswerPending.current = true;
        
//         try {
//           if (pc.signalingState === 'stable') {
//             console.log('[WEBRTC] Already stable, ignoring answer');
//             return;
//           }
          
//           console.log('[WEBRTC] Setting remote description (answer)');
//           await pc.setRemoteDescription(new RTCSessionDescription(description));
//           console.log('[WEBRTC] Answer set successfully');
          
//         } finally {
//           isSettingRemoteAnswerPending.current = false;
//         }
//       }
      
//     } catch (error) {
//       console.error('[WEBRTC] Error handling signaling message:', error);
//     }
//   };

//   // Handle ICE candidates
//   const handleICECandidate = async (candidate: any) => {
//     try {
//       const pc = peerConnection.current;
//       if (!pc) {
//         console.log('[WEBRTC] Queueing ICE candidate (no peer connection)');
//         return;
//       }
      
//       // Don't add candidates if we're ignoring the offer
//       if (ignoreOffer.current) {
//         console.log('[WEBRTC] Ignoring ICE candidate (offer ignored)');
//         return;
//       }
      
//       if (!pc.remoteDescription) {
//         console.log('[WEBRTC] Queueing ICE candidate (no remote description)');
//         return;
//       }
      
//       console.log('[WEBRTC] Adding ICE candidate');
//       await pc.addIceCandidate(new RTCIceCandidate(candidate));
//       console.log('[WEBRTC] ICE candidate added');
      
//     } catch (error) {
//       console.error('[WEBRTC] Error adding ICE candidate:', error);
//     }
//   };

//   // Initialize WebRTC with Perfect Negotiation
//   const initWebRTC = async (socket: Socket, callId: string, otherUserId: string, isCallee: boolean) => {
//     try {
//       console.log('[WEBRTC] === Initializing WebRTC ===', { isCallee, otherUserId });
      
//       // Get user media first
//       const constraints = {
//         video: callType === 'VIDEO',
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//           sampleRate: 44100,
//           channelCount: 2
//         }
//       };
      
//       console.log('[WEBRTC] Getting user media...');
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       console.log('[WEBRTC] Got local stream tracks:', stream.getTracks().map(t => `${t.kind}:${t.label}`));
      
//       setLocalStream(stream);

//       // Create peer connection
//       const pc = new RTCPeerConnection(getRTCConfiguration());
//       peerConnection.current = pc;

//       // Set up connection monitoring
//       pc.oniceconnectionstatechange = () => {
//         console.log('[WEBRTC] ICE connection state:', pc.iceConnectionState);
//         setIceConnectionState(pc.iceConnectionState);
        
//         if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
//           console.log('[WEBRTC] ✅ ICE connected!');
//           toast.success('Audio path established!');
//         }
        
//         if (pc.iceConnectionState === 'failed') {
//           console.error('[WEBRTC] ❌ ICE failed, restarting...');
//           pc.restartIce();
//         }
//       };

//       pc.onconnectionstatechange = () => {
//         console.log('[WEBRTC] Connection state:', pc.connectionState);
//         setConnectionState(pc.connectionState);
//       };

//       // CRITICAL: Handle incoming tracks with onunmute [^29^]
//       pc.ontrack = (event) => {
//         console.log('[WEBRTC] ⭐⭐⭐ ONTRACK FIRED! ⭐⭐⭐');
//         console.log('[WEBRTC] Track kind:', event.track.kind, 'streams:', event.streams.length);
        
//         const track = event.track;
//         const streams = event.streams;
        
//         // Use onunmute to know when track is receiving data [^29^]
//         track.onunmute = () => {
//           console.log('[WEBRTC] Track unmuted - receiving data!');
          
//           if (streams && streams[0]) {
//             console.log('[WEBRTC] Setting remote stream from onunmute');
//             setRemoteStream(streams[0]);
//           } else {
//             // Create stream if none provided
//             const newStream = new MediaStream([track]);
//             setRemoteStream(newStream);
//           }
//         };
        
//         // Also try immediately in case track is already unmuted
//         if (!track.muted && streams && streams[0]) {
//           console.log('[WEBRTC] Track already unmuted, setting stream immediately');
//           setRemoteStream(streams[0]);
//         }
//       };

//       // Handle ICE candidates
//       pc.onicecandidate = (event) => {
//         if (event.candidate && socket) {
//           console.log('[WEBRTC] Sending ICE candidate');
//           socket.emit('ice-candidate', {
//             callId,
//             candidate: event.candidate,
//             to: otherUserId,
//             from: session?.user?.id
//           });
//         }
//       };

//       // Add local tracks
//       console.log('[WEBRTC] Adding local tracks...');
//       stream.getTracks().forEach(track => {
//         console.log('[WEBRTC] Adding track:', track.kind);
//         pc.addTrack(track, stream);
//       });

//       // If caller (impolite), create offer when negotiation needed
//       if (!isCallee) {
//         console.log('[WEBRTC] Setting up onnegotiationneeded for caller');
        
//         pc.onnegotiationneeded = async () => {
//           try {
//             makingOffer.current = true;
//             console.log('[WEBRTC] onnegotiationneeded - creating offer');
            
//             await pc.setLocalDescription();
//             console.log('[WEBRTC] Local description set (offer)');
            
//             socket.emit('call-offer', {
//               callId,
//               offer: pc.localDescription,
//               to: otherUserId,
//               from: session?.user?.id
//             });
            
//           } catch (err) {
//             console.error('[WEBRTC] Error in onnegotiationneeded:', err);
//           } finally {
//             makingOffer.current = false;
//           }
//         };
//       }

//     } catch (error) {
//       console.error('[WEBRTC] Error:', error);
//       toast.error('Failed to access camera/microphone: ' + (error as Error).message);
//       endCall();
//     }
//   };

//   const startCall = async (calleeId: string, type: CallType) => {
//     try {
//       console.log('[CALL] Starting call to:', calleeId, 'type:', type);
//       setCallType(type);
//       setIsCalling(true);
//       isCallingRef.current = true;
//       setCallDuration(0);
      
//       if (ringingInterval.current) clearInterval(ringingInterval.current);
//       ringingInterval.current = playRinging();
      
//       toast.info('Calling...');

//       const response = await fetch('/api/calls', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ calleeId, type })
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || 'Failed to start call');
//       }

//       const call = await response.json();
//       console.log('[CALL] Call created:', call);
//       setCurrentCall(call);
//       currentCallRef.current = call;

//     } catch (error: any) {
//       console.error('[CALL] Start call error:', error);
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }
//       setIsCalling(false);
//       isCallingRef.current = false;
//       toast.error(error.message || 'Failed to start call');
//     }
//   };

//   const answerCall = async () => {
//     if (!incomingCall) return;

//     try {
//       console.log('[CALL] Answering call:', incomingCall.id);
      
//       // Prevent multiple answers
//       if (isInCallRef.current) {
//         console.log('[CALL] Already in call, ignoring duplicate answer');
//         return;
//       }
      
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }

//       const response = await fetch(`/api/calls/${incomingCall.id}/answer`, {
//         method: 'POST'
//       });

//       if (!response.ok) throw new Error('Failed to answer call');

//       const call = await response.json();
//       console.log('[CALL] Call answered (API):', call);
      
//       setIncomingCall(null);
//       setIsInCall(true);
//       setCurrentCall(call);
      
//       // Update refs
//       isInCallRef.current = true;
//       currentCallRef.current = call;
      
//       setCallType(call.type);

//       // Join call room
//       socketRef.current?.emit('join_call', call.id);
      
//       // CRITICAL: Set role - callee is polite (yields in collision)
//       polite.current = true;
      
//       // Initialize WebRTC as callee (polite peer)
//       console.log('[WEBRTC] Initializing as CALLEE (polite)...');
//       await initWebRTC(socketRef.current!, call.id, call.callerId, true);
      
//       // Emit call-answered to caller (only once!)
//       console.log('[CALL] Emitting call-answered to caller:', call.callerId);
//       socketRef.current?.emit('call-answered', {
//         call,
//         to: call.callerId
//       });
      
//       // Start duration timer
//       if (durationInterval.current) clearInterval(durationInterval.current);
//       durationInterval.current = setInterval(() => {
//         setCallDuration(prev => prev + 1);
//       }, 1000);

//     } catch (error) {
//       console.error('[CALL] Answer error:', error);
//       toast.error('Failed to answer call');
//       cleanupCall();
//     }
//   };

//   const declineCall = async () => {
//     if (!incomingCall) return;

//     try {
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }
      
//       await fetch(`/api/calls/${incomingCall.id}/decline`, {
//         method: 'POST'
//       });

//       socketRef.current?.emit('call-declined', {
//         call: incomingCall,
//         to: incomingCall.callerId
//       });

//       setIncomingCall(null);
//       toast.info('Call declined');

//     } catch (error) {
//       console.error('[CALL] Decline error:', error);
//     }
//   };

//   const endCall = async () => {
//     const callId = currentCallRef.current?.id || incomingCall?.id;
//     if (!callId) return;
    
//     try {
//       console.log('[CALL] Ending call:', callId);
      
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }

//       playEnded();

//       await fetch(`/api/calls/${callId}/end`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ reason: 'USER_HUNG_UP' })
//       });

//       const otherPartyId = currentCallRef.current?.callerId === session?.user?.id 
//         ? currentCallRef.current?.calleeId 
//         : currentCallRef.current?.callerId;
        
//       if (otherPartyId) {
//         socketRef.current?.emit('call-end', { callId, to: otherPartyId });
//       }
      
//       socketRef.current?.emit('leave_call', callId);

//     } catch (error) {
//       console.error('[CALL] End call error:', error);
//     } finally {
//       cleanupCall();
//     }
//   };

//   const toggleMute = () => {
//     if (localStream) {
//       const audioTrack = localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsMuted(!isMuted);
//         toast.info(isMuted ? 'Unmuted' : 'Muted');
//       }
//     }
//   };

//   const toggleHold = () => {
//     if (localStream) {
//       localStream.getTracks().forEach(track => {
//         track.enabled = isOnHold;
//       });
//       setIsOnHold(!isOnHold);
//       toast.info(isOnHold ? 'Call resumed' : 'Call on hold');
//     }
//   };

//   const toggleRecording = async () => {
//     if (!localStream || !currentCallRef.current) return;

//     if (isRecording) {
//       if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
//         mediaRecorder.current.stop();
//       }
//       setIsRecording(false);
//       toast.success('Recording stopped');
//     } else {
//       try {
//         const mixedStream = new MediaStream([
//           ...localStream.getTracks(),
//           ...(remoteStream?.getTracks() || [])
//         ]);

//         mediaRecorder.current = new MediaRecorder(mixedStream);
//         recordedChunks.current = [];

//         mediaRecorder.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             recordedChunks.current.push(event.data);
//           }
//         };

//         mediaRecorder.current.onstop = async () => {
//           const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
//           const formData = new FormData();
//           formData.append('file', blob, `call-${currentCallRef.current?.id}.webm`);
//           formData.append('callId', currentCallRef.current?.id || '');

//           try {
//             await fetch('/api/calls/recordings', {
//               method: 'POST',
//               body: formData
//             });
//           } catch (error) {
//             console.error('Failed to save recording:', error);
//           }
//         };

//         mediaRecorder.current.start();
//         setIsRecording(true);
//         toast.success('Recording started');

//       } catch (error) {
//         console.error('Failed to start recording:', error);
//         toast.error('Failed to start recording');
//       }
//     }
//   };

//   return (
//     <CallContext.Provider value={{
//       isInCall,
//       isCalling,
//       incomingCall,
//       currentCall,
//       callType,
//       isMuted,
//       isOnHold,
//       isRecording,
//       remoteStream,
//       localStream,
//       callDuration,
//       connectionState,
//       iceConnectionState,
//       startCall,
//       answerCall,
//       declineCall,
//       endCall,
//       toggleMute,
//       toggleHold,
//       toggleRecording
//     }}>
//       {children}
//     </CallContext.Provider>
//   );
// }

// export const useCall = () => {
//   const context = useContext(CallContext);
//   if (!context) throw new Error('useCall must be used within CallProvider');
//   return context;
// };


// import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { io, Socket } from 'socket.io-client';
// import { Call, CallStatus, CallType } from '@prisma/client';
// import { toast } from 'sonner';

// interface CallContextType {
//   isInCall: boolean;
//   isCalling: boolean;
//   incomingCall: Call | null;
//   currentCall: Call | null;
//   callType: CallType;
//   isMuted: boolean;
//   isOnHold: boolean;
//   isRecording: boolean;
//   remoteStream: MediaStream | null;
//   localStream: MediaStream | null;
//   callDuration: number;
//   startCall: (calleeId: string, type: CallType) => Promise<void>;
//   answerCall: () => Promise<void>;
//   declineCall: () => Promise<void>;
//   endCall: () => Promise<void>;
//   toggleMute: () => void;
//   toggleHold: () => void;
//   toggleRecording: () => void;
// }

// const CallContext = createContext<CallContextType | undefined>(undefined);

// // Simple beep sounds using Web Audio API
// const useAudio = () => {
//   const audioContext = useRef<AudioContext | null>(null);

//   const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
//     try {
//       if (!audioContext.current) {
//         audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
//       }
      
//       const ctx = audioContext.current;
//       const oscillator = ctx.createOscillator();
//       const gainNode = ctx.createGain();
      
//       oscillator.connect(gainNode);
//       gainNode.connect(ctx.destination);
      
//       oscillator.frequency.value = frequency;
//       oscillator.type = type;
      
//       gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
//       gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
//       oscillator.start(ctx.currentTime);
//       oscillator.stop(ctx.currentTime + duration);
//     } catch (e) {
//       console.error('Audio error:', e);
//     }
//   }, []);

//   const playRinging = useCallback(() => {
//     const ring = () => {
//       playTone(440, 0.5);
//       setTimeout(() => playTone(440, 0.5), 200);
//     };
//     ring();
//     return setInterval(ring, 4000);
//   }, [playTone]);

//   const playConnected = useCallback(() => {
//     playTone(523.25, 0.1);
//     setTimeout(() => playTone(659.25, 0.1), 100);
//     setTimeout(() => playTone(783.99, 0.2), 200);
//   }, [playTone]);

//   const playEnded = useCallback(() => {
//     playTone(392, 0.3);
//     setTimeout(() => playTone(196, 0.5), 300);
//   }, [playTone]);

//   const playIncoming = useCallback(() => {
//     const ring = () => {
//       playTone(880, 0.3);
//     };
//     ring();
//     return setInterval(ring, 1000);
//   }, [playTone]);

//   return { playRinging, playConnected, playEnded, playIncoming };
// };

// export function CallProvider({ children }: { children: React.ReactNode }) {
//   const { data: session } = useSession();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isInCall, setIsInCall] = useState(false);
//   const [isCalling, setIsCalling] = useState(false);
//   const [incomingCall, setIncomingCall] = useState<Call | null>(null);
//   const [currentCall, setCurrentCall] = useState<Call | null>(null);
//   const [callType, setCallType] = useState<CallType>('AUDIO');
//   const [isMuted, setIsMuted] = useState(false);
//   const [isOnHold, setIsOnHold] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [callDuration, setCallDuration] = useState(0);

//   // CRITICAL: Use refs to track state for socket callbacks
//   const currentCallRef = useRef<Call | null>(null);
//   const isCallingRef = useRef(false);
//   const isInCallRef = useRef(false);
//   const socketRef = useRef<Socket | null>(null);
//   const peerConnection = useRef<RTCPeerConnection | null>(null);
//   const mediaRecorder = useRef<MediaRecorder | null>(null);
//   const recordedChunks = useRef<Blob[]>([]);
//   const ringingInterval = useRef<NodeJS.Timeout | null>(null);
//   const durationInterval = useRef<NodeJS.Timeout | null>(null);

//   const { playRinging, playConnected, playEnded, playIncoming } = useAudio();

//   // Keep refs in sync with state
//   useEffect(() => {
//     currentCallRef.current = currentCall;
//   }, [currentCall]);

//   useEffect(() => {
//     isCallingRef.current = isCalling;
//   }, [isCalling]);

//   useEffect(() => {
//     isInCallRef.current = isInCall;
//   }, [isInCall]);

//   // Initialize socket
//   useEffect(() => {
//     if (!session?.user?.id) return;

//     let isSubscribed = true;

//     const initSocket = async () => {
//       try {
//         await fetch('/api/socket/io');
        
//         const newSocket = io({
//           path: '/api/socket/io',
//           transports: ['websocket', 'polling'],
//           reconnection: true,
//           reconnectionAttempts: 5,
//           reconnectionDelay: 1000,
//         });

//         if (!isSubscribed) return;

//         newSocket.on('connect', () => {
//           console.log('[CALL] Socket connected:', newSocket.id);
//           newSocket.emit('join_user', session.user.id);
          
//           // Re-join call room if in a call
//           if (currentCallRef.current?.id) {
//             newSocket.emit('join_call', currentCallRef.current.id);
//           }
//         });

//         newSocket.on('connect_error', (error) => {
//           console.error('[CALL] Socket connection error:', error);
//         });

//         // Listen for incoming calls
//         newSocket.on('incoming-call', (call: Call) => {
//           console.log('[CALL] Incoming call received:', call);
          
//           if (isInCallRef.current || isCallingRef.current) {
//             fetch(`/api/calls/${call.id}/decline`, { method: 'POST' });
//             return;
//           }

//           setIncomingCall(call);
          
//           if (ringingInterval.current) clearInterval(ringingInterval.current);
//           ringingInterval.current = playIncoming();
          
//           toast.info(`Incoming ${call.type.toLowerCase()} call from ${(call as any).caller?.name || 'Unknown'}`, {
//             duration: 30000,
//           });
//         });

//         // CRITICAL: Listen for call-answered with REFS instead of state
//         newSocket.on('call-answered', (data: { call: Call }) => {
//           console.log('[CALL] ⭐ CALL ANSWERED EVENT RECEIVED:', data);
//           console.log('[CALL] Ref values - currentCall:', currentCallRef.current?.id, 'isCalling:', isCallingRef.current);
          
//           // Stop ringing immediately
//           if (ringingInterval.current) {
//             clearInterval(ringingInterval.current);
//             ringingInterval.current = null;
//             console.log('[CALL] Ringing stopped');
//           }
          
//           playConnected();
//           toast.success('Call connected!');
          
//           // Update states
//           setIsCalling(false);
//           setIsInCall(true);
//           setCurrentCall(data.call);
          
//           // Update refs immediately
//           isCallingRef.current = false;
//           isInCallRef.current = true;
//           currentCallRef.current = data.call;
          
//           // Join call room
//           newSocket.emit('join_call', data.call.id);
//           console.log('[CALL] Joined call room:', data.call.id);
          
//           // Initialize WebRTC as caller
//           setTimeout(() => {
//             initiateWebRTC(data.call.id, true, data.call.calleeId);
//           }, 100);
          
//           // Start duration timer
//           if (durationInterval.current) clearInterval(durationInterval.current);
//           durationInterval.current = setInterval(() => {
//             setCallDuration(prev => prev + 1);
//           }, 1000);
//         });

//         // Listen for call-declined
//         newSocket.on('call-declined', (data: { call: Call }) => {
//           console.log('[CALL] Call declined:', data);
          
//           if (ringingInterval.current) {
//             clearInterval(ringingInterval.current);
//             ringingInterval.current = null;
//           }
          
//           playEnded();
//           toast.error('Call declined');
//           cleanupCall();
//         });

//         // Listen for call-ended
//         newSocket.on('call-ended', (data: { call: Call }) => {
//           console.log('[CALL] Call ended by other party:', data);
          
//           if (ringingInterval.current) {
//             clearInterval(ringingInterval.current);
//             ringingInterval.current = null;
//           }
          
//           playEnded();
//           toast.info('Call ended by other party');
//           cleanupCall();
//         });

//         // Listen for call-missed (timeout)
//         newSocket.on('call-missed', (data: { callId: string }) => {
//           console.log('[CALL] Call missed/timeout:', data);
//           if (ringingInterval.current) {
//             clearInterval(ringingInterval.current);
//             ringingInterval.current = null;
//           }
//           playEnded();
//           toast.error('No answer');
//           cleanupCall();
//         });

//         // WebRTC signaling
//         newSocket.on('call-offer', async (data: { callId: string; offer: any; from: string }) => {
//           console.log('[WEBRTC] Received offer:', data);
//           await handleOffer(data.callId, data.offer);
//         });

//         newSocket.on('call-answer', async (data: { callId: string; answer: any }) => {
//           console.log('[WEBRTC] Received answer:', data);
//           await handleAnswer(data.callId, data.answer);
//         });

//         newSocket.on('ice-candidate', async (data: { callId: string; candidate: any }) => {
//           console.log('[WEBRTC] Received ICE candidate');
//           await handleIceCandidate(data.candidate);
//         });

//         socketRef.current = newSocket;
//         setSocket(newSocket);

//       } catch (error) {
//         console.error('[CALL] Socket init error:', error);
//       }
//     };

//     initSocket();

//     return () => {
//       isSubscribed = false;
//       cleanupCall();
//       if (socketRef.current) {
//         socketRef.current.close();
//       }
//     };
//   }, [session?.user?.id]);

//   const cleanupCall = useCallback(() => {
//     console.log('[CALL] Cleaning up call');
    
//     if (ringingInterval.current) {
//       clearInterval(ringingInterval.current);
//       ringingInterval.current = null;
//     }
    
//     if (durationInterval.current) {
//       clearInterval(durationInterval.current);
//       durationInterval.current = null;
//     }
    
//     setIsInCall(false);
//     setIsCalling(false);
//     setIncomingCall(null);
//     setCurrentCall(null);
//     setIsMuted(false);
//     setIsOnHold(false);
//     setIsRecording(false);
//     setRemoteStream(null);
//     setCallDuration(0);
    
//     // Reset refs
//     isInCallRef.current = false;
//     isCallingRef.current = false;
//     currentCallRef.current = null;
    
//     if (localStream) {
//       localStream.getTracks().forEach(track => {
//         track.stop();
//       });
//       setLocalStream(null);
//     }
    
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }

//     if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
//       mediaRecorder.current.stop();
//     }
//   }, [localStream]);

//   const initiateWebRTC = async (callId: string, isCaller: boolean, otherUserId?: string) => {
//     try {
//       console.log('[WEBRTC] Initializing as', isCaller ? 'caller' : 'callee', 'for call:', callId);
      
//       const constraints = {
//         video: callType === 'VIDEO',
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         }
//       };
      
//       console.log('[WEBRTC] Getting user media...');
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       console.log('[WEBRTC] Got local stream:', stream.getTracks().map(t => t.kind));
      
//       setLocalStream(stream);

//       const pc = new RTCPeerConnection({
//         iceServers: [
//           { urls: 'stun:stun.l.google.com:19302' },
//           { urls: 'stun:stun1.l.google.com:19302' }
//         ]
//       });

//       stream.getTracks().forEach(track => {
//         console.log('[WEBRTC] Adding track to peer connection:', track.kind);
//         pc.addTrack(track, stream);
//       });

//       pc.ontrack = (event) => {
//         console.log('[WEBRTC] ⭐⭐⭐ RECEIVED REMOTE TRACK:', event.track.kind);
//         console.log('[WEBRTC] Remote streams:', event.streams);
//         if (event.streams && event.streams[0]) {
//           setRemoteStream(event.streams[0]);
//           toast.success('Audio connected!');
//         }
//       };

//       pc.onicecandidate = (event) => {
//         if (event.candidate && socketRef.current) {
//           console.log('[WEBRTC] Sending ICE candidate');
//           const targetUserId = isCaller ? otherUserId : currentCallRef.current?.callerId;
//           if (targetUserId) {
//             socketRef.current.emit('ice-candidate', {
//               callId,
//               candidate: event.candidate,
//               to: targetUserId
//             });
//           }
//         }
//       };

//       pc.onconnectionstatechange = () => {
//         console.log('[WEBRTC] Connection state:', pc.connectionState);
//         if (pc.connectionState === 'connected') {
//           toast.success('Call fully connected!');
//         }
//       };

//       peerConnection.current = pc;

//       if (isCaller && otherUserId) {
//         console.log('[WEBRTC] Creating offer...');
//         const offer = await pc.createOffer();
//         await pc.setLocalDescription(offer);
//         console.log('[WEBRTC] Sending offer to:', otherUserId);
        
//         socketRef.current?.emit('call-offer', {
//           callId,
//           offer,
//           to: otherUserId
//         });
//       }

//     } catch (error) {
//       console.error('[WEBRTC] Error:', error);
//       toast.error('Failed to access camera/microphone');
//       endCall();
//     }
//   };

//   const handleOffer = async (callId: string, offer: any) => {
//     try {
//       console.log('[WEBRTC] Handling offer for call:', callId);
      
//       const constraints = {
//         video: callType === 'VIDEO',
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         }
//       };
      
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       setLocalStream(stream);

//       const pc = new RTCPeerConnection({
//         iceServers: [
//           { urls: 'stun:stun.l.google.com:19302' },
//           { urls: 'stun:stun1.l.google.com:19302' }
//         ]
//       });

//       stream.getTracks().forEach(track => {
//         pc.addTrack(track, stream);
//       });

//       pc.ontrack = (event) => {
//         console.log('[WEBRTC] ⭐⭐⭐ RECEIVED REMOTE TRACK in handleOffer');
//         if (event.streams && event.streams[0]) {
//           setRemoteStream(event.streams[0]);
//           toast.success('Audio connected!');
//         }
//       };

//       pc.onicecandidate = (event) => {
//         if (event.candidate && socketRef.current && currentCallRef.current) {
//           socketRef.current.emit('ice-candidate', {
//             callId,
//             candidate: event.candidate,
//             to: currentCallRef.current.callerId
//           });
//         }
//       };

//       await pc.setRemoteDescription(offer);
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);

//       peerConnection.current = pc;

//       console.log('[WEBRTC] Sending answer to:', currentCallRef.current?.callerId);
//       socketRef.current?.emit('call-answer', {
//         callId,
//         answer,
//         to: currentCallRef.current?.callerId
//       });

//     } catch (error) {
//       console.error('[WEBRTC] Error handling offer:', error);
//       endCall();
//     }
//   };

//   const handleAnswer = async (callId: string, answer: any) => {
//     try {
//       console.log('[WEBRTC] Setting remote description (answer)');
//       await peerConnection.current?.setRemoteDescription(answer);
//       console.log('[WEBRTC] Remote description set successfully');
//     } catch (error) {
//       console.error('[WEBRTC] Error setting answer:', error);
//     }
//   };

//   const handleIceCandidate = async (candidate: any) => {
//     try {
//       console.log('[WEBRTC] Adding ICE candidate');
//       await peerConnection.current?.addIceCandidate(candidate);
//     } catch (error) {
//       console.error('[WEBRTC] Error adding ICE candidate:', error);
//     }
//   };

//   const startCall = async (calleeId: string, type: CallType) => {
//     try {
//       console.log('[CALL] Starting call to:', calleeId, 'type:', type);
//       setCallType(type);
//       setIsCalling(true);
//       isCallingRef.current = true;
//       setCallDuration(0);
      
//       if (ringingInterval.current) clearInterval(ringingInterval.current);
//       ringingInterval.current = playRinging();
      
//       toast.info('Calling...');

//       const response = await fetch('/api/calls', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ calleeId, type })
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || 'Failed to start call');
//       }

//       const call = await response.json();
//       console.log('[CALL] Call created:', call);
//       setCurrentCall(call);
//       currentCallRef.current = call;

//     } catch (error: any) {
//       console.error('[CALL] Start call error:', error);
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }
//       setIsCalling(false);
//       isCallingRef.current = false;
//       toast.error(error.message || 'Failed to start call');
//     }
//   };

//   const answerCall = async () => {
//     if (!incomingCall) return;

//     try {
//       console.log('[CALL] Answering call:', incomingCall.id);
      
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }

//       const response = await fetch(`/api/calls/${incomingCall.id}/answer`, {
//         method: 'POST'
//       });

//       if (!response.ok) throw new Error('Failed to answer call');

//       const call = await response.json();
//       console.log('[CALL] Call answered:', call);
      
//       setIncomingCall(null);
//       setIsInCall(true);
//       setCurrentCall(call);
      
//       // Update refs
//       isInCallRef.current = true;
//       currentCallRef.current = call;
      
//       setCallType(call.type);

//       socketRef.current?.emit('join_call', call.id);
      
//       if (durationInterval.current) clearInterval(durationInterval.current);
//       durationInterval.current = setInterval(() => {
//         setCallDuration(prev => prev + 1);
//       }, 1000);

//     } catch (error) {
//       console.error('[CALL] Answer error:', error);
//       toast.error('Failed to answer call');
//       cleanupCall();
//     }
//   };

//   const declineCall = async () => {
//     if (!incomingCall) return;

//     try {
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }
      
//       await fetch(`/api/calls/${incomingCall.id}/decline`, {
//         method: 'POST'
//       });

//       setIncomingCall(null);
//       toast.info('Call declined');

//     } catch (error) {
//       console.error('[CALL] Decline error:', error);
//     }
//   };

//   const endCall = async () => {
//     const callId = currentCallRef.current?.id || incomingCall?.id;
//     if (!callId) return;
    
//     try {
//       console.log('[CALL] Ending call:', callId);
      
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }

//       playEnded();

//       await fetch(`/api/calls/${callId}/end`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ reason: 'USER_HUNG_UP' })
//       });

//       const otherPartyId = currentCallRef.current?.callerId === session?.user?.id 
//         ? currentCallRef.current?.calleeId 
//         : currentCallRef.current?.callerId;
        
//       if (otherPartyId) {
//         socketRef.current?.emit('call-end', { callId, to: otherPartyId });
//       }
      
//       socketRef.current?.emit('leave_call', callId);

//     } catch (error) {
//       console.error('[CALL] End call error:', error);
//     } finally {
//       cleanupCall();
//     }
//   };

//   const toggleMute = () => {
//     if (localStream) {
//       const audioTrack = localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsMuted(!isMuted);
//         toast.info(isMuted ? 'Unmuted' : 'Muted');
//       }
//     }
//   };

//   const toggleHold = () => {
//     if (localStream) {
//       localStream.getTracks().forEach(track => {
//         track.enabled = isOnHold;
//       });
//       setIsOnHold(!isOnHold);
//       toast.info(isOnHold ? 'Call resumed' : 'Call on hold');
//     }
//   };

//   const toggleRecording = async () => {
//     if (!localStream || !currentCallRef.current) return;

//     if (isRecording) {
//       if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
//         mediaRecorder.current.stop();
//       }
//       setIsRecording(false);
//       toast.success('Recording stopped');
//     } else {
//       try {
//         const mixedStream = new MediaStream([
//           ...localStream.getTracks(),
//           ...(remoteStream?.getTracks() || [])
//         ]);

//         mediaRecorder.current = new MediaRecorder(mixedStream);
//         recordedChunks.current = [];

//         mediaRecorder.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             recordedChunks.current.push(event.data);
//           }
//         };

//         mediaRecorder.current.onstop = async () => {
//           const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
//           const formData = new FormData();
//           formData.append('file', blob, `call-${currentCallRef.current?.id}.webm`);
//           formData.append('callId', currentCallRef.current?.id || '');

//           try {
//             await fetch('/api/calls/recordings', {
//               method: 'POST',
//               body: formData
//             });
//           } catch (error) {
//             console.error('Failed to save recording:', error);
//           }
//         };

//         mediaRecorder.current.start();
//         setIsRecording(true);
//         toast.success('Recording started');

//       } catch (error) {
//         console.error('Failed to start recording:', error);
//         toast.error('Failed to start recording');
//       }
//     }
//   };

//   const formatDuration = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <CallContext.Provider value={{
//       isInCall,
//       isCalling,
//       incomingCall,
//       currentCall,
//       callType,
//       isMuted,
//       isOnHold,
//       isRecording,
//       remoteStream,
//       localStream,
//       callDuration,
//       startCall,
//       answerCall,
//       declineCall,
//       endCall,
//       toggleMute,
//       toggleHold,
//       toggleRecording
//     }}>
//       {children}
//     </CallContext.Provider>
//   );
// }

// export const useCall = () => {
//   const context = useContext(CallContext);
//   if (!context) throw new Error('useCall must be used within CallProvider');
//   return context;
// };

// import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { io, Socket } from 'socket.io-client';
// import { Call, CallStatus, CallType } from '@prisma/client';
// import { toast } from 'sonner';

// interface CallContextType {
//   isInCall: boolean;
//   isCalling: boolean;
//   incomingCall: Call | null;
//   currentCall: Call | null;
//   callType: CallType;
//   isMuted: boolean;
//   isOnHold: boolean;
//   isRecording: boolean;
//   remoteStream: MediaStream | null;
//   localStream: MediaStream | null;
//   callDuration: number;
//   startCall: (calleeId: string, type: CallType) => Promise<void>;
//   answerCall: () => Promise<void>;
//   declineCall: () => Promise<void>;
//   endCall: () => Promise<void>;
//   toggleMute: () => void;
//   toggleHold: () => void;
//   toggleRecording: () => void;
// }

// const CallContext = createContext<CallContextType | undefined>(undefined);

// // Simple beep sounds using Web Audio API (no external files needed)
// const useAudio = () => {
//   const audioContext = useRef<AudioContext | null>(null);

//   const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
//     try {
//       if (!audioContext.current) {
//         audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
//       }
      
//       const ctx = audioContext.current;
//       const oscillator = ctx.createOscillator();
//       const gainNode = ctx.createGain();
      
//       oscillator.connect(gainNode);
//       gainNode.connect(ctx.destination);
      
//       oscillator.frequency.value = frequency;
//       oscillator.type = type;
      
//       gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
//       gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
//       oscillator.start(ctx.currentTime);
//       oscillator.stop(ctx.currentTime + duration);
//     } catch (e) {
//       console.error('Audio error:', e);
//     }
//   }, []);

//   const playRinging = useCallback(() => {
//     // Ringing pattern: 1 second on, 3 seconds off
//     const ring = () => {
//       playTone(440, 0.5); // A4 note
//       setTimeout(() => playTone(440, 0.5), 200);
//     };
    
//     ring();
//     return setInterval(ring, 4000);
//   }, [playTone]);

//   const playConnected = useCallback(() => {
//     playTone(523.25, 0.1); // C5
//     setTimeout(() => playTone(659.25, 0.1), 100); // E5
//     setTimeout(() => playTone(783.99, 0.2), 200); // G5
//   }, [playTone]);

//   const playEnded = useCallback(() => {
//     playTone(392, 0.3); // G4
//     setTimeout(() => playTone(196, 0.5), 300); // G3
//   }, [playTone]);

//   const playIncoming = useCallback(() => {
//     // Fast ringing for incoming
//     const ring = () => {
//       playTone(880, 0.3);
//     };
//     ring();
//     return setInterval(ring, 1000);
//   }, [playTone]);

//   return { playRinging, playConnected, playEnded, playIncoming };
// };

// export function CallProvider({ children }: { children: React.ReactNode }) {
//   const { data: session } = useSession();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isInCall, setIsInCall] = useState(false);
//   const [isCalling, setIsCalling] = useState(false);
//   const [incomingCall, setIncomingCall] = useState<Call | null>(null);
//   const [currentCall, setCurrentCall] = useState<Call | null>(null);
//   const [callType, setCallType] = useState<CallType>('AUDIO');
//   const [isMuted, setIsMuted] = useState(false);
//   const [isOnHold, setIsOnHold] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [callDuration, setCallDuration] = useState(0);

//   const peerConnection = useRef<RTCPeerConnection | null>(null);
//   const mediaRecorder = useRef<MediaRecorder | null>(null);
//   const recordedChunks = useRef<Blob[]>([]);
//   const ringingInterval = useRef<NodeJS.Timeout | null>(null);
//   const durationInterval = useRef<NodeJS.Timeout | null>(null);
//   const socketRef = useRef<Socket | null>(null);

//   const { playRinging, playConnected, playEnded, playIncoming } = useAudio();

//   // Initialize socket with better reconnection
//   useEffect(() => {
//     if (!session?.user?.id) return;

//     let isSubscribed = true;

//     const initSocket = async () => {
//       try {
//         // Initialize socket endpoint
//         await fetch('/api/socket/io');
        
//         const newSocket = io({
//           path: '/api/socket/io',
//           transports: ['websocket', 'polling'],
//           reconnection: true,
//           reconnectionAttempts: 5,
//           reconnectionDelay: 1000,
//         });

//         if (!isSubscribed) return;

//         newSocket.on('connect', () => {
//           console.log('[CALL] Socket connected:', newSocket.id);
//           newSocket.emit('join_user', session.user.id);
          
//           // Re-join call room if in a call (for reconnection)
//           if (currentCall?.id) {
//             newSocket.emit('join_call', currentCall.id);
//           }
//         });

//         newSocket.on('connect_error', (error) => {
//           console.error('[CALL] Socket connection error:', error);
//         });

//         newSocket.on('disconnect', (reason) => {
//           console.log('[CALL] Socket disconnected:', reason);
//         });

//         // Listen for incoming calls
//         newSocket.on('incoming-call', (call: Call) => {
//           console.log('[CALL] Incoming call received:', call);
          
//           if (isInCall || isCalling) {
//             // Auto-decline if busy
//             fetch(`/api/calls/${call.id}/decline`, { method: 'POST' });
//             return;
//           }

//           setIncomingCall(call);
          
//           // Play incoming sound
//           if (ringingInterval.current) clearInterval(ringingInterval.current);
//           ringingInterval.current = playIncoming();
          
//           toast.info(`Incoming ${call.type.toLowerCase()} call from ${(call as any).caller?.name || 'Unknown'}`, {
//             duration: 30000,
//           });
//         });

//         // CRITICAL: Listen for call-answered (when callee picks up)
//         // newSocket.on('call-answered', (data: { call: Call }) => {
//         //   console.log('[CALL] Call answered by callee:', data);
          
//         //   if (ringingInterval.current) {
//         //     clearInterval(ringingInterval.current);
//         //     ringingInterval.current = null;
//         //   }
          
//         //   playConnected();
//         //   toast.success('Call connected!');
          
//         //   setIsCalling(false);
//         //   setIsInCall(true);
//         //   setCurrentCall(data.call);
          
//         //   // Join the call room
//         //   newSocket.emit('join_call', data.call.id);
          
//         //   // Initialize WebRTC as caller
//         //   initiateWebRTC(data.call.id, true, data.call.calleeId);
          
//         //   // Start duration timer
//         //   durationInterval.current = setInterval(() => {
//         //     setCallDuration(prev => prev + 1);
//         //   }, 1000);
//         // });

//         newSocket.on('call-answered', (data: { call: Call }) => {
//   console.log('[CALL] ⭐ CALL ANSWERED EVENT RECEIVED:', data);
//   console.log('[CALL] Current call ID:', currentCall?.id);
//   console.log('[CALL] Is calling:', isCalling);
  
//   // Stop ringing immediately
//   if (ringingInterval.current) {
//     clearInterval(ringingInterval.current);
//     ringingInterval.current = null;
//     console.log('[CALL] Ringing stopped');
//   }
  
//   playConnected();
//   toast.success('Call connected!');
  
//   // Update states
//   setIsCalling(false);
//   setIsInCall(true);
//   setCurrentCall(data.call);
  
//   // Join call room
//   newSocket.emit('join_call', data.call.id);
//   console.log('[CALL] Joined call room:', data.call.id);
  
//   // Initialize WebRTC as caller
//   setTimeout(() => {
//     initiateWebRTC(data.call.id, true, data.call.calleeId);
//   }, 100);
  
//   // Start duration timer
//   durationInterval.current = setInterval(() => {
//     setCallDuration(prev => prev + 1);
//   }, 1000);
// });  

// newSocket.on('call-missed', (data: { callId: string }) => {
//   console.log('[CALL] Call missed/timeout:', data);
//   if (ringingInterval.current) {
//     clearInterval(ringingInterval.current);
//     ringingInterval.current = null;
//   }
//   playEnded();
//   toast.error('No answer');
//   cleanupCall();
// });

//         // Listen for call-declined
//         newSocket.on('call-declined', (data: { call: Call }) => {
//           console.log('[CALL] Call declined:', data);
          
//           if (ringingInterval.current) {
//             clearInterval(ringingInterval.current);
//             ringingInterval.current = null;
//           }
          
//           playEnded();
//           toast.error('Call declined');
//           cleanupCall();
//         });

//         // Listen for call-ended
//         newSocket.on('call-ended', (data: { call: Call }) => {
//           console.log('[CALL] Call ended by other party:', data);
          
//           if (ringingInterval.current) {
//             clearInterval(ringingInterval.current);
//             ringingInterval.current = null;
//           }
          
//           playEnded();
//           toast.info('Call ended by other party');
//           cleanupCall();
//         });

//         // WebRTC signaling
//         newSocket.on('call-offer', async (data: { callId: string; offer: any; from: string }) => {
//           console.log('[WEBRTC] Received offer:', data);
//           await handleOffer(data.callId, data.offer);
//         });

//         newSocket.on('call-answer', async (data: { callId: string; answer: any }) => {
//           console.log('[WEBRTC] Received answer:', data);
//           await handleAnswer(data.callId, data.answer);
//         });

//         newSocket.on('ice-candidate', async (data: { callId: string; candidate: any }) => {
//           console.log('[WEBRTC] Received ICE candidate');
//           await handleIceCandidate(data.candidate);
//         });

//         socketRef.current = newSocket;
//         setSocket(newSocket);

//       } catch (error) {
//         console.error('[CALL] Socket init error:', error);
//       }
//     };

//     initSocket();

//     return () => {
//       isSubscribed = false;
//       if (ringingInterval.current) clearInterval(ringingInterval.current);
//       if (durationInterval.current) clearInterval(durationInterval.current);
//       if (socketRef.current) {
//         socketRef.current.close();
//       }
//     };
//   }, [session?.user?.id]);

//   // Cleanup function
//   const cleanupCall = useCallback(() => {
//     console.log('[CALL] Cleaning up call');
    
//     if (ringingInterval.current) {
//       clearInterval(ringingInterval.current);
//       ringingInterval.current = null;
//     }
    
//     if (durationInterval.current) {
//       clearInterval(durationInterval.current);
//       durationInterval.current = null;
//     }
    
//     setIsInCall(false);
//     setIsCalling(false);
//     setIncomingCall(null);
//     setCurrentCall(null);
//     setIsMuted(false);
//     setIsOnHold(false);
//     setIsRecording(false);
//     setRemoteStream(null);
//     setCallDuration(0);
    
//     if (localStream) {
//       localStream.getTracks().forEach(track => {
//         track.stop();
//         console.log('[CALL] Stopped track:', track.kind);
//       });
//       setLocalStream(null);
//     }
    
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }

//     if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
//       mediaRecorder.current.stop();
//     }
//   }, [localStream]);

//   // Initialize WebRTC
//   const initiateWebRTC = async (callId: string, isCaller: boolean, otherUserId?: string) => {
//     try {
//       console.log('[WEBRTC] Initializing as', isCaller ? 'caller' : 'callee');
      
//       const constraints = {
//         video: callType === 'VIDEO',
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         }
//       };
      
//       console.log('[WEBRTC] Getting user media with constraints:', constraints);
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       console.log('[WEBRTC] Got local stream:', stream.getTracks().map(t => t.kind));
      
//       setLocalStream(stream);

//       const pc = new RTCPeerConnection({
//         iceServers: [
//           { urls: 'stun:stun.l.google.com:19302' },
//           { urls: 'stun:stun1.l.google.com:19302' }
//         ]
//       });

//       // Add local tracks
//       stream.getTracks().forEach(track => {
//         console.log('[WEBRTC] Adding track to peer connection:', track.kind);
//         pc.addTrack(track, stream);
//       });

//       // Handle remote stream
//       pc.ontrack = (event) => {
//         console.log('[WEBRTC] Received remote track:', event.track.kind);
//         console.log('[WEBRTC] Remote streams:', event.streams);
//         if (event.streams && event.streams[0]) {
//           setRemoteStream(event.streams[0]);
//         }
//       };

//       // Handle ICE candidates
//       pc.onicecandidate = (event) => {
//         if (event.candidate && socketRef.current) {
//           console.log('[WEBRTC] Sending ICE candidate');
//           const targetUserId = isCaller ? otherUserId : incomingCall?.callerId;
//           if (targetUserId) {
//             socketRef.current.emit('ice-candidate', {
//               callId,
//               candidate: event.candidate,
//               to: targetUserId
//             });
//           }
//         }
//       };

//       pc.onconnectionstatechange = () => {
//         console.log('[WEBRTC] Connection state:', pc.connectionState);
//         if (pc.connectionState === 'connected') {
//           toast.success('Media connected!');
//         }
//       };

//       peerConnection.current = pc;

//       // If caller, create and send offer
//       if (isCaller && otherUserId) {
//         console.log('[WEBRTC] Creating offer');
//         const offer = await pc.createOffer();
//         await pc.setLocalDescription(offer);
//         console.log('[WEBRTC] Sending offer to:', otherUserId);
        
//         socketRef.current?.emit('call-offer', {
//           callId,
//           offer,
//           to: otherUserId
//         });
//       }

//     } catch (error) {
//       console.error('[WEBRTC] Error:', error);
//       toast.error('Failed to access camera/microphone. Please check permissions.');
//       endCall();
//     }
//   };

//   const handleOffer = async (callId: string, offer: any) => {
//     try {
//       console.log('[WEBRTC] Handling offer');
      
//       const constraints = {
//         video: callType === 'VIDEO',
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         }
//       };
      
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       setLocalStream(stream);

//       const pc = new RTCPeerConnection({
//         iceServers: [
//           { urls: 'stun:stun.l.google.com:19302' },
//           { urls: 'stun:stun1.l.google.com:19302' }
//         ]
//       });

//       stream.getTracks().forEach(track => {
//         pc.addTrack(track, stream);
//       });

//       pc.ontrack = (event) => {
//         console.log('[WEBRTC] Received remote track in handleOffer');
//         if (event.streams && event.streams[0]) {
//           setRemoteStream(event.streams[0]);
//         }
//       };

//       pc.onicecandidate = (event) => {
//         if (event.candidate && socketRef.current && incomingCall) {
//           socketRef.current.emit('ice-candidate', {
//             callId,
//             candidate: event.candidate,
//             to: incomingCall.callerId
//           });
//         }
//       };

//       await pc.setRemoteDescription(offer);
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);

//       peerConnection.current = pc;

//       console.log('[WEBRTC] Sending answer to:', incomingCall?.callerId);
//       socketRef.current?.emit('call-answer', {
//         callId,
//         answer,
//         to: incomingCall?.callerId
//       });

//     } catch (error) {
//       console.error('[WEBRTC] Error handling offer:', error);
//       endCall();
//     }
//   };

//   const handleAnswer = async (callId: string, answer: any) => {
//     try {
//       console.log('[WEBRTC] Setting remote description (answer)');
//       await peerConnection.current?.setRemoteDescription(answer);
//     } catch (error) {
//       console.error('[WEBRTC] Error setting answer:', error);
//     }
//   };

//   const handleIceCandidate = async (candidate: any) => {
//     try {
//       console.log('[WEBRTC] Adding ICE candidate');
//       await peerConnection.current?.addIceCandidate(candidate);
//     } catch (error) {
//       console.error('[WEBRTC] Error adding ICE candidate:', error);
//     }
//   };

//   const startCall = async (calleeId: string, type: CallType) => {
//     try {
//       console.log('[CALL] Starting call to:', calleeId, 'type:', type);
//       setCallType(type);
//       setIsCalling(true);
//       setCallDuration(0);
      
//       // Play ringing sound
//       if (ringingInterval.current) clearInterval(ringingInterval.current);
//       ringingInterval.current = playRinging();
      
//       toast.info('Calling...');

//       const response = await fetch('/api/calls', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ calleeId, type })
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || 'Failed to start call');
//       }

//       const call = await response.json();
//       console.log('[CALL] Call created:', call);
//       setCurrentCall(call);

//     } catch (error: any) {
//       console.error('[CALL] Start call error:', error);
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }
//       setIsCalling(false);
//       toast.error(error.message || 'Failed to start call');
//     }
//   };

//   const answerCall = async () => {
//     if (!incomingCall) return;

//     try {
//       console.log('[CALL] Answering call:', incomingCall.id);
      
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }

//       const response = await fetch(`/api/calls/${incomingCall.id}/answer`, {
//         method: 'POST'
//       });

//       if (!response.ok) throw new Error('Failed to answer call');

//       const call = await response.json();
//       console.log('[CALL] Call answered:', call);
      
//       setIncomingCall(null);
//       setIsInCall(true);
//       setCurrentCall(call);
//       setCallType(call.type);

//       // Join call room
//       socketRef.current?.emit('join_call', call.id);
      
//       // Start duration timer
//       durationInterval.current = setInterval(() => {
//         setCallDuration(prev => prev + 1);
//       }, 1000);

//     } catch (error) {
//       console.error('[CALL] Answer error:', error);
//       toast.error('Failed to answer call');
//       cleanupCall();
//     }
//   };

//   const declineCall = async () => {
//     if (!incomingCall) return;

//     try {
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }
      
//       await fetch(`/api/calls/${incomingCall.id}/decline`, {
//         method: 'POST'
//       });

//       setIncomingCall(null);
//       toast.info('Call declined');

//     } catch (error) {
//       console.error('[CALL] Decline error:', error);
//     }
//   };

//   const endCall = async () => {
//     const callId = currentCall?.id || incomingCall?.id;
//     if (!callId) return;
    
//     try {
//       console.log('[CALL] Ending call:', callId);
      
//       if (ringingInterval.current) {
//         clearInterval(ringingInterval.current);
//         ringingInterval.current = null;
//       }

//       playEnded();

//       await fetch(`/api/calls/${callId}/end`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ reason: 'USER_HUNG_UP' })
//       });

//       socketRef.current?.emit('leave_call', callId);

//     } catch (error) {
//       console.error('[CALL] End call error:', error);
//     } finally {
//       cleanupCall();
//     }
//   };

//   const toggleMute = () => {
//     if (localStream) {
//       const audioTrack = localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsMuted(!isMuted);
//         toast.info(isMuted ? 'Unmuted' : 'Muted');
//       }
//     }
//   };

//   const toggleHold = () => {
//     if (localStream) {
//       localStream.getTracks().forEach(track => {
//         track.enabled = isOnHold;
//       });
//       setIsOnHold(!isOnHold);
//       toast.info(isOnHold ? 'Call resumed' : 'Call on hold');
//     }
//   };

//   const toggleRecording = async () => {
//     if (!localStream || !currentCall) return;

//     if (isRecording) {
//       if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
//         mediaRecorder.current.stop();
//       }
//       setIsRecording(false);
//       toast.success('Recording stopped');
//     } else {
//       try {
//         const mixedStream = new MediaStream([
//           ...localStream.getTracks(),
//           ...(remoteStream?.getTracks() || [])
//         ]);

//         mediaRecorder.current = new MediaRecorder(mixedStream);
//         recordedChunks.current = [];

//         mediaRecorder.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             recordedChunks.current.push(event.data);
//           }
//         };

//         mediaRecorder.current.onstop = async () => {
//           const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
//           const formData = new FormData();
//           formData.append('file', blob, `call-${currentCall.id}.webm`);
//           formData.append('callId', currentCall.id);

//           try {
//             await fetch('/api/calls/recordings', {
//               method: 'POST',
//               body: formData
//             });
//           } catch (error) {
//             console.error('Failed to save recording:', error);
//           }
//         };

//         mediaRecorder.current.start();
//         setIsRecording(true);
//         toast.success('Recording started');

//       } catch (error) {
//         console.error('Failed to start recording:', error);
//         toast.error('Failed to start recording');
//       }
//     }
//   };

//   const formatDuration = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <CallContext.Provider value={{
//       isInCall,
//       isCalling,
//       incomingCall,
//       currentCall,
//       callType,
//       isMuted,
//       isOnHold,
//       isRecording,
//       remoteStream,
//       localStream,
//       callDuration,
//       startCall,
//       answerCall,
//       declineCall,
//       endCall,
//       toggleMute,
//       toggleHold,
//       toggleRecording
//     }}>
//       {children}
//     </CallContext.Provider>
//   );
// }

// export const useCall = () => {
//   const context = useContext(CallContext);
//   if (!context) throw new Error('useCall must be used within CallProvider');
//   return context;
// };

// import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { io, Socket } from 'socket.io-client';
// import { Call, CallStatus, CallType } from '@prisma/client';
// import { toast } from 'sonner';

// interface CallContextType {
//   isInCall: boolean;
//   isCalling: boolean;
//   incomingCall: Call | null;
//   currentCall: Call | null;
//   callType: CallType;
//   isMuted: boolean;
//   isOnHold: boolean;
//   isRecording: boolean;
//   remoteStream: MediaStream | null;
//   localStream: MediaStream | null;
//   startCall: (calleeId: string, type: CallType) => Promise<void>;
//   answerCall: () => Promise<void>;
//   declineCall: () => Promise<void>;
//   endCall: () => Promise<void>;
//   toggleMute: () => void;
//   toggleHold: () => void;
//   toggleRecording: () => void;
// }

// const CallContext = createContext<CallContextType | undefined>(undefined);

// // Audio sounds
// const RINGTONE_URL = '/sounds/ringtone.mp3';
// const CALLING_URL = '/sounds/calling.mp3';
// const CONNECTED_URL = '/sounds/connected.mp3';
// const ENDED_URL = '/sounds/ended.mp3';
// const INCOMING_URL = '/sounds/incoming.mp3';

// export function CallProvider({ children }: { children: React.ReactNode }) {
//   const { data: session } = useSession();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isInCall, setIsInCall] = useState(false);
//   const [isCalling, setIsCalling] = useState(false);
//   const [incomingCall, setIncomingCall] = useState<Call | null>(null);
//   const [currentCall, setCurrentCall] = useState<Call | null>(null);
//   const [callType, setCallType] = useState<CallType>('AUDIO');
//   const [isMuted, setIsMuted] = useState(false);
//   const [isOnHold, setIsOnHold] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);

//   const peerConnection = useRef<RTCPeerConnection | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const mediaRecorder = useRef<MediaRecorder | null>(null);
//   const recordedChunks = useRef<Blob[]>([]);

//   // Initialize socket
//   useEffect(() => {
//     if (!session?.user?.id) return;

//     const initSocket = async () => {
//       await fetch('/api/socket/io');
//       const newSocket = io({
//         path: '/api/socket/io',
//         transports: ['websocket', 'polling']
//       });

//       newSocket.on('connect', () => {
//         console.log('[CALL] Socket connected');
//         newSocket.emit('join_user', session.user.id);
//       });

//       // Listen for incoming calls
//       newSocket.on('incoming-call', (call: Call) => {
//         console.log('[CALL] Incoming call:', call);
//         setIncomingCall(call);
//         playSound(INCOMING_URL, true);
//         toast.info(`Incoming ${call.type.toLowerCase()} call from ${(call as any).caller?.name || 'Unknown'}`, {
//           duration: 30000,
//           action: {
//             label: 'Answer',
//             onClick: () => answerCall()
//           }
//         });
//       });

//       // Listen for call answered
//       newSocket.on('call-answered', (data: { call: Call }) => {
//         console.log('[CALL] Call answered:', data.call);
//         stopSound();
//         playSound(CONNECTED_URL);
//         toast.success('Call connected!');
//         setIsCalling(false);
//         setIsInCall(true);
//         setCurrentCall(data.call);
//         initiateWebRTC(data.call.id, false);
//       });

//       // Listen for call declined
//       newSocket.on('call-declined', (data: { call: Call }) => {
//         console.log('[CALL] Call declined:', data.call);
//         stopSound();
//         playSound(ENDED_URL);
//         toast.error('Call declined');
//         cleanupCall();
//       });

//       // Listen for call ended
//       newSocket.on('call-ended', (data: { call: Call }) => {
//         console.log('[CALL] Call ended:', data.call);
//         stopSound();
//         playSound(ENDED_URL);
//         toast.info('Call ended');
//         cleanupCall();
//       });

//       // WebRTC signaling
//       newSocket.on('call-offer', async (data: { callId: string; offer: any }) => {
//         await handleOffer(data.callId, data.offer);
//       });

//       newSocket.on('call-answer', async (data: { callId: string; answer: any }) => {
//         await handleAnswer(data.callId, data.answer);
//       });

//       newSocket.on('ice-candidate', async (data: { callId: string; candidate: any }) => {
//         await handleIceCandidate(data.candidate);
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.close();
//       };
//     };

//     initSocket();
//   }, [session?.user?.id]);

//   // Cleanup stuck calls on mount
//   useEffect(() => {
//     const cleanupStuckCalls = async () => {
//       try {
//         await fetch('/api/calls/cleanup', { method: 'POST' });
//       } catch (error) {
//         console.error('Failed to cleanup stuck calls:', error);
//       }
//     };
//     cleanupStuckCalls();
//   }, []);

//   const playSound = (url: string, loop: boolean = false) => {
//     stopSound();
//     audioRef.current = new Audio(url);
//     audioRef.current.loop = loop;
//     audioRef.current.play().catch(console.error);
//   };

//   const stopSound = () => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//       audioRef.current = null;
//     }
//   };

//   const cleanupCall = useCallback(() => {
//     stopSound();
//     setIsInCall(false);
//     setIsCalling(false);
//     setIncomingCall(null);
//     setCurrentCall(null);
//     setIsMuted(false);
//     setIsOnHold(false);
//     setIsRecording(false);
//     setRemoteStream(null);
    
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
//       setLocalStream(null);
//     }
    
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }

//     if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
//       mediaRecorder.current.stop();
//     }
//   }, [localStream]);

//   const initiateWebRTC = async (callId: string, isCaller: boolean) => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: callType === 'VIDEO',
//         audio: true
//       });
      
//       setLocalStream(stream);

//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//       });

//       stream.getTracks().forEach(track => {
//         pc.addTrack(track, stream);
//       });

//       pc.ontrack = (event) => {
//         setRemoteStream(event.streams[0]);
//       };

//       pc.onicecandidate = (event) => {
//         if (event.candidate && socket) {
//           const otherUserId = isCaller 
//             ? currentCall?.calleeId 
//             : incomingCall?.callerId;
          
//           socket.emit('ice-candidate', {
//             callId,
//             candidate: event.candidate,
//             to: otherUserId
//           });
//         }
//       };

//       peerConnection.current = pc;

//       if (isCaller) {
//         const offer = await pc.createOffer();
//         await pc.setLocalDescription(offer);
        
//         socket?.emit('call-offer', {
//           callId,
//           offer,
//           to: currentCall?.calleeId
//         });
//       }

//     } catch (error) {
//       console.error('WebRTC error:', error);
//       toast.error('Failed to access microphone/camera');
//       endCall();
//     }
//   };

//   const handleOffer = async (callId: string, offer: any) => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: callType === 'VIDEO',
//         audio: true
//       });
      
//       setLocalStream(stream);

//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//       });

//       stream.getTracks().forEach(track => {
//         pc.addTrack(track, stream);
//       });

//       pc.ontrack = (event) => {
//         setRemoteStream(event.streams[0]);
//       };

//       pc.onicecandidate = (event) => {
//         if (event.candidate && socket) {
//           socket.emit('ice-candidate', {
//             callId,
//             candidate: event.candidate,
//             to: incomingCall?.callerId
//           });
//         }
//       };

//       await pc.setRemoteDescription(offer);
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);

//       peerConnection.current = pc;

//       socket?.emit('call-answer', {
//         callId,
//         answer,
//         to: incomingCall?.callerId
//       });

//     } catch (error) {
//       console.error('Error handling offer:', error);
//       endCall();
//     }
//   };

//   const handleAnswer = async (callId: string, answer: any) => {
//     try {
//       await peerConnection.current?.setRemoteDescription(answer);
//     } catch (error) {
//       console.error('Error handling answer:', error);
//     }
//   };

//   const handleIceCandidate = async (candidate: any) => {
//     try {
//       await peerConnection.current?.addIceCandidate(candidate);
//     } catch (error) {
//       console.error('Error adding ICE candidate:', error);
//     }
//   };

//   const startCall = async (calleeId: string, type: CallType) => {
//     try {
//       setCallType(type);
//       setIsCalling(true);
      
//       playSound(CALLING_URL, true);
//       toast.info(`Calling...`);

//       const response = await fetch('/api/calls', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ calleeId, type })
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || 'Failed to start call');
//       }

//       const call = await response.json();
//       setCurrentCall(call);
      
//       // Emit socket event
//       socket?.emit('call-initiated', {
//         call,
//         to: calleeId
//       });

//     } catch (error: any) {
//       stopSound();
//       setIsCalling(false);
//       throw error;
//     }
//   };

//   const answerCall = async () => {
//     if (!incomingCall) return;

//     try {
//       stopSound();
      
//       const response = await fetch(`/api/calls/${incomingCall.id}/answer`, {
//         method: 'POST'
//       });

//       if (!response.ok) throw new Error('Failed to answer call');

//       const call = await response.json();
//       setIncomingCall(null);
//       setIsInCall(true);
//       setCurrentCall(call);
//       setCallType(call.type);

//       // Join call room
//       socket?.emit('join_call', call.id);
      
//       // Notify caller
//       socket?.emit('call-answered', {
//         call,
//         to: call.callerId
//       });

//       initiateWebRTC(call.id, false);

//     } catch (error) {
//       console.error('Error answering call:', error);
//       toast.error('Failed to answer call');
//     }
//   };

//   const declineCall = async () => {
//     if (!incomingCall) return;

//     try {
//       stopSound();
      
//       await fetch(`/api/calls/${incomingCall.id}/decline`, {
//         method: 'POST'
//       });

//       socket?.emit('call-declined', {
//         call: incomingCall,
//         to: incomingCall.callerId
//       });

//       setIncomingCall(null);
//       toast.info('Call declined');

//     } catch (error) {
//       console.error('Error declining call:', error);
//     }
//   };

//   const endCall = async () => {
//     if (!currentCall && !incomingCall) return;

//     const callId = currentCall?.id || incomingCall?.id;
    
//     try {
//       stopSound();
//       playSound(ENDED_URL);

//       await fetch(`/api/calls/${callId}/end`, {
//         method: 'POST',
//         body: JSON.stringify({ reason: 'USER_HUNG_UP' })
//       });

//       socket?.emit('call-end', {
//         callId,
//         to: currentCall?.calleeId || incomingCall?.callerId
//       });

//       socket?.emit('leave_call', callId);

//     } catch (error) {
//       console.error('Error ending call:', error);
//     } finally {
//       cleanupCall();
//     }
//   };

//   const toggleMute = () => {
//     if (localStream) {
//       const audioTrack = localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsMuted(!isMuted);
//         toast.info(isMuted ? 'Unmuted' : 'Muted');
//       }
//     }
//   };

//   const toggleHold = () => {
//     if (localStream) {
//       localStream.getTracks().forEach(track => {
//         track.enabled = isOnHold;
//       });
//       setIsOnHold(!isOnHold);
//       toast.info(isOnHold ? 'Call resumed' : 'Call on hold');
//     }
//   };

//   const toggleRecording = async () => {
//     if (!localStream || !currentCall) return;

//     if (isRecording) {
//       // Stop recording
//       if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
//         mediaRecorder.current.stop();
//       }
//       setIsRecording(false);
//       toast.success('Recording stopped');
//     } else {
//       // Start recording
//       try {
//         const mixedStream = new MediaStream([
//           ...localStream.getTracks(),
//           ...(remoteStream?.getTracks() || [])
//         ]);

//         mediaRecorder.current = new MediaRecorder(mixedStream);
//         recordedChunks.current = [];

//         mediaRecorder.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             recordedChunks.current.push(event.data);
//           }
//         };

//         mediaRecorder.current.onstop = async () => {
//           const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
//           const formData = new FormData();
//           formData.append('file', blob, `call-${currentCall.id}.webm`);
//           formData.append('callId', currentCall.id);

//           try {
//             await fetch('/api/calls/recordings', {
//               method: 'POST',
//               body: formData
//             });
//           } catch (error) {
//             console.error('Failed to save recording:', error);
//           }
//         };

//         mediaRecorder.current.start();
//         setIsRecording(true);
//         toast.success('Recording started');

//       } catch (error) {
//         console.error('Failed to start recording:', error);
//         toast.error('Failed to start recording');
//       }
//     }
//   };

//   return (
//     <CallContext.Provider value={{
//       isInCall,
//       isCalling,
//       incomingCall,
//       currentCall,
//       callType,
//       isMuted,
//       isOnHold,
//       isRecording,
//       remoteStream,
//       localStream,
//       startCall,
//       answerCall,
//       declineCall,
//       endCall,
//       toggleMute,
//       toggleHold,
//       toggleRecording
//     }}>
//       {children}
//     </CallContext.Provider>
//   );
// }

// export const useCall = () => {
//   const context = useContext(CallContext);
//   if (!context) throw new Error('useCall must be used within CallProvider');
//   return context;
// };

// // contexts/CallContext.tsx
// import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
// import { useSession } from 'next-auth/react';
// import { io, Socket } from 'socket.io-client';

// interface Call {
//   id: string;
//   callerId: string;
//   calleeId: string;
//   status: string;
//   type: 'AUDIO' | 'VIDEO';
//   startedAt?: string;
//   endedAt?: string;
//   duration?: number;
//   caller: {
//     id: string;
//     name: string;
//     email: string;
//     image?: string;
//   };
//   callee: {
//     id: string;
//     name: string;
//     email: string;
//     image?: string;
//   };
// }

// interface CallContextType {
//   currentCall: Call | null;
//   incomingCall: Call | null;
//   isInCall: boolean;
//   isCalling: boolean;
//   callDuration: number;
//   localStream: MediaStream | null;
//   remoteStream: MediaStream | null;
//   isMuted: boolean;
//   isVideoOff: boolean;
//   startCall: (calleeId: string, type?: 'AUDIO' | 'VIDEO') => Promise<void>;
//   answerCall: () => Promise<void>;
//   declineCall: () => Promise<void>;
//   endCall: () => Promise<void>;
//   toggleMute: () => void;
//   toggleVideo: () => void;
// }

// const CallContext = createContext<CallContextType | undefined>(undefined);

// export function CallProvider({ children }: { children: React.ReactNode }) {
//   const { data: session } = useSession();
//   const [currentCall, setCurrentCall] = useState<Call | null>(null);
//   const [incomingCall, setIncomingCall] = useState<Call | null>(null);
//   const [isInCall, setIsInCall] = useState(false);
//   const [isCalling, setIsCalling] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);

//   const socketRef = useRef<Socket | null>(null);
//   const peerRef = useRef<RTCPeerConnection | null>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);

//   // Initialize socket
//   useEffect(() => {
//     if (!session?.user?.id) return;

//     socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000');
//     socketRef.current.emit('authenticate', session.user.id);

//     // Listen for incoming calls
//     socketRef.current.on('incoming-call', (call: Call) => {
//       setIncomingCall(call);
//     });

//     // Listen for call answered
//     socketRef.current.on('call-answered', async ({ callId }: { callId: string }) => {
//       const pc = createPeerConnection(callId);
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       socketRef.current?.emit('webrtc-offer', { 
//         offer, 
//         to: currentCall?.calleeId 
//       });
//     });

//     // Listen for WebRTC offer
//     socketRef.current.on('webrtc-offer', async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
//       const pc = createPeerConnection(currentCall?.id || '');
//       await pc.setRemoteDescription(offer);
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       socketRef.current?.emit('webrtc-answer', { answer, to: from });
//     });

//     // Listen for WebRTC answer
//     socketRef.current.on('webrtc-answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
//       await peerRef.current?.setRemoteDescription(answer);
//     });

//     // Listen for ICE candidates
//     socketRef.current.on('webrtc-ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
//       await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
//     });

//     // Listen for call end
//     socketRef.current.on('call-ended', () => {
//       cleanupCall();
//     });

//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, [session?.user?.id]);

//   // Duration timer
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isInCall && currentCall?.startedAt) {
//       interval = setInterval(() => {
//         const start = new Date(currentCall.startedAt!).getTime();
//         setCallDuration(Math.floor((Date.now() - start) / 1000));
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isInCall, currentCall]);

//   const createPeerConnection = (callId: string) => {
//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//     });

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         const otherId = currentCall?.callerId === session?.user?.id 
//           ? currentCall?.calleeId 
//           : currentCall?.callerId;
//         socketRef.current?.emit('webrtc-ice-candidate', { 
//           candidate: event.candidate, 
//           to: otherId 
//         });
//       }
//     };

//     pc.ontrack = (event) => {
//       setRemoteStream(event.streams[0]);
//     };

//     // Add local stream tracks - FIXED HERE
//     const stream = localStreamRef.current;
//     if (stream) {
//       stream.getTracks().forEach(track => {
//         pc.addTrack(track, stream);
//       });
//     }

//     peerRef.current = pc;
//     return pc;
//   };

//   const getMediaStream = async (type: 'AUDIO' | 'VIDEO') => {
//     const constraints = {
//       audio: true,
//       video: type === 'VIDEO'
//     };
//     return await navigator.mediaDevices.getUserMedia(constraints);
//   };

//   const startCall = useCallback(async (calleeId: string, type: 'AUDIO' | 'VIDEO' = 'AUDIO') => {
//     try {
//       setIsCalling(true);
      
//       // Get local media
//       const stream = await getMediaStream(type);
//       localStreamRef.current = stream;
//       setLocalStream(stream);

//       const response = await fetch('/api/calls', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ calleeId, type }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || 'Failed to start call');
//       }

//       const call = await response.json();
//       setCurrentCall(call);

//       // Notify callee via socket
//       socketRef.current?.emit('call-user', { callId: call.id, calleeId });

//     } catch (error) {
//       console.error('Error starting call:', error);
//       setIsCalling(false);
//       localStreamRef.current?.getTracks().forEach(t => t.stop());
//       throw error;
//     }
//   }, []);

//   const answerCall = useCallback(async () => {
//     if (!incomingCall) return;

//     try {
//       // Get local media
//       const stream = await getMediaStream(incomingCall.type);
//       localStreamRef.current = stream;
//       setLocalStream(stream);

//       const response = await fetch(`/api/calls/${incomingCall.id}/answer`, {
//         method: 'POST',
//       });

//       if (!response.ok) throw new Error('Failed to answer call');

//       const call = await response.json();
//       setIncomingCall(null);
//       setCurrentCall(call);
//       setIsInCall(true);
//       setIsCalling(false);

//       // Notify caller
//       socketRef.current?.emit('answer-call', { 
//         callId: call.id, 
//         callerId: call.callerId 
//       });

//     } catch (error) {
//       console.error('Error answering call:', error);
//     }
//   }, [incomingCall]);

//   const declineCall = useCallback(async () => {
//     if (!incomingCall) return;

//     try {
//       await fetch(`/api/calls/${incomingCall.id}/decline`, { method: 'POST' });
//       socketRef.current?.emit('decline-call', { 
//         callId: incomingCall.id, 
//         callerId: incomingCall.callerId 
//       });
//       setIncomingCall(null);
//     } catch (error) {
//       console.error('Error declining call:', error);
//     }
//   }, [incomingCall]);

//   const cleanupCall = useCallback(() => {
//     localStreamRef.current?.getTracks().forEach(t => t.stop());
//     peerRef.current?.close();
//     setLocalStream(null);
//     setRemoteStream(null);
//     setCurrentCall(null);
//     setIsInCall(false);
//     setIsCalling(false);
//     setCallDuration(0);
//     setIsMuted(false);
//     setIsVideoOff(false);
//   }, []);

//   const endCall = useCallback(async () => {
//     if (!currentCall) return;

//     try {
//       await fetch(`/api/calls/${currentCall.id}/end`, {
//         method: 'POST',
//         body: JSON.stringify({ reason: 'USER_HUNG_UP' }),
//       });

//       const otherId = currentCall.callerId === session?.user?.id 
//         ? currentCall.calleeId 
//         : currentCall.callerId;
      
//       socketRef.current?.emit('end-call', { callId: currentCall.id, to: otherId });
//       cleanupCall();
//     } catch (error) {
//       console.error('Error ending call:', error);
//     }
//   }, [currentCall, session?.user?.id, cleanupCall]);

//   const toggleMute = useCallback(() => {
//     const audioTrack = localStreamRef.current?.getAudioTracks()[0];
//     if (audioTrack) {
//       audioTrack.enabled = !audioTrack.enabled;
//       setIsMuted(!audioTrack.enabled);
//     }
//   }, []);

//   const toggleVideo = useCallback(() => {
//     const videoTrack = localStreamRef.current?.getVideoTracks()[0];
//     if (videoTrack) {
//       videoTrack.enabled = !videoTrack.enabled;
//       setIsVideoOff(!videoTrack.enabled);
//     }
//   }, []);

//   return (
//     <CallContext.Provider
//       value={{
//         currentCall,
//         incomingCall,
//         isInCall,
//         isCalling,
//         callDuration,
//         localStream,
//         remoteStream,
//         isMuted,
//         isVideoOff,
//         startCall,
//         answerCall,
//         declineCall,
//         endCall,
//         toggleMute,
//         toggleVideo,
//       }}
//     >
//       {children}
//     </CallContext.Provider>
//   );
// }

// export const useCall = () => {
//   const context = useContext(CallContext);
//   if (!context) throw new Error('useCall must be used within CallProvider');
//   return context;
// };

// // contexts/CallContext.tsx
// import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
// import { useSession } from 'next-auth/react';
// import { io, Socket } from 'socket.io-client';

// interface Call {
//   id: string;
//   callerId: string;
//   calleeId: string;
//   status: string;
//   type: 'AUDIO' | 'VIDEO';
//   startedAt?: string;
//   endedAt?: string;
//   duration?: number;
//   caller: {
//     id: string;
//     name: string;
//     email: string;
//     image?: string;
//   };
//   callee: {
//     id: string;
//     name: string;
//     email: string;
//     image?: string;
//   };
// }

// interface CallContextType {
//   currentCall: Call | null;
//   incomingCall: Call | null;
//   isInCall: boolean;
//   isCalling: boolean;
//   callDuration: number;
//   localStream: MediaStream | null;
//   remoteStream: MediaStream | null;
//   isMuted: boolean;
//   isVideoOff: boolean;
//   connectionState: string;
//   startCall: (calleeId: string, type?: 'AUDIO' | 'VIDEO') => Promise<void>;
//   answerCall: () => Promise<void>;
//   declineCall: () => Promise<void>;
//   endCall: () => Promise<void>;
//   toggleMute: () => void;
//   toggleVideo: () => void;
// }

// const CallContext = createContext<CallContextType | undefined>(undefined);

// export function CallProvider({ children }: { children: React.ReactNode }) {
//   const { data: session } = useSession();
//   const [currentCall, setCurrentCall] = useState<Call | null>(null);
//   const [incomingCall, setIncomingCall] = useState<Call | null>(null);
//   const [isInCall, setIsInCall] = useState(false);
//   const [isCalling, setIsCalling] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [connectionState, setConnectionState] = useState('new');

//   const socketRef = useRef<Socket | null>(null);
//   const peerRef = useRef<RTCPeerConnection | null>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);

//   // Initialize socket connection
//   useEffect(() => {
//     if (!session?.user?.id) return;

//     console.log('🔌 Connecting to socket server...');
    
//     const socket = io('http://localhost:4000', {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 10,
//       reconnectionDelay: 1000,
//       timeout: 20000,
//     });

//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log('✅ Socket connected:', socket.id);
//       socket.emit('authenticate', session.user.id);
//     });

//     socket.on('connect_error', (error) => {
//       console.error('❌ Socket connection error:', error.message);
//     });

//     socket.on('disconnect', (reason) => {
//       console.log('🔌 Socket disconnected:', reason);
//     });

//     // Listen for incoming calls
//     socket.on('incoming-call', (call: Call) => {
//       console.log('📞 Incoming call received:', call);
//       setIncomingCall(call);
//     });

//     // Listen for call answered
//     socket.on('call-answered', async ({ callId }: { callId: string }) => {
//       console.log('✅ Call answered by callee, setting up WebRTC...');
      
//       setIsInCall(true);
//       setIsCalling(false);

//       if (!currentCall) return;

//       try {
//         // Create peer connection
//         const pc = createPeerConnection(currentCall);
        
//         // Create and send offer
//         const offer = await pc.createOffer();
//         await pc.setLocalDescription(offer);
        
//         console.log('📤 Sending WebRTC offer');
//         socket.emit('webrtc-offer', { 
//           offer, 
//           to: currentCall.calleeId,
//           callId 
//         });
//       } catch (error) {
//         console.error('❌ Error creating offer:', error);
//       }
//     });

//     // Listen for WebRTC offer (as callee)
//     socket.on('webrtc-offer', async ({ offer, from, callId }: { 
//       offer: RTCSessionDescriptionInit, 
//       from: string,
//       callId: string 
//     }) => {
//       console.log('📥 Received WebRTC offer from:', from);
      
//       if (!currentCall) {
//         console.error('❌ No current call when receiving offer');
//         return;
//       }

//       try {
//         const pc = createPeerConnection(currentCall);
//         await pc.setRemoteDescription(offer);
        
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
        
//         console.log('📤 Sending WebRTC answer');
//         socket.emit('webrtc-answer', { 
//           answer, 
//           to: from,
//           callId 
//         });
        
//         setIsInCall(true);
//         setIsCalling(false);
//       } catch (error) {
//         console.error('❌ Error handling offer:', error);
//       }
//     });

//     // Listen for WebRTC answer (as caller)
//     socket.on('webrtc-answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
//       console.log('📥 Received WebRTC answer');
//       try {
//         await peerRef.current?.setRemoteDescription(answer);
//       } catch (error) {
//         console.error('❌ Error setting remote description:', error);
//       }
//     });

//     // Listen for ICE candidates
//     socket.on('webrtc-ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
//       console.log('📥 Received ICE candidate');
//       try {
//         await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
//       } catch (e) {
//         console.error('❌ Error adding ICE candidate:', e);
//       }
//     });

//     // Listen for call end
//     socket.on('call-ended', () => {
//       console.log('📴 Call ended by other party');
//       cleanupCall();
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [session?.user?.id]);

//   // Duration timer
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isInCall && currentCall?.startedAt) {
//       interval = setInterval(() => {
//         const start = new Date(currentCall.startedAt!).getTime();
//         setCallDuration(Math.floor((Date.now() - start) / 1000));
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isInCall, currentCall]);

//   const createPeerConnection = (call: Call): RTCPeerConnection => {
//     console.log('🔧 Creating peer connection...');
    
//     const pc = new RTCPeerConnection({
//       iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' },
//         { urls: 'stun:stun1.l.google.com:19302' },
//         { urls: 'stun:stun2.l.google.com:19302' },
//       ],
//       iceCandidatePoolSize: 10
//     });

//     // Add local stream tracks
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach(track => {
//         console.log('➕ Adding local track:', track.kind);
//         pc.addTrack(track, localStreamRef.current!);
//       });
//     } else {
//       console.error('❌ No local stream when creating peer connection');
//     }

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         const otherId = call.callerId === session?.user?.id 
//           ? call.calleeId 
//           : call.callerId;
        
//         console.log('📤 Sending ICE candidate');
//         socketRef.current?.emit('webrtc-ice-candidate', { 
//           candidate: event.candidate, 
//           to: otherId 
//         });
//       }
//     };

//     pc.ontrack = (event) => {
//       console.log('📥 Received remote track:', event.track.kind);
//       setRemoteStream(event.streams[0]);
      
//       // Play audio automatically
//       if (event.track.kind === 'audio') {
//         const audio = new Audio();
//         audio.srcObject = event.streams[0];
//         audio.play().catch(e => console.log('Audio play failed:', e));
//       }
//     };

//     pc.onconnectionstatechange = () => {
//       console.log('🔌 Connection state:', pc.connectionState);
//       setConnectionState(pc.connectionState);
      
//       if (pc.connectionState === 'connected') {
//         console.log('✅ WebRTC connected! Audio should flow now.');
//       }
      
//       if (pc.connectionState === 'failed') {
//         console.error('❌ WebRTC connection failed');
//       }
//     };

//     pc.oniceconnectionstatechange = () => {
//       console.log('🧊 ICE connection state:', pc.iceConnectionState);
//     };

//     peerRef.current = pc;
//     return pc;
//   };

//   const getMediaStream = async (type: 'AUDIO' | 'VIDEO') => {
//     const constraints = {
//       audio: {
//         echoCancellation: true,
//         noiseSuppression: true,
//         autoGainControl: true
//       },
//       video: type === 'VIDEO'
//     };
    
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       console.log('🎤 Got media stream with tracks:', stream.getTracks().map(t => t.kind));
//       return stream;
//     } catch (error) {
//       console.error('❌ Error getting media:', error);
//       throw error;
//     }
//   };

//   const startCall = useCallback(async (calleeId: string, type: 'AUDIO' | 'VIDEO' = 'AUDIO') => {
//     try {
//       console.log('📞 Starting call to:', calleeId);
//       setIsCalling(true);
      
//       // Get local media FIRST (before API call)
//       const stream = await getMediaStream(type);
//       localStreamRef.current = stream;
//       setLocalStream(stream);

//       const response = await fetch('/api/calls', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ calleeId, type }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || 'Failed to start call');
//       }

//       const call = await response.json();
//       console.log('✅ Call created:', call.id);
//       setCurrentCall(call);

//       // Notify callee via socket
//       console.log('📤 Emitting call-user to:', calleeId);
//       socketRef.current?.emit('call-user', { callId: call.id, calleeId });

//     } catch (error) {
//       console.error('❌ Error starting call:', error);
//       setIsCalling(false);
//       localStreamRef.current?.getTracks().forEach(t => t.stop());
//       throw error;
//     }
//   }, []);

//   const answerCall = useCallback(async () => {
//     if (!incomingCall) return;

//     try {
//       console.log('✅ Answering call:', incomingCall.id);
      
//       // Get local media FIRST (critical!)
//       const stream = await getMediaStream(incomingCall.type);
//       localStreamRef.current = stream;
//       setLocalStream(stream);

//       const response = await fetch(`/api/calls/${incomingCall.id}/answer`, {
//         method: 'POST',
//       });

//       if (!response.ok) throw new Error('Failed to answer call');

//       const call = await response.json();
//       setIncomingCall(null);
//       setCurrentCall(call);

//       // Notify caller that we answered
//       console.log('📤 Emitting answer-call to:', call.callerId);
//       socketRef.current?.emit('answer-call', { 
//         callId: call.id, 
//         callerId: call.callerId 
//       });

//     } catch (error) {
//       console.error('❌ Error answering call:', error);
//     }
//   }, [incomingCall]);

//   const declineCall = useCallback(async () => {
//     if (!incomingCall) return;

//     try {
//       await fetch(`/api/calls/${incomingCall.id}/decline`, { method: 'POST' });
//       socketRef.current?.emit('decline-call', { 
//         callId: incomingCall.id, 
//         callerId: incomingCall.callerId 
//       });
//       setIncomingCall(null);
//     } catch (error) {
//       console.error('Error declining call:', error);
//     }
//   }, [incomingCall]);

//   const cleanupCall = useCallback(() => {
//     console.log('🧹 Cleaning up call...');
//     localStreamRef.current?.getTracks().forEach(t => t.stop());
//     peerRef.current?.close();
//     setLocalStream(null);
//     setRemoteStream(null);
//     setCurrentCall(null);
//     setIsInCall(false);
//     setIsCalling(false);
//     setCallDuration(0);
//     setIsMuted(false);
//     setIsVideoOff(false);
//     setConnectionState('new');
//   }, []);

//   const endCall = useCallback(async () => {
//     if (!currentCall) return;

//     try {
//       console.log('📴 Ending call:', currentCall.id);
      
//       await fetch(`/api/calls/${currentCall.id}/end`, {
//         method: 'POST',
//         body: JSON.stringify({ reason: 'USER_HUNG_UP' }),
//       });

//       const otherId = currentCall.callerId === session?.user?.id 
//         ? currentCall.calleeId 
//         : currentCall.callerId;
      
//       socketRef.current?.emit('end-call', { 
//         callId: currentCall.id, 
//         to: otherId 
//       });
      
//       cleanupCall();
//     } catch (error) {
//       console.error('Error ending call:', error);
//     }
//   }, [currentCall, session?.user?.id, cleanupCall]);

//   const toggleMute = useCallback(() => {
//     const audioTrack = localStreamRef.current?.getAudioTracks()[0];
//     if (audioTrack) {
//       audioTrack.enabled = !audioTrack.enabled;
//       setIsMuted(!audioTrack.enabled);
//     }
//   }, []);

//   const toggleVideo = useCallback(() => {
//     const videoTrack = localStreamRef.current?.getVideoTracks()[0];
//     if (videoTrack) {
//       videoTrack.enabled = !videoTrack.enabled;
//       setIsVideoOff(!videoTrack.enabled);
//     }
//   }, []);

//   return (
//     <CallContext.Provider
//       value={{
//         currentCall,
//         incomingCall,
//         isInCall,
//         isCalling,
//         callDuration,
//         localStream,
//         remoteStream,
//         isMuted,
//         isVideoOff,
//         connectionState,
//         startCall,
//         answerCall,
//         declineCall,
//         endCall,
//         toggleMute,
//         toggleVideo,
//       }}
//     >
//       {children}
//     </CallContext.Provider>
//   );
// }

// export const useCall = () => {
//   const context = useContext(CallContext);
//   if (!context) throw new Error('useCall must be used within CallProvider');
//   return context;
// };
