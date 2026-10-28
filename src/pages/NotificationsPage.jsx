import { useState } from 'react'
import {
  Home,
  Bell,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Settings,
  HardHat,
  FolderKanban,
  FileText,
  UserCheck
} from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Urgent Geotechnical Sign-Off Requested',
    description: 'Eng. Tarek Mansour requested formal sign-off for Nile Commercial Tower foundation pile depths (basement sector B).',
    category: 'projects',
    priority: 'urgent',
    time: '12 minutes ago',
    date: 'Today, 10:42 AM',
    unread: true,
    targetView: 'messages',
    actionLabel: 'View in Messages',
    meta: 'Project: Nile Commercial Tower • Sector B',
  },
  {
    id: 2,
    title: 'New High-Value Project Consultation Enquiry',
    description: 'Dr. Mona El-Shazly submitted an enquiry regarding Specialized Surgical Center acoustic isolation drawings.',
    category: 'enquiries',
    priority: 'high',
    time: '45 minutes ago',
    date: 'Today, 09:15 AM',
    unread: true,
    targetView: 'contact',
    actionLabel: 'Review Enquiry',
    meta: 'Client: Al-Ahly Medical Complex',
  },
  {
    id: 3,
    title: '3D BIM Clash Detection Completed',
    description: 'Automated Revit BIM coordination test for Giza Boutique Hotel finished with 0 structural clashes detected.',
    category: 'projects',
    priority: 'normal',
    time: '2 hours ago',
    date: 'Today, 08:30 AM',
    unread: true,
    targetView: 'projects',
    actionLabel: 'View Project Details',
    meta: 'BIM Model: GizaHotel_Arch_v4.2.ifc',
  },
  {
    id: 4,
    title: 'Weekly Inclinometer Deflection Report Uploaded',
    description: 'Underground Station Shoring field sensors recorded normal structural deflection within safety tolerance (+1.2mm).',
    category: 'projects',
    priority: 'normal',
    time: 'Yesterday',
    date: 'Oct 25, 04:15 PM',
    unread: false,
    targetView: 'projects',
    actionLabel: 'Inspect Telemetry',
    meta: 'Station 4 Diaphragm Wall',
  },
  {
    id: 5,
    title: 'Environmental Compliance Certificate Approved',
    description: 'Ministry of Environment approved the Solar Microgrid Infrastructure feasibility study report with distinction.',
    category: 'projects',
    priority: 'high',
    time: 'Yesterday',
    date: 'Oct 25, 02:00 PM',
    unread: false,
    targetView: 'projects',
    actionLabel: 'View Compliance Files',
    meta: 'Mediterranean Energy Consortium',
  },
  {
    id: 6,
    title: 'Scheduled Nightly Database & Media Backup Successful',
    description: 'Portal database, portfolio blueprints, and image gallery assets (2.4 GB) securely backed up to AWS S3 Frankfurt.',
    category: 'system',
    priority: 'normal',
    time: '2 days ago',
    date: 'Oct 24, 03:00 AM',
    unread: false,
    targetView: 'settings',
    actionLabel: 'View Backup Logs',
    meta: 'Backup Hash: sha256:7f4a...92b',
  },
  {
    id: 7,
    title: 'Security Alert: Admin Login from Recognized Session',
    description: 'Successful administrative login from Cairo, Egypt (IP: 197.38.12.89) via Google Chrome on Windows.',
    category: 'system',
    priority: 'normal',
    time: '2 days ago',
    date: 'Oct 24, 11:20 AM',
    unread: false,
    targetView: 'settings',
    actionLabel: 'Security Settings',
    meta: 'User: superadmin@dec-consultancy.com',
  },
  {
    id: 8,
    title: 'Batch Image Upload Classified in Gallery',
    description: '14 high-resolution construction drone captures assigned to Greater Cairo Metropolis project gallery.',
    category: 'gallery',
    priority: 'normal',
    time: '3 days ago',
    date: 'Oct 23, 05:10 PM',
    unread: false,
    targetView: 'gallery',
    actionLabel: 'Go to Gallery',
    meta: 'Category: Infrastructure & High-Rise',
  },
]

