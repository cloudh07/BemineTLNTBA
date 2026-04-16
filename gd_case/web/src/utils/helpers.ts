import { CSSProperties } from 'react';
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CaseItem } from '@/types';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

export const isValidNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export const formatNumber = (value: number | string): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// export const formatNumber = (value: number | string | undefined | null): string => {
//   if (value === undefined || value === null || value === '') {
//     return '0';
//   }
//   return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
// }

export const parseCurrencyInput = (value: string): number => {
  const cleanValue = value.replace(/[^0-9]/g, '');
  return parseInt(cleanValue) || 0;
}

export const formatCurrencyInput = (value: string): string => {
  const numericOnly = value.replace(/[^0-9]/g, '');
  if (!numericOnly) return '';
  
  const numericValue = parseInt(numericOnly);
  return `$${formatCurrency(numericValue)}`;
}

export const removeVietnameseAccent = (str: string, isRemoveSpace: boolean = false): string => {
  if (typeof str !== 'string') return '';

  let result = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');

  if (isRemoveSpace) {
    result = result.replace(/[^a-zA-Z0-9]/g, '');
  }

  return result.trim();
}

export const normalizeSearchText = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return removeVietnameseAccent(text);
}

export function getInventoryImageUrl(itemName: string): string {
  return `https://ik.imagekit.io/gdrp2026/ox_inventory/${encodeURIComponent(itemName)}.webp`;
}

export function resolveItemImage(
  imageUrl: string | undefined | null,
  defaultImageUrl: string
): string {
  if (typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
    return imageUrl.trim();
  }
  return defaultImageUrl;
}

export const getGradientBorderStyle = (
  topColor: string,
  bottomColor: string,
  selected = false
): CSSProperties => {
  const gradientBorder = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;

  if (selected) {
    return {
      borderColor: '#5eff00'
    };
  }

  return {
    borderColor: 'transparent',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    backgroundImage: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0)), ${gradientBorder}`,
  };
};

export const getSharedButtonBackgroundStyle = (): CSSProperties => {
  return {
    backgroundSize: '100% 100%, 0.9vh 0.9vh, 100% 100%, 100% 100%',
    backgroundRepeat: 'no-repeat, repeat, no-repeat, no-repeat',
    backgroundPosition: '49.48% 100%, center, center, center',
    backgroundBlendMode: 'normal, lighten, multiply, normal',
    backgroundOrigin: 'padding-box, padding-box, padding-box, padding-box, border-box',
    backgroundClip: 'padding-box, padding-box, padding-box, padding-box, border-box',
  };
};

export const getSharedButtonBackgroundStyleNoDots = (): CSSProperties => {
  return {
    backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
    backgroundRepeat: 'no-repeat, no-repeat, no-repeat, no-repeat',
    backgroundPosition: '49.48% 100%, center, center, center',
    backgroundBlendMode: 'normal, lighten, multiply, normal',
    backgroundOrigin: 'padding-box, padding-box, padding-box, border-box',
    backgroundClip: 'padding-box, padding-box, padding-box, border-box',
  };
};

function getCaseMetadataRecord(
  metadata: CaseItem['metadata']
): Record<string, unknown> | undefined {
  if (metadata == null || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined;
  }
  return metadata as Record<string, unknown>;
}

export function getCaseItemRarityTier(item: CaseItem | null | undefined): number | undefined {
  const meta = getCaseMetadataRecord(item?.metadata);
  const raw = meta?.['rarity'];
  if (typeof raw !== 'number' || !Number.isInteger(raw)) return undefined;
  if (raw < 1 || raw > 7) return undefined;
  return raw;
}

const CASE_RARITY_DROP_SHADOW_BY_TIER: Record<number, string> = {
  1: 'drop-shadow(0 0 1vh rgba(128, 128, 128, 0.75))',
  2: 'drop-shadow(0 0 1.2vh rgba(50, 175, 1, 0.65))',
  3: 'drop-shadow(0 0 1.2vh rgba(21, 125, 244, 0.65))',
  4:
    'drop-shadow(0 0 1vh rgba(138, 43, 226, 0.5)) drop-shadow(0 0 1.5vh rgba(138, 43, 226, 0.3))',
  5:
    'drop-shadow(0 0 1.5vh rgba(255, 208, 0, 0.45)) drop-shadow(0 0 0.85vh rgba(255, 180, 0, 0.35))',
  6:
    'drop-shadow(0 0 1.5vh rgba(255, 0, 100, 0.45)) drop-shadow(0 0 1vh rgba(255, 80, 130, 0.35))',
  7:
    'drop-shadow(0 0 2vh rgba(255, 100, 255, 0.45)) drop-shadow(0 0 1vh rgba(100, 255, 255, 0.45)) drop-shadow(0 0 1.5vh rgba(255, 255, 255, 0.35))',
};

export function getCaseRarityDropShadow(item: CaseItem | null | undefined): string {
  const t = getCaseItemRarityTier(item);
  if (t != null && t >= 1 && t <= 7) {
    return CASE_RARITY_DROP_SHADOW_BY_TIER[t];
  }
  return 'drop-shadow(0 4px 4px rgba(0, 0, 0, 0.35))';
}