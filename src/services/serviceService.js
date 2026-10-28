import api from './api.js'

export const serviceService = {
  /**
   * Fetch all services with optional filters
   * @param {Object} params - { status: 'all' | 'active' | 'inactive', category, search, page, limit }
   */
  async getAll(params = { status: 'all' }) {
    const query = new URLSearchParams()
    if (params.status) query.append('status', params.status)
    if (params.category && params.category !== 'All') query.append('category', params.category)
    if (params.search) query.append('search', params.search)
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)

    const endpoint = `/services${query.toString() ? `?${query.toString()}` : ''}`
    return await api.get(endpoint)
  },

  /**
   * Fetch a single service by ID or Slug
   */
  async getByIdOrSlug(idOrSlug) {
    return await api.get(`/services/${idOrSlug}`)
  },

  /**
   * Create a new service
   */
  async create(serviceData) {
    return await api.post('/services', serviceData)
  },

  /**
   * Update an existing service
   */
  async update(id, serviceData) {
    return await api.put(`/services/${id}`, serviceData)
  },

  /**
   * Toggle service active / inactive status
   */
  async toggleStatus(id, status) {
    return await api.patch(`/services/${id}/status`, { status })
  },

  /**
   * Delete a service
   */
  async delete(id) {
    return await api.delete(`/services/${id}`)
  },

  /**
   * Pre-seed standard core engineering disciplines
   */
  async seed(force = false) {
    return await api.post(`/services/seed${force ? '?force=true' : ''}`)
  },
}

export default serviceService
