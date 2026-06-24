// "use client";

// import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
// import { useSession } from "next-auth/react";
// import { io, Socket } from "socket.io-client";
// import { Room, RoomEvent, LocalParticipant, RemoteParticipant, RoomOptions, VideoPresets } from "livekit-client";

// type MeetingParticipant = {
//   id: string;
//   userId?: string;
//   name: string;
//   image?: string;
//   role: string;
//   isMuted: boolean;
//   isVideoOn: boolean;
//   isScreenSharing: boolean;
//   isSpeaking: boolean;
//   raisedHand: boolean;
//   status?: string;
//   email?: string;
// };

// type ChatMessage = {
//   id: string;
//   senderId?: string;
//   senderName: string;
//   senderImage?: string;
//   content: string;
//   type: string;
//   createdAt: string;
// };

// type Reaction = {
//   id: string;
//   participantName: string;
//   emoji: string;
//   createdAt: string;
// };

// interface MeetingRoomContextValue {
//   room: Room | null;
//   localParticipant: LocalParticipant | null;
//   remoteParticipants: RemoteParticipant[];
//   participants: MeetingParticipant[];
//   chats: ChatMessage[];
//   reactions: Reaction[];
//   isMuted: boolean;
//   isVideoOn: boolean;
//   isScreenSharing: boolean;
//   raisedHand: boolean;
//   isOwner: boolean;
//   meetingTitle: string;
//   showParticipants: boolean;
//   showChat: boolean;
//   setShowParticipants: (v: boolean) => void;
//   setShowChat: (v: boolean) => void;
//   toggleMute: () => void;
//   toggleVideo: () => void;
//   toggleScreenShare: () => Promise<void>;
//   toggleRaiseHand: () => void;
//   sendReaction: (emoji: string) => void;
//   sendChat: (content: string) => void;
//   kickParticipant: (participantId: string) => void;
//   muteParticipant: (participantId: string) => void;
//   approveParticipant: (participantId: string) => void;
//   inviteTeamMember: (userId: string, name: string) => void;
//   connect: (roomName: string, token: string) => Promise<void>;
//   disconnect: () => void;
// }

// const MeetingRoomContext = createContext<MeetingRoomContextValue | undefined>(undefined);

// export const useMeetingRoom = () => {
//   const ctx = useContext(MeetingRoomContext);
//   if (!ctx) throw new Error("useMeetingRoom must be used within MeetingRoomProvider");
//   return ctx;
// };

// const ROOM_OPTIONS: RoomOptions = {
//   adaptiveStream: true,
//   dynacast: true,
//   videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
//   publishDefaults: { simulcast: true, videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360] },
// };

// export function MeetingRoomProvider({ children, roomName }: { children: React.ReactNode; roomName: string }) {
//   const { data: session } = useSession();
//   const socketRef = useRef<Socket | null>(null);
//   const roomRef = useRef<Room | null>(null);

//   const [room, setRoom] = useState<Room | null>(null);
//   const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
//   const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
//   const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
//   const [chats, setChats] = useState<ChatMessage[]>([]);
//   const [reactions, setReactions] = useState<Reaction[]>([]);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [raisedHand, setRaisedHand] = useState(false);
//   const [isOwner, setIsOwner] = useState(false);
//   const [meetingTitle, setMeetingTitle] = useState("Meeting");
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [showChat, setShowChat] = useState(false);

//   // Init socket
//   useEffect(() => {
//     if (!session?.user?.id) return;
//     fetch("/api/socket/io").catch(() => {});
//     const sock = io({ path: "/api/socket/io", query: { userId: session.user.id }, transports: ["websocket", "polling"] });

//     sock.on("connect", () => {
//       sock.emit("join-meeting-room", { roomName, userId: session.user.id, name: session.user.name || "You" });
//     });

//     sock.on("participant-joined", (data) => {
//       setParticipants((prev) => {
//         if (prev.find((p) => p.userId === data.userId)) return prev;
//         return [...prev, { id: data.socketId, userId: data.userId, name: data.name, role: "participant", isMuted: false, isVideoOn: true, isScreenSharing: false, isSpeaking: false, raisedHand: false }];
//       });
//     });

//     sock.on("participant-left", (data) => {
//       setParticipants((prev) => prev.filter((p) => p.id !== data.socketId && p.userId !== data.userId));
//     });

