import { Gem, Home, Shield, FileText, Mail, UserPlus, Users } from 'lucide-react';
import Footer from '@/react-app/components/Footer';

export default function Sitemap() {
  const pages = [
    {
      title: 'Home',
      url: '/',
      description: 'Main landing page with overview of Opal44 features and benefits',
      icon: Home,
      category: 'Main Pages'
    },
    {
      title: 'Sign Up',
      url: '/signup',
      description: 'Create your Opal44 account to start analyzing your website',
      icon: UserPlus,
      category: 'Account'
    },
    {
      title: 'Contact Us',
      url: '/contact',
      description: 'Get in touch with our team for support or questions',
      icon: Mail,
      category: 'Support'
    },
    {
      title: 'Partners',
      url: '/partners',
      description: 'Join our affiliate program and earn recurring lifetime commissions',
      icon: Users,
      category: 'Business'
    },
    {
      title: 'Privacy Policy',
      url: '/privacy-policy',
      description: 'Our commitment to protecting your data and privacy',
      icon: Shield,
      category: 'Legal'
    },
    {
      title: 'Terms of Service',
      url: '/terms-of-service',
      description: 'Terms and conditions for using Opal44',
      icon: FileText,
      category: 'Legal'
    }
  ];

  const categories = ['Main Pages', 'Account', 'Business', 'Support', 'Legal'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Gem className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Opal44
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </a>
              <a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </nav>
            <div className="md:hidden">
              <a href="/" className="text-gray-600 hover:text-blue-600 text-sm">
                ← Back
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Site Map
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Navigate through all pages and features of Opal44. Find exactly what you're looking for with our comprehensive site directory.
          </p>
        </div>

        {/* Pages by Category */}
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryPages = pages.filter(page => page.category === category);
            
            return (
              <div key={category} className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
                  {category}
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryPages.map((page) => {
                    const IconComponent = page.icon;
                    return (
                      <a
                        key={page.url}
                        href={page.url}
                        className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {page.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                              {page.description}
                            </p>
                            <div className="mt-3 text-sm text-blue-600 font-medium group-hover:text-blue-700">
                              {page.url}
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Resources */}
        <div className="mt-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Additional Resources
          </h2>
          <div className="flex justify-center">
            <a
              href="/sitemap.xml"
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    XML Sitemap
                  </h3>
                  <p className="text-sm text-gray-500">
                    Machine-readable sitemap for search engines
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
