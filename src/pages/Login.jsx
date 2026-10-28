import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login({ onLoginSuccess }) {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!rememberMe) {
      setErrorMessage('Please check "Remember me" to continue.')
      return
    }

    const trimmedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await login({ email: trimmedEmail, password })
      setLoading(false)
      setSuccess(true)
      if (onLoginSuccess) {
        onLoginSuccess()
      }
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 350)
    } catch (err) {
      setLoading(false)
      setErrorMessage(err.message || 'Invalid email address or password.')
    }
  }

  // Reusable Form Elements
  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Address Field */}
      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-800 tracking-wide"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errorMessage) setErrorMessage('')
            }}
            placeholder="Enter your email address"
            className="w-full pl-10 pr-4 py-2.5 bg-[#fdfdfd] border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <label
          htmlFor="password"
          className="block text-xs font-semibold text-slate-800 tracking-wide"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errorMessage) setErrorMessage('')
            }}
            placeholder="Enter your password"
            className="w-full pl-10 pr-11 py-2.5 bg-[#fdfdfd] border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] focus:bg-white transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me Row (Required) */}
      <div className="flex items-center pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              required
              checked={rememberMe}
              onChange={(e) => {
                setRememberMe(e.target.checked)
                if (errorMessage) setErrorMessage('')
              }}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                rememberMe
                  ? 'bg-[#b88a44] border-[#b88a44]'
                  : 'border-slate-300 bg-white group-hover:border-[#b88a44]'
              }`}
            >
              {rememberMe && (
                <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs sm:text-[13px] text-slate-600 font-normal">
            Remember me <span className="text-[#b88a44] font-semibold">*</span>
          </span>
        </label>
      </div>

      {/* Real Backend Error Message Banner */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
          <svg className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div className="font-medium flex-1 leading-snug">{errorMessage}</div>
        </div>
      )}

      {/* Success Notification */}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl text-center font-medium animate-in fade-in flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Authentication verified. Entering DEC Admin Console...</span>
        </div>
      )}

      {/* Sign In Button */}
      <div className="pt-1.5">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-xl bg-[#111a2e] hover:bg-[#1a253e] active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2.5 shadow-md shadow-slate-900/10 transition-all duration-200 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <span className="text-[#c59b58] font-bold text-base transition-transform group-hover:translate-x-1">
                →
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  )

  return (
    <div className="min-h-screen w-full bg-[#080d15] text-slate-800 antialiased selection:bg-[#c59b58]/30 selection:text-[#c59b58] font-sans">
      {/* ========================================================================= */}
      {/* 1. MOBILE RESPONSIVE LAYOUT (< lg): LUXURY AMBIENT CARD CENTERED         */}
      {/* ========================================================================= */}
      <div className="lg:hidden min-h-screen w-full relative flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
        {/* Full-bleed Ambient Cairo Skyline Background with Rich Dark Gradient */}
        <div className="fixed inset-0 pointer-events-none select-none z-0">
          <img
            src="/login-bg.jpg"
            alt="Cairo Heritage Background"
            className="w-full h-full object-cover filter brightness-[0.4] contrast-[1.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080d15]/95 via-[#080d15]/85 to-[#080d15]/98" />
        </div>

        {/* Top-Right Architectural Gold Geometric Corner Accent */}
        <div className="absolute top-0 right-0 pointer-events-none z-10 w-28 h-28">
          <svg className="w-full h-full" viewBox="0 0 160 160" fill="none">
            <polygon points="160,0 160,50 110,0" fill="#c59b58" fillOpacity="0.9" />
            <line x1="30" y1="0" x2="160" y2="130" stroke="#c59b58" strokeWidth="1.2" strokeOpacity="0.75" />
            <line x1="75" y1="0" x2="160" y2="85" stroke="#c59b58" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.45" />
          </svg>
        </div>

        {/* Mobile Top Header: DEC Logo & Welcome Title */}
        <div className="relative z-10 pt-4 pb-3 text-center space-y-1.5 shrink-0">
          <img
            src="/logo.png"
            alt="DEC - Desentral Engineering Consultancy"
            className="h-12 w-auto mx-auto object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          />
          <h1 className="text-2xl font-serif font-normal text-white tracking-tight">
            Welcome <span className="text-[#c59b58] font-serif font-medium">Back</span>
          </h1>
          <p className="text-xs text-[#8e9cb0] tracking-wide">
            Sign in to manage your website &amp; portal
          </p>
        </div>

        {/* Mobile Centered Luxury Form Card */}
        <div className="relative z-10 w-full max-w-[400px] mx-auto my-auto bg-white rounded-2xl shadow-2xl p-5 sm:p-7 border border-slate-100">
          {/* Gold Accent Bar */}
          <div className="w-8 h-[2px] bg-[#b88a44] rounded-full mb-2.5" />

          {/* Eyebrow Label */}
          <span className="text-[10px] font-bold tracking-[0.22em] text-[#b88a44] uppercase block mb-1">
            ADMIN PORTAL
          </span>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111827] tracking-tight mb-4">
            Sign in to your account
          </h2>

          {/* Form */}
          {renderLoginForm()}

          {/* Authorized Personnel Badge */}
          <div className="mt-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="flex-1 h-px bg-slate-200/80" />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal shrink-0">
              <svg
                className="w-3.5 h-3.5 text-[#b88a44]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Authorized personnel only</span>
            </div>
            <div className="flex-1 h-px bg-slate-200/80" />
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="relative z-10 text-center pt-3 pb-2 space-y-1 shrink-0">
          <div className="inline-flex items-center gap-2 text-[10px] text-[#93a2b7] font-normal justify-center">
            <svg
              className="w-3 h-3 text-[#c59b58] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Secure access</span>
            <span className="text-slate-600 font-bold">•</span>
            <span>DEC Content Management System</span>
          </div>
          <p className="text-[10px] text-slate-500 font-normal">
            © 2026 DEC — Desentral Engineering Consultancy
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP 2-COLUMN LAYOUT (lg:flex): LUXURY 58% / 42% ARCHITECTURAL VIEW */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex h-screen w-full overflow-hidden flex-row">
        {/* ================= LEFT COLUMN: HERO & BRAND SHOWCASE ================= */}
        <div className="relative w-[56%] xl:w-[58%] h-full flex flex-col justify-between overflow-hidden bg-[#090e17] border-r border-[#151d2c]/60">
          {/* Top-Right Architectural Gold Geometric Corner Accent */}
          <div className="absolute top-0 right-0 pointer-events-none z-20 w-36 h-36">
            <svg className="w-full h-full" viewBox="0 0 160 160" fill="none">
              <polygon points="160,0 160,50 110,0" fill="#c59b58" fillOpacity="0.9" />
              <line x1="30" y1="0" x2="160" y2="130" stroke="#c59b58" strokeWidth="1.2" strokeOpacity="0.75" />
              <line x1="75" y1="0" x2="160" y2="85" stroke="#c59b58" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.45" />
            </svg>
          </div>

          {/* Brand Header & Headline Area */}
          <div className="relative z-20 px-8 sm:px-12 lg:px-14 pt-8 lg:pt-10 pb-2 space-y-4 shrink-0">
            {/* DEC Official Logo */}
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="DEC - Desentral Engineering Consultancy"
                className="h-14 lg:h-16 xl:h-[72px] w-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Welcome Text */}
            <div className="pt-1 space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-serif font-normal text-white tracking-tight leading-[1.1]">
                Welcome <span className="text-[#c59b58] font-serif font-medium">Back</span>
              </h1>
              <p className="text-[#8e9cb0] text-sm lg:text-base font-normal tracking-wide">
                Sign in to manage your website
              </p>
            </div>

            {/* Security Badge Info */}
            <div className="pt-0.5">
              <div className="inline-flex items-center gap-2 text-xs text-[#93a2b7] font-normal">
                <svg
                  className="w-3.5 h-3.5 text-[#c59b58] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Secure access</span>
                <span className="text-slate-600 font-bold">•</span>
                <span>DEC Content Management System</span>
              </div>
            </div>
          </div>

          {/* Skyline Illustration Area with Sphinx, Pyramids, Cairo Tower and Blueprint Overlay */}
          <div className="relative flex-1 w-full min-h-0 pointer-events-none select-none overflow-hidden">
            {/* Deep Dark Top Gradient Blend */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#090e17] via-[#090e17]/85 to-transparent z-10" />

            {/* Background Cairo Skyline Image anchored to bottom-left */}
            <img
              src="/login-bg.jpg"
              alt="Cairo Skyline Architecture with Sphinx and Pyramids"
              className="w-full h-full object-cover filter contrast-[1.08] brightness-[0.9]"
              style={{ objectPosition: '0% 100%' }}
            />

            {/* Architectural Vector Blueprint Drafting Lines Overlay */}
            <svg
              className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              viewBox="0 0 900 500"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <pattern id="cadGrid" width="45" height="45" patternUnits="userSpaceOnUse">
                  <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.75" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cadGrid)" />

              <circle
                cx="540"
                cy="280"
                r="240"
                stroke="rgba(197, 155, 88, 0.28)"
                strokeWidth="0.9"
                strokeDasharray="4 6"
              />
              <circle
                cx="540"
                cy="280"
                r="360"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="0.8"
              />

              <line x1="0" y1="280" x2="900" y2="280" stroke="rgba(197, 155, 88, 0.22)" strokeWidth="0.8" />
              <line x1="540" y1="0" x2="540" y2="500" stroke="rgba(197, 155, 88, 0.22)" strokeWidth="0.8" strokeDasharray="3 3" />

              <line x1="140" y1="360" x2="480" y2="130" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="0.9" strokeDasharray="2 4" />
              <line x1="480" y1="130" x2="740" y2="230" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.8" />

              <circle cx="480" cy="130" r="4" fill="#c59b58" fillOpacity="0.85" />
              <circle cx="480" cy="130" r="11" stroke="#c59b58" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.6" />

              <circle cx="170" cy="315" r="3" fill="#c59b58" fillOpacity="0.75" />
              <line x1="170" y1="315" x2="170" y2="460" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="0.8" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: LIGHT LUXURY FORM PANEL ================= */}
        <div className="relative w-[44%] xl:w-[42%] h-full bg-[#faf8f5] flex flex-col justify-between px-6 sm:px-10 lg:px-12 xl:px-14 py-8 overflow-hidden shadow-2xl">
          {/* Architectural Wireframe Angle Watermarks in Background */}
          <div className="absolute -top-10 -right-10 w-64 h-64 pointer-events-none opacity-45">
            <svg className="w-full h-full text-[#d8c7ad]" viewBox="0 0 200 200" fill="none">
              <line x1="200" y1="30" x2="30" y2="200" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="200" y1="70" x2="70" y2="200" stroke="currentColor" strokeWidth="0.8" />
              <line x1="200" y1="110" x2="110" y2="200" stroke="currentColor" strokeWidth="0.8" />
            </svg>
          </div>
          <div className="absolute -bottom-16 -right-16 w-80 h-80 pointer-events-none opacity-40">
            <svg className="w-full h-full text-[#cfbc9e]" viewBox="0 0 240 240" fill="none">
              <line x1="240" y1="60" x2="120" y2="180" stroke="currentColor" strokeWidth="0.9" />
              <line x1="120" y1="180" x2="240" y2="220" stroke="currentColor" strokeWidth="0.9" />
              <line x1="240" y1="30" x2="90" y2="180" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Top dummy space to center form vertically */}
          <div className="shrink" />

          {/* Main Form Center Card */}
          <div className="relative z-10 w-full max-w-[420px] mx-auto my-auto py-2">
            {/* Gold Accent Bar */}
            <div className="w-9 h-[2px] bg-[#b88a44] rounded-full mb-3.5" />

            {/* Eyebrow Label */}
            <span className="text-[10px] font-bold tracking-[0.22em] text-[#b88a44] uppercase block mb-1">
              ADMIN PORTAL
            </span>

            {/* Heading */}
            <h2 className="text-2xl sm:text-[30px] lg:text-[32px] font-serif font-bold text-[#111827] tracking-tight mb-5 sm:mb-6">
              Sign in to your account
            </h2>

            {/* Form */}
            {renderLoginForm()}

            {/* Authorized Personnel Divider with Subtle Lines */}
            <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
              <div className="flex-1 h-px bg-slate-200/80" />
              <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-slate-500 font-normal shrink-0">
                <svg
                  className="w-3.5 h-3.5 text-[#b88a44]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Authorized personnel only</span>
              </div>
              <div className="flex-1 h-px bg-slate-200/80" />
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-center pt-2 pb-1 shrink-0">
            <p className="text-[11px] text-slate-400 font-normal">
              © 2026 DEC — Desentral Engineering Consultancy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
