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
  customLoaderProviderEnabled: boolean
  customStepperHeaderProviderEnabled: boolean
  // Live for REST; SSE picks them up on later connections.
  additionalHttpHeadersEnabled: boolean
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

// Addressed by `uiFlowName` alone — the SDK resolves build info itself.
export type UiFlowLaunch = {
  workspaceId: string
  projectId: string
  uiFlowName: string
}

export type UiFlowSetupValues = SdkConfigValues & UiFlowLaunch

// Addressed by the workflow behind the conversation. There is no instance uuid
// to persist: history lives on the backend and is reached from the chat header.
export type ChatLaunch = {
  workspaceId: string
  projectId: string
  workflowId: string
}

export type ChatSetupValues = SdkConfigValues & ChatLaunch

// The live session's disposer, or null once it ends. Lets the host dispose
// explicitly, ahead of unmounting the screen.
export type SessionDisposer = { dispose(): void }

export type ProcessScreenProps = {
  values: ProcessSetupValues
  accessToken: string
  organizationId: string
  onBack: () => void
  onProcessStarted?: (processInstanceUuid: string) => void
  onSession?: (session: SessionDisposer | null) => void
}

// No `onProcessStarted`: no instance uuid, so nothing to persist or continue.
export type UiFlowScreenProps = {
  values: UiFlowSetupValues
  accessToken: string
  organizationId: string
  onBack: () => void
  onSession?: (session: SessionDisposer | null) => void
}

// Same shape as UiFlowScreenProps: nothing to resume, so no started callback.
export type ChatScreenProps = {
  values: ChatSetupValues
  accessToken: string
  organizationId: string
  onBack: () => void
}
