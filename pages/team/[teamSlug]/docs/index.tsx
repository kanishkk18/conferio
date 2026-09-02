'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/doc-components/Header';
import { WikiSection } from '@/components/doc-components/WikiSection';
import DocsTable from '@/components/doc-components/DocsTable';
import Mainsidebar from '@/components/ui/mainSideBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { SearchIcon } from '@/components/animate-ui/icons/search';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list';
import { Input } from '@/components/ui/input';
import { FileTextIcon } from '@/components/ui/file-text';
import TemplatesSection from '@/components/doc-components/DocSections/TemplatesSection';
import FavoritesSection from '@/components/doc-components/DocSections/FavoritesSection';
import { Tabs } from '@/components/animate-ui/components/animate/tabs';
import Image from 'next/image';
import CreatedAssigned from '@/components/doc-components/DocSections/CreatedByMeSection';
import LazyLoader from '@/components/loader/lazyloader';
import { useSyncTeamFromUrl } from 'hooks/useSyncTeamFromUrl';
import { useTeamStore } from 'store/teamStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Page {
  id: string;
  title: string;
  emoji?: string;
  coverImage?: string;
  children?: Page[];
  parentId?: string;
  teamId?: string;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
  team?: { name: string };
}

export interface TeamMemberEntry {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface Team {
  id: string;
  name: string;
  slug: string;
}

export interface FavoritePage {
  id: string;
  title: string;
  emoji?: string;
  coverImage?: string;
  team: { name: string };
  favoritedAt: string;
  updatedAt: string;
}

export interface AssignedPage {
  id: string;
  title: string;
  emoji?: string;
  author: { name: string; image?: string };
  team: { name: string };
  assignedTo: { team: { name: string }; user: { name: string } };
  updatedAt: string;
}

export interface TeamData {
  team: Team | null;
  pages: Page[];
  recentPages: Page[];
  members: TeamMemberEntry[];
  favorites: FavoritePage[];
  createdByMe: Page[];
  assignedToMe: AssignedPage[];
  refetchPages: () => Promise<void>;
  refetchFavorites: () => Promise<void>;
  refetchMembers: () => Promise<void>;
  createNewPage: (parentId?: string) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
}

// ─── TeamDocsHome ────────────────────────────────────────────────────────────

export default function TeamDocsHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { push } = useRouter();
  const { teamSlug } = router.query;

