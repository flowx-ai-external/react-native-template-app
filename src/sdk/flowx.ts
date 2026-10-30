import { FlowX } from '@flowx/react-native-sdk'

import { type SdkSettings } from '@/app/types'
import { ClientDetailsForm } from '@/components/ClientDetailsForm'
import { environment } from '@/environment'
import { customValidators } from '@/validators/customValidators'
import { buildAdditionalHttpHeaders } from './additionalHttpHeaders'
import { requestInterceptors, responseInterceptors } from './interceptors'
import { customLoaderProvider } from './loaders'
import { customStepperHeaderProvider } from './stepperHeader'

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
 * Applied at once: cacheDocuments, additionalHttpHeaders.
 * Applied to a live session too: setUpdateStateEnabled.
 * Next launch only: changeLocaleSettings, customLoaderProvider,
 * customStepperHeaderProvider, interceptors, components, validators.
 */
export const configureFlowX = ({ settings, organizationId, themeId }: ConfigureArgs) => {
  FlowX.configure({
    baseUrl: environment.baseUrl,
    enginePath: environment.enginePath,
    assetsBaseUrl: environment.assetsBaseUrl,
    organizationId,
    themeId,
    isDraft: false,

    // Caches document files by URL; the index is persisted, the files are
    // OS-cache temp files. Default true.
    cacheDocuments: settings.cacheDocuments,

    additionalHttpHeaders: buildAdditionalHttpHeaders(settings.additionalHttpHeadersEnabled),

    requestInterceptors: settings.interceptorsEnabled ? requestInterceptors : [],
    responseInterceptors: settings.interceptorsEnabled ? responseInterceptors : [],

    // Omit to keep the SDK's own loaders.
    customLoaderProvider: settings.customLoaderProviderEnabled ? customLoaderProvider : undefined,

    // Replaces the default stepper band whole. Omit to keep the SDK's own.
    customStepperHeaderProvider: settings.customStepperHeaderProviderEnabled
      ? customStepperHeaderProvider
      : undefined,

    components,
    validators: customValidators,
  })

  // In-memory in the SDK, so the host persists and re-applies them. Changing
  // them re-fetches language-scoped resources on the next launch.
  FlowX.changeLocaleSettings(settings.locale, settings.language)

  // Re-fetch process status and rebuild the tree on foreground return.
  // false keeps SSE reconnect but skips the catch-up. Default true.
  FlowX.setUpdateStateEnabled(settings.updateStateEnabled)
}
