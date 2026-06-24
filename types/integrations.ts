// types/integrations.ts

export type IntegrationProvider =
  | 'google'
  | 'slack'
  | 'notion'
  | 'jira'
  | 'microsoft'
  | 'box'
  | 'dropbox'
  | 'salesforce'
  | 'discord'

export type IntegrationScope =
  | 'drive'        // Google Drive
  | 'gmail'        // Google Gmail
  | 'calendar'     // Google Calendar
  | 'slack'        // Slack messaging
  | 'notion'       // Notion pages
  | 'jira'         // Jira issues
  | 'onedrive'     // Microsoft OneDrive
  | 'teams'        // Microsoft Teams
  | 'box'          // Box storage
  | 'dropbox'      // Dropbox storage
  | 'salesforce'   // Salesforce CRM
  | 'discord'      // Discord

export interface ProviderConfig {
  id: IntegrationProvider
  name: string
  description: string
  icon: string           // URL or emoji
  color: string          // brand color
  category: 'storage' | 'communication' | 'productivity' | 'crm' | 'project'
  scopes: string[]       // OAuth scopes to request
  authUrl: string        // /api/integrations/[provider]/connect
  features: string[]     // Human-readable capabilities
  docsUrl?: string
}

export interface ConnectedIntegration {
  id: string
  provider: IntegrationProvider
  scope: IntegrationScope
  isConnected: boolean
  connectedAt?: string
  metadata?: Record<string, unknown>
  // Derived from token
  accountName?: string
  accountEmail?: string
  accountAvatar?: string
}

export interface IntegrationStatus {
  provider: IntegrationProvider
  connected: boolean
  scopes: IntegrationScope[]
  connectedAt?: string
  accountName?: string
  accountEmail?: string
}