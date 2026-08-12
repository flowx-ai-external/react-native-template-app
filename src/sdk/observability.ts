import {
  ANALYTICS_EVENTS,
  FlowX,
  createFormattedLogger,
  type AnalyticsData,
} from '@flowx/react-native-sdk'

// The facade-level hooks. All are session-independent — registration survives
// dispose() and process restarts — so they are wired once at app boot, with
// every collector on and the whole log stream subscribed. Every event they
// carry is dumped to the console.

// Pretty console output with per-category badges.
const consoleLogger = createFormattedLogger({ theme: 'dark' })

export type ObservabilityHandlers = {
  // The backend swapped the session to a new process instance.
  onNewProcess?: (processInstanceUuid: string) => void
}

/** Subscribe every collector; returns a teardown. */
export const registerObservability = ({
  onNewProcess,
}: ObservabilityHandlers = {}): (() => void) => {
  const teardowns: (() => void)[] = []

  // Fires for executed actions that define `analytics` in their params.
  teardowns.push(
    FlowX.analyticsCollector((data: AnalyticsData) => {
      const scope = data.type === ANALYTICS_EVENTS.SCREEN ? 'Screen' : 'Action'
      console.log(`[analytics] ${scope}`, data)
    })
  )

  // REST, SSE, expression and CMS font events — no `categories`, so the whole
  // stream. Header secrets are redacted before a sink sees them. Events map to
  // wire requests, so cache hits emit nothing and native raster <Image> loads
  // are not covered.
  teardowns.push(FlowX.logSink(consoleLogger))

  // The backend swapped the session to a new process. Notification only — the
  // SDK swaps it inside the mounted ProcessView. Single listener.
  FlowX.newProcessStarted = (processInstanceUuid: string) => {
    console.log('[newProcessStarted]', processInstanceUuid)
    onNewProcess?.(processInstanceUuid)
  }
  teardowns.push(() => {
    FlowX.newProcessStarted = undefined
  })

  return () => teardowns.forEach((teardown) => teardown())
}
