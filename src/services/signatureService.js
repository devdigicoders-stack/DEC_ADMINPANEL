import { api } from './api.js'

export const signatureService = {
  /**
   * Get all signatures with optional search and pagination
   */
  async getAll(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.append('search', params.search)
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    if (params.sort) query.append('sort', params.sort)

    const queryString = query.toString() ? `?${query.toString()}` : ''
    return await api.get(`/signatures${queryString}`)
  },

  /**
   * Get signature by ID
   */
  async getById(id) {
    return await api.get(`/signatures/${id}`)
  },

  /**
   * Create new signature
   */
  async create(data) {
    return await api.post('/signatures', data)
  },

  /**
   * Update existing signature
   */
  async update(id, data) {
    return await api.put(`/signatures/${id}`, data)
  },

  /**
   * Delete signature
   */
  async delete(id) {
    return await api.delete(`/signatures/${id}`)
  },

  /**
   * Seed default Islam Farid signature
   */
  async seed() {
    return await api.get('/signatures/seed')
  },

  /**
   * Direct download endpoint URL
   */
  getDownloadUrl(id) {
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
    return `${base}/signatures/${id}/download`
  },

  /**
   * Direct HTML preview endpoint URL
   */
  getPreviewUrl(id) {
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
    return `${base}/signatures/${id}/preview`
  },
}

export default signatureService
