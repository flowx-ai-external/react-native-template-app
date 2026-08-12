import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native'

import { FlowX, FlxProcessHandle } from '@flowx/react-native-sdk'
import { FlxText } from '@flowx/react-native-ui-toolkit'

import { configureFlowX } from '@/sdk/flowx'
import { sdkSettings } from './config'
import { type ProcessScreenProps } from './types'

const ProcessScreen = ({
  values,
  accessToken,
  organizationId,
  onBack,
  onProcessStarted,
}: ProcessScreenProps) => {
  // Gate on token availability, not its value: a silent refresh must not tear
  // down a running process. The rotated token arrives via setAccessToken below.
  const hasAccessToken = !!accessToken

  const [handle, setHandle] = useState<FlxProcessHandle | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRef = useRef<FlxProcessHandle | null>(null)
  const onBackRef = useRef(onBack)
  const onProcessStartedRef = useRef(onProcessStarted)

  useEffect(() => {
    handleRef.current = handle
  }, [handle])

  useEffect(() => {
    onBackRef.current = onBack
  }, [onBack])

  useEffect(() => {
    onProcessStartedRef.current = onProcessStarted
  }, [onProcessStarted])

  const { themeId } = values

  // Narrowed launch primitives — used directly below so the effect deps stay simple.
  const isContinue = values.mode === 'continue'
  const processInstanceUuid = values.mode === 'continue' ? values.processInstanceUuid : undefined
  const workspaceId = values.mode === 'start' ? values.workspaceId : undefined
  const projectId = values.mode === 'start' ? values.projectId : undefined
  const processName = values.mode === 'start' ? values.processName : undefined

  // Declared before the launch effect so the config is in place at start.
  useEffect(() => {
    if (!organizationId) return
    configureFlowX({ settings: sdkSettings, organizationId, themeId })
  }, [organizationId, themeId])

  // Set access token
  useEffect(() => {
    if (!accessToken) return
    FlowX.setAccessToken(accessToken)
  }, [accessToken])

  // Start or continue the process, depending on the launch mode.
  useEffect(() => {
    if (!hasAccessToken || !organizationId) return
    let cancelled = false

    // Close-X request. Notification only: the session stays live, so the host
    // confirms first. Closing means unmounting ProcessView, which onBack does.
    // Omitting onClose hides the close-X altogether.
    const onClose = (processName?: string) => {
      Alert.alert(
        'Close process',
        `Are you sure you want to close ${processName ?? 'this process'}?`,
        [
          // Cancel does nothing: the session is still live and simply carries on.
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Close process',
            style: 'destructive',
            onPress: () => onBackRef.current(),
          },
        ]
      )
    }
    const onProcessEnded = () => onBackRef.current()
    // Action failure hook — name only, no payload.
    const onActionError = (actionName?: string) =>
      console.warn('[FlowX] action failed:', actionName ?? '(unnamed)')

    const promise =
      isContinue && processInstanceUuid
        ? FlowX.continueProcess({
            processInstanceUuid,
            isModal: true,
            onClose,
            onProcessEnded,
            onActionError,
          })
        : FlowX.startProcess({
            workspaceId: workspaceId!,
            projectId: projectId!,
            processName: processName!,
            isModal: true,
            onClose,
            onProcessEnded,
            onActionError,
            onProcessStarted: (uuid) => onProcessStartedRef.current?.(uuid),
          })

    promise
      .then((h) => {
        if (cancelled) {
          h.dispose()
          return
        }
        setHandle(h)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to start process')
      })
    return () => {
      cancelled = true
      handleRef.current?.dispose()
      handleRef.current = null
      setHandle(null)
    }
  }, [
    hasAccessToken,
    organizationId,
    // Re-run whenever the launch target changes.
    isContinue,
    processInstanceUuid,
    workspaceId,
    projectId,
    processName,
  ])

  const ProcessView = handle?.ProcessView

  if (error) {
    return (
      <View style={styles.fallback}>
        <FlxText variant="p1">Error: {error}</FlxText>
      </View>
    )
  }

  if (!ProcessView) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ProcessView />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})

export { ProcessScreen }
