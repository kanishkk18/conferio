// hooks/useSearch.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import type { SearchCategory, SearchResult, RecentSearch } from 'types/search'

const DEBOUNCE_MS = 220
const MAX_RECENT = 8
const STORAGE_KEY = 'conferio:recent-searches'

function loadRecent(): RecentSearch[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecent(searches: RecentSearch[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
  } catch {}
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SearchCategory>('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [took, setTook] = useState(0)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load recent on mount
  useEffect(() => {
    setRecentSearches(loadRecent())
  }, [])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [results])

  const doSearch = useCallback(async (q: string, cat: SearchCategory) => {
    if (!q.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    // Cancel previous request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&category=${cat}&limit=30`,
        { signal: abortRef.current.signal }
      )
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data.results ?? [])
      setTook(data.took ?? 0)
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search trigger
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    debounceRef.current = setTimeout(() => {
      doSearch(query, category)
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, category, doSearch])

  const saveQuery = useCallback((q: string) => {
    if (!q.trim()) return
    const updated: RecentSearch[] = [
      { query: q.trim(), timestamp: Date.now() },
      ...loadRecent().filter((r) => r.query !== q.trim()),
    ].slice(0, MAX_RECENT)
    setRecentSearches(updated)
    saveRecent(updated)
  }, [])

  const clearRecent = useCallback(() => {
    setRecentSearches([])
    saveRecent([])
  }, [])

  const moveSelection = useCallback(
    (dir: 'up' | 'down') => {
      setSelectedIndex((prev) => {
        if (results.length === 0) return -1
        if (dir === 'down') return Math.min(prev + 1, results.length - 1)
        return Math.max(prev - 1, -1)
      })
    },
    [results.length]
  )

  return {
    query,
    setQuery,
    category,
    setCategory,
    results,
    isLoading,
    took,
    recentSearches,
    saveQuery,
    clearRecent,
    selectedIndex,
    setSelectedIndex,
    moveSelection,
  }
}
