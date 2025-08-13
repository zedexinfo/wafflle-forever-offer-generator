'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Mail, Phone, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Offer {
  id: number;
  title: string;
  description: string;
  type: 'win' | 'lose';
  emoji: string;
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
  const [cooldownHours, setCooldownHours] = useState(0);

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
        if (data.cooldownActive && data.hoursLeft) {
          setCooldownHours(data.hoursLeft);
          setStep('result');
        }
        setError(data.error || 'Failed to send OTP');
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
        if (data.hoursLeft) {
          setCooldownHours(data.hoursLeft);
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
        setStep('result');
      } else {
        if (data.hoursLeft) {
          setCooldownHours(data.hoursLeft);
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
    setCooldownHours(0);
  };

  return (
    <div className="min-h-screen food-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-orange-600 mb-2">
            🧇 Waffle Forever
          </h1>
          <p className="text-orange-700 text-lg">
            Spin for Amazing Offers!
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-orange-200"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
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
                  <Gift className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-orange-800 mb-2">
                    Get Your Free Offer!
                  </h2>
                  <p className="text-orange-600">
                    Enter your contact details to get started
                  </p>
                </div>

                {/* Contact Method Toggle */}
                <div className="flex bg-orange-100 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setContactMethod('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all ${
                      contactMethod === 'email'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-orange-600 hover:bg-orange-200'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod('phone')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all ${
                      contactMethod === 'phone'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-orange-600 hover:bg-orange-200'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    Phone
                  </button>
                </div>

                {/* Contact Input */}
                <div>
                  <input
                    type={contactMethod === 'email' ? 'email' : 'tel'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={
                      contactMethod === 'email'
                        ? 'Enter your email'
                        : 'Enter your phone number'
                    }
                    className="w-full p-4 rounded-2xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none text-lg"
                    disabled={isLoading}
                  />
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

                <button
                  onClick={sendOTP}
                  disabled={isLoading || !contact.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </motion.div>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Mail className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-orange-800 mb-2">
                    Verify Your {contactMethod === 'email' ? 'Email' : 'Phone'}
                  </h2>
                  <p className="text-orange-600">
                    Enter the 6-digit code sent to {contact}
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full p-4 rounded-2xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none text-lg text-center tracking-widest"
                    maxLength={6}
                    disabled={isLoading}
                  />
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
                  <button
                    onClick={verifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>

                  <button
                    onClick={() => setStep('contact')}
                    className="w-full text-orange-600 py-2 hover:bg-orange-50 rounded-xl transition-all"
                  >
                    Change Contact Details
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
                className="text-center space-y-8"
              >
                <div>
                  <motion.div
                    className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-6xl"
                    animate={isSpinning ? { rotate: 360 } : {}}
                    transition={{ 
                      duration: isSpinning ? 0.5 : 0, 
                      repeat: isSpinning ? Infinity : 0, 
                      ease: "linear" 
                    }}
                  >
                    🎁
                  </motion.div>
                  <h2 className="text-3xl font-bold text-orange-800 mb-2">
                    {isSpinning ? 'Spinning...' : 'Ready to Spin?'}
                  </h2>
                  <p className="text-orange-600 text-lg">
                    {isSpinning ? 'Finding your perfect offer!' : 'Click to discover your offer!'}
                  </p>
                </div>

                {!isSpinning && (
                  <motion.button
                    onClick={generateOffer}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 rounded-3xl font-bold text-xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎰 SPIN FOR OFFER
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
                      <p className="text-gray-600 text-lg mb-6">
                        {offer.description}
                      </p>

                      {offer.type === 'win' ? (
                        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-green-700 font-semibold">
                            Congratulations! Show this to our staff to claim your offer!
                          </p>
                        </div>
                      ) : (
                        <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                          <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                          <p className="text-orange-700 font-semibold">
                            Come back tomorrow for another chance!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </>
                ) : (
                  <>
                    {cooldownHours > 0 ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="space-y-4"
                      >
                        <Clock className="w-16 h-16 text-orange-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-orange-800">
                          Come Back Later!
                        </h2>
                        <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                          <p className="text-orange-700 font-semibold">
                            You&apos;ve already claimed an offer today!
                          </p>
                          <p className="text-orange-600">
                            Please wait {cooldownHours} more hours before generating another offer.
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="space-y-4"
                      >
                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-red-800">
                          Oops! Something went wrong
                        </h2>
                        {error && (
                          <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                            <p className="text-red-700">{error}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </>
                )}

                <button
                  onClick={resetApp}
                  className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-gray-500 hover:to-gray-600 transition-all transform hover:scale-105 active:scale-95"
                >
                  Try Again Tomorrow
                </button>
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