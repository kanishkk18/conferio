'use client';
import React, { useState } from 'react';
import { Phone, Video, Loader2 } from 'lucide-react';
import { useCall } from 'contexts/CallContext';
import { motion } from 'framer-motion';
import { PhoneCall } from '../animate-ui/icons/phone-call';
import BrandZoomIcon from '../ui/brand-zoom-icon';
import { Button } from '../ui/button';
import { AnimateIcon } from '../animate-ui/icons/icon';
import { Cctv } from '../animate-ui/icons/cctv';
import { SendIcon } from '../animate-ui/icons/send';
import { ComposeModal } from '../ProfileSidebar';

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

interface CallButtonsProps {
  targetUserId: string;
  targetUserName: string;
  targetUserImage?: string;
  variant?: 'icon' | 'full';
  className?: string;
  onClose?: () => void;
  onStartChat?: () => void;
  defaultCompose?: boolean;
  replyTo?: GmailMessage;
  defaultTo?: string;
  defaultSubject?: string;
  onSent?: () => void;
  compact?: boolean;
}



export default function CallButtons({
  targetUserId,
  targetUserName,
  targetUserImage,
  variant = 'full',
  className = '',
}: CallButtonsProps) {
  const { startCall, isInCall, currentCall } = useCall();
  const [loading, setLoading] = React.useState<'AUDIO' | 'VIDEO' | null>(null);

  const isBusy = isInCall && currentCall?.participants.some(p => p.userId === targetUserId);

  const handleCall = async (type: 'AUDIO' | 'VIDEO') => {
    if (loading) return;
    setLoading(type);
    try {
      await startCall(targetUserId, type, targetUserName, targetUserImage);
    } catch (err: any) {
      console.error('Call failed:', err);
      alert(err.message || 'Failed to start call');
    } finally {
      setLoading(null);
    }
  };

  if (variant === 'icon') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleCall('AUDIO')}
          disabled={!!loading || isBusy}
          className="size-10 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/30"
          title="Voice Call"
        >
          {loading === 'AUDIO' ? <Loader2 className="size-4 animate-spin" /> : <PhoneCall className="size-4" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleCall('VIDEO')}
          disabled={!!loading || isBusy}
          className="size-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
          title="Video Call"
        >
          {loading === 'VIDEO' ? <Loader2 className="size-4 animate-spin" /> : <BrandZoomIcon className="size-4" />}
        </motion.button>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => handleCall('AUDIO')}
        disabled={!!loading || isBusy}
        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'AUDIO' ? <Loader2 className="size-4 animate-spin" /> : <PhoneCall className="size-4" />}
        {loading === 'AUDIO' ? 'Calling…' : 'Voice Call'}
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => handleCall('VIDEO')}
        disabled={!!loading || isBusy}
        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'VIDEO' ? <Loader2 className="size-4 animate-spin" /> : <BrandZoomIcon className="size-4" />}
        {loading === 'VIDEO' ? 'Calling…' : 'Video Call'}
      </motion.button>
    </div>
  );
}


export function MiniCallButton({
  targetUserId,
  targetUserName,
  defaultCompose = false,
  replyTo,
  defaultTo,
  defaultSubject, 
  onSent,
  targetUserImage,
  variant = 'full',
  className = '',
}: CallButtonsProps) {
  const { startCall, isInCall, currentCall } = useCall();
  const [loading, setLoading] = React.useState<'AUDIO' | 'VIDEO' | null>(null);
  const [showCompose, setShowCompose] = useState(defaultCompose);
  const isBusy = isInCall && currentCall?.participants.some(p => p.userId === targetUserId);
  const [composeReplyTo, setComposeReplyTo] = useState<GmailMessage | undefined>(replyTo);


  const handleCall = async (type: 'AUDIO' | 'VIDEO') => {
    if (loading) return;
    setLoading(type);
    try {
      await startCall(targetUserId, type, targetUserName, targetUserImage);
    } catch (err: any) {
      console.error('Call failed:', err);
      alert(err.message || 'Failed to start call');
    } finally {
      setLoading(null);
    }
  };

  if (variant === 'icon') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleCall('AUDIO')}
          disabled={!!loading || isBusy}
          className="size-10 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/30"
          title="Voice Call"
        >
          {loading === 'AUDIO' ? <Loader2 className="size-4 animate-spin" /> : <PhoneCall className="size-4" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleCall('VIDEO')}
          disabled={!!loading || isBusy}
          className="size-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
          title="Video Call"
        >
          {loading === 'VIDEO' ? <Loader2 className="size-4 animate-spin" /> : <BrandZoomIcon className="size-4" />}
        </motion.button>
      </div>
    );
  }

  return (
    <>
    <div className="flex items-center gap-2">
          <AnimateIcon animateOnHover>
            <Button  onClick={() => handleCall('AUDIO')}
        disabled={!!loading || isBusy} variant="ghost" size="icon" className="rounded-full border">
          {loading === 'AUDIO' ? <Loader2 className="size-4 animate-spin" /> :  <PhoneCall className="size-4" />}
            </Button>
          </AnimateIcon>
          
            <Button onClick={() => handleCall('VIDEO')}
        disabled={!!loading || isBusy} variant="ghost" size="icon" className="rounded-full border">
                     {loading === 'VIDEO' ? <Loader2 className="size-4 animate-spin" /> : <BrandZoomIcon className="size-4" />}
            </Button>
          
          <AnimateIcon animateOnHover>
            <Button onClick={() =>  setShowCompose(true)} variant="ghost" size="icon" className="rounded-full border">
              <SendIcon className="size-4" />
            </Button>
          </AnimateIcon>
        </div>
        {showCompose && (
        <ComposeModal
          onClose={() => { setShowCompose(false); setComposeReplyTo(undefined); }}
          onSent={onSent}
          replyTo={composeReplyTo}
          defaultTo={defaultTo}
          defaultSubject={defaultSubject}
        />
      )}
    </>
  );
}
