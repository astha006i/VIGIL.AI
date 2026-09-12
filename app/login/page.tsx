'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

const LOGO_SRC =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAMWL0uT3EJ2gkrt7cx5blsa1I477H_cFaXw9kfDEMIxMblaRl3eBUqbtYArFjKO-oz0QmzfSbp37kJ7qo5cWMh2zLTnck6r9qsKfOy_aNjebAnnM66vlkQzQO_SRAdlo_2AmErs29-i7ty8KL39peBkyCscqI_Y10Gc88b0Y7MyUP2S2b30JY_ZWsuVfv4UpE9Fd1eNqk41ZQX0B0ZMLSpG9dV6KGVtrPz-AwdMiTgPEGRZI_EEGUo4cdDAZjYm8MuRA';

const LOGIN_COPY = {
  title: 'Login to Vigil Eye',
  subtitle: 'Welcome Back',
  rightTitle: 'Secure & Smart Access',
  rightText:
    'Vigil Eye provides you secure, encrypted access to your workspace, powered by real-time AI-driven insights.',
};

const SIGNUP_COPY = {
  title: 'Create Account',
  subtitle: 'Create your account',
  rightTitle: 'Get Started Today',
  rightText:
    'Create your account in minutes and unlock AI-driven insights, updates, and tools to help you stay informed.',
};

const inputClasses =
  'w-full px-4 py-3 rounded-lg border border-[#c4c6cf] bg-[#ffffff] text-[#191c1e] focus:outline-none focus:border-[#001f3f] focus:ring-1 focus:ring-[#001f3f] transition-colors';
const labelClasses =
  'block text-[14px] leading-[20px] tracking-[0.05em] font-semibold text-[#001f3f]';
const submitClasses =
  'w-full bg-[#001f3f] text-[#ffffff] text-[14px] leading-[20px] tracking-[0.05em] font-semibold py-3 rounded-lg hover:bg-[#1b6d24] transition-colors duration-300 mt-6 shadow-[0_4px_14px_0_rgba(0,31,63,0.39)] hover:shadow-[0_6px_20px_rgba(27,109,36,0.23)]';
const linkClasses =
  'text-[14px] leading-[20px] tracking-[0.05em] font-semibold text-[#001f3f] hover:text-[#1b6d24] transition-colors underline';
