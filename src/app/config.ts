import { type SdkSettings } from './types'

// Process identity: what to launch and which theme to dress it in.
export const appConfig = {
  processName: '<PROCESS_NAME>',
  projectId: '<PROJECT_ID>',
  themeId: '<THEME_ID>',
  workspaceId: '<WORKSPACE_ID>',
  organizationId: '<ORGANIZATION_ID>',
  language: '<LANGUAGE>',
  locale: '<LOCALE>',
} as const

// The runtime-tunable SDK features, in one place. Each flag maps to a worked
// example under src/sdk; flip one and restart to see it take effect. The
// analytics collector and log sink are not here: they are always on.
export const sdkSettings: SdkSettings = {
  language: appConfig.language,
  locale: appConfig.locale,
  // Both default to true in the SDK; spelled out here for reference.
  cacheDocuments: true,
  updateStateEnabled: true,
  customLoaderEnabled: false,
  customHeadersEnabled: true,
  interceptorsEnabled: true,
}
