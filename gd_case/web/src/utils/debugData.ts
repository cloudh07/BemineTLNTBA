import {isEnvBrowser} from './misc';
import { IEventMessage } from '@/services/events/type';

interface DebugEvent {
  event: string;
  data: unknown;
}

/**
 * Emulates dispatching an event using SendNuiMessage in the lua scripts.
 * This is used when developing in browser
 *
 * @param events - The event you want to cover
 * @param timer - How long until it should trigger (ms)
 */
export const debugData = (events: DebugEvent[], timer = 1000): void => {
  if (import.meta.env.MODE === 'development' && isEnvBrowser()) {
    for (const event of events) {
      setTimeout(() => {
        const messageData: IEventMessage = {
          event: event.event,
          data: event.data,
        };

        window.dispatchEvent(
          new MessageEvent('message', {
            data: messageData,
          })
        );
      }, timer);
    }
  }
};
