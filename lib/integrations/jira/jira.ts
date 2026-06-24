// lib/integrations/jira/jira.ts

export interface JiraIssue {
  id: string
  key: string        // e.g. "PROJ-123"
  summary: string
  description?: string
  status: string
  statusCategory: 'todo' | 'inprogress' | 'done'
  priority?: string
  issueType: string
  assignee?: { displayName: string; avatarUrl?: string; email?: string }
  reporter?: { displayName: string; avatarUrl?: string }
  project: { id: string; key: string; name: string }
  labels: string[]
  created: string
  updated: string
  dueDate?: string
  url: string
}

export interface JiraProject {
  id: string
  key: string
  name: string
  description?: string
  avatarUrl?: string
  issueCount?: number
}

function jiraHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

function mapStatusCategory(status: any): 'todo' | 'inprogress' | 'done' {
  const key = status?.statusCategory?.key ?? ''
  if (key === 'done') return 'done'
  if (key === 'indeterminate') return 'inprogress'
  return 'todo'
}

function mapIssue(raw: any, cloudUrl: string): JiraIssue {
  const fields = raw.fields
  return {
    id: raw.id,
    key: raw.key,
    summary: fields.summary,
    description: fields.description?.content?.[0]?.content?.[0]?.text,
    status: fields.status?.name,
    statusCategory: mapStatusCategory(fields.status),
    priority: fields.priority?.name,
    issueType: fields.issuetype?.name,
    assignee: fields.assignee ? {
      displayName: fields.assignee.displayName,
      avatarUrl: fields.assignee.avatarUrls?.['24x24'],
      email: fields.assignee.emailAddress,
    } : undefined,
    reporter: fields.reporter ? {
      displayName: fields.reporter.displayName,
      avatarUrl: fields.reporter.avatarUrls?.['24x24'],
    } : undefined,
    project: {
      id: fields.project?.id,
      key: fields.project?.key,
      name: fields.project?.name,
    },
    labels: fields.labels ?? [],
    created: fields.created,
    updated: fields.updated,
    dueDate: fields.duedate ?? undefined,
    url: `${cloudUrl}/browse/${raw.key}`,
  }
}

export async function searchJiraIssues(
  token: string,
  cloudId: string,
  cloudUrl: string,
  query: string,
  options: { projectKey?: string; status?: string; maxResults?: number } = {}
): Promise<JiraIssue[]> {
  let jql = `text ~ "${query.replace(/"/g, '\\"')}" ORDER BY updated DESC`
  if (options.projectKey) jql = `project = ${options.projectKey} AND ${jql}`
  if (options.status) jql = `status = "${options.status}" AND ${jql}`

  const res = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`,
    {
      method: 'POST',
      headers: jiraHeaders(token),
      body: JSON.stringify({
        jql,
        maxResults: options.maxResults ?? 20,
        fields: ['summary', 'status', 'priority', 'issuetype', 'assignee', 'reporter', 'project', 'labels', 'created', 'updated', 'duedate', 'description'],
      }),
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.errorMessages?.[0] ?? 'Jira search failed')
  return (data.issues ?? []).map((i: any) => mapIssue(i, cloudUrl))
}

export async function getJiraIssue(
  token: string,
  cloudId: string,
  cloudUrl: string,
  issueKey: string
): Promise<JiraIssue> {
  const res = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`,
    { headers: jiraHeaders(token) }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.errorMessages?.[0] ?? 'Jira issue fetch failed')
  return mapIssue(data, cloudUrl)
}

export async function listJiraProjects(
  token: string,
  cloudId: string
): Promise<JiraProject[]> {
  const res = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search?maxResults=50`,
    { headers: jiraHeaders(token) }
  )
  const data = await res.json()
  if (!res.ok) throw new Error('Jira projects fetch failed')
  return (data.values ?? []).map((p: any) => ({
    id: p.id,
    key: p.key,
    name: p.name,
    description: p.description,
    avatarUrl: p.avatarUrls?.['24x24'],
  }))
}

export async function getJiraMyIssues(
  token: string,
  cloudId: string,
  cloudUrl: string,
  maxResults = 20
): Promise<JiraIssue[]> {
  const res = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`,
    {
      method: 'POST',
      headers: jiraHeaders(token),
      body: JSON.stringify({
        jql: 'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC',
        maxResults,
        fields: ['summary', 'status', 'priority', 'issuetype', 'assignee', 'reporter', 'project', 'labels', 'created', 'updated', 'duedate'],
      }),
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error('Jira my issues fetch failed')
  return (data.issues ?? []).map((i: any) => mapIssue(i, cloudUrl))
}

export async function updateJiraIssueStatus(
  token: string,
  cloudId: string,
  issueKey: string,
  transitionId: string
): Promise<void> {
  await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/transitions`,
    {
      method: 'POST',
      headers: jiraHeaders(token),
      body: JSON.stringify({ transition: { id: transitionId } }),
    }
  )
}

export async function addJiraComment(
  token: string,
  cloudId: string,
  issueKey: string,
  text: string
): Promise<void> {
  await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/comment`,
    {
      method: 'POST',
      headers: jiraHeaders(token),
      body: JSON.stringify({
        body: {
          type: 'doc', version: 1,
          content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
        },
      }),
    }
  )
}
