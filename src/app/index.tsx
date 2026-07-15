import { useCallback, useEffect, useMemo, useState } from 'react'
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
import {
  clearLastProcessInstanceUuid,
  readLastProcessInstanceUuid,
  saveLastProcessInstanceUuid,
} from '@/storage/storage'
import { appConfig } from './config'
import { ProcessScreen } from './ProcessScreen'
import { type ProcessSetupValues } from './types'

const MainScreen = () => {
  const { tokens, isAuthenticated, isRehydrating, logout } = useAuth()
  const accessToken = tokens?.accessToken
  const organizationId = tokens?.organizationId

  const [processSetup, setProcessSetup] = useState<ProcessSetupValues | null>(null)
  const [lastInstanceUuid, setLastInstanceUuid] = useState<string | null>(null)
  const [continueVisible, setContinueVisible] = useState(false)
  const [continueUuid, setContinueUuid] = useState('')

  // Shared SDK config values used by both launch modes.
  const configValues = useMemo(
    () => ({
      organizationId: appConfig.organizationId || organizationId,
      themeId: appConfig.themeId,
      language: appConfig.language,
      locale: appConfig.locale,
    }),
    [organizationId]
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

  const startProcess = useCallback(() => {
    setProcessSetup({
      ...configValues,
      mode: 'start',
      workspaceId: appConfig.workspaceId,
      projectId: appConfig.projectId,
      processName: appConfig.processName,
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
    setLastInstanceUuid(null)
    clearLastProcessInstanceUuid().catch(() => undefined)
    logout()
  }, [logout])

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
        processSetup ? (
          accessToken && organizationId ? (
            <ProcessScreen
              values={processSetup}
              accessToken={accessToken}
              organizationId={organizationId}
              onBack={() => setProcessSetup(null)}
              onProcessStarted={onProcessStarted}
            />
          ) : (
            <View style={styles.fallback} />
          )
        ) : (
          <View style={styles.main}>
            <View style={styles.buttons}>
              <FlxButton onPress={startProcess}>Start process</FlxButton>
              <FlxButton onPress={openContinue}>Continue process</FlxButton>
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