const errorClasses = 'text-[13px] leading-[20px] text-red-600 mt-1';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const copy = mode === 'login' ? LOGIN_COPY : SIGNUP_COPY;

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  const handleLoginSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: { email?: string; password?: string } = {};
    if (!loginEmail.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailPattern.test(loginEmail)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!loginPassword) {
      errors.password = 'Password is required.';
    }
    setLoginErrors(errors);
    if (Object.keys(errors).length === 0) {
      router.push('/dashboard');
    }
  };

  const handleSignupSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: { name?: string; email?: string; password?: string; confirm?: string } = {};
    if (!signupName.trim()) {
      errors.name = 'Full name is required.';
    }
    if (!signupEmail.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailPattern.test(signupEmail)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!signupPassword) {
      errors.password = 'Password is required.';
    } else if (signupPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (!signupConfirm) {
      errors.confirm = 'Please confirm your password.';
    } else if (signupConfirm !== signupPassword) {
      errors.confirm = 'Passwords do not match.';
    }
    setSignupErrors(errors);
    if (Object.keys(errors).length === 0) {
      setMode('login');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fb] text-[#191c1e]">
      <main className="relative flex w-full flex-grow items-center justify-center px-5 py-16">
        <div className="absolute left-8 top-8 z-50 flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity active:opacity-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Vigil Eye Logo"
              className="h-10 w-auto object-contain"
              src={LOGO_SRC}
            />
            <span className="text-[24px] leading-[32px] font-bold text-white drop-shadow-md">
              Vigil AI
            </span>
          </Link>
        </div>

        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />
        <div className="absolute inset-0 z-0 bg-black/50" />

        <div className="relative z-30 flex w-full max-w-md flex-col items-center">
          <div className="w-full space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-white drop-shadow-md">
                {copy.title}
              </h1>
              <p className="text-[18px] leading-[28px] text-white/90 drop-shadow-sm">
                {copy.subtitle}
              </p>
            </div>

            {mode === 'login' ? (
              <form
                className="space-y-6 rounded-xl border border-white/20 border-t-4 border-t-[#1b6d24] bg-[#f8f9fb]/90 p-8 shadow-lg backdrop-blur-xl"
                onSubmit={handleLoginSubmit}
              >
                <div className="space-y-2">
                  <label className={labelClasses} htmlFor="email">
                    Email or Username
                  </label>
                  <input
                    className={inputClasses}
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  {loginErrors.email && <p className={errorClasses}>{loginErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClasses} htmlFor="password">
                    Password
                  </label>
                  <input
                    className={inputClasses}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  {loginErrors.password && (
                    <p className={errorClasses}>{loginErrors.password}</p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      className="h-4 w-4 rounded border-[#c4c6cf] text-[#001f3f] focus:ring-[#001f3f]"
                      type="checkbox"
                    />
                    <span className="text-[16px] leading-[24px] text-[#001f3f]">
                      Remember me
                    </span>
                  </label>
                  <a
                    className="text-[14px] leading-[20px] tracking-[0.05em] font-semibold text-[#001f3f] transition-colors hover:text-[#1b6d24]"
                    href="#"
                  >
                    Forgot Password?
                  </a>
                </div>
                <button className={submitClasses} type="submit">
                  Sign In
                </button>
                <div className="pt-6 text-center">
                  <p className="mb-1 text-[16px] leading-[24px] text-[#001f3f]">
                    New to the platform?{' '}
                    <a
                      className={linkClasses}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setMode('signup');
                      }}
                    >
                      Create Account
                    </a>
                  </p>
                  <p className="text-[16px] leading-[24px] text-[#001f3f]">
                    Don&apos;t have an account?{' '}
                    <a className={linkClasses} href="#">
                      Request Access
                    </a>
                  </p>
                </div>
              </form>
            ) : (
              <form
                className="space-y-6 rounded-xl border border-white/20 border-t-4 border-t-[#1b6d24] bg-[#f8f9fb]/90 p-8 shadow-lg backdrop-blur-xl"
                onSubmit={handleSignupSubmit}
              >
                <div className="space-y-2">
                  <label className={labelClasses} htmlFor="fullname">
                    Full Name
                  </label>
                  <input
                    className={inputClasses}
                    id="fullname"
                    name="fullname"
                    placeholder="Enter your full name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                  {signupErrors.name && <p className={errorClasses}>{signupErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClasses} htmlFor="sig-email">
                    Email
                  </label>
                  <input
                    className={inputClasses}
                    id="sig-email"
                    name="sig-email"
                    placeholder="Enter your email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                  {signupErrors.email && <p className={errorClasses}>{signupErrors.email}</p>}
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className={labelClasses} htmlFor="sig-password">
                      Password
                    </label>
                    <input
                      className={inputClasses}
                      id="sig-password"
                      name="sig-password"
                      placeholder="••••••••"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                    {signupErrors.password && (
                      <p className={errorClasses}>{signupErrors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses} htmlFor="confirm-password">
                      Confirm Password
                    </label>
                    <input
                      className={inputClasses}
                      id="confirm-password"
                      name="confirm-password"
                      placeholder="••••••••"
                      type="password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                    />
                    {signupErrors.confirm && (
                      <p className={errorClasses}>{signupErrors.confirm}</p>
                    )}
                  </div>
                </div>
                <button className={submitClasses} type="submit">
                  Create Account
                </button>
                <div className="pt-6 text-center">
                  <p className="text-[16px] leading-[24px] text-[#001f3f]">
                    Already have an account?{' '}
                    <a
                      className={linkClasses}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setMode('login');
                      }}
                    >
                      Sign In
                    </a>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-30 border-t border-[#c4c6cf] bg-[#ffffff]">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between py-6 px-16 md:flex-row">
          <div className="mb-3 text-center md:mb-0 md:text-left">
            <span className="mb-1 block text-[14px] leading-[20px] tracking-[0.05em] font-bold text-[#000613]">
              Vigil Eye
            </span>
            <span className="text-[16px] leading-[24px] text-[#43474e]">
              © 2025 Vigil Eye. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}