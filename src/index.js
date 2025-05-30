import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

const msalConfig = {
  auth: {
    clientId: "f8d562e9-5184-48a4-b9b6-4acf92e8e597",
    authority: "https://login.microsoftonline.com/d79e6d4d-95f7-471f-9a73-1c2e4e586fe2",
    redirectUri: "http://localhost", // hoặc URL production của bạn
  },
  cache: {
    cacheLocation: "sessionStorage", // hoặc localStorage
    storeAuthStateInCookie: false,   // set true nếu gặp vấn đề với IE
  },
};

const msalInstance = new PublicClientApplication(msalConfig);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
<MsalProvider instance={msalInstance}>
<App />
</MsalProvider>
    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();



// const msalConfig = {
//     auth: {
//         clientId: "f8d562e9-5184-48a4-b9b6-4acf92e8e597",
//         authority: "https://login.microsoftonline.com/d79e6d4d-95f7-471f-9a73-1c2e4e586fe2",
//         knownAuthorities: [],
//         cloudDiscoveryMetadata: "",
//         // redirectUri: "enter_redirect_uri_here",
//         // postLogoutRedirectUri: "enter_postlogout_uri_here",
//         navigateToLoginRequestUrl: true,
//         clientCapabilities: ["CP1"],
//         protocolMode: "AAD"
//     },
//     cache: {
//         cacheLocation: "sessionStorage",
//         temporaryCacheLocation: "sessionStorage",
//         storeAuthStateInCookie: false,
//         secureCookies: false,
//         claimsBasedCachingEnabled: true,
//     },
//     system: {
//         loggerOptions: {
//             loggerCallback: (
//                 level: LogLevel,
//                 message: string,
//                 containsPii: boolean
//             ): void => {
//                 if (containsPii) {
//                     return;
//                 }
//                 switch (level) {
//                     case LogLevel.Error:
//                         console.error(message);
//                         return;
//                     case LogLevel.Info:
//                         console.info(message);
//                         return;
//                     case LogLevel.Verbose:
//                         console.debug(message);
//                         return;
//                     case LogLevel.Warning:
//                         console.warn(message);
//                         return;
//                 }
//             },
//             piiLoggingEnabled: false,
//         },
//         windowHashTimeout: 60000,
//         iframeHashTimeout: 6000,
//         loadFrameTimeout: 0,
//         asyncPopups: false,
//     },
//     telemetry: {
//         application: {
//             appName: "My Application",
//             appVersion: "1.0.0",
//         },
//     },
// };

// const msalInstance = new PublicClientApplication(msalConfig);
