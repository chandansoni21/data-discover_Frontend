import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Zap, Cpu, Globe, Play, ArrowRight, Check, Star, X, Mail, Phone, Building, User,
  MessageSquare, Database, TrendingUp, Clock
} from 'lucide-react';
import logo from '../Assets/lomgo.png';

import UploadModal from './UploadModal';

const domainCards = [
  {
    id: 'finance',
    title: 'Financial Services',
    description: 'AI-powered banking and finance solutions',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'from-emerald-500/10 to-teal-500/10',
    icon: '💰',
    features: [
      'Customer Service Automation',
      'KYC/AML Compliance',
      'Risk Analytics & Fraud Detection',
      'Investment Advisory',
    ],
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Intelligent healthcare solutions',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'from-blue-500/10 to-indigo-500/10',
    icon: '🏥',
    features: [
      'Patient Engagement',
      'Clinical Analytics',
      'Population Health',
      'Medical Records',
    ],
  },
  {
    id: 'retail',
    title: 'Retail & E-commerce',
    description: 'Transform customer experiences',
    color: 'from-orange-500 to-pink-600',
    bgColor: 'from-orange-500/10 to-pink-500/10',
    icon: '🛒',
    features: [
      'Smart Shopping Assistant',
      'Customer Analytics',
      'Loss Prevention',
      'Inventory Management',
    ],
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing',
    description: 'Smart factory solutions',
    color: 'from-slate-500 to-cyan-600',
    bgColor: 'from-slate-500/10 to-cyan-500/10',
    icon: '🏭',
    features: [
      'Predictive Maintenance',
      'Quality Inspection',
      'IoT Integration',
      'Supply Chain',
    ],
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Next-generation learning',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'from-violet-500/10 to-purple-500/10',
    icon: '🎓',
    features: [
      'Student Support',
      'Learning Analytics',
      'Admin Automation',
      'Personalization',
    ],
  },
  {
    id: 'legal',
    title: 'Legal Assistant',
    description: 'AI-powered legal research',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'from-amber-500/10 to-orange-500/10',
    icon: '⚖️',
    features: [
      'Legal Research',
      'Contract Analysis',
      'Case Law Database',
      'Document Drafting',
    ],
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime SLA', icon: Clock },
  { value: '500+', label: 'Enterprise Clients', icon: Building },
  { value: '10M+', label: 'Queries Processed', icon: Database },
  { value: '4.9/5', label: 'Customer Rating', icon: Star },
];

const testimonials = [
  {
    quote: "DataDiscover.AI transformed how we handle customer queries. Response time dropped by 80%.",
    author: "Sarah Chen",
    role: "CTO, FinServe Inc.",
    avatar: "SC"
  },
  {
    quote: "The AI accuracy is remarkable. It understands context better than any tool we've used.",
    author: "Michael Foster",
    role: "VP Engineering, HealthFirst",
    avatar: "MF"
  },
  {
    quote: "Implementation was seamless. We saw ROI within the first month.",
    author: "Emma Watson",
    role: "Director of AI, RetailMax",
    avatar: "EW"
  }
];

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDomainForUpload, setSelectedDomainForUpload] = useState(null);
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleExploreNow = (card) => {
    // Store the selected domain ID and trigger login
    sessionStorage.setItem('pendingDomainId', card.id);
    handleLogin();
  };

  const handleUploadComplete = (data) => {
    setShowUploadModal(false);
    // Store the upload data and redirect to home
    sessionStorage.setItem('pendingUpload', JSON.stringify({
      domain: selectedDomainForUpload,
      ...data
    }));
    handleLogin();
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setDemoSubmitted(true);
    setTimeout(() => {
      setShowDemoModal(false);
      setDemoSubmitted(false);
      setDemoForm({ name: '', email: '', company: '', phone: '', message: '' });
    }, 2000);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-gray-900 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <img src={logo} alt="DataDiscover.AI" className="h-11 w-11 object-contain" />
              <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">datadiscover.ai</div>
              <div className="text-[10px] text-gray-400 font-medium tracking-wide">by Meridian Solutions</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <a className="text-gray-600 hover:text-blue-600 font-medium transition-colors relative group text-sm" href="#domains">
              Solutions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a className="text-gray-600 hover:text-blue-600 font-medium transition-colors relative group text-sm" href="#features">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a className="text-gray-600 hover:text-blue-600 font-medium transition-colors relative group text-sm" href="#testimonials">
              Testimonials
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDemoModal(true)}
              className="hidden md:block px-5 py-2.5 text-gray-700 font-semibold hover:text-blue-600 transition-colors text-sm"
            >
              Schedule Demo
            </button>
            <button
              onClick={handleLogin}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-300 text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}


            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Transform Data Into
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Actionable Insights
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Ask questions, explore data, and get explainable answers—instantly.
              Powered by advanced AI for trusted business decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleLogin}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button
                onClick={() => setShowDemoModal(true)}
                className="group px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 text-blue-600" />
                  Schedule Demo
                </span>
              </button>
            </div>


          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-4">
                    <IconComponent className="w-6 h-6 text-blue-300" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Domain Solutions Section */}
      <section id="domains" className="px-6 py-20 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Industry Solutions</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tailored for Your Industry</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pre-built AI models optimized for specific business domains and use cases
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {domainCards.map((card, index) => (
              <div
                key={card.id}
                className="group relative rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">
                    {card.icon}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">{card.description}</p>

                <div className="space-y-2.5 mb-6">
                  {card.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2.5 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleExploreNow(card)}
                  className="w-full py-2.5 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  Explore Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Enterprise-Ready Platform</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Built for security, scale, and performance from day one
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure & Compliant',
                desc: 'Enterprise-grade security with SOC 2, GDPR, and full audit trails for complete peace of mind'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                desc: 'Get accurate answers from your data in seconds with AI-powered real-time analytics'
              },
              {
                icon: Globe,
                title: 'Easy Integration',
                desc: 'Seamlessly connect with all major enterprise systems, databases, and platforms'
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-500"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-4">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Customer Stories</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Join hundreds of enterprises already leveraging AI for better decisions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleLogin}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img src={logo} alt="DataDiscover.AI" className="h-10 w-10 object-contain" />
                <div>
                  <div className="font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">datadiscover.ai</div>
                  <div className="text-xs text-gray-500">by Meridian Solutions</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enterprise AI platform for trusted business insights and data-driven decisions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4 text-blue-400">Solutions</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                {['Financial Services', 'Healthcare', 'Retail', 'Manufacturing'].map(item => (
                  <li key={item}><button type="button" className="hover:text-white transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4 text-blue-400">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                {['About Us', 'Careers', 'Blog', 'Contact'].map(item => (
                  <li key={item}><button type="button" className="hover:text-white transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4 text-blue-400">Legal</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                {['Privacy Policy', 'Terms of Service', 'Security', 'Compliance'].map(item => (
                  <li key={item}><button type="button" className="hover:text-white transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} datadiscover.ai by Meridian Solutions Pvt Ltd. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Schedule Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8">
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-2">Schedule a Demo</h2>
              <p className="text-blue-100">See DataDiscover.AI in action with a personalized demo</p>
            </div>

            <div className="p-8">
              {demoSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600">We'll be in touch within 24 hours to schedule your demo.</p>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={demoForm.name}
                        onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={demoForm.email}
                        onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4 inline mr-1" />
                        Company *
                      </label>
                      <input
                        type="text"
                        required
                        value={demoForm.company}
                        onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Company Inc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={demoForm.phone}
                        onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Message
                    </label>
                    <textarea
                      value={demoForm.message}
                      onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us about your use case..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Request Demo
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedDomainForUpload(null);
        }}
        onUploadComplete={handleUploadComplete}
        preSelectedDomain={selectedDomainForUpload?.title}
      />
    </div>
  );
}