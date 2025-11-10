import { Gem, Play, CheckCircle, LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useGoogleAuth';

export default function Hero() {
  const { user, redirectToLogin, logout } = useAuth();

  const handleSignUpClick = async () => {
    if (user) {
      // If already logged in, go to dashboard
      window.location.href = '/dashboard';
    } else {
      // If not logged in, redirect to Google OAuth
      try {
        await redirectToLogin();
      } catch (error) {
        console.error('Failed to redirect to login:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Refresh the page to show login button again
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  useEffect(() => {
    // Load Wistia player scripts
    const playerScript = document.createElement('script');
    playerScript.src = 'https://fast.wistia.com/player.js';
    playerScript.async = true;
    document.head.appendChild(playerScript);

    const embedScript = document.createElement('script');
    embedScript.src = 'https://fast.wistia.com/embed/25fk69xdfn.js';
    embedScript.async = true;
    embedScript.type = 'module';
    document.head.appendChild(embedScript);

    // Add Wistia styles
    const style = document.createElement('style');
    style.textContent = `
      wistia-player[media-id='25fk69xdfn']:not(:defined) { 
        background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/25fk69xdfn/swatch'); 
        display: block; 
        filter: blur(5px); 
        padding-top:50.63%; 
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup scripts and styles on unmount
      document.head.removeChild(playerScript);
      document.head.removeChild(embedScript);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100/50 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-50/80 rounded-full blur-lg"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-blue-100/40 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="https://opal44.com/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Gem className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Opal44</span>
          </a>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-blue-500"
                  />
                  <span className="text-gray-600">Welcome, {user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignUpClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
              >
                Sign Up Free
              </button>
            )}
          </div>
          </div>
        </nav>

        {/* Hero content */}
        <div className="space-y-12">
          {/* Headline Section */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Website Data-
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Explained in Plain English</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                Get AI-powered insights about your website traffic (Google Analytics 4) in simple, actionable English from simple questions. Zero Jargon.
              </p>
            </div>

            {/* Video Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200">
                <div dangerouslySetInnerHTML={{
                  __html: '<wistia-player media-id="25fk69xdfn" aspect="1.9753086419753085"></wistia-player>'
                }}></div>
              </div>
            </div>
          </div>

          

          {/* CTA Section Below Video */}
          <div className="text-center space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleSignUpClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-32 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>{user ? 'Go to Dashboard' : 'Start 7 Day Free Trial'}</span>
                <Play className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
