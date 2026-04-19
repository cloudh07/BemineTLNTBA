import { inject, injectable, named } from 'inversify';
import { AppContribution, registerAppContribution } from '@/services/app/app.extensions';
import { ScopedLogger } from '@/services/log/scopedLogger';
import { ServicesContainer, defineService, useService } from '@/utils/servicesContainer';
import { action, computed, makeAutoObservable } from 'mobx';
import { ModalType } from '@/types';

export type IModalService = ModalService;
export const IModalService = defineService<IModalService>('ModalService');

export function registerModalService(container: ServicesContainer) {
  container.registerImpl(IModalService, ModalService);
  registerAppContribution(container, ModalService);
}

@injectable()
class ModalService implements AppContribution {
  @inject(ScopedLogger)
  @named('ModalService')
  private logService!: ScopedLogger;

  isOpen = false;
  type: ModalType = null;
  title = '';
  data: any = null;
  
  private clearTimeoutId: NodeJS.Timeout | null = null;

  async init() {
    this.logService.log('init');
    makeAutoObservable(this);
  }

  @action
  openModal = (type: ModalType, title: string, data?: any) => {
    if (this.clearTimeoutId) {
      clearTimeout(this.clearTimeoutId);
      this.clearTimeoutId = null;
    }
    
    this.type = type;
    this.title = title;
    this.data = data;
    this.isOpen = true;
  }

  @action
  closeModal = () => {
    this.isOpen = false;
    
    this.clearTimeoutId = setTimeout(() => {
      this.clearModalData();
    }, 350);
  }

  @action
  private clearModalData = () => {
    this.type = null;
    this.title = '';
    this.data = null;
    this.clearTimeoutId = null;
  }

  openCreateModal = (category: string, title?: string, data?: any) => {
    this.openModal(`create-${category}`, title || `Tạo ${category} mới`, data);
  }

  openEditModal = (category: string, title?: string, data?: any) => {
    this.openModal(`edit-${category}`, title || `Chỉnh sửa ${category}`, data);
  }

  openDeleteModal = (category: string, title?: string, data?: any) => {
    this.openModal(`delete-${category}`, title || `Xóa ${category}`, data);
  }

  @computed
  get hasActiveModal(): boolean {
    return this.isOpen && this.type !== null;
  }
}

export function useModalService(): IModalService {
  return useService(IModalService);
}
