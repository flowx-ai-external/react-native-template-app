import {
  getEnumeration,
  getMediaItemURL,
  getStaticAsset,
  getSubstitutionTag,
  getTag,
} from '@flowx/core-sdk/rn'

// CMS lookups, exported by @flowx/core-sdk/rn rather than the SDK facade.
//
// All of them read the session config the SDK populates at startProcess /
// continueProcess (api url, workspace, project, build, language), so they only
// resolve while a session is live — after dispose() they come back empty. A
// custom component inside the running process is their natural home; see
// src/components/ClientDetailsForm.tsx for how one is registered.

export type EnumerationValue = {
  id: string
  value: string
  label: string
  enabled?: boolean
  order: number | string
}

/** Substitution tag for the session language. Accepts a bare or `@@`-prefixed key. */
export const lookupTag = (tag: string): Promise<string | undefined> => getTag(tag)

/** Sync read of an already-loaded tag; returns the code back if not loaded. */
export const lookupCachedTag = (code: string): string => getSubstitutionTag(code)

/** Media item URL. Accepts the bare key or the app-uuid-prefixed store key. */
export const lookupMediaItemURL = (mediaItemId: string): Promise<string | undefined> =>
  getMediaItemURL(mediaItemId)

/** Static asset URL, read synchronously from the resources store. */
export const lookupStaticAsset = (key: string): string | undefined => getStaticAsset(key)

/** Enumeration values. `parentName` selects a child level in a hierarchy. */
export const lookupEnumeration = (name: string, parentName?: string): Promise<EnumerationValue[]> =>
  getEnumeration(name, parentName)
