import { useState, useEffect } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import * as models from 'powerbi-models';
import './App.css';
import { getReportEmbedConfig, generateEmbedToken } from './callPowerBiApi.js';
import { useMsal } from "@azure/msal-react";

function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { instance, accounts } = useMsal();
const loginRequest = {
  scopes: ["user.read"], // Scopes bạn cần
};
  useEffect(() => {
    const acquireToken = async () => {
      if (accounts.length === 0) {
        // Chưa đăng nhập -> cần loginPopup (hoặc loginRedirect)
        try {
          await instance.loginRedirect(loginRequest);
        } catch (err) {
          console.error("Login failed", err);
          return;
        }
      }

      try {
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });
        console.log("Access Token:", response.accessToken);
        // setAccessToken(response.accessToken);
        sessionStorage.setItem('powerbi_access_token', response.accessToken);

      } catch (error) {
        console.error("Silent token acquisition failed:", error);
        // Fallback nếu cần:
        // await instance.acquireTokenPopup(loginRequest);
      }
    };

    acquireToken();
  }, [accounts, instance]);

 
  // Event handlers for the Power BI embed
  const eventHandlers = new Map([
    ['loaded', () => console.log('Report loaded')],
    ['rendered', () => console.log('Report rendered')],
    ['error', (event) => console.error('Error:', event.detail)],
    ['visualClicked', () => console.log('Visual clicked')],
    ['pageChanged', (event) => console.log('Page changed:', event)],
  ]);

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Power BI Dashboards</h1>
        
        <div className="reports-container">
          {reports.map((report) => (
            <div key={report.id} className="report-wrapper">
              <h2 className="report-title">{report.title}</h2>
              <div className="powerbi-container">
                <PowerBIEmbed
                  embedConfig={report.embedConfig}
                  eventHandlers={eventHandlers}
                  cssClassName={"powerbi-report"}
                  getEmbeddedComponent={(embeddedReport) => {
                    window[`report_${report.id}`] = embeddedReport;
                    console.log(`Report ${report.id} instance:`, embeddedReport);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </header>
    </div>
  );

  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       test123123
  //       <PowerBIEmbed
  //         embedConfig={{
  //           type: 'report',   // Supported types: report, dashboard, tile, visual, qna, paginated report and create
  //           id: "0d414cd8-0894-40a6-bd63-e768216a98ca",
  //           embedUrl: getReportEmbedConfig.embedUrl,
  //           accessToken: generateEmbedToken.token,
  //           tokenType: models.TokenType.Embed, // Use models.TokenType.Aad for SaaS embed
  //           settings: {
  //             panes: {
  //               filters: {
  //                 expanded: false,
  //                 visible: true
  //               }
  //             },
  //             background: models.BackgroundType.Transparent,
  //           }
  //         }}

  //         eventHandlers={
  //           new Map([
  //             ['loaded', function () { console.log('Report loaded'); }],
  //             ['rendered', function () { console.log('Report rendered'); }],
  //             ['error', function (event) { console.log(event.detail); }],
  //             ['visualClicked', () => console.log('visual clicked')],
  //             ['pageChanged', (event) => console.log(event)],
  //           ])
  //         }

  //         cssClassName={"reportClass"}

  //         getEmbeddedComponent={(embeddedReport) => {
  //           window.report = embeddedReport;
  //         }}
  //       />
  //     </header>
  //   </div>
  // );
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
