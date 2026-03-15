import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Users, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Star,
  Quote,
  Play,
  ChevronDown,
  Zap,
  Target,
  Award,
  Clock,
  IndianRupee,
  Calendar,
  CreditCard,
  Smartphone as PhoneIcon,
  Wallet,
  Activity,
  Check,
  X,
  Menu,
  Globe,
  Mail,
  Phone as PhoneIcon2,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ChevronRight,
  ArrowUpRight as ArrowUpIcon
} from 'lucide-react';
import { useState } from 'react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Effortlessly manage gym members with detailed profiles, membership tracking, and automated expiry notifications.',
      gradient: 'from-blue-500 to-cyan-500',
      details: ['Member profiles', 'Membership tracking', 'Automated notifications', 'Bulk operations']
    },
    {
      icon: IndianRupee,
      title: 'Payment Tracking',
      description: 'Streamline payment collection with multiple payment methods, automated receipts, and comprehensive revenue analytics.',
      gradient: 'from-green-500 to-emerald-500',
      details: ['Multiple payment methods', 'Automated receipts', 'Revenue analytics', 'Payment reminders']
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Get real-time insights into gym performance with interactive charts, member growth metrics, and revenue trends.',
      gradient: 'from-purple-500 to-pink-500',
      details: ['Real-time analytics', 'Growth metrics', 'Revenue trends', 'Custom reports']
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Bank-level security with encrypted data, secure authentication, and automatic backups to protect your business.',
      gradient: 'from-red-500 to-orange-500',
      details: ['Bank-level encryption', 'Secure authentication', 'Automatic backups', 'Data protection']
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Access your gym management system from any device with our fully responsive, mobile-optimized interface.',
      gradient: 'from-indigo-500 to-purple-500',
      details: ['Mobile optimized', 'Cross-platform', 'Offline access', 'Push notifications']
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience blazing-fast performance with optimized workflows and instant data synchronization across all devices.',
      gradient: 'from-yellow-500 to-orange-500',
      details: ['Fast performance', 'Instant sync', 'Optimized workflows', 'Real-time updates']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Gym Owner',
      gym: 'FitZone Gym',
      content: 'FitLedger has transformed how I manage my gym. The member tracking and payment features have saved me countless hours each month.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Mike Chen',
      role: 'Fitness Center Manager',
      gym: 'PowerHouse Fitness',
      content: 'The analytics dashboard gives me insights I never had before. I can track growth and make data-driven decisions for my business.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Studio Owner',
      gym: 'Yoga Flow Studio',
      content: 'Simple, intuitive, and powerful. FitLedger handles everything from member management to payments seamlessly.',
      rating: 5,
      avatar: 'ER'
    }
  ];

  const faqs = [
    {
      question: 'How secure is my gym data?',
      answer: 'Your data is protected with bank-level encryption, secure authentication, and regular backups. We use industry-standard security practices to ensure your information is always safe and accessible only to you.'
    },
    {
      question: 'Can I import existing member data?',
      answer: 'Yes! FitLedger supports easy data import from CSV files. Our team can also help you migrate data from other gym management systems to ensure a smooth transition.'
    },
    {
      question: 'What payment methods are supported?',
      answer: 'FitLedger supports cash, card payments, UPI, and other digital payment methods. You can track all payment types in one unified dashboard and generate detailed reports.'
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'While we don\'t have a dedicated mobile app yet, FitLedger is fully responsive and works perfectly on all mobile devices. You can access all features from your smartphone or tablet.'
    },
    {
      question: 'Can I customize membership plans?',
      answer: 'Absolutely! FitLedger allows you to create custom membership plans with different durations, pricing, and features. You can set up unlimited plan types to match your gym\'s offerings.'
    },
    {
      question: 'How does the free trial work?',
      answer: 'Start with a 14-day free trial with full access to all features. No credit card required. After the trial, choose the plan that best fits your needs.'
    }
  ];

  const pricing = [
    {
      name: 'Starter',
      price: '29',
      description: 'Perfect for small gyms and fitness studios',
      features: [
        'Up to 50 members',
        'Basic member management',
        'Payment tracking',
        'Email support',
        'Mobile access'
      ],
      highlighted: false
    },
    {
      name: 'Professional',
      price: '79',
      description: 'Ideal for growing gyms with multiple trainers',
      features: [
        'Up to 200 members',
        'Advanced analytics',
        'Automated notifications',
        'Priority support',
        'Custom reports',
        'Data export'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: '199',
      description: 'Complete solution for large fitness chains',
      features: [
        'Unlimited members',
        'Multi-gym management',
        'Custom integrations',
        'Dedicated support',
        'White-label options',
        'API access'
      ],
      highlighted: false
    }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FitLedger</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 transition-colors">Features</button>
              <button onClick={() => scrollToSection('screenshots')} className="text-gray-600 hover:text-gray-900 transition-colors">Screenshots</button>
              <button onClick={() => scrollToSection('demo')} className="text-gray-600 hover:text-gray-900 transition-colors">Demo</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</button>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn-ghost hidden sm:block">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started Free
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden btn-ghost p-2"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left text-gray-600 hover:text-gray-900 transition-colors">Features</button>
              <button onClick={() => scrollToSection('screenshots')} className="block w-full text-left text-gray-600 hover:text-gray-900 transition-colors">Screenshots</button>
              <button onClick={() => scrollToSection('demo')} className="block w-full text-left text-gray-600 hover:text-gray-900 transition-colors">Demo</button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-gray-600 hover:text-gray-900 transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('faq')} className="block w-full text-left text-gray-600 hover:text-gray-900 transition-colors">FAQ</button>
              <Link to="/login" className="block w-full text-left btn-ghost">Sign In</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce-soft">
              <Zap className="w-4 h-4" />
              New: Advanced Analytics Dashboard
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="text-gradient">Gym Management</span>
              <br />
              Made Simple
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The complete SaaS solution for modern gym owners. Manage members, track payments, 
              and grow your fitness business with powerful analytics and automation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => scrollToSection('demo')}
                className="btn-secondary text-lg px-8 py-4 group"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Product Screenshot */}
          <div className="mt-16 relative">
            <div className="relative mx-auto max-w-6xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-3xl blur-3xl opacity-20 animate-pulse-soft"></div>
              <div className="relative bg-white rounded-3xl shadow-soft-lg p-8 border border-gray-100">
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                      <BarChart3 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">FitLedger Dashboard</h3>
                    <p className="text-gray-600 mb-6">Complete gym management solution</p>
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">1,200+</div>
                        <div className="text-sm text-gray-500">Gyms Managed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success-600">50K+</div>
                        <div className="text-sm text-gray-500">Active Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">4.9/5</div>
                        <div className="text-sm text-gray-500">Customer Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Grow Your Gym
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for fitness businesses to streamline operations and boost revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover p-8 group">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-success-500 mr-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section id="screenshots" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See FitLedger in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Take a tour of our powerful gym management interface
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Dashboard Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h3>
              </div>
              <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-primary-600">156</div>
                      <div className="text-sm text-gray-600">Total Members</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-success-600">$24,580</div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="h-32 bg-gradient-to-r from-primary-100 to-success-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Page Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Member Management</h3>
              </div>
              <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
                          <div className="h-2 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="h-6 bg-success-100 rounded-full w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Watch our 2-minute demo to see FitLedger in action
            </p>
          </div>

          <div className="relative">
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-soft-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors group"
                >
                  <Play className="w-8 h-8 text-primary-600 group-hover:scale-110 transition-transform" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 to-transparent">
                <h3 className="text-white text-xl font-semibold mb-2">Complete Gym Management Solution</h3>
                <p className="text-gray-300">Learn how FitLedger can transform your gym business</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Gym Owners Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what fitness professionals are saying about FitLedger
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-gray-300 mb-4" />
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.gym}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your gym. Start with a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <div key={index} className={`relative ${
                plan.highlighted 
                  ? 'card-gradient scale-105 shadow-soft-lg' 
                  : 'card'
              }`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    to="/register" 
                    className={`w-full block text-center ${
                      plan.highlighted 
                        ? 'btn-primary' 
                        : 'btn-secondary'
                    }`}
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full text-left p-6 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <ChevronRight 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedFaq === index ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="card-gradient p-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Gym Management?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of gym owners who have already streamlined their operations with FitLedger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Start Your Free Trial
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In to Dashboard
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FitLedger</span>
              </div>
              <p className="text-gray-400 mb-6">
                The modern gym management solution for fitness businesses of all sizes.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#screenshots" className="text-gray-400 hover:text-white transition-colors">Screenshots</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms & Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2024 FitLedger. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsVideoModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-900 opacity-75 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-soft-lg transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="relative">
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5 text-gray-900" />
                </button>
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 text-primary-400" />
                    <h3 className="text-xl font-semibold mb-2">FitLedger Demo Video</h3>
                    <p className="text-gray-400">Video would be embedded here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
