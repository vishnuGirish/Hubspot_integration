// hubspot.js

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

// Component for integrating Hubspot OAuth
export const HubspotIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false); // State to track connection status
    const [isConnecting, setIsConnecting] = useState(false); // State to track ongoing connection process

    // Function to initiate OAuth process in a new window
    const handleConnectClick = async () => {
        try {
            setIsConnecting(true); // Set loading state

            // Prepare form data for authentication request
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);

            // Send request to backend for authorization URL
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/authorize`, formData);
            const authURL = response?.data; // Extract authorization URL from response

            // Open the authorization URL in a new popup window
            const newWindow = window.open(authURL, 'Hubspot Authorization', 'width=600, height=600');

            // Polling mechanism to check if the OAuth window is closed
            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) { 
                    window.clearInterval(pollTimer); // Stop polling when window is closed
                    handleWindowClosed(); // Trigger logic after OAuth completion
                }
            }, 200);
        } catch (e) {
            setIsConnecting(false); // Reset loading state on error
            alert(e?.response?.data?.detail); // Show error message
        }
    }


    // Function to handle logic when OAuth window is closed
    const handleWindowClosed = async () => {
        try {
            // Prepare form data to fetch stored credentials
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);

            // Request backend for saved credentials
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/credentials`, formData);
            const credentials = response.data;

            // If credentials exist, update state and integration parameters
            if (credentials) {
                setIsConnecting(false);
                setIsConnected(true);
                setIntegrationParams(prev => ({ ...prev, credentials: credentials, type: 'Hubspot' }));
            }
            setIsConnecting(false);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail); // Show error message
        }
    }

    // Effect to check if integration is already connected
    useEffect(() => {
        setIsConnected(integrationParams?.credentials ? true : false);
    }, []);

    return (
        <>
        <Box sx={{mt: 2}}>
            {/* Section Header */}
            Parameters
            
            {/* Button Section for Hubspot Connection */}
            <Box display='flex' alignItems='center' justifyContent='center' sx={{mt: 2}}>
                <Button 
                    variant='contained' 
                    onClick={isConnected ? () => {} : handleConnectClick} // Disable click if already connected
                    color={isConnected ? 'success' : 'primary'}
                    disabled={isConnecting} // Disable button during connection process
                    style={{
                        pointerEvents: isConnected ? 'none' : 'auto', // Prevents interaction when connected
                        cursor: isConnected ? 'default' : 'pointer',
                        opacity: isConnected ? 1 : undefined
                    }}
                >
                    {/* Display appropriate button text based on connection state */}
                    {isConnected ? 'Hubspot Connected' : isConnecting ? <CircularProgress size={20} /> : 'Connect to Hubspot'}
                </Button>
            </Box>
        </Box>
      </>
    );
}
