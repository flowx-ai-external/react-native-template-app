import AsyncStorage from '@react-native-async-storage/async-storage'

const REFRESH_TOKEN_KEY = 'flx.refreshToken'

export const saveRefreshToken = (token: string) => AsyncStorage.setItem(REFRESH_TOKEN_KEY, token)

export const readRefreshToken = () => AsyncStorage.getItem(REFRESH_TOKEN_KEY)

export const clearRefreshToken = () => AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
