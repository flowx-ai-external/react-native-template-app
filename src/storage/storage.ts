import AsyncStorage from '@react-native-async-storage/async-storage'

const REFRESH_TOKEN_KEY = 'flx.refreshToken'
const LAST_PROCESS_INSTANCE_KEY = 'flx.lastProcessInstanceUuid'

export const saveRefreshToken = (token: string) => AsyncStorage.setItem(REFRESH_TOKEN_KEY, token)

export const readRefreshToken = () => AsyncStorage.getItem(REFRESH_TOKEN_KEY)

export const clearRefreshToken = () => AsyncStorage.removeItem(REFRESH_TOKEN_KEY)

// Last started process instance UUID — persisted so the dashboard can offer a
// "Continue process" action across app restarts (feeds FlowX.continueProcess).
export const saveLastProcessInstanceUuid = (uuid: string) =>
  AsyncStorage.setItem(LAST_PROCESS_INSTANCE_KEY, uuid)

export const readLastProcessInstanceUuid = () => AsyncStorage.getItem(LAST_PROCESS_INSTANCE_KEY)

export const clearLastProcessInstanceUuid = () => AsyncStorage.removeItem(LAST_PROCESS_INSTANCE_KEY)
