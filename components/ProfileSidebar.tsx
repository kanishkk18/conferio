

import { X, Phone, Calendar,  Clock, ChevronLeft, Upload, Slack, LinkedinIcon, PaperclipIcon, MailIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TeamMemberWithUser } from 'hooks/useTeamMembers';
import { Team, TeamMember } from '@prisma/client';
import { AnimateIcon } from "./animate-ui/icons/icon";
import { ExternalLink } from "./animate-ui/icons/external-link";
import { MessageSquareText } from "./animate-ui/icons/message-square-text";
import { LocationMap } from "@/components/ui/expand-map";
import { Badge } from "./ui/badge";
import { useRef, useState, useEffect, useCallback } from "react";
import { format, addMinutes } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import CallButtons, { MiniCallButton } from "./calls/CallButtons";
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenShare } from 'hooks/useMemberScreenShare';
import { useScreenShareContext } from 'contexts/ScreenShareContext';
import { MonitorOff, Loader2, XCircle, Maximize2,
} from 'lucide-react';
import { DiscordLogoIcon} from "@radix-ui/react-icons";
import { Airplay } from "./animate-ui/icons/airplay";
// import { aiRouter } from 'lib/ai/router'
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import MailFilledIcon from "./ui/mail-filled-icon";
import { SendIcon } from "./animate-ui/icons/send";
import { User } from "./animate-ui/icons/user";
import { MemberFileAssign } from "./file-manager/files/member-fileassign";
import { useRouter } from "next/navigation";
import MemberDetailModal from "./workload/MemberDetailModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/animate/tooltip"


interface ProfileSidebarProps {
  team: Team;
  member: TeamMemberWithUser;
  currentMember?: TeamMember | null;
  onClose?: () => void;
  onStartChat?: () => void;
  defaultCompose?: boolean;
  replyTo?: GmailMessage;
  defaultTo?: string;
  defaultSubject?: string;
  onSent?: () => void;
  compact?: boolean;
}

// interface RadixDialogDemoProps {
//   from: DialogContentProps['from'];
//   showCloseButton: boolean;
// }

interface GmailAddress { name?: string; email: string }
interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: GmailAddress;
  to: GmailAddress[];
  snippet: string;
  body: string;
  bodyPlain: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  labelIds: string[];
}

// Event type for scheduling
interface EventType {
  id: string;
  title: string;
  duration: number;
  description?: string;
}

interface ProfileSidebarProps {
  team: Team;
  member: TeamMemberWithUser;
  currentMember?: TeamMember | null;
  onClose?: () => void;
  onStartChat?: () => void;
  defaultCompose?: boolean;
  replyTo?: GmailMessage;
  defaultTo?: string;
  defaultSubject?: string;
  onSent?: () => void;
  compact?: boolean;
}

type RequestStatus = 'idle' | 'requesting' | 'waiting' | 'viewing' | 'rejected' | 'ended';

