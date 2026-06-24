
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Video, Loader2, AlertCircle, CheckCircle, Send, FileText } from 'lucide-react';
import {
  FloatingPanelBody,
  FloatingPanelCloseButton,
  FloatingPanelContent,
  FloatingPanelFooter,
  FloatingPanelRoot,
  FloatingPanelTrigger,
} from "@/components/ui/floatingPanel"
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NewMeetingModalProps {
  children?: React.ReactNode;
  className?: string;
}

export default function NewMeetingModal({ children, className }: NewMeetingModalProps) {
  const router = useRouter();
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingName, setMeetingName] = useState('');
  const [recordingMode, setRecordingMode] = useState<'speaker_view' | 'gallery_view' | 'audio_only'>('speaker_view');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/aimeetings/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingUrl,
          meetingName: meetingName || undefined,
          recordingMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join meeting');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/meetings/page');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const detectPlatform = (url: string) => {
    if (url.includes('zoom.us')) return 'Zoom';
    if (url.includes('meet.google.com')) return 'Google Meet';
    if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'Microsoft Teams';
    return null;
  };

  const platform = detectPlatform(meetingUrl);

  return (
    <FloatingPanelRoot>
      <FloatingPanelTrigger
        className={cn("!px-1.5 !py-1.5 !h-fit !flex !justify-center !items-center dark:bg-[#222]", className)}>
        {children}
      </FloatingPanelTrigger>
      <FloatingPanelContent className="w-80 -ml-6 z-[999] !p-0">
        {/* Use your own form instead of FloatingPanelForm */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <FloatingPanelBody className='!px-0 !py-0 !h-fit w-80 dark:bg-[#191919] text-white rounded-lg shadow-none overflow-hidden'>
            <div className="px-3 py-2 space-y-3">
              <div className="flex items-start gap-3 mb-0">
                <div>
                  <h2 className="text-sm font-semibold text-[#292929] dark:text-white">AI Notetaker</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Capture meeting notes, including summaries, action items, and more.
                  </p>
                </div>
              </div>

              {success ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-0 my-1">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-400">Bot is joining!</h3>
                      <p className="text-sm text-green-300 mt-1">
                        The AI notetaker has been dispatched.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-0">
                    <div className="flex items-center justify-start gap-4 mb-1">
                      <label htmlFor="meetingUrl" className="block text-xs font-semibold text-gray-400">
                        Send Notetaker
                      </label>
                      <div className="size-4 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">?</span>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          id="meetingUrl"
                          type="url"
                          value={meetingUrl}
                          onChange={(e) => setMeetingUrl(e.target.value)}
                          placeholder="Paste call link to record"
                          className="w-full dark:bg-[#2a2a2a] text-black dark:border-[#212121] dark:text-[#EEE] placeholder-gray-500 rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || !meetingUrl}
                        className="dark:bg-[#EEE] dark:text-[#171717] bg-[#5631ea] text-[#EEE] rounded-lg px-3 py-1.5 hover:from-fuchsia-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {meetingName && (
                      <div className="mt-1 text-sm text-gray-400">
                        Meeting Bot: {meetingName}
                      </div>
                    )}
                  </div>

                  <div className="">
                    <Input
                      type="text"
                      value={meetingName}
                      onChange={(e) => setMeetingName(e.target.value)}
                      placeholder="Bot Name (Optional)"
                      className="w-full dark:bg-[#2a2a2a] text-white placeholder-gray-500 rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
                    />
                  </div>

                  <div className="mb-1">
                    <div className="block text-xs font-semibold text-gray-400 mb-1">
                      Recording Mode
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRecordingMode('speaker_view')}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${recordingMode === 'speaker_view'
                          ? 'dark:bg-[#EEE] dark:text-[#171717] bg-[#5631ea] text-[#EEE]'
                          : 'dark:bg-[#2a2a2a] bg-[#e9e7e7] text-[#171717] dark:text-gray-400 hover:bg-[#ddd] hover:dark:bg-[#323232]'
                          }`}
                      >
                        Speaker
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecordingMode('gallery_view')}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${recordingMode === 'gallery_view'
                          ? 'dark:bg-[#EEE] dark:text-[#171717] bg-[#5631ea] text-[#EEE]'
                          : 'dark:bg-[#2a2a2a] bg-[#e9e7e7] text-[#171717] dark:text-gray-400 hover:bg-[#ddd] hover:dark:bg-[#323232]'
                          }`}
                      >
                        Gallery
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecordingMode('audio_only')}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${recordingMode === 'audio_only'
                          ? 'dark:bg-[#EEE] dark:text-[#171717] bg-[#5631ea] text-[#EEE]'
                          : 'dark:bg-[#2a2a2a] bg-[#e9e7e7] text-[#171717] dark:text-gray-400 hover:bg-[#ddd] hover:dark:bg-[#323232]'
                          }`}
                      >
                        Audio
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="mb-1">
                <div className="block text-xs font-semibold text-gray-400 mb-1">
                  Recent Notes
                </div>
                <div className="dark:bg-[#2a2a2a] bg-[#e3e2e2] rounded-md p-1 hover:bg-[#323232] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#171717] dark:text-white truncate">Kanishkk Bansal / Kanishkk Ba&hellip;</p>
                    </div>
                    <p className="text-xs text-gray-500">Feb 24</p>
                  </div>
                </div>
              </div>

              <div className="mb-1">
                <div className="block text-xs font-semibold text-gray-400 mb-1">
                  Video call providers
                </div>

                {platform && (
                  <div className="dark:bg-[#2a2a2a] bg-[#e3e2e2] rounded-lg p-1.5 flex items-center justify-between hover:bg-[#323232] transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-500 rounded flex items-center justify-center">
                        <Video className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-[#171717] dark:text-white">{platform}</span>
                    </div>
                    {/* <button type="button" className="text-xs text-gray-400 hover:text-white transition-colors">
                    Connect
                  </button> */}
                  </div>)}
              </div>
            </div>
          </FloatingPanelBody>

          <FloatingPanelFooter>
            <FloatingPanelCloseButton />
            <button
              type="submit"
              disabled={isLoading || !meetingUrl}
              className="relative dark:bg-[#111111] ml-1 flex h-8 gap-2 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 bg-transparent px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98] dark:border-zinc-50/10 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Joining&hellip;</span>
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  <span>Send Bot</span>
                </>
              )}
            </button>
          </FloatingPanelFooter>
        </form>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  );
}