//     sock.on("speaking-changed", (data) => {
//       setParticipants((prev) => prev.map((p) => (p.userId === data.userId ? { ...p, isSpeaking: data.isSpeaking } : p)));
//     });

//     sock.on("reaction-received", (data) => {
//       const reaction = { id: Date.now().toString(), participantName: data.name, emoji: data.emoji, createdAt: new Date().toISOString() };
//       setReactions((prev) => [...prev.slice(-20), reaction]);
//       setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== reaction.id)), 5000);
//     });

//     sock.on("hand-raised", (data) => {
//       setParticipants((prev) => prev.map((p) => (p.userId === data.userId ? { ...p, raisedHand: data.raised } : p)));
//     });

//     sock.on("chat-received", (message) => {
//       setChats((prev) => [...prev, message]);
//     });

//     sock.on("screen-share-changed", (data) => {
//       setParticipants((prev) => prev.map((p) => (p.userId === data.userId ? { ...p, isScreenSharing: data.active } : p)));
//     });

//     sock.on("participant-kicked", (data) => {
//       if (data.targetUserId === session.user.id) {
//         disconnect();
//         window.location.href = "/";
//       }
//     });

//     sock.on("force-mute", (data) => {
//       if (data.targetUserId === session.user.id && roomRef.current) {
//         roomRef.current.localParticipant.setMicrophoneEnabled(false);
//         setIsMuted(true);
//       }
//     });

//     sock.on("approval-needed", (participant) => {
//       setParticipants((prev) => {
//         if (prev.find((p) => p.id === participant.id)) return prev;
//         return [...prev, { ...participant, status: "pending" }];
//       });
//     });

//     sock.on("approval-result", (data) => {
//       if (data.participantId === session.user.id && !data.approved) {
//         disconnect();
//         alert("You were not admitted to the meeting");
//       }
//     });

//     socketRef.current = sock;
//     return () => { sock.close(); socketRef.current = null; };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [session?.user?.id, roomName]);

//   // Fetch meeting info
//   useEffect(() => {
//     fetch(`/api/video-call/${roomName}`)
//       .then((r) => r.json())
//       .then((data) => {
//         if (data.title) setMeetingTitle(data.title);
//         if (data.isOwner) setIsOwner(true);
//         if (data.participants) {
//           setParticipants(data.participants.map((p: any) => ({
//             id: p.id, userId: p.userId, name: p.name, image: p.image, role: p.role,
//             isMuted: p.isMuted, isVideoOn: p.isVideoOn, isScreenSharing: false, isSpeaking: p.isSpeaking, raisedHand: false, status: p.status, email: p.email,
//           })));
//         }
//       });
//   }, [roomName]);

//   // Fetch chat history
//   useEffect(() => {
//     fetch(`/api/video-call/${roomName}/chat`)
//       .then((r) => r.json())
//       .then((data) => setChats(data));
//   }, [roomName]);

//   const connect = useCallback(async (roomName: string, token: string) => {
//     const newRoom = new Room(ROOM_OPTIONS);
//     const updateRemote = () => setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));

//     newRoom.on(RoomEvent.ParticipantConnected, updateRemote);
//     newRoom.on(RoomEvent.ParticipantDisconnected, updateRemote);
//     newRoom.on(RoomEvent.TrackSubscribed, updateRemote);
//     newRoom.on(RoomEvent.TrackUnsubscribed, updateRemote);
//     newRoom.on(RoomEvent.LocalTrackPublished, () => setLocalParticipant(newRoom.localParticipant));
//     newRoom.on(RoomEvent.LocalTrackUnpublished, () => setLocalParticipant(newRoom.localParticipant));
//     newRoom.on(RoomEvent.Disconnected, () => {
//       setRoom(null); setLocalParticipant(null); setRemoteParticipants([]); roomRef.current = null;
//     });
//     newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
//       const ids = new Set(speakers.map((s) => s.identity));
//       setParticipants((prev) => prev.map((p) => ({ ...p, isSpeaking: ids.has(p.userId || p.id) })));
//       if (socketRef.current) {
//         speakers.forEach((s) => socketRef.current?.emit("meeting-speaking-changed", { roomName, userId: s.identity, isSpeaking: true }));
//       }
//     });

//     const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
//     if (!url) throw new Error("NEXT_PUBLIC_LIVEKIT_URL not set");

