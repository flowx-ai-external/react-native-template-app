export const environment = {
  production: false,
  baseUrl: '<BASE_URL>',
  assetsBaseUrl: '<ASSETS_BASE_URL>',
  orgCode: '<ORG_CODE>',
  enginePath: '/onboarding',
  scanTimeout: 50000,
  keycloak: {
    issuer: '<KEYCLOAK_URL>',
    defaultOrganizationName: '<DEFAULT_ORGANIZATION_NAME>',
    clientId: '<KEYCLOAK_CLIENT>',
    responseType: 'code',
    scope: 'openid profile email',
    requireHttps: true,
    disableAtHashCheck: false,
    showDebugInformation: false,
  },
}
