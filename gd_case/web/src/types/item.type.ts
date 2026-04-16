export interface ItemData {
  name: string;
  price: number;
  category?: string;
  type?: string | null;
  label?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}