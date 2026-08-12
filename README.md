# React Native Template Application (Expo)

This application is a template Expo app integrating the FlowX React Native Renderer for running processes and Keycloak for managing the user session.
The project contains sample implementations of custom components and custom validators, and covers both starting and continuing a process.

## Project Setup Guide

This document outlines the necessary steps to configure the project to connect to your FLOWX.AI environment.

### Prerequisites

Ensure you have the following:
- Node.js 24 or newer
- Xcode (for iOS) and/or Android Studio (for Android)
- FlowX npm registry credentials (auth token and email)
- Organization ID
- Environment-specific URLs (Base URL, Static Assets Path, Authentication URL)
- Organization code and Keycloak Client ID
- The UUID of the theme to be applied
- Workspace, Project and Process identifiers for starting a process

### Configuration Steps

The key configuration areas are detailed below:

1. **FlowX npm Registry Access**

   To enable npm to download the FLOWX.AI SDK, you must configure your registry credentials.

   - **File**: `.npmrc` (in the root project directory; create it if it does not exist)
   - **Action**: Add the following entry containing your credentials received from FlowX.

    ```
    registry=https://registry.npmjs.org/

    @flowx:registry=https://<AUTH_REPO>
    //<AUTH_REPO>:_auth="<AUTH_TOKEN>"
    //<AUTH_REPO>:email=<AUTH_EMAIL>
    strict-ssl=true
    ```

2. **FLOWX.AI SDK Version**

   Specify the version of the FLOWX.AI React Native libraries. All `@flowx/*` packages must use the same version.

   - **File**: `package.json`
   - **Action**: Replace `<SDK_VERSION>` with the version you want to use. Note: use a FLOWX platform compatible version of the SDK.

    ```json
    "@flowx/core-sdk": "<SDK_VERSION>",
    "@flowx/core-theme": "<SDK_VERSION>",
    "@flowx/react-native-sdk": "<SDK_VERSION>",
    "@flowx/react-native-theme": "<SDK_VERSION>",
    "@flowx/react-native-ui-toolkit": "<SDK_VERSION>"
    ```

3. **Environment configuration**

   Define the connection parameters for your specific FLOWX.AI environment.

   - **File**: `src/environment.ts`
   - **Action**: Fill in the values provided by FlowX.

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

   The login flow looks the organization up at `${baseUrl}/org/api/org/code/${orgCode}` to discover Keycloak's `tokenEndpoint`, then runs the `password` grant.

4. **SDK and process configuration**

   Specify the organization id, workspace, project, process name and theme to be used.

   - **File**: `src/app/config.ts`
   - **Action**: Set the appropriate values for the `appConfig` constant.

    ```ts
    export const appConfig = {
      processName: '<PROCESS_NAME>',
      projectId: '<PROJECT_ID>',
      themeId: '<THEME_ID>',
      workspaceId: '<WORKSPACE_ID>',
      organizationId: '<ORGANIZATION_ID>',
      language: '<LANGUAGE>',
      locale: '<LOCALE>',
    } as const
    ```

   The same file holds `sdkSettings`, the switchboard for the runtime-tunable SDK features (document caching, foreground refresh, custom headers, interceptors, custom loaders). These are consumed in `src/sdk/flowx.ts`, the single `FlowX.configure()` call site.

## Running the app

```
npm install
npm run ios       # or: npm run android
```

If Metro complains about Expo dependency versions, run `npx expo install --fix`.

If a `react-native-worklets/plugin` babel error appears, ensure both `react-native-reanimated` and `react-native-worklets` are installed — they are required by the FlowX RN SDK and `babel-preset-expo`.

## Documentation

- [FlowX React Native Renderer](https://docs.flowx.ai/5.9/sdks/react-native-renderer)
- [Expo Router](https://docs.expo.dev/router/introduction/)

## License

Copyright FlowX.ai 2026
