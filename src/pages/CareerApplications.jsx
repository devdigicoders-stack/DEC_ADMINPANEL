import { useState, useEffect, useCallback } from 'react'
import {
  Home,
  Briefcase,
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
  Mail,
  Flag,
  Paperclip,
  ExternalLink,
  RefreshCw,
  MapPin,
  UserCheck,
  FileCheck,
} from 'lucide-react'
import { inquiryService } from '../services/inquiryService.js'
import { getImageUrl } from '../services/api.js'

// Format candidate application item from MongoDB into component shape
const mapCandidateFromApi = (item) => {
  const createdAt = item.createdAt ? new Date(item.createdAt) : new Date()
  const followUpDate = item.followUpDate ? new Date(item.followUpDate).toISOString().slice(0, 10) : ''
  const nameInitial = item.fullName ? item.fullName.charAt(0).toUpperCase() : 'C'

  return {
    id: item._id,
    refId: item.refId || 'DEC-CAR-001',
    name: item.fullName || 'Anonymous Candidate',
    avatarInitials: nameInitial,
    email: item.email || '',
    phone: item.phone || '',
    position: item.position || (item.discipline ? item.discipline.replace(/^Career:\s*/, '') : 'Engineering Candidate'),
    experience: item.experience || 'Not specified',
    currentRole: item.currentRole || '',
    noticePeriod: item.noticePeriod || '',
    location: item.location || 'Qatar: Corporate Headquarters (Lusail)',
    portfolioUrl: item.portfolioUrl || '',
    message: item.message || '',
    preview: item.message
      ? item.message.length > 45
        ? `${item.message.slice(0, 45)}...`
        : item.message
      : (item.position || 'Application received'),
    date: createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: item.status || 'New',
    assignedTo: item.assignedTo || 'HR Talent Acquisition',
    followUpDate,
    source: item.source || 'Website Career Page',
    cv: item.cv || null,
    raw: item,
  }
}

