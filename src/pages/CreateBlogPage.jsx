import { useState, useRef, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import {
  Home,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  Tag,
  Folder,
  Save,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
} from 'lucide-react'
import RichBlogEditor from '../components/blog/RichBlogEditor.jsx'
import blogService from '../services/blogService.js'
import uploadService from '../services/uploadService.js'
import { getImageUrl } from '../services/api.js'

const CATEGORIES = [
  'Engineering & Infrastructure',
  'Architectural Design',
  'Civil & Structural',
  'Smart Cities & MEP',
  'Life Safety & Permitting',
  'General Consultancy',
]

export default function CreateBlogPage({ onNavigateToBlog, onNavigateToDashboard }) {
  const { id: routeId } = useParams()
  const location = useLocation()
  const editId = routeId || location.state?.editId || location.state?.blog?._id

  // Form State
  const [blogTitle, setBlogTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isManualSlug, setIsManualSlug] = useState(false)
  const [shortDescription, setShortDescription] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [category, setCategory] = useState('Engineering & Infrastructure')
  const [tags, setTags] = useState('engineering, cairo, doha, bim')
  const [authorName, setAuthorName] = useState('DEC Technical Advisory Board')
  const [authorRole, setAuthorRole] = useState('MMUP Grade A & QCDD Certified Experts')

  // Right Column Settings
  const [featuredImage, setFeaturedImage] = useState('/projects-gallery/01.jpg')
  const [status, setStatus] = useState('Published') // 'Published' | 'Draft' | 'Archived'
  const [displayOrder, setDisplayOrder] = useState('1')
  const [readTime, setReadTime] = useState('5 min read')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  // Structured Sections & FAQs (Matching Website Format)
  const [faqs, setFaqs] = useState([
    {
      q: 'Which statutory engineering classifications does DEC hold?',
      a: 'DEC holds MMUP/UPDA Grade A classification, QCDD Category A Fire & Life Safety licensure, and Egyptian Syndicate registration.',
    },
  ])

  // UI Processing States
  const [isLoadingBlog, setIsLoadingBlog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingThumb, setIsUploadingThumb] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const thumbInputRef = useRef(null)

  // Generate URL slug from title
  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Update slug automatically when title changes (unless manually edited)
  const handleTitleChange = (val) => {
    setBlogTitle(val)
    if (!isManualSlug) {
      setSlug(generateSlug(val))
    }
  }

  // Load existing blog if editing
  useEffect(() => {
    if (!editId) return

    const loadBlogToEdit = async () => {
      try {
        setIsLoadingBlog(true)
        setErrorMessage('')
        const res = await blogService.getBySlugOrId(editId)
        if (res.success && res.data) {
          const b = res.data
          setBlogTitle(b.title || '')
          setSlug(b.slug || '')
          setIsManualSlug(true)
          setShortDescription(b.leadExcerpt || '')
          setBlogContent(b.content || '')
          setCategory(b.category || 'Engineering & Infrastructure')
          setFeaturedImage(b.featuredImage || '/projects-gallery/01.jpg')
          setStatus(b.status || 'Published')
          setAuthorName(b.author?.name || 'DEC Technical Advisory Board')
          setAuthorRole(b.author?.role || 'MMUP Grade A & QCDD Certified Experts')
          setDisplayOrder(String(b.order || 1))
          setReadTime(b.readTime || '5 min read')
          setMetaTitle(b.metaTitle || '')
          setMetaDescription(b.metaDescription || '')
          if (Array.isArray(b.tags)) setTags(b.tags.join(', '))
          if (Array.isArray(b.faqs) && b.faqs.length > 0) setFaqs(b.faqs)
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load blog for editing.')
      } finally {
        setIsLoadingBlog(false)
      }
    }

    loadBlogToEdit()
  }, [editId])

  // Featured Image Upload to Backend /uploads/blog
  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingThumb(true)
    setErrorMessage('')

    try {
      const res = await uploadService.uploadImage(file, 'blog')
      if (res.success && res.data?.url) {
        setFeaturedImage(res.data.url)
      } else {
        throw new Error(res.message || 'Featured image upload failed.')
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error uploading featured image.')
    } finally {
      setIsUploadingThumb(false)
      if (thumbInputRef.current) thumbInputRef.current.value = ''
    }
  }

  // FAQ Handlers
  const handleAddFaq = () => {
    setFaqs([...faqs, { q: '', a: '' }])
  }

  const handleUpdateFaq = (index, field, value) => {
    const updated = [...faqs]
    updated[index][field] = value
    setFaqs(updated)
  }

  const handleRemoveFaq = (index) => {
    setFaqs(faqs.filter((_, idx) => idx !== index))
  }

  // Handle Form Submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!blogTitle.trim()) {
      setErrorMessage('Please enter a blog title.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const payload = {
        title: blogTitle.trim(),
        slug: slug.trim() || generateSlug(blogTitle),
        leadExcerpt: shortDescription.trim(),
        content: blogContent,
        category,
        author: {
          name: authorName.trim() || 'DEC Technical Advisory Board',
          role: authorRole.trim() || 'MMUP Grade A & QCDD Certified Experts',
          avatar: '/logo.png',
        },
        featuredImage,
        faqs: faqs.filter((f) => f.q.trim() && f.a.trim()),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status,
        readTime: readTime || '5 min read',
        order: parseInt(displayOrder, 10) || 1,
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim() || shortDescription.trim().slice(0, 160),
      }

      let res
      if (editId) {
        res = await blogService.update(editId, payload)
      } else {
        res = await blogService.create(payload)
      }

      if (res.success) {
        setSavedSuccess(true)
        setTimeout(() => {
          if (onNavigateToBlog) onNavigateToBlog()
        }, 1200)
      } else {
        throw new Error(res.message || 'Failed to save blog post.')
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while saving the blog.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingBlog) {
    return (
      <div className="p-12 text-center text-slate-500 font-sans flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 text-[#b88a44] animate-spin" />
        <span>Loading blog post details...</span>
      </div>
    )
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
          onClick={onNavigateToBlog}
          className="hover:text-slate-800 transition-colors cursor-pointer"
        >
          Blog Management
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <span className="text-slate-800 font-semibold">
          {editId ? 'Edit Blog Post' : 'Create New Blog'}
        </span>
      </div>

      {/* 2. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            {editId ? 'Edit Engineering Article' : 'Create New Engineering Article'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish rich technical intelligence, BIM workflows, statutory licensing updates, and architectural articles.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToBlog}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          Back to All Blogs
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in">
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
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Blog post {editId ? 'updated' : 'published'} successfully! Redirecting to list...
          </span>
        </div>
      )}

      {/* 3. Main Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN (8 cols): TITLE, LEAD, RICH CONTENT & FAQS      */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
          
          {/* Blog Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Blog Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={blogTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Seismic Design Code Updates for High-Rise Structures in Qatar"
              className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44]"
            />
          </div>

          {/* Slug (URL Identifier) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                URL Slug / Permalinks
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsManualSlug(false)
                  setSlug(generateSlug(blogTitle))
                }}
                className="text-[11px] text-[#b88a44] hover:underline"
              >
                Auto-generate from Title
              </button>
            </div>
            <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-50 px-3.5 py-2 text-xs text-slate-500">
              <span className="text-slate-400 select-none">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setIsManualSlug(true)
                  setSlug(generateSlug(e.target.value))
                }}
                placeholder="seismic-design-code-updates"
                className="flex-1 bg-transparent text-slate-800 font-mono text-xs focus:outline-none ml-0.5"
              />
            </div>
          </div>

          {/* Short Lead Excerpt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Short Description / Lead Excerpt <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{shortDescription.length}/220</span>
            </div>
            <textarea
              rows={3}
              required
              maxLength={220}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A concise lead paragraph displayed on the blog hub cards and highlighted at the top of the article..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44] resize-none"
            />
          </div>

          {/* Rich Content Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Article Body & Visual Rich Content <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-[#b88a44] font-semibold">
                WYSIWYG + Image Uploader
              </span>
            </div>

            {/* Powerful Rich Blog Editor Component */}
            <RichBlogEditor
              value={blogContent}
              onChange={setBlogContent}
              placeholder="Start drafting your comprehensive engineering insights, code snippets, calculations, and images..."
              minHeight="420px"
            />
          </div>

          {/* FAQ Builder Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#b88a44]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Interactive FAQs (Accordion on Website)
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddFaq}
                className="px-3 py-1.5 rounded-lg border border-[#b88a44]/50 bg-amber-50/50 hover:bg-amber-100/60 text-[#a07430] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Question #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={faq.q}
                    onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                    placeholder="e.g. What is the typical turnaround for MMUP Grade A approval?"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />

                  <textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                    placeholder="Enter detailed answer for website visitors..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#b88a44] resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN (4 cols): TAXONOMY, FEATURED IMAGE & PUBLISH   */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Publish & Status Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#b88a44]" />
              <span>Publication Settings</span>
            </h3>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Post Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44] cursor-pointer"
              >
                <option value="Published">Published (Live on Website)</option>
                <option value="Draft">Draft (Hidden)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Read Time & Display Order */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">Read Time</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="5 min read"
                  className="w-full px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">Sort Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 rounded-xl bg-[#0c1424] hover:bg-[#16233b] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0c1424]/20 transition-all active:scale-[0.99] cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 text-[#c59b58] animate-spin" />
                  <span>Saving Article...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#c59b58]" />
                  <span>{editId ? 'Update Blog Post' : 'Publish Blog Post'}</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Featured Hero Image */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#b88a44]" />
              <span>Featured Hero Image</span>
            </h3>

            {/* Image Preview Box */}
            <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
              <img
                src={getImageUrl(featuredImage)}
                alt="Featured preview"
                className="w-full h-full object-cover"
              />
              <div
                onClick={() => thumbInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Replace Image</span>
              </div>
            </div>

            <input
              type="file"
              ref={thumbInputRef}
              accept="image/*"
              onChange={handleFeaturedImageUpload}
              className="hidden"
            />

            <button
              type="button"
              disabled={isUploadingThumb}
              onClick={() => thumbInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isUploadingThumb ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#b88a44]" />
                  <span>Uploading to Server...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload from Computer</span>
                </>
              )}
            </button>
          </div>

          {/* Card 3: Categorization & Author */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#b88a44]" />
              <span>Classification & Author</span>
            </h3>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Primary Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
              />
            </div>

            {/* Author Role */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Author Standing / Role</label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Tags (Comma-Separated)</label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="structural, cairo, bim, high-rise"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
              </div>
            </div>
          </div>

        </div>

      </form>

    </div>
  )
}
