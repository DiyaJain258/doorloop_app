import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { 
  Sparkles, Building2, Check, ArrowRight, Shield, Zap, 
  Sun, Moon, Loader2, CreditCard, Lock, CheckCircle2
} from 'lucide-react';
import { useThemeStore } from '../../store/useStore';
import api from '../../api';
import { AcceptHostedModal } from '../../components/AcceptHostedModal';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { theme, toggleTheme } = useThemeStore();

  const { data: dbPlans = [] } = useQuery({
    queryKey: ['public-plans-landing'],
    queryFn: () => api.plans.getPublic(),
  });

  const standardCardFeatures = [
    'PROPERTY MANAGEMENT',
    'TENANT MANAGEMENT',
    'RENT & PAYMENTS',
    'MAINTENANCE MANAGEMENT',
    'VENDOR MANAGEMENT',
    'COMMUNICATION',
    'PAYMENTS MADE EASY',
  ];

  const defaultPlans = [
    { 
      name: '14-Day Free Trial', 
      price: 0, 
      billingCycle: '14 Days Free',
      badge: 'Free Trial',
      popular: false,
      desc: 'Full 14-day access for property managers to evaluate platform capabilities.',
      features: standardCardFeatures
    },
    { 
      name: 'Monthly Plan', 
      price: 15, 
      billingCycle: 'Monthly',
      badge: 'Most Popular',
      popular: true,
      desc: 'Complete property management solution billed flexibly month-to-month.',
      features: standardCardFeatures
    },
    { 
      name: 'Yearly Plan', 
      price: 120, 
      billingCycle: 'Annual ($10/mo)',
      badge: 'Best Value',
      popular: false,
      desc: 'Save 33% with annual billing ($10/month billed annually at $120).',
      features: standardCardFeatures
    },
  ];

  const displayPlans = dbPlans.length > 0
    ? dbPlans.map((p: any) => {
        const isMonthly = p.name.toLowerCase().includes('monthly');
        const isYearly = p.name.toLowerCase().includes('yearly') || p.name.toLowerCase().includes('annual');
        return {
          name: p.name,
          price: p.price,
          billingCycle: p.billingCycle || (isYearly ? 'Annual ($10/mo)' : isMonthly ? 'Monthly' : '14 Days Free'),
          badge: isMonthly ? 'Most Popular' : (isYearly ? 'Best Value' : 'Free Trial'),
          popular: isMonthly,
          desc: p.features || 'Unlimited Properties & Units with full platform access.',
          features: standardCardFeatures
        };
      })
    : defaultPlans;

  const [activeCardIndex, setActiveCardIndex] = useState<number>(1);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{name: string, price: number} | null>(null);

  const [checkoutStep, setCheckoutStep] = useState<'form' | 'loading' | 'success'>('form');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  const handleCloseModal = () => {
    setSelectedCheckoutPlan(null);
    setCompanyName('');
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setFormError('');
    setCheckoutStep('form');
  };

  // Authorize.Net Accept Hosted Modal States
  const [isHostedModalOpen, setIsHostedModalOpen] = useState(false);
  const [hostedToken, setHostedToken] = useState('');
  const [hostedUrl, setHostedUrl] = useState('');

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCheckoutStep('loading');
    try {
      if (selectedCheckoutPlan?.price === 0 || selectedCheckoutPlan?.name?.toLowerCase().includes('trial') || selectedCheckoutPlan?.name?.toLowerCase().includes('free')) {
        // Direct registration for Free Trial ($0)
        await api.auth.register({
          name: companyName,
          contactName: fullName,
          email,
          phone,
          password,
          planName: selectedCheckoutPlan?.name || '14-Day Free Trial',
          price: 0,
        });
        setCheckoutStep('success');
        setTimeout(() => {
          setSelectedCheckoutPlan(null);
          setCheckoutStep('form');
          setFullName('');
          setCompanyName('');
          setEmail('');
          setPassword('');
          setPhone('');
          navigate('/login');
        }, 1500);
        return;
      }

      // 1. Request Hosted Token from Backend for Paid Plans
      const hostedData = await api.auth.createHostedPayment({
        amount: selectedCheckoutPlan?.price || 15,
        planName: `${selectedCheckoutPlan?.name} Plan`,
        description: `SaaS Plan Subscription (${selectedCheckoutPlan?.name}) for ${companyName}`,
        email: email.trim(),
      });

      if (hostedData && hostedData.token) {
        setHostedToken(hostedData.token);
        if (hostedData.hostedUrl) setHostedUrl(hostedData.hostedUrl);
        setCheckoutStep('form');
        setIsHostedModalOpen(true);
      } else {
        throw new Error('Failed to obtain Authorize.Net hosted payment token.');
      }
    } catch (err: any) {
      setCheckoutStep('form');
      setFormError(err.message || 'Payment initiation failed. Please try again.');
    }
  };

  const handleHostedSuccess = async (txData: { transactionId: string }) => {
    setIsHostedModalOpen(false);
    setCheckoutStep('loading');
    try {
      // 2. Complete Account Registration & Activation ONLY after successful payment
      await api.auth.register({
        name: companyName,
        contactName: fullName,
        email,
        phone,
        password,
        planName: `${selectedCheckoutPlan?.name} Plan`,
        price: selectedCheckoutPlan?.price || 15,
        transactionId: txData.transactionId,
      });
      setCheckoutStep('success');
      setTimeout(() => {
        setSelectedCheckoutPlan(null);
        setCheckoutStep('form');
        setFullName('');
        setCompanyName('');
        setEmail('');
        setPassword('');
        setPhone('');
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setCheckoutStep('form');
      setFormError('Account registration failed post-payment. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef7ff] via-[#e5f2fe] to-[#dcf0ff] text-[#0f172a] flex flex-col justify-between font-sans selection:bg-[#0066ff]/20 selection:text-[#0066ff]">
      
      {/* --- HEADER NAVBAR WITH DARK FOOTER COLOR & EXACT LOGO --- */}
      <header className="sticky top-0 z-40 bg-[#090814] border-b border-white/10 transition-colors shadow-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* WhatsLandlord Logo from Screenshot */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <svg viewBox="0 0 540 180" className="h-10 md:h-12 w-auto fill-white">
              {/* Left emblem: House roof + buildings + W base */}
              <path d="M 60 90 L 100 55 L 140 90 L 140 108 L 100 73 L 60 108 Z" />
              <rect x="75" y="36" width="22" height="38" rx="1" />
              <rect x="80" y="43" width="4" height="4" fill="#090814" />
              <rect x="88" y="43" width="4" height="4" fill="#090814" />
              <rect x="80" y="51" width="4" height="4" fill="#090814" />
              <rect x="88" y="51" width="4" height="4" fill="#090814" />
              <rect x="92" y="85" width="6" height="6" fill="#090814" />
              <rect x="102" y="85" width="6" height="6" fill="#090814" />
              <rect x="92" y="95" width="6" height="6" fill="#090814" />
              <rect x="102" y="95" width="6" height="6" fill="#090814" />
              <rect x="110" y="46" width="16" height="35" rx="1" />
              <rect x="130" y="68" width="14" height="40" rx="1" />
              <path d="M 45 56 L 58 56 L 58 100 L 80 135 L 100 115 L 120 135 L 142 100 L 142 70 L 155 70 L 155 105 L 120 158 L 100 138 L 80 158 L 45 105 Z" />
              {/* Text "WhatsLandlord" */}
              <text x="175" y="110" fontFamily="sans-serif" fontWeight="900" fontSize="56" fill="#ffffff" letterSpacing="-1">
                Whats<tspan fontWeight="900" fill="#ffffff">Landlord</tspan>
              </text>
              {/* Subtext underline line & PROPERTY MANAGEMENT PLATFORM */}
              <line x1="175" y1="135" x2="215" y2="135" stroke="#ffffff" strokeWidth="2.5" />
              <text x="225" y="139" fontFamily="sans-serif" fontWeight="700" fontSize="15" fill="#ffffff" letterSpacing="3.5">
                PROPERTY MANAGEMENT PLATFORM
              </text>
              <line x1="480" y1="135" x2="520" y2="135" stroke="#ffffff" strokeWidth="2.5" />
            </svg>
          </div>

          {/* Right Side Action (Theme Toggle Removed) */}
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/login')}
              className="font-extrabold text-xs px-6 py-2.5 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-lg shadow-[#0066ff]/25 border-none uppercase tracking-wider"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* --- MAIN HERO & PRICING CARDS SECTION --- */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 space-y-12 w-full flex flex-col justify-center items-center">
        
        {/* Header Text */}
        <div className="text-center max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0066ff]/10 border border-[#0066ff]/20 text-[#0066ff] text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Simple Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0f172a]">
            Subscription Pricing Plans
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
            Configure subscription plans, manage pricing structures, and create new offers for subscriber companies. Unlimited properties & units across all plans.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl pt-4">
          {displayPlans.map((plan, idx) => {
            const isSelected = activeCardIndex === idx;
            return (
              <div 
                key={idx}
                onClick={() => setActiveCardIndex(idx)}
                className={`relative rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'bg-white border-[#0066ff] ring-4 ring-[#0066ff]/20 shadow-2xl shadow-[#0066ff]/15 scale-105 z-10' 
                    : 'bg-white/90 border-[#d2e4f7] hover:border-[#0066ff]/40 hover:shadow-xl hover:scale-[1.02] shadow-md'
                }`}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transition-all">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md transition-colors ${
                    isSelected
                      ? 'bg-[#0066ff] text-white shadow-[#0066ff]/30'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="space-y-2 border-b border-[#e2e8f0] pb-6">
                    <h3 className="text-xl font-black text-[#0f172a] pt-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 text-[#0f172a] pt-2">
                      <span className="text-4xl font-black tracking-tight">
                        ${plan.price === 120 ? '10' : plan.price}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        {plan.price === 0 ? '/ 14 days free' : (plan.price === 120 ? '/ month ($120/yr)' : '/ month')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      INCLUDED FEATURES:
                    </span>
                    <ul className="space-y-3 text-xs font-semibold text-slate-700">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isSelected ? 'text-[#0066ff]' : 'text-slate-400'}`} />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCardIndex(idx);
                      setSelectedCheckoutPlan({ name: plan.name, price: plan.price });
                    }}
                    className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition border-none ${
                      isSelected 
                        ? 'bg-[#0066ff] text-white hover:bg-[#0052cc] shadow-lg shadow-[#0066ff]/25' 
                        : 'bg-slate-900 text-white hover:bg-[#0066ff]'
                    }`}
                  >
                    {plan.price === 0 ? 'Start Free Trial' : `Select ${plan.name}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* --- CHECKOUT / REGISTRATION MODAL --- */}
      {selectedCheckoutPlan && (
        <div 
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#d2e4f7] rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl relative text-[#0f172a]"
          >
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition hover:bg-slate-200"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0066ff] bg-[#0066ff]/10 px-2.5 py-1 rounded border border-[#0066ff]/20">
                Selected: {selectedCheckoutPlan.name} (${selectedCheckoutPlan.price})
              </span>
              <h3 className="text-xl font-extrabold text-[#0f172a] pt-2">Create Your Account</h3>
              <p className="text-xs text-slate-500 font-medium">Register your property management company to get started.</p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
                {formError}
              </div>
            )}

            {checkoutStep === 'success' ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-extrabold text-lg text-[#0f172a]">Registration Successful!</h4>
                <p className="text-xs text-slate-500 font-medium">Redirecting to login portal...</p>
              </div>
            ) : checkoutStep === 'loading' ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0066ff] mx-auto" />
                <p className="text-xs font-bold text-slate-500">Processing registration & payment token...</p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Company Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="E.g. Apex Property Management" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2e4f7] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#0066ff]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Full Contact Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="E.g. Divine User" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2e4f7] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#0066ff]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="manager@company.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2e4f7] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#0066ff]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2e4f7] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#0066ff] hover:bg-[#0052cc] text-white border-none shadow-md shadow-[#0066ff]/20">
                    {selectedCheckoutPlan.price === 0 ? 'Complete Registration' : `Proceed to Pay $${selectedCheckoutPlan.price}`}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Authorize.Net Accept Hosted Iframe Modal */}
      <AcceptHostedModal
        isOpen={isHostedModalOpen}
        onClose={() => setIsHostedModalOpen(false)}
        token={hostedToken}
        hostedUrl={hostedUrl}
        planName={selectedCheckoutPlan?.name || 'SaaS Subscription'}
        amount={selectedCheckoutPlan?.price || 15}
        onSuccess={handleHostedSuccess}
        onCancel={() => setIsHostedModalOpen(false)}
        onFailure={(err) => setFormError(err)}
      />

      {/* --- EXACT MATCH FOOTER FROM USER SCREENSHOT (ZERO CLICKABLE LINKS) --- */}
      <footer className="bg-[#090814] text-slate-300 pt-16 pb-12 border-t border-white/5 font-sans">
        <div className="max-w-7xl mx-auto px-8 space-y-12">
          
          {/* Top 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
            
            {/* Column 1: Platform Description */}
            <div className="space-y-4 md:pr-4">
              <p className="text-slate-400 text-xs leading-relaxed font-normal">
                A smarter property management platform that helps owners, property managers, tenants, and property teams manage operations from one centralized system.
              </p>
            </div>

            {/* Column 2: Our Company */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-white text-base tracking-tight">Our Company</h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li><span className="cursor-default">About Us</span></li>
                <li><span className="cursor-default">Features</span></li>
                <li><span className="cursor-default">Testimonials</span></li>
                <li><span className="cursor-default">Contact</span></li>
              </ul>
            </div>

            {/* Column 3: Get In Touch */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-white text-base tracking-tight">Get In Touch</h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li><span className="cursor-default">Linkedin</span></li>
                <li><span className="cursor-default">Facebook</span></li>
                <li><span className="cursor-default">Yelp</span></li>
                <li><span className="cursor-default">Houzz</span></li>
              </ul>
            </div>

            {/* Column 4: Contact Info */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-white text-base tracking-tight">Contact Info</h4>
              <div className="space-y-2.5 text-xs text-slate-400 font-medium leading-relaxed">
                <p>123 Fifth Avenue, Lane no 17, New York NY 688101.</p>
                <p>123-456-7890/91</p>
                <p><span className="cursor-default">contact@example.com</span></p>
              </div>
            </div>

          </div>

          {/* Bottom Divider Bar & Copyright */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 font-normal gap-4">
            <div>
              Copyright © 2026 whatslandlord
            </div>
            <div>
              Powered by whatslandlord
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
