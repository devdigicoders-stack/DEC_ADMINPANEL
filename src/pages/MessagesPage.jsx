import { useState } from 'react'
import {
  Home,
  Search,
  Star,
  Send,
  Phone,
  Mail,
  CheckCircle2,
  FileText} from 'lucide-react'

// Realistic client conversations
const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    client: 'Eng. Tarek Mansour',
    role: 'Development Director',
    company: 'Cairo Urban Developments',
    email: 'tarek.mansour@cairourban.eg',
    phone: '+20 100 482 9182',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    project: 'Nile Commercial Tower',
    isStarred: true,
    unread: true,
    lastTime: '10:42 AM',
    snippet: 'Regarding the foundation pile test results for the commercial tower...',
    messages: [
      {
        id: 101,
        sender: 'client',
        time: '10:15 AM',
        date: 'Today',
        text: 'Good morning DEC Team,\nWe reviewed the preliminary geotechnical report for the Nile Commercial Tower. Could you clarify the recommended pile depth for the basement parking levels in sector B?',
      },
      {
        id: 102,
        sender: 'admin',
        time: '10:30 AM',
        date: 'Today',
        text: 'Good morning Eng. Tarek,\nOur senior structural engineer reviewed sector B soil stratigraphy. The bedrock layer begins at -22m. We recommend 24m bored piles with 1200mm diameter to handle the hydrostatic uplift.',
        attachment: 'NileTower_PileDepth_Recommendation_v2.pdf',
      },
      {
        id: 103,
        sender: 'client',
        time: '10:42 AM',
        date: 'Today',
        text: 'Thank you for the quick turnaround! Please proceed with final structural blueprints and send the stamped sign-off for our authority filing.',
      },
    ],
  },
  {
    id: 2,
    client: 'Dr. Mona El-Shazly',
    role: 'Managing Partner',
    company: 'Al-Ahly Medical Complex',
    email: 'mona.elshazly@ahlymed.com',
    phone: '+20 102 739 1048',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face',
    project: 'Specialized Surgical Center',
    isStarred: false,
    unread: true,
    lastTime: '09:15 AM',
    snippet: 'Need acoustic isolation drawings for operating theatres 3 & 4...',
    messages: [
      {
        id: 201,
        sender: 'client',
        time: '09:15 AM',
        date: 'Today',
        text: 'Dear DEC Consultancy,\nOur medical equipment supplier requires acoustic and electromagnetic isolation drawings for operating theatres 3 and 4 before HVAC duct fabrication. When can we expect the revision?',
      },
    ],
  },
  {
    id: 3,
    client: 'Arch. Karim Fawzy',
    role: 'Chief Architect',
    company: 'Fawzy & Partners Studio',
    email: 'karim@fawzy-architects.com',
    phone: '+20 111 829 4019',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
    project: 'Giza Boutique Hotel Facade',
    isStarred: true,
    unread: false,
    lastTime: 'Yesterday',
    snippet: 'Can we schedule a 3D BIM coordination meeting this Thursday?',
    messages: [
      {
        id: 301,
        sender: 'client',
        time: 'Yesterday 04:30 PM',
        date: 'Yesterday',
        text: 'Hello Team,\nCan we schedule a 3D BIM coordination meeting this Thursday at 11:00 AM to resolve clashes between structural shear walls and vertical plumbing shafts on levels 6 through 9?',
      },
      {
        id: 302,
        sender: 'admin',
        time: 'Yesterday 05:10 PM',
        date: 'Yesterday',
        text: 'Confirmed, Arch. Karim. Meeting invitation sent for Thursday 11:00 AM. Our MEP and structural leads will be present.',
      },
    ],
  },
  {
    id: 4,
    client: 'Sarah Jenkins',
    role: 'Regional Project Lead',
    company: 'Mediterranean Energy Consortium',
    email: 's.jenkins@med-energy.org',
    phone: '+44 20 7946 0912',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face',
    project: 'Solar Microgrid Infrastructure',
    isStarred: false,
    unread: false,
    lastTime: 'Oct 24',
    snippet: 'Environmental compliance certificate approved by Ministry...',
    messages: [
      {
        id: 401,
        sender: 'client',
        time: 'Oct 24 02:15 PM',
        date: 'Oct 24',
        text: 'Hi DEC Team,\nPleased to report the Environmental Compliance Certificate has been approved by the Egyptian Environmental Affairs Agency based on your study report.',
      },
    ],
  },
  {
    id: 5,
    client: 'Omar Abdelaziz',
    role: 'Director of Procurement',
    company: 'East Cairo Metro Expansion',
    email: 'o.abdelaziz@metro-expansion.gov.eg',
    phone: '+20 122 391 0293',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
    project: 'Underground Station Shoring',
    isStarred: true,
    unread: false,
    lastTime: 'Oct 22',
    snippet: 'Inquiry regarding diaphragm wall deflection monitoring data...',
    messages: [
      {
        id: 501,
        sender: 'client',
        time: 'Oct 22 11:40 AM',
        date: 'Oct 22',
        text: 'Requesting the weekly inclinometer deflection report for station 4 diaphragm walls.',
      },
    ],
  },
]

