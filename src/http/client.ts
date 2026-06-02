import axios, { AxiosRequestConfig } from 'axios'

import { environment } from '@/environment'

let currentAccessToken: string | null = null

export const setAuthToken = (token: string | null) => {
  currentAccessToken = token
}

export const api = axios.create({
  baseURL: environment.baseUrl,
})

api.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`
  }
  return config
})

export const apiGet = async <T>(
  url: string,
  options: { workspaceId?: string; signal?: AbortSignal } = {}
): Promise<T> => {
  const config: AxiosRequestConfig = {
    signal: options.signal,
    headers: options.workspaceId ? { 'Fx-Workspace-Id': options.workspaceId } : undefined,
  }
  const response = await api.get<T>(url, config)
  return response.data
}
