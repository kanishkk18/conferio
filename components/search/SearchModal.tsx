
// components/search/SearchModal.tsx
import React, { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/router'
import { useSearch } from 'hooks/useSearch'
import type { SearchCategory, SearchResult } from 'types/search'
import { LayoutDashboard } from '../animate-ui/icons/layout-dashboard'
import { ClipboardList } from '../animate-ui/icons/clipboard-list'
import { CircleCheckBig } from '../animate-ui/icons/circle-check-big'
import { Paperclip } from '../animate-ui/icons/paperclip'
import { Users } from '../animate-ui/icons/users'
import { AlarmClock } from '../animate-ui/icons/alarm-clock'
import { Clock3 } from '../animate-ui/icons/clock-3'
import { SquareKanban } from '../animate-ui/icons/square-kanban'
import HashtagIcon from '../ui/hashtag-icon'
import { CalendarClock, X } from 'lucide-react'

// ── Category tabs ─────────────────────────────────────────────────────────
const CATEGORIES: { id: SearchCategory; label: string; icon: JSX.Element }[] = [
  { id: 'all', label: 'All', icon: <LayoutDashboard className="size-3.5 dark:text-[#B4B4B4]" /> },
  { id: 'tasks', label: 'Tasks', icon: <CircleCheckBig animateOnHover className="size-3.5 dark:text-[#B4B4B4]" /> },
  { id: 'boards', label: 'Boards', icon: <SquareKanban animateOnHover className="size-3.5 dark:text-[#B4B4B4]" /> },
  { id: 'pages', label: 'Pages', icon: <ClipboardList animateOnHover className="size-3.5 dark:text-[#B4B4B4]" /> },
  { id: 'files', label: 'Files', icon: <Paperclip animateOnHover className="size-3.5 dark:text-[#B4B4B4]" /> },
  { id: 'meetings', label: 'Meetings', icon: <CalendarClock className="size-3.5 dark:text-[#B4B4B4]"/> },
  { id: 'members', label: 'Members', icon: <Users animateOnHover className="size-3.5 dark:text-[#B4B4B4]" /> },
  { id: 'channels', label: 'Channels', icon: <HashtagIcon className="size-3.5 dark:text-[#B4B4B4]"/> },
  { id: 'reminders', label: 'Reminders', icon: <AlarmClock animateOnHover className="size-3.5 dark:text-[#B4B4B4]" /> },
  { id: 'time-entries', label: 'TimeSheet', icon: <Clock3 animateOnHover className="size-3.5 dark:text-[#B4B4B4]"/> },
]

const STATUS_COLORS: Record<string, string> = {
  TODO: '#6B7280',
  IN_PROGRESS: '#3B82F6',
  REVIEW: '#F59E0B',
  DONE: '#22C55E',
  SCHEDULED: '#3B82F6',
  CANCELLED: '#EF4444',
  PENDING: '#F59E0B',
  APPROVED: '#22C55E',
  REJECTED: '#EF4444',
  NOTIFIED: '#6B7280',
}

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#F59E0B',
  LOW: '#22C55E',
}

