import { useState, useEffect, useRef } from 'react'
import {
  Home,
  PanelsTopLeft,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Eye,
  Layers,
  FileText,
  ShieldCheck,
  Check,
  Cpu,
  X,
} from 'lucide-react'
import cmsService from '../services/cmsService.js'
import uploadService from '../services/uploadService.js'
import { getImageUrl } from '../services/api.js'

// Clean pasted or concatenated URLs
export const cleanImageUrlInput = (value) => {
  if (!value || typeof value !== 'string') return ''
  let cleaned = value.trim()
  const httpIdx = cleaned.lastIndexOf('http://')
  const httpsIdx = cleaned.lastIndexOf('https://')
  const lastProtocolIdx = Math.max(httpIdx, httpsIdx)
  if (lastProtocolIdx > 0) {
    cleaned = cleaned.substring(lastProtocolIdx)
  }
  // Remove origin prefix if pointing to local /uploads or /images
  cleaned = cleaned.replace(/^https?:\/\/[^/]+(?=\/uploads\/|\/images\/)/i, '')
  return cleaned
}

// Home Page Defaults (Official DEC Brand Assets)
const DEFAULT_HOME_IMAGE = '/uploads/cms/dec_integrated_engineering.jpg'
const DEFAULT_HOME_BADGE = 'Coordinated Engineering Leadership'
const DEFAULT_HOME_CAPTION =
  'Delivering end-to-end design, authority approvals and site supervision across Qatar, Egypt, and Saudi Arabia.'
const DEFAULT_HOME_ALT = 'DEC Integrated Multi-Discipline Engineering and 3D BIM Delivery'

// Why DEC Page Defaults (Official DEC Brand Assets)
const DEFAULT_WHY_DEC_IMAGE = '/uploads/cms/why_dec_bim_edge.jpg'
const DEFAULT_WHY_DEC_BADGE = 'Federated 3D Coordination'
const DEFAULT_WHY_DEC_STATUS = 'BIM LEVEL 2 ACTIVE'
const DEFAULT_WHY_DEC_CAPTION =
  'Synchronized Revit & Navisworks models across Architecture, Structure, HVAC & Electrical ELV.'
const DEFAULT_WHY_DEC_ALT = 'DEC 3D BIM Level 2 Coordination and Clash Detection'

