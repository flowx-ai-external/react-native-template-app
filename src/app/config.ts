import { type SdkSettings } from './types'

// Process identity: what to launch and which theme to dress it in.
export const appConfig = {
  processName: '<PROCESS_NAME>',
  uiFlowName: '<UI_FLOW_NAME>',
  chatWorkflowId: '<CHAT_WORKFLOW_ID>',
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
  customStepperHeaderEnabled: false,
  customHeadersEnabled: true,
  interceptorsEnabled: true,
}

// FlxChatRenderer is configured entirely by props, never through
// FlowX.configure(), so its tunables sit here rather than in sdkSettings.
export const chatSettings = {
  // Cache the resources fetched for this build.
  cache: true,
  // Voice input needs the optional peers react-native-nitro-sound and
  // react-native-nitro-modules plus the toolkit's Expo config plugin; without
  // them no recorder is installed and the mic is not drawn. Keeping this false
  // hides it even once they are added. Voice messages recorded elsewhere still
  // play back either way.
  voiceInputEnabled: false,
}

// Presentation of the chat surface. Everything here is optional — drop the
// whole object and the SDK falls back to its own copy and themed icons.
export const chatConfig = {
  title: 'FlowX assistant',
  subtitle: 'Ask about your application',
  welcomeMessage: 'Welcome to the chat!',
  thinkingMessage: 'Thinking…',
  inputPlaceholder: 'Type a message…',
  suggestedPromptsTitle: 'Try one of these',
  suggestedPrompts: [
    { label: 'What can you do?', prompt: 'What can you help me with?' },
    { label: 'Check my application', prompt: 'What is the status of my application?' },
    // No prompt attached: the pill only offers the label.
    { label: 'Talk to an agent', prompt: null },
  ],
  errorMessage: 'Something went wrong. Please try again.',
  canRegenerate: true,
  historyTitle: 'Previous conversations',
  // Defaults, spelled out for reference.
  showChatIcon: true,
  showAgentAvatar: true,
  showSeparator: true,
  hideHeader: false,
  hideNewConversation: false,
  hideHistory: false,
  maxInputRows: 10,
}