// ── Single Result Row ─────────────────────────────────────────────────────
function ResultRow({
  result,
  isSelected,
  onSelect,
  onMouseEnter,
}: {
  result: SearchResult
  isSelected: boolean
  onSelect: () => void
  onMouseEnter: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest' })
    }
  }, [isSelected])

  return (
    <div
      ref={ref}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={`
        flex items-center gap-3 py-[9px] px-4 cursor-pointer rounded-lg mx-[6px] my-[1px] transition-colors duration-100
        ${isSelected ? 'bg-[#F0F7FF] border-l-2 border-l-blue-500' : 'bg-transparent border-l-2 border-l-transparent'}
      `}
    >
      {/* Icon */}
      <div className={`
        size-8  rounded-lg flex items-center justify-center text-[15px] shrink-0 transition-colors duration-100
        ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
      `}>
        {result.memberAvatar ? (
          <img
            src={result.memberAvatar}
            alt={result.title}
            className="size-8  rounded-lg object-cover"
          />
        ) : (
          result.icon
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13.5px] font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[260px]">
            {result.title}
          </span>

          {/* Status badge */}
          {result.status && (
            <span
              className="text-xs font-semibold px-[6px] py-[1px] rounded tracking-wide uppercase"
              style={{
                backgroundColor: (STATUS_COLORS[result.status] ?? '#6B7280') + '20',
                color: STATUS_COLORS[result.status] ?? '#6B7280',
              }}
            >
              {result.status.replace('_', ' ')}
            </span>
          )}

          {/* Priority badge */}
          {result.priority && (
            <span
              className="text-xs font-semibold px-[6px] py-[1px] rounded tracking-wide uppercase"
              style={{
                backgroundColor: (PRIORITY_COLORS[result.priority] ?? '#6B7280') + '20',
                color: PRIORITY_COLORS[result.priority] ?? '#6B7280',
              }}
            >
              {result.priority}
            </span>
          )}
        </div>

        <div className="flex items-center gap-[6px] mt-[2px]">
          {result.subtitle && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {result.subtitle}
            </span>
          )}
          {result.subtitle && result.description && (
            <span className="text-xs text-gray-300">·</span>
          )}
          {result.description && (
            <span className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
              {result.description}
            </span>
          )}
        </div>
      </div>

      {/* Right meta */}
      <div className="flex items-center gap-2 shrink-0">
        {result.dueDate && (
          <span className="text-xs text-gray-400">
            {new Date(result.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {result.startTime && (
          <span className="text-xs text-gray-400">
            {new Date(result.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {result.fileSize && (
          <span className="text-xs text-gray-400">{result.fileSize}</span>
        )}
        {/* Arrow hint on hover */}
        {isSelected && (
          <span className="text-xs text-gray-400">↵</span>
        )}
      </div>
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────
function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="px-[22px] pt-[10px] pb-1 flex items-center justify-between">
      <span className="text-[10.5px] font-bold tracking-widest uppercase text-gray-400">
        {label}
      </span>
      <span className="text-[10.5px] text-gray-300">{count}</span>
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────────────────
interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { push } = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    query, setQuery,
    category, setCategory,
    results, isLoading, took,
    recentSearches, saveQuery, clearRecent,
    selectedIndex, setSelectedIndex, moveSelection,
  } = useSearch()

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setSelectedIndex(-1)
    }
  }, [open, setQuery, setSelectedIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection('down') }
      if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection('up') }
      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        const result = results[selectedIndex]
        if (result) handleNavigate(result)
      }
      // Tab through categories
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        const idx = CATEGORIES.findIndex((c) => c.id === category)
        const next = CATEGORIES[(idx + 1) % CATEGORIES.length]
        setCategory(next.id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, moveSelection, selectedIndex, results, category, setCategory, onClose])

  const handleNavigate = useCallback((result: SearchResult) => {
    saveQuery(query)
    push(result.url)
    onClose()
  }, [query, push, saveQuery, onClose])

  // Group results by type when showing 'all'
  const groupedResults = React.useMemo(() => {
    if (category !== 'all') return { all: results }
    const groups: Record<string, SearchResult[]> = {}
    for (const r of results) {
      if (!groups[r.type]) groups[r.type] = []
      groups[r.type].push(r)
    }
    return groups
  }, [results, category])

  const TYPE_LABELS: Record<string, string> = {
    task: 'Tasks', board: 'Boards', page: 'Pages',
    file: 'Files', meeting: 'Meetings', member: 'Members',
    channel: 'Channels', reminder: 'Reminders', 'time-entry': 'Time Entries',
  }

  // Don't render anything if not open (no mounted state needed)
  if (!open) return null

  return createPortal(
    <div suppressHydrationWarning>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 backdrop-blur-sm z-[10000] animate-[fadeIn_0.15s_ease]"
      />

      {/* Modal */}
      <div
        className="fixed top-[12vh] left-1/2 -translate-x-1/2 w-full max-w-[660px] bg-white dark:bg-[#191919] border dark:border-[#333] rounded-2xl z-[10001] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.20),0_4px_16px_rgba(0,0,0,0.10)] animate-[slideDown_0.18s_cubic-bezier(0.34,1.56,0.64,1)]"
      >
        {/* Search Input Row */}
        <div className="flex items-center gap-3 py-[14px] px-[18px]">
          {/* Search icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>

          <input
          aria-label="search"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, boards, pages, files, meetings…"
            className="flex-1 border-none bg-transparent text-[15px] dark:text-[#EEE] text-gray-900 font-inherit outline-none"
          />

          {/* Loading spinner */}
          {isLoading && (
            <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin shrink-0" />
          )}

          {/* Clear */}
          {query && !isLoading && (
            <button type="button"
              onClick={() => setQuery('')}
              className="bg-none border-none cursor-pointer text-gray-400 text-lg px-[2px] leading-none shrink-0"
            >
              <X className='size-4'/>
            </button>
          )}

          {/* ESC badge */}
          <kbd className="text-xs font-semibold px-[6px] py-[2px] bg-gray-100 text-gray-500 rounded border border-gray-200 font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-x-[6px] px-3 py-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button type="button"
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`
                flex items-center dark:text-[#B4B4B4] border dark:border-[#444] gap-[5px] px-[10px] py-[5px] rounded-full cursor-pointer text-xs whitespace-nowrap transition-colors duration-100 font-inherit
                ${category === cat.id ? 'font-semibold text-blue-700 bg-blue-50' : 'font-normal text-gray-500 bg-transparent'}
              `}
            >
              <span className="text-[13px] ">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results / Empty / Recent */}
        <div className="max-h-[420px] overflow-y-auto py-[6px]">

          {/* Empty query → show recent searches */}
          {!query && recentSearches.length > 0 && (
            <>
              <div className="px-[22px] pt-2 pb-1 flex justify-between items-center">
                <span className="text-[10.5px] font-bold tracking-widest uppercase text-gray-400">
                  Recent Searches
                </span>
                <button type="button"
                  onClick={clearRecent}
                  className="bg-none border-none cursor-pointer text-xs text-gray-400"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((r) => (
                <div
                  key={r.query + r.timestamp}
                  onClick={() => setQuery(r.query)}
                  className="flex items-center gap-[10px] px-[22px] py-2 cursor-pointer text-[13px] text-gray-700 transition-colors duration-100 hover:bg-gray-50"
                >
                  <span className="text-gray-300 text-sm">↺</span>
                  {r.query}
                </div>
              ))}
            </>
          )}

          {/* Empty query, no recent */}
          {!query && recentSearches.length === 0 && (
            <div className="px-5 py-10 text-center text-gray-400">
              <div className="text-[32px] mb-2">🔍</div>
              <p className="text-[13.5px] font-medium text-gray-700 mb-1">
                Search everything
              </p>
              <p className="text-xs">
                Tasks, boards, pages, files, meetings, members…
              </p>
            </div>
          )}

          {/* No results */}
          {query && !isLoading && results.length === 0 && (
            <div className="px-5 py-10 text-center text-gray-400">
              <div className="text-[32px] mb-2">🤷</div>
              <p className="text-[13.5px] font-medium text-gray-700 mb-1">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs">
                Try a different keyword or switch category
              </p>
            </div>
          )}

          {/* Results — grouped when 'all', flat otherwise */}
          {query && results.length > 0 && category === 'all' && (
            Object.entries(groupedResults).map(([type, items]) => (
              <div key={type}>
                <SectionHeader label={TYPE_LABELS[type] ?? type} count={items.length} />
                {items.map((result) => {
                  const globalIdx = results.indexOf(result)
                  return (
                    <ResultRow
                      key={result.id}
                      result={result}
                      isSelected={selectedIndex === globalIdx}
                      onSelect={() => handleNavigate(result)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                    />
                  )
                })}
              </div>
            ))
          )}

          {query && results.length > 0 && category !== 'all' && (
            results.map((result, idx) => (
              <ResultRow
                key={result.id}
                result={result}
                isSelected={selectedIndex === idx}
                onSelect={() => handleNavigate(result)}
                onMouseEnter={() => setSelectedIndex(idx)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-[18px] py-2 border-t dark:border-[#333] border-gray-100 flex items-center justify-between">
            <div className="flex gap-[14px]">
              {[
                { key: '↑↓', label: 'navigate' },
                { key: '↵', label: 'open' },
                { key: 'Tab', label: 'switch tab' },
                { key: 'Esc', label: 'close' },
              ].map(({ key, label }) => (
                <span key={key} className="flex items-center gap-1">
                  <kbd className="text-xs font-semibold px-[5px] py-[1px] bg-gray-100 text-gray-500 rounded border border-gray-200 font-mono">
                    {key}
                  </kbd>
                  <span className="text-xs text-gray-400">{label}</span>
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-300">
              {results.length} result{results.length !== 1 ? 's' : ''} · {took}ms
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px) scale(0.97) }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1) }
        }
      `}</style>
    </div>,
    document.body
  )
}
