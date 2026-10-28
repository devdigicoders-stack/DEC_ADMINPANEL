import { useState, useEffect, useRef } from 'react'
import {
  Home,
  Plus,
  Search,
  SlidersHorizontal,
  FolderKanban,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  RefreshCw,
  MapPin,
  Layers,
  Sparkles,
} from 'lucide-react'
import projectService from '../services/projectService.js'
import uploadService from '../services/uploadService.js'
import { getImageUrl } from '../services/api.js'

// Official DEC Project Categories matching DEC_WEBSITE
const SECTOR_CATEGORIES = [
  { label: 'All Delivered Projects', value: 'All' },
  { label: 'Offices – Corporate & Workplaces', value: 'offices' },
  { label: 'Retail – Luxury & Commercial', value: 'retail' },
  { label: 'F&B – Food & Beverage', value: 'fnb' },
  { label: 'Hospitality – Hotels & Resorts', value: 'hospitality' },
  { label: 'Residential – High-End Residential', value: 'residential' },
  { label: 'Industrial – Manufacturing & Logistics', value: 'industrial' },
  { label: 'Medical – Healthcare & Pharma', value: 'medical' },
]

export default function ProjectsManagement({
  onNavigateToDashboard,
  onNavigateToAddProject,
}) {
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    sectors: [],
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSector, setSelectedSector] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 9

  // Modal States
  const [activeModal, setActiveModal] = useState(null) // 'view' | 'edit' | 'delete' | null
  const [selectedProject, setSelectedProject] = useState(null)
  const fileInputRef = useRef(null)

  // Edit Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sector: 'Offices',
    type: '',
    location: '',
    scope: '',
    tags: '',
    image: '',
    client: '',
    year: '2025',
    status: 'active',
  })

  // Show transient toast
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch Projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      const [res, statsRes] = await Promise.all([
        projectService.getAll({
          status: 'all',
          limit: 200,
        }),
        projectService.getStats(),
      ])

      setProjects(res?.data || [])
      if (statsRes?.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load projects from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const initFetch = async () => {
      try {
        setErrorMessage('')
        const [res, statsRes] = await Promise.all([
          projectService.getAll({
            status: 'all',
            limit: 200,
          }),
          projectService.getStats(),
        ])
        if (isMounted) {
          setProjects(res?.data || [])
          if (statsRes?.data) {
            setStats(statsRes.data)
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load projects from server.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    initFetch()
    return () => {
      isMounted = false
    }
  }, [])

  // Filtered in-memory for instant 0ms switching across sector tabs, status and search query
  const filteredProjects = projects.filter((prj) => {
    // 1. Sector Filter
    const matchesSector =
      selectedSector === 'All' ||
      (prj.sectorSlug &&
        prj.sectorSlug.toLowerCase() === selectedSector.toLowerCase()) ||
      (prj.sector && prj.sector.toLowerCase() === selectedSector.toLowerCase())

    // 2. Status Filter
    const matchesStatus =
      statusFilter === 'All' ||
      (prj.status && prj.status.toLowerCase() === statusFilter.toLowerCase())

    // 3. Search Filter
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (prj.name && prj.name.toLowerCase().includes(q)) ||
      (prj.code && prj.code.toLowerCase().includes(q)) ||
      (prj.location && prj.location.toLowerCase().includes(q)) ||
      (prj.scope && prj.scope.toLowerCase().includes(q)) ||
      (prj.type && prj.type.toLowerCase().includes(q)) ||
      (prj.sector && prj.sector.toLowerCase().includes(q)) ||
      (prj.tags && prj.tags.some((t) => t.toLowerCase().includes(q)))

    return matchesSector && matchesStatus && matchesSearch
  })

  // Pagination
  const totalItems = filteredProjects.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  // Status Toggle Handler
  const handleToggleStatus = async (e, prj) => {
    e.stopPropagation()
    try {
      setActionLoading(true)
      const res = await projectService.toggleStatus(prj._id)
      const newStatus = res?.data?.status || (prj.status === 'active' ? 'inactive' : 'active')

      setProjects((prev) =>
        prev.map((item) =>
          item._id === prj._id ? { ...item, status: newStatus } : item
        )
      )
      triggerToast(`Project '${prj.name}' is now ${newStatus.toUpperCase()}`)
    } catch (err) {
      triggerToast(err.message || 'Failed to update project status')
    } finally {
      setActionLoading(false)
    }
  }

  // Open View Modal
  const handleOpenView = (prj) => {
    setSelectedProject(prj)
    setActiveModal('view')
  }

  // Open Edit Modal
  const handleOpenEdit = (prj) => {
    setSelectedProject(prj)
    setFormData({
      code: prj.code || '',
      name: prj.name || '',
      sector: prj.sector || 'Offices',
      type: prj.type || '',
      location: prj.location || '',
      scope: prj.scope || '',
      tags: Array.isArray(prj.tags) ? prj.tags.join(', ') : prj.tags || '',
      image: prj.image || '',
      client: prj.client || '',
      year: prj.year || '2025',
      status: prj.status || 'active',
    })
    setActiveModal('edit')
  }

  // Open Delete Modal
  const handleOpenDelete = (prj) => {
    setSelectedProject(prj)
    setActiveModal('delete')
  }

  // Upload Project Image to backend uploads/projects
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingImage(true)
      const res = await uploadService.uploadImage(file, 'projects')
      if (res?.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.url }))
        triggerToast('Image uploaded successfully to server.')
      }
    } catch (err) {
      triggerToast(err.message || 'Image upload failed. Please try again.')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      triggerToast('Project name is required.')
      return
    }

    try {
      setActionLoading(true)
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        sector: formData.sector,
        type: formData.type.trim(),
        location: formData.location.trim(),
        scope: formData.scope.trim(),
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        image: formData.image.trim(),
        client: formData.client.trim(),
        year: formData.year.trim(),
        status: formData.status.toLowerCase(),
      }

      const res = await projectService.update(selectedProject._id, payload)
      const updated = res?.data || { ...selectedProject, ...payload }

      setProjects((prev) =>
        prev.map((item) => (item._id === selectedProject._id ? updated : item))
      )
      setActiveModal(null)
      triggerToast(`Project '${payload.name}' updated successfully!`)
    } catch (err) {
      triggerToast(err.message || 'Failed to update project.')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete Project Confirmation
  const handleConfirmDelete = async () => {
    if (!selectedProject) return
    try {
      setActionLoading(true)
      await projectService.delete(selectedProject._id)
      setProjects((prev) => prev.filter((item) => item._id !== selectedProject._id))
      setActiveModal(null)
      triggerToast(`Project '${selectedProject.name}' deleted successfully.`)
    } catch (err) {
      triggerToast(err.message || 'Failed to delete project.')
    } finally {
      setActionLoading(false)
    }
  }

  // Seed Portfolio Handler (84 Landmark projects)
  const handleSeedProjects = async () => {
    if (
      !window.confirm(
        'Do you want to re-seed the full 84 landmark projects portfolio from the website? Any custom modifications will be refreshed.'
      )
    ) {
      return
    }
    try {
      setActionLoading(true)
      const res = await projectService.seed(true)
      triggerToast(res?.message || 'Successfully seeded 84 landmark projects!')
      await fetchProjects()
    } catch (err) {
      triggerToast(err.message || 'Failed to seed projects.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1720px] w-full mx-auto font-sans antialiased text-slate-800">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-[#b88a44]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. BREADCRUMBS NAVIGATION                                      */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button
          onClick={onNavigateToDashboard}
          className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-slate-700" />
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <span className="text-slate-800 font-semibold">Projects Management</span>
      </div>

      {/* ============================================================== */}
      {/* 2. PAGE HEADER ROW: TITLE & "+ ADD NEW PROJECT" BUTTON         */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#b88a44]/15 text-[#8f6f3e] border border-[#b88a44]/30">
              Grade A Project Portfolio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              84+ Registered Engagements
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Projects Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your official register of delivered architectural & engineering projects across Qatar & GCC.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Seed Button */}
          <button
            onClick={handleSeedProjects}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
            title="Import or refresh all 84 landmark projects from website data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-600 ${
                actionLoading ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden md:inline">Sync / Seed (84)</span>
          </button>

          {/* Add New Project */}
          <button
            onClick={onNavigateToAddProject}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1424] hover:bg-[#152035] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#0c1424]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#b88a44]" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. METRIC STATS ROW (TOTAL, ACTIVE, INACTIVE, SECTORS)         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Projects */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#b88a44] flex items-center justify-center shrink-0">
              <FolderKanban className="w-6 h-6 text-[#b88a44]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Projects</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {stats.total || projects.length}
              </h3>
              <p className="text-[11px] font-semibold text-[#b88a44] mt-0.5">
                Delivered Landmark Register
              </p>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Projects */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Active Public</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-0.5">
                {stats.active || projects.filter((p) => p.status === 'active').length}
              </h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                Live on Website
              </p>
            </div>
          </div>
        </div>

        {/* Metric 3: Inactive Projects */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              <EyeOff className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Inactive / Draft</p>
              <h3 className="text-2xl font-bold text-slate-700 mt-0.5">
                {stats.inactive ||
                  projects.filter((p) => p.status === 'inactive').length}
              </h3>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Hidden from public
              </p>
            </div>
          </div>
        </div>

        {/* Metric 4: Sectors Covered */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Market Sectors</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {stats.sectors?.length || 7} Sectors
              </h3>
              <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                Commercial to Healthcare
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. SEARCH & SECTOR CHIPS FILTER BAR                            */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by project name, code (e.g. DEC-001), location, scope, tags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl pl-3 pr-8 py-2.5 text-slate-700 font-semibold focus:outline-none focus:border-[#b88a44] cursor-pointer appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedSector('All')
                setStatusFilter('All')
                setCurrentPage(1)
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shrink-0"
              title="Reset Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sector Filter Chips matching website exact design */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {SECTOR_CATEGORIES.map((cat) => {
            const isSelected = selectedSector === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedSector(cat.value)
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0c1424] text-white shadow-md shadow-[#0c1424]/20 ring-1 ring-[#b88a44]'
                    : 'bg-white hover:bg-slate-100/90 text-slate-700 border border-slate-200/90 shadow-2xs'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={fetchProjects}
            className="text-xs underline hover:text-rose-900 font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MAIN PROJECTS SHOWCASE GRID (EXACT WEBSITE CARD DESIGN)     */}
      {/* ============================================================== */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#b88a44] animate-spin mx-auto" />
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Loading landmark projects portfolio from database...
          </p>
        </div>
      ) : paginatedProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3 max-w-lg mx-auto">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No matching projects found
          </h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or selecting a different sector category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedSector('All')
              setStatusFilter('All')
            }}
            className="px-5 py-2 rounded-xl bg-[#0c1424] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {paginatedProjects.map((prj) => {
            const isActive = prj.status === 'active'

            return (
              <div
                key={prj._id || prj.id || prj.code}
                className="relative bg-slate-50/90 rounded-3xl p-7 sm:p-8 border border-slate-200 hover:border-[#b88a44] hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden group min-h-[420px]"
              >
                {/* Real Project Photo Revealed on Hover - Ultra Sharp & Crystal Clear */}
                {prj.image && (
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <img
                      src={getImageUrl(prj.image)}
                      alt={prj.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/projects-gallery/01.jpg'
                      }}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/75 pointer-events-none" />
                  </div>
                )}

                {/* Card Content (z-10) */}
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    {/* Header: Sector, Type, Code & Status Switch */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Sector Badge */}
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#b88a44]/15 text-[#8f6f3e] group-hover:bg-[#b88a44] group-hover:text-white transition-colors">
                          {prj.sector}
                        </span>

                        {/* Project Type */}
                        {prj.type && (
                          <span className="text-[11px] font-medium text-slate-500 bg-white group-hover:bg-white/20 group-hover:text-white px-2 py-0.5 rounded-md border border-slate-200 group-hover:border-white/30 capitalize transition-colors">
                            {prj.type}
                          </span>
                        )}

                        {/* Project Code */}
                        <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-200/80 group-hover:bg-white/20 group-hover:text-amber-300 px-2 py-0.5 rounded-md transition-colors">
                          {prj.code}
                        </span>
                      </div>

                      {/* Quick Status Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(e, prj)}
                        disabled={actionLoading}
                        title={`Click to switch to ${
                          isActive ? 'Inactive' : 'Active'
                        }`}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-transparent'
                            : 'bg-slate-200 text-slate-600 border border-slate-300 group-hover:bg-slate-700 group-hover:text-slate-200'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    {/* Project Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-[#151515] group-hover:text-white mb-2 leading-snug transition-colors line-clamp-2">
                      {prj.name}
                    </h3>

                    {/* Location Pin */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 group-hover:text-slate-200 font-medium mb-3.5 transition-colors">
                      <MapPin className="w-3.5 h-3.5 text-[#b88a44] shrink-0" />
                      <span>{prj.location}</span>
                    </div>

                    {/* Scope Highlight */}
                    <div className="p-3 rounded-xl bg-white group-hover:bg-black/40 group-hover:border-white/20 group-hover:text-white border border-slate-200/90 mb-4 text-xs font-semibold text-slate-700 flex items-start gap-2.5 shadow-xs transition-colors">
                      <Layers className="w-4 h-4 text-[#b88a44] mt-0.5 shrink-0" />
                      <span className="leading-relaxed line-clamp-2">
                        {prj.scope}
                      </span>
                    </div>

                    {/* Tags */}
                    {prj.tags && prj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {prj.tags.slice(0, 4).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white group-hover:bg-white/10 group-hover:text-slate-200 group-hover:border-white/20 text-slate-600 border border-slate-200 capitalize transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                        {prj.tags.length > 4 && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 group-hover:bg-white/20 group-hover:text-white text-slate-500">
                            +{prj.tags.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Admin Controls (View, Edit, Delete) */}
                  <div className="pt-4 border-t border-slate-200/90 group-hover:border-white/20 flex items-center justify-between mt-auto transition-colors">
                    {/* Compliance Indicator */}
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-300 font-medium transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#b88a44]" />
                      <span>Grade A</span>
                    </span>

                    {/* Admin Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* View */}
                      <button
                        onClick={() => handleOpenView(prj)}
                        className="p-1.5 rounded-lg bg-white group-hover:bg-white/20 text-slate-600 group-hover:text-white border border-slate-200 group-hover:border-white/30 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="View Full Project Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(prj)}
                        className="p-1.5 rounded-lg bg-white group-hover:bg-[#b88a44] text-slate-600 group-hover:text-white border border-slate-200 group-hover:border-transparent hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleOpenDelete(prj)}
                        className="p-1.5 rounded-lg bg-white group-hover:bg-rose-500 text-rose-600 group-hover:text-white border border-rose-200 group-hover:border-transparent hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. PAGINATION CONTROLS                                         */}
      {/* ============================================================== */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{startIndex + 1}</span>{' '}
            to <span className="font-bold text-slate-800">{endIndex}</span> of{' '}
            <span className="font-bold text-slate-800">{totalItems}</span> projects
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: VIEW PROJECT MODAL                                    */}
      {/* ============================================================== */}
      {activeModal === 'view' && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Image Header */}
            <div className="relative h-60 sm:h-72 w-full bg-slate-900 overflow-hidden">
              <img
                src={getImageUrl(selectedProject.image)}
                alt={selectedProject.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/projects-gallery/01.jpg'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#b88a44] text-white">
                    {selectedProject.sector}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-300 bg-black/60 px-2.5 py-0.5 rounded-md">
                    {selectedProject.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedProject.status === 'active'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-500 text-white'
                    }`}
                  >
                    {selectedProject.status?.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {selectedProject.name}
                </h2>
              </div>
            </div>

            {/* Modal Details Body */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Location & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">
                    Location
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#b88a44]" />
                    <span>{selectedProject.location}</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">
                    Typology
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 capitalize">
                    {selectedProject.type || 'Engineering Engagement'}
                  </p>
                </div>
              </div>

              {/* Scope */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <span className="text-[11px] font-bold text-[#b88a44] block mb-1">
                  Scope of Engineering Work
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                  {selectedProject.scope}
                </p>
              </div>

              {/* Tags */}
              {selectedProject.tags && selectedProject.tags.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    Project Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setActiveModal(null)
                    handleOpenEdit(selectedProject)
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0c1424] text-white font-semibold text-xs sm:text-sm hover:bg-slate-800 transition-colors"
                >
                  Edit Project
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT PROJECT MODAL                                    */}
      {/* ============================================================== */}
      {activeModal === 'edit' && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Project: {selectedProject.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Code: {selectedProject.code}
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              {/* Row 1: Code & Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Project Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. DEC-001"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Sector <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                  >
                    <option value="Offices">Offices</option>
                    <option value="Retail">Retail</option>
                    <option value="F&B">F&B</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Residential">Residential</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Medical & Healthcare">
                      Medical & Healthcare
                    </option>
                  </select>
                </div>
              </div>

              {/* Row 2: Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter project title"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                />
              </div>

              {/* Row 3: Location & Typology */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. Lusail, Qatar"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Typology / Type
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    placeholder="e.g. corporate headquarters"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                  />
                </div>
              </div>

              {/* Row 4: Scope */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Scope of Work <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.scope}
                  onChange={(e) =>
                    setFormData({ ...formData, scope: e.target.value })
                  }
                  placeholder="e.g. ARCH R&M, MEP & QCD Design & Supervision"
                  className="w-full p-3 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] resize-y"
                />
              </div>

              {/* Row 5: Tags */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="e.g. corporate office, Lusail, QCD Approved, MEP"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                />
              </div>

              {/* Row 6: Image Upload & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Project Image
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current && fileInputRef.current.click()
                      }
                      disabled={uploadingImage}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#b88a44]" />
                      <span>{uploadingImage ? 'Uploading...' : 'Change Image'}</span>
                    </button>
                    {formData.image && (
                      <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {formData.image}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Draft / Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#0c1424] text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition-colors disabled:opacity-60 shadow-md"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: DELETE CONFIRMATION MODAL                             */}
      {/* ============================================================== */}
      {activeModal === 'delete' && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete Project?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-slate-800">
                  {selectedProject.name} ({selectedProject.code})
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs sm:text-sm hover:bg-rose-700 transition-colors disabled:opacity-60 shadow-md"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
