import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Clip } from '@prisma/client';

interface RecordingContextType {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  recordedSize: number;
  recordingType: 'audio' | 'video' | 'both';
  title: string;
  startRecording: (type: 'audio' | 'video' | 'both', title: string) => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  uploadProgress: number;
  uploadState: 'idle' | 'uploading' | 'success' | 'error';
  lastUploadedClip: Clip | null;
  dismissUpload: () => void;
  deleteLastClip: () => Promise<void>;
  copyLink: () => void;
  downloadClip: () => void;
}

const RecordingContext = createContext<RecordingContextType | null>(null);

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedSize, setRecordedSize] = useState(0);
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | 'both'>('video');
  const [title, setTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [lastUploadedClip, setLastUploadedClip] = useState<Clip | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sizeRef = useRef(0);
  const durationRef = useRef(0);
  const titleRef = useRef('');
  const typeRef = useRef<'audio' | 'video' | 'both'>('video');

  // Keep refs in sync with state
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { typeRef.current = recordingType; }, [recordingType]);

  // Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording, isPaused]);

  // Prevent accidental reload while recording
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isRecording) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isRecording]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isRecording) return;
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        stopRecording();
      }
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (isPaused) resumeRecording();
        else pauseRecording();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRecording, isPaused]);

  const startRecording = useCallback(async (type: 'audio' | 'video' | 'both', recordingTitle: string) => {
    try {
      // Reset state
      setDuration(0);
      setRecordedSize(0);
      sizeRef.current = 0;
      chunksRef.current = [];
      setTitle(recordingTitle);
      setRecordingType(type);
      setUploadState('idle');
      setLastUploadedClip(null);
      setIsPaused(false);

      let mediaStream: MediaStream;

      if (type === 'audio') {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } else if (type === 'video') {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      } else {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }).catch(() => null);
        const tracks = [
          ...displayStream.getVideoTracks(),
          ...displayStream.getAudioTracks(),
          ...(audioStream ? audioStream.getAudioTracks() : [])
        ];
        mediaStream = new MediaStream(tracks);
      }

      streamRef.current = mediaStream;

      // Auto-stop if user clicks "Stop sharing" in browser UI
      mediaStream.getVideoTracks().forEach(track => {
        track.onended = () => stopRecording();
      });

      const mimeType = type === 'audio'
        ? (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm')
        : (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm');

      const recorder = new MediaRecorder(mediaStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          sizeRef.current += event.data.size;
          setRecordedSize(sizeRef.current);

          // 25MB hard limit — auto-stop before exceeding
          if (sizeRef.current >= MAX_SIZE) {
            recorder.stop();
          }
        }
      };

      recorder.onstop = () => {
        const blobType = typeRef.current === 'audio' ? 'audio/webm' : 'video/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        
        // Stop all tracks
        streamRef.current?.getTracks().forEach(t => t.stop());
        
        setIsRecording(false);
        setIsPaused(false);

        // Upload
        handleUpload(blob, titleRef.current, typeRef.current, durationRef.current);
      };

      recorder.start(1000); // 1-second chunks so we can track size live
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      // Mute tracks so mic indicator disappears
      streamRef.current?.getTracks().forEach(t => t.enabled = false);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      streamRef.current?.getTracks().forEach(t => t.enabled = true);
    }
  }, []);

  const handleUpload = useCallback((blob: Blob, uploadTitle: string, uploadType: 'audio' | 'video' | 'both', uploadDuration: number) => {
    if (blob.size > MAX_SIZE) {
      alert('Recording exceeds 25MB limit. Please record a shorter clip.');
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    const ext = uploadType === 'audio' ? 'webm' : 'webm';
    formData.append('file', blob, `${uploadTitle}.${ext}`);
    formData.append('title', uploadTitle);
    formData.append('description', 'Clip recording');
    formData.append('clipType', uploadType);
    formData.append('duration', String(uploadDuration));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/clips/upload');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const clip = JSON.parse(xhr.responseText);
        setLastUploadedClip(clip);
        setUploadState('success');
        setUploadProgress(100);
      } else {
        setUploadState('error');
      }
    };

    xhr.onerror = () => setUploadState('error');
    xhr.send(formData);
  }, []);

  const dismissUpload = useCallback(() => {
    setUploadState('idle');
    setLastUploadedClip(null);
    setUploadProgress(0);
  }, []);

  const deleteLastClip = useCallback(async () => {
    if (!lastUploadedClip) return;
    await fetch(`/api/clips/${lastUploadedClip.id}`, { method: 'DELETE' });
    dismissUpload();
  }, [lastUploadedClip, dismissUpload]);

  const copyLink = useCallback(() => {
    if (!lastUploadedClip) return;
    const url = `${window.location.origin}/clips/${lastUploadedClip.shareToken || lastUploadedClip.id}`;
    navigator.clipboard.writeText(url);
  }, [lastUploadedClip]);

  const downloadClip = useCallback(() => {
    if (!lastUploadedClip) return;
    const a = document.createElement('a');
    a.href = lastUploadedClip.fileUrl;
    a.download = lastUploadedClip.title;
    a.click();
  }, [lastUploadedClip]);

  return (
    <RecordingContext.Provider value={{
      isRecording, isPaused, duration, recordedSize, recordingType, title,
      startRecording, stopRecording, pauseRecording, resumeRecording,
      uploadProgress, uploadState, lastUploadedClip,
      dismissUpload, deleteLastClip, copyLink, downloadClip
    }}>
      {children}
    </RecordingContext.Provider>
  );
}

export const useRecording = () => {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error('useRecording must be used within RecordingProvider');
  return ctx;
};