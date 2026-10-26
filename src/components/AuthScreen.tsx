import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { processGuestName } from '../utils/nameProcessor';

interface AuthProps {
  onLogin: (identifier: string, isGuest: boolean) => void;
}

export const AuthScreen: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showGuestLogin, setShowGuestLogin] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email === 'lfrohling@gmail.com') {
        onLogin(result.user.email, false);
      } else {
        setError("No new Google accounts are being considered now - please login as 'Guest'");
        setShowGuestLogin(true);
      }
    } catch (err: any) {
      console.error('Google login failed:', err);
      setError(`Google login failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const validateAndLogin = (name: string, isGuest: boolean) => {
      const sanitizedInput = processGuestName(name || 'Guest');
      onLogin(sanitizedInput, isGuest);
  }

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndLogin(username || 'Guest', true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
      <div className="bg-slate-900 p-8 rounded-xl border border-slate-700 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-center">Login</h2>
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoggingIn}
          className="w-full p-2 bg-indigo-600 rounded mb-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? 'Logging in...' : 'Login with Google'}
        </button>
        
        <p className="text-center text-slate-400 mb-4">Guest Mode: Try typing your full name!</p>

        {showGuestLogin ? (
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <button type="submit" className="w-full p-2 bg-emerald-600 rounded font-semibold">Enter as Guest</button>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); validateAndLogin(username || 'Guest', true); }} className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='or simply type "Guest"'
              className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded"
            />
            <button type="submit" className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">Submit</button>
          </form>
        )}

        {error && <p className="text-amber-400 mt-4 text-sm text-center">{error}</p>}
        
      </div>
    </div>
  );
};
