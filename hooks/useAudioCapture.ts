// hooks/useAudioCapture.ts
import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

export function useAudioCapture(stream: MediaStream | null, socket: Socket | null, meetingId: string) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isCapturingRef = useRef(false);

  const startCapture = useCallback(() => {
    if (!stream || !socket || !meetingId || isCapturingRef.current) return;
    
    // Deepgram needs 16kHz, 16-bit, mono PCM
    const audioContext = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = audioContext;
    
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const int16Buffer = float32ToInt16(inputData);
      socket.emit('audio-chunk', int16Buffer);
    };
    
    source.connect(processor);
    processor.connect(audioContext.destination);
    
    socket.emit('start-transcription', { meetingId });
    isCapturingRef.current = true;
    
    console.log('🎙️ Audio capture started for meeting:', meetingId);
  }, [stream, socket, meetingId]);

  const stopCapture = useCallback(() => {
    if (!isCapturingRef.current) return;
    
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    
    socket?.emit('stop-transcription', { meetingId });
    isCapturingRef.current = false;
    
    console.log('🛑 Audio capture stopped');
  }, [socket, meetingId]);

  useEffect(() => {
    return () => stopCapture();
  }, [stopCapture]);

  return { startCapture, stopCapture, isCapturing: isCapturingRef.current };
}

function float32ToInt16(float32Array: Float32Array): ArrayBuffer {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array.buffer;
}