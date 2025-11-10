import { Brain, MessageSquare, TrendingUp, Shield, Clock, Zap } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "Plain English Insights",
    description: "Our AI connects to your GA4 data and explains what's really happening — in simple, everyday language. No more guessing what the numbers mean."
  },
  {
    icon: MessageSquare,
    title: "Conversation-Style Reports",
    description: "Get updates that read like you're chatting with your own analytics guide. Clear, simple, and easy for anyone to understand."
  },
  {
    icon: TrendingUp,
    title: "Smart, Data-Driven Tips",
    description: "Get tailored tips backed by your GA4 data to help improve traffic, boost results, and make smarter decisions."
  },
  {
    icon: Shield,
    title: "Your Data, Your Control",
    description: "Your GA4 data stays safe and secure. We never sell or share it — your information stays yours, always."
  },
  {
    icon: Clock,
    title: "Real-Time Alerts",
    description: "Know right away when something big changes — traffic spikes, drops, or anything unusual in your GA4 data."
  },
  {
    icon: Zap,
    title: "Quick, Code-Free Setup",
    description: "Securely connect your GA4 account — no code needed — and start getting insights in just minutes."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Finally, analytics you can understand
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stop struggling with complex dashboards and confusing metrics. Get clear, actionable insights about your website traffic in everyday language.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <a href="/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:scale-105">
            Try All Features Free
          </a>
        </div>
      </div>
    </section>
  );
}
