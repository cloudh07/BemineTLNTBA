class ImageCacheManager {
  private successCache = new Set<string>();
  private failedCache = new Set<string>();
  private readonly MAX_SUCCESS_CACHE = 500;
  private readonly MAX_FAILED_CACHE = 200;

  isSuccessCached(src: string): boolean {
    return this.successCache.has(src);
  }

  isFailedCached(src: string): boolean {
    return this.failedCache.has(src);
  }

  addToSuccessCache(src: string): void {
    this.successCache.add(src);
    this.cleanSuccessCacheIfNeeded();
  }

  addToFailedCache(src: string): void {
    this.failedCache.add(src);
    this.successCache.delete(src);
    this.cleanFailedCacheIfNeeded();
  }

  async isBrowserCached(src: string, signal?: AbortSignal): Promise<boolean> {
    return new Promise((resolve) => {
      if (signal?.aborted) {
        resolve(false);
        return;
      }

      const img = new Image();
      
      const timeout = setTimeout(() => {
        resolve(false);
      }, 1000);

      const cleanup = () => {
        clearTimeout(timeout);
        img.onload = null;
        img.onerror = null;
      };

      const abortHandler = () => {
        cleanup();
        resolve(false);
      };

      signal?.addEventListener('abort', abortHandler, { once: true });

      img.onload = () => {
        cleanup();
        signal?.removeEventListener('abort', abortHandler);
        resolve(img.complete);
      };

      img.onerror = () => {
        cleanup();
        signal?.removeEventListener('abort', abortHandler);
        resolve(false);
      };

      img.src = src;
      
      if (img.complete) {
        cleanup();
        signal?.removeEventListener('abort', abortHandler);
        resolve(true);
      }
    });
  }

  private cleanSuccessCacheIfNeeded(): void {
    if (this.successCache.size > this.MAX_SUCCESS_CACHE) {
      const entries = Array.from(this.successCache);
      const toRemove = entries.slice(0, Math.floor(entries.length / 2));
      toRemove.forEach(entry => this.successCache.delete(entry));
    }
  }

  private cleanFailedCacheIfNeeded(): void {
    if (this.failedCache.size > this.MAX_FAILED_CACHE) {
      const entries = Array.from(this.failedCache);
      const toRemove = entries.slice(0, Math.floor(entries.length / 2));
      toRemove.forEach(entry => this.failedCache.delete(entry));
    }
  }

  clearAll(): void {
    this.successCache.clear();
    this.failedCache.clear();
  }
}

export const imageCache = new ImageCacheManager();