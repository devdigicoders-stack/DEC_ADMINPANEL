import { useState } from 'react'
import {
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Cog,
  FolderKanban,
  Image,
  FileText,
  Mail,
  Globe,
  Settings,
  Menu,
  Plus,
  Calendar,
  ChevronRight,
} from 'lucide-react'

export default function Dashboard({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [timeFilter, setTimeFilter] = useState('Last 7 Days')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState('October 26, 2026 | 10:42 AM')
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const toggleDropdown = (name) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  // Traffic data for the golden spline chart
  const trafficData = [
    { date: 'Oct 20', value: 130, visitors: '130' },
    { date: 'Oct 21', value: 290, visitors: '290' },
    { date: 'Oct 22', value: 410, visitors: '410' },
    { date: 'Oct 23', value: 380, visitors: '380' },
    { date: 'Oct 24', value: 620, visitors: '620' },
    { date: 'Oct 25', value: 470, visitors: '470' },
    { date: 'Oct 26', value: 760, visitors: '760' },
  ]

  // Chart SVG coordinates mapping (width: 500, height: 180)
  // X range: 30 to 480, Y range: 160 (0) down to 20 (1000)
  const chartPoints = [
    { x: 30, y: 140 },
    { x: 105, y: 115 },
    { x: 180, y: 95 },
    { x: 255, y: 102 },
    { x: 330, y: 65 },
    { x: 405, y: 90 },
    { x: 480, y: 40 },
  ]

  const splinePath = 'M 30,140 Q 67,128 105,115 T 180,95 T 255,102 T 330,65 T 405,90 T 480,40'
  const fillPath = `${splinePath} L 480,170 L 30,170 Z`

  return (
    <div className="h-screen w-full flex bg-[#0c1424] text-slate-800 antialiased font-sans selection:bg-[#c59b58]/30 selection:text-[#c59b58] overflow-hidden">
      {/* ============================================================== */}
      {/* LEFT SIDEBAR: DARK LUXURY BRAND NAVIGATION                    */}
      {/* ============================================================== */}
      <aside className="w-64 xl:w-72 h-screen bg-[#0c1424] text-slate-300 flex flex-col justify-between shrink-0 border-r border-[#172338]/80 select-none overflow-y-auto">
        <div>
          {/* Top DEC Brand Logo */}
          <div className="h-20 px-6 border-b border-[#172338]/80 flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="DEC - Desentral Engineering Consultancy"
              className="h-12 xl:h-14 w-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-5 space-y-1 text-sm font-medium">
            {/* Dashboard (Active Golden Pill) */}
            <button
              onClick={() => setActiveMenu('Dashboard')}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-gradient-to-r from-[#d8aa5d] via-[#caa055] to-[#ba8f46] text-[#14120e] font-bold shadow-md shadow-[#c59b58]/20 transition-transform active:scale-[0.98] cursor-pointer text-left"
            >
              <LayoutDashboard className="w-5 h-5 text-[#14120e]" />
              <span className="tracking-wide">Dashboard</span>
            </button>

            {/* Services Management */}
            <div>
              <button
                onClick={() => toggleDropdown('services')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#131e33] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Cog className="w-5 h-5 text-slate-400" />
                  <span>Services Management</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openDropdowns.services ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Projects Management */}
            <div>
              <button
                onClick={() => toggleDropdown('projects')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#131e33] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <FolderKanban className="w-5 h-5 text-slate-400" />
                  <span>Projects Management</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openDropdowns.projects ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Gallery Management */}
            <button
              onClick={() => setActiveMenu('Gallery Management')}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#131e33] transition-colors cursor-pointer text-left"
            >
              <Image className="w-5 h-5 text-slate-400" />
              <span>Gallery Management</span>
            </button>

            {/* Blog Management */}
            <button
              onClick={() => setActiveMenu('Blog Management')}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#131e33] transition-colors cursor-pointer text-left"
            >
              <FileText className="w-5 h-5 text-slate-400" />
              <span>Blog Management</span>
            </button>

            {/* Contact Enquiries */}
            <div>
              <button
                onClick={() => toggleDropdown('contact')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#131e33] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span>Contact Enquiries</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openDropdowns.contact ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Website Content */}
            <div>
              <button
                onClick={() => toggleDropdown('content')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#131e33] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <span>Website Content</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openDropdowns.content ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Settings */}
            <div>
              <button
                onClick={() => toggleDropdown('settings')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#131e33] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Settings className="w-5 h-5 text-slate-400" />
                  <span>Settings</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openDropdowns.settings ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer Artwork: Golden Cairo Skyline & Architectural Tagline */}
        <div className="relative pt-6 pb-6 px-6 mt-auto overflow-hidden">
          {/* Gold Decorative Corner Lines */}
          <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none opacity-40">
            <svg className="w-full h-full text-[#c59b58]" viewBox="0 0 100 100" fill="none">
              <line x1="100" y1="20" x2="20" y2="100" stroke="currentColor" strokeWidth="1" />
              <line x1="100" y1="50" x2="50" y2="100" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Golden Egyptian Skyline Vector Graphic (Pyramids, Sphinx, Cairo Tower) */}
          <div className="relative mb-3 h-28 w-full overflow-hidden flex items-end">
            <img
              src="/login-bg.jpg"
              alt="Cairo Heritage Skyline"
              className="w-full h-full object-cover object-left-bottom filter sepia-[0.9] hue-rotate-[5deg] saturate-[2.2] brightness-[0.75] contrast-[1.4] opacity-85"
              style={{ objectPosition: '0% 100%' }}
            />
            {/* Soft Dark Vignette Over Artwork */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1424] via-transparent to-[#0c1424]/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c1424]/60 via-transparent to-[#0c1424]/60" />
          </div>

          {/* Tagline */}
          <div className="relative z-10 space-y-2">
            <p className="text-[#c59b58] font-serif text-[15px] font-medium leading-snug tracking-wide">
              Building a Stronger Future Together
            </p>
            <div className="w-10 h-[2.5px] bg-[#c59b58] rounded-full" />
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONTAINER: TOPBAR & DASHBOARD BODY                       */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f6f2] overflow-y-auto">
        {/* ================= TOP NAVIGATION BAR ================= */}
        <header className="sticky top-0 z-30 h-20 bg-[#0c1424] text-white flex items-center justify-between px-6 lg:px-10 border-b border-[#172338]/80 shadow-sm shrink-0">
          {/* Left: Hamburger & Page Title */}
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl bg-[#131e33]/70 hover:bg-[#17243c] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#1b2b46]/60">
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                ADMIN CONSOLE
              </span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="text-sm font-bold text-white tracking-wide">
                Dashboard Overview
              </span>
            </div>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Notifications Bell */}
            <button className="relative w-10 h-10 rounded-xl bg-[#131e33]/70 hover:bg-[#17243c] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#1b2b46]/60">
              <Bell className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#0c1424] shadow-xs">
                3
              </span>
            </button>

            <div className="h-8 w-px bg-[#18263e]" />

            {/* Profile Pill Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3.5 py-1 px-1.5 rounded-xl hover:bg-[#131e33]/60 cursor-pointer group focus:outline-none transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#caa055] to-[#e4bc75] text-[#14120e] font-bold flex items-center justify-center shadow-md shadow-[#c59b58]/15 text-sm">
                  AD
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-sm font-bold text-white group-hover:text-[#d5a85c] transition-colors">
                    Admin
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Super Admin</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors ml-0.5" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2.5 w-52 bg-[#101b2f] border border-[#1c2d4a] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-[#182845] text-xs">
                    <div className="font-bold text-white">DEC Administrator</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">admin@dec-egypt.com</div>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-[#182845] rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      Sign Out / Switch to Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= DASHBOARD MAIN CONTENT BODY ================= */}
        <main className="p-6 lg:p-8 space-y-6 max-w-[1560px] w-full mx-auto">
          {/* ---------------------------------------------------------- */}
          {/* ROW 1: WELCOME BANNER & DEC EXCELLENCE SIDE CARD            */}
          {/* ---------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Welcome Banner with Sunset Skyline (8 Cols) */}
            <div className="lg:col-span-8 relative overflow-hidden rounded-2xl bg-[#0c1626] text-white p-7 sm:p-8 flex flex-col justify-between shadow-sm min-h-[200px]">
              {/* Skyline Background with Sunset Golden Hour Glow */}
              <div className="absolute inset-y-0 right-0 w-[60%] pointer-events-none select-none overflow-hidden">
                <img
                  src="/login-bg.jpg"
                  alt="Sunset Cairo Skyline Architecture"
                  className="w-full h-full object-cover object-bottom filter contrast-[1.1] brightness-[0.95] sepia-[0.35] hue-rotate-[-10deg]"
                />
                {/* Horizontal Gradient Blend from dark navy on the left to golden sunset on the right */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c1626] via-[#0c1626]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1626]/70 via-transparent to-[#0c1626]/50" />
              </div>

              {/* Banner Left Content */}
              <div className="relative z-10 max-w-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-[#c59b58]" />
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#c59b58] uppercase">
                    WELCOME BACK,
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-white tracking-tight">
                  Admin
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm font-normal">
                  Here's what's happening with your website today.
                </p>
              </div>

              {/* Live Date & Time Stamp */}
              <div className="relative z-10 pt-6">
                <div className="inline-flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <Calendar className="w-4 h-4 text-[#c59b58]" />
                  <span>{currentTime}</span>
                </div>
              </div>
            </div>

            {/* DEC Brand Showcase Card (4 Cols) */}
            <div className="lg:col-span-4 bg-[#fbf9f5] rounded-2xl border border-slate-200/80 p-7 flex flex-col justify-center items-center text-center shadow-xs">
              <img
                src="/logo.png"
                alt="DEC"
                className="h-16 w-auto object-contain filter drop-shadow-xs mb-4"
              />
              <p className="font-serif italic text-base lg:text-lg text-slate-800 font-medium leading-relaxed tracking-wide">
                Engineering Excellence
                <br />
                for a Better Tomorrow
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* ROW 2: FIVE KPI STAT CARDS (Alternating Dark / Light)       */}
          {/* ---------------------------------------------------------- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: Total Services (Dark Blue) */}
            <div className="rounded-2xl p-5 bg-[#0e192c] text-white shadow-xs border border-[#182842]/80 flex flex-col justify-between min-h-[145px]">
              <div className="w-8 h-8 rounded-lg bg-[#192742] flex items-center justify-center text-[#d5a85c]">
                <Globe className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-bold tracking-tight text-white">7</div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">Total Services</div>
                <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-0.5">
                  <span>↑ 12%</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Projects (Light Cream) */}
            <div className="rounded-2xl p-5 bg-white text-slate-900 shadow-xs border border-slate-200/90 flex flex-col justify-between min-h-[145px]">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-bold tracking-tight text-slate-900">12</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Total Projects</div>
                <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
                  <span>↑ 8%</span>
                </div>
              </div>
            </div>

            {/* Card 3: Gallery Images (Dark Blue) */}
            <div className="rounded-2xl p-5 bg-[#0e192c] text-white shadow-xs border border-[#182842]/80 flex flex-col justify-between min-h-[145px]">
              <div className="w-8 h-8 rounded-lg bg-[#192742] flex items-center justify-center text-[#d5a85c]">
                <Image className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-bold tracking-tight text-white">48</div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">Gallery Images</div>
                <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-0.5">
                  <span>↑ 15%</span>
                </div>
              </div>
            </div>

            {/* Card 4: Blog Posts (Light Cream) */}
            <div className="rounded-2xl p-5 bg-white text-slate-900 shadow-xs border border-slate-200/90 flex flex-col justify-between min-h-[145px]">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <FileText className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-bold tracking-tight text-slate-900">24</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Blog Posts</div>
                <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
                  <span>↑ 11%</span>
                </div>
              </div>
            </div>

            {/* Card 5: Contact Inquiries (Dark Blue) */}
            <div className="rounded-2xl p-5 bg-[#0e192c] text-white shadow-xs border border-[#182842]/80 flex flex-col justify-between min-h-[145px] col-span-2 sm:col-span-1">
              <div className="w-8 h-8 rounded-lg bg-[#192742] flex items-center justify-center text-[#d5a85c]">
                <Mail className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-bold tracking-tight text-white">18</div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">Contact Inquiries</div>
                <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-0.5">
                  <span>↑ 20%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* ROW 3: TRAFFIC CHART, QUICK ACTIONS, RECENT ACTIVITY        */}
          {/* ---------------------------------------------------------- */}
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* Website Traffic Line Chart (~42% Width) */}
            <div className="w-full lg:w-[42%] bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between shrink-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Website Traffic</h3>
                <div className="relative">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 pl-3 pr-7 rounded-xl border border-slate-200 focus:outline-none cursor-pointer appearance-none"
                  >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Year</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Chart SVG */}
              <div className="relative w-full h-52 flex items-center justify-center">
                {/* Y-Axis Value Labels */}
                <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[11px] text-slate-400 font-mono select-none pr-2">
                  <span>1,000</span>
                  <span>750</span>
                  <span>500</span>
                  <span>250</span>
                  <span>0</span>
                </div>

                {/* SVG Line and Area */}
                <div className="w-full h-full pl-12 pr-2 pb-6">
                  <svg
                    viewBox="0 0 500 180"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d5a85c" stopOpacity="0.45" />
                        <stop offset="70%" stopColor="#d5a85c" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#d5a85c" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Faint Guide Lines */}
                    <line x1="20" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="57" x2="490" y2="57" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="95" x2="490" y2="95" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="132" x2="490" y2="132" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="170" x2="490" y2="170" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Gradient Area Fill */}
                    <path d={fillPath} fill="url(#trafficGradient)" />

                    {/* Smooth Spline Curve */}
                    <path
                      d={splinePath}
                      fill="none"
                      stroke="#caa055"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />

                    {/* Interactive Points */}
                    {chartPoints.map((pt, idx) => (
                      <g key={idx}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4.5"
                          fill="#ffffff"
                          stroke="#caa055"
                          strokeWidth="2.5"
                          className="cursor-pointer hover:scale-125 transition-transform"
                        />
                      </g>
                    ))}
                  </svg>

                  {/* X-Axis Date Labels */}
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-2 select-none">
                    {trafficData.map((d, i) => (
                      <span key={i}>{d.date}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card (~28% Width) */}
            <div className="w-full lg:w-[28%] bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between shrink-0">
              <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>

              <div className="space-y-2.5">
                {[
                  { title: 'Add New Service', icon: Plus, action: 'add_service' },
                  { title: 'Create New Project', icon: FolderKanban, action: 'create_project' },
                  { title: 'Upload Images', icon: Image, action: 'upload_image' },
                  { title: 'Write Blog Post', icon: FileText, action: 'write_blog' },
                  { title: 'View Enquiries', icon: Mail, action: 'view_enquiries' },
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={idx}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/60 text-slate-800 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#0c1424] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-[#b88a44] transition-colors truncate">
                          {item.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Recent Activity Card (~30% Width - Flex 1) */}
            <div className="w-full lg:flex-1 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                <a
                  href="#view-all"
                  className="text-xs font-semibold text-[#b88a44] hover:underline"
                >
                  View All
                </a>
              </div>

              <div className="space-y-3.5">
                {/* Activity 1: Email enquiry */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      New contact enquiry received
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">From: Ahmed Hassan</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">2 hours ago</div>
                  </div>
                </div>

                {/* Activity 2: Project updated */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">Project updated</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      New project "Cairo Metro" edited
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">4 hours ago</div>
                  </div>
                </div>

                {/* Activity 3: Image uploaded */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Image className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">Image uploaded</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      gallery_20261026_01.jpg
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">6 hours ago</div>
                  </div>
                </div>

                {/* Activity 4: Blog published */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      New blog post published
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      "Sustainable Engineering in Egypt"
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">8 hours ago</div>
                  </div>
                </div>

                {/* Activity 5: Service added */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Cog className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">Service added</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      "Structural Design Consultancy"
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">1 day ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* ROW 4: QUICK OVERVIEW ROW                                  */}
          {/* ---------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Quick Overview</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Services', icon: Cog },
                { name: 'Projects', icon: FolderKanban },
                { name: 'Gallery', icon: Image },
                { name: 'Blog', icon: FileText },
                { name: 'Contact', icon: Mail },
                { name: 'Content', icon: Globe },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <button
                    key={idx}
                    className="p-5 rounded-2xl bg-[#faf8f5] hover:bg-amber-50/70 border border-slate-100 hover:border-[#d5a85c]/40 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-[#d5a85c] text-[#b88a44] group-hover:text-white flex items-center justify-center transition-colors mb-2.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900">
                      {item.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
