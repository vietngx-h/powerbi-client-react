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
