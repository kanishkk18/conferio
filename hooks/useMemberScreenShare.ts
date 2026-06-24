// hooks/useScreenShare.ts
import { useRef, useState, useCallback, useEffect } from 'react';

export type ShareRole = 'admin' | 'employee';
export type ShareStatus = 'idle' | 'connecting' | 'sharing' | 'viewing' | 'ended';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useScreenShare(sessionId: string | null, role: ShareRole) {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processedCandidates = useRef<Set<string>>(new Set());
  const offerProcessed = useRef(false);
  const answerProcessed = useRef(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<ShareStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const cleanup = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    stream?.getTracks().forEach((t) => t.stop());
    peerRef.current?.close();
    peerRef.current = null;
    processedCandidates.current.clear();
    offerProcessed.current = false;
    answerProcessed.current = false;
    setStream(null);
  }, [stream]);

  const sendSignal = useCallback(
    async (type: 'offer' | 'answer' | 'ice', data: unknown) => {
      if (!sessionId) return;
      await fetch('/api/screenshare/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, type, data }),
      });
    },
    [sessionId]
  );

  const pollSignals = useCallback(() => {
    if (!sessionId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/screenshare/signal?sessionId=${sessionId}`);
        if (!res.ok) return;
        const signals = await res.json();
        const pc = peerRef.current;
        if (!pc) return;

        // Employee: receive offer → send answer
        if (
          role === 'employee' &&
          signals.offer &&
          !offerProcessed.current &&
          pc.signalingState === 'stable'
        ) {
          offerProcessed.current = true;
          await pc.setRemoteDescription(new RTCSessionDescription(signals.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal('answer', answer);
        }

        // Admin: receive answer
        if (
          role === 'admin' &&
          signals.answer &&
          !answerProcessed.current &&
          pc.signalingState === 'have-local-offer'
        ) {
          answerProcessed.current = true;
          await pc.setRemoteDescription(new RTCSessionDescription(signals.answer));
        }

        // Both: apply ICE candidates
        if (signals.iceCandidates?.length) {
          for (const candidate of signals.iceCandidates) {
            const key = JSON.stringify(candidate);
            if (!processedCandidates.current.has(key) && pc.remoteDescription) {
              processedCandidates.current.add(key);
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (_) {}
            }
          }
        }
      } catch (_) {}
    }, 1200);
  }, [sessionId, role, sendSignal]);

  // ─── EMPLOYEE: share screen ───────────────────────────────
  const startSharing = useCallback(async () => {
    if (!sessionId) return;
    try {
      setStatus('connecting');
      setError(null);

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 15, max: 30 }, width: { ideal: 1920 } },
        audio: false,
      });

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerRef.current = pc;

      displayStream.getTracks().forEach((t) => pc.addTrack(t, displayStream));

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) sendSignal('ice', candidate.toJSON());
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') setStatus('sharing');
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
          setStatus('ended');
        }
      };

      setStream(displayStream);

      // Stop when user clicks "Stop Sharing" in browser UI
      displayStream.getVideoTracks()[0].onended = () => stopSharing();

      pollSignals();
      setStatus('sharing');

      // Mark session as ACTIVE
      await fetch('/api/screenshare/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action: 'start' }),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Screen share failed';
      setError(msg);
      setStatus('idle');
    }
  }, [sessionId, pollSignals, sendSignal]);

  // ─── ADMIN: view screen ───────────────────────────────────
  const startViewing = useCallback(async () => {
    if (!sessionId) return;
    try {
      setStatus('connecting');
      setError(null);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerRef.current = pc;

      pc.ontrack = (e) => {
        setStream(e.streams[0]);
        setStatus('viewing');
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) sendSignal('ice', candidate.toJSON());
      };

      pc.onconnectionstatechange = () => {
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
          setStatus('ended');
        }
      };

      // Create offer immediately
      const offer = await pc.createOffer({ offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      await sendSignal('offer', offer);

      pollSignals();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect';
      setError(msg);
      setStatus('idle');
    }
  }, [sessionId, pollSignals, sendSignal]);

  const stopSharing = useCallback(async () => {
    cleanup();
    setStatus('ended');
    if (sessionId) {
      await fetch('/api/screenshare/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }
  }, [cleanup, sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      peerRef.current?.close();
    };
  }, []);

  return { stream, status, error, startSharing, startViewing, stopSharing };
}
