import { useState, useEffect, useCallback } from 'react'
import {
  Home,
  Mail,
  Clock,
  CheckCircle2,
  CornerUpLeft,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  Download,
  Eye,
  Trash2,
  X,
  Phone,
  Folder,
  Flag,
  RefreshCw,
  Building,
  MapPin,
  ArrowRight,
  Briefcase
} from 'lucide-react'
import { inquiryService } from '../services/inquiryService.js'

// Format inquiry item from MongoDB into component shape
const mapInquiryFromApi = (item) => {
  const createdAt = item.createdAt ? new Date(item.createdAt) : new Date()
  const followUpDate = item.followUpDate ? new Date(item.followUpDate).toISOString().slice(0, 10) : ''
  const nameInitial = item.fullName ? item.fullName.charAt(0).toUpperCase() : 'C'

  return {
    id: item._id,
    refId: item.refId || 'DEC-INQ-001',
    name: item.fullName || 'Anonymous Client',
    avatarInitials: nameInitial,
    email: item.email || '',
    phone: item.phone || '',
    organization: item.organization || '',
    service: item.discipline || 'Project Consultation',
    discipline: item.discipline || '',
    location: item.location || 'Qatar',
    stage: item.stage || 'Concept & Permitting',
    subject: item.subject || '',
    message: item.message || '',
    preview: item.message
      ? item.message.length > 45
        ? `${item.message.slice(0, 45)}...`
        : item.message
      : 'Inquiry details',
    date: createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: item.status || 'New',
    assignedTo: item.assignedTo || 'Admin',
    followUpDate,
    source: item.source || 'Website Contact Page',
    adminNotes: item.adminNotes || [],
    raw: item,
  }
}

