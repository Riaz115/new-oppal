import { useEffect, useState } from 'react';
import { Gem } from 'lucide-react';

export default function AuthCallback() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      setError('Authentication was cancelled or failed. Please try again.');
      setIsLoading(false);
      return;
    }

    // If we reach this page, it means the OAuth callback should have been handled
    // by the server and redirected. If we're still here, something went wrong.
    setTimeout(() => {
      setError('Authentication process incomplete. Please try signing up again.');
      setIsLoading(false);
    }, 3000);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Gem className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 ml-2">Opal44</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Sign Up Failed</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <a 
              href="/signup" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <Gem className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900 ml-2">Opal44</span>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-900">Completing your sign up...</h2>
            <p className="text-gray-600">Please wait while we set up your account.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Welcome to Opal44!</h2>
            <p className="text-gray-600">Your account has been created successfully.</p>
            <p className="text-sm text-gray-500">Redirecting you to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
