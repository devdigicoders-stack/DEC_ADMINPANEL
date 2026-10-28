import api from './api.js'

/**
 * Service to handle Contact Enquiries and Career Applications against DEC Backend API
 */
export const inquiryService = {
  /**
   * Fetch all inquiries with optional filters
   * @param {Object} params - { type, status, discipline, search, page, limit, sort }
   */
  async getAll(params = {}) {
    const query = new URLSearchParams()

    if (params.type && params.type !== 'All' && params.type !== 'all') {
      query.append('type', params.type.toLowerCase())
    }
    if (params.status && params.status !== 'All Status' && params.status !== 'All') {
      query.append('status', params.status)
    }
    if (params.discipline && params.discipline !== 'All Services' && params.discipline !== 'All') {
      query.append('discipline', params.discipline)
    }
    if (params.search) {
      query.append('search', params.search)
    }
    if (params.page) {
      query.append('page', params.page)
    }
    if (params.limit) {
      query.append('limit', params.limit)
    }
    if (params.sort) {
      query.append('sort', params.sort)
    }

    const endpoint = `/inquiries${query.toString() ? `?${query.toString()}` : ''}`
    return api.get(endpoint)
  },

  /**
   * Get inquiry & application statistics
   */
  async getStats() {
    return api.get('/inquiries/stats')
  },

  /**
   * Get single inquiry details by ID
   */
  async getById(id) {
    return api.get(`/inquiries/${id}`)
  },

  /**
   * Update status, assigned person, or follow-up date
   */
  async updateStatus(id, payload) {
    return api.patch(`/inquiries/${id}/status`, payload)
  },

  /**
   * Delete inquiry
   */
  async delete(id) {
    return api.delete(`/inquiries/${id}`)
  },

  /**
   * Create inquiry / application
   */
  async create(data) {
    return api.post('/inquiries', data)
  },

  /**
   * Seed initial realistic inquiries
   */
  async seed() {
    return api.post('/inquiries/seed')
  },
}

export default inquiryService
