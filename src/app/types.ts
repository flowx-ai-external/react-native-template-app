type ConfigFields = {
  themeId: string
  locale: string
  language: string
}

export type ProcessSetupValues = ConfigFields & {
  organizationId: string | undefined
  workspaceId: string
  projectId: string
  processName: string
}

export type ProcessScreenProps = {
  values: ProcessSetupValues
  accessToken: string
  organizationId: string
  onBack: () => void
}
