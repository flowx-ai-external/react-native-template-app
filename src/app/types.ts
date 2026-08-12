// Runtime-tunable SDK settings, edited in src/app/config.ts. See
// src/sdk/flowx.ts for what reaches a live session. The observability
// collectors take no settings — they are always on; see src/sdk/observability.ts.
export type SdkSettings = {
  // Next launch only; the SDK holds them in memory.
  language: string
  locale: string
  // Applied at once.
  cacheDocuments: boolean
  // Patched into the live session too.
  updateStateEnabled: boolean
  // Next launch only.
  customLoaderEnabled: boolean
  // Live for REST; SSE picks them up on later connections.
  customHeadersEnabled: boolean
  // Next launch only.
  interceptorsEnabled: boolean
}

// SDK config shared by both launch modes. Locale lives in SdkSettings, so it
// can change without rebuilding a launch descriptor.
type SdkConfigValues = {
  themeId: string
  organizationId: string | undefined
}

// Launch a brand-new process instance.
export type StartLaunch = {
  mode: 'start'
  workspaceId: string
  projectId: string
  processName: string
}

// Reattach to an already-started process instance by its UUID.
export type ContinueLaunch = {
  mode: 'continue'
  processInstanceUuid: string
}

export type ProcessLaunch = StartLaunch | ContinueLaunch

export type ProcessSetupValues = SdkConfigValues & ProcessLaunch

export type ProcessScreenProps = {
  values: ProcessSetupValues
  accessToken: string
  organizationId: string
  onBack: () => void
  onProcessStarted?: (processInstanceUuid: string) => void
}
