# FlowX React Native Starter

Starter Expo (SDK 56) container on React native version 0.85.3 for hosting a FlowX process on iOS and
Android. Provides:

- A `LoginModal` component that displays a username/password form and calls `AuthContext.login`.
- Refresh-token persistence in AsyncStorage with silent refresh.
- A `ProcessScreen` component that runs a FlowX process via
  `@flowx/react-native-sdk` (`FlowX.startProcess`).

## Prerequisites

- Node.js 24+
- Xcode (iOS) and/or Android Studio
- FlowX npm registry credentials

## Setup

### 1. Configure `.npmrc`

Create a `.npmrc` file with the values provided by FlowX:

```
# Public npm registry
registry=https://registry.npmjs.org/

# Private FlowX npm registry
@flowx:registry=https://<AUTH_REPO>
//<AUTH_REPO>:_auth="<AUTH_TOKEN>"
//<AUTH_REPO>:email=<AUTH_EMAIL>
strict-ssl=true
```

or if you are using just a private registry:

```
//<AUTH_REPO>:_auth="<AUTH_TOKEN>"
//<AUTH_REPO>:email=<AUTH_EMAIL>
registry=https://<AUTH_REPO>
strict-ssl=true
```

### 2. Configure FlowX SDK versions

In `package.json`, replace `<SDK_VERSION>` with the FlowX SDK version you want to use.
All `@flowx/*` packages must use the same version:

```json
"@flowx/core-sdk": "<SDK_VERSION>",
"@flowx/core-theme": "<SDK_VERSION>",
"@flowx/react-native-sdk": "<SDK_VERSION>",
"@flowx/react-native-theme": "<SDK_VERSION>",
"@flowx/react-native-ui-toolkit": "<SDK_VERSION>"
```

### 3. Configure environment

Update `src/environment.ts` with your FlowX deployment details:

```ts
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

```

The login flow does an org lookup against
`${baseUrl}/org/api/org/code/${orgCode}` to discover Keycloak's
`tokenEndpoint`, then runs the `password` grant.

### 4. Configure the process to boot

Update the `appConfig` constant in `src/app/config.ts` with your FlowX process details:

```ts
export const appConfig = {
  processName: '<PROCESS_NAME>',
  organizationId: '<ORGANIZATION_ID>',
  projectId: '<PROJECT_ID>',
  themeId: '<THEME_ID>',
  workspaceId: '<WORKSPACE_ID>',
  language: '<LANGUAGE>',
  locale: '<LOCALE>',
} as const
```

## Running

```
npm install
npm run ios       # or: npm run android
```

If Metro complains about Expo dep versions:

```
npx expo install --fix
```

If a `react-native-worklets/plugin` babel error appears, ensure both
`react-native-reanimated` and `react-native-worklets` are installed
(they are required by the FlowX RN SDK and `babel-preset-expo`).

## Project Structure

```
src/
├── app/
│   ├── config.ts            # FlowX process, workspace, theme, language, and locale config
│   ├── index.tsx            # App providers + authenticated main screen with start/logout actions
│   └── ProcessScreen.tsx    # Calls FlowX.startProcess and renders the returned ProcessView
├── auth/
│   ├── AuthContext.tsx      # Org lookup + password grant + refresh-token rehydration + silent refresh
│   └── LoginModal.tsx       # FlxModal with username/password, calls AuthContext.login
├── environment.ts           # FlowX endpoints + Keycloak config
├── hooks/
│   └── useLanguage.tsx      # AsyncStorage-persisted language (en-US / ro-RO)
├── http/client.ts           # axios with bearer interceptor
└── storage/storage.ts       # AsyncStorage refresh-token helpers
```

## Auth Flow

1. App boots → `AuthProvider` reads stored `flx.refreshToken` from
   AsyncStorage and tries a silent `refresh_token` grant. If it works,
   you're already signed in.
2. Otherwise `LoginModal` is shown. Submitting calls
   `requestTokens({ grant_type: 'password', username, password })`.
3. On success the access token is fed into the axios interceptor and
   `FlowX.setAccessToken`; the refresh token is persisted.
4. A `setTimeout` schedules a silent refresh ~60s before expiry.
5. Logout clears tokens and the stored refresh token.


## Documentation

- [FlowX React Native Renderer](https://docs.flowx.ai/5.9/sdks/react-native-renderer)
- [Expo Router](https://docs.expo.dev/router/introduction/)
