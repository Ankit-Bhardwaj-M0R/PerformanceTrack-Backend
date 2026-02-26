// Generic empty-state placeholder with icon, heading and optional sub-text
export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="card text-center py-16">
      {Icon && <Icon size={48} className="mx-auto mb-3 text-gray-300" />}
      <p className="text-gray-500 font-medium">{title}</p>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      {action}
    </div>
  )
}
