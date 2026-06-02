import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FlowX, FlxProcessHandle } from '@flowx/react-native-sdk';
import { FlxText } from '@flowx/react-native-ui-toolkit';

import { environment } from '../environment';
import { type ProcessScreenProps } from './types';

const ProcessScreen = ({
  values,
  accessToken,
  organizationId,
  onBack,
}: ProcessScreenProps) => {
  const [handle, setHandle] = useState<FlxProcessHandle | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRef = useRef<FlxProcessHandle | null>(null)
  const onBackRef = useRef(onBack)

  useEffect(() => {
    handleRef.current = handle
  }, [handle])

  useEffect(() => {
    onBackRef.current = onBack
  }, [onBack])

  const { language, locale, themeId, workspaceId, projectId, processName } = values

  // FloX SDK configuration
  useEffect(() => {
    if (!organizationId) return
    FlowX.configure({
      baseURL: environment.baseUrl,
      processApiPath: environment.processApiPath,
      language,
      locale,
      staticAssetsPath: environment.staticAssetsPath,
      themeId,
      isDraft: false,
      organizationId,
    })
  }, [language, locale, organizationId, themeId])

  // Set access token
  useEffect(() => {
    if (!accessToken) return
    FlowX.setAccessToken(accessToken)
  }, [accessToken])

  // Start or continue process
  useEffect(() => {
    if (!accessToken || !organizationId) return
    let cancelled = false

    const onClose = () => onBackRef.current()
    const onProcessEnded = () => onBackRef.current()

    const promise = FlowX.startProcess({
      workspaceId,
      projectId,
      processName,
      isModal: true,
      onClose,
      onProcessEnded,
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
    accessToken,
    workspaceId,
    projectId,
    processName,
    organizationId,
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
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center'},
})

export { ProcessScreen };
