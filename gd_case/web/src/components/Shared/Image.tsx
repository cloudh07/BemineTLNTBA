import { useState, useEffect, ImgHTMLAttributes, useRef, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { imageCache } from '@/utils/imageCache';

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError' | 'onLoad'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  containerClassName?: string;
  className?: string;
  skeletonTextSize?: string;
  showSkeleton?: boolean;
  enableLoadingBg?: boolean;
  bypassCache?: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
}

const Image = observer(({
  src,
  alt,
  fallbackSrc = '/images/no-image.webp',
  containerClassName = '',
  className = '',
  skeletonTextSize = 'text-[1.1vh]',
  enableLoadingBg = true,
  bypassCache = false,
  onImageLoad,
  onImageError,
  ...props
}: ImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const prevSrcRef = useRef<string>('');
  const isMountedRef = useRef<boolean>(true);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  const processedSrc = useMemo(() => src?.trim() || '', [src]);

  const setTrackedTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      timeoutsRef.current.delete(timeout);
      if (isMountedRef.current) {
        callback();
      }
    }, delay);
    timeoutsRef.current.add(timeout);
    return timeout;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearAllTimeouts();
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    clearAllTimeouts();

    if (processedSrc === prevSrcRef.current && currentSrc === processedSrc && imageLoaded && !hasError) return;

    prevSrcRef.current = processedSrc;

    if (!processedSrc) {
      if (isMountedRef.current) {
        setCurrentSrc(fallbackSrc);
        setIsLoading(false);
        setHasError(false);
        setIsUsingFallback(true);
        setImageLoaded(true);
      }
      return;
    }

    if (!bypassCache && imageCache.isSuccessCached(processedSrc)) {
      if (isMountedRef.current) {
        setCurrentSrc(processedSrc);
        setIsLoading(false);
        setHasError(false);
        setIsUsingFallback(false);
        setImageLoaded(true);
      }
      return;
    }

    if (!bypassCache && imageCache.isFailedCached(processedSrc)) {
      if (isMountedRef.current) {
        setIsLoading(true);
        setHasError(false);
        setImageLoaded(false);
        setIsUsingFallback(false);
      }

      setTrackedTimeout(() => {
        setCurrentSrc(fallbackSrc);
        setIsLoading(false);
        setHasError(true);
        setIsUsingFallback(true);
        setImageLoaded(false);
      }, 200);
      return;
    }

    if (bypassCache) {
      if (isMountedRef.current) {
        setIsLoading(true);
        setHasError(false);
        setImageLoaded(false);
        setIsUsingFallback(false);

        setTrackedTimeout(() => {
          if (processedSrc !== currentSrc) {
            setCurrentSrc(processedSrc);
          }
        }, 50);
      }
      return;
    }

    const checkAndLoad = async (signal: AbortSignal) => {
      if (signal.aborted || !isMountedRef.current) return;

      try {
        const isBrowserCached = await imageCache.isBrowserCached(processedSrc, signal);

        if (signal.aborted || !isMountedRef.current) return;

        if (isBrowserCached) {
          setCurrentSrc(processedSrc);
          setIsLoading(false);
          setHasError(false);
          setIsUsingFallback(false);
          setImageLoaded(true);
          imageCache.addToSuccessCache(processedSrc);
        } else {
          setIsLoading(true);
          setHasError(false);
          setImageLoaded(false);
          setIsUsingFallback(false);

          setTrackedTimeout(() => {
            if (processedSrc !== currentSrc) {
              setCurrentSrc(processedSrc);
            }
          }, 50);
        }
      } catch (error) {
        if (!signal.aborted && isMountedRef.current) {
          console.error('Image load check failed:', error);
        }
      }
    };

    checkAndLoad(abortControllerRef.current.signal);

  }, [processedSrc, fallbackSrc, currentSrc]);

  const handleLoad = () => {
    if (!isMountedRef.current) return;

    clearAllTimeouts();

    if (currentSrc && !isUsingFallback && !bypassCache) {
      imageCache.addToSuccessCache(currentSrc);
    }

    setIsLoading(false);
    setHasError(false);
    setImageLoaded(true);
    onImageLoad?.();
  };

  const handleError = () => {
    if (!isMountedRef.current) return;

    const currentUrl = currentSrc;

    setIsLoading(false);
    setHasError(true);
    setImageLoaded(false);

    if (currentUrl && !isUsingFallback && !bypassCache) {
      imageCache.addToFailedCache(currentUrl);
    }

    if (!isUsingFallback && fallbackSrc && currentSrc !== fallbackSrc) {
      if (imageCache.isFailedCached(fallbackSrc)) {
        setHasError(true);
        onImageError?.();
      } else {
        setIsLoading(true);
        setTrackedTimeout(() => {
          setCurrentSrc(fallbackSrc);
          setIsLoading(true);
          setHasError(false);
          setIsUsingFallback(true);
          setImageLoaded(false);
        }, 100);
      }
    } else {
      onImageError?.();
    }
  };

  const wrapperClassName = containerClassName.includes('absolute')
  ? containerClassName
  : `relative ${containerClassName}`;

  return (
    <div className={wrapperClassName}>
      {isLoading && (
        <div 
          className={`absolute inset-0 ${className} flex items-center justify-center ${enableLoadingBg ? 'bg-[#ffffff0a]' : ''} z-[1]`}
        >
          <span className={`${skeletonTextSize} font-medium text-[#ffffff80] capitalize`}>
            đang tải...
          </span>
        </div>
      )}

      <img
        {...props}
        src={currentSrc}
        alt={alt}
        className={`
          ${className}
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          transition-opacity duration-250 ease-in-out
        `}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
});

export default Image;