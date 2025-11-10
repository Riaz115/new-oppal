import { Check, Star } from 'lucide-react';

const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for small websites and personal projects",
    features: [
      "Up to 10,000 monthly page views",
      "Daily AI insights via email",
      "Basic performance recommendations",
      "Mobile-friendly dashboard",
      "Email support"
    ],
    buttonText: "Start Free Trial",
    popular: false
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "Ideal for growing businesses and marketing teams",
    features: [
      "Up to 100,000 monthly page views",
      "Real-time AI insights & alerts",
      "Advanced conversion optimization",
      "Custom reports & exports",
      "Priority support & onboarding",
      "Team collaboration tools"
    ],
    buttonText: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations with complex needs",
    features: [
      "Unlimited page views",
      "Custom AI model training",
      "White-label reports",
      "API access & integrations",
      "Dedicated account manager",
      "Custom dashboard branding"
    ],
    buttonText: "Contact Sales",
    popular: false
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 px-4 py-2 rounded-full mb-4">
            <span className="text-blue-800 text-sm font-medium">Simple Pricing</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose your plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with a 7 day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 border-2 ${
              plan.popular 
                ? 'border-orange-200 shadow-xl scale-105' 
                : 'border-gray-100 hover:border-blue-200 hover:shadow-xl'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-xl text-gray-600 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <a href={plan.buttonText === 'Contact Sales' ? '/contact' : '/signup'} className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center ${
                plan.popular
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            All plans include a 7 day free trial and 30 day money-back guarantee
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