//     await newRoom.connect(url, token);
//     await newRoom.localParticipant.enableCameraAndMicrophone();
//     setIsMuted(false); setIsVideoOn(true);

//     setRoom(newRoom); setLocalParticipant(newRoom.localParticipant); setRemoteParticipants(Array.from(newRoom.remoteParticipants.values()));
//     roomRef.current = newRoom;
//   }, []);

//   const disconnect = useCallback(() => {
//     socketRef.current?.emit("leave-meeting-room", roomName);
//     if (roomRef.current) { roomRef.current.disconnect(); roomRef.current = null; }
//     setRoom(null); setLocalParticipant(null); setRemoteParticipants([]); setIsScreenSharing(false);
//   }, [roomName]);

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

//   const toggleScreenShare = useCallback(async () => {
//     if (!roomRef.current) return;
//     const enabled = roomRef.current.localParticipant.isScreenShareEnabled;
//     await roomRef.current.localParticipant.setScreenShareEnabled(!enabled);
//     setIsScreenSharing(!enabled);
//     socketRef.current?.emit("meeting-screen-share", { roomName, userId: session?.user?.id, active: !enabled });
//   }, [roomName, session?.user?.id]);

//   const toggleRaiseHand = useCallback(() => {
//     const newVal = !raisedHand;
//     setRaisedHand(newVal);
//     socketRef.current?.emit("meeting-raise-hand", { roomName, userId: session?.user?.id, name: session?.user?.name, raised: newVal });
//   }, [raisedHand, roomName, session?.user?.id, session?.user?.name]);

//   const sendReaction = useCallback((emoji: string) => {
//     socketRef.current?.emit("meeting-reaction", { roomName, userId: session?.user?.id, name: session?.user?.name || "You", emoji });
//   }, [roomName, session?.user?.id, session?.user?.name]);

//   const sendChat = useCallback(async (content: string) => {
//     const msg = { senderId: session?.user?.id, senderName: session?.user?.name || "You", senderImage: session?.user?.image, content, type: "text" };
//     const res = await fetch(`/api/video-call/${roomName}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(msg) });
//     if (res.ok) {
//       const saved = await res.json();
//       setChats((prev) => [...prev, saved]);
//       socketRef.current?.emit("meeting-chat", { roomName, message: saved });
//     }
//   }, [roomName, session?.user?.id, session?.user?.name, session?.user?.image]);

//   const kickParticipant = useCallback((participantId: string) => {
//     fetch(`/api/video-call/${roomName}/participants`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ participantId, action: "kick" }) });
//     socketRef.current?.emit("meeting-kick", { roomName, targetUserId: participantId });
//   }, [roomName]);

//   const muteParticipant = useCallback((participantId: string) => {
//     fetch(`/api/video-call/${roomName}/participants`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ participantId, action: "mute" }) });
//     socketRef.current?.emit("meeting-mute-request", { roomName, targetUserId: participantId });
//   }, [roomName]);

//   const approveParticipant = useCallback((participantId: string) => {
//     fetch(`/api/video-call/${roomName}/participants`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ participantId, action: "approve" }) });
//     socketRef.current?.emit("approval-response", { roomName, participantId, approved: true });
//   }, [roomName]);

//   const inviteTeamMember = useCallback((userId: string, name: string) => {
//     socketRef.current?.emit("invite-to-meeting", {
//       roomName,
//       roomTitle: meetingTitle,
//       targetUserId: userId,
//       inviterId: session?.user?.id,
//       inviterName: session?.user?.name || "Host",
//       inviterImage: session?.user?.image,
//       type: "VIDEO",
//     });
//   }, [roomName, meetingTitle, session?.user?.id, session?.user?.name, session?.user?.image]);

//   return (
//     <MeetingRoomContext.Provider value={{
//       room, localParticipant, remoteParticipants, participants, chats, reactions,
//       isMuted, isVideoOn, isScreenSharing, raisedHand, isOwner, meetingTitle,
//       showParticipants, showChat, setShowParticipants, setShowChat,
//       toggleMute, toggleVideo, toggleScreenShare, toggleRaiseHand,
//       sendReaction, sendChat, kickParticipant, muteParticipant, approveParticipant, inviteTeamMember,
//       connect, disconnect,
//     }}>
//       {children}
//     </MeetingRoomContext.Provider>
//   );
// }