  useSyncTeamFromUrl(teamSlug as string | undefined);
  const { selectedTeam } = useTeamStore();
  // Guard: only trust the store once it's caught up with the URL, to avoid
  // a one-render flash of the previous team's docs after switching teams.
  const team = selectedTeam?.slug === teamSlug ? selectedTeam : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [pages, setPages] = useState<Page[]>([]);
  const [recentPages, setRecentPages] = useState<Page[]>([]);
  const [members, setMembers] = useState<TeamMemberEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoritePage[]>([]);
  const [createdByMe, setCreatedByMe] = useState<Page[]>([]);
  const [assignedToMe, setAssignedToMe] = useState<AssignedPage[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchPages = useCallback(async () => {
    if (!team?.id) return;

    const treeRes = await fetch(`/api/pages?teamId=${team.id}&tree=true`);
    if (treeRes.ok) setPages(await treeRes.json());

    const recentListRes = await fetch(`/api/pages?teamId=${team.id}&limit=10`);
    if (!recentListRes.ok) return;
    const recentList = await recentListRes.json();

    const recentFull = await Promise.all(
      recentList.map((p: Page) =>
        fetch(`/api/pages/${p.id}`)
          .then(r => r.ok ? r.json() : p)
          .catch(() => p)
      )
    );
    setRecentPages(recentFull);
  }, [team?.id]);

  const fetchMembers = useCallback(async () => {
    if (!teamSlug) return;
    try {
      const res = await fetch(`/api/teams/${teamSlug}/invite`);
      if (res.ok) setMembers(await res.json());
    } catch { }
  }, [teamSlug]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/pages/favorites');
      if (res.ok) setFavorites(await res.json());
    } catch { }
  }, []);

  const fetchCreatedByMe = useCallback(async () => {
    try {
      const res = await fetch('/api/pages/created-by-me');
      if (res.ok) setCreatedByMe(await res.json());
    } catch { }
  }, []);

  const fetchAssignedToMe = useCallback(async () => {
    try {
      const res = await fetch('/api/pages/assigned-to-me');
      if (res.ok) setAssignedToMe(await res.json());
    } catch { }
  }, []);

  // ── Load once team is resolved ──────────────────────────────────────────

  useEffect(() => {
    if (status === 'unauthenticated') { push('/'); return; }
  }, [status, push]);

  useEffect(() => {
    if (!team?.id) return;
    setLoading(true);
    Promise.all([
      fetchPages(),
      fetchMembers(),
      fetchFavorites(),
      fetchCreatedByMe(),
      fetchAssignedToMe(),
    ]).finally(() => setLoading(false));
  }, [team?.id]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const createNewPage = useCallback(async (parentId?: string) => {
    try {
      const res = await fetch('/api/pages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team?.id, parentId, title: 'Doc' }),
      });
      if (res.ok) {
        const p = await res.json();
        await fetchPages();
        push(`/team/${teamSlug}/docs/${p.id}`);
      } else throw new Error();
    } catch { toast.error('Failed to create page'); }
  }, [team?.id, teamSlug, fetchPages, push]);

  const deletePage = useCallback(async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/pages/${pageId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPages();
        toast.success('Page deleted successfully');
      } else throw new Error();
    } catch { toast.error('Failed to delete page'); }
  }, [fetchPages]);

  // ── Shared context object passed to children ───────────────────────────────

  const teamData: TeamData = {
    team,
    pages,
    recentPages,
    members,
    favorites,
    createdByMe,
    assignedToMe,
    refetchPages: fetchPages,
    refetchFavorites: fetchFavorites,
    refetchMembers: fetchMembers,
    createNewPage,
    deletePage,
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (status === 'loading' || loading || !team) {
    return (
      <div className="min-h-screen flex items-center dark:bg-black justify-center">
        <LazyLoader />
      </div>
    );
  }

  return (
    <>
      <div className="flex dark:bg-[#090909] bg-[#F9F9F9] min-h-screen overflow-x-hidden max-w-screen-2xl w-full">
        <Mainsidebar />
        <ScrollArea className="flex-1 flex flex-col overflow-y-auto h-screen">
          <Header />

          {/* ── Team breadcrumb bar ───────────────────────────── */}
          <div className="flex dark:bg-[#111111] items-center justify-between px-4 py-2 border-b dark:border-[#1C1C1C]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-foreground font-medium">Docs</span>/
                {team?.name}
              </div>
            </div>
            <div className="flex justify-center items-center gap-2">
              <AnimateIcon animateOnHover>
                <Button variant="outline" size="sm" className="gap-1 bg-transparent dark:border-[#262626] text-foreground hover:bg-muted rounded-lg">
                  <SearchIcon className="w-3.5 h-3.5" />
                  <Input
                    placeholder="Search Docs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none w-fit shadow-none p-0 select-none !focus:ring-0 !focus:outline-none bg-transparent"
                  />
                </Button>
              </AnimateIcon>
              <Button
                onClick={() => createNewPage()}
                size="sm"
                className="h-[1.80rem] gap-1.5 dark:bg-white !text-black "
              >
                <span className="text-sm font-medium">New Doc</span>
              </Button>
            </div>
          </div>

          {/* ── Recent pages cards ─────────────────────────────────── */}
          <div className="overflow-auto pb-4 px-4">
            <div className="flex w-full h-fit max-w-screen items-center justify-start gap-[16px] mt-4">
              {recentPages.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">No pages</p>
              ) : (
                recentPages.slice(0, 9).map((page) => (
                  <DocPageCard key={page.id} page={page} />
                ))
              )}
            </div>

            <TemplatesSection />

            {/* ── Three-column layout ────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="dark:bg-[#111111] bg-[#fff] px-2 py-3 rounded-xl border dark:border-[#222222]">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-foreground font-medium text-sm">Recent</h3>
                  <button type="button" className="text-muted-foreground hover:text-foreground text-xs">See all</button>
                </div>
                <div className="space-y-2">
                  {recentPages.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">No pages yet. Create your first page!</p>
                  ) : (
                    recentPages.slice(0, 4).map((page) => (
                      <div
                        key={page.id}
                        onClick={() => { push(`/team/${teamSlug}/docs/${page.id}`); }}
                        className="!w-full cursor-pointer flex items-center gap-2 py-1 px-2 hover:bg-[#F9F9F9] rounded-md dark:hover:bg-[#222222] transition-colors text-left"
                      >
                        <div className="h-4 w-4 justify-center items-center flex p-0">
                          {page.emoji || <ClipboardList className="h-4 w-4 dark:text-[#B4B4B4]" />}
                        </div>
                        <div className="flex justify-center items-center gap-2">
                          <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">{page.title}</span>
                          <span className="dark:text-[#6E6E6E] text-[#8D8D8D] text-sm truncate block">
                            • {new Date(page.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <FavoritesSection
                favorites={favorites}
                onRemove={(pageId) => setFavorites(prev => prev.filter(f => f.id !== pageId))}
              />

              <Tabs className="h-full">
                <CreatedAssigned
                  createdByMe={createdByMe}
                  assignedToMe={assignedToMe}
                  onDeleteCreated={(pageId) => {
                    setCreatedByMe(prev => prev.filter(p => p.id !== pageId));
                  }}
                />
              </Tabs>
            </div>

            <WikiSection />
          </div>

          <DocsTable teamData={teamData} />
        </ScrollArea>
      </div>
    </>
  );
}

// ─── DocPageCard ──────────────────────────────────────────────────────────────

function DocPageCard({ page }: { page: Page }) {
  const router = useRouter();
  const { teamSlug } = router.query;

  return (
    <Card
      onClick={() => router.push(`/team/${teamSlug}/docs/${page.id}`)}
      className="h-[9.5rem] w-36 p-0 rounded-2xl overflow-hidden cursor-pointer dark:bg-[#191919] dark:border-[#1C1C1C]"
    >
      <CardContent className="w-full h-16 p-0">
        <Image
          className="h-[5rem] max-h-[5rem] w-full !object-fill"
          src={
            page.coverImage ||
            'https://pub-08af51b0459743828032880ad678a4cf.r2.dev/covers/1777321267309-djCXk3eoQIxHnRfad8iIR.jpg'
          }
          alt="cover"
          height={1000}
          width={1000}
        />
      </CardContent>
      <CardFooter>
        <div className="flex-1 min-w-0 space-y-2">
          <AnimateIcon animateOnHover>
            <div className="-mt-1 h-5 w-5">
              {page.emoji || <FileTextIcon className="!h-4 !w-4 dark:text-[#7D7A75] text-[#201f1f]" />}
            </div>
          </AnimateIcon>
          <div className="font-medium truncate">{page.title || 'Doc'}</div>
          <div className="text-sm text-gray-500">
            {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}