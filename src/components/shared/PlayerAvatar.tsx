'use client'

import { getInitials } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

interface PlayerAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { container: 'w-10 h-10', text: 'text-xs', px: 40 },
  md: { container: 'w-16 h-16', text: 'text-lg', px: 64 },
  lg: { container: 'w-24 h-24', text: 'text-3xl', px: 96 },
}

export function PlayerAvatar({ name, avatarUrl, size = 'md', className = '' }: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const { container, text, px } = sizeMap[size]
  const initials = getInitials(name)

  if (avatarUrl && !imgError) {
    return (
      <div className={`${container} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
        <Image
          src={avatarUrl}
          alt={name}
          width={px}
          height={px}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className={`${container} rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0 ${className}`}>
      <span className={`text-accent-primary font-bold ${text}`}>{initials}</span>
    </div>
  )
}