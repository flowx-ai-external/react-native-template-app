export const environment = {
  production: false,
  baseUrl: '<BASE_URL>',
  staticAssetsPath: '<STATIC_ASSETS_PATH>',
  orgCode: '<ORG_CODE>',
  processApiPath: '/onboarding',
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
