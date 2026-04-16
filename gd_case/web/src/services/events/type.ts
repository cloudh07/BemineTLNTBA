export interface IEventMessage {
  event: string;
  data: unknown;
}

export type AppEventListener<T = unknown> = (args: T) => void;