export default function CareerApplications({ onNavigateToDashboard }) {
  const [candidates, setCandidates] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
  })
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [positionFilter, setPositionFilter] = useState('All Positions')
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

  // Load candidate applications and stats from live Backend API
  const loadApplications = useCallback(async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        inquiryService.getAll({
          type: 'career',
          limit: 100,
        }),
        inquiryService.getStats(),
      ])

      if (listRes && listRes.success && Array.isArray(listRes.data)) {
        const mapped = listRes.data.map(mapCandidateFromApi)
        setCandidates(mapped)
        setSelectedCandidate((prev) => {
          if (prev && mapped.some((m) => m.id === prev.id)) {
            return mapped.find((m) => m.id === prev.id)
          }
          return mapped[0] || null
        })
      } else {
        setCandidates([])
      }

      if (statsRes && statsRes.success && statsRes.data) {
        const s = statsRes.data
        setStats({
          total: s.careerCount || s.careerStats?.total || 0,
          new: s.careerStats?.new || s.new || 0,
          inProgress: s.careerStats?.inProgress || s.inProgress || 0,
          resolved: s.careerStats?.resolved || s.resolved || 0,
        })
      }
    } catch (err) {
      console.error('Error fetching career applications:', err)
      showNotification('Failed to load career applications from server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchInitial = async () => {
      try {
        const [listRes, statsRes] = await Promise.all([
          inquiryService.getAll({
            type: 'career',
            limit: 100,
          }),
          inquiryService.getStats(),
        ])

        if (isMounted) {
          if (listRes && listRes.success && Array.isArray(listRes.data)) {
            const mapped = listRes.data.map(mapCandidateFromApi)
            setCandidates(mapped)
            setSelectedCandidate(mapped[0] || null)
          } else {
            setCandidates([])
          }

          if (statsRes && statsRes.success && statsRes.data) {
            const s = statsRes.data
            setStats({
              total: s.careerCount || s.careerStats?.total || 0,
              new: s.careerStats?.new || s.new || 0,
              inProgress: s.careerStats?.inProgress || s.inProgress || 0,
              resolved: s.careerStats?.resolved || s.resolved || 0,
            })
          }
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching career applications:', err)
        if (isMounted) {
          setLoading(false)
          showNotification('Failed to load career applications.')
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
      setSelectedIds(filteredCandidates.map((item) => item.id))
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
    setSelectedCandidate(item)
    setIsModalOpen(true)
  }

  // Update Status for selected candidate
  const handleStatusChange = async (newStatus) => {
    if (!selectedCandidate) return

    try {
      const res = await inquiryService.updateStatus(selectedCandidate.id, { status: newStatus })
      if (res && res.success) {
        const updated = candidates.map((c) =>
          c.id === selectedCandidate.id ? { ...c, status: newStatus } : c
        )
        setCandidates(updated)
        setSelectedCandidate({ ...selectedCandidate, status: newStatus })
        showNotification(`Candidate status updated to "${newStatus}"`)

        // Refresh stats
        const statsRes = await inquiryService.getStats()
        if (statsRes?.data) {
          const s = statsRes.data
          setStats({
            total: s.careerCount || s.careerStats?.total || 0,
            new: s.careerStats?.new || s.new || 0,
            inProgress: s.careerStats?.inProgress || s.inProgress || 0,
            resolved: s.careerStats?.resolved || s.resolved || 0,
          })
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err)
      showNotification('Failed to update status on server.')
    }
  }

  // Update Assignee
  const handleAssigneeChange = async (newAssignee) => {
    if (!selectedCandidate) return
    try {
      await inquiryService.updateStatus(selectedCandidate.id, { assignedTo: newAssignee })
      const updated = candidates.map((c) =>
        c.id === selectedCandidate.id ? { ...c, assignedTo: newAssignee } : c
      )
      setCandidates(updated)
      setSelectedCandidate({ ...selectedCandidate, assignedTo: newAssignee })
      showNotification(`Assigned to ${newAssignee}`)
    } catch {
      showNotification('Failed to update assignment.')
    }
  }

  // Update Follow Up Date
  const handleFollowUpChange = async (newDate) => {
    if (!selectedCandidate) return
    try {
      await inquiryService.updateStatus(selectedCandidate.id, { followUpDate: newDate })
      const updated = candidates.map((c) =>
        c.id === selectedCandidate.id ? { ...c, followUpDate: newDate } : c
      )
      setCandidates(updated)
      setSelectedCandidate({ ...selectedCandidate, followUpDate: newDate })
      showNotification('Follow up date saved')
    } catch {
      showNotification('Failed to save follow-up date.')
    }
  }

  // Delete Candidate Application
  const handleDeleteCandidate = async (id, e) => {
    if (e) e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this candidate application? This action cannot be undone.')) {
      try {
        await inquiryService.delete(id)
        const remaining = candidates.filter((item) => item.id !== id)
        setCandidates(remaining)
        setSelectedIds(selectedIds.filter((itemId) => itemId !== id))
        if (selectedCandidate?.id === id) {
          setSelectedCandidate(remaining[0] || null)
          if (remaining.length === 0) setIsModalOpen(false)
        }
        showNotification('Candidate application deleted successfully')

        // Refresh stats
        const statsRes = await inquiryService.getStats()
        if (statsRes?.data) {
          const s = statsRes.data
          setStats({
            total: s.careerCount || s.careerStats?.total || 0,
            new: s.careerStats?.new || s.new || 0,
            inProgress: s.careerStats?.inProgress || s.inProgress || 0,
            resolved: s.careerStats?.resolved || s.resolved || 0,
          })
        }
      } catch (err) {
        console.error('Delete failed:', err)
        showNotification('Failed to delete application from server.')
      }
    }
  }

  // Download / View CV File
  const handleDownloadCV = (cv, candidateName) => {
    if (!cv) {
      showNotification('No CV file attached for this applicant.')
      return
    }

    if (cv.url) {
      const fullUrl = getImageUrl(cv.url)
      const link = document.createElement('a')
      link.href = fullUrl
      link.target = '_blank'
      link.download = cv.filename || `${candidateName.replace(/\s+/g, '_')}_CV.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showNotification(`Opening/Downloading ${cv.filename || 'Resume'}...`)
    } else if (cv.base64) {
      const link = document.createElement('a')
      link.href = cv.base64
      link.download = cv.filename || `${candidateName.replace(/\s+/g, '_')}_CV.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showNotification(`Downloading ${cv.filename || 'Resume'}...`)
    } else {
      showNotification('Resume file details not accessible.')
    }
  }

  // Filtered candidates
  const filteredCandidates = candidates.filter((item) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.position.toLowerCase().includes(q) ||
      item.currentRole.toLowerCase().includes(q) ||
      item.refId.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q)

    const matchesStatus =
      statusFilter === 'All Status' || item.status.toLowerCase() === statusFilter.toLowerCase()

    const matchesPosition =
      positionFilter === 'All Positions' || item.position.toLowerCase().includes(positionFilter.toLowerCase())

    return matchesSearch && matchesStatus && matchesPosition
  })

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1
  const paginatedCandidates = filteredCandidates.slice(
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
            In Review
          </span>
        )
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Shortlisted / Hired
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
    if (filteredCandidates.length === 0) {
      showNotification('No candidate records to export.')
      return
    }

    const headers = ['Ref ID', 'Candidate Name', 'Email', 'Phone', 'Applied Position', 'Experience', 'Current Role', 'Notice Period', 'Date Applied', 'Status', 'Resume URL', 'Remarks']
    const rows = filteredCandidates.map((c) => [
      c.refId,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.position}"`,
      `"${c.experience}"`,
      `"${c.currentRole}"`,
      `"${c.noticePeriod}"`,
      `"${c.date} ${c.time}"`,
      `"${c.status}"`,
      `"${c.cv?.url ? getImageUrl(c.cv.url) : 'No file'}"`,
      `"${c.message.replace(/"/g, '""')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `DEC_Candidates_Roster_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification('Candidate applications exported to CSV successfully')
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
          <span className="text-slate-800 font-semibold">Career Applications & Talent Acquisition</span>
        </div>

        {/* Live sync indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={loadApplications}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs text-[11px] font-semibold"
            title="Refresh candidate roster from MongoDB"
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
            <span>Career Applications & CVs</span>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#c59b58]/15 text-[#8c672b] border border-[#c59b58]/30">
              Talent Roster
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review engineering candidate profiles, experience, and uploaded resumes/CVs from the Careers portal.
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
            <span>Export Candidates CSV</span>
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
        {/* Card 1: Total Candidates */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Applicants</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</h3>
              <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">
                Talent Pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: New (Under Review) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">New Applications</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.new}</h3>
              <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                Pending initial review
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: In Review */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <CornerUpLeft className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">In Technical Review</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.inProgress}</h3>
              <p className="text-[11px] font-semibold text-amber-600 mt-0.5">
                Interview / Screening
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Shortlisted / Hired */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Shortlisted / Hired</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.resolved}</h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                Qualified engineers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. CANDIDATES TABLE (FULL WIDTH)                               */}
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
                placeholder="Search candidates by name, email, phone, position, or keywords..."
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
                <option value="In Progress">In Review</option>
                <option value="Resolved">Shortlisted / Hired</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Position Filter */}
            <div className="relative min-w-[160px]">
              <select
                value={positionFilter}
                onChange={(e) => {
                  setPositionFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-3.5 pr-8 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:border-[#b88a44] appearance-none cursor-pointer shadow-2xs"
              >
                <option value="All Positions">All Positions</option>
                <option value="Mechanical">Mechanical (HVAC & MEP)</option>
                <option value="Civil">Civil & Structural</option>
                <option value="Architect">Architect & FLS</option>
                <option value="BIM">BIM Coordinator</option>
                <option value="Electrical">Electrical Engineer</option>
                <option value="Permits">Permits Coordinator</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Filters icon */}
            <button
              onClick={() => {
                setStatusFilter('All Status')
                setPositionFilter('All Positions')
                setSearchQuery('')
              }}
              title="Reset Filters"
              className="p-2.5 bg-white border border-slate-200/90 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-center shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Candidates Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold select-none">
                    <th className="py-3 px-3.5 w-8">
                      <input
                        type="checkbox"
                        checked={
                          paginatedCandidates.length > 0 &&
                          paginatedCandidates.every((item) => selectedIds.includes(item.id))
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-[#b88a44] focus:ring-[#b88a44] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-2 font-medium text-slate-500 w-8">#</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Ref ID</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Candidate Name</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Applied Job Role</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Experience</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Contact Details</th>
                    <th className="py-3 px-3 font-semibold text-slate-700 text-center">Resume / CV</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Date Applied</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">Status</th>
                    <th className="py-3 px-3 font-semibold text-slate-700 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="py-14 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#c59b58] mb-2" />
                        <p className="text-xs font-medium">Loading candidate applications from MongoDB...</p>
                      </td>
                    </tr>
                  ) : paginatedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400 space-y-2">
                        <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
                        <p>No career applications found matching your filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedCandidates.map((item, index) => {
                      const isSelected = selectedCandidate?.id === item.id
                      const isChecked = selectedIds.includes(item.id)

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleRowClick(item)}
                          className={`group transition-colors cursor-pointer select-none ${
                            isSelected
                              ? 'bg-indigo-50/40 hover:bg-indigo-50/60 border-l-4 border-l-indigo-600'
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

                          {/* Candidate Name with Avatar */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5 min-w-[140px]">
                              <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                                {item.avatarInitials}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate block">
                                  {item.name}
                                </span>
                                {item.currentRole && (
                                  <span className="text-[10px] text-slate-400 truncate block">
                                    {item.currentRole}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Applied Position */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              <Briefcase className="w-3 h-3 text-[#c59b58]" />
                              <span>{item.position}</span>
                            </span>
                          </td>

                          {/* Experience & Notice Period */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="text-slate-800 font-semibold">{item.experience}</div>
                            {item.noticePeriod && (
                              <div className="text-[10px] text-slate-400">{item.noticePeriod}</div>
                            )}
                          </td>

                          {/* Contact Details */}
                          <td className="py-3 px-3 text-slate-600">
                            <div className="truncate max-w-[140px]">{item.email}</div>
                            <div className="font-mono text-[10px] text-slate-400">{item.phone}</div>
                          </td>

                          {/* Resume / CV Link Button */}
                          <td className="py-3 px-3 whitespace-nowrap text-center">
                            {item.cv ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadCV(item.cv, item.name)
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                title="Download Candidate Resume"
                              >
                                <Download className="w-3 h-3 text-emerald-600" />
                                <span>CV / Resume</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No file</span>
                            )}
                          </td>

                          {/* Date Applied */}
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
                                title="View Dossier"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.location.href = `mailto:${item.email}?subject=DEC Career Application Follow-up: ${item.refId} (${item.position})`
                                }}
                                className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                                title="Email Candidate"
                              >
                                <CornerUpLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteCandidate(item.id, e)}
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
                  {filteredCandidates.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(currentPage * pageSize, filteredCandidates.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{filteredCandidates.length}</span>{' '}
                applicants
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
      {/* 5. LUXURY CANDIDATE DOSSIER MODAL DIALOG                       */}
      {/* ============================================================== */}
      {isModalOpen && selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: Deep Navy + Gold Accent Architectural Identity */}
            <div className="bg-gradient-to-r from-[#0c1424] via-[#15233c] to-[#0c1424] text-white px-6 py-5 sm:px-8 sm:py-6 border-b border-[#1f3150] relative overflow-hidden shrink-0">
              {/* Subtle gold line pattern watermark in background */}
              <div className="absolute right-0 top-0 w-64 h-full pointer-events-none opacity-10">
                <svg className="w-full h-full text-[#c59b58]" viewBox="0 0 200 100" fill="none">
                  <line x1="200" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="160" y1="0" x2="60" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
              </div>

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c59b58] to-[#967234] text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-2 ring-[#c59b58]/40 shrink-0">
                    {selectedCandidate.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                        {selectedCandidate.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c59b58]/20 text-[#f5d59a] border border-[#c59b58]/40 uppercase tracking-wider">
                        Job Applicant
                      </span>
                      {getStatusBadge(selectedCandidate.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap font-mono">
                      <span>Ref ID: <strong className="text-white">{selectedCandidate.refId}</strong></span>
                      <span className="text-slate-500">•</span>
                      <span className="font-sans">Applied on {selectedCandidate.date} at {selectedCandidate.time}</span>
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
                {/* Left Column (7 Cols): Candidate Dossier, Qualifications, Resume Card, Cover Note */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Target Role Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3.5 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#c59b58] flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Target Applied Position
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 leading-snug">
                        {selectedCandidate.position}
                      </h3>
                      {selectedCandidate.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{selectedCandidate.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Candidate Qualifications Grid */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                      <UserCheck className="w-4 h-4 text-[#c59b58]" />
                      <span>Candidate Qualifications & Experience</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">Experience Level</span>
                        <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                          {selectedCandidate.experience}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">Notice Period</span>
                        <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                          {selectedCandidate.noticePeriod || 'Immediate / 2 Weeks'}
                        </strong>
                      </div>

                      {selectedCandidate.currentRole && (
                        <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block text-[11px]">Current Designation</span>
                          <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                            {selectedCandidate.currentRole}
                          </strong>
                        </div>
                      )}

                      {selectedCandidate.portfolioUrl && (
                        <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-slate-400 block text-[11px]">Portfolio / Profile URL</span>
                            <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">
                              {selectedCandidate.portfolioUrl}
                            </span>
                          </div>
                          <a
                            href={selectedCandidate.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0"
                          >
                            <span>Visit</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attached CV / Resume Highlight Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border border-emerald-200/90 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                        <FileCheck className="w-5 h-5 text-emerald-600" />
                        <span>Attached Candidate Resume / CV</span>
                      </div>
                      {selectedCandidate.cv && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-200">
                          {selectedCandidate.cv.contentType?.includes('pdf') ? 'PDF Document' : 'Document File'}
                        </span>
                      )}
                    </div>

                    {selectedCandidate.cv ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 border border-emerald-100 text-xs font-semibold text-slate-800 truncate">
                          <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate flex-1">{selectedCandidate.cv.filename || 'Candidate_Resume.pdf'}</span>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => handleDownloadCV(selectedCandidate.cv, selectedCandidate.name)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Resume</span>
                          </button>

                          {selectedCandidate.cv.url && (
                            <a
                              href={getImageUrl(selectedCandidate.cv.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="py-2.5 px-4 rounded-xl border border-emerald-300 hover:bg-emerald-100/80 text-emerald-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors bg-white/70"
                              title="View file in browser tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Open in Browser</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-3 bg-white/50 rounded-xl">
                        Candidate did not attach a separate resume file.
                      </p>
                    )}
                  </div>

                  {/* Candidate Cover Letter / Note */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Candidate Cover Note / Statement
                    </label>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto custom-scrollbar">
                      {selectedCandidate.message || 'No additional note provided by the candidate.'}
                    </div>
                  </div>
                </div>

                {/* Right Column (5 Cols): Recruiter Workflow & Actions */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Contact Info Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs shadow-2xs">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                      Contact Information
                    </h4>

                    <div className="space-y-2.5 text-slate-700">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <a
                          href={`mailto:${selectedCandidate.email}`}
                          className="hover:text-indigo-600 transition-colors font-semibold truncate underline"
                        >
                          {selectedCandidate.email}
                        </a>
                      </div>

                      {selectedCandidate.phone && (
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <a
                            href={`tel:${selectedCandidate.phone}`}
                            className="hover:text-indigo-600 transition-colors font-mono font-semibold"
                          >
                            {selectedCandidate.phone}
                          </a>
                        </div>
                      )}

                      {selectedCandidate.location && (
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{selectedCandidate.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recruiter Workflow Controls */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-4 shadow-xs">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
                      Recruitment Workflow Controls
                    </h4>

                    {/* Status Dropdown */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Application Stage</label>
                      <div className="relative rounded-xl shadow-2xs">
                        <select
                          value={selectedCandidate.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#b88a44] appearance-none cursor-pointer"
                        >
                          <option value="New">● New (Pending Review)</option>
                          <option value="In Progress">● In Technical Review / Interview</option>
                          <option value="Resolved">● Shortlisted / Offer Extended</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Assignee Dropdown */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Assigned Reviewer / HR Lead</label>
                      <div className="relative rounded-xl shadow-2xs">
                        <select
                          value={selectedCandidate.assignedTo}
                          onChange={(e) => handleAssigneeChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b88a44] appearance-none cursor-pointer"
                        >
                          <option value="HR Talent Acquisition">HR Talent Acquisition</option>
                          <option value="Civil Engineering Lead">Civil Engineering Lead</option>
                          <option value="MEP Department">MEP Department</option>
                          <option value="Architectural Lead">Architectural Lead</option>
                          <option value="BIM Lead">BIM Lead</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Interview / Follow up Date */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Interview / Follow Up Date</label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          type="date"
                          value={selectedCandidate.followUpDate}
                          onChange={(e) => handleFollowUpChange(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#b88a44]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Direct Actions Card */}
                  <div className="space-y-2.5">
                    {/* Mark as Shortlisted */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange('Resolved')}
                      className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark as Shortlisted / Qualified</span>
                    </button>

                    {/* Delete Application */}
                    <button
                      type="button"
                      onClick={(e) => {
                        handleDeleteCandidate(selectedCandidate.id, e)
                        setIsModalOpen(false)
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete Candidate Application</span>
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
                  href={`mailto:${selectedCandidate.email}`}
                  className="text-slate-600 hover:text-indigo-600 font-medium underline flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
                {selectedCandidate.phone && (
                  <a
                    href={`tel:${selectedCandidate.phone}`}
                    className="text-slate-600 hover:text-indigo-600 font-medium underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
