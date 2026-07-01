import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { type FlxCustomComponentProps } from '@flowx/react-native-sdk'
import {
  FlxButton,
  FlxDatePicker,
  FlxFieldContainer,
  FlxInput,
  FlxInputField,
  FlxLabel,
  FlxText,
} from '@flowx/react-native-ui-toolkit'

// Self-managed custom component: a client details form seeded from `input.data`
// that submits its params via the `saveData` action on `input.actionsFn`.

type ClientDetails = {
  firstName: string
  lastName: string
  dateOfBirth: string // yyyy-mm-dd
}

const EMPTY: ClientDetails = { firstName: '', lastName: '', dateOfBirth: '' }

// yyyy-mm-dd, local time (avoids toISOString()'s UTC shift).
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const parseIsoDate = (iso: string): Date | undefined => {
  const [y, m, day] = iso.split('-').map(Number)
  return y && m && day ? new Date(y, m - 1, day) : undefined
}

export const ClientDetailsForm = ({ input }: FlxCustomComponentProps) => {
  const [values, setValues] = useState<ClientDetails>(EMPTY)

  // Seed from initial data; `input.data` starts null, so re-seed on change.
  useEffect(() => {
    const data = (input?.data ?? {}) as Partial<ClientDetails>
    setValues({
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      dateOfBirth: data.dateOfBirth ?? '',
    })
  }, [input?.data])

  const setField = useCallback(
    <K extends keyof ClientDetails>(key: K, value: ClientDetails[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    []
  )

  const submit = useCallback(() => {
    input?.actionsFn?.saveData?.({ ...values })
  }, [input, values])

  return (
    <View style={styles.form}>
      <FlxText variant="h3">Client details</FlxText>

      <FlxFieldContainer>
        <FlxLabel text="First name" />
        <FlxInput filled={values.firstName.length > 0}>
          <FlxInputField
            value={values.firstName}
            onChangeText={(text) => setField('firstName', text)}
            placeholder="Jane"
            autoCapitalize="words"
          />
        </FlxInput>
      </FlxFieldContainer>

      <FlxFieldContainer>
        <FlxLabel text="Last name" />
        <FlxInput filled={values.lastName.length > 0}>
          <FlxInputField
            value={values.lastName}
            onChangeText={(text) => setField('lastName', text)}
            placeholder="Doe"
            autoCapitalize="words"
          />
        </FlxInput>
      </FlxFieldContainer>

      <FlxFieldContainer>
        <FlxLabel text="Date of birth" />
        <FlxDatePicker
          value={parseIsoDate(values.dateOfBirth)}
          maxDate={new Date()}
          placeholder="Select date of birth..."
          onChange={(date) => setField('dateOfBirth', date ? toIsoDate(date) : '')}
        />
      </FlxFieldContainer>

      <FlxButton onPress={submit}>Submit client details</FlxButton>
    </View>
  )
}

const styles = StyleSheet.create({
  form: { width: '100%', gap: 12, padding: 16 },
})
