// // components/clickup-chat/ChannelMemberManager.tsx
// "use client";

// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Checkbox } from '@/components/ui/checkbox';
// import { UserPlus, Search } from 'lucide-react';

// export function ChannelMemberManager({ channelId, serverId }: { channelId: string; serverId: string }) {
//   const [teamMembers, setTeamMembers] = useState<any[]>([]);
//   const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');

// //   useEffect(() => {
// //     // Fetch team members who aren't in the channel yet
// //     fetch(`/api/teams/members?serverId=${serverId}&excludeChannel=${channelId}`)
// //       .then(res => res.json())
// //       .then(data => setTeamMembers(data));
// //   }, [serverId, channelId]);

// useEffect(() => {
//   fetch(`/api/teams/${serverId}/members`)
//     .then(res => res.json())
//     .then(data => {
//       // Extract the array from { data: [...] } response
//       setTeamMembers(data.data || []);
//     });
// }, [serverId, channelId]);

//   const addMembers = async () => {
//     await fetch('/api/channels/members', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ channelId, memberIds: selectedMembers })
//     });
//     setSelectedMembers([]);
//   };

//   const filteredMembers = teamMembers.filter(member => 
//   member?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//   member?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
// );

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm" className="gap-2">
//           <UserPlus className="size-4 />
//           Add Members
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Add Team Members to Channel</DialogTitle>
//         </DialogHeader>

//         <div className="relative mb-4">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4text-zinc-400" />
//           <Input
//             placeholder="Search team members..."
//             className="pl-10"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         <div className="max-h-[300px] overflow-y-auto gap-y-2">
//           {filteredMembers.map((member) => (
//             <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg">
//               <Checkbox
//                 checked={selectedMembers.includes(member.id)}
//                 onCheckedChange={(checked) => {
//                   if (checked) {
//                     setSelectedMembers([...selectedMembers, member.id]);
//                   } else {
//                     setSelectedMembers(selectedMembers.filter(id => id !== member.id));
//                   }
//                 }}
//               />
//               <Avatar className="size-8">
//                 <AvatarImage src={member.user.image} />
//                 <AvatarFallback>{member.user.name[0]}</AvatarFallback>
//               </Avatar>
//               <div className="flex-1">
//                 <p className="font-medium text-sm">{member.user.name}</p>
//                 <p className="text-xs text-zinc-500">{member.user.email}</p>
//               </div>
//               <span className="text-xs px-2 py-1 bg-zinc-100 rounded-full capitalize">
//                 {member.role.toLowerCase()}
//               </span>
//             </div>
//           ))}
//         </div>

//         <div className="flex justify-end gap-2 mt-4">
//           <Button variant="outline" onClick={() => setSelectedMembers([])}>
//             Cancel
//           </Button>
//           <Button onClick={addMembers} disabled={selectedMembers.length === 0}>
//             Add {selectedMembers.length} Members
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// "use client";

// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Checkbox } from '@/components/ui/checkbox';
// import { UserPlus, Search, Loader2 } from 'lucide-react';

// interface TeamMember {
//   id: string;
//   role: string;
//   teamId: string;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     image: string | null;
//   };
// }

// export function ChannelMemberManager({ channelId, serverId }: { channelId: string; serverId: string }) {
//   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
//   const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // Fetch team members using the team slug (serverId is the team slug in your case)
//     fetch(`/api/teams/${serverId}/members`)
//       .then(res => {
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         return res.json();
//       })
//       .then(response => {
//         // Extract data from { data: [...] } response
//         const members = response.data || [];
//         setTeamMembers(members);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error("Failed to load members:", err);
//         setError("Failed to load team members");
//         setTeamMembers([]);
//         setLoading(false);
//       });
//   }, [serverId]);

//   const addMembers = async () => {
//     try {
//       const res = await fetch('/api/channels/members', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ channelId, memberIds: selectedMembers })
//       });

//       if (!res.ok) throw new Error('Failed to add members');

//       setSelectedMembers([]);
//       // Optionally refresh member list or close dialog
//     } catch (err) {
//       console.error("Failed to add members:", err);
//       alert("Failed to add members to channel");
//     }
//   };

//   // Safely filter members with null checks
//   const filteredMembers = teamMembers.filter(member => {
//     if (!member?.user) return false;
//     const name = member.user.name?.toLowerCase() || '';
//     const email = member.user.email?.toLowerCase() || '';
//     const query = searchQuery.toLowerCase();
//     return name.includes(query) || email.includes(query);
//   });

