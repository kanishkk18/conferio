'use client';

import { useRecording } from 'contexts/RecordingContext';
import { cn } from '@/lib/utils';
import { 
  X, Play, Pause, Maximize, ExternalLink, Trash2, Download, Link2, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function UploadPopup() {
  const { 
    uploadState, uploadProgress, lastUploadedClip, 
    dismissUpload, deleteLastClip, copyLink, downloadClip 
  } = useRecording();

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState('00:00');

  if (uploadState === 'idle') return null;

  const isVideo = lastUploadedClip?.fileType?.startsWith('video/') ?? true;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const openInNewTab = () => {
    if (!lastUploadedClip) return;
    window.open(lastUploadedClip.fileUrl, '_blank');
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      const m = Math.floor(dur / 60);
      const s = Math.floor(dur % 60);
      setVideoDuration(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] w-[380px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {uploadState === 'success' && (
            <>
              <CheckCircle2 className="size-4 text-green-400" />
              <span className="text-sm font-semibold text-white">Clip created!</span>
            </>
          )}
          {uploadState === 'error' && (
            <>
              <AlertCircle className="size-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Upload failed</span>
            </>
          )}
          {uploadState === 'uploading' && (
            <span className="text-sm font-medium text-white">Uploading clip...</span>
          )}
        </div>
        <button 
          onClick={dismissUpload} 
          className="text-zinc-400 hover:text-white transition-colors p-1"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Upload Progress */}
      {uploadState === 'uploading' && (
        <div className="px-4 py-4">
          <div className="flex justify-between text-xs text-zinc-400 mb-2">
            <span>Uploading video</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#6347EA] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Player */}
      {uploadState === 'success' && lastUploadedClip && (
        <div className="p-4 pt-3">
          <div className="relative rounded-lg overflow-hidden bg-black group border border-zinc-800">
            {isVideo ? (
              <video
                ref={videoRef}
                src={lastUploadedClip.fileUrl}
                className="w-full h-44 object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={handleLoadedMetadata}
                controls={false}
                preload="metadata"
              />
            ) : (
              <div className="w-full h-44 bg-zinc-800 flex items-center justify-center">
                <audio 
                  controls 
                  src={lastUploadedClip.fileUrl} 
                  className="w-full px-4" 
                  preload="metadata"
                />
              </div>
            )}

            {/* Play overlay */}
            {isVideo && (
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={togglePlay}
                  className="text-white hover:scale-110 transition-transform drop-shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="size-10 fill-current" />
                  ) : (
                    <Play className="size-10 fill-current" />
                  )}
                </button>
              </div>
            )}

            {/* Duration badge */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
              {videoDuration}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-0.5">
              <button
                onClick={deleteLastClip}
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                onClick={downloadClip}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="size-4" />
              </button>
              <button
                onClick={copyLink}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Copy link"
              >
                <Link2 className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={openInNewTab}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="size-4" />
              </button>
              {isVideo && (
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Fullscreen"
                >
                  <Maximize className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}