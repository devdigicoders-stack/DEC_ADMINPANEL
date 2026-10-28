import api from './api.js'

export const projectService = {
  /**
   * Fetch all projects with optional filters
   * @param {Object} params - { status: 'all' | 'active' | 'inactive', sector, search, page, limit }
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

    const endpoint = `/projects${query.toString() ? `?${query.toString()}` : ''}`
    return await api.get(endpoint)
  },

  /**
   * Fetch a single project by ID or Code
   */
  async getByIdOrCode(idOrCode) {
    return await api.get(`/projects/${idOrCode}`)
  },

  /**
   * Get project stats
   */
  async getStats() {
    return await api.get('/projects/stats')
  },

  /**
   * Create a new project
   */
  async create(projectData) {
    return await api.post('/projects', projectData)
  },

  /**
   * Update an existing project
   */
  async update(id, projectData) {
    return await api.put(`/projects/${id}`, projectData)
  },

  /**
   * Toggle project active / inactive status
   */
  async toggleStatus(id) {
    return await api.patch(`/projects/${id}/status`)
  },

  /**
   * Delete a project
   */
  async delete(id) {
    return await api.delete(`/projects/${id}`)
  },

  /**
   * Seed initial 84 landmark projects from website
   */
  async seed(force = false) {
    return await api.post('/projects/seed', { force })
  },
}

export default projectService
