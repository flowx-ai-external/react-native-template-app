import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react'

import { environment } from '@/environment'
import { setAuthToken } from '@/http/client'
import { clearRefreshToken, readRefreshToken, saveRefreshToken } from '@/storage/storage'

type AuthTokens = {
  accessToken: string
  refreshToken: string | null
  expiresAt: number
  organizationId: string
}

type AuthContextValue = {
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoggingIn: boolean
  isRehydrating: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type OrgLookupResponse = {
  organizationId: string
  issuer: string
  tokenEndpoint: string
  clientId: string
}

let orgLookupPromise: Promise<OrgLookupResponse> | null = null

const fetchOrgLookup = (): Promise<OrgLookupResponse> => {
  if (orgLookupPromise) return orgLookupPromise
  const url = `${environment.baseUrl}/org/api/org/code/${environment.orgCode}`
  orgLookupPromise = fetch(url, {
    headers: { 'Fx-Client-Host': 'localhost' },
  }).then(async (res) => {
    if (!res.ok) {
      orgLookupPromise = null
      throw new Error(`Org lookup failed (${res.status})`)
    }
    return (await res.json()) as OrgLookupResponse
  })
  return orgLookupPromise
}

type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in: number
}

const tokensFromResponse = (data: TokenResponse, organizationId: string): AuthTokens => ({
  accessToken: data.access_token,
  refreshToken: data.refresh_token ?? null,
  expiresAt: Date.now() + data.expires_in * 1000,
  organizationId,
})

const requestTokens = async (params: Record<string, string>): Promise<AuthTokens> => {
  const org = await fetchOrgLookup()
  const body = new URLSearchParams({ ...params, client_id: org.clientId }).toString()
  const response = await fetch(org.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Token request failed (${response.status}): ${text}`)
  }
  return tokensFromResponse(await response.json(), org.organizationId)
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isRehydrating, setIsRehydrating] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAuthToken(tokens?.accessToken ?? null)
  }, [tokens])

  useEffect(() => {
    let cancelled = false
    const rehydrate = async () => {
      try {
        const stored = await readRefreshToken()
        if (!stored || cancelled) return
        const fresh = await requestTokens({
          grant_type: 'refresh_token',
          scope: environment.keycloak.scope,
          refresh_token: stored,
        })
        if (cancelled) return
        if (fresh.refreshToken) {
          await saveRefreshToken(fresh.refreshToken)
        }
        setTokens(fresh)
      } catch (err) {
        console.warn('Token rehydration failed, clearing stored token', err)
        await clearRefreshToken().catch(() => undefined)
      } finally {
        if (!cancelled) setIsRehydrating(false)
      }
    }
    rehydrate()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!tokens?.refreshToken) return
    const delay = tokens.expiresAt - Date.now() - 60_000
    const silentRefresh = async () => {
      try {
        const fresh = await requestTokens({
          grant_type: 'refresh_token',
          scope: environment.keycloak.scope,
          refresh_token: tokens.refreshToken!,
        })
        if (fresh.refreshToken) await saveRefreshToken(fresh.refreshToken)
        setTokens(fresh)
      } catch (err) {
        console.warn('Silent refresh failed, clearing session', err)
        setTokens(null)
        await clearRefreshToken().catch(() => undefined)
      }
    }
    const timer = setTimeout(silentRefresh, Math.max(delay, 0))
    return () => clearTimeout(timer)
  }, [tokens])

  const login = useCallback(async (username: string, password: string) => {
    setIsLoggingIn(true)
    setError(null)
    try {
      const fresh = await requestTokens({
        grant_type: 'password',
        scope: environment.keycloak.scope,
        username,
        password,
      })
      if (fresh.refreshToken) {
        await saveRefreshToken(fresh.refreshToken)
      }
      setTokens(fresh)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoggingIn(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setTokens(null)
    setError(null)
    await clearRefreshToken().catch(() => undefined)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      tokens,
      isAuthenticated: !!tokens,
      isLoggingIn,
      isRehydrating,
      error,
      login,
      logout,
    }),
    [tokens, isLoggingIn, isRehydrating, error, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
