import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FlowX, FlxProcessHandle } from '@flowx/react-native-sdk';
import { FlxText } from '@flowx/react-native-ui-toolkit';

import { ClientDetailsForm } from '@/components/ClientDetailsForm';
import { customValidators } from '@/validators/customValidators';
import { environment } from '../environment';
import { type ProcessScreenProps } from './types';

// Self-managed custom components, keyed by componentIdentifier.
const customComponents = {
  ClientDetailsForm,
};

const ProcessScreen = ({
  values,
  accessToken,
  organizationId,
  onBack,
  onProcessStarted,
}: ProcessScreenProps) => {
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

  const { language, locale, themeId } = values

  // Narrowed launch primitives — used directly below so the effect deps stay simple.
  const isContinue = values.mode === 'continue'
  const processInstanceUuid = values.mode === 'continue' ? values.processInstanceUuid : undefined
  const workspaceId = values.mode === 'start' ? values.workspaceId : undefined
  const projectId = values.mode === 'start' ? values.projectId : undefined
  const processName = values.mode === 'start' ? values.processName : undefined

  // FlowX SDK configuration. Custom components and validators are registered
  // here; the SDK reads them when the process view mounts.
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
      components: customComponents,
      validators: customValidators,
    })
  }, [language, locale, organizationId, themeId])

  // Set access token
  useEffect(() => {
    if (!accessToken) return
    FlowX.setAccessToken(accessToken)
  }, [accessToken])

  // Start or continue the process, depending on the launch mode.
  useEffect(() => {
    if (!accessToken || !organizationId) return
    let cancelled = false

    const onClose = () => onBackRef.current()
    const onProcessEnded = () => onBackRef.current()

    const promise =
      isContinue && processInstanceUuid
        ? FlowX.continueProcess({
            processInstanceUuid,
            isModal: true,
            onClose,
            onProcessEnded,
          })
        : FlowX.startProcess({
            workspaceId: workspaceId!,
            projectId: projectId!,
            processName: processName!,
            isModal: true,
            onClose,
            onProcessEnded,
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
    accessToken,
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
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center'},
})

export { ProcessScreen };
