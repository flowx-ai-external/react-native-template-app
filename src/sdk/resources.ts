import { getTag } from '@flowx/core-sdk/rn'
import {
  getEnumerationItems,
  getMediaItemUrl,
  getSubstitutionTagContent,
} from '@flowx/react-native-sdk'

// CMS lookups. All but getTag are re-exported by the SDK facade package;
// getTag still comes from @flowx/core-sdk/rn.
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

/** Sync read of an already-loaded tag; undefined until the tag is loaded. */
export const lookupCachedTag = (key: string): string | undefined => getSubstitutionTagContent(key)

/** Media item URL by key, read synchronously once the process loaded its media. */
export const lookupMediaItemUrl = (key: string): string | undefined => getMediaItemUrl(key)

/** Enumeration values. `parentName` selects a child level; null or empty reads the first. */
export const lookupEnumeration = (
  name: string,
  parentName?: string | null
): Promise<EnumerationValue[]> => getEnumerationItems(name, parentName)
