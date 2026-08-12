import { type HttpRequestInterceptor, type HttpResponseInterceptor } from '@flowx/react-native-sdk'

// Axios interceptors for the SDK's REST calls. Not applied to SSE streams or to
// the non-axios image/icon/document/font fetches — customHeaders covers those.
// Registered per session and cleared on dispose, so changes need a new launch.
// Ordering against the SDK's own interceptors is not guaranteed: don't read or
// overwrite SDK-managed headers such as Authorization.

let requestSeq = 0
const startedAt = new Map<string, number>()

export const requestInterceptors: HttpRequestInterceptor[] = [
  {
    onFulfilled: (config) => {
      const correlationId = `rn-tpl-${++requestSeq}`
      config.headers.set('X-Correlation-Id', correlationId)
      startedAt.set(correlationId, Date.now())
      return config
    },
    onRejected: (error) => {
      console.warn('[interceptor] request failed before sending', error)
      return Promise.reject(error)
    },
  },
]

export const responseInterceptors: HttpResponseInterceptor[] = [
  {
    onFulfilled: (response) => {
      const correlationId = response.config.headers?.['X-Correlation-Id'] as string | undefined
      const began = correlationId ? startedAt.get(correlationId) : undefined
      if (correlationId) startedAt.delete(correlationId)
      const took = began ? `${Date.now() - began}ms` : 'n/a'
      console.log(
        `[interceptor] ${response.config.method?.toUpperCase()} ${response.config.url} → ` +
          `${response.status} in ${took}`
      )
      return response
    },
    // The SDK shows its own error toast; this is the host's telemetry hook.
    onRejected: (error) => {
      console.warn('[interceptor] response error', error?.response?.status ?? error?.message)
      return Promise.reject(error)
    },
  },
]
