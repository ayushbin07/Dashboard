import { authService } from '@/services/authService';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'signup' | 'signin';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');

  // Sign Up state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  // Sign In state
  const [signinIdentifier, setSigninIdentifier] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Shared state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!signupUsername.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    try {
      await authService.signUp(
        signupEmail,
        signupPassword,
        signupUsername,
        '👨‍💻'
      );
      navigate('/');
    } catch (err: any) {
      if (
        err.message?.includes('duplicate key value') ||
        err.message?.includes('Database error')
      ) {
        setError('Username is already taken. Please choose another.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.signIn(signinIdentifier, signinPassword);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      // Note: OAuth sign-in will redirect the page, so navigate('/') might not be reached here
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  // Spline loading state
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen w-full overflow-hidden bg-[rgb(224,246,200)] font-sans text-white flex"
    >
      {/* Left Side Panel - Deep Evergreen Glass */}
      <div className="relative z-10 w-full max-w-[480px] h-screen bg-[#1B512D]/60 backdrop-blur-xl flex flex-col justify-center px-12 overflow-y-auto shadow-2xl">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-[360px] mx-auto py-10"
        >
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2 tracking-tight text-white">
              Vimars
            </h1>
            <p className="text-[#DEF4C6]/60 text-lg">
              Your productivity universe.
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-[#1C7C54]/40 p-1 mb-8 w-fit rounded-xl border border-[#73E2A7]/10">
            <button
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-[#73E2A7] text-[#1B512D] shadow-lg shadow-[#73E2A7]/20 font-bold'
                  : 'text-[#DEF4C6]/60 hover:text-[#DEF4C6] hover:bg-white/5'
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === 'signin'
                  ? 'bg-[#73E2A7] text-[#1B512D] shadow-lg shadow-[#73E2A7]/20 font-bold'
                  : 'text-[#DEF4C6]/60 hover:text-[#DEF4C6] hover:bg-white/5'
              }`}
            >
              Sign in
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <AnimatePresence mode="wait">
            {mode === 'signup' ? (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#DEF4C6]/60 ml-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                      maxLength={20}
                      className="w-full h-12 px-4 bg-[#1C7C54]/30 border border-[#73E2A7]/20 rounded-xl text-[#DEF4C6] placeholder-[#DEF4C6]/30 focus:outline-none focus:border-[#73E2A7]/50 focus:bg-[#1C7C54]/50 transition-all hover:border-[#73E2A7]/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#DEF4C6]/60 ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full h-12 px-4 bg-[#1C7C54]/30 border border-[#73E2A7]/20 rounded-xl text-[#DEF4C6] placeholder-[#DEF4C6]/30 focus:outline-none focus:border-[#73E2A7]/50 focus:bg-[#1C7C54]/50 transition-all hover:border-[#73E2A7]/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#DEF4C6]/60 ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      className="w-full h-12 px-4 bg-[#1C7C54]/30 border border-[#73E2A7]/20 rounded-xl text-[#DEF4C6] placeholder-[#DEF4C6]/30 focus:outline-none focus:border-[#73E2A7]/50 focus:bg-[#1C7C54]/50 transition-all hover:border-[#73E2A7]/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#DEF4C6]/60 ml-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full h-12 px-4 bg-[#1C7C54]/30 border border-[#73E2A7]/20 rounded-xl text-[#DEF4C6] placeholder-[#DEF4C6]/30 focus:outline-none focus:border-[#73E2A7]/50 focus:bg-[#1C7C54]/50 transition-all hover:border-[#73E2A7]/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#73E2A7] text-[#1B512D] font-bold rounded-xl hover:bg-[#73E2A7]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(115,226,167,0.2)] hover:shadow-[0_0_25px_rgba(115,226,167,0.3)]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#1B512D]/20 border-t-[#1B512D] rounded-full animate-spin" />
                        Creating account...
                      </span>
                    ) : (
                      'Create account'
                    )}
                  </button>
                </form>

                <p className="text-center text-[#DEF4C6]/40 text-xs mt-6">
                  By creating an account, you agree to our Terms & Service
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSignin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#DEF4C6]/60 ml-1">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      value={signinIdentifier}
                      onChange={(e) => setSigninIdentifier(e.target.value)}
                      placeholder="Enter your email or username"
                      required
                      className="w-full h-12 px-4 bg-[#1C7C54]/30 border border-[#73E2A7]/20 rounded-xl text-[#DEF4C6] placeholder-[#DEF4C6]/30 focus:outline-none focus:border-[#73E2A7]/50 focus:bg-[#1C7C54]/50 transition-all hover:border-[#73E2A7]/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#DEF4C6]/60 ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full h-12 px-4 bg-[#1C7C54]/30 border border-[#73E2A7]/20 rounded-xl text-[#DEF4C6] placeholder-[#DEF4C6]/30 focus:outline-none focus:border-[#73E2A7]/50 focus:bg-[#1C7C54]/50 transition-all hover:border-[#73E2A7]/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#73E2A7] text-[#1B512D] font-bold rounded-xl hover:bg-[#73E2A7]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(115,226,167,0.2)] hover:shadow-[0_0_25px_rgba(115,226,167,0.3)]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#1B512D]/20 border-t-[#1B512D] rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex-1 h-[1px] bg-[#73E2A7]/10"></div>
                  <span className="text-[#DEF4C6]/30 text-[10px] font-medium uppercase tracking-widest">
                    Or continue with
                  </span>
                  <div className="flex-1 h-[1px] bg-[#73E2A7]/10"></div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full h-12 mt-4 bg-white/5 border border-[#73E2A7]/20 rounded-xl flex items-center justify-center gap-3 text-[#DEF4C6] font-medium hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Google
                </button>

                <p className="text-center text-[#DEF4C6]/40 text-xs mt-6">
                  Welcome back to your productivity universe 🚀
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer text for panel */}
        <div className="absolute bottom-6 left-0 w-full text-center">
          <p className="text-[#DEF4C6]/20 text-[10px] font-mono">
            Vimars v1.0 • Built with precision
          </p>
        </div>
      </div>

      {/* Spline Background Iframe - Right side filler */}
      <div className="fixed inset-0 z-0 bg-[rgb(224,246,200)] override-black-bg flex items-center justify-center">
        <iframe
          src="https://my.spline.design/googlyeyes-WpW3VnrcunZes7CZlwVY5nl3-mFg/"
          frameBorder="0"
          className={`flex-shrink-0 transition-opacity duration-1000 ${isSplineLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsSplineLoaded(true)}
          style={{
            width: '300vw',
            height: '300vh',
            border: 'none',
            transform: 'scale(0.45)',
            transformOrigin: 'center',
            backgroundColor: 'rgb(224,246,200)',
          }}
        ></iframe>
        {/* Subtle overlay to blend if needed, or make sure the text pops on the left */}
        {/* <div className="absolute inset-0 z-0 bg-black/5 pointer-events-none"></div> */}
      </div>

      <style>{`
                iframe {
                    pointer-events: auto;
                    user-select: none;
                }
                
                @media (prefers-reduced-motion: reduce) {
                    button { transition: none; transform: none !important; }
                }
            `}</style>
    </motion.div>
  );
};

export default Welcome;
