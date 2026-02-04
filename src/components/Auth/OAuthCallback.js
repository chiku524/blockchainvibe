import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Loader } from 'lucide-react';
import socialAuthService from '../../services/socialAuth';

const CallbackContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  padding: 1rem;
  box-sizing: border-box;
`;

const CallbackContent = styled.div`
  text-align: center;
  padding: 1rem;
  max-width: 100%;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem;
  }
`;

const Spinner = styled.div`
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const CallbackText = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize.lg};
  }
`;

const OAuthCallback = () => {
  const [status, setStatus] = React.useState('Completing authentication...');
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Processing OAuth callback...');
        setError(null);
        
        // Handle the OAuth callback
        await socialAuthService.handleOAuthCallback();
        
        setStatus('Authentication successful! Redirecting...');
        setError(null);
        
        // The redirect will be handled by the individual callback methods
        // No need to add additional redirect logic here
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message);
        setStatus('Authentication failed');
        
        // Redirect to sign in page on error
        setTimeout(() => {
          window.location.href = '/signin';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <CallbackContainer>
      <CallbackContent>
        <Spinner>
          <Loader size={48} />
        </Spinner>
        <CallbackText>
          {status}
        </CallbackText>
        {error && (
          <div style={{ color: 'red', marginTop: '1rem' }}>
            Error: {error}
          </div>
        )}
      </CallbackContent>
    </CallbackContainer>
  );
};

export default OAuthCallback;
