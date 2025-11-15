import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { Chrome, Facebook, User } from 'lucide-react';

interface SocialLoginProps {
  onSuccess: (provider: string, userData: any) => void;
  onError: (error: string) => void;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ onSuccess, onError }) => {
  // Debug: Log the Google Client ID (first 10 characters only for security)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  console.log('Google Client ID configured:', clientId ? `${clientId.substring(0, 10)}...` : 'Not configured');
  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      // Decode JWT token to get user info
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      onSuccess('google', {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        provider: 'google'
      });
    } catch (error) {
      console.error('Google login error:', error);
      onError('Failed to process Google login. Please try again.');
    }
  };

  const handleFacebookSuccess = (response: any) => {
    if (response.accessToken) {
      onSuccess('facebook', {
        name: response.name,
        email: response.email,
        picture: response.picture?.data?.url,
        provider: 'facebook'
      });
    }
  };

  const handleMicrosoftLogin = () => {
    onSuccess('microsoft', {
      name: 'Demo User',
      email: 'demo@outlook.com',
      picture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      provider: 'microsoft'
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Google Login */}
        {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? (
          <div className="w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={(error) => {
                console.error('Google OAuth error:', error);
                if (error.error === 'popup_closed_by_user') {
                  onError('Login cancelled. Please try again.');
                } else if (error.error === 'access_denied') {
                  onError('Access denied. Please check your Google account permissions.');
                } else if (error.error === 'invalid_request') {
                  onError('Invalid request. Please check your OAuth configuration.');
                } else {
                  onError(`Google login failed: ${error.error || 'Unknown error'}`);
                }
              }}
              useOneTap={false}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>
        ) : (
          <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2 font-semibold">📝 Setup Google Login</p>
            <p className="text-xs text-blue-600">
              To enable Google login, get your Client ID from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Google Cloud Console</a> and add it to your .env file as VITE_GOOGLE_CLIENT_ID
            </p>
          </div>
        )}

        {/* Facebook Login */}
        <FacebookLogin
          appId="your-facebook-app-id"
          autoLoad={false}
          fields="name,email,picture"
          callback={handleFacebookSuccess}
          onFailure={() => onError('Facebook login failed')}
          cssClass="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          textButton="Continue with Facebook"
          icon={<Facebook className="h-5 w-5" />}
        />

        {/* Microsoft Login - Demo Mode */}
        <button
          onClick={handleMicrosoftLogin}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 border-2 border-gray-300 relative group"
        >
          <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="11" height="11" fill="#F25022"/>
            <rect x="12" width="11" height="11" fill="#7FBA00"/>
            <rect y="12" width="11" height="11" fill="#00A4EF"/>
            <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
          </svg>
          <span>Continue with Microsoft</span>
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Demo
          </span>
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;