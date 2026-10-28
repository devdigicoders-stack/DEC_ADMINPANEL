import { useState, useRef } from 'react'
import {
  Home,
  Globe,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Share2,
  ShieldAlert,
  Save,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  ExternalLink,
  Eye,
  RefreshCw,
  AlertTriangle,
  MessageCircle
} from 'lucide-react'

export default function SiteSettingsPage({ onNavigateToDashboard, onNavigateToContent }) {
  const [activeTab, setActiveTab] = useState('branding') // 'branding' | 'contact' | 'social' | 'seo' | 'maintenance'
  const [savedToast, setSavedToast] = useState('')
  const [isPurgingCache, setIsPurgingCache] = useState(false)
  const logoInputRef = useRef(null)
  const faviconInputRef = useRef(null)

  // 1. Branding State
  const [siteTitle, setSiteTitle] = useState('Desentral Engineering Consultancy (DEC)')
  const [tagline, setTagline] = useState('Engineering Excellence, Timeless Innovation')
  const [logoUrl, setLogoUrl] = useState('/logo.png')
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico')
  const [accentColor, setAccentColor] = useState('#c59b58')
  const [headerStyle, setHeaderStyle] = useState('dark-solid') // 'dark-solid' | 'transparent-hero'

  // 2. Contact & Top Banner State
  const [contactEmail, setContactEmail] = useState('info@dec-consultancy.com')
  const [supportPhone, setSupportPhone] = useState('+20 2 2736 8490')
  const [whatsappNumber, setWhatsappNumber] = useState('+20 100 482 9182')
  const [showWhatsappWidget, setShowWhatsappWidget] = useState(true)
  const [officeAddress, setOfficeAddress] = useState('42 El-Nil Street, Zamalek, Cairo, Egypt')
  const [workingHours, setWorkingHours] = useState('Sun - Thu: 8:30 AM - 5:30 PM (Fri & Sat Closed)')
  
  // Announcement Bar
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)
  const [announcementText, setAnnouncementText] = useState('DEC wins 2026 Middle East Infrastructure Design Excellence Award!')
  const [announcementLink, setAnnouncementLink] = useState('/blog')
  const [announcementBg, setAnnouncementBg] = useState('#c59b58')

  // 3. Social Media URLs
  const [socialLinks, setSocialLinks] = useState({
    linkedin: 'https://linkedin.com/company/dec-consultancy',
    facebook: 'https://facebook.com/dec.consultancy.eg',
    instagram: 'https://instagram.com/dec_engineering',
    twitter: 'https://x.com/dec_engineering',
    youtube: 'https://youtube.com/@dec-engineering',
    behance: 'https://behance.net/dec-consultancy',
  })

  // 4. SEO & Analytics
  const [metaTitle, setMetaTitle] = useState('DEC | Leading Engineering Consultancy in Egypt & Middle East')
  const [metaDescription, setMetaDescription] = useState('DEC provides premier structural engineering, architectural design, MEP coordination, geotechnical auditing, and infrastructure management in Cairo and across the MENA region.')
  const [metaKeywords, setMetaKeywords] = useState('Engineering Consultancy, Structural Design Cairo, BIM Coordination, Architecture Egypt, Geotechnical Auditing, DEC Egypt')
  const [analyticsId, setAnalyticsId] = useState('G-DEC2026EGYPT')
  const [allowIndexing, setAllowIndexing] = useState(true)
  const [enableCookieConsent, setEnableCookieConsent] = useState(true)

  // 5. Maintenance Mode
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceNotice, setMaintenanceNotice] = useState('DEC Portal is currently undergoing scheduled system upgrades. We will be back online shortly.')

  const showToast = (msg) => {
    setSavedToast(msg)
    setTimeout(() => setSavedToast(''), 3500)
  }

  const handleSave = (e) => {
    e.preventDefault()
    showToast('Site settings updated and synced with public website!')
  }

  const handlePurgeCache = () => {
    setIsPurgingCache(true)
    setTimeout(() => {
      setIsPurgingCache(false)
      showToast('CDN & Edge cache purged successfully! Live site reflects latest assets.')
    }, 1500)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoUrl(URL.createObjectURL(file))
      showToast('Brand logo uploaded successfully!')
    }
  }

  const handleFaviconUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFaviconUrl(URL.createObjectURL(file))
      showToast('Favicon uploaded successfully!')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1680px] w-full mx-auto font-sans antialiased text-slate-800">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button
          onClick={onNavigateToDashboard}
          className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-slate-700" />
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <button
          onClick={onNavigateToContent}
          className="hover:text-slate-800 transition-colors cursor-pointer"
        >
          Website Content
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <span className="text-slate-800 font-semibold">Site Settings</span>
      </div>

      {/* 2. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Website &amp; Public Portal Settings</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#b88a44] border border-amber-200">
              Live
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure global website branding, header contacts, social media channels, SEO meta tags, and live deployment controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePurgeCache}
            disabled={isPurgingCache}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isPurgingCache ? 'animate-spin' : ''}`} />
            <span>{isPurgingCache ? 'Purging...' : 'Purge Cache'}</span>
          </button>

          <a
            href={import.meta.env.VITE_WEBSITE_URL || 'http://localhost:5174/'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
            <span>Visit Live Site</span>
          </a>
        </div>
      </div>

      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-[#0c1424] text-white text-xs font-semibold shadow-xl flex items-center gap-2.5 animate-in fade-in border border-[#c59b58]">
          <CheckCircle2 className="w-4 h-4 text-[#c59b58]" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* 3. Horizontal Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-1 select-none border-b border-slate-200/80">
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-[#0c1424] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Building2 className={`w-3.5 h-3.5 ${activeTab === 'branding' ? 'text-[#c59b58]' : 'text-slate-500'}`} />
          <span>Branding &amp; Identity</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-[#0c1424] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Phone className={`w-3.5 h-3.5 ${activeTab === 'contact' ? 'text-[#c59b58]' : 'text-slate-500'}`} />
          <span>Public Contacts &amp; Top Bar</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'social'
              ? 'bg-[#0c1424] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Share2 className={`w-3.5 h-3.5 ${activeTab === 'social' ? 'text-[#c59b58]' : 'text-slate-500'}`} />
          <span>Social Media Channels</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-[#0c1424] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Globe className={`w-3.5 h-3.5 ${activeTab === 'seo' ? 'text-[#c59b58]' : 'text-slate-500'}`} />
          <span>SEO &amp; Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'maintenance'
              ? 'bg-[#0c1424] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className={`w-3.5 h-3.5 ${activeTab === 'maintenance' ? 'text-[#c59b58]' : 'text-slate-500'}`} />
          <span>Maintenance &amp; Controls</span>
        </button>
      </div>

      {/* 4. Main Two-Column Layout (Form on Left 8 cols, Live Mockup on Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (8 Cols) */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6"
        >
          {/* TAB 1: BRANDING & IDENTITY */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#b88a44] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Branding &amp; Visual Identity
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize your firm&apos;s brand display, website logos, and accent color scheme.
                  </p>
                </div>
              </div>

              {/* Site Title & Tagline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Website Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Brand Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>
              </div>

              {/* Logo & Favicon Upload Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Header Logo */}
                <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Header Brand Logo</label>
                    <span className="text-[10px] text-slate-400">PNG / SVG (Max 2MB)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 rounded-xl bg-[#0c1424] border border-slate-300/40 p-2 flex items-center justify-center shrink-0">
                      <img
                        src={logoUrl}
                        alt="DEC Logo Preview"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/logo.png'
                        }}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#b88a44] text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload New Logo</span>
                      </button>
                      <p className="text-[11px] text-slate-400">Recommended: 240x60 transparent PNG</p>
                    </div>
                  </div>
                </div>

                {/* Browser Favicon */}
                <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Browser Favicon</label>
                    <span className="text-[10px] text-slate-400">ICO / PNG (32x32)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-2xs">
                      <img
                        src={faviconUrl}
                        alt="Favicon Preview"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/logo.png'
                        }}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="file"
                        ref={faviconInputRef}
                        accept="image/*"
                        onChange={handleFaviconUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#b88a44] text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload Favicon</span>
                      </button>
                      <p className="text-[11px] text-slate-400">Displays in browser tab</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accent Color & Header Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Primary Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => setAccentColor('#c59b58')}
                      className="px-2.5 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold"
                    >
                      Reset Gold
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Header Appearance</label>
                  <select
                    value={headerStyle}
                    onChange={(e) => setHeaderStyle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#b88a44]"
                  >
                    <option value="dark-solid">Solid Luxury Navy (#0c1424) - Fixed</option>
                    <option value="transparent-hero">Transparent Over Hero Banner (Blur on Scroll)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PUBLIC CONTACTS & TOP BAR */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#b88a44] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Public Contacts &amp; Announcement Bar
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Information displayed across website header, footer, and interactive contact widgets.
                  </p>
                </div>
              </div>

              {/* Announcement Bar Toggle Card */}
              <div className="p-4 rounded-xl border border-amber-200/70 bg-amber-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#b88a44]" />
                    <span className="text-xs font-bold text-slate-900">
                      Top Announcement Ribbon
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementEnabled}
                      onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c59b58]"></div>
                  </label>
                </div>

                {announcementEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                    <div className="md:col-span-8">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Ribbon Notice Text
                      </label>
                      <input
                        type="text"
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Destination Link
                      </label>
                      <input
                        type="text"
                        value={announcementLink}
                        onChange={(e) => setAnnouncementLink(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Global Email & Support Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Official Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Consultancy Hotline Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Quick Chat */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      WhatsApp Floating Quick Consultation Widget
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWhatsappWidget}
                      onChange={(e) => setShowWhatsappWidget(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {showWhatsappWidget && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-medium text-slate-700">
                      WhatsApp Business Number (with country code)
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+20 100 482 9182"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* Physical Address & Working Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Headquarters Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44] resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Official Working Hours
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL MEDIA CHANNELS */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#b88a44] flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Social Media &amp; Portfolios
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect DEC official social channels displayed in the header, footer, and inquiry responses.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Facebook Page</label>
                  <input
                    type="url"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Instagram Handle</label>
                  <input
                    type="url"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">X (Twitter)</label>
                  <input
                    type="url"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">YouTube Channel</label>
                  <input
                    type="url"
                    value={socialLinks.youtube}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">Behance Portfolio</label>
                  <input
                    type="url"
                    value={socialLinks.behance}
                    onChange={(e) => setSocialLinks({ ...socialLinks, behance: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO & ANALYTICS */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#b88a44] flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Search Engine Optimization (SEO) &amp; Analytics
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure search crawler indexation, meta tags, and Google Analytics tracking.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Global Meta Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
                <span className="text-[11px] text-slate-400">{metaTitle.length}/70 recommended</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Global Meta Description
                </label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44] resize-none"
                />
                <span className="text-[11px] text-slate-400">{metaDescription.length}/160 recommended</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Google Analytics 4 (GA4) ID
                  </label>
                  <input
                    type="text"
                    value={analyticsId}
                    onChange={(e) => setAnalyticsId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Search Engine Indexing</p>
                    <p className="text-[10px] text-slate-400">Allow Google &amp; Bing crawlers to index</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowIndexing}
                      onChange={(e) => setAllowIndexing(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c59b58]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MAINTENANCE & CONTROLS */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#b88a44] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Maintenance Mode &amp; Security Controls
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Control public site accessibility during infrastructure maintenance or audits.
                  </p>
                </div>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className={`p-4 rounded-xl border transition-colors ${
                maintenanceMode ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${maintenanceMode ? 'text-rose-600' : 'text-slate-400'}`} />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Enable Maintenance Mode
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        When enabled, visitors will see a maintenance notice instead of the live site. Admin portal remains active.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {maintenanceMode && (
                  <div className="mt-4 pt-3 border-t border-rose-100 space-y-2">
                    <label className="block text-xs font-bold text-rose-900">
                      Public Maintenance Message
                    </label>
                    <textarea
                      rows={2}
                      value={maintenanceNotice}
                      onChange={(e) => setMaintenanceNotice(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Cookie Consent Banner */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    GDPR / Egyptian Data Protection Cookie Consent Banner
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Displays privacy &amp; cookie compliance banner on first visitor landing.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCookieConsent}
                    onChange={(e) => setEnableCookieConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c59b58]"></div>
                </label>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0c1424] hover:bg-[#16233b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0c1424]/20 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#c59b58]" />
              <span>Save Site Settings</span>
            </button>
          </div>
        </form>

        {/* Right Side: Live Interactive Website Header & Branding Mockup (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mockup Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                <Eye className="w-4 h-4 text-slate-600" />
                <span>Live Public Header Preview</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Desktop View</span>
            </div>

            {/* Mockup Display Box */}
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 text-white select-none">
              {/* Top Announcement Bar Mockup */}
              {announcementEnabled && (
                <div
                  style={{ backgroundColor: announcementBg }}
                  className="px-3 py-1.5 text-center text-[10px] font-bold text-[#0c1424] flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="truncate">{announcementText}</span>
                </div>
              )}

              {/* Main Nav Header Mockup */}
              <div className="p-3.5 flex items-center justify-between border-b border-white/10 bg-[#0c1424]">
                <div className="flex items-center gap-2">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/logo.png'
                    }}
                    className="h-6 w-auto object-contain"
                  />
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <span className="text-[#c59b58] font-bold">Home</span>
                  <span>About</span>
                  <span>Services</span>
                  <span>Projects</span>
                  <span>Contact</span>
                </div>
              </div>

              {/* Mockup Body Content Preview */}
              <div className="p-4 bg-gradient-to-b from-[#0c1424] to-[#141e33] space-y-2 text-center">
                <p className="text-[10px] text-[#c59b58] font-semibold tracking-wider uppercase">
                  {tagline}
                </p>
                <h4 className="text-xs font-serif font-bold text-white line-clamp-2">
                  {siteTitle}
                </h4>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[9px] font-bold bg-[#c59b58] text-[#0c1424]">
                    Consultation
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[9px] font-medium bg-white/10 text-white">
                    {supportPhone}
                  </span>
                </div>
              </div>

              {/* Mockup Footer Contacts */}
              <div className="p-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
                <span className="truncate">{contactEmail}</span>
                <span className="truncate">{officeAddress.split(',')[0]}</span>
              </div>
            </div>

            {/* Quick Summary Pill Details */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Theme Accent:</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span>{accentColor}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Search Indexing:</span>
                <span className={`font-semibold ${allowIndexing ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {allowIndexing ? 'Active (Allowed)' : 'Blocked (Disallowed)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 text-slate-600">
                <span>Maintenance Status:</span>
                <span className={`font-semibold ${maintenanceMode ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {maintenanceMode ? 'Active (Site Offline)' : 'Online (Public)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