//   if (loading) {
//     return (
//       <Button variant="outline" size="sm" disabled>
//         <Loader2 className="size-4mr-2 animate-spin" />
//         Loading...
//       </Button>
//     );
//   }

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm" className="gap-2">
//           <UserPlus className="size-4 />
//           Add Members
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-md max-h-[80vh]">
//         <DialogHeader>
//           <DialogTitle>Add Team Members to Channel</DialogTitle>
//         </DialogHeader>

//         {error && (
//           <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
//             {error}
//           </div>
//         )}

//         <div className="relative mb-4">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4text-zinc-400" />
//           <Input
//             placeholder="Search team members..."
//             className="pl-10"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         <div className="max-h-[400px] overflow-y-auto gap-y-2">
//           {filteredMembers.length === 0 ? (
//             <div className="text-center text-zinc-500 py-4">
//               No members found
//             </div>
//           ) : (
//             filteredMembers.map((member) => (
//               <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">
//                 <Checkbox
//                   checked={selectedMembers.includes(member.id)}
//                   onCheckedChange={(checked) => {
//                     if (checked) {
//                       setSelectedMembers([...selectedMembers, member.id]);
//                     } else {
//                       setSelectedMembers(selectedMembers.filter(id => id !== member.id));
//                     }
//                   }}
//                 />
//                 <Avatar className="size-8">
//                   <AvatarImage src={member.user?.image || ''} />
//                   <AvatarFallback>{member.user?.name?.[0] || '?'}</AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-medium text-sm truncate">{member.user?.name || 'Unknown'}</p>
//                   <p className="text-xs text-zinc-500 truncate">{member.user?.email || ''}</p>
//                 </div>
//                 <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full capitalize">
//                   {member.role?.toLowerCase() || 'member'}
//                 </span>
//               </div>
//             ))
//           )}
//         </div>

//         <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
//           <Button variant="outline" onClick={() => setSelectedMembers([])}>
//             Clear
//           </Button>
//           <Button 
//             onClick={addMembers} 
//             disabled={selectedMembers.length === 0}
//           >
//             Add {selectedMembers.length > 0 && `(${selectedMembers.length})`}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Search, Loader2 } from 'lucide-react';

interface ServerMember {
  id: string;
  role: string;
  serverId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export function ChannelMemberManager({ channelId, serverId }: { channelId: string; serverId: string }) {
  // const [members, setMembers] = useState<ServerMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const { data: members = [], isLoading: loading, error: fetchError } = useQuery({
    queryKey: ['serverMembers', serverId],
    queryFn: async () => {
      const res = await fetch(`/api/servers/${serverId}/members`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const response = await res.json();
      return response.data || [];
    },
    enabled: open,
  });

  const error = fetchError ? 'Failed to load server members' : null;

  //   const addMembers = async () => {
  //     try {
  //       const res = await fetch('/api/channels/members', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ channelId, memberIds: selectedMembers })
  //       });

  //       if (!res.ok) throw new Error('Failed to add members');

  //       setSelectedMembers([]);
  //       setOpen(false);
  //     } catch (err) {
  //       console.error("Failed to add members:", err);
  //       alert("Failed to add members to channel");
  //     }
  //   };

  const addMembers = async () => {
    try {
      // selectedMembers contains TeamMember IDs
      // The API will handle converting to Member/ChannelMember
      const res = await fetch('/api/channels/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId,
          memberIds: selectedMembers // These are TeamMember IDs
        })
      });

      if (!res.ok) throw new Error('Failed to add members');

      const result = await res.json();
      console.log('Added members:', result);

      setSelectedMembers([]);
      setOpen(false);
      // Optionally refresh the list
    } catch (err) {
      console.error("Failed to add members:", err);
      alert("Failed to add members to channel");
    }
  };

  const filteredMembers = members.filter(member => {
    if (!member?.user) return false;
    const name = member.user.name?.toLowerCase() || '';
    const email = member.user.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Server Members to Channel</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4text-zinc-400" />
            <Input
              placeholder="Search members..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto gap-y-2">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center text-zinc-500 py-4">
                No members found
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg">
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMembers([...selectedMembers, member.id]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                      }
                    }}
                  />
                  <Avatar className="size-8">
                    <AvatarImage src={member.user?.image || ''} />
                    <AvatarFallback>{member.user?.name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-zinc-500 truncate">{member.user?.email || ''}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-zinc-100 rounded-full capitalize">
                    {member.role?.toLowerCase() || 'member'}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={addMembers}
              disabled={selectedMembers.length === 0 || loading}
            >
              Add {selectedMembers.length > 0 && `(${selectedMembers.length})`}
            </Button>
          </div>
        </DialogContent>
    </Dialog>
  );
}
