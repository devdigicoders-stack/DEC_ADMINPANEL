import api from './api.js'

export const cmsService = {
  /**
   * Get Home Page CMS Content
   */
  async getHomeContent() {
    const response = await api.get('/cms/home')
    return response?.data || response
  },

  /**
   * Update Home Page CMS Content
   */
  async updateHomeContent(data) {
    const response = await api.put('/cms/home', data)
    return response?.data || response
  },

  /**
   * Reset Home Page CMS Content to Default
   */
  async resetHomeContent() {
    const response = await api.post('/cms/home/reset')
    return response?.data || response
  },

  /**
   * Get Why DEC Page CMS Content
   */
  async getWhyDecContent() {
    const response = await api.get('/cms/why-dec')
    return response?.data || response
  },

  /**
   * Update Why DEC Page CMS Content
   */
  async updateWhyDecContent(data) {
    const response = await api.put('/cms/why-dec', data)
    return response?.data || response
  },

  /**
   * Reset Why DEC Page CMS Content to Default
   */
  async resetWhyDecContent() {
    const response = await api.post('/cms/why-dec/reset')
    return response?.data || response
  },
}

export default cmsService
