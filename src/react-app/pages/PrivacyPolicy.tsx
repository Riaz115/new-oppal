import { Gem } from 'lucide-react';
import Footer from '@/react-app/components/Footer';

export default function PrivacyPolicy() {
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

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-8 md:pb-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-8">
            <strong>Effective Date:</strong> August 28, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                At Opal44, we collect information to provide you with better analytics insights and improve our service. We collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Account Information:</strong> Name, email address, and billing information when you create an account</li>
                <li><strong>Google Analytics Data:</strong> Website analytics data from your connected GA4 account</li>
                <li><strong>Usage Data:</strong> How you use our platform, including features accessed and reports generated</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies for platform functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide AI-powered analytics insights and reports</li>
                <li>Process payments and manage your account</li>
                <li>Send important service updates and notifications</li>
                <li>Improve our platform and develop new features</li>
                <li>Provide customer support</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, rent, or share your personal information with third parties except:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Service Providers:</strong> Trusted partners who help us operate our platform (hosting, payment processing, email delivery)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Your Google Analytics data remains yours and is never shared with other customers or used for any purpose other than providing you with insights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure data storage with encryption at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication protocols</li>
                <li>Compliance with Google's API security requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correct:</strong> Update or correct inaccurate information</li>
                <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                <li><strong>Disconnect:</strong> Revoke access to your Google Analytics account at any time</li>
                <li><strong>Export:</strong> Download your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700">
                We retain your information for as long as your account is active or as needed to provide services. When you delete your account, we will delete your personal information within 30 days, except where retention is required by law. Analytics data may be retained in aggregated, anonymized form for service improvement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze platform usage to improve our service</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700">
                Your information may be processed and stored in countries other than your own. We ensure appropriate safeguards are in place to protect your information, including compliance with applicable data protection laws and using standard contractual clauses where required.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Opal44 is not intended for use by children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through our platform. The updated policy will be effective when posted, and your continued use of our service constitutes acceptance of the changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or how we handle your information, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@opal44.com<br />
                  <strong>Address:</strong> Opal44 Privacy Team<br />
                  123 Analytics Street<br />
                  Data City, DC 12345
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
