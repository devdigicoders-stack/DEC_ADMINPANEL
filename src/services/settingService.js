import api from './api.js'

export const settingService = {
  /**
   * Get agency profile & portal settings
   */
  async getSettings() {
    const response = await api.get('/settings')
    return response?.data || response
  },

  /**
   * Update agency profile settings
   */
  async updateSettings(data) {
    const response = await api.put('/settings', data)
    return response?.data || response
  },
}

export default settingService
