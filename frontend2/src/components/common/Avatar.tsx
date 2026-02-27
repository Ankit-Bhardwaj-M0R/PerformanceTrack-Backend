import type { AvatarSize } from '../../types'

// Circular avatar with first-letter initial — used on TeamMembersPage

interface AvatarProps {
  name: string
  size?: AvatarSize
}

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  const sizeClass = size === 'lg' ? 'w-14 h-14 text-xl' : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${sizeClass} bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  )
}
