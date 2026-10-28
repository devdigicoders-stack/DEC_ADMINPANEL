export const APP_NAME = 'DEC Admin Portal'

export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
  },
  {
    name: 'Job Applications',
    path: '/applications',
    icon: 'Briefcase',
    badge: '12 New',
  },
  {
    name: 'Inquiries',
    path: '/inquiries',
    icon: 'MessageSquareText',
    badge: '4',
  },
  {
    name: 'Courses & Programs',
    path: '/courses',
    icon: 'GraduationCap',
  },
  {
    name: 'Team / Users',
    path: '/users',
    icon: 'Users',
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: 'Settings',
  },
]

export const STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  in_review: 'bg-blue-50 text-blue-700 border-blue-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  resolved: 'bg-slate-100 text-slate-700 border-slate-200',
}
