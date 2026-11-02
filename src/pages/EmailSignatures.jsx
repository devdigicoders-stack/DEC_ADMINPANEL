import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Home,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileCode,
  CheckCircle2,
  AlertCircle,
  X,
  FileSignature,
  FileText,
  Building,
  Sparkles,
  Upload,
  RotateCcw,
  ShieldCheck,
  Award,
  Layers,
  Lock,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Type,
} from 'lucide-react'
import signatureService from '../services/signatureService.js'
import uploadService from '../services/uploadService.js'
import generateSignatureHtml, {
  DEFAULT_CERTIFICATION_LOGOS,
} from '../utils/signatureTemplate.js'
import { getImageUrl } from '../services/api.js'

const PRESET_GRADE_BADGE =
  'https://taxcaresolution.com/wp-content/uploads/2026/08/Grade-Text-New.png'
const PRESET_COMPANY_LOGO =
  'https://taxcaresolution.com/wp-content/uploads/2026/08/DEC-new-final.jpg'

const DEFAULT_SIGNATURE = {
  name: '',
  qualifications: '',
  designation: '',
  mobile: '',
  telephone: '',
  email: '',
  address: 'Office 704, Manarat Lusail Tower, Qatar',
  addressUrl: 'https://maps.app.goo.gl/zHL4LceLwR4XPNbF6?g_st=iwb',
  website: 'www.desentralqatar.com',
  websiteUrl: 'https://desentralqatar.com/',
  linkedin: 'LinkedIn',
  linkedinUrl: 'https://www.linkedin.com/company/desentral-engineering-consultancy/',
  // Dynamic Grade / Classification Controls
  showGradeBadge: true,
  gradeType: 'image', // 'image' | 'text'
  gradeTextPrefix: 'Grade A',
  gradeTextSuffix: 'Multidisciplinary Engineering Consultancy',
  gradeBadgeUrl: PRESET_GRADE_BADGE,
  // Dynamic Multiple Certification Logos
  showCertifications: true,
  certificationLogos: DEFAULT_CERTIFICATION_LOGOS,
  certLogoHeight: 28,
  certificationsUrl: 'https://taxcaresolution.com/wp-content/uploads/2026/08/Certifications-logos-new.jpg',
  // Optional 3rd badge
  showCustomAuthorityLogo: false,
  customAuthorityLogoUrl: '',
  // Company Logo (Static default)
  companyLogoUrl: PRESET_COMPANY_LOGO,
  disclaimer:
    'The content of this email is confidential and intended for the recipient specified in message only. It is strictly forbidden to share any part of this message with any third party, without a written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion, so that we can ensure such a mistake does not occur in the future.',
}

