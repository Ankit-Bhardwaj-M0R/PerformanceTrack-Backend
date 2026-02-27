import { ElementType } from 'react'

// KPI card with icon, large number and label — used on reports pages

interface KpiCardProps {
  label: string
  value: string | number | null | undefined
  icon: ElementType
  color: string
}

export default function KpiCard({ label, value, icon: Icon, color }: KpiCardProps) {
  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
