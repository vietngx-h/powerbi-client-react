import { useState, useEffect, use } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import * as models from 'powerbi-models';
import './App.css';
import { getReportEmbedConfig, generateEmbedToken } from './callPowerBiApi.js';
import * as msal from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: 'f8d562e9-5184-48a4-b9b6-4acf92e8e597',
    authority: 'https://login.microsoftonline.com/d79e6d4d-95f7-471f-9a73-1c2e4e586fe2',
    redirectUri: window.location.origin
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

function App() {
  const [embedConfig, setEmbedConfig] = useState(null);
  const [embedToken, setEmbedToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already signed in when component mounts
    const account = msalInstance.getAllAccounts()[0];
    if (account) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Authenticate with MSAL
      await msalInstance.initialize();
      const loginResponse = await msalInstance.loginPopup({
        scopes: ['https://analysis.windows.net/powerbi/api/Report.Read.All']
      });
      
      // 2. Get access token
      const tokenResponse = await msalInstance.acquireTokenSilent({
        account: loginResponse.account,
        scopes: ['https://analysis.windows.net/powerbi/api/Report.Read.All']
      });
      
      sessionStorage.setItem('powerbi_access_token', tokenResponse.accessToken);
      setIsAuthenticated(true);
      
      // 3. Get report configuration
      const config = await getReportEmbedConfig();
      setEmbedConfig(config);
      
      // 4. Generate embed token
      const token = await generateEmbedToken();
      setEmbedToken(token);
      
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log('Embed Config:', embedConfig);
  console.log('Embed Token:', embedToken);
  useEffect(() => {
    if (isAuthenticated) {
      generateEmbedToken().then(token => {
        console.log('Generated Embed Token:', token);
        setEmbedToken(token);
      }
      ).catch(err => {
        console.error("Error generating embed token:", err);
        setError("Failed to generate embed token.");
      });
      getReportEmbedConfig().then(token => {
        console.log('Generated Embed config:', token);
        setEmbedConfig(token);
      }
      ).catch(err => {
        console.error("Error generating embed token:", err);
        setError("Failed to generate embed token.");
      });
    }
  }
  , [isAuthenticated]);
  

  return (
    <div className="App">
      <header className="App-header">
        {!isAuthenticated ? (
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="sign-in-button"
          >
            {loading ? 'Signing in...' : 'Sign in to view report'}
          </button>
        ) : (
          <>
            {embedConfig && embedToken ? (
              <PowerBIEmbed
                embedConfig={{
                  type: 'report',
                  id: embedConfig.reportId,
                  embedUrl: embedConfig.embedUrl,
                  accessToken: embedToken.token,
                  tokenType: models.TokenType.Embed,
                  settings: {
                    panes: {
                      filters: {
                        expanded: false,
                        visible: true
                      }
                    },
                    background: models.BackgroundType.Transparent,
                  }
                }}
                eventHandlers={
                  new Map([
                    ['loaded', () => console.log('Report loaded')],
                    ['rendered', () => console.log('Report rendered')],
                    ['error', (event) => console.log(event.detail)],
                  ])
                }
                cssClassName={"report-class"}
              />
            ) : (
              <p>Loading report...</p>
            )}
          </>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </header>
    </div>
  );
}

export default App;




// import React, { useState } from 'react';
// import * as msal from '@azure/msal-browser';

// const msalConfig = {
//   auth: {
//     clientId: 'f8d562e9-5184-48a4-b9b6-4acf92e8e597',
//     authority: 'https://login.microsoftonline.com/d79e6d4d-95f7-471f-9a73-1c2e4e586fe2',
//     redirectUri: window.location.origin
//   }
// };

// const msalInstance = new msal.PublicClientApplication(msalConfig);

// function App() {
//   const [apiResponse, setApiResponse] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   async function loginAndGetToken() {
//   try {
//     // Initialize MSAL first
//     await msalInstance.initialize();

//     // Then login
//     const loginResponse = await msalInstance.loginPopup({
//       scopes: ['https://analysis.windows.net/powerbi/api/Report.Read.All']
//     });

//     // Then acquire token silently
//     const tokenResponse = await msalInstance.acquireTokenSilent({
//       account: loginResponse.account,
//       scopes: ['https://analysis.windows.net/powerbi/api/Report.Read.All']
//     });

//     return tokenResponse.accessToken;
//   } catch (error) {
//     console.error("Authentication error:", error);
//     throw error;
//   }
// }


//   async function callPowerBiApi() {
//     setLoading(true);
//     setError(null);

//     try {
//       const accessToken = await loginAndGetToken();

//       const groupId = '42b9b0f0-19ab-4682-a22e-6b24179b83c9';
//       const apiUrl = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports`;

//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`API request failed: ${response.status}`);
//       }

//       const data = await response.json();
//       setApiResponse(data.value); // show only the reports
//     } catch (err) {
//       console.error("Error calling Power BI API:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
//       <h1>Power BI Reports</h1>

//       <button
//         onClick={callPowerBiApi}
//         disabled={loading}
//         style={{
//           padding: '10px 15px',
//           backgroundColor: '#0078d4',
//           color: 'white',
//           border: 'none',
//           borderRadius: '4px',
//           cursor: 'pointer',
//           fontSize: '16px'
//         }}
//       >
//         {loading ? 'Loading...' : 'Fetch Reports'}
//       </button>

//       {error && (
//         <div style={{
//           marginTop: '20px',
//           padding: '15px',
//           backgroundColor: '#f8d7da',
//           color: '#721c24',
//           border: '1px solid #f5c6cb',
//           borderRadius: '4px'
//         }}>
//           <h3>Error</h3>
//           <p>{error}</p>
//         </div>
//       )}

//       {apiResponse && (
//         <div style={{
//           marginTop: '20px',
//           padding: '15px',
//           backgroundColor: '#e7f3fe',
//           border: '1px solid #b8daff',
//           borderRadius: '4px'
//         }}>
//           <h3>Reports</h3>
//           <ul>
//             {apiResponse.map(report => (
//               <li key={report.id}>
//                 <strong>{report.name}</strong><br />
//                 <a href={report.webUrl} target="_blank" rel="noopener noreferrer">Open Report</a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
