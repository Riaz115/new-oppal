import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechStart Inc.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    quote: "Opal44 transformed how our team understands our website performance. Instead of spending hours trying to decode analytics, we get clear insights that drive real business decisions.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "E-commerce Manager",
    company: "RetailMax",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    quote: "The AI recommendations helped us increase our conversion rate by 34% in just two months. It's like having a data scientist on our team who speaks plain English.",
    rating: 5
  },
  {
    name: "Emily Johnson",
    role: "Digital Agency Owner",
    company: "Growth Partners",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote: "I can finally present analytics to my clients in a way they actually understand. The reports are so clear that our strategy meetings are now more productive than ever.",
    rating: 5
  },
  {
    name: "David Park",
    role: "Product Manager",
    company: "SaaS Solutions",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "Setup took literally 3 minutes, and we started getting valuable insights immediately. The real-time alerts saved us from a major traffic drop last week.",
    rating: 5
  },
  {
    name: "Lisa Thompson",
    role: "Content Creator",
    company: "BlogLife Media",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    quote: "As someone who's not technically minded, Opal44 makes me feel like an analytics expert. I can optimize my content based on insights I actually understand.",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Startup Founder",
    company: "InnovateTech",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    quote: "The cost savings are incredible. We cancelled our expensive analytics consultant and get better insights with Opal44 for a fraction of the price.",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 px-4 py-2 rounded-full mb-4">
            <span className="text-blue-800 text-sm font-medium">Customer Success</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by thousands of businesses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join over 2,500 companies that trust Opal44 to understand their website analytics
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-200" />
                <p className="text-gray-700 leading-relaxed pl-6">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-blue-600">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to understand your traffic?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who've already simplified their analytics with Opal44
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:scale-105">
              Start Your Free Trial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
