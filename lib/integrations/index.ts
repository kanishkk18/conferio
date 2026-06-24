// lib/integrations/index.ts
// ── API wrappers ──────────────────────────────────────────────────────────
export * from './slack/slack'
export * from './notion/notion'
export * from './jira/jira'
export * from './microsoft/microsoft'
export * from './storage/storage-providers'
export * from './crm/salesforce'
export * from './discord/discord'

// ── Token management ──────────────────────────────────────────────────────
export {
  saveToken,
  getToken,
  disconnectProvider,
  isConnected,
  getConnectedProviders,
  getValidGoogleToken,
  getValidMicrosoftToken,
} from './token-manager'
