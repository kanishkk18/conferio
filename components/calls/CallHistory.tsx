// src/components/calls/CallHistory.tsx
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed,
  Video,
  Clock,
  Calendar,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface Call {
  id: string;
  status: string;
  type: string;
  duration?: number;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  caller: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  callee: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  _count: {
    recordings: number;
  };
}

export default function CallHistory() {
  const { data: session } = useSession();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all');
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalDuration: 0,
    averageDuration: 0,
  });

  useEffect(() => {
    fetchCalls();
  }, [filter]);

  const fetchCalls = async () => {
    try {
      const response = await fetch(`/api/calls?type=${filter}&limit=50`);
      const data = await response.json();
      setCalls(data.calls);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCall = async (callId: string) => {
    if (!confirm('Are you sure you want to delete this call record?')) return;
    
    try {
      await fetch(`/api/calls/${callId}`, { method: 'DELETE' });
      setCalls(calls.filter(c => c.id !== callId));
    } catch (error) {
      console.error('Error deleting call:', error);
    }
  };

  const getCallIcon = (call: Call) => {
    const isOutgoing = call.caller.id === session?.user?.id;
    
    if (call.status === 'MISSED') return <PhoneMissed className="h-5 w-5 text-red-500" />;
    if (isOutgoing) return <PhoneOutgoing className="h-5 w-5 text-green-500" />;
    return <PhoneIncoming className="h-5 w-5 text-blue-500" />;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.totalCalls}</div>
          <div className="text-sm text-gray-400">Total Calls</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 p-4">
          <div className="text-2xl font-bold text-green-400">
            {Math.floor(stats.totalDuration / 60)}m
          </div>
          <div className="text-sm text-gray-400">Total Duration</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 p-4">
          <div className="text-2xl font-bold text-purple-400">
            {Math.floor(stats.averageDuration / 60)}m
          </div>
          <div className="text-sm text-gray-400">Avg Duration</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'incoming', 'outgoing', 'missed'] as const).map((f) => (
          <button type="button"
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Call List */}
      <div className="gap-y-2">
        {calls.length === 0 ? (
          <div className="rounded-xl bg-gray-900/50 p-8 text-center text-gray-500">
            <Phone className="mx-auto mb-2 h-12 w-12 opacity-20" />
            <p>No calls found</p>
          </div>
        ) : (
          calls.map((call) => {
            const isOutgoing = call.caller.id === session?.user?.id;
            const otherParty = isOutgoing ? call.callee : call.caller;

            return (
              <div
                key={call.id}
                className="group flex items-center gap-4 rounded-xl bg-gray-900/50 p-4 transition-colors hover:bg-gray-800/50 border border-gray-800"
              >
                {/* Avatar */}
                <div className="relative">
                  {otherParty.image ? (
                    <Image
                      src={otherParty.image}
                      alt={otherParty.name}
                      className="h-12 w-12 rounded-full object-cover"
                      width={50}
                      height={50}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-gray-400">
                      {otherParty.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-gray-950 p-1">
                    {getCallIcon(call)}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white truncate">
                      {otherParty.name}
                    </h3>
                    {call.type === 'VIDEO' && (
                      <Video className="h-4 w-4 text-purple-400" />
                    )}
                    {call._count.recordings > 0 && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                        REC
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
                    </span>
                    {call.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(call.duration)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    call.status === 'COMPLETED' 
                      ? 'bg-green-500/10 text-green-400'
                      : call.status === 'MISSED'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {call.status.toLowerCase()}
                  </span>
                </div>

                {/* Actions */}
                <button type="button"
                  onClick={() => deleteCall(call.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
