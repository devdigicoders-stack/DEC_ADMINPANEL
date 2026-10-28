import { useState, useEffect, useRef } from 'react'
import {
  Home,
  Plus,
  Search,
  ChevronDown,
  Edit2,
  Eye,
  Trash2,
  Building2,
  Layers,
  X,
  XCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react'
import serviceService from '../services/serviceService.js'
import uploadService from '../services/uploadService.js'
import { getImageUrl } from '../services/api.js'

export default function ServicesManagement({ onNavigateToDashboard, onNavigateToAdd }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [activeModal, setActiveModal] = useState(null) // 'add' | 'edit' | 'view' | 'delete' | null
  const [selectedService, setSelectedService] = useState(null)
  const fileInputRef = useRef(null)

  // Form state for add/edit modal
  const [formData, setFormData] = useState({
    title: '',
    category: 'Engineering',
    description: '',
    status: 'Active',
    image: '',
  })

  // Show transient toast message
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }


  // Fetch all services from backend API
  const fetchServices = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      const res = await serviceService.getAll({ status: 'all' })
      setServices(res?.data || [])
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to services API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Filtered services based on search and status
  const filteredServices = services.filter((srv) => {
    const title = srv.title || ''
    const cat = srv.category || ''
    const desc = srv.description || srv.shortDescription || ''
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase())

    const srvStatus = srv.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive'
    const matchesStatus =
      statusFilter === 'All' || srvStatus.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  // Counters
  const totalCount = services.length
  const activeCount = services.filter((s) => s.status?.toLowerCase() === 'active').length
  const inactiveCount = services.filter((s) => s.status?.toLowerCase() === 'inactive').length

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingImage(true)
      setErrorMessage('')
      const res = await uploadService.uploadImage(file, 'services')
      if (res?.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.url }))
        triggerToast('Image uploaded to server uploads folder!')
      }
    } catch (err) {
      setErrorMessage(err.message || 'Image upload failed. Please try again.')
    } finally {
      setUploadingImage(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      category: 'Engineering',
      description: '',
      status: 'Active',
      image: '',
    })
    setActiveModal('add')
  }

  const handleOpenEdit = (srv) => {
    setSelectedService(srv)
    setFormData({
      title: srv.title || '',
      category: srv.category || 'Engineering',
      description: srv.description || srv.shortDescription || '',
      status: srv.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive',
      image: srv.image || '',
    })
    setActiveModal('edit')
  }

  const handleOpenView = (srv) => {
    setSelectedService(srv)
    setActiveModal('view')
  }

  const handleOpenDelete = (srv) => {
    setSelectedService(srv)
    setActiveModal('delete')
  }

  // Fast Status Toggle (Active <-> Inactive)
  const handleToggleStatus = async (srv) => {
    const currentIsActive = srv.status?.toLowerCase() === 'active'
    const nextStatus = currentIsActive ? 'inactive' : 'active'
    const serviceId = srv._id || srv.id

    // Optimistic UI update
    setServices((prev) =>
      prev.map((s) => ((s._id || s.id) === serviceId ? { ...s, status: nextStatus } : s))
    )

    try {
      await serviceService.toggleStatus(serviceId, nextStatus)
      triggerToast(`Service marked as ${nextStatus.toUpperCase()}`)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update service status.')
      fetchServices()
    }
  }

  const handleSaveAdd = async (e) => {
    e.preventDefault()
    if (!formData.title?.trim()) return
    setActionLoading(true)
    setErrorMessage('')

    try {
      await serviceService.create({
        title: formData.title.trim(),
        category: formData.category || 'Engineering',
        description: formData.description.trim(),
        status: formData.status.toLowerCase(),
        image: formData.image || '',
      })
      await fetchServices()
      setActiveModal(null)
      triggerToast('Service created successfully!')
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add service.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!selectedService) return
    const serviceId = selectedService._id || selectedService.id
    setActionLoading(true)
    setErrorMessage('')

    try {
      await serviceService.update(serviceId, {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        status: formData.status.toLowerCase(),
        image: formData.image || selectedService.image || '',
      })
      await fetchServices()
      setActiveModal(null)
      triggerToast('Service updated successfully!')
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update service.')
    } finally {
      setActionLoading(false)
    }
  }


  const handleConfirmDelete = async () => {
    if (!selectedService) return
    const serviceId = selectedService._id || selectedService.id
    setActionLoading(true)
    setErrorMessage('')

    try {
      await serviceService.delete(serviceId)
      setServices((prev) => prev.filter((s) => (s._id || s.id) !== serviceId))
      setActiveModal(null)
      triggerToast('Service deleted successfully!')
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete service.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-[1560px] w-full mx-auto font-sans antialiased">
      {/* ============================================================== */}
      {/* 1. BREADCRUMB NAVIGATION                                       */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button
          onClick={onNavigateToDashboard}
          className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>Dashboard</span>
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <span className="text-slate-800 font-semibold">Services Management</span>
      </div>

      {/* ============================================================== */}
      {/* 2. PAGE HEADER ROW: TITLE & ACTION BUTTONS                     */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Services Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your website services. Add, edit or delete services as needed.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchServices}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh Services from Server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#b88a44]' : ''}`} />
          </button>

          <button
            onClick={onNavigateToAdd || handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#b88a44] hover:bg-[#a37736] active:scale-[0.98] text-white font-medium text-sm shadow-xs transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {/* Toast Success Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl font-medium flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl font-medium flex items-center justify-between gap-2.5 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-500 hover:text-rose-700 text-xs underline font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. STATS CARDS & SEARCH/FILTER BAR ROW                        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        {/* Left: 3 Quick KPI Stat Counters (7 Cols) */}
        <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Services */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100/80 flex items-center justify-center text-[#b88a44] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                {totalCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Total Services</div>
            </div>
          </div>

          {/* Active Services */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                {activeCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Active Services</div>
            </div>
          </div>

          {/* Inactive Services */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                {inactiveCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Inactive Services</div>
            </div>
          </div>
        </div>

        {/* Right: Search Input & Filter Dropdown (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col sm:flex-row gap-3 items-center justify-end">
          {/* Search Box */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-slate-200/90 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/30 focus:border-[#b88a44] transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="relative w-full sm:w-auto shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-36 text-xs font-semibold bg-white text-slate-700 py-2.5 pl-3.5 pr-8 rounded-xl border border-slate-200/90 shadow-xs focus:outline-none focus:border-[#b88a44] cursor-pointer appearance-none transition-colors"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. SERVICES DATA TABLE CARD                                   */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#faf8f5]/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 w-12 text-slate-400 font-semibold">#</th>
                <th className="px-6 py-4 w-28">Image</th>
                <th className="px-6 py-4 min-w-[200px]">Service Title</th>
                <th className="px-6 py-4 min-w-[320px]">Short Description</th>
                <th className="px-6 py-4 w-28 text-center">Status</th>
                <th className="px-6 py-4 w-36 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#b88a44]/30 border-t-[#b88a44] rounded-full animate-spin" />
                      <span className="text-xs text-slate-500 font-medium">Loading DEC Services from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No services found matching your search.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service, index) => {
                  const Icon = Building2
                  const serviceId = service._id || service.id
                  const isActive = service.status?.toLowerCase() === 'active'

                  return (
                    <tr
                      key={serviceId}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* # Index */}
                      <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                        {index + 1}
                      </td>

                      {/* Image Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="w-20 h-13 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs shrink-0">
                          <img
                            src={getImageUrl(service.image)}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.currentTarget.src = '/login-bg.jpg'
                            }}
                          />
                        </div>
                      </td>

                      {/* Service Title & Category */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#b88a44] transition-colors leading-snug">
                          {service.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-700/80 font-medium mt-1">
                          <Icon className="w-3 h-3 text-amber-600" />
                          <span>{service.category || 'Engineering'}</span>
                        </div>
                      </td>

                      {/* Short Description */}
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500 leading-relaxed max-w-xl line-clamp-2">
                          {service.description || service.shortDescription}
                        </p>
                      </td>

                      {/* Interactive Status Toggle Badge */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(service)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200/80 hover:bg-slate-200'
                          }`}
                          title="Click to toggle Active / Inactive"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions Buttons (Edit, View, Delete) */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(service)}
                            className="w-8 h-8 rounded-lg bg-blue-50/80 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* View Button */}
                          <button
                            onClick={() => handleOpenView(service)}
                            className="w-8 h-8 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleOpenDelete(service)}
                            className="w-8 h-8 rounded-lg bg-rose-50/80 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="Delete Service"
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
        <div className="px-6 py-4 border-t border-slate-100 bg-[#faf8f5]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">1</span> to{' '}
            <span className="font-semibold text-slate-700">{filteredServices.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalCount}</span> services
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#0c1424] text-white font-bold flex items-center justify-center shadow-xs">
              1
            </button>
            <button
              disabled
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. ADD / EDIT SERVICE MODAL                                   */}
      {/* ============================================================== */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="text-base font-bold text-slate-900">
                {activeModal === 'add' ? 'Add New Service' : 'Edit Service'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={activeModal === 'add' ? handleSaveAdd : handleSaveEdit} className="p-6 space-y-4 overflow-y-auto">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Service Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Architectural Consultancy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b88a44]/30 focus:border-[#b88a44]"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#b88a44]"
                  >
                    <option>Engineering</option>
                    <option>Project</option>
                    <option>Design</option>
                    <option>Construction</option>
                    <option>Planning</option>
                    <option>Infrastructure</option>
                    <option>Environment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#b88a44]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Short Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a concise 1-2 sentence description of the service..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b88a44]/30 focus:border-[#b88a44]"
                />
              </div>

              {/* Service Image Upload (Dynamic Backend Storage) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Service Image <span className="text-slate-400 font-normal">(Dynamic Upload)</span>
                  </label>
                  {formData.image && (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved in Backend
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {uploadingImage ? (
                  <div className="p-4 rounded-xl border border-dashed border-[#b88a44] bg-amber-50/40 flex items-center justify-center gap-2.5 text-xs text-[#b88a44] font-medium">
                    <span className="w-4 h-4 border-2 border-[#b88a44]/30 border-t-[#b88a44] rounded-full animate-spin" />
                    <span>Uploading image to server uploads folder...</span>
                  </div>
                ) : formData.image ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200/90 bg-slate-50/70 p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                        <img
                          src={getImageUrl(formData.image)}
                          alt="Service Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/login-bg.jpg'
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
                          {formData.image.split('/').pop()}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          DEC_Backend/uploads/services
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#b88a44] hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-slate-200 hover:border-[#b88a44] rounded-xl bg-slate-50/60 hover:bg-amber-50/20 p-4 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-1 group"
                  >
                    <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-[#b88a44] transition-colors" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-[#b88a44]">
                      Click to upload service image
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG, WEBP (Saved to DEC_Backend/uploads)
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={actionLoading || uploadingImage}
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || uploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-[#b88a44] hover:bg-[#a07434] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {actionLoading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{actionLoading ? 'Saving...' : activeModal === 'add' ? 'Save Service' : 'Update Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. VIEW DETAILS MODAL                                          */}
      {/* ============================================================== */}
      {activeModal === 'view' && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="relative h-44 w-full bg-slate-900 overflow-hidden shrink-0">
              <img
                src={getImageUrl(selectedService.image)}
                alt={selectedService.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/login-bg.jpg'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-6 right-6">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#b88a44] text-white mb-1.5">
                  {selectedService.category || 'Engineering'}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                  {selectedService.title}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="space-y-1">
                <span className="font-semibold text-slate-700">Description:</span>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {selectedService.description || selectedService.shortDescription}
                </p>
              </div>

              {selectedService.capabilities && selectedService.capabilities.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700 block">Capabilities &amp; Features:</span>
                  <div className="space-y-1.5">
                    {selectedService.capabilities.map((cap, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-2 text-slate-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#b88a44] shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Service Status:</span>
                <span
                  className={`px-3 py-1 rounded-full font-semibold ${
                    selectedService.status?.toLowerCase() === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {selectedService.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. DELETE CONFIRMATION MODAL                                   */}
      {/* ============================================================== */}
      {activeModal === 'delete' && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Delete Service?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete{' '}
                <strong className="text-slate-800">"{selectedService.title}"</strong>? This action
                cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {actionLoading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>{actionLoading ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
