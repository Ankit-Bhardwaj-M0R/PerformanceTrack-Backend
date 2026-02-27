// Reusable coloured metric tile — used on all dashboard/list pages

interface MetricChipProps {
  label: string
  value: string | number | null | undefined
  color: string
}

export default function MetricChip({ label, value, color }: MetricChipProps) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  )
}
