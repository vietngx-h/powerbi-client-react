// callPowerBiApi.js
// Configuration for your Power BI embedding
const powerBiConfig = {
  apiUrl: 'https://api.powerbi.com/v1.0/myorg',
  groupId: '42B9B0F0-19AB-4682-A22E-6B24179B83C9', // Your workspace ID
};

// Get report embed URL (GET only)
const accessToken = sessionStorage.getItem('powerbi_access_token');


export const getReportEmbedConfig = async () => {
  try {
    // Get the access token from session storage
    const accessToken = sessionStorage.getItem('powerbi_access_token');
    console.log('Access Token:', accessToken);
    
    if (!accessToken) {
      throw new Error('No access token found in session storage');
    }

    // Make GET request to fetch reports
    // const reportResponse = await fetch(
    //   `https://api.powerbi.com/v1.0/myorg/groups/f089354e-8366-4e18-aea3-4cb4a3a50b48/reports`, // Fixed URL (removed extra })
    //   {
    //     method: 'GET',
    //     headers: {
    //       'Authorization': `Bearer ${accessToken}`,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );
    const reportResponse = await fetch(
      `${powerBiConfig.apiUrl}/groups/${powerBiConfig.groupId}/reports`, // Fixed URL (removed extra })
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Report Response:', reportResponse);

    // Check if response is successful
    if (!reportResponse.ok) {
      throw new Error(`Failed to get report details: ${reportResponse.status} ${reportResponse.statusText}`);
    }

    const reportData = await reportResponse.json();
    console.log('API Response:', reportData);

    // Get the first report (assuming you want the first one)
    const firstReport = reportData.value[0];
    
    // Prepare the result object
    const result = {
      reportId: firstReport.id,
      reportName: firstReport.name,
      embedUrl: firstReport.embedUrl,
      datasetId: firstReport.datasetId
    };
    
    console.log('Report embed config:', result);
    return result;
    
  } catch (error) {
    console.error('Error in getReportEmbedConfig:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};


export const generateEmbedToken = async () => {
  try {
    const accessToken = sessionStorage.getItem('powerbi_access_token');
    if (!accessToken) throw new Error('No access token found');

    // First, get the report details (await the Promise!)
    const reportConfig = await getReportEmbedConfig();

    const payload = {
      datasets: [
        {
          id: reportConfig.datasetId  // Now correctly referencing the datasetId
        }
      ],
      reports: [
        {
          id: reportConfig.reportId,  // Now correctly referencing the reportId
          allowEdit: false  // Typically false for view-only embedding
        }
      ]
    };

    // Include groupId in the URL (best practice)
    const response = await fetch(
      `${powerBiConfig.apiUrl}/GenerateToken`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

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