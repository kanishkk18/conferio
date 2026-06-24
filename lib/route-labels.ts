export const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/meetings/page': 'Meetings',
  '/chat': 'Chat',
  '/members': 'Members',
  '/scrumboard': 'Scrumboard',
  '/docs': 'Docs',
  '/teams': 'Workload',
  '/time-tracking': 'Timesheet',
  '/drive/page': 'Drive',
  '/events/page': 'Events',
  '/calendar/page': 'Calendar',
  '/clips': 'Clips',
  '/whiteboard': 'Whiteboard',
  '/scheduled/page': 'Scheduled',
  '/music': 'Music',
  '/settings/page': 'Settings',
};

export function getRouteLabel(pathname: string): string {
  // Try exact match first
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  
  // Try matching the base path (e.g., /members/some-slug -> /members)
  const basePath = '/' + pathname.split('/')[1];
  return ROUTE_LABELS[basePath] || pathname;
}

export function normalizeRoute(pathname: string): string {
  // Normalize dynamic routes to their base pattern
  // e.g., /members/my-team -> /members
  // e.g., /teams/my-team/workload -> /teams
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return '/dashboard';
  
  const base = '/' + parts[0];
  
  // Keep two-segment routes that are known
  const twoSegment = '/' + parts.slice(0, 2).join('/');
  if (ROUTE_LABELS[twoSegment]) return twoSegment;
  
  return base;
}