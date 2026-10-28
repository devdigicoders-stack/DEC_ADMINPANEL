export const VIEW_TO_PATH = {
  dashboard: '/dashboard',
  services: '/services',
  'add-service': '/services/add',
  projects: '/projects',
  'add-project': '/projects/add',
  gallery: '/gallery',
  'upload-images': '/gallery/upload',
  blog: '/blog',
  'create-blog': '/blog/create',
  contact: '/contact',
  'all-enquiries': '/contact',
  messages: '/messages',
  careers: '/careers',
  'career-applications': '/careers',
  'website-content': '/website-content',
  'content-management': '/website-content',
  'site-settings': '/site-settings',
  settings: '/settings',
  notifications: '/notifications',
}

export const getActiveViewFromPath = (pathname) => {
  if (pathname === '/services/add') return 'add-service'
  if (pathname.startsWith('/services')) return 'services'
  if (pathname === '/projects/add') return 'add-project'
  if (pathname.startsWith('/projects')) return 'projects'
  if (pathname === '/gallery/upload') return 'upload-images'
  if (pathname.startsWith('/gallery')) return 'gallery'
  if (pathname === '/blog/create') return 'create-blog'
  if (pathname.startsWith('/blog')) return 'blog'
  if (pathname.startsWith('/careers') || pathname.startsWith('/applications')) return 'careers'
  if (pathname.startsWith('/messages')) return 'messages'
  if (pathname.startsWith('/contact') || pathname.startsWith('/enquiries')) return 'contact'
  if (pathname.startsWith('/site-settings')) return 'site-settings'
  if (pathname.startsWith('/website-content') || pathname.startsWith('/content')) return 'website-content'
  if (pathname.startsWith('/settings')) return 'settings'
  if (pathname.startsWith('/notifications')) return 'notifications'
  return 'dashboard'
}
