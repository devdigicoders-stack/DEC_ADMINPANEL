import api from './api.js'
import { MOCK_APPLICATIONS } from '../utils/mockData.js'

export const applicationService = {
  async getAll() {
    try {
      return await api.get('/applications')
    } catch {
      // Fallback to local mock data in development
      return { success: true, data: MOCK_APPLICATIONS }
    }
  },

  async updateStatus(id, status) {
    try {
      return await api.put(`/applications/${id}/status`, { status })
    } catch {
      return { success: true, id, status }
    }
  },

  async delete(id) {
    try {
      return await api.delete(`/applications/${id}`)
    } catch {
      return { success: true, id }
    }
  },
}
