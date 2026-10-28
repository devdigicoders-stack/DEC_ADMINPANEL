import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  LayoutDashboard,
  Cog,
  FolderKanban,
  Image,
  FileText,
  Mail,
  Globe,
  Settings,
  Menu,
  Bell,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  UploadCloud,
  Plus,
  LayoutList,
  MessageSquare,
  Briefcase,
  LogOut,
  ChevronRight} from 'lucide-react'
import { VIEW_TO_PATH, getActiveViewFromPath } from '../../constants/navigation.js'
import { inquiryService } from '../../services/inquiryService.js'
import settingService from '../../services/settingService.js'
import { getImageUrl } from '../../services/api.js'

export default function AdminShell({ currentView: propCurrentView, onNavigate, onLogout, children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const currentView = propCurrentView || getActiveViewFromPath(location.pathname)

  const [openDropdowns, setOpenDropdowns] = useState({
    services: currentView === 'services' || currentView === 'add-service',
    projects: currentView === 'projects' || currentView === 'add-project',
    gallery: currentView === 'gallery' || currentView === 'upload-images',
    blog: currentView === 'blog' || currentView === 'create-blog',
    contact: currentView === 'contact' || currentView === 'messages' || currentView === 'all-enquiries',
    content: currentView === 'website-content' || currentView === 'content-management' || currentView === 'site-settings',
    settings: currentView === 'settings',
  })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Dynamic Header State
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false)
  const [headerSearchQuery, setHeaderSearchQuery] = useState('')
  const [agencySlogan, setAgencySlogan] = useState('Building a Stronger Future Together')

  // Fetch live notifications count, recent inquiries and agency slogan
  useEffect(() => {
    let isMounted = true

    const fetchHeaderData = async () => {
      try {
        const [statsRes, inqRes, settingsRes] = await Promise.allSettled([
          inquiryService.getStats(),
          inquiryService.getAll({ limit: 4, sort: 'newest' }),
          settingService.getSettings(),
        ])

        if (!isMounted) return

        if (statsRes.status === 'fulfilled' && statsRes.value?.data?.new !== undefined) {
          setUnreadCount(statsRes.value.data.new)
        }

        if (inqRes.status === 'fulfilled' && Array.isArray(inqRes.value?.data)) {
          setRecentNotifications(inqRes.value.data)
        }

        if (settingsRes.status === 'fulfilled' && settingsRes.value?.agencySlogan) {
          setAgencySlogan(settingsRes.value.agencySlogan)
        }
      } catch (err) {
        console.warn('Header live data fetch note:', err)
      }
    }

    fetchHeaderData()

    // Periodically poll for new inquiries
    const interval = setInterval(fetchHeaderData, 45000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [location.pathname])

  // Close menus on route change
  useEffect(() => {
    setShowUserMenu(false)
    setShowNotificationsMenu(false)
  }, [location.pathname])

  const handleHeaderSearch = (e) => {
    e.preventDefault()
    if (!headerSearchQuery.trim()) return
    const q = headerSearchQuery.trim()
    navigate(`/projects?search=${encodeURIComponent(q)}`)
  }

  // Keep dropdown open when active path changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeView = getActiveViewFromPath(location.pathname)
      if (activeView === 'projects' || activeView === 'add-project') {
        setOpenDropdowns((prev) => ({ ...prev, projects: true }))
      } else if (activeView === 'services' || activeView === 'add-service') {
        setOpenDropdowns((prev) => ({ ...prev, services: true }))
      } else if (activeView === 'gallery' || activeView === 'upload-images') {
        setOpenDropdowns((prev) => ({ ...prev, gallery: true }))
      } else if (activeView === 'blog' || activeView === 'create-blog') {
        setOpenDropdowns((prev) => ({ ...prev, blog: true }))
      } else if (activeView === 'contact' || activeView === 'messages') {
        setOpenDropdowns((prev) => ({ ...prev, contact: true }))
      } else if (activeView === 'website-content' || activeView === 'site-settings') {
        setOpenDropdowns((prev) => ({ ...prev, content: true }))
      } else if (activeView === 'settings') {
        setOpenDropdowns((prev) => ({ ...prev, settings: true }))
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [location.pathname])

  const toggleDropdown = (name, defaultView) => {
    const isCurrentlyOpen = !!openDropdowns[name]
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))

    // If opening, navigate to default view for that section
    if (!isCurrentlyOpen && defaultView) {
      if (onNavigate) onNavigate(defaultView)
      const targetPath = VIEW_TO_PATH[defaultView] || `/${defaultView}`
      navigate(targetPath)
    }
  }

  const handleNavClick = (view) => {
    if (onNavigate) onNavigate(view)
    const targetPath = VIEW_TO_PATH[view] || `/${view}`
    navigate(targetPath)

    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(false)
    }
  }

  const handleLogout = () => {
    if (onLogout) onLogout()
    logout()
    navigate('/login', { replace: true })
  }

  const isServicesActive = currentView === 'services' || currentView === 'add-service'
  const isProjectsActive = currentView === 'projects' || currentView === 'add-project'
  const isGalleryActive = currentView === 'gallery' || currentView === 'upload-images'
  const isBlogActive = currentView === 'blog' || currentView === 'create-blog'
  const isContactActive = currentView === 'contact' || currentView === 'messages' || currentView === 'all-enquiries'
  const isCareersActive = currentView === 'careers' || currentView === 'career-applications'
  const isContentActive = currentView === 'website-content' || currentView === 'content-management' || currentView === 'site-settings'
  const isSettingsActive = currentView === 'settings'

  return (
    <div className="h-screen w-full flex bg-[#0c1424] text-slate-800 antialiased font-sans selection:bg-[#c59b58]/30 selection:text-[#c59b58] overflow-hidden">
      {/* ============================================================== */}
      {/* MOBILE BACKDROP OVERLAY                                        */}
      {/* ============================================================== */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ============================================================== */}
      {/* COMMON LEFT SIDEBAR: RESPONSIVE DESKTOP + MOBILE DRAWER       */}
      {/* ============================================================== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 xl:w-72 h-screen bg-[#0c1424] text-slate-300 flex flex-col justify-between shrink-0 border-r border-[#172338]/80 select-none transform transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top DEC Brand Logo (Height matches Top Header h-20) */}
        <div className="h-20 px-5 sm:px-6 border-b border-[#172338]/80 flex items-center justify-between shrink-0 bg-[#0c1424]">
          <img
            src="/logo.png"
            alt="DEC - Desentral Engineering Consultancy"
            className="h-11 xl:h-13 w-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] cursor-pointer"
            onClick={() => handleNavClick('dashboard')}
          />
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#131e33] lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Links (Middle area scrolls IF screen is short) */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 text-sm font-medium min-h-0 custom-scrollbar">
          {/* 1. Dashboard Menu Item */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
              currentView === 'dashboard'
                ? 'bg-gradient-to-r from-[#d8aa5d] via-[#caa055] to-[#ba8f46] text-[#14120e] font-bold shadow-md shadow-[#c59b58]/20'
                : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
            }`}
          >
            <LayoutDashboard
              className={`w-4.5 h-4.5 shrink-0 ${
                currentView === 'dashboard' ? 'text-[#14120e]' : 'text-slate-400'
              }`}
            />
            <span className="tracking-wide text-xs sm:text-sm">Dashboard</span>
          </button>

          {/* 2. Services Management Menu Item (with Submenu) */}
          <div>
            <button
              onClick={() => toggleDropdown('services', 'services')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                isServicesActive
                  ? 'bg-gradient-to-r from-[#d8aa5d] via-[#caa055] to-[#ba8f46] text-[#14120e] font-bold shadow-md shadow-[#c59b58]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Cog
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isServicesActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
                <span className="tracking-wide text-xs sm:text-sm truncate">
                  Services Management
                </span>
              </div>
              {openDropdowns.services ? (
                <ChevronUp
                  className={`w-4 h-4 shrink-0 ${
                    isServicesActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              ) : (
                <ChevronDown
                  className={`w-4 h-4 shrink-0 ${
                    isServicesActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              )}
            </button>

            {/* Expanded Submenu for Services */}
            {openDropdowns.services && (
              <div className="mt-1 ml-3.5 pl-3 border-l border-[#223554]/80 space-y-1">
                <button
                  onClick={() => handleNavClick('services')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'services'
                      ? 'bg-[#c59b58]/35 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  <span>All Services</span>
                </button>
                <button
                  onClick={() => handleNavClick('add-service')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer block ${
                    currentView === 'add-service'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  Add New Service
                </button>
              </div>
            )}
          </div>

          {/* 3. Projects Management */}
          <div>
            <button
              onClick={() => toggleDropdown('projects', 'projects')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                isProjectsActive
                  ? 'bg-gradient-to-r from-[#d8aa5d] via-[#caa055] to-[#ba8f46] text-[#14120e] font-bold shadow-md shadow-[#c59b58]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FolderKanban
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isProjectsActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
                <span className="tracking-wide text-xs sm:text-sm truncate">
                  Projects Management
                </span>
              </div>
              {openDropdowns.projects ? (
                <ChevronUp
                  className={`w-4 h-4 shrink-0 ${
                    isProjectsActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              ) : (
                <ChevronDown
                  className={`w-4 h-4 shrink-0 ${
                    isProjectsActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              )}
            </button>

            {/* Expanded Submenu for Projects */}
            {openDropdowns.projects && (
              <div className="mt-1 ml-3.5 pl-3 border-l border-[#223554]/80 space-y-1">
                <button
                  onClick={() => handleNavClick('add-project')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'add-project'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Project</span>
                </button>
                <button
                  onClick={() => handleNavClick('projects')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'projects'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5 text-slate-400" />
                  <span>All Projects</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Gallery Management */}
          <div>
            <button
              onClick={() => toggleDropdown('gallery', 'gallery')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                isGalleryActive
                  ? 'bg-gradient-to-r from-[#d8aa5d] via-[#caa055] to-[#ba8f46] text-[#14120e] font-bold shadow-md shadow-[#c59b58]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Image
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isGalleryActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
                <span className="tracking-wide text-xs sm:text-sm truncate">
                  Gallery Management
                </span>
              </div>
              {openDropdowns.gallery ? (
                <ChevronUp
                  className={`w-4 h-4 shrink-0 ${
                    isGalleryActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              ) : (
                <ChevronDown
                  className={`w-4 h-4 shrink-0 ${
                    isGalleryActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              )}
            </button>

            {/* Expanded Submenu for Gallery */}
            {openDropdowns.gallery && (
              <div className="mt-1 ml-3.5 pl-3 border-l border-[#223554]/80 space-y-1">
                <button
                  onClick={() => handleNavClick('gallery')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'gallery'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>All Images</span>
                </button>
                <button
                  onClick={() => handleNavClick('upload-images')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'upload-images'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Images</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Blog Management */}
          <div>
            <button
              onClick={() => toggleDropdown('blog', 'blog')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                isBlogActive
                  ? 'bg-gradient-to-r from-[#d8aa5d] via-[#caa055] to-[#ba8f46] text-[#14120e] font-bold shadow-md shadow-[#c59b58]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isBlogActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
                <span className="tracking-wide text-xs sm:text-sm truncate">
                  Blog Management
                </span>
              </div>
              {openDropdowns.blog ? (
                <ChevronUp
                  className={`w-4 h-4 shrink-0 ${
                    isBlogActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              ) : (
                <ChevronDown
                  className={`w-4 h-4 shrink-0 ${
                    isBlogActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              )}
            </button>

            {/* Expanded Submenu for Blog */}
            {openDropdowns.blog && (
              <div className="mt-1 ml-3.5 pl-3 border-l border-[#223554]/80 space-y-1">
                <button
                  onClick={() => handleNavClick('create-blog')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'create-blog'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Blog</span>
                </button>
                <button
                  onClick={() => handleNavClick('blog')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'blog'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5 text-slate-400" />
                  <span>All Blogs</span>
                </button>
              </div>
            )}
          </div>

          {/* 6. Contact Enquiries */}
          <div>
            <button
              onClick={() => toggleDropdown('contact', 'contact')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                isContactActive
                  ? 'bg-gradient-to-r from-[#d8aa5d] via-[#caa055] to-[#ba8f46] text-[#14120e] font-bold shadow-md shadow-[#c59b58]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Mail
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isContactActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
                <span className="tracking-wide text-xs sm:text-sm truncate">
                  Contact Enquiries
                </span>
              </div>
              {openDropdowns.contact ? (
                <ChevronUp
                  className={`w-4 h-4 shrink-0 ${
                    isContactActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              ) : (
                <ChevronDown
                  className={`w-4 h-4 shrink-0 ${
                    isContactActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              )}
            </button>

            {/* Expanded Submenu for Contact */}
            {openDropdowns.contact && (
              <div className="mt-1 ml-3.5 pl-3 border-l border-[#223554]/80 space-y-1">
                <button
                  onClick={() => handleNavClick('contact')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'contact' || currentView === 'all-enquiries'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>All Enquiries</span>
                </button>
                <button
                  onClick={() => handleNavClick('messages')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'messages'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <MessageSquare
                    className={`w-3.5 h-3.5 ${
                      currentView === 'messages' ? 'text-[#f6d79a]' : 'text-slate-400'
                    }`}
                  />
                  <span>Messages</span>
                </button>
              </div>
            )}
          </div>

          {/* 7. Career Applications */}
          <div>
            <button
              onClick={() => handleNavClick('careers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                isCareersActive
                  ? 'bg-gradient-to-r from-[#d8aa5d] via-[#caa055] to-[#ba8f46] text-[#14120e] font-bold shadow-md shadow-[#c59b58]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Briefcase
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isCareersActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
                <span className="tracking-wide text-xs sm:text-sm truncate">
                  Career Applications
                </span>
              </div>
            </button>
          </div>

          {/* 8. Website Content (Temporarily commented out - enable when needed) */}
          {/*
          <div>
            <button
              onClick={() => toggleDropdown('content', 'website-content')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                isContentActive
                  ? 'bg-gradient-to-r from-[#d8aa5d] via-[#caa055] to-[#ba8f46] text-[#14120e] font-bold shadow-md shadow-[#c59b58]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Globe
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isContentActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
                <span className="tracking-wide text-xs sm:text-sm truncate">
                  Website Content
                </span>
              </div>
              {openDropdowns.content ? (
                <ChevronUp
                  className={`w-4 h-4 shrink-0 ${
                    isContentActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              ) : (
                <ChevronDown
                  className={`w-4 h-4 shrink-0 ${
                    isContentActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              )}
            </button>

            {openDropdowns.content && (
              <div className="mt-1 ml-3.5 pl-3 border-l border-[#223554]/80 space-y-1">
                <button
                  onClick={() => handleNavClick('website-content')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'website-content' || currentView === 'content-management'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <Plus
                    className={`w-3.5 h-3.5 ${
                      currentView === 'website-content' || currentView === 'content-management'
                        ? 'text-[#f6d79a]'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>Content Management</span>
                </button>
                <button
                  onClick={() => handleNavClick('site-settings')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'site-settings'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <Settings
                    className={`w-3.5 h-3.5 ${
                      currentView === 'site-settings' ? 'text-[#f6d79a]' : 'text-slate-400'
                    }`}
                  />
                  <span>Site Settings</span>
                </button>
              </div>
            )}
          </div>
          */}

          {/* 9. Settings */}
          <div>
            <button
              onClick={() => toggleDropdown('settings', 'settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                isSettingsActive
                  ? 'bg-gradient-to-r from-[#d8aa5d] via-[#caa055] to-[#ba8f46] text-[#14120e] font-bold shadow-md shadow-[#c59b58]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Settings
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isSettingsActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
                <span className="tracking-wide text-xs sm:text-sm truncate">Settings</span>
              </div>
              {openDropdowns.settings ? (
                <ChevronUp
                  className={`w-4 h-4 shrink-0 ${
                    isSettingsActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              ) : (
                <ChevronDown
                  className={`w-4 h-4 shrink-0 ${
                    isSettingsActive ? 'text-[#14120e]' : 'text-slate-400'
                  }`}
                />
              )}
            </button>

            {/* Expanded Submenu for Settings */}
            {openDropdowns.settings && (
              <div className="mt-1 ml-3.5 pl-3 border-l border-[#223554]/80 space-y-1">
                <button
                  onClick={() => handleNavClick('settings')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentView === 'settings'
                      ? 'bg-[#c59b58]/40 text-[#f6d79a] shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#131e33]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>General & Security</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* ============================================================== */}
        {/* SIDEBAR FOOTER: PINNED AT BOTTOM (SHRINK-0, NEVER GETS CUT OFF)*/}
        {/* ============================================================== */}
        <div className="relative pt-3 pb-4 px-5 border-t border-[#172338]/80 bg-[#0a1120] shrink-0 overflow-hidden">
          {/* Gold Decorative Corner Lines */}
          <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none opacity-40">
            <svg className="w-full h-full text-[#c59b58]" viewBox="0 0 100 100" fill="none">
              <line x1="100" y1="20" x2="20" y2="100" stroke="currentColor" strokeWidth="1" />
              <line x1="100" y1="50" x2="50" y2="100" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Egyptian Skyline Artwork (Compact height so text always fits) */}
          <div className="relative mb-2 h-16 xl:h-20 w-full overflow-hidden flex items-end rounded-lg">
            <img
              src="/login-bg.jpg"
              alt="Cairo Heritage Skyline"
              className="w-full h-full object-cover filter sepia-[0.9] hue-rotate-[5deg] saturate-[2.2] brightness-[0.75] contrast-[1.4] opacity-85"
              style={{ objectPosition: '0% 100%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-transparent to-[#0a1120]/70" />
          </div>

          {/* Tagline & Gold Accent Bar */}
          <div className="relative z-10 space-y-1.5">
            <p className="text-[#c59b58] font-serif text-xs xl:text-[13px] font-medium leading-snug tracking-wide">
              {agencySlogan || 'Building a Stronger Future Together'}
            </p>
            <div className="w-8 h-[2px] bg-[#c59b58] rounded-full" />
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONTAINER: TOPBAR & DYNAMIC PAGE BODY                     */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f6f2] overflow-y-auto">
        {/* ================= COMMON TOP NAVIGATION BAR (FULLY DYNAMIC) ================= */}
        <header className="sticky top-0 z-30 h-20 bg-[#0c1424] text-white flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-[#172338]/80 shadow-sm shrink-0">
          {/* Left: Mobile Hamburger Toggle & Search Box */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-[#131e33]"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Interactive Search Box */}
            <form onSubmit={handleHeaderSearch} className="relative w-52 sm:w-72 md:w-84">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                placeholder="Search projects, clients..."
                className="w-full bg-[#131e33] border border-[#20314f] text-slate-200 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl pl-10 pr-8 py-2 focus:outline-none focus:border-[#c59b58] transition-colors shadow-2xs"
              />
              {headerSearchQuery && (
                <button
                  type="button"
                  onClick={() => setHeaderSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Right: Status Pill, Notifications & Profile */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Live System Status Pill */}
            <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#131e33] text-[#c59b58] border border-[#20314f] shadow-2xs select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="tracking-wide text-[11px] font-bold">DEC Portal Active</span>
            </div>

            {/* Live Notifications Bell with Dynamic Badge & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotificationsMenu(!showNotificationsMenu)
                  setShowUserMenu(false)
                }}
                className={`relative p-2 transition-all cursor-pointer rounded-xl ${
                  showNotificationsMenu || currentView === 'notifications'
                    ? 'bg-[#131e33] text-amber-300 ring-2 ring-[#c59b58]/50 shadow-md'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-[#131e33]'
                }`}
                title="Notifications & Activity Center"
              >
                <Bell className="w-5 h-5 fill-amber-400/20" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#0c1424] shadow-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dynamic Notifications Dropdown Preview */}
              {showNotificationsMenu && (
                <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2.5 w-80 sm:w-96 bg-[#101b2f] border border-[#1c2d4a] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-md">
                  <div className="px-4 py-2.5 border-b border-[#182845] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#c59b58]" />
                      <span className="text-xs font-bold text-white">Live Inquiries & Alerts</span>
                    </div>
                    {unreadCount > 0 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {unreadCount} New
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">All Caught Up</span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#182845] custom-scrollbar">
                    {recentNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No recent inquiries or alerts.
                      </div>
                    ) : (
                      recentNotifications.map((item) => (
                        <div
                          key={item._id || item.id}
                          onClick={() => {
                            setShowNotificationsMenu(false)
                            if (item.type === 'career') {
                              navigate('/careers')
                            } else {
                              navigate('/contact')
                            }
                          }}
                          className="p-3 hover:bg-[#182845] cursor-pointer transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white truncate max-w-[180px]">
                              {item.fullName || 'Anonymous Client'}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${
                                item.status === 'New'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : item.status === 'In Progress'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {item.status || 'New'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 truncate">
                            {item.subject || item.message || 'New form submission'}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span className="capitalize text-[#c59b58] font-medium">
                              {item.type || 'Consultation'}
                            </span>
                            <span>
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-[#182845] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotificationsMenu(false)
                        navigate('/contact')
                      }}
                      className="text-[#c59b58] hover:text-[#e0b875] font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Inquiries</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotificationsMenu(false)
                        navigate('/notifications')
                      }}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Activity Center
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown (Fully Dynamic) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(!showUserMenu)
                  setShowNotificationsMenu(false)
                }}
                className="flex items-center gap-2 sm:gap-3 py-1 px-1.5 rounded-xl hover:bg-[#131e33]/60 cursor-pointer group focus:outline-none transition-colors"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#c59b58] to-[#dfbf82] text-[#0c1424] font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-xs ring-2 ring-[#c59b58]/30 overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img src={getImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#d5a85c] transition-colors truncate max-w-[130px]">
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[#c59b58] mt-0.5 truncate max-w-[130px]">
                    {user?.title || (user?.role === 'superadmin' ? 'Super Admin' : 'Admin')}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-white transition-transform duration-200 ml-0.5 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2.5 w-64 bg-[#101b2f] border border-[#1c2d4a] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-md">
                  <div className="px-4 py-3 border-b border-[#182845] text-xs">
                    <div className="font-bold text-white text-sm truncate">{user?.name || 'DEC Administrator'}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{user?.email || 'admin@dec-consultancy.com'}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c59b58]/20 text-[#f6d79a] border border-[#c59b58]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{user?.role === 'superadmin' ? 'Super Administrator' : 'Grade A Admin'}</span>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false)
                        navigate('/settings')
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-200 hover:text-white hover:bg-[#182845] rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#c59b58]" />
                      <span>Profile & Account Settings</span>
                    </button>

                    <a
                      href={import.meta.env.VITE_WEBSITE_URL || 'http://localhost:5174'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-3.5 py-2 text-slate-200 hover:text-white hover:bg-[#182845] rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      <span>View Live Website</span>
                    </a>

                    <div className="border-t border-[#182845] my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-[#182845] rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= DYNAMIC PAGE CONTENT ================= */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
