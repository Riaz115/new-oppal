import { useState } from 'react';
import { Gem, DollarSign, Users, TrendingUp, Calendar, Target, ExternalLink, Star, Gift } from 'lucide-react';
import Footer from '@/react-app/components/Footer';

export default function Partners() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    audience: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject: 'Partnership Inquiry'
        }),
      });

      if (response.ok) {
        window.location.href = '/thank-you';
      } else {
        alert('There was an error sending your message. Please try again.');
      }
    } catch (error) {
      alert('There was an error sending your message. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Lifetime Commissions',
      description: 'Earn recurring monthly payments for every customer you refer - for life!',
      highlight: 'Monthly Recurring Revenue'
    },
    {
      icon: TrendingUp,
      title: 'Tiered Commission Structure',
      description: 'Start at 10% commission and increase to 30% after just 2 successful sales',
      highlight: '10% → 30% Commission'
    },
    {
      icon: Calendar,
      title: '365-Day Cookie Tracking',
      description: 'We track referrals for a full year, ensuring you get credit for every sale',
      highlight: '1 Year Attribution'
    },
    {
      icon: Users,
      title: 'Exclusive Content Partnership',
      description: 'Have an audience? We\'ll work with you to create exclusive content and offers',
      highlight: 'Custom Collaboration'
    }
  ];

  const stats = [
    { number: '30%', label: 'Max Commission Rate' },
    { number: '365', label: 'Days Cookie Tracking' },
    { number: '2', label: 'Sales to Tier Up' },
    { number: '∞', label: 'Lifetime Payments' }
  ];

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
              <a href="/partners" className="text-gray-900 font-medium">Partners</a>
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

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 px-4 py-2 rounded-full mb-6">
              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-green-800 text-sm font-medium">Lifetime Partner Program</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Partner with us and get paid{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                every month
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 md:mb-12">
              Join our affiliate program and earn recurring lifetime commissions. Start at 10%, reach 30% after just 2 sales, with 365-day cookie tracking and exclusive partnership opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://opal44.goaffpro.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:scale-105 space-x-2"
              >
                <span>Join Partner Program</span>
                <ExternalLink className="w-5 h-5" />
              </a>
              <a
                href="#details"
                className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="details" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Partner with Opal44?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in rewarding our partners generously for bringing valuable customers to our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {benefit.highlight}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Commission Structure */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Commission Structure</h3>
              <p className="text-gray-600">Simple, transparent, and rewarding</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Starter Level</h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">10%</div>
                <p className="text-gray-600 text-sm">Commission on all sales from day one</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Elite Level</h4>
                <div className="text-3xl font-bold text-purple-600 mb-2">30%</div>
                <p className="text-gray-600 text-sm">After 2 successful sales</p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h3>
              <p className="text-xl text-gray-600">Get started in minutes</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Join Program', description: 'Sign up for free at our partner portal' },
                { step: '2', title: 'Get Your Link', description: 'Receive your unique referral link and materials' },
                { step: '3', title: 'Share & Promote', description: 'Share with your audience using our proven content' },
                { step: '4', title: 'Earn Forever', description: 'Get paid monthly for every customer you refer' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {item.step}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <a
              href="https://opal44.goaffpro.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:scale-105 space-x-2"
            >
              <span>Join Partner Program</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Partnership Inquiry Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Gift className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Have an Audience? Let's Create Something Special
            </h3>
            <p className="text-xl text-gray-600">
              We love working with content creators and influencers to develop exclusive content and custom partnership deals.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website/Social Media
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="https://yourwebsite.com or social media link"
                />
              </div>

              <div>
                <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-2">
                  Audience Type
                </label>
                <select
                  id="audience"
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select your audience type</option>
                  <option value="small-business">Small Business Owners</option>
                  <option value="marketers">Digital Marketers</option>
                  <option value="entrepreneurs">Entrepreneurs</option>
                  <option value="bloggers">Bloggers/Content Creators</option>
                  <option value="agencies">Marketing Agencies</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your audience and partnership ideas *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Describe your audience size, engagement, and any content ideas you have in mind..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:scale-100 disabled:shadow-none flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Partnership Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      

      <Footer />
    </div>
  );
}
