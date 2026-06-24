import { useState, useRef, useCallback } from 'react'

interface UseMediaRecorderProps {
  onRecordingComplete: (blob: Blob) => void
}

export const useMediaRecorder = ({ onRecordingComplete }: UseMediaRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const chunks = useRef<Blob[]>([])

  const getMimeType = (type: 'audio' | 'video' | 'both') => {
    if (type === 'audio') {
      return MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
    }
    return MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';
  };

  const startRecording = useCallback(async (type: 'audio' | 'video' | 'both') => {
    try {
      setError(null)
      
      let mediaStream: MediaStream
      
      if (type === 'audio') {
        // Audio only: microphone only, no video tracks
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })
      } else if (type === 'video') {
        // Video only: screen without any audio
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        })
      } else {
        // Both: screen video + microphone audio
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true, // system audio
        }).catch(async () => {
          return await navigator.mediaDevices.getDisplayMedia({ video: true });
        });
        
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        }).catch(() => null);
        
        const tracks = [
          ...displayStream.getVideoTracks(),
          ...displayStream.getAudioTracks(),
          ...(audioStream ? audioStream.getAudioTracks() : [])
        ];
        mediaStream = new MediaStream(tracks)
      }

      setStream(mediaStream)
      
      const mimeType = getMimeType(type);
      const recorder = new MediaRecorder(mediaStream, { mimeType })
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        const blobType = type === 'audio' ? 'audio/webm' : 'video/webm';
        const blob = new Blob(chunks.current, { type: blobType })
        onRecordingComplete(blob)
        chunks.current = []
        
        mediaStream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
      
      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)
      
    } catch (err) {
      setError('Failed to start recording')
      console.error('Recording error:', err)
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }, [mediaRecorder, isRecording])

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
  }
}