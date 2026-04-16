import { makeAutoObservable } from 'mobx';
import { inject, injectable, named } from 'inversify';
import { AppContribution, registerAppContribution } from '../app.extensions';
import { ScopedLogger } from '../../log/scopedLogger';
import {
  ServicesContainer,
  defineService,
  useService,
} from '../../../utils/servicesContainer';
import { EventsService } from '../../events/events.service';
import { UserInfo, ItemData, CaseOpeningState, CaseCollection, CaseData, CaseItem, CaseType } from '@/types';
import '@/debug';

export type IMainService = MainService;
export const IMainService = defineService<IMainService>('MainService');

export function registerMainService(container: ServicesContainer) {
  container.registerImpl(IMainService, MainService);
  registerAppContribution(container, MainService);
}

@injectable()
class MainService implements AppContribution {
  @inject(ScopedLogger)
  @named('MainService')
  private logService: ScopedLogger;
  @inject(EventsService)
  private eventsService: EventsService;

  // ==================== PROPERTIES ====================
  show = false;
  isLoading = false;
  loadingStates: Record<string, boolean> = {};
  userInfo: UserInfo | null = null;
  userItems: Record<string, ItemData> = {};
  itemLabels: Record<string, string> = {};
  caseCollection: CaseCollection | null = null;
  state: CaseOpeningState = 'idle';

  // ==================== INIT ====================
  async init() {
    this.logService.log('init');
    makeAutoObservable(this);

    // Đăng ký dữ kiện
    this.eventsService.subscribe('main:setShow', this.setShow);
    this.eventsService.subscribe('main:setUserInfo', this.setUserInfo);
    this.eventsService.subscribe('main:setUserItems', this.setUserItems);
    this.eventsService.subscribe('main:setItemLabels', this.setItemLabels);
    this.eventsService.subscribe('main:setData', this.setData.bind(this));
    this.eventsService.subscribe('main:startSpin', this.startSpin.bind(this));
  }

  // ==================== SETTERS ====================
  setShow = (show: boolean) => {
    this.show = show;
  };

  setLoading = (loading: boolean) => {
    this.isLoading = loading;
  };

  setLoadingState = (key: string, loading: boolean) => {
    this.loadingStates[key] = loading;
  };

  setItemLabels = (itemLabels: Record<string, string>) => {
    this.itemLabels = itemLabels;
  };

  setUserInfo = (userInfo: UserInfo) => {
    this.userInfo = userInfo;
  };

  setUserItems = (userItems: Record<string, ItemData>) => {
    this.userItems = userItems;
  };

  setData = (data: CaseCollection) => {
    if (!data) {
      this.logService.error(new Error('Undefined data'));
      return;
    }

    const itemsArray =
      data.items && Array.isArray(data.items)
        ? data.items
        : data.items
          ? Object.values(data.items)
          : [];

    this.caseCollection = {
      label: data.label,
      description: data.description,
      consumeType: 'item',
      items: itemsArray as CaseItem[],
      name: data.name,
      buttons: data.buttons
    };

    this.state = 'idle';
  }

  // ==================== ACTIONS ====================
  startSpin = (data: { type: CaseType; winningItem: CaseItem }) => {
    if (!this.caseCollection) {
      this.logService.error(new Error('Case collection not found'));
      return;
    }

    if (this.caseCollection.consumeType === 'item') {
      this.state = 'spinning';
      return;
    }

    const selectedCase = this.caseCollection.cases?.find(c => c.type === data.type);
    if (!selectedCase) {
      this.logService.error(new Error('Selected case not found'));
      return;
    }

    selectedCase.winningItem = data.winningItem;

    this.state = 'spinning';
  }

  finishSpin = () => {
    this.state = 'finished';
  }

  resetState = () => {
    this.state = 'idle';
    if (Array.isArray(this.caseCollection?.cases)) {
      this.caseCollection?.cases?.forEach(caseItem => {
        caseItem.winningItem = undefined;
      });
    }
  }

  // ==================== GETTERS ====================
  getLoadingState(key: string): boolean {
    return this.loadingStates[key] ?? false;
  }

  getItemLabel = (itemName: string): string => {
    const normalizedName = itemName.toLowerCase();
    const labels = this.itemLabels || {};

   const matchedKey = Object.keys(labels).find(key => key.toLowerCase() === normalizedName);

   return matchedKey ? labels[matchedKey] : itemName;
  }

  getCaseData = (caseId: string): CaseData | null => {
    const cases = this.caseCollection?.cases;
    if (!Array.isArray(cases)) return null;
    return cases.find(c => c.id === caseId) ?? null;
  };

  get isAnyLoading(): boolean {
    return this.isLoading || Object.values(this.loadingStates).some(Boolean);
  }
}

export function useMainService(): IMainService {
  return useService(IMainService);
}
