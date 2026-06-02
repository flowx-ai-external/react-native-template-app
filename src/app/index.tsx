import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import { FlxButton } from '@flowx/react-native-ui-toolkit'

import { AuthProvider, useAuth } from '@/auth/AuthContext'
import { LoginModal } from '@/auth/LoginModal'
import { appConfig } from './config'
import { ProcessScreen } from './ProcessScreen'
import { type ProcessSetupValues } from './types'

const MainScreen = () => {
  const { tokens, isAuthenticated, isRehydrating, logout } = useAuth()
  const accessToken = tokens?.accessToken
  const organizationId = tokens?.organizationId

  const [processSetup, setProcessSetup] = useState<ProcessSetupValues | null>(null)

  const startProcess = useCallback(() => {
    setProcessSetup({
      organizationId: appConfig.organizationId || organizationId,
      workspaceId: appConfig.workspaceId,
      projectId: appConfig.projectId,
      processName: appConfig.processName,
      themeId: appConfig.themeId,
      language: appConfig.language,
      locale: appConfig.locale,
    })
  }, [organizationId])

  const onLogout = useCallback(() => {
    setProcessSetup(null)
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
            />
          ) : (
            <View style={styles.fallback} />
          )
        ) : (
          <View style={styles.main}>
            <View style={styles.buttons}>
              <FlxButton onPress={startProcess}>Start process</FlxButton>
            </View>
            <View style={styles.buttons}>
              <FlxButton onPress={onLogout}>Logout</FlxButton>
            </View>
          </View>
        )
      ) : null}
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
})
