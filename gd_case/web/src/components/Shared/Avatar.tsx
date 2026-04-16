import { JSX, useState } from 'react'
import { cn } from '@/utils/helpers'

const AvatarSkeletonLoader = ({
  className,
}: {
  className: string;
}): JSX.Element => (
  <div
    className={cn(
      'relative overflow-hidden',
      'bg-gradient-to-br from-[#37415199] via-[#4B556366] to-[#37415199]',
      'flex items-center justify-center',
      className
    )}
  >
    <div
      className={cn(
        'absolute inset-0',
        'bg-gradient-to-br from-[#4B55634D] via-[#6B728080] to-[#4B55634D]',
        'animate-pulse'
      )}
    />

    <div
      className={cn(
        'absolute inset-0 -translate-x-full',
        'bg-gradient-to-r from-transparent via-[#FFFFFF1A] to-transparent',
        'animate-shimmer',
        'transform skew-x-12'
      )}
    />

    <div
      className={cn(
        'absolute inset-0 rounded-full',
        'ring-1 ring-[#6B728033]',
        'shadow-inner'
      )}
    />
  </div>
);

interface AvatarProps {
  src?: string | undefined
  fallBackSrc?: string
  alt?: string
  className?: string
}

const Avatar = ({
  src,
  fallBackSrc = '/images/default-avatar.webp',
  alt = 'Avatar',
  className = 'size-[4vh] rounded-full object-contain'
}: AvatarProps): JSX.Element => {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallBackSrc)
  const [hasError, setHasError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    if (currentSrc === src && fallBackSrc) {
      setCurrentSrc(fallBackSrc)
      setIsLoading(true)
    } else {
      setHasError(true)
    }
  }

  if (hasError) {
    return (
      <div className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-br from-[#4B5563CC] via-[#6B728099] to-[#4B5563CC]',
        'flex items-center justify-center',
        'ring-1 ring-[#9CA3AF33]',
        className
      )}>
        <svg 
          className="size-[60%] text-[#D1D5DBCC]" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>

        <div className={cn(
          'absolute -top-[0.2vh] -right-[0.2vh]',
          'size-[1.2vh] rounded-full',
          'bg-[#44e4efcc] ring-2 ring-[#44e4efcc]',
          'flex items-center justify-center'
        )}>
          <svg className="size-[.6vh] text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && <AvatarSkeletonLoader className={className} />}

      <img 
        src={currentSrc} 
        alt={alt} 
        onLoad={handleImageLoad}
        onError={handleImageError} 
        className={cn(
          className,
          'transition-all duration-500 ease-out',
          'ring-1 ring-[#D1D5DB1A]',
          isLoading 
            ? 'opacity-0 absolute inset-0 scale-95' 
            : 'opacity-100 scale-100'
        )}
        draggable={false}
      />
    </div>
  )
};

export default Avatar;