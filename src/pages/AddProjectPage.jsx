import { useState, useRef } from 'react'
import {
  Home,
  Image as ImageIcon,
  Settings,
  UploadCloud,
  Check,
  MapPin,
  Building,
  Send,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react'
import projectService from '../services/projectService.js'
import uploadService from '../services/uploadService.js'
import { getImageUrl } from '../services/api.js'

export default function AddProjectPage({
  onNavigateToProjects,
  onNavigateToDashboard,
}) {
  // Form State
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [sector, setSector] = useState('Offices')
  const [type, setType] = useState('')
  const [client, setClient] = useState('')
  const [location, setLocation] = useState('')
  const [year, setYear] = useState('2025')
  const [scope, setScope] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState(['QCD Approved', 'MEP Engineering'])
  const [tagInput, setTagInput] = useState('')

  // Image & Settings State
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [status, setStatus] = useState('active') // 'active' | 'inactive'
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const fileInputRef = useRef(null)

  // Upload handler to backend uploads/projects
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingImage(true)
      setErrorMessage('')
      const res = await uploadService.uploadImage(file, 'projects')
      if (res?.data?.url) {
        setImagePreview(res.data.url)
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Image upload to server failed. Please try again.'
      )
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Tag Add
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  // Tag Remove
  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMessage('Project title is required.')
      return
    }
    if (!location.trim()) {
      setErrorMessage('Project location is required.')
      return
    }
    if (!scope.trim()) {
      setErrorMessage('Scope of work is required.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage('')

      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        sector,
        type: type.trim(),
        location: location.trim(),
        scope: scope.trim(),
        tags,
        image: imagePreview || '',
        client: client.trim(),
        year: year.trim(),
        description: description.trim(),
        status: status.toLowerCase(),
      }

      await projectService.create(payload)
      setSavedSuccess(true)
      setTimeout(() => {
        if (onNavigateToProjects) onNavigateToProjects()
      }, 1200)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create project on server.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans antialiased text-slate-800">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button
          onClick={onNavigateToDashboard}
          className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-slate-700" />
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <button
          onClick={onNavigateToProjects}
          className="hover:text-slate-800 transition-colors cursor-pointer"
        >
          Projects Management
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <span className="text-slate-800 font-semibold">Add New Project</span>
      </div>

      {/* 2. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Add New Project
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Create and showcase a new architectural or engineering landmark project on your website.
        </p>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-xs text-rose-500 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Project created successfully! Redirecting to All Projects list...</span>
        </div>
      )}

      {/* 3. Main Form Grid */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          {/* Row 1: Code & Sector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Project Code <span className="text-slate-400 font-normal">(Optional, e.g. DEC-085)</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Leave empty for auto-generated code"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
                />
              </div>
            </div>

            {/* Sector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Sector Discipline <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] cursor-pointer"
              >
                <option value="Offices">Offices – Corporate & Workplaces</option>
                <option value="Retail">Retail – Luxury & Commercial</option>
                <option value="F&B">F&B – Food & Beverage</option>
                <option value="Hospitality">Hospitality – Hotels & Resorts</option>
                <option value="Residential">Residential – High-End Residential</option>
                <option value="Industrial">Industrial – Manufacturing & Logistics</option>
                <option value="Medical & Healthcare">Medical – Healthcare & Pharma</option>
              </select>
            </div>
          </div>

          {/* Row 2: Project Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Project Title / Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Snoonu HQ Corporate Offices or Amazon Ads Hub"
              className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
            />
          </div>

          {/* Row 3: Location & Typology */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lusail Boulevard, Qatar or Msheireb Downtown"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
                />
              </div>
            </div>

            {/* Typology */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Typology / Type
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g. corporate headquarters, luxury flagship, destination cafe"
                className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
              />
            </div>
          </div>

          {/* Row 4: Client & Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Client */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Client / Authority <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="e.g. Snoonu Qatar / Ministry / Private Authority"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
                />
              </div>
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Engagement / Delivery Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
              />
            </div>
          </div>

          {/* Row 5: Scope of Work */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Scope of Engineering Work <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="e.g. ARCH R&M, STR, MEP, QCD Design & Supervision"
              className="w-full p-3.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Row 6: Project Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Project Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Type tag and press Add (e.g. QCD Approved, Lusail, Structural)"
                className="flex-1 px-4 py-2 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#b88a44]" />
                <span>Add Tag</span>
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row 7: Full Description (Optional Textarea) */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-800">
              Full Project Overview <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter additional background notes, specifications, or details..."
              className="w-full p-3.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b88a44]/25 focus:border-[#b88a44] transition-all resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cover Image Upload & Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#b88a44] flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Project Cover Photo</h2>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs h-48 bg-slate-100 flex items-center justify-center">
              {imagePreview ? (
                <>
                  <img
                    src={getImageUrl(imagePreview)}
                    alt="Project preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview('')}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <UploadCloud className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-400">
                    No image uploaded yet
                  </p>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#b88a44]" />
              <span>{uploadingImage ? 'Uploading...' : 'Upload Image to Server'}</span>
            </button>
          </div>

          {/* Status Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#b88a44] flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Publication Status</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Active (Live)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('inactive')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'inactive'
                    ? 'bg-[#0c1424] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Draft / Hidden</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onNavigateToProjects}
              className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-5 rounded-xl bg-[#0c1424] hover:bg-[#152035] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0c1424]/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4 text-[#b88a44]" />
              <span>{submitting ? 'Creating Project...' : 'Publish Project'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
