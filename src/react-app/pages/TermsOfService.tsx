import { Gem } from 'lucide-react';
import Footer from '@/react-app/components/Footer';

export default function TermsOfService() {
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

      {/* Terms of Service Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-8 md:pb-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <p className="text-gray-600 mb-8">
            <strong>Effective Date:</strong> August 28, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using Opal44's services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
              </p>
              <p className="text-gray-700">
                We may update these terms from time to time. Continued use of our service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Opal44 is a web analytics platform that connects to your Google Analytics 4 account to provide AI-powered insights in plain English. Our service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>AI-powered analysis of your GA4 data</li>
                <li>Plain English insights and recommendations</li>
                <li>Real-time alerts and monitoring</li>
                <li>Custom reports and dashboards</li>
                <li>Email notifications and summaries</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <p className="text-gray-700 mb-4">
                To use our service, you must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be at least 18 years old or have parental consent</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not share your account with others</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Google Analytics Integration</h2>
              <p className="text-gray-700 mb-4">
                Our service requires access to your Google Analytics 4 data. By connecting your GA4 account:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You grant us permission to access your GA4 data for analysis</li>
                <li>You confirm you have the right to share this data with us</li>
                <li>You understand we will use this data solely to provide our service</li>
                <li>You can revoke access at any time through your Google account settings</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We comply with Google's API policies and data handling requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription and Billing</h2>
              <p className="text-gray-700 mb-4">
                Our service operates on a subscription basis:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Free Trial:</strong> 7 days, no credit card required</li>
                <li><strong>Billing:</strong> Monthly or annual subscriptions, charged in advance</li>
                <li><strong>Auto-Renewal:</strong> Subscriptions renew automatically unless cancelled</li>
                <li><strong>Price Changes:</strong> We'll provide 30 days notice for any price increases</li>
                <li><strong>Refunds:</strong> 30-day money-back guarantee for new subscriptions</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can cancel your subscription at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Acceptable Use</h2>
              <p className="text-gray-700 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Reverse engineer, decompile, or disassemble our software</li>
                <li>Use automated tools to access the service without permission</li>
                <li>Share your account credentials with third parties</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                Our service and all related materials are protected by intellectual property laws:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Opal44 owns all rights to our software, algorithms, and content</li>
                <li>You retain ownership of your data and analytics information</li>
                <li>You grant us a license to use your data solely to provide our service</li>
                <li>Our reports and insights remain our intellectual property</li>
                <li>You may not copy, modify, or distribute our software</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data and Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy and data security are important to us:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We process your data according to our Privacy Policy</li>
                <li>Your GA4 data is used only to provide analytics insights</li>
                <li>We implement industry-standard security measures</li>
                <li>We do not sell or share your data with third parties</li>
                <li>You can export or delete your data at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Service Availability</h2>
              <p className="text-gray-700 mb-4">
                While we strive for maximum uptime, we cannot guarantee uninterrupted service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We aim for 99.9% uptime but cannot guarantee it</li>
                <li>Scheduled maintenance will be announced in advance</li>
                <li>We may temporarily suspend service for updates or repairs</li>
                <li>Third-party services (like Google Analytics) may affect our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Our liability is limited to the amount you paid in the last 12 months</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>We provide the service "as is" without warranties</li>
                <li>You use the service at your own risk</li>
                <li>We are not responsible for decisions made based on our insights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 mb-4">
                Either party may terminate this agreement:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You can cancel your subscription at any time</li>
                <li>We may terminate accounts for violations of these terms</li>
                <li>We may discontinue the service with 30 days notice</li>
                <li>Upon termination, your access will be revoked</li>
                <li>You can export your data before termination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700">
                These terms are governed by the laws of the United States and the state of Delaware, without regard to conflict of law provisions. Any disputes will be resolved through binding arbitration in Delaware.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these terms from time to time:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We'll notify you of significant changes via email</li>
                <li>Continued use after changes constitutes acceptance</li>
                <li>If you disagree with changes, you may terminate your account</li>
                <li>The latest version will always be available on our website</li>
              </ul>
            </section>

            
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
