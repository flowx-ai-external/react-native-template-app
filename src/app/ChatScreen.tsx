import { useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FlxChatRenderer } from '@flowx/react-native-sdk'
import { FlxText } from '@flowx/react-native-ui-toolkit'

import { environment } from '@/environment'
import { chatConfig, chatSettings, sdkSettings } from './config'
import { type ChatScreenProps } from './types'

/**
 * Unlike a process or a UI flow, the chat is a plain component: there is no
 * handle to await and dispose, and nothing to configure through
 * FlowX.configure() — every input arrives as a prop, including the token. A
 * silent refresh therefore needs no setAccessToken call: the new value simply
 * re-renders in.
 */
const ChatScreen = ({ values, accessToken, organizationId, onBack }: ChatScreenProps) => {
  const { themeId, workspaceId, projectId, workflowId } = values

  // The agentic workflow behind the conversation. Built here rather than in
  // config.ts so `type` stays the literal the prop expects.
  const source = useMemo(() => ({ type: 'WORKFLOW' as const, id: workflowId }), [workflowId])

  return (
    // The chat fills its parent and owns its safe area; the app shell already
    // covers bottom/left/right, so only the top inset is added here.
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* The chat header carries new-chat and history, but never an exit: with
          no onClose counterpart, the host owns the way back. */}
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button">
          <FlxText variant="p1">‹ Back</FlxText>
        </Pressable>
      </View>

      <FlxChatRenderer
        apiUrl={environment.baseUrl}
        authToken={accessToken}
        staticAssetsPath={environment.staticAssetsPath}
        // Shared with the renderer settings, so one edit moves both surfaces.
        language={sdkSettings.language}
        locale={sdkSettings.locale}
        themeId={themeId}
        // Fonts resolve under /cms/api/organizations/{organizationId}/fonts.
        organizationId={organizationId}
        projectId={projectId}
        workspaceId={workspaceId}
        source={source}
        chatConfig={chatConfig}
        cache={chatSettings.cache}
        // No recorder engine is installed here, so the mic is not drawn either
        // way; see the chat section of the README before turning it on.
        voiceInputEnabled={chatSettings.voiceInputEnabled}
        testID="chat-screen"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingVertical: 8 },
})

export { ChatScreen }