export default function EmailSignatures({ onNavigateToDashboard }) {
  const [signatures, setSignatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [uploadingField, setUploadingField] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [previewItem, setPreviewItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [previewTab, setPreviewTab] = useState('visual') // 'visual' | 'code'

  // Form State
  const [formData, setFormData] = useState(DEFAULT_SIGNATURE)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedRich, setCopiedRich] = useState(false)

  // Upload Refs
  const gradeFileRef = useRef(null)
  const multipleCertsFileRef = useRef(null)
  const singleCertReplaceIndexRef = useRef(null)
  const singleCertReplaceFileRef = useRef(null)
  const customAuthFileRef = useRef(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch signatures from backend
  const fetchSignatures = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      const res = await signatureService.getAll({ limit: 100 })
      const list = res?.data || []
      setSignatures(list)

      // If empty on first load, seed default Islam Farid signature
      if (list.length === 0) {
        try {
          const seedRes = await signatureService.seed()
          if (seedRes?.data) {
            setSignatures([seedRes.data])
          }
        } catch {
          // Ignore seed fallback
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load email signatures.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignatures()
  }, [])

  // Filtered signatures
  const filteredSignatures = useMemo(() => {
    if (!searchQuery.trim()) return signatures
    const q = searchQuery.toLowerCase().trim()
    return signatures.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.designation?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.mobile?.includes(q)
    )
  }, [signatures, searchQuery])

  // Open Add Form
  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData(DEFAULT_SIGNATURE)
    setIsFormOpen(true)
  }

  // Open Edit Form
  const handleOpenEdit = (sig) => {
    setEditingId(sig._id)
    setFormData({
      name: sig.name || '',
      qualifications: sig.qualifications || '',
      designation: sig.designation || '',
      mobile: sig.mobile || '',
      telephone: sig.telephone || '',
      email: sig.email || '',
      address: sig.address || DEFAULT_SIGNATURE.address,
      addressUrl: sig.addressUrl || DEFAULT_SIGNATURE.addressUrl,
      website: sig.website || DEFAULT_SIGNATURE.website,
      websiteUrl: sig.websiteUrl || DEFAULT_SIGNATURE.websiteUrl,
      linkedin: sig.linkedin || DEFAULT_SIGNATURE.linkedin,
      linkedinUrl: sig.linkedinUrl || DEFAULT_SIGNATURE.linkedinUrl,
      showGradeBadge: sig.showGradeBadge !== undefined ? sig.showGradeBadge : true,
      gradeType: sig.gradeType || 'image',
      gradeTextPrefix: sig.gradeTextPrefix || 'Grade A',
      gradeTextSuffix: sig.gradeTextSuffix || 'Multidisciplinary Engineering Consultancy',
      gradeBadgeUrl: sig.gradeBadgeUrl || PRESET_GRADE_BADGE,
      showCertifications: sig.showCertifications !== undefined ? sig.showCertifications : true,
      certificationLogos:
        Array.isArray(sig.certificationLogos) && sig.certificationLogos.length > 0
          ? sig.certificationLogos
          : DEFAULT_CERTIFICATION_LOGOS,
      certLogoHeight: sig.certLogoHeight || 26,
      certificationsUrl: sig.certificationsUrl || DEFAULT_SIGNATURE.certificationsUrl,
      showCustomAuthorityLogo: !!sig.showCustomAuthorityLogo,
      customAuthorityLogoUrl: sig.customAuthorityLogoUrl || '',
      companyLogoUrl: sig.companyLogoUrl || PRESET_COMPANY_LOGO,
      disclaimer: sig.disclaimer || DEFAULT_SIGNATURE.disclaimer,
    })
    setIsFormOpen(true)
  }

  // Fill Islam Farid Sample
  const handleFillSample = () => {
    setFormData({
      name: 'Islam Farid',
      qualifications: 'MSc, MBA, MCIOB, PMP',
      designation: 'Founding Partner & General Manager',
      mobile: '(+974) 31601117',
      telephone: '(+974) 44554383',
      email: 'islam@desentralqatar.com',
      address: 'Office 704, Manarat Lusail Tower, Qatar',
      addressUrl: 'https://maps.app.goo.gl/zHL4LceLwR4XPNbF6?g_st=iwb',
      website: 'www.desentralqatar.com',
      websiteUrl: 'https://desentralqatar.com/',
      linkedin: 'LinkedIn',
      linkedinUrl: 'https://www.linkedin.com/company/desentral-engineering-consultancy/',
      showGradeBadge: true,
      gradeType: 'image',
      gradeTextPrefix: 'Grade A',
      gradeTextSuffix: 'Multidisciplinary Engineering Consultancy',
      gradeBadgeUrl: PRESET_GRADE_BADGE,
      showCertifications: true,
      certificationLogos: DEFAULT_CERTIFICATION_LOGOS,
      certificationsUrl: DEFAULT_SIGNATURE.certificationsUrl,
      showCustomAuthorityLogo: false,
      customAuthorityLogoUrl: '',
      companyLogoUrl: PRESET_COMPANY_LOGO,
      disclaimer: DEFAULT_SIGNATURE.disclaimer,
    })
  }

  // Single Image Upload (Grade badge, custom authority, etc.)
  const handleUploadSingleImage = async (e, fieldName) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingField(fieldName)
      let uploadedUrl = ''

      try {
        const res = await uploadService.uploadImage(file, 'signatures')
        uploadedUrl = res?.data?.fullUrl || getImageUrl(res?.data?.url) || res?.data?.url || ''
      } catch (serverErr) {
        console.warn('Server upload failed, converting to local data URL:', serverErr)
      }

      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      setFormData((prev) => ({
        ...prev,
        [fieldName]: uploadedUrl,
      }))
      triggerToast('Image uploaded successfully!')
    } catch (err) {
      setErrorMessage(err.message || 'Image upload failed. Please try again.')
    } finally {
      setUploadingField(null)
      e.target.value = ''
    }
  }

  // Multiple Certificates Upload Handler
  const handleUploadMultipleCertificates = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      setUploadingField('multiple_certs')
      let newCerts = []

      try {
        const res = await uploadService.uploadMultiple(files, 'signatures')
        const uploadedList = Array.isArray(res?.data) ? res.data : []
        if (uploadedList.length > 0) {
          newCerts = uploadedList.map((item, idx) => ({
            name: files[idx]?.name?.replace(/\.[^.]+$/, '') || `Cert ${idx + 1}`,
            url: item.fullUrl || getImageUrl(item.url) || item.url,
          }))
        }
      } catch (serverErr) {
        console.warn('Server upload failed for multiple certs, using FileReader fallback:', serverErr)
      }

      // If server upload didn't return items, use FileReader for instant local base64
      if (newCerts.length === 0) {
        const filePromises = files.map(
          (file, idx) =>
            new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = () =>
                resolve({
                  name: file.name.replace(/\.[^.]+$/, '') || `Cert ${idx + 1}`,
                  url: reader.result,
                })
              reader.onerror = () =>
                resolve({
                  name: file.name.replace(/\.[^.]+$/, '') || `Cert ${idx + 1}`,
                  url: '',
                })
              reader.readAsDataURL(file)
            })
        )
        newCerts = await Promise.all(filePromises)
      }

      setFormData((prev) => ({
        ...prev,
        certificationLogos: [...(prev.certificationLogos || []), ...newCerts.filter((c) => c && c.url)],
        showCertifications: true,
      }))

      triggerToast(`Added ${newCerts.length} certificate logo(s) successfully!`)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload certificate logos.')
    } finally {
      setUploadingField(null)
      e.target.value = ''
    }
  }

  // Replace Single Certificate Image in Array
  const handleReplaceCertImage = async (e) => {
    const file = e.target.files?.[0]
    const index = singleCertReplaceIndexRef.current
    if (!file || index === null || index === undefined) return

    try {
      setUploadingField(`cert_${index}`)
      let uploadedUrl = ''

      try {
        const res = await uploadService.uploadImage(file, 'signatures')
        uploadedUrl = res?.data?.fullUrl || getImageUrl(res?.data?.url) || res?.data?.url || ''
      } catch (err) {
        console.warn('Server upload failed, using FileReader fallback:', err)
      }

      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      setFormData((prev) => {
        const nextLogos = [...(prev.certificationLogos || [])]
        if (nextLogos[index]) {
          nextLogos[index] = {
            ...nextLogos[index],
            name: file.name.replace(/\.[^.]+$/, '') || nextLogos[index].name,
            url: uploadedUrl,
          }
        }
        return { ...prev, certificationLogos: nextLogos }
      })
      triggerToast('Certificate logo replaced successfully!')
    } catch (err) {
      setErrorMessage(err.message || 'Failed to replace certificate image.')
    } finally {
      setUploadingField(null)
      singleCertReplaceIndexRef.current = null
      e.target.value = ''
    }
  }

  // Add Empty Certificate Row
  const handleAddCertRow = () => {
    setFormData((prev) => ({
      ...prev,
      certificationLogos: [
        ...(prev.certificationLogos || []),
        { name: 'New Certificate', url: '' },
      ],
      showCertifications: true,
    }))
  }

  // Remove Certificate Row
  const handleRemoveCertRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      certificationLogos: prev.certificationLogos.filter((_, i) => i !== index),
    }))
  }

  // Move Certificate Row Up/Down
  const handleMoveCert = (index, direction) => {
    setFormData((prev) => {
      const list = [...prev.certificationLogos]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= list.length) return prev
      const temp = list[index]
      list[index] = list[targetIndex]
      list[targetIndex] = temp
      return { ...prev, certificationLogos: list }
    })
  }

  // Update Certificate Field
  const handleUpdateCertField = (index, field, value) => {
    setFormData((prev) => {
      const list = [...(prev.certificationLogos || [])]
      if (list[index]) {
        list[index] = { ...list[index], [field]: value }
      }
      return { ...prev, certificationLogos: list }
    })
  }

  // Real-time generated HTML for Form Preview
  const liveHtml = useMemo(() => {
    return generateSignatureHtml(formData)
  }, [formData])

  // Save Signature (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setErrorMessage('Please enter the employee full name.')
      return
    }
    if (!formData.designation.trim()) {
      setErrorMessage('Please enter the job title / designation.')
      return
    }

    try {
      setActionLoading(true)
      setErrorMessage('')

      if (editingId) {
        await signatureService.update(editingId, formData)
        triggerToast(`Email signature for "${formData.name}" updated successfully!`)
      } else {
        await signatureService.create(formData)
        triggerToast(`Email signature for "${formData.name}" created and HTML file saved!`)
      }

      setIsFormOpen(false)
      await fetchSignatures()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save email signature.')
    } finally {
      setActionLoading(false)
    }
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteItem) return
    try {
      setActionLoading(true)
      await signatureService.delete(deleteItem._id)
      triggerToast(`Signature for "${deleteItem.name}" deleted.`)
      setDeleteItem(null)
      await fetchSignatures()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete signature.')
    } finally {
      setActionLoading(false)
    }
  }

  // Copy HTML string to clipboard
  const handleCopyHtmlCode = async (html) => {
    try {
      await navigator.clipboard.writeText(html)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2500)
      triggerToast('HTML code copied to clipboard!')
    } catch (err) {
      console.error(err)
      triggerToast('Could not copy automatically. Please copy manually.')
    }
  }

  // Copy Visual Signature (MIME text/html) so it can be pasted directly into Outlook/Gmail
  const handleCopyVisual = async (htmlToCopy) => {
    try {
      const blobHtml = new Blob([htmlToCopy], { type: 'text/html' })
      const blobText = new Blob([htmlToCopy], { type: 'text/plain' })
      const item = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      })
      await navigator.clipboard.write([item])
      setCopiedRich(true)
      setTimeout(() => setCopiedRich(false), 2500)
      triggerToast('Signature copied! Now press Ctrl+V in Outlook, Gmail or Apple Mail.')
    } catch (err) {
      console.warn('ClipboardItem error, falling back to raw html', err)
      handleCopyHtmlCode(htmlToCopy)
    }
  }

  // Client-side file download helper
  const handleClientDownload = (sig) => {
    const content = generateSignatureHtml(sig)
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(sig.name || 'signature').trim().replace(/[^a-zA-Z0-9_\-]/g, '_')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    triggerToast(`Downloaded ${a.download}`)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans antialiased">
      {/* Hidden File Inputs for Logo Uploads */}
      <input
        type="file"
        ref={gradeFileRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUploadSingleImage(e, 'gradeBadgeUrl')}
      />
      <input
        type="file"
        ref={multipleCertsFileRef}
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleUploadMultipleCertificates}
      />
      <input
        type="file"
        ref={singleCertReplaceFileRef}
        accept="image/*"
        className="hidden"
        onChange={handleReplaceCertImage}
      />
      <input
        type="file"
        ref={customAuthFileRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUploadSingleImage(e, 'customAuthorityLogoUrl')}
      />

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
        <span className="text-slate-800 font-semibold">Email Signatures</span>
      </div>

      {/* ============================================================== */}
      {/* 2. PAGE HEADER ROW: TITLE & ACTION BUTTONS                     */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Email Signatures
            </h1>
            <span className="px-2.5 py-1 text-xs font-semibold bg-[#b88a44]/15 text-[#b88a44] border border-[#b88a44]/30 rounded-full">
              Multi-Certificate &amp; Dynamic Layout
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create and manage official DEC corporate email signatures with multiple dynamic certificate logos and auto-saved HTML files.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchSignatures}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh Signatures"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#b88a44]' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#b88a44] to-[#a37736] hover:from-[#a37736] hover:to-[#8f652b] active:scale-[0.98] text-white font-medium text-sm shadow-sm transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Signature</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl font-medium flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl font-medium flex items-center justify-between gap-2.5 shadow-2xs animate-in fade-in duration-200">
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
      {/* 3. STATS SUMMARY ROW                                           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Signatures</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{signatures.length}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-[#b88a44]">
            <FileSignature className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">HTML Files Saved</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{signatures.length}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600">
            <FileCode className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Certificates Layout</p>
            <h3 className="text-sm font-bold text-slate-800 mt-1">Multi-Logos · Proportional</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Framing &amp; Brand</p>
            <h3 className="text-sm font-bold text-slate-800 mt-1">DEC Logo &amp; Gold Lines</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center justify-center text-purple-600">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. SEARCH & FILTER TOOLBAR                                     */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, designation, email or phone..."
            className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] focus:bg-white transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 font-medium">
          <span>Showing {filteredSignatures.length} of {signatures.length} signatures</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. SIGNATURES DATA TABLE                                       */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#b88a44] mx-auto" />
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Loading signatures from server...</p>
          </div>
        ) : filteredSignatures.length === 0 ? (
          <div className="p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 text-[#b88a44] flex items-center justify-center mx-auto">
              <FileSignature className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No email signatures found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery
                  ? `No results matching "${searchQuery}". Try a different keyword.`
                  : 'Start by creating your first official corporate email signature.'}
              </p>
            </div>
            {!searchQuery && (
              <div className="flex items-center justify-center pt-2">
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-[#b88a44] hover:bg-[#a37736] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Create First Signature
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Employee / Executive</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Certificates</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">HTML File</th>
                  <th className="py-3.5 px-4 text-center">Preview</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSignatures.map((sig) => {
                  const fullFileUrl = sig.fileUrl ? getImageUrl(sig.fileUrl) : ''
                  const certCount = Array.isArray(sig.certificationLogos)
                    ? sig.certificationLogos.length
                    : 6

                  return (
                    <tr key={sig._id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Name & Qualifications */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#b88a44]/20 to-[#b88a44]/40 border border-[#b88a44]/40 text-[#8f652b] font-bold flex items-center justify-center shrink-0 text-xs">
                            {sig.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 group-hover:text-[#b88a44] transition-colors">
                                {sig.name}
                              </span>
                              {sig.qualifications && (
                                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                                  {sig.qualifications}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 block mt-0.5">
                              DEC Corporate Signature
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-4 px-4 font-medium text-slate-800">
                        {sig.designation}
                      </td>

                      {/* Authority Badges summary */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {sig.showGradeBadge !== false && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-semibold">
                              <Award className="w-3 h-3 text-[#b88a44]" />
                              {sig.gradeType === 'text' ? (sig.gradeTextPrefix || 'Grade A') : 'Grade A'}
                            </span>
                          )}
                          {sig.showCertifications !== false && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/80 text-[10px] font-semibold">
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              {certCount} Logos
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contacts */}
                      <td className="py-4 px-4 space-y-1 text-xs">
                        {sig.email && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-[#b88a44] shrink-0" />
                            <a href={`mailto:${sig.email}`} className="hover:underline hover:text-[#b88a44]">
                              {sig.email}
                            </a>
                          </div>
                        )}
                        {sig.mobile && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-[#b88a44] shrink-0" />
                            <span>{sig.mobile}</span>
                          </div>
                        )}
                      </td>

                      {/* HTML File Details */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-medium">
                          <FileCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[150px]">{sig.fileName || `${sig.name}.html`}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Saved in uploads/signatures
                        </span>
                      </td>

                      {/* Quick Preview Thumbnail Button */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            setPreviewItem(sig)
                            setPreviewTab('visual')
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#b88a44] hover:text-white text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Download Button */}
                          <button
                            onClick={() => handleClientDownload(sig)}
                            className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Download .html file"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Open standalone file in new tab if available */}
                          {fullFileUrl && (
                            <a
                              href={fullFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Open HTML file in browser tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(sig)}
                            className="p-2 rounded-lg text-slate-500 hover:text-[#b88a44] hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit Signature"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteItem(sig)}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Signature"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 6. CREATE / EDIT SIGNATURE FORM MODAL (SPLIT VIEW)             */}
      {/* ============================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-7xl w-full my-auto flex flex-col max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#b88a44] flex items-center justify-center">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
                    {editingId ? 'Edit Email Signature' : 'Create Dynamic Email Signature'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload multiple certificate logos individually. They will fit horizontally in exact proportion without breaking layout.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - 2 Column Split Layout */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
              {/* Left Column: Form Inputs (5 cols) */}
              <form id="sigForm" onSubmit={handleSubmit} className="lg:col-span-5 xl:col-span-5 space-y-4">
                {/* 1. Identity & Role */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#b88a44]" />
                    1. Identity &amp; Role
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Islam Farid"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Qualifications / Credentials
                    </label>
                    <input
                      type="text"
                      value={formData.qualifications}
                      onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                      placeholder="e.g. MSc, MBA, MCIOB, PMP"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Designation / Job Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Founding Partner & General Manager"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                    />
                  </div>
                </div>

                {/* 2. Dynamic Grade / Classification */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-[#b88a44]" />
                      2. Grade / Classification (Dynamic)
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          showGradeBadge: true,
                          gradeType: 'image',
                          gradeBadgeUrl: PRESET_GRADE_BADGE,
                          gradeTextPrefix: 'Grade A',
                          gradeTextSuffix: 'Multidisciplinary Engineering Consultancy',
                        })
                      }
                      className="text-[11px] text-slate-400 hover:text-[#b88a44] flex items-center gap-1 cursor-pointer"
                      title="Reset Grade"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.showGradeBadge}
                          onChange={(e) => setFormData({ ...formData, showGradeBadge: e.target.checked })}
                          className="rounded text-[#b88a44] focus:ring-[#b88a44] w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Display Grade / Accreditation</span>
                      </label>

                      {formData.showGradeBadge && (
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, gradeType: 'image' })}
                            className={`px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer ${
                              formData.gradeType === 'image'
                                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                : 'text-slate-500'
                            }`}
                          >
                            <ImageIcon className="w-3 h-3" /> Image
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, gradeType: 'text' })}
                            className={`px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer ${
                              formData.gradeType === 'text'
                                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                : 'text-slate-500'
                            }`}
                          >
                            <Type className="w-3 h-3" /> Text
                          </button>
                        </div>
                      )}
                    </div>

                    {formData.showGradeBadge && formData.gradeType === 'image' && (
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        {formData.gradeBadgeUrl && (
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                            <img
                              src={formData.gradeBadgeUrl}
                              alt="Grade Badge Preview"
                              className="h-7 max-w-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formData.gradeBadgeUrl}
                            onChange={(e) => setFormData({ ...formData, gradeBadgeUrl: e.target.value })}
                            placeholder="Grade badge image URL..."
                            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#b88a44] text-slate-700"
                          />
                          <button
                            type="button"
                            disabled={uploadingField === 'gradeBadgeUrl'}
                            onClick={() => gradeFileRef.current?.click()}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            <Upload className="w-3 h-3" />
                            <span>{uploadingField === 'gradeBadgeUrl' ? '...' : 'Upload'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {formData.showGradeBadge && formData.gradeType === 'text' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Prefix (Gold)</label>
                          <input
                            type="text"
                            value={formData.gradeTextPrefix}
                            onChange={(e) => setFormData({ ...formData, gradeTextPrefix: e.target.value })}
                            placeholder="e.g. Grade A"
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#b88a44] text-slate-800 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Suffix (Black)</label>
                          <input
                            type="text"
                            value={formData.gradeTextSuffix}
                            onChange={(e) => setFormData({ ...formData, gradeTextSuffix: e.target.value })}
                            placeholder="e.g. Multidisciplinary Engineering Consultancy"
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#b88a44] text-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. MULTIPLE DYNAMIC CERTIFICATION LOGOS */}
                <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-200/80 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        3. Multiple Certification Logos (Dynamic)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Upload individual logos. They scale to exact height (26px) &amp; fit in 1 clean row.
                      </p>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showCertifications}
                        onChange={(e) => setFormData({ ...formData, showCertifications: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Show</span>
                    </label>
                  </div>

                  {formData.showCertifications && (
                    <div className="space-y-3">
                      {/* Upload Actions Toolbar */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Height Preset Selector */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="font-semibold text-[11px] text-slate-500">Logo Size:</span>
                          {[26, 28, 30, 34].map((h) => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => setFormData({ ...formData, certLogoHeight: h })}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                (formData.certLogoHeight || 28) === h
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {h}px{h === 28 ? ' (Standard)' : ''}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          disabled={uploadingField === 'multiple_certs'}
                          onClick={() => multipleCertsFileRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingField === 'multiple_certs' ? 'Uploading...' : 'Upload Multiple Logos'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAddCertRow}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Single</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              certificationLogos: DEFAULT_CERTIFICATION_LOGOS,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-blue-700 text-xs font-medium transition-colors cursor-pointer"
                          title="Reset to 6 standard DEC certificates (ISO, GSAS, Tawteen, ICV)"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Default 6 DEC Logos</span>
                        </button>

                        {formData.certificationLogos?.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, certificationLogos: [] })}
                            className="text-xs text-rose-500 hover:text-rose-700 font-medium ml-auto cursor-pointer"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Certificate Logos List */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                        {(formData.certificationLogos || []).map((cert, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-2 group"
                          >
                            {/* Drag / Index */}
                            <span className="text-[10px] font-mono text-slate-400 w-4 text-center shrink-0">
                              {idx + 1}
                            </span>

                            {/* Thumbnail preview strictly 26px */}
                            <div className="w-10 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                              {cert.url ? (
                                <img
                                  src={cert.url}
                                  alt={cert.name || 'Cert'}
                                  className="h-full w-auto max-w-full object-contain"
                                />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5 text-slate-300" />
                              )}
                            </div>

                            {/* Name & URL inputs */}
                            <input
                              type="text"
                              value={cert.name || ''}
                              onChange={(e) => handleUpdateCertField(idx, 'name', e.target.value)}
                              placeholder="Name e.g. ISO 9001"
                              className="w-24 sm:w-28 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800 font-medium shrink-0"
                            />

                            <input
                              type="text"
                              value={cert.url || ''}
                              onChange={(e) => handleUpdateCertField(idx, 'url', e.target.value)}
                              placeholder="Image URL or upload..."
                              className="flex-1 min-w-0 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 font-mono text-[11px]"
                            />

                            {/* Action Buttons: Replace, Move Up, Move Down, Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                singleCertReplaceIndexRef.current = idx
                                singleCertReplaceFileRef.current?.click()
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer shrink-0"
                              title="Upload/Replace Image"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveCert(idx, 'up')}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer shrink-0"
                              title="Move Left"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={idx === (formData.certificationLogos?.length || 1) - 1}
                              onClick={() => handleMoveCert(idx, 'down')}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer shrink-0"
                              title="Move Right"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveCertRow(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer shrink-0"
                              title="Remove Certificate"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {(!formData.certificationLogos || formData.certificationLogos.length === 0) && (
                          <div className="p-3 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                            No certificate logos added yet. Click &quot;Upload Multiple Logos&quot; or &quot;Default 6 DEC Logos&quot; above.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Contact Numbers & Email */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#b88a44]" />
                    4. Contact Numbers &amp; Email
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Phone
                      </label>
                      <input
                        type="text"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="(+974) 31601117"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Telephone / Landline
                      </label>
                      <input
                        type="text"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        placeholder="(+974) 44554383"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="islam@desentralqatar.com"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                    />
                  </div>
                </div>

                {/* 5. Address, Website & LinkedIn */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#b88a44]" />
                    5. Address, Website &amp; LinkedIn
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Office Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Office 704, Manarat Lusail Tower, Qatar"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Maps Link URL
                    </label>
                    <input
                      type="url"
                      value={formData.addressUrl}
                      onChange={(e) => setFormData({ ...formData, addressUrl: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Website Text
                      </label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="www.desentralqatar.com"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Website Link URL
                      </label>
                      <input
                        type="url"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        placeholder="https://desentralqatar.com/"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        LinkedIn Text
                      </label>
                      <input
                        type="text"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        placeholder="LinkedIn"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        placeholder="https://www.linkedin.com/company/..."
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] transition-colors text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Confidentiality Disclaimer */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    6. Confidentiality Disclaimer
                  </label>
                  <textarea
                    rows={3}
                    value={formData.disclaimer}
                    onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#b88a44] text-slate-700"
                  />
                </div>
              </form>

              {/* Right Column: Live Interactive Preview (7 cols) */}
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Live Real-Time WYSIWYG Preview
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyVisual(liveHtml)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                      title="Copy rich visual signature to paste directly into email clients"
                    >
                      {copiedRich ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRich ? 'Copied Visual!' : 'Copy for Email'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyHtmlCode(liveHtml)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                      title="Copy raw HTML markup"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileCode className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied HTML!' : 'Copy HTML'}</span>
                    </button>
                  </div>
                </div>

                {/* The Rendered Preview Container using srcDoc iframe for 100% email fidelity */}
                <div className="p-4 sm:p-6 bg-slate-100/80 rounded-3xl border border-slate-200/90 flex items-center justify-center min-h-[380px] overflow-x-auto shadow-inner">
                  <div
                    className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-200 shrink-0"
                    style={{ width: '600px', maxWidth: '100%' }}
                  >
                    <iframe
                      srcDoc={liveHtml}
                      title="Email Signature Preview"
                      style={{
                        width: '560px',
                        height: '320px',
                        border: 'none',
                        display: 'block',
                        background: 'transparent',
                        overflow: 'hidden',
                      }}
                    />
                  </div>
                </div>

                {/* Live Details Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#b88a44]" /> Fixed / Static Branding:
                    </span>
                    <p className="text-slate-500">
                      DEC Corporate Logo + Gold Vertical Divider + Solid Gold Line Bar (#bd902e).
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Dynamic Certificates Row:
                    </span>
                    <p className="text-slate-500">
                      {formData.certificationLogos?.length || 0} logo(s) auto-fitted horizontally within max-height: 26px bounds.
                    </p>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Sparkles className="w-3.5 h-3.5 text-[#b88a44]" />
                    Proportional Fitting:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                    <li>Each uploaded certificate logo is automatically constrained to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px] font-bold">height=&quot;26&quot; max-height: 26px</code> so no matter the source image resolution, it never overflows.</li>
                    <li>You can select and upload multiple images at once using <strong>&quot;Upload Multiple Logos&quot;</strong>.</li>
                    <li>Saving automatically updates the standalone HTML file in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px] font-bold">uploads/signatures/</code>.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="sigForm"
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#b88a44] to-[#a37736] hover:from-[#a37736] hover:to-[#8f652b] text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{editingId ? 'Update Signature & File' : 'Save & Generate HTML File'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. PREVIEW & CODE MODAL                                         */}
      {/* ============================================================== */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-auto flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#b88a44] flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-slate-900">
                    {previewItem.name} - Email Signature
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {previewItem.designation} · {previewItem.fileName || 'Islam_Farid.html'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Visual vs Code Tab Switcher */}
                <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setPreviewTab('visual')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      previewTab === 'visual'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Visual Preview
                  </button>
                  <button
                    onClick={() => setPreviewTab('code')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      previewTab === 'code'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    HTML Code
                  </button>
                </div>

                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            {(() => {
              const currentPreviewHtml = generateSignatureHtml(previewItem)
              return (
                <>
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {previewTab === 'visual' ? (
                      <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-2xl border border-slate-200/90 overflow-x-auto">
                        <div
                          className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-200 shrink-0"
                          style={{ width: '600px', maxWidth: '100%' }}
                        >
                          <iframe
                            srcDoc={currentPreviewHtml}
                            title="Email Signature Modal Preview"
                            style={{
                              width: '560px',
                              height: '320px',
                              border: 'none',
                              display: 'block',
                              background: 'transparent',
                              overflow: 'hidden',
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <textarea
                          readOnly
                          rows={18}
                          value={currentPreviewHtml}
                          className="w-full p-4 font-mono text-xs bg-slate-900 text-emerald-400 rounded-2xl border border-slate-800 focus:outline-none selection:bg-emerald-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-2">
                      {previewItem.fileUrl && (
                        <a
                          href={getImageUrl(previewItem.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open HTML in Tab</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleClientDownload(previewItem)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .html</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyVisual(currentPreviewHtml)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#b88a44] hover:bg-[#a37736] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Visual for Outlook / Gmail</span>
                      </button>

                      <button
                        onClick={() => handleCopyHtmlCode(currentPreviewHtml)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </button>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. DELETE CONFIRMATION MODAL                                    */}
      {/* ============================================================== */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">Delete Email Signature?</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Are you sure you want to delete the signature for <strong className="text-slate-800">{deleteItem.name}</strong>?
                This will remove the database record and delete the HTML file from server storage.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
