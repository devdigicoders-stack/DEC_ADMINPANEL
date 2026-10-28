import { useState, useRef } from 'react'
import {
  Home,
  Image as ImageIcon,
  Building2,
  Layers,
  FolderKanban,
  Mail,
  Layout,
  Settings,
  UploadCloud,
  Link as LinkIcon,
  Eye,
  Save,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  Plus,
  X,
  Phone,
  ArrowRight,
  Menu as MenuIcon
} from 'lucide-react'

// Available banner presets matching the screenshot
const BANNER_PRESETS = [
  {
    id: 1,
    title: 'Giza Pyramids & Sphinx Sunset',
    image: '/login-bg.jpg',
  },
  {
    id: 2,
    title: 'Greater Cairo Metropolis & Tower',
    image: '/projects-gallery/01.jpg',
  },
  {
    id: 3,
    title: 'High-Speed Infrastructure Corridor',
    image: '/projects-gallery/10.jpg',
  },
]

export default function WebsiteContent({
  onNavigateToDashboard,
  onNavigateToServices,
  onNavigateToProjects,
  onNavigateToContact,
  onNavigateToSiteSettings
}) {
  // Active Tab
  const [activeTab, setActiveTab] = useState('banner') // 'banner' | 'about' | 'services' | 'projects' | 'contact' | 'footer' | 'settings'

  // Banner Form State
  const [bannerTitle, setBannerTitle] = useState('Innovative Engineering Solutions for a Better Tomorrow')
  const [bannerSubtitle, setBannerSubtitle] = useState('Design  •  Build  •  Sustain')
  const [buttonText, setButtonText] = useState('Explore Our Services')
  const [buttonLink, setButtonLink] = useState('/services')
  const [selectedImage, setSelectedImage] = useState('/login-bg.jpg')
  const [lastUpdated, setLastUpdated] = useState('Oct 25, 2026 10:45 AM')

  // Banner Features State
  const [features, setFeatures] = useState([
    'Expert Team',
    'Global Standards',
    'On-Time Delivery',
    'Client Satisfaction',
  ])

  // Notification alert
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const fileInputRef = useRef(null)

  // Custom Image Upload Handler
  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setSelectedImage(url)
    }
  }

  // Add Feature Prompt
  const handleAddFeature = () => {
    const newFeature = prompt('Enter new feature title (e.g. ISO 9001 Certified):')
    if (newFeature && newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
    }
  }

  // Remove Feature
  const handleRemoveFeature = (indexToRemove) => {
    setFeatures(features.filter((_, idx) => idx !== indexToRemove))
  }

  // Save changes
  const handleSave = (e) => {
    e.preventDefault()
    setSavedSuccess(true)
    const now = new Date()
    setLastUpdated(
      `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    )
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1680px] w-full mx-auto font-sans antialiased text-slate-800">
      {/* ============================================================== */}
      {/* 1. BREADCRUMB NAVIGATION                                       */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button
          onClick={onNavigateToDashboard}
          className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-slate-700" />
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <span className="text-slate-600">Website Content</span>
        <span className="text-slate-400 font-normal">&gt;</span>
        <span className="text-slate-800 font-semibold">Content Management</span>
      </div>

      {/* ============================================================== */}
      {/* 2. PAGE HEADER                                                 */}
      {/* ============================================================== */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Website Content Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your website content, images, and sections easily without any coding.
        </p>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Homepage banner content saved and published to live website successfully!</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. HORIZONTAL TABS NAVIGATION STRIP                            */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-1 select-none">
        {/* Tab 1: Homepage Banner */}
        <button
          onClick={() => setActiveTab('banner')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'banner'
              ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Homepage Banner</span>
        </button>

        {/* Tab 2: About Us */}
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'about'
              ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span>About Us</span>
        </button>

        {/* Tab 3: Services Section */}
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Services Section</span>
        </button>

        {/* Tab 4: Projects Section */}
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
          <span>Projects Section</span>
        </button>

        {/* Tab 5: Contact Information */}
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-slate-500" />
          <span>Contact Information</span>
        </button>

        {/* Tab 6: Footer */}
        <button
          onClick={() => setActiveTab('footer')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'footer'
              ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-slate-500" />
          <span>Footer</span>
        </button>

        {/* Tab 7: Website Settings */}
        <button
          onClick={() => {
            if (onNavigateToSiteSettings) {
              onNavigateToSiteSettings()
            } else {
              setActiveTab('settings')
            }
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>Website Settings</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 4. MAIN TWO-COLUMN CONTENT GRID                                */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: BANNER FORM & MEDIA (8 COLS)                   */}
        {/* ============================================================ */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6"
        >
          {/* Card Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Homepage Banner
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your website&apos;s hero section banner and main content.
              </p>
            </div>
          </div>

          {/* Banner Images Row (Current Banner + Change Banner) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* 1. Current Banner Preview Box (7 cols) */}
            <div className="md:col-span-7 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Current Banner
              </label>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs h-56 group">
                <img
                  src={selectedImage}
                  alt="Current Hero Banner"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/login-bg.jpg'
                  }}
                  className="w-full h-full object-cover brightness-[0.78]"
                />
                {/* Overlay DEC Header & Text */}
                <div className="absolute inset-0 p-4.5 flex flex-col justify-between text-white bg-gradient-to-t from-black/70 via-black/30 to-black/50">
                  {/* Mini Logo */}
                  <div className="flex items-center justify-between">
                    <img
                      src="/logo.png"
                      alt="DEC Logo"
                      className="h-6 w-auto object-contain filter drop-shadow-md"
                    />
                  </div>

                  {/* Title, Subtitle & Button inside banner preview */}
                  <div className="space-y-1.5 max-w-[85%]">
                    <h3 className="text-sm sm:text-base font-bold leading-tight drop-shadow-md line-clamp-2">
                      {bannerTitle || 'Innovative Engineering Solutions for a Better Tomorrow'}
                    </h3>
                    <p className="text-[10px] text-amber-200/90 tracking-wider font-medium">
                      {bannerSubtitle || 'Design • Build • Sustain'}
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#c59b58] text-[#14120e] text-[9px] font-bold shadow-xs">
                        {buttonText || 'Explore Our Services'} →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Change Banner Image (5 cols) */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Change Banner Image
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleCustomUpload}
                className="hidden"
              />

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-[#b88a44] rounded-2xl bg-slate-50/50 hover:bg-amber-50/20 p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center h-28"
              >
                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                <p className="text-xs font-bold text-slate-800">Click to upload image</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, JPEG (Max 5MB)</p>
              </div>

              {/* Recommended size label */}
              <p className="text-[11px] text-slate-400 pt-0.5">
                Recommended size: 1920 x 800 px
              </p>

              {/* 3 Thumbnails Presets Row */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {BANNER_PRESETS.map((preset) => {
                  const isActive = selectedImage === preset.image
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedImage(preset.image)}
                      title={preset.title}
                      className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                        isActive
                          ? 'border-[#b88a44] ring-2 ring-[#b88a44]/30'
                          : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.image}
                        alt={preset.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/login-bg.jpg'
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Form Field 1: Banner Title */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-800">
              Banner Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              placeholder="Enter banner title..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44] transition-colors"
            />
            <div className="flex justify-end">
              <span className="text-[11px] text-slate-400">{bannerTitle.length}/100</span>
            </div>
          </div>

          {/* Form Field 2: Banner Subtitle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Banner Subtitle</label>
            <input
              type="text"
              maxLength={100}
              value={bannerSubtitle}
              onChange={(e) => setBannerSubtitle(e.target.value)}
              placeholder="e.g. Design • Build • Sustain"
              className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44] transition-colors"
            />
            <div className="flex justify-end">
              <span className="text-[11px] text-slate-400">{bannerSubtitle.length}/100</span>
            </div>
          </div>

          {/* Form Fields Row 3: Button Text & Button Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Button Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Explore Our Services"
                className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44] transition-colors"
              />
            </div>

            {/* Button Link */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Button Link</label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  placeholder="/services"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Form Section 4: Banner Features (Optional) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-amber-50 text-[#b88a44] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Banner Features <span className="text-slate-400 font-normal">(Optional)</span>
              </span>
            </div>

            {/* Features Pills List */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs group"
                >
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="p-0.5 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors ml-0.5"
                    title="Remove feature"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add Feature Button */}
              <button
                type="button"
                onClick={handleAddFeature}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-[#b88a44] text-xs font-semibold text-slate-600 hover:text-[#b88a44] hover:bg-amber-50/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Feature</span>
              </button>
            </div>
          </div>

          {/* Card Footer: Last Updated & Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400 self-start sm:self-auto">
              Last Updated: {lastUpdated}
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Preview Changes */}
              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Preview Changes</span>
              </button>

              {/* Save Changes */}
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#0c1424] hover:bg-[#16233b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0c1424]/20 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#c59b58]" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: LIVE PREVIEW & QUICK CONTENT LINKS (4 COLS)   */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Live Preview Phone/Card Frame */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Eye className="w-4 h-4 text-slate-600" />
                <span>Live Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors"
                title="Open full preview"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile/Card Live Mockup */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm h-64 select-none">
              <img
                src={selectedImage}
                alt="Banner preview"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/login-bg.jpg'
                }}
                className="w-full h-full object-cover brightness-[0.75]"
              />

              {/* Mockup Overlay Content */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-white bg-gradient-to-t from-black/80 via-black/40 to-black/60">
                {/* Mockup Header */}
                <div className="flex items-center justify-between">
                  <img
                    src="/logo.png"
                    alt="DEC Logo"
                    className="h-6 w-auto object-contain filter drop-shadow-md"
                  />
                  <MenuIcon className="w-5 h-5 text-white/90" />
                </div>

                {/* Hero Title & Button */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold leading-snug drop-shadow-md line-clamp-3">
                    {bannerTitle || 'Innovative Engineering Solutions for a Better Tomorrow'}
                  </h4>
                  <p className="text-[10px] text-amber-200/90 tracking-wide font-medium">
                    {bannerSubtitle || 'Design • Build • Sustain'}
                  </p>
                  <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c59b58] text-[#14120e] text-[10px] font-bold shadow-xs">
                      {buttonText || 'Explore Our Services'} →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Content Links */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight mb-1">
              Quick Content Links
            </h3>

            {/* Link 1: Update About Us Section */}
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#0c1424] text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-slate-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-[#b88a44] transition-colors truncate">
                    Update About Us Section
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    Edit company information, history, mission & vision
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 ml-2" />
            </button>

            {/* Link 2: Manage Services */}
            <button
              type="button"
              onClick={() => {
                if (onNavigateToServices) onNavigateToServices()
                else setActiveTab('services')
              }}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#0c1424] text-white flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-slate-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-[#b88a44] transition-colors truncate">
                    Manage Services
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    Update services offered on your website
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 ml-2" />
            </button>

            {/* Link 3: Manage Projects */}
            <button
              type="button"
              onClick={() => {
                if (onNavigateToProjects) onNavigateToProjects()
                else setActiveTab('projects')
              }}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#0c1424] text-white flex items-center justify-center shrink-0">
                  <FolderKanban className="w-4 h-4 text-slate-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-[#b88a44] transition-colors truncate">
                    Manage Projects
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    Showcase your completed projects
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 ml-2" />
            </button>

            {/* Link 4: Manage Contact Details */}
            <button
              type="button"
              onClick={() => {
                if (onNavigateToContact) onNavigateToContact()
                else setActiveTab('contact')
              }}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#0c1424] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-slate-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-[#b88a44] transition-colors truncate">
                    Manage Contact Details
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    Update address, phone, email and social links
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 ml-2" />
            </button>
          </div>

          {/* Card 3: Tips Box */}
          <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs space-y-2 text-sky-900">
            <div className="flex items-center gap-2 font-bold text-sky-950">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Tips</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-sky-800/90 pl-1">
              <li>• Use high quality images (1920x800px recommended)</li>
              <li>• Keep content SEO friendly</li>
              <li>• Changes will be visible on live website after saving</li>
              <li>• Make sure to click &apos;Save Changes&apos; before leaving</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. FULL PREVIEW MODAL                                          */}
      {/* ============================================================== */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#b88a44]" />
                <span className="font-bold text-sm text-slate-900">Hero Section Full Preview</span>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hero Full Banner */}
            <div className="relative h-96 w-full">
              <img
                src={selectedImage}
                alt="Banner"
                className="w-full h-full object-cover brightness-[0.72]"
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-between text-white bg-gradient-to-t from-black/80 via-black/30 to-black/60">
                <div className="flex items-center justify-between">
                  <img src="/logo.png" alt="DEC Logo" className="h-10 w-auto object-contain" />
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span>Home</span>
                    <span>About Us</span>
                    <span>Services</span>
                    <span>Projects</span>
                    <span>Contact</span>
                  </div>
                </div>

                <div className="space-y-3 max-w-xl">
                  <h2 className="text-3xl font-serif font-bold leading-tight drop-shadow-md">
                    {bannerTitle}
                  </h2>
                  <p className="text-sm text-amber-200 tracking-wider font-medium">
                    {bannerSubtitle}
                  </p>
                  <div className="pt-2">
                    <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d8aa5d] to-[#ba8f46] text-[#14120e] font-bold text-xs shadow-lg flex items-center gap-2">
                      <span>{buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0c1424] text-white font-semibold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
