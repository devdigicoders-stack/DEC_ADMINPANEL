import { STATUS_COLORS } from '../../utils/constants.js'

export default function Badge({
  children,
  variant,
  status,
  size = 'md',
  dot = false,
  className = '',
}) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  }

  const customColor = status ? STATUS_COLORS[status] : null
  const fallbackColor = 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
        customColor || fallbackColor
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === 'active'
              ? 'bg-emerald-500'
              : status === 'pending'
              ? 'bg-amber-500'
              : status === 'rejected'
              ? 'bg-rose-500'
              : 'bg-blue-500'
          }`}
        />
      )}
      {children}
    </span>
  )
}
