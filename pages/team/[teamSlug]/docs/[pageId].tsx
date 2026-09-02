'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import CircularText from '@/components/ui/CircularTextLoader';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/doc-components/Sidebar';
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import { Users } from '@/components/animate-ui/icons/users';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalDescription,
  ModalTitle,
} from '@/components/ui/animated-modal';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Editor from '@/components/Editor';
import { useSyncTeamFromUrl } from 'hooks/useSyncTeamFromUrl';
import { useTeamStore } from 'store/teamStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Page {
  id: string;
  title: string;
  content?: any;
  emoji?: string;
  coverImage?: string;
  teamId?: string;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
  parentId?: string;
  children?: Page[];
}

interface AnimatedSearchProps {
  isOpen: boolean;
  searchQuery: string;
  inputRef: React.RefObject<HTMLInputElement>;
  onOpen: () => void;
  onQueryChange: (v: string) => void;
  onClear: () => void;
}

// ─── PageTreeItem ─────────────────────────────────────────────────────────────

interface PageTreeItemProps {
  page: Page;
  level: number;
  isExpanded: boolean;
  isActive: boolean;
  currentPageId?: string | string[];
  onNavigate: (pageId: string) => void;
  onToggleExpanded: (pageId: string) => void;
  onCreateSubpage: (parentId: string) => void;
  onDelete: (pageId: string) => void;
  renderChildren: (pages: Page[], level: number) => React.ReactNode;
}

