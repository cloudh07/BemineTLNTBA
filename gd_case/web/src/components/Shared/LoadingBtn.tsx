import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useMainService } from '@/services/app/main/main.service';
import { Icon } from '@iconify/react'
import { cn } from '@/utils/helpers';

interface LoadingBtnProps {
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  title?: string | React.ReactNode;
  loadingTitle?: string | React.ReactNode;
  loadingTextColor?: string;
  loadingTextSize?: string;
  className?: string;
  buttonId?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  onClick?: (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void | Promise<void>;
  onLoadingChange?: (isLoading: boolean, buttonId?: string) => void;
}

const LoadingBtn = observer(({
  type = 'button',
  title, 
  loadingTitle, 
  loadingTextColor,
  loadingTextSize,
  className, 
  buttonId, 
  disabled = false,
  style,
  onClick, 
  onLoadingChange
}: LoadingBtnProps) => {
  const mainService = useMainService();
  
  const [localLoading, setLocalLoading] = useState<boolean>(false);

  const isLoading = buttonId ? mainService?.getLoadingState(buttonId) : localLoading;

  const handleClick = async (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (disabled || isLoading) return;

    try {
      if (buttonId) {
        mainService?.setLoadingState(buttonId, true);
      } else {
        setLocalLoading(true);
      }
      onLoadingChange?.(true, buttonId);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onClick) await onClick(ev);
    } catch (error: any) {
      console.error(error);
    } finally {
      if (buttonId) {
        mainService?.setLoadingState(buttonId, false);
      } else {
        setLocalLoading(false);
      }
      onLoadingChange?.(false, buttonId);
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={`${className} ${isDisabled ? 'pointer-events-none opacity-75 transition-all duration-250' : ''}`}
      onClick={handleClick}
      data-button-id={buttonId}
      style={style}
    >
      {isLoading ? (
        <div className="flex items-center gap-[.65vh]">
          <span 
            className={cn('font-semibold capitalize', loadingTextColor ? '' : 'text-white', loadingTextSize ? loadingTextSize : 'text-[1.25vh]')}
            style={loadingTextColor ? { color: loadingTextColor } : {}}
          >
            {loadingTitle || 'đang xử lý'}
          </span>
          <Icon 
            icon="fluent:spinner-ios-16-filled"
            className={cn('animation-spin size-[1.85vh]', loadingTextColor ? '' : 'text-white')}
          />
        </div>
      ) : (
        title
      )}
    </button>
  );
});

export default LoadingBtn;