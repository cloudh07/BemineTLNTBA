export type GameStatus = 'idle' | 'playing' | 'won';
export type CaseOpeningState = 'idle' | 'spinning' | 'finished';
export type CaseRarityTier = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type CaseType = 'vehicle_card' | 'other';
export type SelectedAmount = 1 | 5 | 10;
export type CurrencyType = 'coin' | 'money' | 'bank' | 'black_money' | 'point';
export type CaseConsumeType = 'item' | 'currency';

export type CaseItemMetadata = Record<string, unknown> | unknown[];

export interface CaseItem {
  name: string;
  gender?: string;
  imageUrl?: string;
  percent: number;
  type: string;
  metadata?: CaseItemMetadata;
}

export interface CaseData {
  id: string;
  name: string;
  type: CaseType;
  label: string;
  description: string;
  price: number;
  currency: CurrencyType;
  items: CaseItem[];
  winningItem?: CaseItem;
}

export interface CaseCollection {
  label: string;
  description: string;
  consumeType: CaseConsumeType;
  items?: CaseItem[];
  name?: string;
  cases?: CaseData[];
  buttons?: SelectedAmount[];
}