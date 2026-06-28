import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Activity } from 'lucide-react';

function Login({ onLogin, companyName }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login for now, but in reality we should call the backend
    if (email && password) {
      onLogin({
        name: 'Alex Admin',
        email: 'admin@example.com',
        initials: 'AA'
      });
    } else {
      setError('Please enter both email and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg-base text-slate-200 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md z-10 p-8 glass-panel border border-darkBg-border shadow-2xl rounded-3xl animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4">
            <Activity className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to {companyName || 'EspoCRM'}</h2>
          <p className="text-sm text-slate-400">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail size={16} className="text-slate-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-darkBg-card/50 border border-darkBg-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-slate-600"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={16} className="text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-darkBg-card/50 border border-darkBg-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-slate-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="rounded border-darkBg-border bg-darkBg-card text-brand-500 focus:ring-brand-500/50" />
              <span className="text-slate-400 hover:text-slate-300">Remember me</span>
            </label>
            <a href="#" className="text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white py-3 rounded-xl shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98]"
          >
            <span className="font-semibold text-sm">Sign In</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
