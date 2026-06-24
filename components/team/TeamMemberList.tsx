// // src/components/team/TeamMemberList.tsx
// import React, { useState, useEffect } from 'react';
// import { useCall } from 'contexts/CallContext';
// import { Phone, Video, MoreHorizontal, Mail } from 'lucide-react';

// interface TeamMember {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
//   role: string;
//   isOnline?: boolean;
//   lastSeen?: string;
//   _count: {
//     callsInitiated: number;
//     callsReceived: number;
//   };
// }

// export default function TeamMemberList() {
//   const [members, setMembers] = useState<TeamMember[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { startCall, isCalling } = useCall();

//   useEffect(() => {
//     fetchMembers();
//   }, []);

//   const fetchMembers = async () => {
//     try {
//       const response = await fetch('/api/team');
//       const data = await response.json();
//       setMembers(data);
//     } catch (error) {
//       console.error('Error fetching team:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCall = async (memberId: string, type: 'AUDIO' | 'VIDEO') => {
//     try {
//       await startCall(memberId, type);
//     } catch (error: any) {
//       alert(error.message);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {[1, 2, 3].map((i) => (
//           <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-800" />
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//       {members.map((member) => (
//         <div
//           key={member.id}
//           className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border border-gray-800 transition-all hover:border-gray-700 hover:shadow-xl"
//         >
//           {/* Online Indicator */}
//           <div className="absolute right-4 top-4">
//             <div className={`h-3 w-3 rounded-full ${
//               member.isOnline ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-600'
//             }`} />
//           </div>

//           {/* Avatar & Info */}
//           <div className="mb-4 flex items-center gap-4">
//             {member.image ? (
//               <img
//                 src={member.image}
//                 alt={member.name}
//                 className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-700"
//               />
//             ) : (
//               <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
//                 {member.name?.charAt(0).toUpperCase()}
//               </div>
//             )}
//             <div>
//               <h3 className="font-semibold text-white">{member.name}</h3>
//               <p className="text-sm text-gray-400">{member.email}</p>
//               <span className="inline-flex mt-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
//                 {member.role.toLowerCase()}
//               </span>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="mb-4 flex gap-4 text-sm text-gray-500">
//             <div>
//               <span className="font-semibold text-gray-300">
//                 {member._count.callsInitiated + member._count.callsReceived}
//               </span>{' '}
//               calls
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-2">
//             <button type="button"
//               onClick={() => handleCall(member.id, 'AUDIO')}
//               disabled={isCalling}
//               className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600/20 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-600/30 disabled:opacity-50"
//             >
//               <Phone className="h-4 w-4" />
//               Call
//             </button>
//             <button type="button"
//               onClick={() => handleCall(member.id, 'VIDEO')}
//               disabled={isCalling}
//               className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600/20 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-600/30 disabled:opacity-50"
//             >
//               <Video className="h-4 w-4" />
//               Video
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// src/components/team/TeamMemberList.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useCall } from 'contexts/CallContext';
import { Phone, Video, Mic, Users } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

export default function TeamMemberList() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { startCall, isCalling } = useCall();

  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchMembers()
    }
  }, []);
  

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/calls/members');
      const result = await response.json();
      setMembers(result.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (memberId: string, type: 'AUDIO' | 'VIDEO') => {
    try {
      await startCall(memberId, type);
    } catch (error: any) {
      if (error.message === 'Active call in progress') {
        // Auto-clear stuck calls and retry
        if (confirm('Stuck call detected. Clear it and try again?')) {
          await fetch('/api/calls/clear', { method: 'POST' });
          // Retry after clearing
          setTimeout(() => handleCall(memberId, type), 500);
        }
      } else {
        alert(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-800" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-xl bg-gray-900/50 border border-gray-800 p-8 text-center">
        <Users className="mx-auto mb-4 h-12 w-12 text-gray-600" />
        <h3 className="text-lg font-medium text-white">No team members found</h3>
        <p className="text-gray-400">You need to be part of a team to make calls</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {members.map((member) => (
        <div
          key={member.id}
          className="group relative overflow-hidden rounded-xl bg-[#f4f4f4] dark:bg-[#111] p-6 border border-[#d0d0d0] dark:border-[#333] transition-all hover:dark:border-[#444] hover:shadow-xl"
        >
          {/* Avatar & Info */}
          <div className="mb-4 flex items-center gap-4">
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-700"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                {member.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold dark:text-white truncate">{member.name}</h3>
              <p className="text-sm text-gray-400 truncate">{member.email}</p>
              <span className="inline-flex mt-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                {member.role.toLowerCase()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button type="button"
              onClick={() => handleCall(member.id, 'AUDIO')}
              disabled={isCalling}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600/20 py-2.5 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="h-4 w-4" />
              Audio
            </button>
            <button type="button"
              onClick={() => handleCall(member.id, 'VIDEO')}
              disabled={isCalling}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600/20 py-2.5 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Video className="h-4 w-4" />
              Video
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
