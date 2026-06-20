import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Save, ArrowLeft, ShieldAlert } from 'lucide-react';
import { UserState } from '../types';

interface UserProfileViewProps {
  currentUser: UserState;
  updateUser: (data: Partial<UserState>) => void;
}

export default function UserProfileView({ currentUser, updateUser }: UserProfileViewProps) {
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveProfile = () => {
    updateUser({ phone });
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // In a real app we'd verify currentPassword here
    updateUser({ password: newPassword });
    setSuccess('Password changed successfully!');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="flex-1 animate-fade-in text-[#e5e2e1] max-w-4xl mx-auto">
      <section className="mb-8">
        <h2 className="font-sans font-bold text-3xl text-[#e5e2e1] leading-tight mb-1">Hi {currentUser.fullName}</h2>
        <p className="text-[#8b90a0] text-xs font-medium">Manage your personal information and security settings.</p>
      </section>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {success}
        </div>
      )}

      <div className="bg-[#121212]/90 border border-white/[0.08] p-6 md:p-8 rounded-3xl backdrop-blur-xl premium-shadow">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Avatar Area */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#adc6ff] to-[#e9b3ff] flex items-center justify-center text-[#131313] font-bold text-3xl uppercase shadow-lg">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-[#e5e2e1]">{currentUser.fullName}</h3>
            </div>
          </div>

          {/* Form Area */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Email (Read only) */}
            <div>
              <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b90a0]">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email"
                  readOnly
                  value={currentUser.email}
                  className="w-full h-12 bg-transparent border-none pl-12 pr-4 text-sm text-[#8b90a0] focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] focus-within:border-[#adc6ff] overflow-hidden transition-all duration-200">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b90a0]">
                  <Phone className="w-4 h-4" />
                </span>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-12 bg-transparent border-none pl-12 pr-4 text-sm text-white focus:outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#e5e2e1] mb-1">Password</h4>
                <p className="text-xs text-[#8b90a0]">Update your account password</p>
              </div>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold hover:border-white/[0.12] transition-all flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-[#adc6ff]" />
                Change Password
              </button>
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                className="px-6 py-2.5 rounded-xl bg-[#adc6ff]/10 hover:bg-[#adc6ff]/20 border border-[#adc6ff]/20 text-sm font-bold text-[#adc6ff] flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a0a0a]/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#121212] border border-white/[0.08] p-6 rounded-2xl premium-shadow">
            <h3 className="font-bold text-lg text-[#e5e2e1] mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#adc6ff]" />
              Change Password
            </h3>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#8b90a0] uppercase tracking-wider mb-1.5">Current Password</label>
                <input 
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] focus:border-[#adc6ff] focus:outline-none px-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#8b90a0] uppercase tracking-wider mb-1.5">New Password</label>
                <input 
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] focus:border-[#adc6ff] focus:outline-none px-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#8b90a0] uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] focus:border-[#adc6ff] focus:outline-none px-3 text-sm text-white"
                />
              </div>
              
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#8b90a0] hover:text-[#e5e2e1] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#adc6ff] text-[#002e69] text-xs font-bold hover:bg-[#adc6ff]/90 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