export default function CMS({ onNavigateToDashboard }) {
  const [activeTab, setActiveTab] = useState('home') // 'home' | 'why-dec'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // 1. Home Section: Integrated Delivery
  const [homeImage, setHomeImage] = useState(DEFAULT_HOME_IMAGE)
  const [homeBadge, setHomeBadge] = useState(DEFAULT_HOME_BADGE)
  const [homeCaption, setHomeCaption] = useState(DEFAULT_HOME_CAPTION)
  const [homeAlt, setHomeAlt] = useState(DEFAULT_HOME_ALT)

  // 2. Why DEC Section: BIM Level 2 Coordination
  const [whyDecImage, setWhyDecImage] = useState(DEFAULT_WHY_DEC_IMAGE)
  const [whyDecBadge, setWhyDecBadge] = useState(DEFAULT_WHY_DEC_BADGE)
  const [whyDecStatus, setWhyDecStatus] = useState(DEFAULT_WHY_DEC_STATUS)
  const [whyDecCaption, setWhyDecCaption] = useState(DEFAULT_WHY_DEC_CAPTION)
  const [whyDecAlt, setWhyDecAlt] = useState(DEFAULT_WHY_DEC_ALT)

  const homeFileInputRef = useRef(null)
  const whyDecFileInputRef = useRef(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Load both CMS pages on mount
  useEffect(() => {
    let isMounted = true
    const fetchAllCms = async () => {
      try {
        setLoading(true)
        setErrorMessage('')

        const [homeRes, whyDecRes] = await Promise.allSettled([
          cmsService.getHomeContent(),
          cmsService.getWhyDecContent(),
        ])

        if (!isMounted) return

        if (homeRes.status === 'fulfilled') {
          const homeData = homeRes.value?.data || homeRes.value
          if (homeData?.integratedDelivery) {
            setHomeImage(cleanImageUrlInput(homeData.integratedDelivery.image) || DEFAULT_HOME_IMAGE)
            setHomeBadge(homeData.integratedDelivery.badge || DEFAULT_HOME_BADGE)
            setHomeCaption(homeData.integratedDelivery.description || DEFAULT_HOME_CAPTION)
            setHomeAlt(homeData.integratedDelivery.altText || DEFAULT_HOME_ALT)
          }
        }

        if (whyDecRes.status === 'fulfilled') {
          const whyDecData = whyDecRes.value?.data || whyDecRes.value
          if (whyDecData?.bimCoordination) {
            setWhyDecImage(cleanImageUrlInput(whyDecData.bimCoordination.image) || DEFAULT_WHY_DEC_IMAGE)
            setWhyDecBadge(whyDecData.bimCoordination.badge || DEFAULT_WHY_DEC_BADGE)
            setWhyDecStatus(whyDecData.bimCoordination.statusTag || DEFAULT_WHY_DEC_STATUS)
            setWhyDecCaption(whyDecData.bimCoordination.description || DEFAULT_WHY_DEC_CAPTION)
            setWhyDecAlt(whyDecData.bimCoordination.altText || DEFAULT_WHY_DEC_ALT)
          }
        }
      } catch (err) {
        console.warn('Failed to load CMS content, using default assets:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAllCms()
    return () => {
      isMounted = false
    }
  }, [])

  // Generic File Upload Handler
  const handleFileUpload = async (e, section) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      let uploadedUrl = ''

      try {
        const res = await uploadService.uploadImage(file, 'cms')
        uploadedUrl = res?.data?.url || res?.data?.fullUrl || ''
      } catch (serverErr) {
        console.warn('Server upload note, falling back to local data URL:', serverErr)
      }

      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      if (section === 'home') {
        setHomeImage(uploadedUrl)
      } else {
        setWhyDecImage(uploadedUrl)
      }

      triggerToast('Image uploaded successfully! Click "Save Changes" to publish.')
    } catch (err) {
      console.error('File upload error:', err)
      setErrorMessage('Failed to read image file. Please try again.')
    } finally {
      setUploading(false)
      if (homeFileInputRef.current) homeFileInputRef.current.value = ''
      if (whyDecFileInputRef.current) whyDecFileInputRef.current.value = ''
    }
  }

  // Save changes to backend
  const handleSave = async (e) => {
    e?.preventDefault()
    try {
      setSaving(true)
      setErrorMessage('')

      if (activeTab === 'home') {
        const payload = {
          integratedDelivery: {
            image: homeImage,
            badge: homeBadge,
            description: homeCaption,
            altText: homeAlt,
          },
        }
        await cmsService.updateHomeContent(payload)
        triggerToast('Home Page CMS content published successfully!')
      } else {
        const payload = {
          bimCoordination: {
            image: whyDecImage,
            badge: whyDecBadge,
            statusTag: whyDecStatus,
            description: whyDecCaption,
            altText: whyDecAlt,
          },
        }
        await cmsService.updateWhyDecContent(payload)
        triggerToast('Why DEC Page CMS content published successfully!')
      }
    } catch (err) {
      console.error('CMS update error:', err)
      setErrorMessage(err.message || 'Failed to update CMS. Please check your backend connection.')
    } finally {
      setSaving(false)
    }
  }

  // Reset current section to official DEC brand assets
  const handleReset = async () => {
    if (!window.confirm('Reset this section to the official DEC brand assets?')) return

    if (activeTab === 'home') {
      setHomeImage(DEFAULT_HOME_IMAGE)
      setHomeBadge(DEFAULT_HOME_BADGE)
      setHomeCaption(DEFAULT_HOME_CAPTION)
      setHomeAlt(DEFAULT_HOME_ALT)
      try {
        await cmsService.resetHomeContent()
        triggerToast('Home section restored to official DEC brand image!')
      } catch (err) {
        triggerToast('Local reset applied. Click "Save Changes" to publish.')
      }
    } else {
      setWhyDecImage(DEFAULT_WHY_DEC_IMAGE)
      setWhyDecBadge(DEFAULT_WHY_DEC_BADGE)
      setWhyDecStatus(DEFAULT_WHY_DEC_STATUS)
      setWhyDecCaption(DEFAULT_WHY_DEC_CAPTION)
      setWhyDecAlt(DEFAULT_WHY_DEC_ALT)
      try {
        await cmsService.resetWhyDecContent()
        triggerToast('Why DEC section restored to official DEC brand image!')
      } catch (err) {
        triggerToast('Local reset applied. Click "Save Changes" to publish.')
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-xl shadow-emerald-600/20 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <button
              onClick={onNavigateToDashboard}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <span>/</span>
            <span className="text-slate-800 font-bold">CMS</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
              <PanelsTopLeft className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                CMS Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Manage dynamic website media, section imagery, and real-time delivery content.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Distinct Page Tabs) */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Home Page</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
            Integrated Delivery
          </span>
        </button>

        <button
          onClick={() => setActiveTab('why-dec')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'why-dec'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Why DEC Page</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-mono">
            BIM Level 2 Spotlight
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: HOME PAGE CMS EDITOR                                    */}
      {/* ============================================================== */}
      {activeTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          {/* Left 6 Columns: Form Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Home: Integrated Delivery Section Image
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 font-medium transition-colors cursor-pointer"
                  title="Reset to official brand image"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Official</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Featured alongside <strong>"ONE TEAM. MULTIPLE DISCIPLINES. INTEGRATED DELIVERY"</strong> on the homepage.
              </p>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={homeFileInputRef}
                onChange={(e) => handleFileUpload(e, 'home')}
                accept="image/*"
                className="hidden"
              />

              {/* Upload Button & Action Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => homeFileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHomeImage(DEFAULT_HOME_IMAGE)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Use Official Brand Asset</span>
                </button>
              </div>

              {/* Image URL Input */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Image Source / URL
                  </label>
                  {homeImage && (
                    <button
                      type="button"
                      onClick={() => setHomeImage('')}
                      className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={homeImage}
                  onChange={(e) => setHomeImage(cleanImageUrlInput(e.target.value))}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text')
                    if (pasted) {
                      e.preventDefault()
                      setHomeImage(cleanImageUrlInput(pasted))
                    }
                  }}
                  placeholder="/uploads/cms/dec_integrated_engineering.jpg"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                {homeImage.startsWith('/uploads/') ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Dynamic Backend Storage: Saved in <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono font-bold">DEC_Backend/uploads/cms</code></span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">
                    Supports server uploads (<code className="font-mono">/uploads/cms/...</code>), local brand paths, or external URLs.
                  </div>
                )}
              </div>

              {/* Overlay Badge Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Floating Badge Headline
                </label>
                <input
                  type="text"
                  value={homeBadge}
                  onChange={(e) => setHomeBadge(e.target.value)}
                  placeholder="Coordinated Engineering Leadership"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Overlay Caption Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Floating Badge Caption
                </label>
                <textarea
                  rows={2}
                  value={homeCaption}
                  onChange={(e) => setHomeCaption(e.target.value)}
                  placeholder="Delivering end-to-end design, authority approvals..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Alt Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SEO Image Alt Text
                </label>
                <input
                  type="text"
                  value={homeAlt}
                  onChange={(e) => setHomeAlt(e.target.value)}
                  placeholder="DEC Integrated Multi-Discipline Engineering..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Save Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Saves to MongoDB and updates homepage.</span>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 6 Columns: WYSIWYG Real-Time Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Live Real-Time Home Preview
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Exact Homepage Card Styling
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0f0f10] border border-slate-800 shadow-xl">
              <div className="text-[11px] font-bold text-[#B08D57] tracking-widest uppercase mb-3 flex items-center gap-2">
                <span>Section Preview: Integrated Delivery</span>
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-[#B08D57]/30 shadow-2xl shadow-black/80 group">
                <img
                  src={getImageUrl(homeImage || DEFAULT_HOME_IMAGE)}
                  alt={homeAlt || DEFAULT_HOME_ALT}
                  className="w-full h-[320px] sm:h-[380px] object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    if (!e.target.dataset.triedFallback) {
                      e.target.dataset.triedFallback = 'true'
                      if (homeImage.startsWith('/uploads/')) {
                        e.target.src = `/images/${homeImage.split('/').pop()}`
                        return
                      }
                      if (homeImage.startsWith('/images/')) {
                        e.target.src = `http://localhost:5174${homeImage}`
                        return
                      }
                    }
                    e.target.src = DEFAULT_HOME_IMAGE
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-white">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B08D57] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{homeBadge || DEFAULT_HOME_BADGE}</span>
                  </div>
                  <p className="text-xs text-[#F5F0E7]/80 mt-1 leading-relaxed">
                    {homeCaption || DEFAULT_HOME_CAPTION}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Status: Connected to Home CMS API</span>
                <a
                  href="http://localhost:5174/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
                >
                  <span>Check Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: WHY DEC PAGE CMS EDITOR                                 */}
      {/* ============================================================== */}
      {activeTab === 'why-dec' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          {/* Left 6 Columns: Form Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Why DEC: BIM Level 2 Coordination Image
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 font-medium transition-colors cursor-pointer"
                  title="Reset to official brand image"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Official</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Featured alongside <strong>"Virtual Construction Before Physical Groundbreaking"</strong> on the <code className="text-blue-600">/why-dec</code> page.
              </p>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={whyDecFileInputRef}
                onChange={(e) => handleFileUpload(e, 'why-dec')}
                accept="image/*"
                className="hidden"
              />

              {/* Upload Button & Action Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => whyDecFileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWhyDecImage(DEFAULT_WHY_DEC_IMAGE)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Use Official Brand Asset</span>
                </button>
              </div>

              {/* Image URL Input */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Image Source / URL
                  </label>
                  {whyDecImage && (
                    <button
                      type="button"
                      onClick={() => setWhyDecImage('')}
                      className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={whyDecImage}
                  onChange={(e) => setWhyDecImage(cleanImageUrlInput(e.target.value))}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text')
                    if (pasted) {
                      e.preventDefault()
                      setWhyDecImage(cleanImageUrlInput(pasted))
                    }
                  }}
                  placeholder="/uploads/cms/why_dec_bim_edge.jpg"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                {whyDecImage.startsWith('/uploads/') ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Dynamic Backend Storage: Saved in <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono font-bold">DEC_Backend/uploads/cms</code></span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">
                    Supports server uploads (<code className="font-mono">/uploads/cms/...</code>), local brand paths, or external URLs.
                  </div>
                )}
              </div>

              {/* Floating Badge Text & Status Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Floating Badge Headline
                  </label>
                  <input
                    type="text"
                    value={whyDecBadge}
                    onChange={(e) => setWhyDecBadge(e.target.value)}
                    placeholder="Federated 3D Coordination"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Green Status Tag
                  </label>
                  <input
                    type="text"
                    value={whyDecStatus}
                    onChange={(e) => setWhyDecStatus(e.target.value)}
                    placeholder="BIM LEVEL 2 ACTIVE"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-600 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Overlay Caption Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Floating Badge Caption
                </label>
                <textarea
                  rows={2}
                  value={whyDecCaption}
                  onChange={(e) => setWhyDecCaption(e.target.value)}
                  placeholder="Synchronized Revit & Navisworks models across Architecture..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Alt Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SEO Image Alt Text
                </label>
                <input
                  type="text"
                  value={whyDecAlt}
                  onChange={(e) => setWhyDecAlt(e.target.value)}
                  placeholder="DEC 3D BIM Level 2 Coordination and Clash Detection"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Save Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Saves to MongoDB and updates /why-dec page.</span>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 6 Columns: WYSIWYG Real-Time Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Live Real-Time Why DEC Preview
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Exact /why-dec Card Styling
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0e0e0e] border border-slate-800 shadow-xl">
              <div className="text-[11px] font-bold text-[#B08D57] tracking-widest uppercase mb-3 flex items-center gap-2">
                <span>Section Spotlight: BIM 3D Coordination</span>
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-[#B08D57]/40 shadow-2xl shadow-black/90 group">
                <img
                  src={getImageUrl(whyDecImage || DEFAULT_WHY_DEC_IMAGE)}
                  alt={whyDecAlt || DEFAULT_WHY_DEC_ALT}
                  className="w-full h-[320px] sm:h-[380px] object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    if (!e.target.dataset.triedFallback) {
                      e.target.dataset.triedFallback = 'true'
                      if (whyDecImage.startsWith('/uploads/')) {
                        e.target.src = `/images/${whyDecImage.split('/').pop()}`
                        return
                      }
                      if (whyDecImage.startsWith('/images/')) {
                        e.target.src = `http://localhost:5174${whyDecImage}`
                        return
                      }
                    }
                    e.target.src = DEFAULT_WHY_DEC_IMAGE
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15">
                  <div className="flex items-center justify-between text-xs font-bold text-[#B08D57] uppercase tracking-wider mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#B08D57] animate-pulse" />
                      {whyDecBadge || DEFAULT_WHY_DEC_BADGE}
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      {whyDecStatus || DEFAULT_WHY_DEC_STATUS}
                    </span>
                  </div>
                  <p className="text-xs text-[#F5F0E7]/80 leading-relaxed">
                    {whyDecCaption || DEFAULT_WHY_DEC_CAPTION}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Status: Connected to Why DEC CMS API</span>
                <a
                  href="http://localhost:5174/why-dec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
                >
                  <span>Check Why DEC Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
