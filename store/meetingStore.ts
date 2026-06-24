// // ============================================================
// // store/meetingStore.ts
// // FIXED: selectSortedParticipants no longer returns new array
// // on every render. Sort is done inside the store mutation,
// // stored as a stable sorted array reference.
// // ============================================================

// import { create } from 'zustand';
// import { devtools, subscribeWithSelector } from 'zustand/middleware';
// import { immer } from 'zustand/middleware/immer';
// import type {
//   MeetingStore,
//   MeetingConnectionState,
//   RemoteParticipant,
//   LocalParticipant,
//   JitsiTrackWrapper,
//   VideoLayout,
//   ChatMessage,
//   RecordingState,
// } from '../types/meeting.types';

// const initialRecordingState: RecordingState = {
//   isRecording: false,
//   recordingId: null,
//   startedAt: null,
//   initiatedBy: null,
// };

// // ─── Helper: produce a stable sorted array from the record ───
// function sortedParticipantsFromRecord(
//   record: Record<string, RemoteParticipant>
// ): RemoteParticipant[] {
//   return Object.values(record).sort((a, b) => {
//     if (a.isDominantSpeaker) return -1;
//     if (b.isDominantSpeaker) return 1;
//     if (a.isActiveSpeaker) return -1;
//     if (b.isActiveSpeaker) return 1;
//     return a.displayName.localeCompare(b.displayName);
//   });
// }

// export const useMeetingStore = create<MeetingStore>()(
//   devtools(
//     subscribeWithSelector(
//       immer((set) => ({
//         // ─── Initial State ──────────────────────────────────────
//         connectionState: 'idle',
//         meetingId: null,
//         roomName: null,
//         connection: null,
//         conference: null,

//         localParticipant: null,
//         remoteParticipants: {},
//         sortedParticipants: [], // ← stable sorted array, mutated in store
//         activeSpeakerId: null,
//         dominantSpeakerId: null,

//         localAudioTrack: null,
//         localVideoTrack: null,
//         localScreenTrack: null,

//         layout: 'grid',
//         spotlightParticipantId: null,
//         isChatOpen: false,
//         isParticipantListOpen: false,
//         isSettingsOpen: false,
//         isMeetingEnded: false,

//         chatMessages: [],
//         unreadChatCount: 0,

//         recordingState: initialRecordingState,

//         connectionError: null,
//         networkWarning: null,

//         // ─── Actions ───────────────────────────────────────────

//         setConnectionState: (state: MeetingConnectionState) =>
//           set((s) => {
//             s.connectionState = state;
//             if (state === 'connected') s.connectionError = null;
//           }),

//         setConnection: (conn) =>
//           set((s) => {
//             s.connection = conn;
//           }),

//         setConference: (conf) =>
//           set((s) => {
//             s.conference = conf;
//           }),

//         setLocalParticipant: (p: LocalParticipant) =>
//           set((s) => {
//             s.localParticipant = p;
//           }),

//         addRemoteParticipant: (p: RemoteParticipant) =>
//           set((s) => {
//             s.remoteParticipants[p.id] = p;
//             s.sortedParticipants = sortedParticipantsFromRecord(
//               s.remoteParticipants
//             );
//             const count = Object.keys(s.remoteParticipants).length;
//             if (count === 1) s.layout = 'sidebar';
//             else s.layout = 'grid';
//           }),

//         updateRemoteParticipant: (id: string, updates: Partial<RemoteParticipant>) =>
//           set((s) => {
//             if (s.remoteParticipants[id]) {
//               s.remoteParticipants[id] = {
//                 ...s.remoteParticipants[id],
//                 ...updates,
//               };
//               s.sortedParticipants = sortedParticipantsFromRecord(
//                 s.remoteParticipants
//               );
//             }
//           }),

//         removeRemoteParticipant: (id: string) =>
//           set((s) => {
//             delete s.remoteParticipants[id];
//             s.sortedParticipants = sortedParticipantsFromRecord(
//               s.remoteParticipants
//             );
//             if (s.activeSpeakerId === id) s.activeSpeakerId = null;
//             if (s.dominantSpeakerId === id) s.dominantSpeakerId = null;
//             if (s.spotlightParticipantId === id) s.spotlightParticipantId = null;
//           }),

//         setLocalAudioTrack: (track: JitsiTrackWrapper | null) =>
//           set((s) => {
//             s.localAudioTrack = track;
//             if (s.localParticipant) {
//               s.localParticipant.audioTrack = track;
//               s.localParticipant.isAudioMuted = !track || track.isMuted;
//             }
//           }),

//         setLocalVideoTrack: (track: JitsiTrackWrapper | null) =>
//           set((s) => {
//             s.localVideoTrack = track;
//             if (s.localParticipant) {
//               s.localParticipant.videoTrack = track;
//               s.localParticipant.isVideoMuted = !track || track.isMuted;
//             }
//           }),

