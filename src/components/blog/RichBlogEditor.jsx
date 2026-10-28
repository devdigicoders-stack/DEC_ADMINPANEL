import { useState, useRef, useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Undo,
  Redo,
  RemoveFormatting,
  Maximize2,
  Minimize2,
  Eye,
  Edit3,
  Code2,
  Check,
  X,
} from 'lucide-react'
import uploadService from '../../services/uploadService.js'
import { getImageUrl } from '../../services/api.js'

export default function RichBlogEditor({
  value = '',
  onChange,
  placeholder = 'Write your rich blog content here...',
  minHeight = '360px',
}) {
  const [editorMode, setEditorMode] = useState('visual') // 'visual' | 'preview' | 'source'
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState('')

  const editorRef = useRef(null)
  const imageInputRef = useRef(null)
  const savedSelectionRef = useRef(null)

  // Initialize or synchronize visual editor content
  useEffect(() => {
    if (editorRef.current && editorMode === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value, editorMode])

  // Save current selection before modal opens
  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel.getRangeAt && sel.rangeCount) {
      savedSelectionRef.current = sel.getRangeAt(0)
    }
  }

  // Restore selection
  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(savedSelectionRef.current)
    }
  }

  // Handle format commands
  const executeCommand = (command, val = null) => {
    if (editorMode !== 'visual') return
    editorRef.current?.focus()
    document.execCommand(command, false, val)
    handleEditorInput()
  }

  // Sync content on change
  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      if (onChange) onChange(html)
    }
  }

  // Link Dialog submission
  const handleInsertLink = (e) => {
    e.preventDefault()
    if (!linkUrl.trim()) return

    restoreSelection()
    editorRef.current?.focus()

    if (linkText.trim()) {
      const anchorHtml = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer" class="text-[#b88a44] underline font-semibold hover:text-[#976d2e]">${linkText.trim()}</a>`
      document.execCommand('insertHTML', false, anchorHtml)
    } else {
      document.execCommand('createLink', false, linkUrl.trim())
    }

    handleEditorInput()
    setShowLinkModal(false)
    setLinkUrl('')
    setLinkText('')
  }

  // Image Upload directly to Backend Server Storage (/uploads/blog)
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploadError('')
    setIsUploadingImage(true)

    try {
      restoreSelection()
      editorRef.current?.focus()

      const res = await uploadService.uploadImage(file, 'blog')
      if (res.success && res.data?.url) {
        const fullImgUrl = getImageUrl(res.data.url)
        const imgHtml = `
          <figure class="my-4 text-center">
            <img src="${fullImgUrl}" alt="${file.name}" class="rounded-xl max-h-[460px] mx-auto object-cover border border-slate-200 shadow-sm" />
            <figcaption class="text-xs text-slate-500 mt-1 italic">${file.name.replace(/\.[^/.]+$/, '')}</figcaption>
          </figure>
          <p><br/></p>
        `
        document.execCommand('insertHTML', false, imgHtml)
        handleEditorInput()
      } else {
        throw new Error(res.message || 'Image upload failed.')
      }
    } catch (err) {
      setImageUploadError(err.message || 'Could not upload image.')
    } finally {
      setIsUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  // Compute Word & Character Count
  const getPlainText = (html) => {
    const div = document.createElement('div')
    div.innerHTML = html || ''
    return div.textContent || div.innerText || ''
  }

  const plainText = getPlainText(value)
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
  const charCount = plainText.length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all bg-white ${
        isFullscreen
          ? 'fixed inset-4 z-50 flex flex-col shadow-2xl border-slate-300 ring-4 ring-black/10'
          : 'relative'
      }`}
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* ============================================================== */}
      {/* 1. TOP TOOLBAR                                                 */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#fcfaf7] border-b border-slate-200/90 select-none text-slate-700">
        
        {/* Left Toolbar Commands (Active in Visual Mode) */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('formatBlock', 'h2')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors font-bold text-xs"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('formatBlock', 'h3')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors font-bold text-xs"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('formatBlock', 'p')}
            className="px-2 py-1 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors font-bold text-[11px]"
            title="Normal Paragraph"
          >
            ¶
          </button>

          <div className="w-px h-4.5 bg-slate-300 mx-1" />

          {/* Inline Styles */}
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('underline')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4.5 bg-slate-300 mx-1" />

          {/* Quotes & Code */}
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('formatBlock', 'blockquote')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('formatBlock', 'pre')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4.5 bg-slate-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4.5 bg-slate-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('justifyLeft')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('justifyCenter')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('justifyRight')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4.5 bg-slate-300 mx-1" />

          {/* Link Insert */}
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => {
              saveSelection()
              setShowLinkModal(true)
            }}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          {/* Image Upload */}
          <button
            type="button"
            disabled={editorMode !== 'visual' || isUploadingImage}
            onClick={() => {
              saveSelection()
              imageInputRef.current?.click()
            }}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-[#b88a44] hover:text-[#976d2e] disabled:opacity-40 transition-colors flex items-center gap-1 font-semibold text-xs"
            title="Upload Image directly to Blog Content"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">
              {isUploadingImage ? 'Uploading...' : 'Insert Image'}
            </span>
          </button>

          <div className="w-px h-4.5 bg-slate-300 mx-1" />

          {/* History */}
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('undo')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('redo')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={editorMode !== 'visual'}
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Toolbar: View Modes & Fullscreen Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setEditorMode('visual')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                editorMode === 'visual'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3 h-3 text-[#b88a44]" />
              <span>Visual</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorMode('preview')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                editorMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3 h-3 text-emerald-600" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorMode('source')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                editorMode === 'source'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3 h-3 text-indigo-600" />
              <span>HTML</span>
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Upload Error Banner */}
      {imageUploadError && (
        <div className="p-2 bg-rose-50 text-rose-700 text-xs font-semibold px-4 flex items-center justify-between border-b border-rose-200">
          <span>{imageUploadError}</span>
          <button
            onClick={() => setImageUploadError('')}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. EDITOR BODY (VISUAL / PREVIEW / SOURCE CODE)                */}
      {/* ============================================================== */}
      <div className="relative flex-1 overflow-y-auto">
        {/* Visual WYSIWYG Mode */}
        {editorMode === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onBlur={handleEditorInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="p-5 sm:p-6 outline-none text-slate-800 text-sm sm:text-base leading-relaxed font-sans max-w-none focus:outline-none custom-editor-content"
          />
        )}

        {/* Live Website Preview Mode */}
        {editorMode === 'preview' && (
          <div
            style={{ minHeight }}
            className="p-6 sm:p-8 bg-[#181818] text-[#F5F0E7] text-sm sm:text-base leading-relaxed"
          >
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#d4af72] text-xs font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 shrink-0" />
                <span>Live Website Preview Mode (Styled with DEC Luxury Dark Theme)</span>
              </div>

              {value ? (
                <div
                  dangerouslySetInnerHTML={{ __html: value }}
                  className="prose prose-invert max-w-none space-y-4 text-[#F5F0E7]/85"
                />
              ) : (
                <div className="py-16 text-center text-slate-500 text-xs">
                  Nothing to preview. Switch to Visual mode and start writing content.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Source Code / HTML Mode */}
        {editorMode === 'source' && (
          <textarea
            value={value}
            onChange={(e) => {
              if (onChange) onChange(e.target.value)
            }}
            style={{ minHeight }}
            className="w-full h-full p-5 sm:p-6 font-mono text-xs text-slate-800 bg-slate-50 outline-none resize-none"
            placeholder="Edit raw HTML code..."
          />
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. BOTTOM STATS BAR                                            */}
      {/* ============================================================== */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium select-none">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-slate-800">{wordCount}</strong></span>
          <span>Characters: <strong className="text-slate-800">{charCount}</strong></span>
          <span>Read Time: <strong className="text-slate-800">~{readingTime} min</strong></span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Editor Ready</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* LINK INSERT MODAL                                              */}
      {/* ============================================================== */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handleInsertLink}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xl max-w-md w-full space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#b88a44]" />
                <span>Insert Hyperlink</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Link URL *</label>
              <input
                type="url"
                required
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Anchor Text (Optional)</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Click here"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b88a44]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0c1424] hover:bg-[#16233b] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-[#c59b58]" />
                <span>Insert Link</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
