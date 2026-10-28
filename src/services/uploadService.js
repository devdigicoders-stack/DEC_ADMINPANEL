import api from './api.js'

/**
 * Service to handle image uploads to backend server storage
 */
export const uploadService = {
  /**
   * Upload single image file to server uploads folder
   * @param {File} file - Browser File object
   * @param {string} folder - Destination subfolder ('services' | 'projects' | 'general' | 'blog')
   * @returns {Promise<{ success: boolean, data: { filename: string, url: string, fullUrl: string } }>}
   */
  async uploadImage(file, folder = 'services') {
    if (!file) {
      throw new Error('Please select an image file to upload.')
    }

    const formData = new FormData()
    formData.append('image', file)

    const endpoint = `/upload?folder=${encodeURIComponent(folder)}`
    return api.upload(endpoint, formData)
  },

  /**
   * Upload multiple image files to server uploads folder
   * @param {File[]} files - Array of Browser File objects
   * @param {string} folder - Destination subfolder ('services' | 'projects' | 'general' | 'blog')
   * @returns {Promise<{ success: boolean, data: Array<{ filename: string, url: string, fullUrl: string }> }>}
   */
  async uploadMultiple(files, folder = 'services') {
    if (!files || files.length === 0) {
      throw new Error('Please select at least one image file.')
    }

    const formData = new FormData()
    for (const file of files) {
      formData.append('images', file)
    }

    const endpoint = `/upload/multiple?folder=${encodeURIComponent(folder)}`
    return api.upload(endpoint, formData)
  },
}

export default uploadService
