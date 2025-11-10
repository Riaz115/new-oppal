import { Gem, CheckCircle, ArrowRight, Users } from 'lucide-react';
import Footer from '@/react-app/components/Footer';

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 md:py-6">
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Gem className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <span className="text-xl md:text-2xl font-bold text-gray-900">Opal44</span>
            </a>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="/#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              <a href="/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg">
                Sign Up Free
              </a>
            </div>
            <div className="md:hidden">
              <a href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                ← Back
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Thank You Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-8 md:pb-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank you for contacting us!
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            We've received your message and will get back to you within 24 hours. In the meantime, why not join our community?
          </p>

          {/* Training Group CTA */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Join Our Training Community
            </h2>
            <p className="text-gray-700 mb-6">
              Get exclusive insights, analytics tips, and connect with other business owners learning to master their website data.
            </p>
            <a
              href="https://justpauleaston.com/skool"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:scale-105 space-x-2"
            >
              <span>Check out our training group: On Skool</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          
        </div>
      </div>

      <Footer />
    </div>
  );
}
