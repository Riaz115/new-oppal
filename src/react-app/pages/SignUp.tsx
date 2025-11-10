import { Gem, LogOut } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useGoogleAuth';
import Footer from '@/react-app/components/Footer';

export default function SignUp() {
  const { user, redirectToLogin, logout, isPending } = useAuth();

  const handleGoogleSignUp = async () => {
    try {
      await redirectToLogin();
    } catch (error) {
      console.error('Failed to redirect to login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Refresh the page to show login button again
      window.location.href = '/signup';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 md:py-6">
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Gem className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <span className="text-xl md:text-2xl font-bold text-gray-900">Opal44</span>
            </a>
            <div className="md:hidden">
              <a href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                ← Back
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Sign Up Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-8 md:pb-16">
        <div className="max-w-md w-full">
          {/* Sign Up Panel */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {user ? 'You are logged in!' : 'Start Your Free Trial'}
              </h1>
              <p className="text-gray-600">
                {user 
                  ? `Welcome back, ${user.name}!` 
                  : 'Get AI-powered insights about your website traffic in plain English. No credit card required.'}
              </p>
            </div>

            {/* Show Logout Button if user is logged in, otherwise show Google Sign Up Button */}
            {user ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-full mx-auto mb-2"
                  />
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                
                <a
                  href="/dashboard"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2 block text-center"
                >
                  <span>Go to Dashboard</span>
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full bg-white hover:bg-gray-50 border-2 border-red-300 hover:border-red-400 text-red-600 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignUp}
                disabled={isPending}
                className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            )}

            {/* Features List - Only show when not logged in */}
            {!user && (
              <>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center mb-4">What you'll get:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>7 days free trial</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Plain English analytics insights</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>50 credits to try it out</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>No credit card required</span>
                    </li>
                  </ul>
                </div>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center mt-6">
                  By signing up, you agree to our{' '}
                  <a href="/terms-of-service" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy-policy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
