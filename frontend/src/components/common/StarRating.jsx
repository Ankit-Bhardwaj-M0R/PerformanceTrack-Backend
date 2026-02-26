// Interactive / read-only star rating widget — used on review pages
export default function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange && onChange(star)}
          className={`text-2xl transition-colors ${
            star <= value ? 'text-yellow-400' : 'text-gray-200'
          } ${!readOnly ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500 self-center">{value}/5</span>
    </div>
  )
}
