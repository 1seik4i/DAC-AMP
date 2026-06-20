import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckSquare, 
  Square,
  ShieldAlert,
  Loader
} from 'lucide-react';
import { UserState } from '../types';
import { audioEngine } from '../audio';

interface AuthViewProps {
  onSuccess: (user: UserState) => void;
  onClose: () => void;
}

export default function AuthView({ onSuccess, onClose }: AuthViewProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane@example.com');
  const [password, setPassword] = useState('••••••••');
  const [confirmPassword, setConfirmPassword] = useState('••••••••');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock verification timers
    setTimeout(() => {
      setLoading(false);
      // Trigger sweep play
      audioEngine.playTest('vocal', [1, 2, 4, 3, 2, 1, 0, 0, 0, 0]);
      onSuccess({
        fullName: authMode === 'register' ? fullName : (email.split('@')[0] || 'User'),
        email,
        isLoggedIn: true
      });
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 select-none bg-[#0a0a0a]/80 backdrop-blur-md animate-fade-in">
      
      {/* Background Ambient Glow circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="w-[600px] h-[600px] bg-[#adc6ff]/5 rounded-full blur-[100px] absolute top-1/4 left-1/4 translate-x-1/4" />
        <div className="w-[500px] h-[500px] bg-[#e9b3ff]/5 rounded-full blur-[100px] absolute bottom-1/4 right-1/4 -translate-y-1/4" />
      </div>

      {/* Main Form container modal */}
      <div className="w-full max-w-md bg-[#121212] border border-white/[0.08] p-8 md:p-10 rounded-3xl relative z-10 premium-shadow">
        
        {/* Back / Close button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#8b90a0] hover:text-[#e5e2e1] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        {/* Brand header */}
        <div className="text-center mb-10">
          <h1 className="font-sans font-bold text-3xl text-[#adc6ff] tracking-tight leading-none">DAC Studio</h1>
          <p className="text-xs text-[#c1c6d7] opacity-60 uppercase tracking-widest mt-2">
            {authMode === 'register' ? 'Register Premium Account' : 'Pro Audio Interface Login'}
          </p>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] focus-within:border-[#adc6ff] overflow-hidden transition-all duration-200">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b90a0]">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full h-12 bg-transparent border-none pl-12 pr-4 text-sm text-white focus:outline-none placeholder:text-white/20"
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] focus-within:border-[#adc6ff] overflow-hidden transition-all duration-200">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b90a0]">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full h-12 bg-transparent border-none pl-12 pr-4 text-sm text-white focus:outline-none placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider">Password</label>
              {authMode === 'login' && (
                <span className="text-[10px] text-[#adc6ff] hover:underline cursor-pointer">Forgot Password?</span>
              )}
            </div>
            <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] focus-within:border-[#adc6ff] overflow-hidden transition-all duration-200">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b90a0]">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 bg-transparent border-none pl-12 pr-4 text-sm text-white focus:outline-none placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Confirm Password (only register) */}
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] focus-within:border-[#adc6ff] overflow-hidden transition-all duration-200">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b90a0]">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 bg-transparent border-none pl-12 pr-4 text-sm text-white focus:outline-none placeholder:text-white/20"
                />
              </div>
            </div>
          )}

          {/* Agreements toggles */}
          {authMode === 'register' ? (
            <div 
              onClick={() => setAgreeTerms(!agreeTerms)}
              className="flex items-start gap-3 mt-4 cursor-pointer select-none"
            >
              {agreeTerms ? (
                <CheckSquare className="w-4 h-4 mt-0.5 text-[#adc6ff] shrink-0" />
              ) : (
                <Square className="w-4 h-4 mt-0.5 text-white/20 shrink-0" />
              )}
              <span className="text-xs text-[#c1c6d7] opacity-80 leading-normal">
                I agree to the <span className="text-[#adc6ff] hover:underline">Terms of Service</span> and <span className="text-[#adc6ff] hover:underline">Privacy Policy</span>
              </span>
            </div>
          ) : (
            <div 
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-3 mt-4 cursor-pointer select-none"
            >
              {rememberMe ? (
                <CheckSquare className="w-4 h-4 text-[#adc6ff] shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-white/20 shrink-0" />
              )}
              <span className="text-xs text-[#c1c6d7] opacity-80">Remember me on this browser context</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading || (authMode === 'register' && !agreeTerms)}
            className="w-full h-12 bg-[#adc6ff] hover:bg-[#adc6ff]/90 disabled:opacity-40 disabled:pointer-events-none text-[#002e69] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 mt-8 shadow-lg shadow-[#adc6ff]/10"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {authMode === 'register' ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Change auth type */}
        <div className="mt-8 text-center pt-6 border-t border-white/[0.04]">
          {authMode === 'register' ? (
            <p className="text-xs text-[#c1c6d7] opacity-80">
              Already have an account?{' '}
              <button 
                onClick={() => setAuthMode('login')}
                className="text-[#adc6ff] font-bold hover:underline transition-all"
              >
                Log In
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#c1c6d7] opacity-80">
              Don't have an account?{' '}
              <button 
                onClick={() => setAuthMode('register')}
                className="text-[#adc6ff] font-bold hover:underline transition-all"
              >
                Request Access
              </button>
            </p>
          )}

          {/* Close option for accessibility */}
          <button 
            onClick={onClose}
            className="text-[10px] text-[#8b90a0] hover:text-[#e5e2e1] uppercase tracking-widest mt-6 font-semibold opacity-60 hover:opacity-100 transition-opacity"
          >
            Skip for now / Return
          </button>
        </div>

      </div>
    </div>
  );
}
