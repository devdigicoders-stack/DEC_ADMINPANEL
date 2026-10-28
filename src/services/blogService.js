import api from './api.js'

/**
 * Service to handle Blog operations against DEC Backend API
 */
export const blogService = {
  /**
   * Fetch all blogs with optional filtering, search, pagination
   */
  async getAll(params = {}) {
    const query = new URLSearchParams()

    if (params.status && params.status !== 'All') {
      query.append('status', params.status)
    }
    if (params.category && params.category !== 'All') {
      query.append('category', params.category)
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

    const endpoint = `/blog${query.toString() ? `?${query.toString()}` : ''}`
    return api.get(endpoint)
  },

  /**
   * Get single blog by slug or ID
   */
  async getBySlugOrId(slugOrId) {
    return api.get(`/blog/${slugOrId}`)
  },

  /**
   * Get blog statistics
   */
  async getStats() {
    return api.get('/blog/stats')
  },

  /**
   * Create new blog post
   */
  async create(blogData) {
    return api.post('/blog', blogData)
  },

  /**
   * Update existing blog post
   */
  async update(id, blogData) {
    return api.put(`/blog/${id}`, blogData)
  },

  /**
   * Toggle publication status
   */
  async toggleStatus(id, status) {
    return api.patch(`/blog/${id}/status`, { status })
  },

  /**
   * Delete blog post
   */
  async delete(id) {
    return api.delete(`/blog/${id}`)
  },

  /**
   * Seed initial blogs
   */
  async seed() {
    return api.post('/blog/seed')
  },
}

export default blogService
