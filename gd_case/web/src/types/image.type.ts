export interface IImageCacheEntry {
  timestamp: number;
  accessCount: number;
}

export interface IImageState {
  currentSrc: string;
  isLoading: boolean;
  hasError: boolean;
  isUsingFallback: boolean;
  imageLoaded: boolean;
}