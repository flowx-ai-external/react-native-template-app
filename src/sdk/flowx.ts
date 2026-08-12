import { FlowX } from '@flowx/react-native-sdk'

import { type SdkSettings } from '@/app/types'
import { ClientDetailsForm } from '@/components/ClientDetailsForm'
import { environment } from '@/environment'
import { customValidators } from '@/validators/customValidators'
import { buildCustomHeaders } from './customHeaders'
import { requestInterceptors, responseInterceptors } from './interceptors'
import { customLoader } from './loaders'

// Self-managed custom components, keyed by componentIdentifier.
const components = {
  ClientDetailsForm,
}

type ConfigureArgs = {
  settings: SdkSettings
  organizationId: string
  themeId: string
}

/**
 * The single FlowX.configure() call site. The first call needs the full config;
 * later calls may pass only what changed and are merged over it.
 *
 * Applied at once: cacheDocuments, customHeaders.
 * Applied to a live session too: updateStateEnabled.
 * Next launch only: language, locale, customLoader, interceptors, components,
 * validators.
 */
export const configureFlowX = ({ settings, organizationId, themeId }: ConfigureArgs) => {
  FlowX.configure({
    baseURL: environment.baseUrl,
    processApiPath: environment.processApiPath,
    staticAssetsPath: environment.staticAssetsPath,
    organizationId,
    themeId,
    isDraft: false,

    // In-memory in the SDK, so the host persists and re-applies them. Changing
    // them re-fetches language-scoped resources on the next launch.
    language: settings.language,
    locale: settings.locale,

    // Caches document files by URL; the index is persisted, the files are
    // OS-cache temp files. Default true.
    cacheDocuments: settings.cacheDocuments,

    // Re-fetch process status and rebuild the tree on foreground return.
    // false keeps SSE reconnect but skips the catch-up. Default true.
    updateStateEnabled: settings.updateStateEnabled,

    customHeaders: buildCustomHeaders(settings.customHeadersEnabled),

    requestInterceptors: settings.interceptorsEnabled ? requestInterceptors : [],
    responseInterceptors: settings.interceptorsEnabled ? responseInterceptors : [],

    // Omit to keep the SDK's own loaders.
    customLoader: settings.customLoaderEnabled ? customLoader : undefined,

    components,
    validators: customValidators,
  })
}
