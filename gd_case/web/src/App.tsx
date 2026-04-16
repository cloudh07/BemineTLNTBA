import {useEffect, Suspense} from 'react';
import {isEnvBrowser} from './utils/misc';
import {fetchNui} from './utils/fetchNui';
import {observer} from 'mobx-react-lite';
import {ISetting} from './types';
import {useConfigService} from './services/config.service';
import { useModalService } from './services/modal/modal.service';
import { useMainService } from './services/app/main/main.service';

import CaseOpening from './components';

const App = observer(() => {
  const ConfigService = useConfigService();
  const modalService = useModalService();
  const mainService = useMainService();

  useEffect(() => {
    if (isEnvBrowser()) return;
    const t = window.setTimeout(async () => {
      const UISetting = await fetchNui<ISetting>('AppReady');
      ConfigService.setData(UISetting);
    }, 2000);
    return () => window.clearTimeout(t);
  }, [ConfigService]);

  useEffect(() => {
    if (isEnvBrowser()) return;
    const handleEscape = async (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (modalService.hasActiveModal) {
        e.preventDefault();
        return;
      }
      if (mainService.state === 'spinning' || mainService.state === 'finished') {
        e.preventDefault();
        return;
      }
      await fetchNui('main:close');
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modalService, mainService.state]);
  return (
    <div
      className="prose w-screen h-screen fixed top-0 left-0 flex justify-center items-center pointer-events-auto select-none"
    >
      <Suspense fallback={null}>
        <CaseOpening />
      </Suspense>
    </div>
  );
});

export default App;
