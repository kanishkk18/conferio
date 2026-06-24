import Link from 'next/link';
import { formatDistanceToNow, formatDuration } from 'date-fns';
import { 
  Video, 
  Clock, 
  Users, 
  FileText,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface MeetingCardProps {
  meeting: {
    id: string;
    meetingName: string | null;
    meetingUrl: string;
    platform: string | null;
    status: string;
    duration: number | null;
    createdAt: string;
    speakers: string[];
    summary: string | null;
  };
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge-pending">Pending</span>;
      case 'joined':
        return <span className="badge-joined">Joined</span>;
      case 'recording':
        return <span className="badge-recording">Recording</span>;
      case 'completed':
        return <span className="badge-completed">Completed</span>;
      case 'failed':
        return <span className="badge-failed">Failed</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getPlatformIcon = (platform: string | null) => {
    switch (platform) {
      case 'zoom':
        return <span className="text-blue-500 font-medium">Zoom</span>;
      case 'google_meet':
        return <span className="text-green-500 font-medium">Google Meet</span>;
      case 'teams':
        return <span className="text-purple-500 font-medium">Teams</span>;
      default:
        return <span className="text-gray-500">Unknown</span>;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Link href={`/meetings/${meeting.id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-x-2 mb-2">
              {getStatusBadge(meeting.status)}
              {getPlatformIcon(meeting.platform)}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {meeting.meetingName || 'Untitled Meeting'}
            </h3>
            
            <p className="text-sm text-gray-500 mt-1 truncate">
              {meeting.meetingUrl}
            </p>
            
            <div className="flex items-center gap-x-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(meeting.createdAt), { addSuffix: true })}</span>
              </div>
              
              {meeting.duration && (
                <div className="flex items-center gap-x-1">
                  <Video className="h-4 w-4" />
                  <span>{formatDuration(meeting.duration)}</span>
                </div>
              )}
              
              {meeting.speakers?.length > 0 && (
                <div className="flex items-center gap-x-1">
                  <Users className="h-4 w-4" />
                  <span>{meeting.speakers.length} speakers</span>
                </div>
              )}
              
              {meeting.summary && (
                <div className="flex items-center gap-x-1 text-green-600">
                  <FileText className="h-4 w-4" />
                  <span>AI Summary</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="ml-4 flex items-center">
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>
        
        {meeting.status === 'failed' && (
          <div className="mt-4 flex items-center gap-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>Meeting recording failed. Click to view details.</span>
          </div>
        )}
      </div>
    </Link>
  );
}
