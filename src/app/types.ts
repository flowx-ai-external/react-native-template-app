type ConfigFields = {
  themeId: string
  locale: string
  language: string
}

// SDK config shared by both launch modes (start / continue).
type SdkConfigValues = ConfigFields & {
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