// ── Inline video viewer (renders inside the sidebar) ──────────
function LiveScreenView({
  sessionId,
  memberName,
  onEnd,
  onPopout,
}: {
  sessionId: string;
  memberName: string;
  onEnd: () => void;
  onPopout: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, status, startViewing, stopSharing } = useScreenShare(sessionId, 'admin');

  useEffect(() => { startViewing(); }, []); // eslint-disable-line

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (status === 'ended') onEnd();
  }, [status, onEnd]);

  const handleEnd = async () => { await stopSharing(); onEnd(); };

  return (
    <motion.div
      className="flex flex-col gap-2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
    >
      {/* Control bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="absolute size-3.5 ounded-full bg-red-500/40 animate-ping" />
            <div className="size-2 rounded-full bg-red-500 relative" />
          </div>
          <span className="text-xs text-white font-medium truncate">
            {status === 'viewing' ? `${memberName}'s screen` : 'Connecting…'}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button size="sm" variant="ghost"
            className="size-6 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
            onClick={onPopout}
            title="Open fullscreen"
          >
            <Maximize2 className="size-3" />
          </Button>
          <Button size="sm" variant="ghost"
            className="h-6 px-2 text-[11px] text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg"
            onClick={handleEnd}
          >
            <MonitorOff className="size-3 mr-1" />
            End
          </Button>
        </div>
      </div>

      {/* Video pane */}
      <div
        className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800"
        style={{ aspectRatio: '16/9' }}
      >
        {status !== 'viewing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-5 text-blue-400 animate-spin" />
            <p className="text-xs text-gray-500">Waiting for {memberName}…</p>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          aria-label="Live screen share"
          playsInline
          className="w-full h-full object-contain"
          style={{ display: status === 'viewing' ? 'block' : 'none' }}
        >
          <track kind="captions" />
        </video>
        {status === 'viewing' && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-full pointer-events-none">
            <div className="size-1.5  rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-white font-semibold tracking-wide">LIVE</span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-600 text-center">
        End-to-end encrypted · WebRTC peer-to-peer
      </p>
    </motion.div>
  );
}

// ── Fullscreen popout window ───────────────────────────────────
function openPopout(sessionId: string, memberName: string) {
  const w = window.open('', `screenshare_${sessionId}`,
    'width=1280,height=800,menubar=no,toolbar=no,status=no,scrollbars=no,resizable=yes');
  if (!w) return;

  // Write a minimal HTML page that hosts the video element.
  // The actual stream is passed via BroadcastChannel.
  w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Viewing ${memberName}'s screen</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; display: flex; flex-direction: column; height: 100vh; font-family: system-ui; }
    header { background: #111; padding: 10px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: pulse 1s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    span { color: #fff; font-size: 13px; font-weight: 500; }
    video { flex: 1; width: 100%; object-fit: contain; }
  </style>
</head>
<body>
  <header>
    <div class="dot"></div>
    <span>Viewing ${memberName}'s screen — Live</span>
  </header>
  <video id="v" autoplay playsinline></video>
  <script>
    const ch = new BroadcastChannel('screenshare_${sessionId}');
    ch.onmessage = (e) => {
      if (e.data.type === 'stream') {
        const v = document.getElementById('v');
        v.srcObject = e.data.stream;
      }
    };
    ch.postMessage({ type: 'ready' });
  </script>
</body>
</html>`);
  w.document.close();
}

const ProfileSidebar = ({ 
  team,
  member,
  currentMember,
  onClose,
  onStartChat,
  defaultCompose = false,
  replyTo,
  defaultTo,
  defaultSubject, 
  onSent,
  compact = false
}: ProfileSidebarProps) => {
  const [showCompose, setShowCompose] = useState(defaultCompose);
  const [composeReplyTo, setComposeReplyTo] = useState<GmailMessage | undefined>(replyTo);
  const [showSchedule, setShowSchedule] = useState(false);  
  
  const isCurrentUser = member.id === currentMember?.id;
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { subscribe, setSessionState, clearSession } = useScreenShareContext();
  const isAdmin = currentMember?.role === 'ADMIN' || currentMember?.role === 'OWNER';
  const canRequestScreen = isAdmin && !isCurrentUser;
const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
const [showUploader, setShowUploader] = useState(false);
const [selectDetailMember, setSelectDetailMember] = useState<TeamMember | null>(null);

  //   useEffect(() => {
  //   if (!activeSessionId) return;
  //   const unsub = subscribe((event) => {
  //     if (event.sessionId !== activeSessionId) return;
  //     if (event.type === 'SCREEN_SHARE_ACCEPTED') {
  //       setRequestStatus('viewing');
  //       setSessionState(activeSessionId, 'viewing');
  //     }
  //     if (event.type === 'SCREEN_SHARE_REJECTED') {
  //       setRequestStatus('rejected');
  //       setSessionState(activeSessionId, 'ended');
  //       setTimeout(() => { setRequestStatus('idle'); clearSession(activeSessionId); }, 3000);
  //     }
  //     if (event.type === 'SCREEN_SHARE_ENDED') {
  //       setRequestStatus('ended');
  //       clearSession(activeSessionId);
  //       setTimeout(() => { setRequestStatus('idle'); setActiveSessionId(null); }, 2000);
  //     }
  //   });
  //   return unsub;
  // }, [activeSessionId, subscribe, setSessionState, clearSession]);

  useEffect(() => {
  if (!activeSessionId) return;
  
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  
  const unsub = subscribe((event) => {
    if (event.sessionId !== activeSessionId) return;
    
    if (event.type === 'SCREEN_SHARE_ACCEPTED') {
      setRequestStatus('viewing');
      setSessionState(activeSessionId, 'viewing');
    }
    if (event.type === 'SCREEN_SHARE_REJECTED') {
      setRequestStatus('rejected');
      setSessionState(activeSessionId, 'ended');
      const t = setTimeout(() => {
        setRequestStatus('idle');
        clearSession(activeSessionId);
      }, 3000);
      timeouts.push(t);
    }
    if (event.type === 'SCREEN_SHARE_ENDED') {
      setRequestStatus('ended');
      clearSession(activeSessionId);
      const t = setTimeout(() => {
        setRequestStatus('idle');
        setActiveSessionId(null);
      }, 2000);
      timeouts.push(t);
    }
  });
  
  return () => {
    unsub();
    timeouts.forEach(clearTimeout);
  };
}, [activeSessionId, subscribe, setSessionState, clearSession]);

  const handleRequestScreenShare = async () => {
    if (!canRequestScreen) return;
    setRequestStatus('requesting');
    try {
      const res = await fetch('/api/screenshare/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: member.id, teamId: team.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      const { sessionId } = await res.json();
      setActiveSessionId(sessionId);
      setSessionState(sessionId, 'waiting');
      setRequestStatus('waiting');
    } catch {
      setRequestStatus('idle');
    }
  };

  const handleCancelRequest = async () => {
    if (activeSessionId) {
      await fetch('/api/screenshare/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId }),
      }).catch(() => {});
      clearSession(activeSessionId);
    }
    setActiveSessionId(null);
    setRequestStatus('idle');
  };

  const handleScreenShareEnded = useCallback(() => {
    if (activeSessionId) clearSession(activeSessionId);
    setActiveSessionId(null);
    setRequestStatus('ended');
    setTimeout(() => setRequestStatus('idle'), 2000);
  }, [activeSessionId, clearSession]);

  const handlePopout = () => {
    if (activeSessionId) openPopout(activeSessionId, member.user.name);
  };

  const handleChatClick = () => { if (!isCurrentUser && onStartChat) onStartChat(); };

  // ── Screen share button states ──────────────────────────────
  const renderScreenShareSection = () => {
    if (!canRequestScreen) return null;

    switch (requestStatus) {
      case 'requesting':
        return (
          <Button disabled className="w-full h-9 rounded-full bg-blue-600/40 text-white text-sm">
            <Loader2 className="size-3.5 r-2 animate-spin" />
            Sending request…
          </Button>
        );

      case 'waiting':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 justify-center py-2 px-3 rounded-full bg-amber-500/10 border border-amber-500/25 animate-pulse">
              <Clock className="size-3.5  text-amber-400" />
              <span className="text-xs text-amber-300 font-medium">Waiting for consent…</span>
            </div>
            <button type="button"
              onClick={handleCancelRequest}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors text-center"
            >
              Cancel request
            </button>
          </div>
        );

      case 'rejected':
        return (
          <div className="flex items-center gap-2 justify-center py-2 px-3 rounded-full bg-red-500/10 border border-red-500/20">
            <XCircle className="size-3.5  text-red-400" />
            <span className="text-xs text-red-300">Request declined</span>
          </div>
        );

      case 'ended':
        return (
          <div className="flex items-center gap-2 justify-center py-2 px-3 rounded-full bg-neutral-800 border border-neutral-700">
            <MonitorOff className="size-3.5  text-gray-500" />
            <span className="text-xs text-gray-400">Session ended</span>
          </div>
        );

      case 'viewing':
        return null; // viewer renders below

      default:
        return (
          <AnimateIcon animateOnHover>
          <Button
            onClick={handleRequestScreenShare}
            variant="outline"
            className="w-full h-9 rounded-full bg-transparent border-neutral-700 hover:border-blue-500 hover:bg-blue-500/10 text-sm text-white transition-all group"
          >
            <Airplay className="size-3.5  mr-2 text-blue-400 group-hover:text-blue-300" />
            View Screen
          </Button>
          </AnimateIcon>
        );
    }
  };


  return (
    <>
      <Card className="bg-[#0A0A0A] dark:bg-[#0A0A0A] border-neutral-800 text-white h-full flex flex-col rounded-3xl shadow-xl">
        <div className="px-4 py-3 flex-1 overflow-y-auto thin-scrollbar">
          {/* Header with buttons */}
          <div className="flex justify-end items-center gap-2 mb-4">
            {!isCurrentUser && (
              <AnimateIcon animateOnHover> 
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full size-10 bg-transparent hover:bg-blue-600 hover:border-blue-600"
                  onClick={handleChatClick}>
                  <MessageSquareText className="size-4" />
                </Button>
              </AnimateIcon>
            )}

           {!isCurrentUser && (
            <AnimateIcon animateOnHover> 
              <Button 
              onClick={(e) => setSelectDetailMember(member.user.id) }
                size="icon" 
                variant="outline" 
                className="rounded-full size-10 bg-transparent">
                <ExternalLink className="size-4" />
              </Button>
            </AnimateIcon>
          )}
            
            {onClose && (
              <Button 
                size="icon" 
                variant="outline" 
                className="size-10 rounded-full bg-transparent hover:bg-red-600 hover:border-red-600"
                onClick={onClose}>
                <X className="size-4" />
              </Button>
            )}
          </div>

          {/* Profile Section */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative mb-3">
              <div className="size-32 rounded-full border-4 border-blue-500/50 p-1">
                <Avatar className="w-full h-full">
                  <AvatarImage src={member.user.image || ''} alt={member.user.name} />
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {member.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-2 right-2 size-5 bg-green-500 border-4 border-[#0A0A0A] rounded-full"></div>
            </div>
            <div className=" flex flex-col">
            <h2 className="text-xl font-semibold mb-1">{member.user.name}</h2>
            
            <p className="text-sm text-gray-400 mb-1">{member.user.email}</p>
            <Badge variant="outline" className="mt-2 capitalize w-fit">
              {member.role.toLowerCase()}
            </Badge></div> 
          </div>

          {/* Action Buttons */}
          {!isCurrentUser && (
            <AnimateIcon animateOnHover>
            <div className=" gap-2 mb-3">
              <CallButtons targetUserId={member.user.id} targetUserName={member.user.name} targetUserImage={member.user.image} isProfileSidebar={true} />
            </div>
            </AnimateIcon>
          )}

           {!isCurrentUser && (
            <div className="mb-3">
              {renderScreenShareSection()}
            </div>
          )}

          {/* ── Live Screen Viewer ─────────────────────────── */}
          <AnimatePresence>
            {requestStatus === 'viewing' && activeSessionId && (
              <motion.div className="mb-3">
                <LiveScreenView
                  sessionId={activeSessionId}
                  memberName={member.user.name}
                  onEnd={handleScreenShareEnded}
                  onPopout={handlePopout}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* <Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog Description</DialogDescription>
    </DialogHeader>
    <AnimatePresence>
            {requestStatus === 'viewing' && activeSessionId && (
              <motion.div className="mb-4">
                <LiveScreenView
                  sessionId={activeSessionId}
                  memberName={member.user.name}
                  onEnd={handleScreenShareEnded}
                  onPopout={handlePopout}
                />
              </motion.div>
            )}
          </AnimatePresence>
    <DialogFooter>
      <button>Accept</button>
    </DialogFooter>
  </DialogContent>
</Dialog> */}

         <div className="flex items-center justify-center gap-3 mb-4">
            <Button 
               
                size="icon" 
                variant="ghost" 
                className="text-white border dark:border-[#333232] p-1 hover:bg-white/10 rounded-full"
               
              >
                <Slack className="size-5" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-white border dark:border-[#333232] p-1 hover:bg-white/10 rounded-full"
               
              >
                <LinkedinIcon className="size-5" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-white border dark:border-[#333232] p-1 hover:bg-white/10 rounded-full"
               
              >
                <DiscordLogoIcon className="size-5" />
              </Button>
            
            <Button 
              size="icon" 
              className="rounded-full bg-green-600 hover:bg-green-700 p-1"
            >
              <Phone className="size-4" />
            </Button>
          </div>


          {/* Location */}
          <div className="mb-4">
           <LocationMap
    location={`${member.user.name}'s Location`}
    targetUserId={member.user.id}
    isAdmin={!isCurrentUser}
  />
          </div>
          {/* Shortcuts */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-gray-300">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-1">
             
             <TooltipProvider>
                <Tooltip>
              <TooltipTrigger>
                 <div
                onClick={() => {
                setSelectedMember(member);
               setShowUploader(true);
               }}
                  className={` relative h-32 rounded-2xl text-start overflow-hidden flex flex-col items-center justify-center gap-1 hover:opacity-90`}
                > 
                  <img className="absolute bg-fill h-full w-full inset-0 opacity-90" src="https://i.pinimg.com/736x/6b/29/1d/6b291dc8173cdd7be9119c18b36214ef.jpg" alt="" />
                 
                <div className="z-50 overflow-hidden rounded-full bg-white/30 backdrop-blur-sm p-2">  
                  <Upload className="size-4 text-black" /></div>
                </div>
            </TooltipTrigger>
            <TooltipContent>
         <p>Assign file to {member.user.name} </p>
         </TooltipContent>
        </Tooltip>
               
                
<Tooltip>
  <TooltipTrigger>
     <div
                  onClick={() =>  setShowCompose(true)}
                  className={` relative h-32 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-1 hover:opacity-90`}
                >
                  <img className="absolute bg-fill h-full w-full inset-0 " src="https://i.pinimg.com/1200x/88/5e/d1/885ed1f688e937cdbaef42e4915d2204.jpg" alt="" />
                 
                 <div className="z-50 overflow-hidden rounded-full bg-white/30 backdrop-blur-sm p-2">  
                  <MailIcon className="size-4 text-black" /></div>
                </div>
  </TooltipTrigger>
  <TooltipContent>
    <p>Mail to {member.user.name}</p>
  </TooltipContent>
</Tooltip>

                 <Tooltip>
  <TooltipTrigger>
                 <div
                 onClick={ () => setShowSchedule(true) }
                  className={` relative h-32 rounded-2xl overflow-hidden flex flex-col items-center justify-center hover:opacity-90`}
                >
                  <img className="absolute bg-fill h-full w-full inset-0 " src="https://i.pinimg.com/1200x/c6/7e/23/c67e2310a3b4ae8fb10b68af187a6794.jpg" alt="" />
                 
                <div className="z-50 overflow-hidden rounded-full backdrop-blur-sm p-2">  
                  <Calendar className="size-4 text-black" /></div>
                </div>
  </TooltipTrigger>
  <TooltipContent>
    <p>Schedule with {member.user.name}</p>
  </TooltipContent>
</Tooltip>
</TooltipProvider>
            </div>
          </div>

          {/* Team Info */}
          <div className="mt-6 pt-6 border-t border-neutral-800">
            <h3 className="text-sm font-medium mb-2 text-gray-300">Team</h3>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                {team.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{team.name}</p>
                <p className="text-xs text-gray-400">Since {new Date(team.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

  <MemberFileAssign
  open={showUploader}
  onClose={() => setShowUploader(false)}
  teamId={team.id}
  selectedMember={member} 
  currentUserId={currentMember?.userId ?? currentMember?.id}
  assignMode="member-specific"
/>

{selectDetailMember && (
          <MemberDetailModal
            teamSlug={team.slug}
            memberId={selectDetailMember}
            onClose={() => setSelectDetailMember(null)}
          />
        )}

      {showCompose && (
        <ComposeModal
          onClose={() => { setShowCompose(false); setComposeReplyTo(undefined); }}
          onSent={onSent}
          replyTo={composeReplyTo}
          defaultTo={defaultTo}
          defaultSubject={defaultSubject}
        />
      )}

      {showSchedule && (
        <ScheduleMeetingModal
          member={member}
          team={team}
          onClose={() => setShowSchedule(false)}
          onScheduled={() => {
            setShowSchedule(false);
            toast.success(`Meeting scheduled with ${member.user.name}`);
          }}
        />
      )}
    </>
  );
};

// Schedule Meeting Modal Component
// Replace the ScheduleMeetingModal with this updated version:

function ScheduleMeetingModal({ 
  member, 
  // team, 
  onClose, 
  onScheduled 
}: { 
  member: TeamMemberWithUser; 
  team: Team; 
  onClose: () => void; 
  onScheduled: () => void;
}) {
  const [step, setStep] = useState<'select-event' | 'select-time' | 'confirm'>('select-event');
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  // const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
   const { push } = useRouter();
  // Fetch user's event types
  useEffect(() => {
  
    fetchEvents();
 }, []);

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      setError(null);
      
      let response = await fetch('/api/event/all');
      
      if (!response.ok) {
        response = await fetch('/api/events');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch meeting types');
      }
      
      const data = await response.json();
      console.log('Events data:', data);
      
      const eventsList = data.events || data.data?.events || data || [];
      setEvents(eventsList);
      
      if (eventsList.length === 0) {
        setError('No Event created yet');
      }
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err.message || 'Failed to load meeting types');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Fetch availability when event and date selected
  useEffect(() => {
    if (selectedEvent && selectedDate) {
      fetchAvailability();
    }
  }, [selectedEvent, selectedDate]);

  const fetchAvailability = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(`/api/availability/public/${selectedEvent.id}`);
      if (res.ok) {
        const data = await res.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  // const generateTimeSlots = () => {
  //   if (!selectedDate || !availability?.data) return [];
  //   const dayName = format(selectedDate, 'EEEE').toUpperCase();
  //   const dayAvailability = availability.data.find((d: any) => d.day === dayName);
  //   return dayAvailability?.slots || [];
  // };

  const dayName = selectedDate ? format(selectedDate, 'EEEE').toUpperCase() : null;
const dayAvailability = dayName && availability?.data
  ? availability.data.find((d: any) => d.day === dayName)
  : null;


  const timeSlots = dayAvailability?.slots ?? [];

  const handleSchedule = async () => {
    if (!selectedEvent || !selectedDate || !selectedTime) return;
    
    setIsLoading(true);
    
    const startTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = addMinutes(startTime, selectedEvent.duration);
    
    try {
      // Use the public meeting API - member details auto-filled from prop
      const res = await fetch('/api/meeting/public/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          guestName: member.user.name || member.user.email?.split('@')[0] || 'Guest',
          guestEmail: member.user.email,
          additionalInfo: additionalInfo || undefined,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to schedule meeting');
      }
      
      const data = await res.json();
      console.log('Meeting created:', data);
      
      toast.success(`Meeting scheduled with ${member.user.name}`);
      onScheduled();
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule meeting');
      console.error('Scheduling error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // const timeSlots = generateTimeSlots();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-[#0A0A0A] border-neutral-800 text-white w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            {step !== 'select-event' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8"
                onClick={() => setStep(step === 'confirm' ? 'select-time' : 'select-event')}
              >
                <ChevronLeft className="size-4" />
              </Button>
            )}
            <h2 className="text-lg font-semibold">
              {step === 'select-event' && 'Select Meeting Type'}
              {step === 'select-time' && 'Select Time'}
              {step === 'confirm' && 'Confirm Meeting'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-8">
            <X className="size-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {/* Step 1: Select Event Type */}
          {step === 'select-event' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#222] border border-[#333] rounded-lg mb-4">
                <div className="size-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <User className="size-5 text-white" />
                  
                </div>
                <div>
                  <p className="font-medium text-white">{member.user.name}</p>
                  <p className="text-sm text-gray-400">{member.user.email}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 mb-2">
                Schedule one-on-one with <span className="text-white font-medium">{member.user.name}</span>
              </p>
              
              {isLoadingEvents ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full size-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <Calendar className="size-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400 mb-2">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                   onClick={() => push("/events/page")}
                    className="mt-2"
                  >
                    Create Event Type
                  </Button>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="size-12 mx-auto mb-2 opacity-50" />
                  <p>No Event created yet</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => push("/events/page")}
                    className="mt-3"
                  >
                    Create New Event
                  </Button>
                </div>
              ) : (
                events.map((event) => (
                  <button type="button"
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event);
                      setStep('select-time');
                    }}
                    className="w-full p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">{event.title}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                          <Clock className="size-3" />
                          {event.duration} minutes
                        </p>
                        {event.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{event.description}</p>
                        )}
                      </div>
                      <div className="size-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Calendar className="size-5 text-blue-500" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 'select-time' && selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="size-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar className="size-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedEvent.title}</p>
                  <p className="text-sm text-gray-400">{selectedEvent.duration} minutes</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => setStep('select-event')}
                >
                  Change
                </Button>
              </div>

              <div>
                <label htmlFor="select-date" className="text-sm text-gray-400 mb-2 block">Select Date</label>
                <input
                  id="select-date"
                  type="date"
                  aria-label="Select date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Available Times for {format(selectedDate, 'EEEE, MMMM d')}
                </label>
                {timeSlots.length === 0 ? (
                  <div className="text-center py-6 bg-neutral-900 rounded-lg border border-neutral-800">
                    <p className="text-sm text-gray-500">No available slots for this date</p>
                    <p className="text-xs text-gray-600 mt-1">Try selecting a different date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time: string) => (
                      <button type="button"
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          setStep('confirm');
                        }}
                        className="p-2 rounded-lg text-sm font-medium transition-colors bg-neutral-800 text-gray-300 hover:bg-blue-600 hover:text-white"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && selectedEvent && selectedTime && (
            <div className="space-y-4">
              {/* Member Info Card */}
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <h4 className="text-sm font-medium text-purple-400 mb-2">One-on-One With</h4>
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <User className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{member.user.name}</p>
                    <p className="text-sm text-gray-400">{member.user.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                <h3 className="font-medium mb-3 text-blue-400">Meeting Details</h3>
                <div className="gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span>{selectedEvent.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span>{selectedEvent.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="font-medium text-blue-400">{selectedTime}</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="additional-info" className="text-sm text-gray-400 mb-2 block">Additional Info (Optional)</label>
                <textarea
                  aria-label="Additional info"
                  id="additional-info"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Add any notes or agenda items&hellip;"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm min-h-[80px] resize-none focus:border-blue-500 focus:outline-none"
                />
              </div>

              <Button 
                onClick={handleSchedule}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 h-11"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scheduling&hellip;
                  </span>
                ) : (
                  'Confirm Meeting'
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setStep('select-time')}
                className="w-full text-gray-400 hover:text-white"
              >
                Back to Time Selection
              </Button>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}

// function ScheduleMeetingModal({ 
//   member, 
//   team, 
//   onClose, 
//   onScheduled 
// }: { 
//   member: TeamMemberWithUser; 
//   team: Team; 
//   onClose: () => void; 
//   onScheduled: () => void;
// }) {
//   const [step, setStep] = useState<'select-event' | 'select-time' | 'confirm'>('select-event');
//   const [events, setEvents] = useState<EventType[]>([]);
//   const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [selectedTime, setSelectedTime] = useState<string | null>(null);
//   const [availability, setAvailability] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingEvents, setIsLoadingEvents] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [description, setDescription] = useState('');

//   // Fetch user's event types
//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       setIsLoadingEvents(true);
//       setError(null);
      
//       // Try multiple endpoints in case the structure is different
//       let response = await fetch('/api/event/all');
      
//       if (!response.ok) {
//         // Try alternative endpoint
//         response = await fetch('/api/events');
//       }
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch meeting types');
//       }
      
//       const data = await response.json();
//       console.log('Events data:', data); // Debug log
      
//       // Handle different response structures
//       const eventsList = data.events || data.data?.events || data || [];
//       setEvents(eventsList);
      
//       if (eventsList.length === 0) {
//         setError('No meeting types found. Create one in your dashboard first.');
//       }
//     } catch (err: any) {
//       console.error('Failed to fetch events:', err);
//       setError(err.message || 'Failed to load meeting types');
//     } finally {
//       setIsLoadingEvents(false);
//     }
//   };

//   // Fetch availability when event and date selected
//   useEffect(() => {
//     if (selectedEvent && selectedDate) {
//       fetchAvailability();
//     }
//   }, [selectedEvent, selectedDate]);

//   const fetchAvailability = async () => {
//     if (!selectedEvent) return;
//     try {
//       const res = await fetch(`/api/availability/public/${selectedEvent.id}`);
//       if (res.ok) {
//         const data = await res.json();
//         setAvailability(data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch availability:', error);
//     }
//   };

//   const generateTimeSlots = () => {
//     if (!selectedDate || !availability?.data) return [];
//     const dayName = format(selectedDate, 'EEEE').toUpperCase();
//     const dayAvailability = availability.data.find((d: any) => d.day === dayName);
//     return dayAvailability?.slots || [];
//   };

//   const handleSchedule = async () => {
//     if (!selectedEvent || !selectedDate || !selectedTime) return;
    
//     setIsLoading(true);
    
//     const startTime = new Date(selectedDate);
//     const [hours, minutes] = selectedTime.split(':').map(Number);
//     startTime.setHours(hours, minutes, 0, 0);
    
//     const endTime = addMinutes(startTime, selectedEvent.duration);
    
//     try {
//       const res = await fetch('/api/meetings/team/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           eventId: selectedEvent.id,
//           startTime: startTime.toISOString(),
//           endTime: endTime.toISOString(),
//           title: `${selectedEvent.title} with ${member.user.name}`,
//           description: description,
//           teamId: team.id,
//           selectedMemberIds: [member.user.id],
//           externalAttendees: []
//         }),
//       });
      
//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to schedule meeting');
//       }
      
//       const data = await res.json();
//       console.log('Meeting created:', data);
      
//       toast.success(`Meeting scheduled with ${member.user.name}`);
//       onScheduled();
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to schedule meeting');
//       console.error('Scheduling error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const timeSlots = generateTimeSlots();

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <Card className="bg-[#0A0A0A] border-neutral-800 text-white w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b border-neutral-800">
//           <div className="flex items-center gap-2">
//             {step !== 'select-event' && (
//               <Button 
//                 variant="ghost" 
//                 size="icon" 
//                 className="size-8"
//                 onClick={() => setStep(step === 'confirm' ? 'select-time' : 'select-event')}
//               >
//                 <ChevronLeft className="size-4" />
//               </Button>
//             )}
//             <h2 className="text-lg font-semibold">
//               {step === 'select-event' && 'Select Meeting Type'}
//               {step === 'select-time' && 'Select Time'}
//               {step === 'confirm' && 'Confirm Meeting'}
//             </h2>
//           </div>
//           <Button variant="ghost" size="icon" onClick={onClose} className="size-8">
//             <X className="size-4" />
//           </Button>
//         </div>

//         <ScrollArea className="flex-1 p-4">
//           {/* Step 1: Select Event Type */}
//           {step === 'select-event' && (
//             <div className="gap-y-3">
//               <p className="text-sm text-gray-400 mb-4">
//                 Schedule with <span className="text-white font-medium">{member.user.name}</span>
//               </p>
              
//               {isLoadingEvents ? (
//                 <div className="flex items-center justify-center py-8">
//                   <div className="animate-spin rounded-full size-8 border-b-2 border-blue-500"></div>
//                 </div>
//               ) : error ? (
//                 <div className="text-center py-8">
//                   <Calendar className="size-12 mx-auto mb-3 text-gray-600" />
//                   <p className="text-gray-400 mb-2">{error}</p>
//                   <Button 
//                     variant="outline" 
//                     size="sm"
//                     onClick={() => window.open('/events', '_blank')}
//                     className="mt-2"
//                   >
//                     Create Event Type
//                   </Button>
//                 </div>
//               ) : events.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <Calendar className="size-12 mx-auto mb-2 opacity-50" />
//                   <p>No meeting types available</p>
//                   <Button 
//                     variant="outline" 
//                     size="sm"
//                     onClick={() => window.open('/events/new', '_blank')}
//                     className="mt-3"
//                   >
//                     Create New Event
//                   </Button>
//                 </div>
//               ) : (
//                 events.map((event) => (
//                   <button
//                     key={event.id}
//                     onClick={() => {
//                       setSelectedEvent(event);
//                       setStep('select-time');
//                     }}
//                     className="w-full p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left transition-colors group"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">{event.title}</h3>
//                         <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
//                           <Clock className="size-3" />
//                           {event.duration} minutes
//                         </p>
//                         {event.description && (
//                           <p className="text-xs text-gray-500 mt-1 line-clamp-1">{event.description}</p>
//                         )}
//                       </div>
//                       <div className="size-10 bg-blue-500/10 rounded-full flex items-center justify-center">
//                         <Calendar className="size-5 text-blue-500" />
//                       </div>
//                     </div>
//                   </button>
//                 ))
//               )}
//             </div>
//           )}

//           {/* Step 2: Select Date & Time */}
//           {step === 'select-time' && selectedEvent && (
//             <div className="gap-y-4">
//               <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
//                 <div className="size-10 bg-blue-500 rounded-lg flex items-center justify-center">
//                   <Calendar className="size-5 text-white" />
//                 </div>
//                 <div>
//                   <p className="font-medium">{selectedEvent.title}</p>
//                   <p className="text-sm text-gray-400">{selectedEvent.duration} minutes</p>
//                 </div>
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   className="ml-auto"
//                   onClick={() => setStep('select-event')}
//                 >
//                   Change
//                 </Button>
//               </div>

//               <div>
//                 <label className="text-sm text-gray-400 mb-2 block">Select Date</label>
//                 <input
//                   type="date"
//                   value={format(selectedDate, 'yyyy-MM-dd')}
//                   onChange={(e) => setSelectedDate(new Date(e.target.value))}
//                   min={format(new Date(), 'yyyy-MM-dd')}
//                   className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm text-gray-400 mb-2 block">
//                   Available Times for {format(selectedDate, 'EEEE, MMMM d')}
//                 </label>
//                 {timeSlots.length === 0 ? (
//                   <div className="text-center py-6 bg-neutral-900 rounded-lg border border-neutral-800">
//                     <p className="text-sm text-gray-500">No available slots for this date</p>
//                     <p className="text-xs text-gray-600 mt-1">Try selecting a different date</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-3 gap-2">
//                     {timeSlots.map((time: string) => (
//                       <button
//                         key={time}
//                         onClick={() => {
//                           setSelectedTime(time);
//                           setStep('confirm');
//                         }}
//                         className="p-2 rounded-lg text-sm font-medium transition-colors bg-neutral-800 text-gray-300 hover:bg-blue-600 hover:text-white"
//                       >
//                         {time}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Step 3: Confirm */}
//           {step === 'confirm' && selectedEvent && selectedTime && (
//             <div className="gap-y-4">
//               <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
//                 <h3 className="font-medium mb-3 text-blue-400">Meeting Details</h3>
//                 <div className="gap-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">With:</span>
//                     <span className="font-medium">{member.user.name}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Type:</span>
//                     <span>{selectedEvent.title}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Duration:</span>
//                     <span>{selectedEvent.duration} minutes</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Date:</span>
//                     <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Time:</span>
//                     <span className="font-medium text-blue-400">{selectedTime}</span>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="text-sm text-gray-400 mb-2 block">Description/Agenda (Optional)</label>
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="Add meeting agenda or notes&hellip;"
//                   className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm min-h-[80px] resize-none focus:border-blue-500 focus:outline-none"
//                 />
//               </div>

//               <Button 
//                 onClick={handleSchedule}
//                 disabled={isLoading}
//                 className="w-full bg-blue-600 hover:bg-blue-700 h-11"
//               >
//                 {isLoading ? (
//                   <span className="flex items-center gap-2">
//                     <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     Scheduling&hellip;
//                   </span>
//                 ) : (
//                   'Confirm Meeting'
//                 )}
//               </Button>
              
//               <Button 
//                 variant="ghost" 
//                 onClick={() => setStep('select-time')}
//                 className="w-full text-gray-400 hover:text-white"
//               >
//                 Back to Time Selection
//               </Button>
//             </div>
//           )}
//         </ScrollArea>
//       </Card>
//     </div>
//   );
// }

export default ProfileSidebar;

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (diff < 7 * 86400000) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface GmailMessage {
  id: string
  threadId: string
  from: { email: string; name?: string }
  subject: string
  date: string
  bodyPlain: string
}

interface Attachment {
  id: string
  file: File
  name: string
  size: number
  type: string
  previewUrl?: string
  uploading: boolean
  uploaded: boolean
  error?: string
  fileId?: string // Google Drive file ID after upload
}

interface ComposeModalProps {
  onClose: () => void
  onSent?: () => void
  replyTo?: GmailMessage
  defaultTo?: string
  defaultSubject?: string
}

const schedulePresets = [
  { label: 'Tomorrow morning', getDate: () => getTomorrowAt(8, 0) },
  { label: 'Tomorrow afternoon', getDate: () => getTomorrowAt(13, 0) },
  { label: 'Saturday morning', getDate: () => getNextDayAt(6, 8, 0) },
  { label: 'Monday morning', getDate: () => getNextDayAt(1, 8, 0) },
]

function getTomorrowAt(hours: number, minutes: number) {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function getNextDayAt(dayOfWeek: number, hours: number, minutes: number) {
  const date = new Date()
  const currentDay = date.getDay()
  const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7
  date.setDate(date.getDate() + daysUntil)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎥'
  if (type.startsWith('audio/')) return '🎵'
  if (type.includes('pdf')) return '📄'
  if (type.includes('word') || type.includes('document')) return '📝'
  if (type.includes('excel') || type.includes('sheet')) return '📊'
  if (type.includes('zip') || type.includes('compressed')) return '📦'
  return '📎'
}

export function ComposeModal({
  onClose,
  onSent,
  replyTo,
  defaultTo = '',
  defaultSubject = '',
}: ComposeModalProps) {
  const [to, setTo] = useState(replyTo ? replyTo.from.email : defaultTo)
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : defaultSubject)
  const [body, setBody] = useState(
    replyTo
      ? `\n\n---\nOn ${formatDate(replyTo.date)}, ${replyTo.from.name ?? replyTo.from.email} wrote:\n${replyTo.bodyPlain.slice(0, 300)}…`
      : ''
  )
  const [cc, setCc] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Scheduling states
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  
  const scheduleRef = useRef<HTMLDivElement>(null)

  // Close schedule dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (scheduleRef.current && !scheduleRef.current.contains(event.target as Node)) {
        setShowScheduleDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup preview URLs on unmount
  // useEffect(() => {
  //   return () => {
  //     attachments.forEach(att => {
  //       if (att.previewUrl) URL.revokeObjectURL(att.previewUrl)
  //     })
  //   }
  // }, [attachments])

  const previewUrlsRef = useRef<Set<string>>(new Set());


  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploading: true,
      uploaded: false,
    }))

    setAttachments(prev => [...prev, ...newAttachments])

    // Upload each file to your storage (S3, Google Drive, etc.)
    // for (const attachment of newAttachments) {
    //   try {
    //     const formData = new FormData()
    //     formData.append('file', attachment.file)
    //     formData.append('purpose', 'email-attachment')

    //     const res = await fetch('/api/uploads/email-attachment', {
    //       method: 'POST',
    //       body: formData,
    //     })

    //     if (!res.ok) throw new Error('Upload failed')
        
    //     const data = await res.json()
        
    //     setAttachments(prev => prev.map(att => 
    //       att.id === attachment.id 
    //         ? { ...att, uploading: false, uploaded: true, fileId: data.fileId || data.url }
    //         : att
    //     ))
    //   } catch (err: any) {
    //     setAttachments(prev => prev.map(att => 
    //       att.id === attachment.id 
    //         ? { ...att, uploading: false, error: err.message }
    //         : att
    //     ))
    //   }
    // }

    await Promise.all(
  newAttachments.map(async (attachment) => {
    try {
      const formData = new FormData();
      formData.append('file', attachment.file);
      formData.append('purpose', 'email-attachment');
      const res = await fetch('/api/uploads/email-attachment', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setAttachments(prev =>
        prev.map(att =>
          att.id === attachment.id
            ? { ...att, uploading: false, uploaded: true, fileId: data.fileId || data.url }
            : att
        )
      );
    } catch (err: any) {
      setAttachments(prev =>
        prev.map(att =>
          att.id === attachment.id
            ? { ...att, uploading: false, error: err.message }
            : att
        )
      );
    }
  })
);

//   const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
// if (previewUrl) previewUrlsRef.current.add(previewUrl);

  }, [])

  // const removeAttachment = (id: string) => {
  //   setAttachments(prev => {
  //     const att = prev.find(a => a.id === id)
  //     if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl)
  //     return prev.filter(a => a.id !== id)
  //   })
  // } \\

  const removeAttachment = (id: string) => {
  setAttachments(prev => {
    const att = prev.find(a => a.id === id);
    if (att?.previewUrl) {
      URL.revokeObjectURL(att.previewUrl);
      previewUrlsRef.current.delete(att.previewUrl);
    }
    return prev.filter(a => a.id !== id);
  });
};

useEffect(() => {
  return () => {
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
  };
}, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const generateEmailBody = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject first')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const res = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to generate')
      }
      
      const data = await res.json()
      setBody(data.content.trim())
    } catch (e: any) {
      setError('Failed to generate email: ' + e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScheduleSelect = (date: Date) => {
    setScheduledAt(date)
    setShowScheduleDropdown(false)
  }

  const handleCustomSchedule = () => {
    if (customDate && customTime) {
      const date = new Date(`${customDate}T${customTime}`)
      setScheduledAt(date)
      setShowScheduleDropdown(false)
    }
  }

  const clearSchedule = () => {
    setScheduledAt(null)
    setCustomDate('')
    setCustomTime('')
  }

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError('To, subject, and body are required')
      return
    }

    // Check if attachments are still uploading
    // const uploadingCount = attachments.filter(a => a.uploading).length
    // if (uploadingCount > 0) {
    //   setError(`Wait for ${uploadingCount} file(s) to finish uploading`)
    //   return
    // }

    let uploadingCount = 0;
for (const a of attachments) { if (a.uploading) uploadingCount++; }
if (uploadingCount > 0) {
  setError(`Wait for ${uploadingCount} file(s) to finish uploading`);
  return;
}

    setIsSending(true)
    setError(null)
    try {
      const res = await fetch('/api/integrations/google/gmail/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: scheduledAt ? 'schedule' : 'send',
          to: to.split(',').map((e) => e.trim()),
          subject,
          emailBody: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">${body.replace(/\n/g, '<br>')}</div>`,
          cc: cc ? cc.split(',').map((e) => e.trim()) : undefined,
          replyToMessageId: replyTo?.id,
          threadId: replyTo?.threadId,
          scheduledAt: scheduledAt?.toISOString(),
          // attachments: attachments.filter(a => a.uploaded && a.fileId).map(a => ({
          //   fileId: a.fileId,
          //   filename: a.name,
          //   mimeType: a.type,
          // })),
          attachments: attachments.reduce((acc: { fileId: string; filename: string; mimeType: string }[], a) => {
            if (a.uploaded && a.fileId) {
              acc.push({ fileId: a.fileId, filename: a.name, mimeType: a.type });
            }
            return acc;
          }, []) as { fileId: string; filename: string; mimeType: string }[],
        }),
      }) 
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Send failed')
      onSent?.()
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSending(false)
    }
  }

  const formatScheduledTime = (date: Date) => {
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    })
  }

  return (
    <div 
      className={`fixed bottom-5 right-5 w-[520px] h-[60vh] bg-white dark:bg-[#191919] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#222] z-[9990] flex flex-col overflow-hidden ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-[#ddddde] dark:bg-[#111] flex items-center justify-between">
        <span className="text-[13.5px] font-semibold text-white flex items-center gap-2">
          {replyTo ? '↩️ Reply' : <div className='flex items-center gap-2'> 
              <MailFilledIcon className='text-white size-4'/> 
            <p className='text-white'>New Message</p>
            </div>}
        </span>
        <button type="button"
          onClick={onClose} 
          className="bg-transparent border-none text-gray-400 hover:text-white cursor-pointer text-lg p-0 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Fields */}
      <div className="border-b border-gray-100 dark:border-[#222]">
        <div className="flex items-center border-b border-gray-50 dark:border-[#222] px-4">
          <span className="text-xs text-gray-400 w-[52px] flex-shrink-0">To</span>
          <Input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@email.com"
            className="flex-1 border-none outline-none py-2.5 text-[13.5px] text-gray-900 dark:text-gray-100 bg-transparent placeholder-gray-400"
          />
          {!showCc && (
            <Button
            variant="outline"
              onClick={() => setShowCc(true)} 
              className="bg-transparent border-none cursor-pointer text-gray-400 text-[11.5px] hover:text-gray-600 dark:hover:text-gray-300"
            >
              Cc
            </Button>
          )}
        </div>
        
        {showCc && (
          <div className="flex items-center border-b border-gray-50 dark:border-[#222] px-4">
            <span className="text-xs text-gray-400 w-[52px] flex-shrink-0">Cc</span>
            <Input
              value={cc} 
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@email.com"
              className="flex-1 border-none outline-none py-2.5 text-[13.5px] text-gray-900 hover:dark:bg-[#222] dark:text-gray-100 bg-transparent placeholder-gray-400"
            />
          </div>
        )}
        
        <div className="flex items-center px-4">
          <span className="text-xs text-gray-400 w-[52px] flex-shrink-0">Subject</span>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="flex-1 border-none outline-none py-2.5 text-[13.5px] text-gray-900 hover:dark:bg-[#222] dark:text-gray-100 bg-transparent placeholder-gray-400"
          />
          <Button
          variant="outline"
            onClick={generateEmailBody}
            disabled={isGenerating || !subject.trim()}
            className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            title="Generate email body with AI"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin size-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating&hellip;
              </>
            ) : (
              <>
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Body */}
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your message&hellip; (or drag & drop files here)"
        className="flex-1 border-none outline-none p-4 text-[13.5px] text-gray-900 dark:text-gray-100 resize-none font-inherit leading-relaxed min-h-[140px] bg-transparent placeholder-gray-400"
      />

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#1a1a2e]/50">
          <div className="flex flex-wrap gap-2">
            {attachments.map((att) => (
              <div 
                key={att.id}
                className={`relative group flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  att.error 
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                    : att.uploaded 
                      ? 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600' 
                      : 'bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                {/* Preview for images */}
                {att.previewUrl && (
                  <div className="relative size-10 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={att.previewUrl} 
                      alt={att.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* File icon for non-images */}
                {!att.previewUrl && (
                  <span className="text-lg flex-shrink-0">{getFileIcon(att.type)}</span>
                )}

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                    {att.name}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {formatFileSize(att.size)}
                  </span>
                </div>

                {/* Uploading spinner */}
                {att.uploading && (
                  <svg className="animate-spin size-4 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}

                {/* Error icon */}
                {att.error && (
                  <svg className="size-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}

                {/* Success check */}
                {att.uploaded && !att.error && (
                  <svg className="size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}

                {/* Remove button */}
                <button type="button"
                  aria-label="Remove attachment"
                  onClick={() => removeAttachment(att.id)}
                  className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                >
                  <svg className="size-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-[#222] flex items-center justify-between bg-gray-50 dark:bg-[#1a1a2e]/50">
       <AnimateIcon animateOnHover> <Button 
              
              variant="ghost" 
              
            onClick={handleSend}
            disabled={isSending || attachments.some(a => a.uploading)}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-[13.5px] font-semibold disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSending ? (
              <>
                <svg className="animate-spin size-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {scheduledAt ? 'Scheduling&hellip;' : 'Sending&hellip;'}
              </>
            ) : (
              <>
                {scheduledAt ? 'Schedule' : <div className="flex items-center gap-2">
                   <SendIcon className="size-4"/>
                   <span>Send</span>
                </div> }
              </>
            )}
          </Button>
          </AnimateIcon>
         
        <div className="flex items-center gap-3">
          {/* Attachment Button */}
         
          {/* Schedule Dropdown */}
          <div className="relative" ref={scheduleRef}>
            <Button
            variant="outline"
              onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                scheduledAt 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {scheduledAt ? formatScheduledTime(scheduledAt) : 'Schedule send'}
              {scheduledAt && (
                <span 
                  onClick={(e) => { e.stopPropagation(); clearSchedule(); }}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </span>
              )}
            </Button>

            {showScheduleDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-[#1a1a2e] rounded-xl shadow-2xl border border-gray-200 dark:border-[#222] overflow-hidden z-50">
                <div className="p-3 border-b border-gray-100 dark:border-[#222]">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Schedule send</p>
                </div>
                
                <div className="p-2">
                  {schedulePresets.map((preset) => {
                    const date = preset.getDate()
                    return (
                      <Button
                      variant="outline"
                        key={preset.label}
                        onClick={() => handleScheduleSelect(date)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
                      >
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-gray-900 dark:text-gray-100">{preset.label}</span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                          {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().substring(0, 3)} {date.getDate()}
                        </span>
                      </Button>
                    )
                  })}
                  
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#222]">
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-3 mb-2">Custom date & time</p>
                    <div className="px-3 gap-y-2">
                      <Input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                      <Input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                      <Button
                      variant="outline"
                        onClick={handleCustomSchedule}
                        disabled={!customDate || !customTime}
                        className="w-full py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Set custom time
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
           <Input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files)}
            multiple
            className="hidden"
          />
          <Button
          size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center  text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Attach file"
          >
            <PaperclipIcon className="size-4" />
          </Button>
         
        </div>

        
      </div>
    </div>
  )
}


// its working but without mail attachment 
// function formatDate(iso: string) {
//   const d = new Date(iso)
//   const now = new Date()
//   const diff = now.getTime() - d.getTime()
//   if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
//   if (diff < 7 * 86400000) return d.toLocaleDateString('en-US', { weekday: 'short' })
//   return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
// }

// interface GmailMessage {
//   id: string
//   threadId: string
//   from: { email: string; name?: string }
//   subject: string
//   date: string
//   bodyPlain: string
// }

// interface ComposeModalProps {
//   onClose: () => void
//   onSent?: () => void
//   replyTo?: GmailMessage
//   defaultTo?: string
//   defaultSubject?: string
// }

// const schedulePresets = [
//   { label: 'Tomorrow morning', getDate: () => getTomorrowAt(8, 0) },
//   { label: 'Tomorrow afternoon', getDate: () => getTomorrowAt(13, 0) },
//   { label: 'Saturday morning', getDate: () => getNextDayAt(6, 8, 0) },
//   { label: 'Monday morning', getDate: () => getNextDayAt(1, 8, 0) },
// ]

// function getTomorrowAt(hours: number, minutes: number) {
//   const date = new Date()
//   date.setDate(date.getDate() + 1)
//   date.setHours(hours, minutes, 0, 0)
//   return date
// }

// function getNextDayAt(dayOfWeek: number, hours: number, minutes: number) {
//   const date = new Date()
//   const currentDay = date.getDay()
//   const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7
//   date.setDate(date.getDate() + daysUntil)
//   date.setHours(hours, minutes, 0, 0)
//   return date
// }

// export function ComposeModal({
//   onClose,
//   onSent,
//   replyTo,
//   defaultTo = '',
//   defaultSubject = '',
// }: ComposeModalProps) {
//   const [to, setTo] = useState(replyTo ? replyTo.from.email : defaultTo)
//   const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : defaultSubject)
//   const [body, setBody] = useState(
//     replyTo
//       ? `\n\n---\nOn ${formatDate(replyTo.date)}, ${replyTo.from.name ?? replyTo.from.email} wrote:\n${replyTo.bodyPlain.slice(0, 300)}…`
//       : ''
//   )
//   const [cc, setCc] = useState('')
//   const [showCc, setShowCc] = useState(false)
//   const [isSending, setIsSending] = useState(false)
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [error, setError] = useState<string | null>(null)
  
//   // Scheduling states
//   const [scheduledAt, setScheduledAt] = useState<Date | null>(null)
//   const [showScheduleDropdown, setShowScheduleDropdown] = useState(false)
//   const [customDate, setCustomDate] = useState('')
//   const [customTime, setCustomTime] = useState('')
  
//   const scheduleRef = useRef<HTMLDivElement>(null)

//   // Close schedule dropdown on outside click
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (scheduleRef.current && !scheduleRef.current.contains(event.target as Node)) {
//         setShowScheduleDropdown(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => document.removeEventListener('mousedown', handleClickOutside)
//   }, [])

// //   const generateEmailBody = async () => {
// //     if (!subject.trim()) {
// //       setError('Please enter a subject first')
// //       return
// //     }
    
// //     setIsGenerating(true)
// //     setError(null)
    
// //     try {
// //       const response = await aiRouter.route({
// //         intent: 'generate_email_body',
// //         prompt: `Write a professional email body for the following subject line. Make it concise, natural, and appropriate for business communication.
        
// // Subject: ${subject}
// // ${body.trim() ? `\nUser has started writing: ${body.substring(0, 200)}&hellip; (incorporate or complete this thought)` : ''}

// // Requirements:
// // - Professional but friendly tone
// // - Concise (2-4 paragraphs max)
// // - Include appropriate greeting and sign-off
// // - Only return the email body text, no subject line`,
// //         context: { subject, existingBody: body },
// //         userId: 'current-user', // Update as needed
// //         requireJson: false,
// //       })
      
// //       setBody(response.content.trim())
// //     } catch (e: any) {
// //       setError('Failed to generate email: ' + e.message)
// //     } finally {
// //       setIsGenerating(false)
// //     }
// //   }

// const generateEmailBody = async () => {
//   if (!subject.trim()) {
//     setError('Please enter a subject first')
//     return
//   }
  
//   setIsGenerating(true)
//   setError(null)
  
//   try {
//     const res = await fetch('/api/ai/generate-email', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ subject, body })
//     })
    
//     if (!res.ok) {
//       const errorData = await res.json()
//       throw new Error(errorData.error || 'Failed to generate')
//     }
    
//     const data = await res.json()
//     setBody(data.content.trim())
//   } catch (e: any) {
//     setError('Failed to generate email: ' + e.message)
//   } finally {
//     setIsGenerating(false)
//   }
// }

//   const handleScheduleSelect = (date: Date) => {
//     setScheduledAt(date)
//     setShowScheduleDropdown(false)
//   }

//   const handleCustomSchedule = () => {
//     if (customDate && customTime) {
//       const date = new Date(`${customDate}T${customTime}`)
//       setScheduledAt(date)
//       setShowScheduleDropdown(false)
//     }
//   }

//   const clearSchedule = () => {
//     setScheduledAt(null)
//     setCustomDate('')
//     setCustomTime('')
//   }

//   const handleSend = async () => {
//     if (!to.trim() || !subject.trim() || !body.trim()) {
//       setError('To, subject, and body are required')
//       return
//     }
//     setIsSending(true)
//     setError(null)
//     try {
//       const res = await fetch('/api/integrations/google/gmail/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: scheduledAt ? 'schedule' : 'send',
//           to: to.split(',').map((e) => e.trim()),
//           subject,
//           emailBody: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">${body.replace(/\n/g, '<br>')}</div>`,
//           cc: cc ? cc.split(',').map((e) => e.trim()) : undefined,
//           replyToMessageId: replyTo?.id,
//           threadId: replyTo?.threadId,
//           scheduledAt: scheduledAt?.toISOString(), // Pass scheduled time to API
//         }),
//       })
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error ?? 'Send failed')
//       onSent?.()
//       onClose()
//     } catch (e: any) {
//       setError(e.message)
//     } finally {
//       setIsSending(false)
//     }
//   }

//   const formatScheduledTime = (date: Date) => {
//     return date.toLocaleString('en-US', { 
//       weekday: 'short', 
//       month: 'short', 
//       day: 'numeric', 
//       hour: 'numeric', 
//       minute: '2-digit' 
//     })
//   }

//   return (
//     <div className="fixed bottom-5 right-5 w-[520px] bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#222] z-[9990] flex flex-col overflow-hidden">
//       {/* Header */}
//       <div className="px-4 py-3 bg-[#1a1a2e] dark:bg-black flex items-center justify-between">
//         <span className="text-[13.5px] font-semibold text-white flex items-center gap-2">
//           {replyTo ? '↩️ Reply' : '✉️ New Message'}
//         </span>
//         <button 
//           onClick={onClose} 
//           className="bg-transparent border-none text-gray-400 hover:text-white cursor-pointer text-lg p-0 transition-colors"
//         >
//           ×
//         </button>
//       </div>

//       {/* Fields */}
//       <div className="border-b border-gray-100 dark:border-[#222]">
//         <div className="flex items-center border-b border-gray-50 dark:border-gray-800 px-4">
//           <span className="text-xs text-gray-400 w-[52px] flex-shrink-0">To</span>
//           <input
//             value={to}
//             onChange={(e) => setTo(e.target.value)}
//             placeholder="recipient@email.com"
//             className="flex-1 border-none outline-none py-2.5 text-[13.5px] text-gray-900 dark:text-gray-100 bg-transparent placeholder-gray-400"
//           />
//           {!showCc && (
//             <button 
//               onClick={() => setShowCc(true)} 
//               className="bg-transparent border-none cursor-pointer text-gray-400 text-[11.5px] hover:text-gray-600 dark:hover:text-gray-300"
//             >
//               Cc
//             </button>
//           )}
//         </div>
        
//         {showCc && (
//           <div className="flex items-center border-b border-gray-50 dark:border-gray-800 px-4">
//             <span className="text-xs text-gray-400 w-[52px] flex-shrink-0">Cc</span>
//             <input
//               value={cc}
//               onChange={(e) => setCc(e.target.value)}
//               placeholder="cc@email.com"
//               className="flex-1 border-none outline-none py-2.5 text-[13.5px] text-gray-900 dark:bg-[#1a1a2e] dark:text-gray-100 bg-transparent placeholder-gray-400"
//             />
//           </div>
//         )}
        
//         <div className="flex items-center px-4">
//           <span className="text-xs text-gray-400 w-[52px] flex-shrink-0">Subject</span>
//           <input
//             value={subject}
//             onChange={(e) => setSubject(e.target.value)}
//             placeholder="Subject"
//             className="flex-1 border-none outline-none py-2.5 text-[13.5px] text-gray-900 dark:bg-[#1a1a2e] dark:text-gray-100 bg-transparent placeholder-gray-400"
//           />
//           {/* AI Generate Button - appears when subject exists and no body or on hover */}
//           <button
//             onClick={generateEmailBody}
//             disabled={isGenerating || !subject.trim()}
//             className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
//             title="Generate email body with AI"
//           >
//             {isGenerating ? (
//               <>
//                 <svg className="animate-spin size-3" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                 </svg>
//                 Generating&hellip;
//               </>
//             ) : (
//               <>
//                 <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                 </svg>
//                 Generate
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Body */}
//       <textarea
//         value={body}
//         onChange={(e) => setBody(e.target.value)}
//         placeholder="Write your message&hellip;"
//         className="flex-1 border-none outline-none p-4 text-[13.5px] text-gray-900 dark:text-gray-100 resize-none font-inherit leading-relaxed min-h-[180px] bg-transparent placeholder-gray-400"
//       />

//       {error && (
//         <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800">
//           <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
//         </div>
//       )}

//       {/* Footer */}
//       <div className="px-4 py-3 border-t border-gray-100 dark:border-[#222] flex items-center justify-between bg-gray-50 dark:bg-[#1a1a2e]/50">
//         <div className="flex items-center gap-3">
//           {/* Schedule Dropdown */}
//           <div className="relative" ref={scheduleRef}>
//             <button
//               onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
//                 scheduledAt 
//                   ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
//                   : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
//               }`}
//             >
//               <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               {scheduledAt ? formatScheduledTime(scheduledAt) : 'Schedule send'}
//               {scheduledAt && (
//                 <span 
//                   onClick={(e) => { e.stopPropagation(); clearSchedule(); }}
//                   className="ml-1 hover:text-red-500"
//                 >
//                   ×
//                 </span>
//               )}
//             </button>

//             {showScheduleDropdown && (
//               <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-[#1a1a2e] rounded-xl shadow-2xl border border-gray-200 dark:border-[#222] overflow-hidden z-50">
//                 <div className="p-3 border-b border-gray-100 dark:border-[#222]">
//                   <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Schedule send</p>
//                 </div>
                
//                 <div className="p-2">
//                   {schedulePresets.map((preset) => {
//                     const date = preset.getDate()
//                     return (
//                       <button
//                         key={preset.label}
//                         onClick={() => handleScheduleSelect(date)}
//                         className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
//                       >
//                         <div className="flex flex-col">
//                           <span className="text-[13px] font-medium text-gray-900 dark:text-gray-100">{preset.label}</span>
//                           <span className="text-[11px] text-gray-500 dark:text-gray-400">
//                             {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
//                           </span>
//                         </div>
//                         <span className="text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
//                           {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().substring(0, 3)} {date.getDate()}
//                         </span>
//                       </button>
//                     )
//                   })}
                  
//                   <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#222]">
//                     <p className="text-xs text-gray-500 dark:text-gray-400 px-3 mb-2">Custom date & time</p>
//                     <div className="px-3 gap-y-2">
//                       <input
//                         type="date"
//                         value={customDate}
//                         onChange={(e) => setCustomDate(e.target.value)}
//                         className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
//                       />
//                       <input
//                         type="time"
//                         value={customTime}
//                         onChange={(e) => setCustomTime(e.target.value)}
//                         className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
//                       />
//                       <button
//                         onClick={handleCustomSchedule}
//                         disabled={!customDate || !customTime}
//                         className="w-full py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         Set custom time
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={handleSend}
//             disabled={isSending}
//             className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-[13.5px] font-semibold disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//           >
//             {isSending ? (
//               <>
//                 <svg className="animate-spin size-4" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                 </svg>
//                 {scheduledAt ? 'Scheduling&hellip;' : 'Sending&hellip;'}
//               </>
//             ) : (
//               <>
//                 {scheduledAt ? 'Schedule' : '📤 Send'}
//               </>
//             )}
//           </button>
//         </div>

//         <button 
//           onClick={onClose} 
//           className="bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-[13px]"
//         >
//           Discard
//         </button>
//       </div>
//     </div>
//   )
// }
