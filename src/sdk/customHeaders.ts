import Constants from 'expo-constants'
import { Platform } from 'react-native'

// Headers sent on FlowX backend requests: REST calls, SSE streams and document
// downloads. Not on image/icon fetches, font downloads or external URLs.
// Applied before SDK-managed headers, so Authorization & co. win a name clash.
// Live-updatable: REST reads them per request, SSE on later connections.

const appName = Constants.expoConfig?.name ?? 'react-native-template-app'
const appVersion = Constants.expoConfig?.version ?? '0.0.0'

export const userAgent =
  `${appName}/${appVersion} ` + `(${Platform.OS} ${String(Platform.Version)}; FlowX-RN-SDK)`

export const buildCustomHeaders = (enabled: boolean): Record<string, string> =>
  enabled
    ? {
        'User-Agent': userAgent,
        'X-Flowx-Client': 'react-native-template-app',
        'X-Flowx-Client-Platform': Platform.OS,
      }
    : {}