export default function ContactEnquiries({ onNavigateToDashboard, onNavigateToCareers }) {
  const [enquiries, setEnquiries] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
  })
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [serviceFilter, setServiceFilter] = useState('All Services')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Notification state
  const [notification, setNotification] = useState('')

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3500)
  }

  // Handle escape key to close modal & lock background scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false)
      }
    }

    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen])

  // Load inquiries and stats from live Backend API (excluding careers)
  const loadInquiries = useCallback(async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        inquiryService.getAll({
          limit: 100,
        }),
        inquiryService.getStats(),
      ])

      if (listRes && listRes.success && Array.isArray(listRes.data)) {
        // Filter strictly for contact and consultation inquiries
        const contactOnly = listRes.data
          .filter((item) => item.type !== 'career')
          .map(mapInquiryFromApi)

        setEnquiries(contactOnly)
        setSelectedEnquiry((prev) => {
          if (prev && contactOnly.some((m) => m.id === prev.id)) {
            return contactOnly.find((m) => m.id === prev.id)
          }
          return contactOnly[0] || null
        })
      } else {
        setEnquiries([])
      }

      if (statsRes && statsRes.success && statsRes.data) {
        const s = statsRes.data
        const newCount = enquiries.filter((i) => i.status === 'New').length
        const inProgressCount = enquiries.filter((i) => i.status === 'In Progress').length
        const resolvedCount = enquiries.filter((i) => i.status === 'Resolved').length
        setStats({
          total: s.contactCount || 0,
          new: newCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
        })
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err)
      showNotification('Failed to load inquiries from server.')
    } finally {
      setLoading(false)
    }
  }, [enquiries])

  useEffect(() => {
    let isMounted = true

    const fetchInitial = async () => {
      try {
        const [listRes, statsRes] = await Promise.all([
          inquiryService.getAll({
            limit: 100,
          }),
          inquiryService.getStats(),
        ])

        if (isMounted) {
          if (listRes && listRes.success && Array.isArray(listRes.data)) {
            const contactOnly = listRes.data
              .filter((item) => item.type !== 'career')
              .map(mapInquiryFromApi)

            setEnquiries(contactOnly)
            setSelectedEnquiry(contactOnly[0] || null)

            const newC = contactOnly.filter((i) => i.status === 'New').length
            const inProgC = contactOnly.filter((i) => i.status === 'In Progress').length
            const resC = contactOnly.filter((i) => i.status === 'Resolved').length

            setStats({
              total: contactOnly.length,
              new: newC,
              inProgress: inProgC,
              resolved: resC,
            })
          } else {
            setEnquiries([])
          }

          if (statsRes && statsRes.success && statsRes.data) {
            setStats((prev) => ({
              ...prev,
              total: statsRes.data.contactCount || prev.total,
            }))
          }
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching inquiries:', err)
        if (isMounted) {
          setLoading(false)
          showNotification('Failed to load enquiries from server.')
        }
      }
    }

    fetchInitial()

    return () => {
      isMounted = false
    }
  }, [])

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredEnquiries.map((item) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  // Handle select single
  const handleSelectOne = (id, e) => {
    e.stopPropagation()
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  // Handle Row Click (opens details modal)
  const handleRowClick = (item) => {
    setSelectedEnquiry(item)
    setIsModalOpen(true)
  }

  // Update Status for selected enquiry
  const handleStatusChange = async (newStatus) => {
    if (!selectedEnquiry) return

    try {
      const res = await inquiryService.updateStatus(selectedEnquiry.id, { status: newStatus })
      if (res && res.success) {
        const updated = enquiries.map((enq) =>
          enq.id === selectedEnquiry.id ? { ...enq, status: newStatus } : enq
        )
        setEnquiries(updated)
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus })
        showNotification(`Status updated to "${newStatus}"`)

        // Update stats counters
        setStats({
          total: updated.length,
          new: updated.filter((i) => i.status === 'New').length,
          inProgress: updated.filter((i) => i.status === 'In Progress').length,
          resolved: updated.filter((i) => i.status === 'Resolved').length,
        })
      }
    } catch (err) {
      console.error('Failed to update status:', err)
      showNotification('Failed to update status on server.')
    }
  }

  // Update Assignee
  const handleAssigneeChange = async (newAssignee) => {
    if (!selectedEnquiry) return
    try {
      await inquiryService.updateStatus(selectedEnquiry.id, { assignedTo: newAssignee })
      const updated = enquiries.map((enq) =>
        enq.id === selectedEnquiry.id ? { ...enq, assignedTo: newAssignee } : enq
      )
      setEnquiries(updated)
      setSelectedEnquiry({ ...selectedEnquiry, assignedTo: newAssignee })
      showNotification(`Assigned to ${newAssignee}`)
    } catch {
      showNotification('Failed to update assignment.')
    }
  }

  // Update Follow Up Date
  const handleFollowUpChange = async (newDate) => {
    if (!selectedEnquiry) return
    try {
      await inquiryService.updateStatus(selectedEnquiry.id, { followUpDate: newDate })
      const updated = enquiries.map((enq) =>
        enq.id === selectedEnquiry.id ? { ...enq, followUpDate: newDate } : enq
      )
      setEnquiries(updated)
      setSelectedEnquiry({ ...selectedEnquiry, followUpDate: newDate })
      showNotification('Follow up date saved')
    } catch {
      showNotification('Failed to save follow-up date.')
    }
  }

  // Delete Enquiry
  const handleDeleteEnquiry = async (id, e) => {
    if (e) e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      try {
        await inquiryService.delete(id)
        const remaining = enquiries.filter((item) => item.id !== id)
        setEnquiries(remaining)
        setSelectedIds(selectedIds.filter((itemId) => itemId !== id))
        if (selectedEnquiry?.id === id) {
          setSelectedEnquiry(remaining[0] || null)
          if (remaining.length === 0) setIsModalOpen(false)
        }
        showNotification('Enquiry deleted successfully')

        setStats({
          total: remaining.length,
          new: remaining.filter((i) => i.status === 'New').length,
          inProgress: remaining.filter((i) => i.status === 'In Progress').length,
          resolved: remaining.filter((i) => i.status === 'Resolved').length,
        })
      } catch (err) {
        console.error('Delete failed:', err)
        showNotification('Failed to delete enquiry from server.')
      }
    }
  }

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter((item) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.organization.toLowerCase().includes(q) ||
      item.service.toLowerCase().includes(q) ||
      item.refId.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q)

    const matchesStatus =
      statusFilter === 'All Status' || item.status.toLowerCase() === statusFilter.toLowerCase()

    const matchesService =
      serviceFilter === 'All Services' || item.service === serviceFilter

    return matchesSearch && matchesStatus && matchesService
  })

  // Pagination
  const totalPages = Math.ceil(filteredEnquiries.length / pageSize) || 1
  const paginatedEnquiries = filteredEnquiries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Status Badge Class Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            New
          </span>
        )
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            In Progress
          </span>
        )
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Resolved
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        )
    }
  }

  // CSV Export
  const handleExportCSV = () => {
    if (filteredEnquiries.length === 0) {
      showNotification('No enquiries to export.')
      return
    }

    const headers = ['Ref ID', 'Client Name', 'Email', 'Phone', 'Company/Organization', 'Discipline', 'Location', 'Project Stage', 'Date', 'Status', 'Message']
    const rows = filteredEnquiries.map((e) => [
      e.refId,
      `"${e.name}"`,
      `"${e.email}"`,
      `"${e.phone}"`,
      `"${e.organization}"`,
      `"${e.service}"`,
      `"${e.location}"`,
      `"${e.stage}"`,
      `"${e.date} ${e.time}"`,
      `"${e.status}"`,
      `"${e.message.replace(/"/g, '""')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `DEC_Contact_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification('Live client enquiries exported to CSV successfully')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1680px] w-full mx-auto font-sans antialiased text-slate-800">
      
      {/* ============================================================== */}
      {/* 1. BREADCRUMB NAVIGATION                                       */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <button
            onClick={onNavigateToDashboard}
            className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-slate-700" />
          </button>
          <span className="text-slate-400 font-normal">&gt;</span>
          <span className="text-slate-800 font-semibold">Contact & Consultation Enquiries</span>
        </div>

        {/* Live sync & link to Career applications */}
        <div className="flex items-center gap-2 text-xs">
          {onNavigateToCareers && (
            <button
              onClick={onNavigateToCareers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer text-xs font-bold"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Go to Career Applications</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={loadInquiries}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs text-[11px] font-semibold"
            title="Refresh from MongoDB"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-[#c59b58]' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TOP PAGE HEADER ROW: TITLE & ACTION BUTTONS                 */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Contact Enquiries</span>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#c59b58]/15 text-[#8c672b] border border-[#c59b58]/30">
              Client Dossier
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Client project inquiries, consultative requests, and tender pre-qualifications from the website.
          </p>
        </div>

        {/* Top-Right Action Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c1424] hover:bg-[#16233b] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#c59b58]" />
            <span>Export Inquiries CSV</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-[#0c1424] text-white text-xs font-semibold shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 border border-[#b88a44]">
          <CheckCircle2 className="w-4 h-4 text-[#c59b58]" />
          <span>{notification}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ROW OF 4 KPI STATS CARDS (Powered by Live API)              */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Enquiries */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Client Enquiries</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Contact & Consultations
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: New */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">New (Unread)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.new}</h3>
              <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                Needs attention
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <CornerUpLeft className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">In Progress</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.inProgress}</h3>
              <p className="text-[11px] font-semibold text-amber-600 mt-0.5">
                Consultant assigned
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Resolved */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Resolved</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.resolved}</h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                Completed discussions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. ENQUIRIES TABLE (FULL WIDTH)                                */}
      {/* ============================================================== */}
      <div className="w-full space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by client name, email, phone, organization, or message..."
                className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44] transition-colors shadow-2xs"
              />
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-3.5 pr-8 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:border-[#b88a44] appearance-none cursor-pointer shadow-2xs"
              >
                <option value="All Status">All Status</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Services Filter */}
            <div className="relative min-w-[150px]">
              <select
                value={serviceFilter}
                onChange={(e) => {
                  setServiceFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-3.5 pr-8 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:border-[#b88a44] appearance-none cursor-pointer shadow-2xs"
              >
                <option value="All Services">All Disciplines</option>
                <option value="Project Consultation">Project Consultation</option>
                <option value="Architectural Design">Architectural Design</option>
                <option value="Civil & Structural Engineering">Civil & Structural</option>
                <option value="Smart Cities & MEP">Smart Cities & MEP</option>
                <option value="Project Management & PMO">Project Management & PMO</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Filters icon */}
            <button
              onClick={() => {
                setStatusFilter('All Status')
                setServiceFilter('All Services')
                setSearchQuery('')
              }}
              title="Reset Filters"
              className="p-2.5 bg-white border border-slate-200/90 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-center shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Enquiries Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold select-none">
                    <th className="py-3 px-3.5 w-8">
                      <input
                        type="checkbox"
                        checked={
                          paginatedEnquiries.length > 0 &&
                          paginatedEnquiries.every((item) => selectedIds.includes(item.id))
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-[#b88a44] focus:ring-[#b88a44] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-2 font-medium text-slate-500 w-8">#</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Ref ID</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Client & Company</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Contact Details</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Discipline</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Message (Preview)</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Date</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Status</th>
                    <th className="py-3 px-3 font-semibold text-slate-700 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-14 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#c59b58] mb-2" />
                        <p className="text-xs font-medium">Loading live client enquiries from MongoDB...</p>
                      </td>
                    </tr>
                  ) : paginatedEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 space-y-2">
                        <Mail className="w-8 h-8 mx-auto text-slate-300" />
                        <p>No client enquiries found matching your filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedEnquiries.map((item, index) => {
                      const isSelected = selectedEnquiry?.id === item.id
                      const isChecked = selectedIds.includes(item.id)

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleRowClick(item)}
                          className={`group transition-colors cursor-pointer select-none ${
                            isSelected
                              ? 'bg-amber-50/40 hover:bg-amber-50/60 border-l-4 border-l-[#c59b58]'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-3.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleSelectOne(item.id, e)}
                              className="rounded border-slate-300 text-[#b88a44] focus:ring-[#b88a44] cursor-pointer"
                            />
                          </td>

                          {/* Index # */}
                          <td className="py-3 px-2 text-slate-400 font-medium text-xs">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>

                          {/* Ref ID */}
                          <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
                            {item.refId}
                          </td>

                          {/* Name with Avatar & Organization */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5 min-w-[140px]">
                              <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                                {item.avatarInitials}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 group-hover:text-[#b88a44] transition-colors truncate block">
                                  {item.name}
                                </span>
                                {item.organization && (
                                  <span className="text-[10px] text-slate-400 truncate block">
                                    {item.organization}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Contact Details */}
                          <td className="py-3 px-3 text-slate-600">
                            <div className="truncate max-w-[150px]">{item.email}</div>
                            <div className="font-mono text-[10px] text-slate-400">{item.phone}</div>
                          </td>

                          {/* Service / Discipline */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-slate-800 font-medium">
                              {item.service}
                            </span>
                          </td>

                          {/* Message Preview */}
                          <td className="py-3 px-3 text-slate-500 max-w-[190px] truncate">
                            {item.preview}
                          </td>

                          {/* Date & Time */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="text-slate-800 font-medium">{item.date}</div>
                            <div className="text-[10px] text-slate-400">{item.time}</div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {getStatusBadge(item.status)}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-3 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1 text-slate-400">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRowClick(item)
                                }}
                                className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.location.href = `mailto:${item.email}?subject=DEC Inquiry Follow-up: ${item.refId}`
                                }}
                                className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                                title="Send Email"
                              >
                                <CornerUpLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteEnquiry(item.id, e)}
                                className="p-1 rounded-md hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Pagination */}
            <div className="py-3.5 px-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
              <div>
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {filteredEnquiries.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(currentPage * pageSize, filteredEnquiries.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{filteredEnquiries.length}</span>{' '}
                enquiries
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#0c1424] text-white shadow-2xs'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* ============================================================== */}
      {/* 5. LUXURY CLIENT INQUIRY MODAL DIALOG                          */}
      {/* ============================================================== */}
      {isModalOpen && selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: Deep Egyptian Navy + Gold Accent */}
            <div className="bg-gradient-to-r from-[#0c1424] via-[#15233c] to-[#0c1424] text-white px-6 py-5 sm:px-8 sm:py-6 border-b border-[#1f3150] relative overflow-hidden shrink-0">
              {/* Gold architectural watermark */}
              <div className="absolute right-0 top-0 w-64 h-full pointer-events-none opacity-10">
                <svg className="w-full h-full text-[#c59b58]" viewBox="0 0 200 100" fill="none">
                  <line x1="200" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="160" y1="0" x2="60" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
              </div>

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c59b58] to-[#967234] text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-2 ring-[#c59b58]/40 shrink-0">
                    {selectedEnquiry.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                        {selectedEnquiry.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c59b58]/20 text-[#f5d59a] border border-[#c59b58]/40 uppercase tracking-wider">
                        {selectedEnquiry.raw?.type === 'consultation' ? 'Blog Consultation' : 'Website Contact'}
                      </span>
                      {getStatusBadge(selectedEnquiry.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap font-mono">
                      <span>Inquiry Ref: <strong className="text-white">{selectedEnquiry.refId}</strong></span>
                      <span className="text-slate-500">•</span>
                      <span className="font-sans">Submitted on {selectedEnquiry.date} at {selectedEnquiry.time}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="Close modal (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (7 Cols): Project Requirements, Scope, Client Info, Message */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Requested Service Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3.5 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#c59b58] flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Requested Engineering Service / Discipline
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 leading-snug">
                        {selectedEnquiry.service}
                      </h3>
                      {selectedEnquiry.stage && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Project Stage: <strong className="text-slate-700">{selectedEnquiry.stage}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Client Organization & Specs Matrix */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                      <Building className="w-4 h-4 text-[#c59b58]" />
                      <span>Client Organization & Inquired Scope</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">Organization / Entity</span>
                        <strong className="text-slate-900 font-bold text-sm block mt-0.5 truncate">
                          {selectedEnquiry.organization || 'Independent Client / Private'}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">Target Region / Location</span>
                        <strong className="text-slate-900 font-bold text-sm block mt-0.5 truncate">
                          {selectedEnquiry.location || 'Qatar / Egypt'}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">Submission Channel</span>
                        <strong className="text-slate-900 font-bold text-xs block mt-0.5">
                          {selectedEnquiry.source || 'Website Contact Form'}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">Project Stage</span>
                        <strong className="text-slate-900 font-bold text-xs block mt-0.5">
                          {selectedEnquiry.stage || 'Concept & Permitting'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Client Message */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Inquiry Message & Client Scope Details
                    </label>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto custom-scrollbar">
                      {selectedEnquiry.message || 'No additional message text provided.'}
                    </div>
                  </div>
                </div>

                {/* Right Column (5 Cols): Contact Details & Workflow Controls */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Contact Info Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs shadow-2xs">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                      Client Contact Information
                    </h4>

                    <div className="space-y-2.5 text-slate-700">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <a
                          href={`mailto:${selectedEnquiry.email}`}
                          className="hover:text-amber-700 transition-colors font-semibold truncate underline"
                        >
                          {selectedEnquiry.email}
                        </a>
                      </div>

                      {selectedEnquiry.phone && (
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <a
                            href={`tel:${selectedEnquiry.phone}`}
                            className="hover:text-amber-700 transition-colors font-mono font-semibold"
                          >
                            {selectedEnquiry.phone}
                          </a>
                        </div>
                      )}

                      {selectedEnquiry.organization && (
                        <div className="flex items-center gap-2.5">
                          <Building className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">{selectedEnquiry.organization}</span>
                        </div>
                      )}

                      {selectedEnquiry.location && (
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{selectedEnquiry.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workflow Controls Box */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-4 shadow-xs">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
                      Inquiry Workflow Controls
                    </h4>

                    {/* Status Dropdown */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Workflow Status</label>
                      <div className="relative rounded-xl shadow-2xs">
                        <select
                          value={selectedEnquiry.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#b88a44] appearance-none cursor-pointer"
                        >
                          <option value="New">● New (Unread)</option>
                          <option value="In Progress">● In Progress / Discussion</option>
                          <option value="Resolved">● Resolved / Proposal Sent</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Assign To Dropdown */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Assigned Team / Lead</label>
                      <div className="relative rounded-xl shadow-2xs">
                        <select
                          value={selectedEnquiry.assignedTo}
                          onChange={(e) => handleAssigneeChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b88a44] appearance-none cursor-pointer"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Civil Engineering Lead">Civil Engineering Lead</option>
                          <option value="MEP Department">MEP Department</option>
                          <option value="Architectural Lead">Architectural Lead</option>
                          <option value="PMO Team">PMO Team</option>
                          <option value="Director of Consultancy">Director of Consultancy</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Follow up Date */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Follow Up Date</label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          type="date"
                          value={selectedEnquiry.followUpDate}
                          onChange={(e) => handleFollowUpChange(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#b88a44]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Direct Actions Card */}
                  <div className="space-y-2.5">
                    {/* Mark as Resolved */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange('Resolved')}
                      className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark as Resolved</span>
                    </button>

                    {/* Delete Enquiry */}
                    <button
                      type="button"
                      onClick={(e) => {
                        handleDeleteEnquiry(selectedEnquiry.id, e)
                        setIsModalOpen(false)
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete Enquiry</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700">Quick Actions:</span>
                <a
                  href={`mailto:${selectedEnquiry.email}`}
                  className="text-slate-600 hover:text-amber-700 font-medium underline flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Client</span>
                </a>
                {selectedEnquiry.phone && (
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    className="text-slate-600 hover:text-amber-700 font-medium underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Client</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
              >
                Close Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
