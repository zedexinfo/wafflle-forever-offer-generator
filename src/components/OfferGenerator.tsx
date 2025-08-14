'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Mail, Phone, Loader2, CheckCircle, XCircle, Clock, Crown } from 'lucide-react';
import WaffleLogo from './WaffleLogo';
import { getOTPConfig, isOTPConfigValid } from '@/lib/otp-config';

interface Offer {
  id: number;
  title: string;
  description: string;
  type: 'win' | 'lose';
  emoji: string;
  generatedAt?: number;
  generatedAtUTC?: string;
  contact?: string;
  uniqueId?: string;
  nextAvailableAt?: number;
  nextAvailableAtUTC?: string;
  consumed?: boolean;
  consumedAt?: string;
  consumedBy?: string;
}

interface CooldownInfo {
  remainingMs: number;
  nextAvailableAt: number;
  nextAvailableAtUTC: string;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  display: string;
}

export default function OfferGenerator() {
  const [step, setStep] = useState<'contact' | 'otp' | 'spin' | 'result'>('contact');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [cooldownInfo, setCooldownInfo] = useState<CooldownInfo | null>(null);
  const [countdownDisplay, setCountdownDisplay] = useState('');
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  // Helper function to format dates in local time
  const formatLocalTime = (dateInput: string | number): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
    return date.toLocaleString(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get OTP configuration from environment
  const otpConfig = getOTPConfig();

  // Set default contact method based on configuration
  useEffect(() => {
    if (isOTPConfigValid(otpConfig)) {
      // Set the default method based on what's enabled and the preference
      if (otpConfig.enableEmail && otpConfig.defaultMethod === 'email') {
        setContactMethod('email');
      } else if (otpConfig.enablePhone && otpConfig.defaultMethod === 'phone') {
        setContactMethod('phone');
      } else if (otpConfig.enableEmail) {
        setContactMethod('email');
      } else if (otpConfig.enablePhone) {
        setContactMethod('phone');
      }
    }
  }, [otpConfig]);

  // Countdown timer effect
  useEffect(() => {
    if (!cooldownInfo) return;

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, cooldownInfo.nextAvailableAt - now);
      
      if (remaining <= 0) {
        setIsCountdownActive(false);
        setCountdownDisplay('');
        setCooldownInfo(null);
        return;
      }

      setIsCountdownActive(true);
      const totalSeconds = Math.floor(remaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      let display = '';
      if (hours > 0) {
        display = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        display = `${minutes}m ${seconds}s`;
      } else {
        display = `${seconds}s`;
      }

      setCountdownDisplay(display);
    };

    // Update immediately
    updateCountdown();
    
    // Then update every second
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [cooldownInfo]);

  const sendOTP = async () => {
    if (!contact.trim()) {
      setError(`Please enter a valid ${contactMethod}`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim(), method: contactMethod })
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        // For development - show OTP in console
        if (data.otp) {
          console.log('OTP:', data.otp);
        }
      } else {
        if (data.cooldownActive && data.cooldownInfo && data.existingOffer) {
          setCooldownInfo(data.cooldownInfo);
          setOffer(data.existingOffer);
          setStep('result');
        } else {
          setError(data.error || 'Failed to send OTP');
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim(), otp: otp.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setStep('spin');
      } else {
        if (data.cooldownInfo && data.existingOffer) {
          setCooldownInfo(data.cooldownInfo);
          setOffer(data.existingOffer);
          setStep('result');
        }
        setError(data.error || 'Invalid OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateOffer = async () => {
    setIsSpinning(true);
    setError('');

    // Add delay for spinning animation
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const response = await fetch('/api/generate-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setOffer(data.offer);
        setCooldownInfo(null); // Clear any existing cooldown info for new offers
        setStep('result');
      } else {
        if (data.cooldownInfo && data.existingOffer) {
          setCooldownInfo(data.cooldownInfo);
          setOffer(data.existingOffer);
        }
        setError(data.error || 'Failed to generate offer');
        setStep('result');
      }
    } catch {
      setError('Network error. Please try again.');
      setStep('result');
    } finally {
      setIsSpinning(false);
    }
  };

  const resetApp = () => {
    setStep('contact');
    setContact('');
    setOtp('');
    setOffer(null);
    setError('');
    setCooldownInfo(null);
    setCountdownDisplay('');
    setIsCountdownActive(false);
    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen royal-bg flex items-center justify-center p-4 py-8 md:py-4">
      {/* Floating Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => {
          const foodEmojis = ['👑', '✨', '🧇', '🥞', '🥤', '☕', '🍯', '🧈'];
          const emoji = foodEmojis[i % foodEmojis.length];
          
          return (
            <motion.div
              key={i}
              className="absolute text-3xl md:text-4xl opacity-20"
              initial={{
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 800,
                y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 600,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 360],
                opacity: [0.1, 0.3, 0.1],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 6 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 1.2,
              }}
            >
              {emoji}
            </motion.div>
          );
        })}
      </div>

      <div className="w-full max-w-md mx-auto relative z-10 flex flex-col min-h-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-4"
        >
          <WaffleLogo size="medium" className="md:scale-75" />
          <motion.p 
            className="text-amber-700 text-lg mt-2 md:mt-1 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Crown className="w-5 h-5 inline mr-2 text-yellow-500" />
            Your Royal Offer Awaits!
            <Crown className="w-5 h-5 inline ml-2 text-yellow-500" />
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-gradient-to-r from-yellow-200 via-amber-200 to-yellow-200 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Royal Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" 
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 }}
            />
          </div>
          <AnimatePresence mode="wait">
            {/* Contact Step */}
            {step === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Gift className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-amber-800 mb-2">
                    Claim Your Royal Offer!
                  </h2>
                  <p className="text-amber-600">
                    Enter your royal details to begin your quest
                  </p>
                </div>

                {/* Contact Method Toggle - Only show if multiple methods are enabled */}
                {(otpConfig.enableEmail && otpConfig.enablePhone) && (
                  <div className="flex bg-gradient-to-r from-yellow-100 via-amber-50 to-yellow-100 rounded-full p-1 shadow-inner">
                    {otpConfig.enableEmail && (
                      <button
                        type="button"
                        onClick={() => setContactMethod('email')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all transform hover:scale-105 ${
                          contactMethod === 'email'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg scale-105'
                            : 'text-amber-600 hover:bg-amber-100'
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        Royal Email
                      </button>
                    )}
                    {otpConfig.enablePhone && (
                      <button
                        type="button"
                        onClick={() => setContactMethod('phone')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all transform hover:scale-105 ${
                          contactMethod === 'phone'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg scale-105'
                            : 'text-amber-600 hover:bg-amber-100'
                        }`}
                      >
                        <Phone className="w-4 h-4" />
                        Royal Phone
                      </button>
                    )}
                  </div>
                )}

                {/* Contact Input */}
                <div className="relative">
                  <input
                    type={contactMethod === 'email' ? 'email' : 'tel'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={
                      contactMethod === 'email'
                        ? 'Enter your royal email address'
                        : 'Enter your royal phone number'
                    }
                    className="w-full p-4 rounded-2xl border-2 border-amber-200 focus:border-yellow-500 focus:outline-none text-lg bg-gradient-to-r from-yellow-50 to-amber-50 placeholder-amber-400"
                    disabled={isLoading}
                  />
                  {/* Crown decoration */}
                  <Crown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500 opacity-50" />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  onClick={sendOTP}
                  disabled={isLoading || !contact.trim()}
                  className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-xl relative overflow-hidden"
                  whileHover={{ 
                    boxShadow: "0 0 30px rgba(245, 158, 11, 0.5)",
                    scale: 1.05 
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Button glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Summoning Royal Code...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="w-5 h-5" />
                      Send Royal Code
                      <Crown className="w-5 h-5" />
                    </div>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-6 relative"
              >
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Mail className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-amber-800 mb-2">
                    Royal Code Verification
                  </h2>
                  <p className="text-amber-600">
                    Enter the sacred 6-digit code sent to your royal {contactMethod === 'email' ? 'email' : 'phone'}
                  </p>
                  <p className="text-sm text-amber-500 mt-2 font-medium">
                    {contact}
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="● ● ● ● ● ●"
                    className="w-full p-4 rounded-2xl border-2 border-amber-200 focus:border-yellow-500 focus:outline-none text-2xl text-center tracking-widest font-mono bg-gradient-to-r from-yellow-50 to-amber-50 font-bold text-amber-800 placeholder-amber-300 shadow-inner"
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-200 to-amber-200 opacity-20 pointer-events-none" />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-3">
                  <motion.button
                    onClick={verifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-xl relative overflow-hidden"
                    whileHover={{ 
                      boxShadow: "0 0 30px rgba(245, 158, 11, 0.5)",
                      scale: 1.05 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Button glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Verifying Royal Code...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Crown className="w-5 h-5" />
                        Enter the Royal Court
                        <Crown className="w-5 h-5" />
                      </div>
                    )}
                  </motion.button>

                  <button
                    onClick={() => setStep('contact')}
                    className="w-full text-amber-600 py-2 hover:bg-amber-50 rounded-xl transition-all font-medium"
                  >
                    ← Change Royal Details
                  </button>
                </div>
              </motion.div>
            )}

            {/* Spinning Step */}
            {step === 'spin' && (
              <motion.div
                key="spin"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center space-y-8 relative"
              >
                {/* Floating Food Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(6)].map((_, i) => {
                    const foodEmojis = ['🧇', '🥞', '☕', '🥤', '🍯', '🧈'];
                    return (
                      <motion.div
                        key={i}
                        className="absolute text-xl md:text-2xl opacity-20"
                        initial={{
                          x: Math.random() * 300,
                          y: Math.random() * 300,
                        }}
                        animate={{
                          y: [0, -25, 0],
                          x: [0, 10, -10, 0],
                          rotate: [0, 360],
                          scale: [1, 1.3, 1],
                          opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                          duration: 4 + i * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.7,
                        }}
                      >
                        {foodEmojis[i]}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="relative z-10">
                  <motion.div
                    className="w-40 h-40 mx-auto mb-6 relative"
                    animate={isSpinning ? { rotate: 360 } : {}}
                    transition={{ 
                      duration: isSpinning ? 0.3 : 0, 
                      repeat: isSpinning ? Infinity : 0, 
                      ease: "linear" 
                    }}
                  >
                    {/* Outer Ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 p-2"
                      animate={{
                        background: isSpinning 
                          ? ["linear-gradient(0deg, #fbbf24, #f59e0b, #d97706)", 
                             "linear-gradient(120deg, #fbbf24, #f59e0b, #d97706)",
                             "linear-gradient(240deg, #fbbf24, #f59e0b, #d97706)",
                             "linear-gradient(360deg, #fbbf24, #f59e0b, #d97706)"]
                          : "linear-gradient(0deg, #fbbf24, #f59e0b, #d97706)"
                      }}
                      transition={{
                        duration: isSpinning ? 1 : 0,
                        repeat: isSpinning ? Infinity : 0,
                        ease: "linear"
                      }}
                    />
                    
                    {/* Inner Circle */}
                    <motion.div
                      className="absolute inset-2 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-xl"
                      animate={isSpinning ? {
                        boxShadow: [
                          "0 0 30px rgba(239, 68, 68, 0.5)",
                          "0 0 60px rgba(245, 158, 11, 0.7)",
                          "0 0 30px rgba(239, 68, 68, 0.5)"
                        ]
                      } : {}}
                      transition={{
                        duration: 1,
                        repeat: isSpinning ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    >
                      <motion.div
                        className="text-6xl"
                        animate={isSpinning ? {
                          scale: [1, 1.2, 1],
                        } : {}}
                        transition={{
                          duration: 0.5,
                          repeat: isSpinning ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                      >
                        🎁
                      </motion.div>
                    </motion.div>

                    {/* Sparkle Effects */}
                    {isSpinning && (
                      <>
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                            style={{
                              top: '50%',
                              left: '50%',
                              transformOrigin: '0 0',
                            }}
                            animate={{
                              rotate: [0, 360],
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.125,
                              ease: "easeOut"
                            }}
                            initial={{
                              transform: `rotate(${i * 45}deg) translateX(80px)`
                            }}
                          />
                        ))}
                      </>
                    )}
                  </motion.div>

                  <motion.h2 
                    className="text-3xl font-bold text-amber-800 mb-2"
                    animate={isSpinning ? {
                      scale: [1, 1.05, 1],
                      color: ["#92400e", "#f59e0b", "#92400e"]
                    } : {}}
                    transition={{
                      duration: 1,
                      repeat: isSpinning ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    {isSpinning ? '🔮 Royal Magic at Work...' : '👑 Ready for Your Royal Offer?'}
                  </motion.h2>
                  
                  <motion.p 
                    className="text-amber-600 text-lg font-medium"
                    animate={isSpinning ? {
                      opacity: [1, 0.7, 1]
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: isSpinning ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    {isSpinning ? 'The royal advisors are selecting your perfect reward!' : 'Click the royal button to discover your destiny!'}
                  </motion.p>
                </div>

                {!isSpinning && (
                  <motion.button
                    onClick={generateOffer}
                    className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-white py-6 rounded-3xl font-bold text-xl hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-600 transition-all transform hover:scale-105 active:scale-95 shadow-2xl relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 40px rgba(245, 158, 11, 0.6)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Enhanced Button Glow Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <div className="flex items-center justify-center gap-3">
                      <Crown className="w-6 h-6" />
                      <span>🎰 CLAIM ROYAL OFFER 🎰</span>
                      <Crown className="w-6 h-6" />
                    </div>
                  </motion.button>
                )}

                {isSpinning && (
                  <div className="text-orange-500 text-lg font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generating your offer...
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Result Step */}
            {step === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-center space-y-6"
              >
                {offer ? (
                  <>
                    {/* Timestamp Banner */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-r from-amber-100 to-yellow-100 p-3 rounded-xl border border-amber-200 mb-4"
                    >
                      <div className="flex items-center justify-center gap-2 text-sm text-amber-700">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">
                          Generated: {offer.generatedAtUTC ? formatLocalTime(offer.generatedAtUTC) : formatLocalTime(offer.generatedAt || Date.now())}
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                      className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-6xl ${
                        offer.type === 'win' 
                          ? 'bg-gradient-to-r from-green-400 to-green-600' 
                          : 'bg-gradient-to-r from-orange-400 to-orange-600'
                      }`}
                    >
                      {offer.emoji}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h2 className={`text-2xl font-bold mb-2 ${
                        offer.type === 'win' ? 'text-green-800' : 'text-orange-800'
                      }`}>
                        {offer.title}
                      </h2>
                      <p className="text-gray-600 text-lg mb-4">
                        {offer.description}
                      </p>

                      {/* Anti-abuse information */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Generated for:</span>
                          <span className="font-semibold text-gray-700">{offer.contact || contact}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Generated at:</span>
                          <span className="font-semibold text-gray-700">
                            {offer.generatedAtUTC ? formatLocalTime(offer.generatedAtUTC) : formatLocalTime(offer.generatedAt || Date.now())}
                          </span>
                        </div>
                        {offer.uniqueId && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Verification ID:</span>
                            <span className="font-mono text-xs text-gray-600">
                              {offer.uniqueId.slice(-12)}
                            </span>
                          </div>
                        )}
                      </div>

                      {offer.type === 'win' ? (
                        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-green-700 font-semibold mb-2">
                            Congratulations! Show this screen to our staff to claim your offer!
                          </p>
                          <div className="text-xs text-green-600 space-y-1">
                            <p>⚠️ This offer expires at the end of today</p>
                            <p>🛡️ Staff will verify the generation details shown above</p>
                            <p>📱 Screenshots without verification may not be honored</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                          <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                          <p className="text-orange-700 font-semibold">
                            Come back tomorrow for another chance!
                          </p>
                        </div>
                      )}

                      {/* Consumption Status Display */}
                      {offer.type === 'win' && (
                        <div className={`p-3 rounded-xl border-2 mt-4 ${
                          offer.consumed 
                            ? 'bg-purple-50 border-purple-200' 
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                          <div className="flex items-center justify-center gap-2">
                            {offer.consumed ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-purple-600" />
                                <span className="text-purple-700 font-semibold">
                                  ✅ Offer Consumed - Thank you!
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-5 h-5 text-amber-600" />
                                <span className="text-amber-700 font-semibold">
                                  🎁 Ready to Claim - Show to Staff
                                </span>
                              </>
                            )}
                          </div>
                          {/* Show consumption details if consumed */}
                          {offer.consumed && offer.consumedBy && (
                            <div className="text-xs text-purple-600 text-center mt-2">
                              Processed by: {offer.consumedBy}
                              {offer.consumedAt && (
                                <div className="mt-1">
                                  on {formatLocalTime(offer.consumedAt)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show countdown timer if user is in cooldown */}
                      {isCountdownActive && (
                        <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 mt-4">
                          <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-blue-700 font-semibold mb-2">
                            Next spin available in:
                          </p>
                          <div className="text-2xl font-bold text-blue-800 font-mono">
                            {countdownDisplay}
                          </div>
                          <p className="text-xs text-blue-600 mt-2">
                            Next available: {cooldownInfo?.nextAvailableAtUTC ? formatLocalTime(cooldownInfo.nextAvailableAtUTC) : 'Calculating...'}
                          </p>
                        </div>
                      )}

                      {/* Show spin button ONLY when cooldown has completely expired and it's the next day */}
                      {!isCountdownActive && !cooldownInfo && (
                        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200 mt-4">
                          <p className="text-green-700 font-semibold mb-4">
                            Ready for your daily spin!
                          </p>
                          <motion.button
                            onClick={generateOffer}
                            disabled={isSpinning}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all transform disabled:opacity-50"
                          >
                            {isSpinning ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Spinning...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Gift className="w-5 h-5" />
                                <span>Spin for New Offer!</span>
                                <Gift className="w-5 h-5" />
                              </div>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  </>
                ) : (
                  <>
                    {error && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="space-y-4"
                      >
                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-red-800">
                          Oops! Something went wrong
                        </h2>
                        <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                          <p className="text-red-700">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Only show Start Over button when cooldown is NOT active */}
                {!isCountdownActive && (
                  <button
                    onClick={resetApp}
                    className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-gray-500 hover:to-gray-600 transition-all transform hover:scale-105 active:scale-95"
                  >
                    Try Again
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-orange-600"
        >
          <p className="text-sm">
            🧇 Waffle Forever - Delicious offers every day! 🥞
          </p>
        </motion.div>
      </div>
    </div>
  );
}