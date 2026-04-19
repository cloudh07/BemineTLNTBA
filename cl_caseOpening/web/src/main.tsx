import 'reflect-metadata';
import App from './App';
import './index.css';

import {startBrowserApp} from './utils/createApp';
import {registerLogService} from './services/log/logService';
import {ConsoleLogProvider} from './services/log/providers/consoleLogProvider';
import {registerMainService} from './services/app/main/main.service';
import {registerEventsService} from './services/events/events.service';
import {registerBoilerPlateService} from './services/app/boilerplate/boilerplate.service';
import {ServicesContainer} from './utils/servicesContainer';
import {registerConfigService} from './services/config.service';
import {registerModalService} from './services/modal/modal.service';
import { SoundProvider } from './providers';

const start = (
  afterRender?: (container: ServicesContainer) => void | Promise<void>
) => {
  startBrowserApp({
    defineServices: cotainer => {
      // Define services here
      registerLogService(cotainer, [ConsoleLogProvider]);
      registerConfigService(cotainer);
      registerEventsService(cotainer);
      registerMainService(cotainer);
      registerBoilerPlateService(cotainer);
      registerModalService(cotainer);
    },
    beforeRender: async () => {},
    render: () => (
      <SoundProvider>
        <App />
      </SoundProvider>
    ),
    afterRender(container) {
      afterRender && afterRender(container);
    },
  });
};

start();

export default start;
