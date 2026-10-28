const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath
  }
  // Server uploads stored in DEC_Backend/uploads
  if (imagePath.startsWith('/uploads') || imagePath.startsWith('uploads')) {
    const cleanBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
      /\/api\/?$/,
      ''
    )
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
    return `${cleanBase}${cleanPath}`
  }
  // Public assets like /Projects Images/..., /projects-gallery/..., /login-bg.jpg
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
}

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  getToken() {
    return localStorage.getItem('dec_admin_token') || ''
  }

  async request(endpoint, options = {}) {
    // Cleanly normalize slashes between base and endpoint
    const cleanBase = this.baseUrl.replace(/\/+$/, '')
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${cleanBase}${cleanEndpoint}`

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

    const headers = {
      Accept: 'application/json',
      ...options.headers,
    }

    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    const token = this.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      // Security: If 401 (Unauthorized) on a protected endpoint, purge stale session
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('dec_admin_token')
        localStorage.removeItem('dec_admin_user')
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }

      const errorMsg = data?.message || data?.error || `HTTP ${response.status}: Request failed`
      const error = new Error(errorMsg)
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  upload(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    })
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

export const api = new ApiClient()
export default api

