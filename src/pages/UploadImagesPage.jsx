import { useState, useRef } from 'react'
import {
  Home,
  UploadCloud,
  FolderUp,
  Image as ImageIcon,
  Folder,
  Tag,
  CheckCircle2,
  X,
  FileImage,
  MapPin,
  Layers,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import uploadService from '../services/uploadService.js'
import galleryService from '../services/galleryService.js'

// Official DEC Gallery Categories
const SECTOR_OPTIONS = [
  { label: 'Offices – Corporate Headquarters', value: 'Offices' },
  { label: 'Retail – Luxury Flagship & Commercial', value: 'Retail' },
  { label: 'F&B – Fine Dining & Hospitality Cafés', value: 'F&B' },
  { label: 'Hospitality – Hotels, Resorts & Lounges', value: 'Hospitality' },
  { label: 'Residential – Luxury Estates & Villas', value: 'Residential' },
  { label: 'Industrial – Manufacturing & Logistics', value: 'Industrial' },
  { label: 'Medical & Healthcare Facilities', value: 'Medical & Healthcare' },
]

export default function UploadImagesPage({ onNavigateToGallery, onNavigateToDashboard }) {
  const [uploadMode, setUploadMode] = useState('files') // 'files' | 'folder'
  const [fileQueue, setFileQueue] = useState([])
  const [category, setCategory] = useState('Offices')
  const [location, setLocation] = useState('Lusail, Qatar')
  const [scope, setScope] = useState('ARCH R&M, MEP & QCD Design & Supervision')
  const [tags, setTags] = useState('exterior, architecture, facade, premium')
  const [status, setStatus] = useState('active')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Drop handler
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(Array.from(e.dataTransfer.files))
    }
  }

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // Format filename to clean human title
  const formatTitleFromFileName = (fileName) => {
    return fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  // Handle added files
  const handleFilesAdded = (filesList) => {
    setErrorMessage('')
    const imageFiles = filesList.filter(
      (file) =>
        file.type.startsWith('image/') ||
        file.name.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)
    )

    if (imageFiles.length === 0) {
      setErrorMessage('Please select valid image files (JPG, PNG, WEBP, or SVG).')
      return
    }

    const newItems = imageFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      name: file.name,
      title: formatTitleFromFileName(file.name),
      size: formatFileSize(file.size),
      dimensions: 'High-Res Survey',
      type: file.type || 'image/jpeg',
      preview: URL.createObjectURL(file),
      status: 'Ready',
      progress: 0,
    }))

    setFileQueue((prev) => [...prev, ...newItems])
  }

  // Remove single file from queue
  const handleRemoveItem = (id) => {
    const itemToRemove = fileQueue.find((item) => item.id === id)
    if (itemToRemove && itemToRemove.preview && itemToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(itemToRemove.preview)
    }
    setFileQueue(fileQueue.filter((item) => item.id !== id))
  }

  // Clear all
  const handleClearQueue = () => {
    fileQueue.forEach((item) => {
      if (item.preview && item.preview.startsWith('blob:')) {
        URL.revokeObjectURL(item.preview)
      }
    })
    setFileQueue([])
    setErrorMessage('')
  }

  // Start real upload to Backend Gallery API
  const handleStartUpload = async () => {
    if (fileQueue.length === 0 || isUploading) return

    setErrorMessage('')
    setIsUploading(true)
    setUploadProgress({ current: 0, total: fileQueue.length })

    let successCount = 0
    const updatedQueue = [...fileQueue]

    try {
      for (let i = 0; i < updatedQueue.length; i++) {
        const item = updatedQueue[i]
        item.status = 'Uploading...'
        setFileQueue([...updatedQueue])

        try {
          // 1. Upload binary file to DEC_Backend/uploads/gallery
          const uploadRes = await uploadService.uploadImage(item.file, 'gallery')

          if (!uploadRes.success || !uploadRes.data?.url) {
            throw new Error(uploadRes.message || 'Image upload failed')
          }

          const relativeImageUrl = uploadRes.data.url

          // 2. Create Gallery Record in MongoDB
          const galleryPayload = {
            title: item.title || formatTitleFromFileName(item.name),
            fileName: item.name,
            image: relativeImageUrl,
            sector: category,
            location: location.trim() || 'Doha, Qatar',
            scope: scope.trim() || 'Visual Archive Documentation',
            status: status,
            dimensions: item.dimensions || '3840 x 2160',
            fileSize: item.size || '2.5 MB',
          }

          const createRes = await galleryService.create(galleryPayload)

          if (!createRes.success) {
            throw new Error(createRes.message || 'Failed to save gallery entry')
          }

          item.status = 'Uploaded'
          item.progress = 100
          successCount++
        } catch (itemErr) {
          console.error(`Error uploading ${item.name}:`, itemErr)
          item.status = 'Failed'
          item.error = itemErr.message || 'Upload failed'
        }

        setUploadProgress({ current: i + 1, total: updatedQueue.length })
        setFileQueue([...updatedQueue])
      }

      if (successCount > 0) {
        setUploadSuccess(true)
        setTimeout(() => {
          if (onNavigateToGallery) onNavigateToGallery()
        }, 1800)
      } else {
        setErrorMessage('All uploads failed. Please check backend connection and retry.')
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during upload.')
    } finally {
      setIsUploading(false)
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
          onClick={onNavigateToGallery}
          className="hover:text-slate-800 transition-colors cursor-pointer"
        >
          Gallery Management
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <span className="text-slate-800 font-semibold">Upload Images to Archives</span>
      </div>

      {/* 2. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Upload Images to Gallery Archives
            </h1>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#c59b58]/10 text-[#a07430] border border-[#c59b58]/20">
              Visual Archives
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic image uploader storing directly into backend server storage (<code>/uploads/gallery</code>) and MongoDB.
          </p>
        </div>

        {/* View All Images Button */}
        <button
          onClick={onNavigateToGallery}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <ImageIcon className="w-4 h-4 text-slate-500" />
          <span>View All Gallery Archives</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Banner */}
      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            {uploadProgress.current} visual archives uploaded and saved into MongoDB successfully! Redirecting to gallery...
          </span>
        </div>
      )}

      {/* 3. Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Dropzone + File Queue */}
        <div className="lg:col-span-8 space-y-6">
          {/* Mode Switch Tabs (Files vs Folder) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUploadMode('files')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                uploadMode === 'files'
                  ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-xs font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Individual Photographs</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('folder')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                uploadMode === 'folder'
                  ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-xs font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FolderUp className="w-4 h-4" />
              <span>Upload Entire Archive Folder</span>
            </button>
          </div>

          {/* Hidden Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) handleFilesAdded(Array.from(e.target.files))
              e.target.value = ''
            }}
            className="hidden"
          />
          <input
            type="file"
            ref={folderInputRef}
            webkitdirectory=""
            directory=""
            multiple
            onChange={(e) => {
              if (e.target.files) handleFilesAdded(Array.from(e.target.files))
              e.target.value = ''
            }}
            className="hidden"
          />

          {/* Main Dropzone Card */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all bg-white shadow-xs ${
              dragActive
                ? 'border-[#b88a44] bg-amber-50/40 scale-[1.005]'
                : 'border-slate-200/90 hover:border-[#b88a44]'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#b88a44] flex items-center justify-center mx-auto mb-4 shadow-2xs">
              {uploadMode === 'folder' ? (
                <FolderUp className="w-8 h-8" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              {uploadMode === 'folder'
                ? 'Drag & drop an entire project archive folder here'
                : 'Drag & drop site photographs here'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              Supports high-resolution PNG, JPG, JPEG, WEBP and RAW site photography up to 25MB per file.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-[#0c1424] hover:bg-[#16233b] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-[#c59b58]" />
                <span>Browse Image Files</span>
              </button>

              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FolderUp className="w-4 h-4 text-slate-500" />
                <span>Browse Archive Folder</span>
              </button>
            </div>
          </div>

          {/* Files Queue Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Upload Queue ({fileQueue.length} Images Ready)
                </h3>
              </div>

              {fileQueue.length > 0 && !isUploading && (
                <button
                  type="button"
                  onClick={handleClearQueue}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {/* Queue Grid */}
            {fileQueue.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No images in the upload queue. Drag files into the box above or click Browse.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {fileQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex items-center gap-3 group"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.name} • {item.size}
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Uploaded'
                              ? 'bg-emerald-500'
                              : item.status === 'Failed'
                              ? 'bg-rose-500'
                              : item.status === 'Uploading...'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-semibold ${
                            item.status === 'Uploaded'
                              ? 'text-emerald-600'
                              : item.status === 'Failed'
                              ? 'text-rose-600'
                              : item.status === 'Uploading...'
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Categorization & Upload Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Batch Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#b88a44]" />
              <h3 className="text-sm font-bold text-slate-900">
                Visual Archive Classification
              </h3>
            </div>

            {/* Sector Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Sector Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44] cursor-pointer"
              >
                {SECTOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Site Location
              </label>
              <div className="relative rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lusail, Qatar or Doha Corniche"
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
              </div>
            </div>

            {/* Scope / Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Engineering Scope / Notes
              </label>
              <div className="relative rounded-xl">
                <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={2}
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="e.g. ARCH R&M, MEP & QCD Design & Supervision"
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44] resize-none"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Search Tags (Comma-Separated)
              </label>
              <div className="relative rounded-xl">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. facade, interior, fitout"
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
              </div>
            </div>

            {/* Publication Status */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">
                Initial Publication Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    status === 'active'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Active (Public)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('inactive')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    status === 'inactive'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Draft / Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <button
              type="button"
              disabled={fileQueue.length === 0 || isUploading}
              onClick={handleStartUpload}
              className="w-full py-3 px-4 rounded-xl bg-[#0c1424] hover:bg-[#16233b] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0c1424]/20 transition-all active:scale-[0.99] cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 text-[#c59b58] animate-spin" />
                  <span>
                    Uploading {uploadProgress.current} of {uploadProgress.total}...
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-[#c59b58]" />
                  <span>
                    {fileQueue.length === 0
                      ? 'Select Images to Upload'
                      : `Upload ${fileQueue.length} Images to Gallery`}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onNavigateToGallery}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer text-center block"
            >
              Cancel & Return to Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
