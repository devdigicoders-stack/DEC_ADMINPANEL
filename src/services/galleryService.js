import api from './api.js'

export const galleryService = {
  /**
   * Fetch all gallery items with optional filters
   * @param {Object} params - { status, sector, search, page, limit, sort }
   */
  async getAll(params = { status: 'all' }) {
    const query = new URLSearchParams()
    if (params.status) query.append('status', params.status)
    if (params.sector && params.sector !== 'All')
      query.append('sector', params.sector)
    if (params.category && params.category !== 'All')
      query.append('category', params.category)
    if (params.search) query.append('search', params.search)
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    if (params.sort) query.append('sort', params.sort)

    const endpoint = `/gallery${query.toString() ? `?${query.toString()}` : ''}`
    return await api.get(endpoint)
  },

  /**
   * Fetch a single gallery item by ID
   */
  async getById(id) {
    return await api.get(`/gallery/${id}`)
  },

  /**
   * Get gallery stats
   */
  async getStats() {
    return await api.get('/gallery/stats')
  },

  /**
   * Create a new gallery photograph
   */
  async create(data) {
    return await api.post('/gallery', data)
  },

  /**
   * Update an existing gallery photograph
   */
  async update(id, data) {
    return await api.put(`/gallery/${id}`, data)
  },

  /**
   * Toggle gallery item active / inactive status
   */
  async toggleStatus(id) {
    return await api.patch(`/gallery/${id}/status`)
  },

  /**
   * Delete a gallery photograph
   */
  async delete(id) {
    return await api.delete(`/gallery/${id}`)
  },

  /**
   * Seed initial 84 visual archive photographs from website data
   */
  async seed(force = false) {
    return await api.post('/gallery/seed', { force })
  },
}

export default galleryService