export default function NotificationsPage({
  onNavigateToDashboard,
  onNavigateToView
}) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'unread' | 'urgent' | 'projects' | 'enquiries' | 'system'
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Mark all as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
    showToast('All notifications marked as read!')
  }

  // Clear all read
  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((item) => item.unread))
    showToast('Read notifications removed!')
  }

  // Toggle single unread status
  const handleToggleRead = (id, e) => {
    if (e) e.stopPropagation()
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: !item.unread } : item))
    )
  }

  // Delete single notification
  const handleDelete = (id, e) => {
    if (e) e.stopPropagation()
    setNotifications((prev) => prev.filter((item) => item.id !== id))
    showToast('Notification deleted.')
  }

  // Action Click
  const handleActionClick = (targetView) => {
    if (onNavigateToView && targetView) {
      onNavigateToView(targetView)
    }
  }

  // Filtering
  const filteredNotifications = notifications.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.meta && item.meta.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (activeFilter === 'unread') return item.unread
    if (activeFilter === 'urgent') return item.priority === 'urgent' || item.priority === 'high'
    if (activeFilter === 'projects') return item.category === 'projects'
    if (activeFilter === 'enquiries') return item.category === 'enquiries'
    if (activeFilter === 'system') return item.category === 'system'
    return true
  })

  const unreadCount = notifications.filter((n) => n.unread).length
  const urgentCount = notifications.filter((n) => n.priority === 'urgent' || n.priority === 'high').length

  const getCategoryIcon = (category, priority) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
    }
    switch (category) {
      case 'enquiries':
        return <Mail className="w-4.5 h-4.5 text-sky-500" />
      case 'projects':
        return <HardHat className="w-4.5 h-4.5 text-[#c59b58]" />
      case 'system':
        return <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
      case 'gallery':
        return <FolderKanban className="w-4.5 h-4.5 text-indigo-500" />
      default:
        return <Bell className="w-4.5 h-4.5 text-slate-500" />
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
        <span className="text-slate-800 font-semibold">Notifications &amp; Activity Center</span>
      </div>

      {/* 2. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Notifications &amp; Activity Feed</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time project updates, client inquiries, engineering approvals, and security alerts.
          </p>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#b88a44]" />
            <span>Mark All as Read</span>
          </button>

          <button
            type="button"
            onClick={handleClearRead}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Read</span>
          </button>

          <button
            type="button"
            onClick={() => handleActionClick('settings')}
            className="px-4 py-2 rounded-xl bg-[#0c1424] hover:bg-[#16233b] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#c59b58]" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-[#0c1424] text-white text-xs font-semibold shadow-xl flex items-center gap-2.5 animate-in fade-in border border-[#c59b58]">
          <CheckCircle2 className="w-4 h-4 text-[#c59b58]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Feed</p>
          <p className="text-2xl font-bold text-slate-900 font-serif">{notifications.length}</p>
          <span className="text-[10px] text-slate-400">All recorded activities</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider">Unread Alerts</p>
          <p className="text-2xl font-bold text-sky-600 font-serif">{unreadCount}</p>
          <span className="text-[10px] text-slate-400">Awaiting your review</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Urgent / Priority</p>
          <p className="text-2xl font-bold text-rose-600 font-serif">{urgentCount}</p>
          <span className="text-[10px] text-slate-400">Action recommended</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">System Health</p>
          <p className="text-2xl font-bold text-emerald-600 font-serif">100%</p>
          <span className="text-[10px] text-slate-400">All channels operational</span>
        </div>
      </div>

      {/* 4. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Notifications Stream & Filter Bar */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts by project, client, or keyword..."
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs font-medium select-none">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-[#0c1424] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                All ({notifications.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'unread'
                    ? 'bg-[#0c1424] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500 text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('urgent')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'urgent'
                    ? 'bg-[#0c1424] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span>Urgent ({urgentCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('projects')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === 'projects'
                    ? 'bg-[#0c1424] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Projects &amp; BIM
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('enquiries')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === 'enquiries'
                    ? 'bg-[#0c1424] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Client Enquiries
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('system')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === 'system'
                    ? 'bg-[#0c1424] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                System &amp; Security
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No notifications found.</p>
                <p className="text-[11px]">There are no alerts matching your current filter.</p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isUrgent = item.priority === 'urgent' || item.priority === 'high'

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleRead(item.id)}
                    className={`p-4 sm:p-5 transition-all flex items-start gap-4 cursor-pointer select-none relative group ${
                      item.unread
                        ? 'bg-blue-50/40 hover:bg-blue-50/70 border-l-3 border-l-[#c59b58]'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Category Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                        isUrgent
                          ? 'bg-rose-50 border-rose-200/80'
                          : item.unread
                          ? 'bg-white border-[#c59b58]/40'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {getCategoryIcon(item.category, item.priority)}
                    </div>

                    {/* Middle Text Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              item.unread ? 'font-bold text-slate-900' : 'text-slate-800'
                            }`}
                          >
                            {item.title}
                          </h3>

                          {isUrgent && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              Urgent
                            </span>
                          )}

                          {item.unread && (
                            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 shrink-0">
                          {item.time}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>

                      {item.meta && (
                        <p className="text-[11px] text-slate-400 font-mono pt-0.5">
                          {item.meta}
                        </p>
                      )}

                      {/* Action Links & Buttons */}
                      <div className="pt-2 flex items-center gap-3 flex-wrap">
                        {item.targetView && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleActionClick(item.targetView)
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0c1424] hover:bg-[#1a2845] text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>{item.actionLabel || 'View Details'}</span>
                            <ArrowRight className="w-3 h-3 text-[#c59b58]" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleToggleRead(item.id, e)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 font-medium transition-colors"
                        >
                          {item.unread ? 'Mark as read' : 'Mark as unread'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right 4 Cols: System Channels & Quick Activity Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notification Channels Status */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notification Channels
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-sky-500" />
                  <div>
                    <p className="font-semibold text-slate-800">Email Alerts (SMTP)</p>
                    <p className="text-[10px] text-slate-400">admin@dec-consultancy.com</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HardHat className="w-4 h-4 text-[#c59b58]" />
                  <div>
                    <p className="font-semibold text-slate-800">BIM &amp; Engineering Alerts</p>
                    <p className="text-[10px] text-slate-400">Structural clash detection</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-slate-800">Security Audit Logs</p>
                    <p className="text-[10px] text-slate-400">Login tracking &amp; backups</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Shortcuts
            </h3>

            <button
              type="button"
              onClick={() => handleActionClick('contact')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-semibold text-slate-800 group-hover:text-[#b88a44]">
                  All Contact Enquiries
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleActionClick('messages')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-[#c59b58]" />
                <span className="text-xs font-semibold text-slate-800 group-hover:text-[#b88a44]">
                  Client Messages
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleActionClick('projects')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <HardHat className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-800 group-hover:text-[#b88a44]">
                  Projects Management
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleActionClick('settings')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-800 group-hover:text-[#b88a44]">
                  Configure Notification Rules
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
