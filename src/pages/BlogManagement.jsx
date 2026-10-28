import { useState, useEffect } from 'react'
import {
  Home,
  Plus,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  User,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import blogService from '../services/blogService.js'
import { getImageUrl } from '../services/api.js'

export default function BlogManagement({
  onNavigateToDashboard,
  onNavigateToCreateBlog,
  onNavigateToEditBlog,
}) {
  const [blogs, setBlogs] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal states
  const [activeModal, setActiveModal] = useState(null) // 'view' | 'delete' | null
  const [selectedBlog, setSelectedBlog] = useState(null)

  // Show transient toast
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch blogs from Backend API
  const fetchBlogs = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true)
      setErrorMessage('')

      const [blogsRes, statsRes] = await Promise.all([
        blogService.getAll({
          status: statusFilter === 'All' ? 'all' : statusFilter,
          category: categoryFilter === 'All' ? 'All' : categoryFilter,
          search: searchQuery,
          sort: sortBy,
          limit: 100,
        }),
        blogService.getStats(),
      ])

      if (blogsRes.success) {
        setBlogs(blogsRes.data || [])
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load blog articles.')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setErrorMessage('')
        const [blogsRes, statsRes] = await Promise.all([
          blogService.getAll({
            status: statusFilter === 'All' ? 'all' : statusFilter,
            category: categoryFilter === 'All' ? 'All' : categoryFilter,
            search: searchQuery,
            sort: sortBy,
            limit: 100,
          }),
          blogService.getStats(),
        ])

        if (isMounted) {
          if (blogsRes.success) setBlogs(blogsRes.data || [])
          if (statsRes.success && statsRes.data) setStats(statsRes.data)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load blog articles.')
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [statusFilter, categoryFilter, sortBy, searchQuery])

  // Search debounce / trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchBlogs(false)
  }

  // Toggle Blog Status (Published <-> Draft)
  const handleToggleStatus = async (blog) => {
    try {
      setActionLoading(true)
      const nextStatus = blog.status === 'Published' ? 'Draft' : 'Published'
      const res = await blogService.toggleStatus(blog._id, nextStatus)

      if (res.success) {
        triggerToast(`Status changed to ${nextStatus}`)
        setBlogs((prev) =>
          prev.map((b) => (b._id === blog._id ? { ...b, status: nextStatus } : b))
        )
        // Refresh stats
        const statsRes = await blogService.getStats()
        if (statsRes.success) setStats(statsRes.data)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update status.')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete Blog
  const handleDeleteBlog = async () => {
    if (!selectedBlog) return

    try {
      setActionLoading(true)
      const res = await blogService.delete(selectedBlog._id)

      if (res.success) {
        triggerToast(`"${selectedBlog.title}" deleted successfully`)
        setBlogs((prev) => prev.filter((b) => b._id !== selectedBlog._id))
        setActiveModal(null)
        setSelectedBlog(null)

        const statsRes = await blogService.getStats()
        if (statsRes.success) setStats(statsRes.data)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete blog post.')
    } finally {
      setActionLoading(false)
    }
  }

  // Client-side pagination
  const totalBlogs = blogs.length
  const totalPages = Math.ceil(totalBlogs / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const paginatedBlogs = blogs.slice(startIndex, startIndex + pageSize)

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
        <span className="text-slate-800 font-semibold">Blog Management</span>
      </div>

      {/* 2. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Blog & Engineering Insights
            </h1>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#c59b58]/10 text-[#a07430] border border-[#c59b58]/20">
              Live Articles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your corporate engineering intelligence, technical papers, and architectural insights published on DEC website.
          </p>
        </div>

        {/* Create Button */}
        <button
          type="button"
          onClick={onNavigateToCreateBlog}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1424] hover:bg-[#16233b] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0c1424]/20 transition-all active:scale-[0.99] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#c59b58]" />
          <span>Create New Blog</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Articles</p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            {stats.total}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Stored in MongoDB database</p>
        </div>

        {/* Published */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Published (Live)</p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600 mt-1">
            {stats.published}
          </p>
          <p className="text-[11px] text-emerald-600/70 mt-1">Active on public website</p>
        </div>

        {/* Drafts */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Drafts</p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-600 mt-1">
            {stats.draft}
          </p>
          <p className="text-[11px] text-amber-600/70 mt-1">Work in progress</p>
        </div>

        {/* Archived */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Archived</p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-slate-600 mt-1">
            {stats.archived}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Hidden from public</p>
        </div>
      </div>

      {/* 4. Controls & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, excerpt, tags..."
              className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
            />
          </form>

          {/* Filters & Mode Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200/90 rounded-xl pl-3 pr-8 py-2 text-slate-700 font-medium focus:outline-none focus:border-[#b88a44] cursor-pointer appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200/90 rounded-xl pl-3 pr-8 py-2 text-slate-700 font-medium focus:outline-none focus:border-[#b88a44] cursor-pointer appearance-none"
              >
                <option value="All">All Categories</option>
                <option value="Engineering & Infrastructure">Engineering & Infrastructure</option>
                <option value="Architectural Design">Architectural Design</option>
                <option value="Civil & Structural">Civil & Structural</option>
                <option value="Smart Cities & MEP">Smart Cities & MEP</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200/90 rounded-xl pl-3 pr-8 py-2 text-slate-700 font-medium focus:outline-none focus:border-[#b88a44] cursor-pointer appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Viewed</option>
                <option value="title">Title (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Blogs Content (Table or Grid View) */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 text-[#b88a44] animate-spin" />
          <span className="text-xs font-semibold">Loading blog articles from server...</span>
        </div>
      ) : paginatedBlogs.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No blog articles found</p>
          <p className="text-xs text-slate-400">Try adjusting your search criteria or create a new article.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {paginatedBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Title + Thumbnail */}
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={getImageUrl(blog.featuredImage)}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-[#b88a44] transition-colors truncate">
                            {blog.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {blog.leadExcerpt}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {blog.category}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[120px]">{blog.author?.name || 'DEC Team'}</span>
                      </div>
                    </td>

                    {/* Status Toggle Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(blog)}
                        disabled={actionLoading}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                          blog.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {blog.status}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {blog.publishedDate}
                    </td>

                    {/* Views */}
                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {blog.viewsCount || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBlog(blog)
                            setActiveModal('view')
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateToEditBlog) {
                              onNavigateToEditBlog(blog._id)
                            } else {
                              onNavigateToCreateBlog(blog)
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-[#b88a44] transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBlog(blog)
                            setActiveModal('delete')
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedBlogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={getImageUrl(blog.featuredImage)}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs shadow-2xs">
                  {blog.category}
                </span>
                <span
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    blog.status === 'Published'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {blog.status}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#b88a44] transition-colors line-clamp-2">
                    {blog.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {blog.leadExcerpt}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{blog.publishedDate}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBlog(blog)
                        setActiveModal('view')
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToEditBlog) onNavigateToEditBlog(blog._id)
                        else onNavigateToCreateBlog(blog)
                      }}
                      className="p-1 text-slate-400 hover:text-[#b88a44]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBlog(blog)
                        setActiveModal('delete')
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalBlogs)} of{' '}
            {totalBlogs} articles
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PREVIEW MODAL                                                  */}
      {/* ============================================================== */}
      {activeModal === 'view' && selectedBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#c59b58]/15 text-[#a07430]">
                {selectedBlog.category}
              </span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {selectedBlog.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                By {selectedBlog.author?.name} · {selectedBlog.publishedDate} · {selectedBlog.viewsCount} Views
              </p>

              <div className="w-full h-52 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={getImageUrl(selectedBlog.featuredImage)}
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-[#b88a44] text-xs text-slate-700 leading-relaxed font-normal">
                {selectedBlog.leadExcerpt}
              </div>

              {selectedBlog.content && (
                <div
                  className="text-xs text-slate-700 leading-relaxed pt-2 space-y-2 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close Preview
              </button>
              <a
                href={`${import.meta.env.VITE_WEBSITE_URL || 'http://localhost:5174'}/blog/${selectedBlog.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#0c1424] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#16233b]"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#c59b58]" />
                <span>View on Website</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL                                      */}
      {/* ============================================================== */}
      {activeModal === 'delete' && selectedBlog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Blog Article</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-800">"{selectedBlog.title}"</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                disabled={actionLoading}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBlog}
                disabled={actionLoading}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
