import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'

import {
  FlxButton,
  FlxFieldContainer,
  FlxInput,
  FlxInputField,
  FlxLabel,
  FlxModal,
  FlxText,
} from '@flowx/react-native-ui-toolkit'

import { environment } from '@/environment'
import { useAuth } from './AuthContext'

type LoginModalProps = {
  visible: boolean
}

export const LoginModal = ({ visible }: LoginModalProps) => {
  const { login, isLoggingIn, error } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async () => {
    try {
      await login(username, password)
    } catch {
      // surfaced via context
    }
  }

  const canSubmit = username.length > 0 && password.length > 0 && !isLoggingIn

  return (
    <FlxModal
      open={visible}
      onClose={() => undefined}
      dismissible={false}
      title="Sign in"
      subtitle={`Organization: ${environment.orgCode}`}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.fields}>
        <FlxFieldContainer>
          <FlxLabel text="Username" disabled={isLoggingIn} />
          <FlxInput disabled={isLoggingIn} filled={!!username}>
            <FlxInputField
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
            />
          </FlxInput>
        </FlxFieldContainer>
        <FlxFieldContainer>
          <FlxLabel text="Password" disabled={isLoggingIn} />
          <FlxInput disabled={isLoggingIn} filled={!!password}>
            <FlxInputField
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />
          </FlxInput>
        </FlxFieldContainer>
        {error ? (
          <FlxText variant="caption" color="#c00">
            {error}
          </FlxText>
        ) : null}
        <FlxButton disabled={!canSubmit} onPress={onSubmit}>
          {isLoggingIn ? 'Signing in…' : 'Sign in'}
        </FlxButton>
      </View>
      </KeyboardAvoidingView>
    </FlxModal>
  )
}

const styles = StyleSheet.create({
  fields: { gap: 12 },
})
