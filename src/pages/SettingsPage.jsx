import { useState, useEffect } from 'react'
import {
  Home,
  Building,
  Shield,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  User,
  Briefcase
} from 'lucide-react'
import settingService from '../services/settingService.js'
import { authService } from '../services/authService.js'

export default function SettingsPage({ onNavigateToDashboard }) {
  // Only 2 active tabs: 'agency' | 'security'
  const [activeTab, setActiveTab] = useState('agency')
  const [loadingData, setLoadingData] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState(null) // { type: 'success' | 'error', text: '' }

  // 1. Agency Profile State (Loaded dynamically from MongoDB)
  const [agencyName, setAgencyName] = useState('Desentral Engineering Consultancy (DEC)')
  const [agencySlogan, setAgencySlogan] = useState('Building a Stronger Future Together')
  const [contactEmail, setContactEmail] = useState('info@dec-consultancy.com')
  const [contactPhone, setContactPhone] = useState('+974 4455 4383 / +20 2 2736 8490')
  const [headquarters, setHeadquarters] = useState('Doha, Qatar & Cairo, Egypt')
  const [commercialReg, setCommercialReg] = useState('CR-9847201')
  const [taxNumber, setTaxNumber] = useState('TAX-8392019')
  const [currency, setCurrency] = useState('QAR / EGP / USD')

  // 2. Admin & Security State (Loaded dynamically from authenticated admin profile)
  const [adminName, setAdminName] = useState('Super Admin')
  const [adminEmail, setAdminEmail] = useState('admin@dec-consultancy.com')
  const [adminPhone, setAdminPhone] = useState('')
  const [adminTitle, setAdminTitle] = useState('DEC Administrator')
  const [twoFactorAuth, setTwoFactorAuth] = useState(true)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  // Trigger transient alert toast
  const triggerToast = (type, text) => {
    setToastMessage({ type, text })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load live data from Backend API on mount
  useEffect(() => {
    let isMounted = true

    const loadLiveSettings = async () => {
      try {
        setLoadingData(true)
        const [agencyRes, profileRes] = await Promise.allSettled([
          settingService.getSettings(),
          authService.getProfile(),
        ])

        if (!isMounted) return

        // 1. Populate Agency Profile
        if (agencyRes.status === 'fulfilled' && agencyRes.value) {
          const s = agencyRes.value
          if (s.agencyName) setAgencyName(s.agencyName)
          if (s.agencySlogan) setAgencySlogan(s.agencySlogan)
          if (s.contactEmail) setContactEmail(s.contactEmail)
          if (s.contactPhone) setContactPhone(s.contactPhone)
          if (s.headquarters) setHeadquarters(s.headquarters)
          if (s.commercialReg) setCommercialReg(s.commercialReg)
          if (s.taxNumber) setTaxNumber(s.taxNumber)
          if (s.currency) setCurrency(s.currency)
        }

        // 2. Populate Admin Profile
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const u = profileRes.value
          if (u.name) setAdminName(u.name)
          if (u.email) setAdminEmail(u.email)
          if (u.phone) setAdminPhone(u.phone)
          if (u.title) setAdminTitle(u.title)
          if (u.twoFactorAuth !== undefined) setTwoFactorAuth(Boolean(u.twoFactorAuth))
        }
      } catch (err) {
        console.warn('Error loading live settings:', err)
      } finally {
        if (isMounted) setLoadingData(false)
      }
    }

    loadLiveSettings()

    return () => {
      isMounted = false
    }
  }, [])

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (activeTab === 'agency') {
        // Update Agency Profile
        const payload = {
          agencyName: agencyName.trim(),
          agencySlogan: agencySlogan.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          headquarters: headquarters.trim(),
          commercialReg: commercialReg.trim(),
          taxNumber: taxNumber.trim(),
          currency: currency.trim(),
        }

        await settingService.updateSettings(payload)
        triggerToast('success', 'Agency profile details updated successfully across DEC portal!')
      } else if (activeTab === 'security') {
        // 1. Update Admin Profile
        const profileUpdates = {
          name: adminName.trim(),
          email: adminEmail.trim(),
          phone: adminPhone.trim(),
          title: adminTitle.trim(),
          twoFactorAuth,
        }

        await authService.updateProfile(profileUpdates)

        // 2. Update Password if any password field filled
        if (currentPassword || newPassword || confirmPassword) {
          if (!currentPassword) {
            triggerToast('error', 'Please enter your current password to set a new password.')
            setIsSaving(false)
            return
          }
          if (!newPassword || newPassword.length < 6) {
            triggerToast('error', 'New password must be at least 6 characters long.')
            setIsSaving(false)
            return
          }
          if (newPassword !== confirmPassword) {
            triggerToast('error', 'New password and Confirm password do not match.')
            setIsSaving(false)
            return
          }

          await authService.changePassword({
            currentPassword,
            newPassword,
          })

          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
          triggerToast('success', 'Admin profile and password updated successfully!')
        } else {
          triggerToast('success', 'Admin profile details updated successfully!')
        }
      }
    } catch (err) {
      triggerToast('error', err.message || 'Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
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
        <span className="text-slate-800 font-semibold">Settings</span>
      </div>

      {/* 2. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Settings & Portal Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your official agency profile and administrator security authorization.
          </p>
        </div>

        {loadingData && (
          <div className="flex items-center gap-2 text-xs text-[#b88a44] font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading live settings...</span>
          </div>
        )}
      </div>

      {/* Alert Toasts */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 3. Horizontal Tab Bar (Only the 2 required tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('agency')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'agency'
              ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-md shadow-[#c59b58]/20 font-bold'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Agency Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-[#c59b58] to-[#b38844] text-white shadow-md shadow-[#c59b58]/20 font-bold'
              : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Admin & Security</span>
        </button>
      </div>

      {/* 4. Form Content Cards */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* TAB 1: AGENCY PROFILE */}
        {activeTab === 'agency' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#b88a44] flex items-center justify-center shrink-0">
                <Building className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Agency Identification & Contact</h2>
                <p className="text-xs text-slate-400">Official legal entity details displayed on website footer & invoices.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Agency Legal Name</label>
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. Desentral Engineering Consultancy (DEC)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Brand Tagline / Slogan</label>
                <input
                  type="text"
                  value={agencySlogan}
                  onChange={(e) => setAgencySlogan(e.target.value)}
                  placeholder="e.g. Building a Stronger Future Together"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Official Contact Email</label>
                <div className="relative rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="info@dec-consultancy.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Official Contact Phone</label>
                <div className="relative rounded-xl">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+974 4455 4383 / +20 2 2736 8490"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Headquarters Address</label>
              <div className="relative rounded-xl">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  placeholder="Doha, Qatar & Cairo, Egypt"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Commercial Registration</label>
                <input
                  type="text"
                  value={commercialReg}
                  onChange={(e) => setCommercialReg(e.target.value)}
                  placeholder="CR-9847201"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:border-[#b88a44]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Tax Identification ID</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  placeholder="TAX-8392019"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:border-[#b88a44]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Default Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="QAR / EGP / USD"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN & SECURITY */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Administrator Profile & Password</h2>
                <p className="text-xs text-slate-400">Update portal access credentials and security authorization.</p>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Admin Display Name</label>
                <div className="relative rounded-xl">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Super Admin"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Admin Login Email</label>
                <div className="relative rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@dec-consultancy.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Admin Contact Phone</label>
                <div className="relative rounded-xl">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="+974 XXXX XXXX or +20 XXX"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Designation / Role Title</label>
                <div className="relative rounded-xl">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={adminTitle}
                    onChange={(e) => setAdminTitle(e.target.value)}
                    placeholder="Super Administrator / Principal Engineer"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Block */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#b88a44]" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Change Admin Password</h3>
                <span className="text-[11px] text-slate-400">(Leave blank if you don't wish to change password)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b88a44]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2FA Toggle */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-slate-400">Enforce OTP authorization on login from unrecognized IP addresses</p>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  twoFactorAuth ? 'bg-[#0c1424]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-[#0c1424] hover:bg-[#16233b] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0c1424]/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 text-[#c59b58] animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#c59b58]" />
                <span>Save {activeTab === 'agency' ? 'Agency Settings' : 'Admin Security'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
