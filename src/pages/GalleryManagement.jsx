import { useState, useEffect, useRef } from 'react'
import {
  Home,
  UploadCloud,
  Image as ImageIcon,
  Search,
  ChevronDown,
  LayoutGrid,
  Plus,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Layers,
  Sparkles,
  Maximize2,
} from 'lucide-react'
import galleryService from '../services/galleryService.js'
import uploadService from '../services/uploadService.js'
import { getImageUrl } from '../services/api.js'

// Official DEC Gallery Categories matching DEC_WEBSITE
const SECTOR_CATEGORIES = [
  { label: 'All Visual Archives', value: 'All' },
  { label: 'Offices – Corporate', value: 'offices' },
  { label: 'Retail – Luxury Flagship', value: 'retail' },
  { label: 'F&B – Food & Beverage', value: 'fnb' },
  { label: 'Hospitality – Hotels & Resorts', value: 'hospitality' },
  { label: 'Residential – Luxury Estates', value: 'residential' },
  { label: 'Industrial – Manufacturing', value: 'industrial' },
  { label: 'Medical & Healthcare', value: 'medical' },
]

export default function GalleryManagement({
  onNavigateToDashboard,
  onNavigateToUpload,
}) {
  const [items, setItems] = useState([])
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
  const pageSize = 12

  // Modals: 'lightbox' | 'edit' | 'delete' | null
  const [activeModal, setActiveModal] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const fileInputRef = useRef(null)

  // Edit Form State
  const [formData, setFormData] = useState({
    title: '',
    sector: 'Offices',
    location: '',
    scope: '',
    image: '',
    status: 'active',
  })

  // Show transient toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch Gallery Items from Backend API
  const fetchGallery = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      const [res, statsRes] = await Promise.all([
        galleryService.getAll({
          status: 'all',
          limit: 200,
        }),
        galleryService.getStats(),
      ])

      setItems(res?.data || [])
      if (statsRes?.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to load visual archives gallery from server.'
      )
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
          galleryService.getAll({
            status: 'all',
            limit: 200,
          }),
          galleryService.getStats(),
        ])
        if (isMounted) {
          setItems(res?.data || [])
          if (statsRes?.data) {
            setStats(statsRes.data)
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(
            err.message || 'Failed to connect to gallery API.'
          )
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

  // Filtered in-memory for instant 0ms switching across sector tabs, status and search
  const filteredItems = items.filter((item) => {
    const matchesSector =
      selectedSector === 'All' ||
      (item.sectorSlug &&
        item.sectorSlug.toLowerCase() === selectedSector.toLowerCase()) ||
      (item.sector &&
        item.sector.toLowerCase() === selectedSector.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' ||
      (item.status && item.status.toLowerCase() === statusFilter.toLowerCase())

    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.scope && item.scope.toLowerCase().includes(q)) ||
      (item.sector && item.sector.toLowerCase().includes(q)) ||
      (item.fileName && item.fileName.toLowerCase().includes(q))

    return matchesSector && matchesStatus && matchesSearch
  })

  // Pagination Calculations
  const totalItems = filteredItems.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  // Status Toggle
  const handleToggleStatus = async (e, item) => {
    e.stopPropagation()
    try {
      setActionLoading(true)
      const res = await galleryService.toggleStatus(item._id)
      const newStatus =
        res?.data?.status || (item.status === 'active' ? 'inactive' : 'active')

      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, status: newStatus } : i
        )
      )
      triggerToast(
        `Photograph '${item.title}' is now ${newStatus.toUpperCase()}`
      )
    } catch (err) {
      triggerToast(err.message || 'Failed to update photograph status.')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Lightbox
  const handleOpenLightbox = (indexInPaginated) => {
    const globalIdx = startIndex + indexInPaginated
    setLightboxIdx(globalIdx)
    setActiveModal('lightbox')
  }

  // Next / Prev Lightbox
  const handleLightboxNext = () => {
    setLightboxIdx((prev) => (prev + 1) % filteredItems.length)
  }

  const handleLightboxPrev = () => {
    setLightboxIdx(
      (prev) => (prev - 1 + filteredItems.length) % filteredItems.length
    )
  }

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setSelectedItem(item)
    setFormData({
      title: item.title || '',
      sector: item.sector || 'Offices',
      location: item.location || '',
      scope: item.scope || '',
      image: item.image || '',
      status: item.status || 'active',
    })
    setActiveModal('edit')
  }

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setSelectedItem(item)
    setActiveModal('delete')
  }

  // Upload Photograph to backend uploads/gallery
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingImage(true)
      const res = await uploadService.uploadImage(file, 'gallery')
      if (res?.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.url }))
        triggerToast('Image uploaded successfully to server storage.')
      }
    } catch (err) {
      triggerToast(err.message || 'Image upload failed. Please try again.')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Save Edit Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      triggerToast('Title is required.')
      return
    }

    try {
      setActionLoading(true)
      const payload = {
        title: formData.title.trim(),
        sector: formData.sector,
        location: formData.location.trim(),
        scope: formData.scope.trim(),
        image: formData.image.trim(),
        status: formData.status.toLowerCase(),
      }

      const res = await galleryService.update(selectedItem._id, payload)
      const updated = res?.data || { ...selectedItem, ...payload }

      setItems((prev) =>
        prev.map((i) => (i._id === selectedItem._id ? updated : i))
      )
      setActiveModal(null)
      triggerToast(`Photograph '${payload.title}' updated successfully!`)
    } catch (err) {
      triggerToast(err.message || 'Failed to update photograph.')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!selectedItem) return
    try {
      setActionLoading(true)
      await galleryService.delete(selectedItem._id)
      setItems((prev) => prev.filter((i) => i._id !== selectedItem._id))
      setActiveModal(null)
      triggerToast(
        `Photograph '${selectedItem.title}' deleted from visual archives.`
      )
    } catch (err) {
      triggerToast(err.message || 'Failed to delete photograph.')
    } finally {
      setActionLoading(false)
    }
  }

  // Re-seed 84 Visual Archive Photographs
  const handleSeedGallery = async () => {
    if (
      !window.confirm(
        'Do you want to re-seed the full 84 site photographs of the Visual Project Archives from the website? Any custom modifications will be refreshed.'
      )
    ) {
      return
    }
    try {
      setActionLoading(true)
      const res = await galleryService.seed(true)
      triggerToast(
        res?.message ||
          'Successfully seeded 84 visual archive photographs in MongoDB!'
      )
      await fetchGallery()
    } catch (err) {
      triggerToast(err.message || 'Failed to seed visual archives.')
    } finally {
      setActionLoading(false)
    }
  }

  const currentLightboxItem = filteredItems[lightboxIdx]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1780px] w-full mx-auto font-sans antialiased text-slate-800">
      {/* Toast Notification */}
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
        <span className="text-slate-800 font-semibold">
          Visual Project Archives (Gallery)
        </span>
      </div>

      {/* ============================================================== */}
      {/* 2. PAGE HEADER ROW: TITLE & UPLOAD BUTTON                      */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#b88a44]/15 text-[#8f6f3e] border border-[#b88a44]/30">
              Visual Project Archives
            </span>
            <span className="text-xs text-slate-400 font-mono">
              84 Executed Site Photographs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Visual Archives Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Photographic survey of corporate headquarters, luxury fit-outs, and MEP infrastructure delivered by DEC across Qatar and the GCC.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Seed Button */}
          <button
            onClick={handleSeedGallery}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
            title="Sync / re-seed all 84 site photographs from website archives"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-600 ${
                actionLoading ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden md:inline">Sync / Seed (84)</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onNavigateToUpload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1424] hover:bg-[#152035] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#0c1424]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#b88a44]" />
            <span>Upload Photographs</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. METRIC STATS ROW (TOTAL, ACTIVE, INACTIVE, SECTORS)         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#b88a44] flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-[#b88a44]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Total Photographs
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {stats.total || items.length}
              </h3>
              <p className="text-[11px] font-semibold text-[#b88a44] mt-0.5">
                Site & Project Records
              </p>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Active Public Wall
              </p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-0.5">
                {stats.active || items.filter((i) => i.status === 'active').length}
              </h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                Live in Website Archives
              </p>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Inactive / Draft
              </p>
              <h3 className="text-2xl font-bold text-slate-700 mt-0.5">
                {stats.inactive ||
                  items.filter((i) => i.status === 'inactive').length}
              </h3>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Hidden from public gallery
              </p>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Disciplines</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {stats.sectors?.length || 7} Sectors
              </h3>
              <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                Corporate to Hospitality
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
              placeholder="Search photographs by project name, location, scope, or file..."
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
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sector Filter Chips */}
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
            onClick={fetchGallery}
            className="text-xs underline hover:text-rose-900 font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. VISUAL ARCHIVES PHOTOGRAPH GRID (12 PHOTOS PER PAGE)       */}
      {/* ============================================================== */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#b88a44] animate-spin mx-auto" />
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Loading visual archives from server storage...
          </p>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3 max-w-lg mx-auto">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No matching photographs found
          </h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or selecting a different sector.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedItems.map((item, idx) => {
            const isActive = item.status === 'active'

            return (
              <div
                key={item._id || item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Photo Thumbnail Container */}
                <div
                  onClick={() => handleOpenLightbox(idx)}
                  className="relative h-56 w-full overflow-hidden bg-slate-900 cursor-pointer"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/projects-gallery/01.jpg'
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />

                  {/* Dark Vignette on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Top-Left Sector Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#b88a44] text-white shadow-md">
                      {item.sector}
                    </span>
                  </div>

                  {/* Top-Right Status Badge / Toggle */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      type="button"
                      onClick={(e) => handleToggleStatus(e, item)}
                      disabled={actionLoading}
                      title={`Click to switch to ${
                        isActive ? 'Inactive' : 'Active'
                      }`}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md cursor-pointer transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Center Zoom Hover Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-[#b88a44] text-[#0c1424] flex items-center justify-center text-sm shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      onClick={() => handleOpenLightbox(idx)}
                      className="font-bold text-slate-900 text-sm hover:text-[#b88a44] transition-colors cursor-pointer line-clamp-1 leading-snug"
                    >
                      {item.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 text-[#b88a44] shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {/* Scope Highlight */}
                    {item.scope && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                        {item.scope}
                      </p>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.fileName || 'Archive Photo'}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* View Lightbox */}
                      <button
                        onClick={() => handleOpenLightbox(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="View Full Resolution"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#b88a44] hover:bg-amber-50 transition-colors"
                        title="Edit Photograph"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleOpenDelete(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Photograph"
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
            <span className="font-bold text-slate-800">{totalItems}</span> photographs
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
      {/* MODAL 1: FULLSCREEN LIGHTBOX PHOTO VIEWER                      */}
      {/* ============================================================== */}
      {activeModal === 'lightbox' && currentLightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 md:p-8 animate-in fade-in"
          role="dialog"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between z-20 pb-3 border-b border-white/10 text-white">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-lg bg-[#b88a44] text-[#0c1424] font-bold text-xs tracking-wider">
                Photo {lightboxIdx + 1} of {filteredItems.length}
              </span>
              <span className="text-sm font-semibold truncate hidden sm:inline">
                {currentLightboxItem.title}
              </span>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Image with Prev / Next */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <button
              onClick={handleLightboxPrev}
              className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-[#b88a44] text-white hover:text-black transition-all cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={getImageUrl(currentLightboxItem.image)}
              alt={currentLightboxItem.title}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            <button
              onClick={handleLightboxNext}
              className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-[#b88a44] text-white hover:text-black transition-all cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Bar: Metadata */}
          <div className="z-20 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-white text-xs">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-amber-300 font-bold">
                {currentLightboxItem.sector}
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#b88a44]" />
                <span>{currentLightboxItem.location}</span>
              </span>
            </div>
            {currentLightboxItem.scope && (
              <p className="text-slate-300 text-center sm:text-right max-w-md truncate">
                {currentLightboxItem.scope}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT PHOTOGRAPH MODAL                                 */}
      {/* ============================================================== */}
      {activeModal === 'edit' && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Edit Photograph
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                />
              </div>

              {/* Sector */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Sector Category
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

              {/* Location */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                />
              </div>

              {/* Scope */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Scope
                </label>
                <textarea
                  rows={2}
                  value={formData.scope}
                  onChange={(e) =>
                    setFormData({ ...formData, scope: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                />
              </div>

              {/* Image Uploader */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Replace Photograph
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#b88a44]" />
                    <span>{uploadingImage ? 'Uploading...' : 'Choose Image'}</span>
                  </button>
                  {formData.image && (
                    <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                      {formData.image}
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44]"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#0c1424] text-white font-bold text-xs hover:bg-slate-800"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: DELETE CONFIRMATION                                   */}
      {/* ============================================================== */}
      {activeModal === 'delete' && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete Photograph?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove{' '}
                <span className="font-bold text-slate-800">
                  {selectedItem.title}
                </span>{' '}
                from the visual archives?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-60"
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
