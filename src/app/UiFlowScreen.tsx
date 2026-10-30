import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native'

import { FlowX, FlxUiFlowHandle } from '@flowx/react-native-sdk'
import { FlxText } from '@flowx/react-native-ui-toolkit'

import { configureFlowX } from '@/sdk/flowx'
import { sdkSettings } from './config'
import { type UiFlowScreenProps } from './types'

const UiFlowScreen = ({
  values,
  accessToken,
  organizationId,
  onBack,
  onSession,
}: UiFlowScreenProps) => {
  // Gate on availability, not value: a refresh must not tear down a live flow.
  const hasAccessToken = !!accessToken

  const [handle, setHandle] = useState<FlxUiFlowHandle | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRef = useRef<FlxUiFlowHandle | null>(null)
  const onBackRef = useRef(onBack)
  const onSessionRef = useRef(onSession)

  useEffect(() => {
    handleRef.current = handle
  }, [handle])

  useEffect(() => {
    onBackRef.current = onBack
  }, [onBack])

  useEffect(() => {
    onSessionRef.current = onSession
  }, [onSession])

  const { themeId, workspaceId, projectId, uiFlowName } = values

  // Before the launch effect, so config is in place at start.
  useEffect(() => {
    if (!organizationId) return
    configureFlowX({ settings: sdkSettings, organizationId, themeId })
  }, [organizationId, themeId])

  // Set access token
  useEffect(() => {
    if (!accessToken) return
    FlowX.setAccessToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (!hasAccessToken || !organizationId) return
    let cancelled = false

    // Notification only — the session stays live, so confirm first. Omitting
    // onDismissRequested hides the close-X; with no "ended" callback it and
    // unmount are the only exits.
    const onDismissRequested = (name?: string) => {
      Alert.alert('Close UI flow', `Are you sure you want to close ${name ?? 'this UI flow'}?`, [
        // Live session simply carries on.
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close UI flow',
          style: 'destructive',
          onPress: () => onBackRef.current(),
        },
      ])
    }

    FlowX.startUiFlow({
      workspaceId,
      projectId,
      uiFlowName,
      isModal: true,
      onDismissRequested,
    })
      .then((h) => {
        if (cancelled) {
          h.dispose()
          return
        }
        setHandle(h)
        onSessionRef.current?.(h)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to start UI flow')
      })

    return () => {
      cancelled = true
      handleRef.current?.dispose()
      handleRef.current = null
      setHandle(null)
      onSessionRef.current?.(null)
    }
  }, [
    hasAccessToken,
    organizationId,
    // Re-run on target change.
    workspaceId,
    projectId,
    uiFlowName,
  ])

  const UiFlowView = handle?.UiFlowView

  if (error) {
    return (
      <View style={styles.fallback}>
        <FlxText variant="p1">Error: {error}</FlxText>
      </View>
    )
  }

  if (!UiFlowView) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <UiFlowView />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})

export { UiFlowScreen }
