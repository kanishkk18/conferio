"use client";

import { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Search, X, FileIcon, Hash, MessageSquare } from "lucide-react";
import Image from "next/image";
import { TeamMemberAvatar } from "@/components/chat-components/channel/team-member-avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/member-drawer";
import { formatDistanceToNow } from "date-fns";

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

type Tab = "members" | "attachments" | "replies";

interface ChannelMembersDrawerProps {
  teamSlug: string;
  channelId: string;
}

export function MembersDrawer({ teamSlug, channelId }: ChannelMembersDrawerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("members");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["channelMembers", teamSlug, channelId],
    queryFn: async () => {
      const res = await fetch(`/api/team/${teamSlug}/channels/${channelId}/members`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session?.user?.id,
  });

  const { data: attachments = [], isLoading: attachmentsLoading } = useQuery({
    queryKey: ["channelAttachments", teamSlug, channelId],
    queryFn: async () => {
      const res = await fetch(`/api/team/${teamSlug}/channels/${channelId}/attachments`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session?.user?.id && tab === "attachments",
  });

  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ["channelThreads", teamSlug, channelId],
    queryFn: async () => {
      const res = await fetch(`/api/team/${teamSlug}/channels/${channelId}/threads`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session?.user?.id && tab === "replies",
  });

  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ["channelSearch", teamSlug, channelId, debouncedQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/team/${teamSlug}/search?channelId=${channelId}&q=${encodeURIComponent(debouncedQuery)}`
      );
      if (!res.ok) return { messages: [], members: [], channels: [] };
      return res.json();
    },
    enabled: !!session?.user?.id && debouncedQuery.length > 0,
  });

  if (!session?.user) return null;

  const otherMembers = members.filter((m: any) => m.userId !== session.user.id);
  const isSearching = query.trim().length > 0;

  return (
    <Drawer direction="bottom">
      <DrawerTrigger
        className="border border-border dark:border-[#222] rounded-lg w-fit fixed top-24 right-3"
        asChild
      >
        <div className="flex flex-col items-center gap-2 px-0.5 py-1.5">
          {otherMembers.slice(0, 5).map((member: any) => (
            <TeamMemberAvatar key={member.id} member={member} teamSlug={teamSlug} />
          ))}
          <Search className="h-4 w-4" />
        </div>
      </DrawerTrigger>

      <DrawerContent className="w-[26vw] !left-auto mr-16 dark:bg-black border border-border dark:border-[#222] h-[96vh] mt-auto z-50">
        <DrawerHeader className="dark:bg-[#111] space-y-3">
          <div className="flex items-center justify-between">
            <DrawerTitle>Channel Info</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages or members…"
              className="w-full pl-9 pr-8 py-1.5 text-sm rounded-md border dark:border-[#333] bg-transparent focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Tabs — hidden while searching */}
          {!isSearching && (
            <div className="flex items-center gap-1 text-xs">
              {(["members", "attachments", "replies"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-2.5 py-1 rounded-full capitalize transition-colors ${
                    tab === t
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </DrawerHeader>

        <ScrollArea className="no-scrollbar overflow-y-auto px-4 flex-1">
          {/* ── Search results ─────────────────────────────────────── */}
          {isSearching ? (
            searching ? (
              <p className="text-center text-zinc-500 text-sm py-8">Searching…</p>
            ) : (
              <div className="space-y-4 pb-4">
                {searchResults?.messages?.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Messages
                    </p>
                    {searchResults.messages.map((m: any) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => router.push(`/team/${teamSlug}/channels/${m.channelId}`)}
                        className="w-full text-left px-2 py-2 rounded-md hover:bg-zinc-900 mb-1"
                      >
                        <p className="text-xs font-medium text-zinc-300">
                          {m.sender?.user?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-zinc-400 truncate">{m.content}</p>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults?.members?.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Members</p>
                    {searchResults.members.map((m: any) => (
                      <TeamMemberRow key={m.id} member={m} teamSlug={teamSlug} />
                    ))}
                  </div>
                )}
                {searchResults?.channels?.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Channels</p>
                    {searchResults.channels.map((c: any) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => router.push(`/team/${teamSlug}/channels/${c.id}`)}
                        className="w-full flex items-center gap-2 text-left px-2 py-2 rounded-md hover:bg-zinc-900 mb-1"
                      >
                        <Hash className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm text-zinc-300">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {!searchResults?.messages?.length &&
                  !searchResults?.members?.length &&
                  !searchResults?.channels?.length && (
                    <p className="text-center text-zinc-500 text-sm py-8">No results</p>
                  )}
              </div>
            )
          ) : tab === "members" ? (
            /* ── Members tab ──────────────────────────────────────── */
            membersLoading ? (
              <p className="text-center text-zinc-500 text-sm py-8">Loading…</p>
            ) : (
              <div className="pb-4">
                {members.map((m: any) => (
                  <TeamMemberRow key={m.id} member={m} teamSlug={teamSlug} />
                ))}
              </div>
            )
          ) : tab === "attachments" ? (
            /* ── Attachments tab ──────────────────────────────────── */
            attachmentsLoading ? (
              <p className="text-center text-zinc-500 text-sm py-8">Loading…</p>
            ) : attachments.length === 0 ? (
              <p className="text-center text-zinc-500 text-sm py-8">No attachments yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 pb-4">
                {attachments.map((a: any) =>
                  IMAGE_EXT.test(a.fileUrl) ? (
                    <a
                      key={a.id}
                      href={a.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square rounded-md overflow-hidden border border-zinc-800"
                    >
                      <Image src={a.fileUrl} alt="" fill unoptimized className="object-cover" />
                    </a>
                  ) : (
                    <a
                      key={a.id}
                      href={a.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-md border border-zinc-800 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white"
                    >
                      <FileIcon className="h-6 w-6" />
                      <span className="text-[10px] truncate max-w-[80%]">
                        {a.fileUrl.split("/").pop()}
                      </span>
                    </a>
                  )
                )}
              </div>
            )
          ) : (
            /* ── Replies tab ──────────────────────────────────────── */
            threadsLoading ? (
              <p className="text-center text-zinc-500 text-sm py-8">Loading…</p>
            ) : threads.length === 0 ? (
              <p className="text-center text-zinc-500 text-sm py-8">No threads yet</p>
            ) : (
              <div className="space-y-3 pb-4">
                {threads.map((t: any) => (
                  <div key={t.id} className="rounded-lg border border-zinc-800 p-2.5">
                    <p className="text-xs text-zinc-500 mb-1 truncate">
                      {t.message?.sender?.user?.name}: {t.message?.content?.substring(0, 60)}
                    </p>
                    <div className="pl-2 border-l border-zinc-700 space-y-1.5">
                      {t.replies.slice(0, 3).map((r: any) => (
                        <div key={r.id} className="text-sm">
                          <span className="font-medium text-zinc-300">{r.sender?.user?.name}: </span>
                          <span className="text-zinc-400">{r.content}</span>
                        </div>
                      ))}
                      {t.replyCount > 3 && (
                        <p className="text-xs text-zinc-500">+{t.replyCount - 3} more replies</p>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {t.lastReplyAt && formatDistanceToNow(new Date(t.lastReplyAt), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

function TeamMemberRow({ member, teamSlug }: { member: any; teamSlug: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/team/${teamSlug}/conversations/${member.id}`)}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-900 text-left mb-1"
    >
      <Image
        src={member.user.image || "https://i.pinimg.com/736x/10/c0/c8/10c0c8829a6ef64c940bfd714289e217.jpg"}
        alt=""
        width={28}
        height={28}
        className="rounded-full flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="text-sm text-zinc-200 truncate">{member.user?.name}</p>
        <p className="text-xs text-zinc-500 truncate">{member.user?.email}</p>
      </div>
    </button>
  );
}

// simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}