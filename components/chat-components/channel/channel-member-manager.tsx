"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Search, Loader2 } from 'lucide-react';

interface TeamMemberEntry {
  id: string; // TeamMember.id
  role: string;
  teamId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export function ChannelMemberManager({ channelId, teamSlug }: { channelId: string; teamSlug: string }) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: members = [], isLoading: loading, error: fetchError, refetch } = useQuery({
    queryKey: ['teamMembers', teamSlug],
    queryFn: async (): Promise<TeamMemberEntry[]> => {
      const res = await fetch(`/api/teams/${teamSlug}/members`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const response = await res.json();
      return response.data || response || [];
    },
    enabled: open,
  });

  const error = fetchError ? 'Failed to load team members' : null;

  const addMembers = async () => {
    setSaving(true);
    try {
      // selectedMembers holds TeamMember ids
      const res = await fetch(`/api/teams/${teamSlug}/channels/${channelId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds: selectedMembers })
      });

      if (!res.ok) throw new Error('Failed to add members');

      setSelectedMembers([]);
      setOpen(false);
    } catch (err) {
      console.error("Failed to add members:", err);
      alert("Failed to add members to channel");
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter((member) => {
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
          <DialogTitle>Add Team Members to Channel</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
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
            disabled={selectedMembers.length === 0 || loading || saving}
          >
            {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Add {selectedMembers.length > 0 && `(${selectedMembers.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}