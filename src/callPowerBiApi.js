// callPowerBiApi.js
// Configuration for your Power BI embedding
const powerBiConfig = {
  // These should ideally come from environment variables
  apiUrl: 'https://api.powerbi.com/v1.0/myorg',
  groupId: 'f089354e-8366-4e18-aea3-4cb4a3a50b48', // Your workspace ID
  clientId: 'f8d562e9-5184-48a4-b9b6-4acf92e8e597', // Your Azure AD app ID
  authority: 'https://login.microsoftonline.com/d79e6d4d-95f7-471f-9a73-1c2e4e586fe2' // Your tenant ID
};


// Get report embed URL and token
export const getReportEmbedConfig = async (reportId) => {
  try {
    // First get the access token
    const accessToken = sessionStorage.getItem('powerbi_access_token');
    console.log(accessToken)
    // Get report details to obtain the embedUrl
    const reportResponse = await fetch(
      `${powerBiConfig.apiUrl}/groups/${powerBiConfig.groupId}/reports/${reportId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!reportResponse.ok) {
      throw new Error(`Failed to get report details: ${reportResponse.status}`);
    }

    const reportData = await reportResponse.json();
    
    // Generate embed token
    // const tokenResponse = await fetch(
    //   `${powerBiConfig.apiUrl}/groups/${powerBiConfig.groupId}/reports/${reportId}/GenerateToken`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${accessToken}`,
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //       accessLevel: 'View',
    //       allowSaveAs: false
    //     })
    //   }
    // );

    // if (!tokenResponse.ok) {
    //   throw new Error(`Failed to generate embed token: ${tokenResponse.status}`);
    // }

    // const tokenData = await tokenResponse.json();
    
    return {
      reportId: reportData.value.id,
      reportName: reportData.value.name,
      embedUrl: reportData.value.embedUrl,
      // accessToken: tokenData.value.token,
      // expiration: tokenData.value.expiration, // You can use this for token refresh
      datasetId: reportData.value.datasetId // Useful for report interactions
    };
  } catch (error) {
    console.error('Error getting report embed config:', error);
    throw error;
  }
};


export const generateEmbedToken = async () => {
  try {
    const accessToken = sessionStorage.getItem('powerbi_access_token')

    const payload = {
      datasets: [
        {
          id: getReportEmbedConfig.datasetId
        }
      ],
      reports: [
        {
          allowEdit: true,
          id: getReportEmbedConfig.reportId
        }
      ]
    };

    const response = await fetch(`${powerBiConfig.apiUrl}/GenerateToken`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Token generation failed: ${response.status}`);
    }

    const tokenData = await response.json();
    console.log('Embed token generated:', tokenData);

    return {
      token: tokenData.token,
      tokenId: tokenData.tokenId,
      expiration: tokenData.expiration
    };
  } catch (error) {
    console.error('Error generating embed token:', error);
    throw error;
  }
  };


// Refresh embed token (similar to getReportEmbedConfig but only gets token)
// export const refreshEmbedToken = async (reportId) => {
//   try {
//     const accessToken = await getAccessToken();
    
//     const response = await fetch(
//       `${powerBiConfig.apiUrl}/groups/${powerBiConfig.groupId}/reports/${reportId}/GenerateToken`,
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           accessLevel: 'View',
//           allowSaveAs: false
//         })
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`Failed to refresh token: ${response.status}`);
//     }

//     const data = await response.json();
//     return {
//       accessToken: data.token,
//       expiration: data.expiration
//     };
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     throw error;
//   }
// };