export default function MessagesPage({ onNavigateToDashboard, onNavigateToEnquiries }) {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS)
  const [selectedId, setSelectedId] = useState(INITIAL_CONVERSATIONS[0].id)
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'unread' | 'starred'
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')
  const [notification, setNotification] = useState('')

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0]

  const showToast = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3000)
  }

  // Toggle Star
  const handleToggleStar = (id, e) => {
    if (e) e.stopPropagation()
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isStarred: !c.isStarred } : c))
    )
  }

  // Mark as Read
  const handleSelectConv = (id) => {
    setSelectedId(id)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    )
  }

  // Send Reply
  const handleSendReply = (e) => {
    e.preventDefault()
    if (!replyText.trim()) return

    const newMsg = {
      id: Date.now(),
      sender: 'admin',
      time: 'Just now',
      date: 'Today',
      text: replyText.trim(),
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastTime: 'Just now',
              snippet: replyText.trim(),
              messages: [...c.messages, newMsg],
            }
          : c
      )
    )

    setReplyText('')
    showToast(`Reply sent to ${activeConv.client}!`)
  }

  // Filtered List
  const filteredList = conversations.filter((c) => {
    const matchesSearch =
      c.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.project.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeFilter === 'unread') return matchesSearch && c.unread
    if (activeFilter === 'starred') return matchesSearch && c.isStarred
    return matchesSearch
  })

  // Quick Reply Template insert
  const handleInsertTemplate = (template) => {
    setReplyText(template)
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
          onClick={onNavigateToEnquiries}
          className="hover:text-slate-800 transition-colors cursor-pointer"
        >
          Contact Enquiries
        </button>
        <span className="text-slate-400 font-normal">&gt;</span>
        <span className="text-slate-800 font-semibold">Messages</span>
      </div>

      {/* 2. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Client Messages & Correspondence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Direct communications, consultation follow-ups, and project discussions.
          </p>
        </div>

        {/* Quick KPI badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700">
            Total: <span className="text-slate-900 font-bold">{conversations.length}</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-700">
            Unread: <span className="font-bold">{conversations.filter((c) => c.unread).length}</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-700">
            Starred: <span className="font-bold">{conversations.filter((c) => c.isStarred).length}</span>
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-[#0c1424] text-white text-xs font-semibold shadow-xl flex items-center gap-2.5 animate-in fade-in border border-[#b88a44]">
          <CheckCircle2 className="w-4 h-4 text-[#c59b58]" />
          <span>{notification}</span>
        </div>
      )}

      {/* 3. Two-Panel Messenger Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Conversation Threads List (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-[700px]">
          {/* Top Search & Filter Tabs */}
          <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/40">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages by client or project..."
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#0c1424] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'unread'
                    ? 'bg-[#0c1424] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <span>Unread</span>
                {conversations.filter((c) => c.unread).length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {conversations.filter((c) => c.unread).length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('starred')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'starred'
                    ? 'bg-[#0c1424] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Starred</span>
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No conversations found.
              </div>
            ) : (
              filteredList.map((conv) => {
                const isSelected = conv.id === selectedId

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConv(conv.id)}
                    className={`p-3.5 transition-colors cursor-pointer select-none flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-blue-50/50 border-l-3 border-l-[#b88a44]'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={conv.avatar}
                        alt={conv.client}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
                        }}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      {conv.unread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-sky-500 border-2 border-white" />
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs truncate ${
                            conv.unread
                              ? 'font-bold text-slate-900'
                              : 'font-semibold text-slate-800'
                          }`}
                        >
                          {conv.client}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-1">
                          {conv.lastTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate">
                        {conv.company}
                      </p>

                      <p
                        className={`text-[11px] truncate ${
                          conv.unread ? 'font-semibold text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        {conv.snippet}
                      </p>
                    </div>

                    {/* Star toggle */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(conv.id, e)}
                      className="p-1 text-slate-300 hover:text-amber-500 transition-colors shrink-0"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          conv.isStarred
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel: Chat Thread & Composer (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-[700px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div className="flex items-center gap-3.5 min-w-0">
              <img
                src={activeConv.avatar}
                alt={activeConv.client}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop'
                }}
                className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                    {activeConv.client}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#b88a44] border border-amber-200/60 shrink-0">
                    {activeConv.project}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {activeConv.role} • {activeConv.company}
                </p>
              </div>
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${activeConv.email}`}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Send direct email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={`tel:${activeConv.phone}`}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Call client"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => handleToggleStar(activeConv.id)}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Star conversation"
              >
                <Star
                  className={`w-4 h-4 ${
                    activeConv.isStarred ? 'text-amber-500 fill-amber-500' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Messages Stream Timeline */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/20">
            {activeConv.messages.map((msg) => {
              const isAdmin = msg.sender === 'admin'

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                    <span>{isAdmin ? 'DEC Admin' : activeConv.client}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isAdmin
                        ? 'bg-[#0c1424] text-white shadow-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {msg.attachment && (
                      <div className="mt-3 p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2.5 text-xs text-amber-200">
                        <FileText className="w-4 h-4 shrink-0 text-[#c59b58]" />
                        <span className="truncate">{msg.attachment}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Message Composer & Quick Templates */}
          <div className="p-4 border-t border-slate-100 bg-white space-y-3">
            {/* Quick Templates Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 text-[11px]">
              <span className="text-slate-400 shrink-0">Templates:</span>
              <button
                type="button"
                onClick={() =>
                  handleInsertTemplate(
                    `Dear ${activeConv.client},\nThank you for reaching out. We have scheduled an on-site structural audit and will furnish the engineering inspection report within 48 hours.`
                  )
                }
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#b88a44] bg-slate-50 text-slate-700 whitespace-nowrap transition-colors"
              >
                Schedule Site Inspection
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInsertTemplate(
                    `Dear ${activeConv.client},\nPlease find attached our technical proposal and milestone schedule for ${activeConv.project}. Looking forward to your review.`
                  )
                }
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#b88a44] bg-slate-50 text-slate-700 whitespace-nowrap transition-colors"
              >
                Send Proposal & Quotation
              </button>
            </div>

            {/* Input form */}
            <form onSubmit={handleSendReply} className="flex items-end gap-2.5">
              <div className="flex-1 relative">
                <textarea
                  rows={2}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write your response to ${activeConv.client}...`}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b88a44] focus:bg-white transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-[#0c1424] hover:bg-[#16233b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#c59b58]" />
                <span className="hidden sm:inline">Send Reply</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