//         setLocalScreenTrack: (track: JitsiTrackWrapper | null) =>
//           set((s) => {
//             s.localScreenTrack = track;
//             if (s.localParticipant) {
//               s.localParticipant.screenTrack = track;
//               s.localParticipant.isScreenSharing = !!track;
//             }
//           }),

//         setActiveSpeaker: (id: string | null) =>
//           set((s) => {
//             if (s.activeSpeakerId && s.remoteParticipants[s.activeSpeakerId]) {
//               s.remoteParticipants[s.activeSpeakerId].isActiveSpeaker = false;
//             }
//             s.activeSpeakerId = id;
//             if (id && s.remoteParticipants[id]) {
//               s.remoteParticipants[id].isActiveSpeaker = true;
//             }
//             s.sortedParticipants = sortedParticipantsFromRecord(
//               s.remoteParticipants
//             );
//           }),

//         setDominantSpeaker: (id: string | null) =>
//           set((s) => {
//             if (s.dominantSpeakerId && s.remoteParticipants[s.dominantSpeakerId]) {
//               s.remoteParticipants[s.dominantSpeakerId].isDominantSpeaker = false;
//             }
//             s.dominantSpeakerId = id;
//             if (id && s.remoteParticipants[id]) {
//               s.remoteParticipants[id].isDominantSpeaker = true;
//             }
//             s.sortedParticipants = sortedParticipantsFromRecord(
//               s.remoteParticipants
//             );
//           }),

//         setLayout: (layout: VideoLayout) =>
//           set((s) => {
//             s.layout = layout;
//           }),

//         setSpotlightParticipant: (id: string | null) =>
//           set((s) => {
//             s.spotlightParticipantId = id;
//             if (id) s.layout = 'spotlight';
//           }),

//         toggleChat: () =>
//           set((s) => {
//             s.isChatOpen = !s.isChatOpen;
//             if (s.isChatOpen) s.unreadChatCount = 0;
//           }),

//         toggleParticipantList: () =>
//           set((s) => {
//             s.isParticipantListOpen = !s.isParticipantListOpen;
//           }),

//         addChatMessage: (msg: ChatMessage) =>
//           set((s) => {
//             s.chatMessages.push(msg);
//             if (!s.isChatOpen && !msg.isLocal) {
//               s.unreadChatCount += 1;
//             }
//           }),

//         markChatRead: () =>
//           set((s) => {
//             s.unreadChatCount = 0;
//           }),

//         setRecordingState: (updates: Partial<RecordingState>) =>
//           set((s) => {
//             s.recordingState = { ...s.recordingState, ...updates };
//           }),

//         setConnectionError: (error: string | null) =>
//           set((s) => {
//             s.connectionError = error;
//           }),

//         setNetworkWarning: (warning: string | null) =>
//           set((s) => {
//             s.networkWarning = warning;
//           }),

//         endMeeting: () =>
//           set((s) => {
//             s.isMeetingEnded = true;
//             s.connectionState = 'ended';
//           }),

//         reset: () =>
//           set((s) => {
//             s.connectionState = 'idle';
//             s.meetingId = null;
//             s.roomName = null;
//             s.connection = null;
//             s.conference = null;
//             s.localParticipant = null;
//             s.remoteParticipants = {};
//             s.sortedParticipants = [];
//             s.activeSpeakerId = null;
//             s.dominantSpeakerId = null;
//             s.localAudioTrack = null;
//             s.localVideoTrack = null;
//             s.localScreenTrack = null;
//             s.layout = 'grid';
//             s.spotlightParticipantId = null;
//             s.isChatOpen = false;
//             s.isParticipantListOpen = false;
//             s.isSettingsOpen = false;
//             s.isMeetingEnded = false;
//             s.chatMessages = [];
//             s.unreadChatCount = 0;
//             s.recordingState = initialRecordingState;
//             s.connectionError = null;
//             s.networkWarning = null;
//           }),
//       }))
//     ),
//     { name: 'MeetingStore' }
//   )
// );

// // ─── Selectors ─────────────────────────────────────────────
// // selectSortedParticipants reads the pre-sorted array from
// // the store — same reference unless participants changed.
// // This prevents infinite re-render loops.

// export const selectSortedParticipants = (s: MeetingStore) =>
//   s.sortedParticipants;

// export const selectParticipantCount = (s: MeetingStore) =>
//   Object.keys(s.remoteParticipants).length + (s.localParticipant ? 1 : 0);

// export const selectRemoteParticipantsArray = (s: MeetingStore) =>
//   s.sortedParticipants;

// export const selectIsConnected = (s: MeetingStore) =>
//   s.connectionState === 'connected';