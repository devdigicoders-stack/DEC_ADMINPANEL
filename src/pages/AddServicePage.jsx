import { useState, useRef } from 'react'
import {
  Home,
  FileText,
  AlignLeft,
  Grid,
  Camera,
  Link2,
  ArrowUpDown,
  Plus,
  Trash2,
  UploadCloud,
  RotateCcw,
  Save,
  Search,
  Sliders,
  X,
  GripVertical,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
} from 'lucide-react'
import serviceService from '../services/serviceService.js'
import uploadService from '../services/uploadService.js'
import { getImageUrl } from '../services/api.js'

export default function AddServicePage({ onNavigateToServices, onNavigateToDashboard }) {
  // Form States
  const [serviceTitle, setServiceTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [category, setCategory] = useState('')
  const [icon, setIcon] = useState('')
  const [serviceUrl, setServiceUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState('1')

  // Key Features dynamic array
  const [keyFeatures, setKeyFeatures] = useState(['', '', ''])

  // Image Upload state
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // Status state
  const [status, setStatus] = useState('Active') // 'Active' | 'Inactive'

  // SEO States
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')

  // Success alert state
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Feature handling
  const handleFeatureChange = (index, value) => {
    const updated = [...keyFeatures]
    updated[index] = value
    setKeyFeatures(updated)
  }

  const handleAddFeature = () => {
    setKeyFeatures([...keyFeatures, ''])
  }

  const handleRemoveFeature = (index) => {
    if (keyFeatures.length <= 1) {
      setKeyFeatures([''])
      return
    }
    setKeyFeatures(keyFeatures.filter((_, i) => i !== index))
  }

  // Unified image upload handler for both file dialog and drag-and-drop
  const uploadImageFile = async (file) => {
    if (!file) return
    try {
      setUploadingImage(true)
      setErrorMessage('')
      const res = await uploadService.uploadImage(file, 'services')
      if (res?.data?.url) {
        setImagePreview(res.data.url)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Image upload to backend failed. Please try again.')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadImageFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      await uploadImageFile(file)
    }
  }


  // Reset Form
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all form fields?')) {
      setServiceTitle('')
      setShortDescription('')
      setFullDescription('')
      setCategory('')
      setIcon('')
      setServiceUrl('')
      setDisplayOrder('1')
      setKeyFeatures(['', '', ''])
      setImagePreview('')
      setStatus('Active')
      setMetaTitle('')
      setMetaDescription('')
      setMetaKeywords('')
      setSavedSuccess(false)
      setErrorMessage('')
    }
  }

  // Real Backend API Save Service
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    if (!serviceTitle.trim()) {
      setErrorMessage('Service title is required.')
      return
    }

    setErrorMessage('')
    setSubmitting(true)

    try {
      const payload = {
        title: serviceTitle.trim(),
        shortDescription: shortDescription.trim(),
        description: shortDescription.trim() || fullDescription.trim() || serviceTitle.trim(),
        fullDescription: fullDescription.trim(),
        category: category.trim() || 'Engineering',
        icon: icon.trim() || 'FiLayers',
        image: imagePreview || '',
        capabilities: keyFeatures.map((f) => f.trim()).filter(Boolean),
        order: Number(displayOrder) || 1,
        status: status.toLowerCase(),
        serviceUrl: serviceUrl.trim(),
        seo: {
          metaTitle: metaTitle.trim() || serviceTitle.trim(),
          metaDescription: metaDescription.trim() || shortDescription.trim(),
          metaKeywords: metaKeywords
            ? metaKeywords.split(',').map((k) => k.trim()).filter(Boolean)
            : [],
        },
      }


      await serviceService.create(payload)
      setSavedSuccess(true)
      setTimeout(() => {
        if (onNavigateToServices) {
          onNavigateToServices()
        }
      }, 1000)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create service on server.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1560px] w-full mx-auto font-sans antialiased">
      {/* ============================================================== */}
      {/* 1. BREADCRUMB NAVIGATION                                       */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button
          onClick={onNavigateToDashboard}
          className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <button
          onClick={onNavigateToServices}
          className="hover:text-slate-800 transition-colors cursor-pointer"
        >
          Services Management
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <span className="text-slate-800 font-semibold">Add New Service</span>
      </div>

      {/* ============================================================== */}
      {/* 2. PAGE HEADER                                                 */}
      {/* ============================================================== */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Add New Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Create a new service for your website. Fill in the details below and publish it.
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2.5 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-600 hover:text-rose-800 underline text-xs cursor-pointer font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Banner */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Service published successfully to database! Redirecting to All Services list...</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TWO-COLUMN MAIN FORM GRID                                  */}
      {/* ============================================================== */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: SERVICE DETAILS & CONTENT (8 COLS)             */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
          {/* Card Section Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#b88a44] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Service Details</h2>
          </div>

          {/* Row 1: Service Title & Short Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Service Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Service Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder="Enter service title"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Short Description <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                  <AlignLeft className="w-4 h-4" />
                </div>
                <textarea
                  rows={2}
                  required
                  maxLength={200}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Enter short description (displayed on service card)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all resize-none"
                />
              </div>
              <div className="flex justify-end">
                <span className="text-[11px] text-slate-400">
                  {shortDescription.length}/200
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Full Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Full Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                Detailed Overview
              </span>
            </div>
            <div className="relative">
              <textarea
                rows={6}
                required
                maxLength={2000}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Enter detailed service description..."
                className="w-full p-3.5 sm:p-4 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all leading-relaxed resize-y min-h-[150px]"
              />
            </div>
            <div className="flex justify-end">
              <span className="text-[11px] text-slate-400">
                {fullDescription.length}/2000
              </span>
            </div>
          </div>

          {/* Row 3: Category & Icon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Grid className="w-4 h-4" />
                </div>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] appearance-none cursor-pointer transition-all"
                >
                  <option value="">Select category</option>
                  <option value="Engineering">Engineering Design & Consultation</option>
                  <option value="Project">Project Management</option>
                  <option value="Design">Structural Design</option>
                  <option value="Construction">Construction Supervision</option>
                  <option value="Planning">Urban Planning</option>
                  <option value="Infrastructure">Infrastructure Development</option>
                  <option value="Environment">Environmental Solutions</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Icon (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Icon (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Camera className="w-4 h-4" />
                </div>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] appearance-none cursor-pointer transition-all"
                >
                  <option value="">Choose icon</option>
                  <option value="FaCompassDrafting">Architectural Drafting (FaCompassDrafting)</option>
                  <option value="FiLayers">Structural Layers (FiLayers)</option>
                  <option value="FiTool">Mechanical / HVAC (FiTool)</option>
                  <option value="FiZap">Electrical / Power (FiZap)</option>
                  <option value="FiShield">Statutory Permitting (FiShield)</option>
                  <option value="FiCpu">Digital Twin / BIM (FiCpu)</option>
                  <option value="Building2">Building & Construction (Building2)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 4: Service URL & Display Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Service URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Service URL (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Link2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={serviceUrl}
                  onChange={(e) => setServiceUrl(e.target.value)}
                  placeholder="https://example.com/service"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
                />
              </div>
            </div>

            {/* Display Order */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Display Order
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ArrowUpDown className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Lower number shows first</p>
            </div>
          </div>

          {/* Row 5: Key Features (Optional) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-50 text-[#b88a44] flex items-center justify-center font-bold text-xs">
                +
              </div>
              <span className="text-xs font-bold text-slate-800">
                Key Features <span className="text-slate-400 font-normal">(Optional)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-1">
              Add key features or highlights of this service.
            </p>

            {/* Feature input rows */}
            <div className="space-y-2.5">
              {keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                      placeholder="Enter key feature..."
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="p-2.5 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* + Add Feature Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddFeature}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#c59b58] text-[#b88a44] hover:bg-amber-50/60 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Feature</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: IMAGE, STATUS & SEO SETTINGS (4 COLS)         */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Service Image */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#b88a44] flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Service Image</h2>
            </div>

            {/* Hidden real file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {/* Uploading progress indicator */}
            {uploadingImage ? (
              <div className="border-2 border-dashed border-[#b88a44] rounded-2xl bg-amber-50/40 p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-[#b88a44]/30 border-t-[#b88a44] rounded-full animate-spin" />
                <p className="text-xs font-bold text-[#b88a44]">
                  Uploading image to server uploads folder...
                </p>
                <p className="text-[11px] text-slate-400">
                  Saving to DEC_Backend/uploads/services
                </p>
              </div>
            ) : (
              /* Dropzone area with workable drag-and-drop */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-150 group ${
                  dragOver
                    ? 'border-[#b88a44] bg-amber-50/60 scale-[1.01]'
                    : 'border-slate-200 hover:border-[#b88a44] bg-slate-50/60 hover:bg-amber-50/20'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-amber-100/60 text-slate-700 group-hover:text-[#b88a44] flex items-center justify-center mx-auto transition-colors mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {dragOver ? 'Drop image here now' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  PNG, JPG, WEBP (Saved to DEC_Backend/uploads)
                </p>
              </div>
            )}

            {/* Image Preview Thumbnail with Remove 'X' button */}
            {imagePreview && !uploadingImage && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs h-44 group bg-slate-900">
                <img
                  src={getImageUrl(imagePreview)}
                  alt="Service Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/login-bg.jpg'
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-3 flex items-center justify-between">
                  <span className="text-[11px] text-white/90 font-medium truncate max-w-[200px]">
                    {imagePreview.split('/').pop()}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40">
                    Saved in Backend
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setImagePreview('')}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Status Toggle */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#b88a44] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Status</h2>
            </div>

            {/* Active / Inactive Dual Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('Active')}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  status === 'Active'
                    ? 'bg-[#00875a] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Active</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Inactive')}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  status === 'Inactive'
                    ? 'bg-[#0c1424] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block" />
                <span>Inactive</span>
              </button>
            </div>
          </div>

          {/* Card 3: SEO Settings (Optional) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#b88a44] flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">SEO Settings (Optional)</h2>
            </div>

            {/* Meta Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Enter meta title"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44] transition-colors"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Meta Description
              </label>
              <textarea
                rows={3}
                maxLength={160}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Enter meta description"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44] transition-colors resize-none"
              />
              <div className="flex justify-end">
                <span className="text-[11px] text-slate-400">
                  {metaDescription.length}/160
                </span>
              </div>
            </div>

            {/* Meta Keywords */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Meta Keywords</label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="Enter keywords (comma separated)"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44] transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons: Reset & Save Service */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-6 rounded-xl bg-[#0c1424] hover:bg-[#152035] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0c1424]/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 text-[#c59b58]" />
              )}
              <span>{submitting ? 'Publishing Service...' : 'Save Service'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
