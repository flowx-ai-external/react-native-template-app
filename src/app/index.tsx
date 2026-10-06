import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import {
  FlxButton,
  FlxFieldContainer,
  FlxInput,
  FlxInputField,
  FlxLabel,
  FlxModal,
} from '@flowx/react-native-ui-toolkit'

import { AuthProvider, useAuth } from '@/auth/AuthContext'
import { LoginModal } from '@/auth/LoginModal'
import { configureFlowX } from '@/sdk/flowx'
import { registerObservability } from '@/sdk/observability'
import {
  clearLastProcessInstanceUuid,
  readLastProcessInstanceUuid,
  saveLastProcessInstanceUuid,
} from '@/storage/storage'
import { ChatScreen } from './ChatScreen'
import { appConfig, sdkSettings } from './config'
import { ProcessScreen } from './ProcessScreen'
import {
  type ChatSetupValues,
  type ProcessSetupValues,
  type SessionDisposer,
  type UiFlowSetupValues,
} from './types'
import { UiFlowScreen } from './UiFlowScreen'

const MainScreen = () => {
  const { tokens, isAuthenticated, isRehydrating, logout } = useAuth()
  const accessToken = tokens?.accessToken
  const organizationId = tokens?.organizationId

  const [processSetup, setProcessSetup] = useState<ProcessSetupValues | null>(null)
  const [uiFlowSetup, setUiFlowSetup] = useState<UiFlowSetupValues | null>(null)
  const [chatSetup, setChatSetup] = useState<ChatSetupValues | null>(null)
  const [lastInstanceUuid, setLastInstanceUuid] = useState<string | null>(null)
  const [continueVisible, setContinueVisible] = useState(false)
  const [continueUuid, setContinueUuid] = useState('')
  // The live process or UI flow session, reported by its screen.
  const sessionRef = useRef<SessionDisposer | null>(null)
  const onSession = useCallback((session: SessionDisposer | null) => {
    sessionRef.current = session
  }, [])

  const effectiveOrganizationId = appConfig.organizationId || organizationId

  // Shared SDK config values used by every launch mode.
  const configValues = useMemo(
    () => ({ organizationId: effectiveOrganizationId, themeId: appConfig.themeId }),
    [effectiveOrganizationId]
  )

  // Rehydrate the last started instance UUID so "Continue process" survives restarts.
  useEffect(() => {
    let active = true
    readLastProcessInstanceUuid().then((uuid) => {
      if (active && uuid) setLastInstanceUuid(uuid)
    })
    return () => {
      active = false
    }
  }, [])

  // Session-independent, so registered here once rather than per launch.
  useEffect(
    () =>
      registerObservability({
        // The SDK only notifies; the host shows the new process. Dispose the
        // current session first, then continue the new one.
        onNewProcess: (uuid) => {
          setLastInstanceUuid(uuid)
          saveLastProcessInstanceUuid(uuid).catch(() => undefined)
          sessionRef.current?.dispose()
          sessionRef.current = null
          setUiFlowSetup(null)
          setProcessSetup({ ...configValues, mode: 'continue', processInstanceUuid: uuid })
        },
      }),
    [configValues]
  )

  // Config in place before anything launches; ProcessScreen re-applies it.
  useEffect(() => {
    if (!effectiveOrganizationId) return
    configureFlowX({
      settings: sdkSettings,
      organizationId: effectiveOrganizationId,
      themeId: appConfig.themeId,
    })
  }, [effectiveOrganizationId])

  const startProcess = useCallback(() => {
    setProcessSetup({
      ...configValues,
      mode: 'start',
      workspaceId: appConfig.workspaceId,
      projectId: appConfig.projectId,
      processName: appConfig.processName,
    })
  }, [configValues])

  const startUiFlow = useCallback(() => {
    setUiFlowSetup({
      ...configValues,
      workspaceId: appConfig.workspaceId,
      projectId: appConfig.projectId,
      uiFlowName: appConfig.uiFlowName,
    })
  }, [configValues])

  const startChat = useCallback(() => {
    setChatSetup({
      ...configValues,
      workspaceId: appConfig.workspaceId,
      projectId: appConfig.projectId,
      workflowId: appConfig.chatWorkflowId,
    })
  }, [configValues])

  // Capture the running instance UUID so it can be resumed later.
  const onProcessStarted = useCallback((uuid: string) => {
    setLastInstanceUuid(uuid)
    saveLastProcessInstanceUuid(uuid).catch(() => undefined)
  }, [])

  const openContinue = useCallback(() => {
    setContinueUuid(lastInstanceUuid ?? '')
    setContinueVisible(true)
  }, [lastInstanceUuid])

  const confirmContinue = useCallback(() => {
    const uuid = continueUuid.trim()
    if (!uuid) return
    setContinueVisible(false)
    setProcessSetup({
      ...configValues,
      mode: 'continue',
      processInstanceUuid: uuid,
    })
  }, [continueUuid, configValues])

  const onLogout = useCallback(() => {
    setProcessSetup(null)
    setUiFlowSetup(null)
    setChatSetup(null)
    setLastInstanceUuid(null)
    clearLastProcessInstanceUuid().catch(() => undefined)
    logout()
  }, [logout])

  // One surface at a time: only the setup that was just opened is non-null,
  // because the way back to the menu clears it.
  const hasSession = !!(processSetup || uiFlowSetup || chatSetup)

  const renderSession = () => {
    // No surface can launch without both; a blank holds its place if the
    // token is briefly absent instead of dropping back to the menu.
    if (!accessToken || !organizationId) return <View style={styles.fallback} />

    if (processSetup)
      return (
        <ProcessScreen
          values={processSetup}
          accessToken={accessToken}
          organizationId={organizationId}
          onBack={() => setProcessSetup(null)}
          onProcessStarted={onProcessStarted}
          onSession={onSession}
        />
      )

    if (uiFlowSetup)
      return (
        <UiFlowScreen
          values={uiFlowSetup}
          accessToken={accessToken}
          organizationId={organizationId}
          onBack={() => setUiFlowSetup(null)}
          onSession={onSession}
        />
      )

    if (chatSetup)
      return (
        <ChatScreen
          values={chatSetup}
          accessToken={accessToken}
          organizationId={organizationId}
          onBack={() => setChatSetup(null)}
        />
      )

    return null
  }

  if (isRehydrating) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.fallback} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {isAuthenticated ? (
        hasSession ? (
          renderSession()
        ) : (
          <View style={styles.main}>
            <View style={styles.buttons}>
              <FlxButton onPress={startProcess}>Start process</FlxButton>
              <FlxButton onPress={openContinue}>Continue process</FlxButton>
              <FlxButton onPress={startUiFlow}>Start UI flow</FlxButton>
              <FlxButton onPress={startChat}>Start chat</FlxButton>
            </View>
            <View style={styles.buttons}>
              <FlxButton onPress={onLogout}>Logout</FlxButton>
            </View>
          </View>
        )
      ) : null}

      <FlxModal
        open={continueVisible}
        onClose={() => setContinueVisible(false)}
        title="Continue process"
        subtitle="Resume an existing process instance by its UUID."
      >
        <View style={styles.continueBody}>
          <FlxFieldContainer>
            <FlxLabel text="Process instance UUID" />
            <FlxInput filled={continueUuid.length > 0}>
              <FlxInputField
                value={continueUuid}
                onChangeText={setContinueUuid}
                placeholder="8f52744-8403-4e8d-…"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </FlxInput>
          </FlxFieldContainer>
          <FlxButton disabled={continueUuid.trim().length === 0} onPress={confirmContinue}>
            Continue
          </FlxButton>
        </View>
      </FlxModal>

      <LoginModal visible={!isAuthenticated} />
    </SafeAreaView>
  )
}

export default function Index() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <AuthProvider>
          <MainScreen />
        </AuthProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 0 },
  main: { flex: 1, justifyContent: 'space-between' },
  buttons: { gap: 12, padding: 16, paddingTop: 48 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 0 },
  continueBody: { gap: 12 },
})