function PageTreeItem({
  page,
  level,
  isExpanded,
  isActive,
  onNavigate,
  onToggleExpanded,
  onCreateSubpage,
  onDelete,
  renderChildren,
}: PageTreeItemProps) {
  const hasChildren = page.children && page.children.length > 0;

  return (
    <div key={page.id}>
      <div
        className={`group flex items-center py-1 px-2 hover:dark:bg-[#333] rounded-sm cursor-pointer ${isActive ? '' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto w-4 mr-1"
            onClick={e => { e.stopPropagation(); onToggleExpanded(page.id); }}
          >
            {isExpanded
              ? <ChevronDown className="h-3 w-3" />
              : <ChevronRight className="h-3 w-3" />}
          </Button>
        ) : (
          <div className="w-4 mr-1" />
        )}

        <div
          className="flex-1 flex items-center min-w-0"
          onClick={() => onNavigate(page.id)}
        >
          <div className="mr-2 text-sm">
            {page.emoji || <FileText className="h-4 w-4 text-gray-400" />}
          </div>
          <span className="truncate text-sm">{page.title}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 p-1 h-auto"
              onClick={e => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCreateSubpage(page.id)}>
              <Plus className="mr-2 h-4 w-4" />
              Add subpage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(page.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && isExpanded && (
        <div>{renderChildren(page.children!, level + 1)}</div>
      )}
    </div>
  );
}

function AnimatedSearch({
  isOpen, searchQuery, inputRef, onOpen, onQueryChange, onClear,
}: AnimatedSearchProps) {
  return (
    <div className="relative flex items-center pr-2">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="search-icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={onOpen}
            className="p-1 hover:bg-gray-100 hover:dark:bg-[#181818] rounded-sm transition-colors"
            aria-label="Open search"
          >
            <Search className="h-4 w-4 text-gray-500" />
          </motion.button>
        ) : (
          <motion.div
            key="search-input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative overflow-hidden pr-2"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Search pages..."
              value={searchQuery}
              onChange={e => onQueryChange(e.target.value)}
              className="w-full pl-9 pr-8 border dark:border-[#333] focus:outline-none focus-visible:ring-0"
            />
            {searchQuery && (
              <button type="button"
                onClick={onClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SidebarAwareTrigger ──────────────────────────────────────────────────────

function SidebarAwareTrigger({ pageCount }: { pageCount: number }) {
  const { open } = useSidebar();
  if (open) return null;
  return (
    <SidebarTrigger className="z-50 absolute top-3 left-3 !w-fit !px-1 flex justify-center items-center border dark:border-[#232323] dark:bg-[#111] hover:bg-red-500">
      <div className="text-sm text-[#B4B4B4] flex justify-center items-center gap-1">
        <FileText className="h-3 w-4" />
        <p>{pageCount}</p>
        <p>Pages</p>
      </div>
    </SidebarTrigger>
  );
}

// ─── DocEditorView (main page) ─────────────────────────────────────────────────

export default function DocEditorView() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { push, back } = router;
  const { teamSlug, pageId, currentPageId } = router.query;

  useSyncTeamFromUrl(teamSlug as string | undefined);
  const { selectedTeam } = useTeamStore();
  const team = selectedTeam?.slug === teamSlug ? selectedTeam : null;

  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!pageId || !session) return;
    let cancelled = false;
    setLoading(true);

    fetch(`/api/pages/${pageId}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setPage(data); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [pageId, session]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        if (searchQuery === '') setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); setSearchQuery(''); }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, searchQuery]);

  useEffect(() => {
    if (team?.id) fetchPages();
  }, [team?.id]);

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const fetchPages = async () => {
    try {
      const res = await fetch(`/api/pages?teamId=${team!.id}&tree=true`);
      if (res.ok) setPages(await res.json());
    } catch { console.error('Failed to fetch pages'); }
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const updatePage = async (updates: Partial<Page>) => {
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) setPage(await res.json());
      else throw new Error('Failed to update page');
    } catch { toast.error('Failed to save changes'); }
  };

  const createNewPage = async (parentId?: string) => {
    try {
      const res = await fetch('/api/pages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team?.id, parentId, title: 'Doc' }),
      });
      if (res.ok) {
        const newPage = await res.json();
        await fetchPages();
        push(`/team/${teamSlug}/docs/${newPage.id}`);
      } else throw new Error('Failed to create page');
    } catch { toast.error('Failed to create page'); }
  };

  const deletePage = async (targetPageId: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/pages/${targetPageId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPages();
        if (currentPageId === targetPageId) push(`/team/${teamSlug}/docs`);
        toast.success('Page deleted successfully');
      } else throw new Error('Failed to delete page');
    } catch { toast.error('Failed to delete page'); }
  };

  const handleShare = async () => {
    try {
      const res = await fetch(`/api/pages/${pageId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'VIEW' }),
      });
      if (res.ok) {
        const data = await res.json();
        navigator.clipboard.writeText(data.shareUrl);
        toast.success('Share link copied to clipboard!');
      }
    } catch { toast.error('Failed to create share link'); }
    setShowShareDialog(false);
  };

  const toggleExpanded = (targetPageId: string) => {
    const next = new Set(expandedPages);
    if (next.has(targetPageId)) next.delete(targetPageId);
    else next.add(targetPageId);
    setExpandedPages(next);
  };

  // ── Page tree renderer ─────────────────────────────────────────────────────

  const renderPageTree = (pageList: Page[], level = 0): React.ReactNode => {
    return pageList.map(p => (
      <PageTreeItem
        key={p.id}
        page={p}
        level={level}
        isExpanded={expandedPages.has(p.id)}
        isActive={currentPageId === p.id}
        currentPageId={currentPageId}
        onNavigate={id => push(`/team/${teamSlug}/docs/${id}`)}
        onToggleExpanded={toggleExpanded}
        onCreateSubpage={createNewPage}
        onDelete={deletePage}
        renderChildren={renderPageTree}
      />
    ));
  };

  // ── Loading / not-found guards ─────────────────────────────────────────────

  if (status === 'loading' || loading || !team) {
    return (
      <div className="min-h-screen max-h-screen min-w-screen w-full flex items-center justify-center">
        <CircularText text="CONFERIO*CALLS*" onHover="speedUp" spinDuration={5} className="custom-class" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-[6.6rem] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
          <p className="text-gray-600">The page you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const pageTreeNodes = renderPageTree(pages);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="bg-[#f1f1f1] dark:bg-[#222222] w-full px-2 border !rounded-lg dark:!border-[#333232] h-screen max-h-screen !overflow-y-hidden">

        <div className="h-10 flex justify-between items-center w-full px-2">
          <div className="flex justify-start items-center gap-0.5 !z-[9999]">
            <div
              onClick={() => push(`/team/${teamSlug}/docs`)}
              className="flex-1 flex items-center min-w-0 cursor-pointer"
            >
              <div className="mr-1 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <span
                onClick={() => push(`/team/${teamSlug}/docs`)}
                className="dark:text-[#B4B4B4] text-sm font-medium truncate block"
              >
                {team?.name}
              </span>
            </div>
            <div className="text-gray-400">/</div>
            <div className="flex-1 flex items-center">
              <div className="mr-1 text-sm">
                {page.emoji || <FileText className="h-4 w-4 text-gray-400" />}
              </div>
              <span className="dark:text-[#B4B4B4] text-sm font-medium truncate block">{page.title}</span>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareDialog(true)}
              className="flex justify-center items-center gap-2 h-7"
            >
              <Users className="h-4 w-4 text-[#B4B4B4]" />
              <p className="text-[#B4B4B4] text-sm font-medium truncate block">Share</p>
            </Button>
            <X className="h-4 w-4 text-[#B4B4B4]" onClick={() => back()} />
          </div>
        </div>

        <SidebarProvider>
          <div className="w-full flex h-full dark:bg-transparent">
            <Sidebar className="!bg-transparent">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel />
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <div className="border-b dark:border-[#333]">
                        <div className="flex items-center justify-between mb-1">
                          <h2 className="font-semibold truncate text-md">{team?.name}</h2>
                          <div className="flex justify-center items-center gap-2">
                            <AnimatedSearch
                              isOpen={isOpen}
                              searchQuery={searchQuery}
                              inputRef={inputRef}
                              onOpen={() => setIsOpen(true)}
                              onQueryChange={setSearchQuery}
                              onClear={() => setSearchQuery('')}
                            />
                            <SidebarTrigger className="h-4 w-4 mt-0 z-50" />
                          </div>
                        </div>
                      </div>

                      <SidebarMenuItem>
                        {pageTreeNodes || 'no pages found'}
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="w-full justify-start" onClick={() => createNewPage()}>
                          <Plus className="mr-1 h-4 w-4" />
                          Add Page
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>

            <div className="flex-1 w-full rounded-md dark:bg-[#111111] bg-[#FFFFFF] h-[92vh]">
              <div className="relative group">
                <SidebarAwareTrigger pageCount={Array.isArray(pageTreeNodes) ? pageTreeNodes.length : 0} />
              </div>
              <Editor page={page} onUpdate={updatePage} teamId={team?.id as string} />
            </div>
          </div>
        </SidebarProvider>
      </div>

      <Modal open={showShareDialog} onOpenChange={setShowShareDialog}>
        <ModalBody className="!max-w-[30%] !min-h-50% !h-[50%] !max-h-[50%] dark:bg-neutral-900 !w-[36%]">
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Share this page</ModalTitle>
              <ModalDescription>Anyone with the link can view this page</ModalDescription>
            </ModalHeader>
            <div className="space-y-4 mt-5">
              <div className="flex items-center !gap-x-2">
                <Switch id="public-access" />
                <Label htmlFor="public-access">Allow public access</Label>
              </div>
              <div className="flex items-center !gap-x-2">
                <Switch id="allow-comments" />
                <Label htmlFor="allow-comments">Allow comments</Label>
              </div>
              <div className="flex items-center !gap-x-2">
                <Switch id="allow-editing" />
                <Label htmlFor="allow-editing">Allow editing</Label>
              </div>
            </div>
          </ModalContent>
          <ModalFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>Cancel</Button>
            <Button onClick={handleShare} className="bg-[#6347EA] text-[#eee]">Copy link</Button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </>
  );
}