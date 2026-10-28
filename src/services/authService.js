import api from './api.js'

export const authService = {
  /**
   * Real Backend Admin Login
   * @param {Object} credentials - { email, password }
   * @returns {Object} { success, token, user, message }
   */
  async login(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('Please enter both email and password.')
    }

    const payload = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }

    const response = await api.post('/auth/login', payload)

    const token = response?.data?.token || response?.token
    const user = response?.data?.user || response?.user

    if (!token || !user) {
      throw new Error(response?.message || 'Authentication failed: Server did not return token.')
    }

    // Persist real JWT session to browser storage
    localStorage.setItem('dec_admin_token', token)
    localStorage.setItem('dec_admin_user', JSON.stringify(user))

    return {
      success: true,
      token,
      user,
      message: response.message || 'Login successful',
    }
  },

  /**
   * Log out authenticated admin
   */
  logout() {
    localStorage.removeItem('dec_admin_token')
    localStorage.removeItem('dec_admin_user')
  },

  /**
   * Get cached user from localStorage
   */
  getCurrentUser() {
    const token = localStorage.getItem('dec_admin_token')
    if (!token) return null

    const raw = localStorage.getItem('dec_admin_user')
    if (!raw) return null

    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  /**
   * Fetch fresh profile from backend
   */
  async getProfile() {
    const response = await api.get('/auth/profile')
    const user = response?.data?.user || response?.user

    if (user) {
      localStorage.setItem('dec_admin_user', JSON.stringify(user))
    }

    return user
  },

  /**
   * Update admin profile details
   */
  async updateProfile(updates) {
    const response = await api.put('/auth/profile', updates)
    const user = response?.data?.user || response?.user

    if (user) {
      localStorage.setItem('dec_admin_user', JSON.stringify(user))
    }

    return user
  },

  /**
   * Change admin password
   */
  async changePassword(passwords) {
    return await api.put('/auth/change-password', passwords)
  },

  /**
   * Check if token is present
   */
  isAuthenticated() {
    return !!localStorage.getItem('dec_admin_token')
  },
}

export default authService
