import { ReactNode } from 'react';
import { Icon } from '@iconify/react';

interface SkeletonLoadingProps {
  title?: string;
  description?: string;
  icon?: string;
  className?: string;
  customSize?: string;
  children?: ReactNode;
}

const SkeletonLoading = ({
  title = 'đang tải dữ liệu',
  description = 'Vui lòng chờ trong giây lát',
  icon = 'fluent:spinner-ios-16-filled',
  className = '',
  customSize = '',
  children
}: SkeletonLoadingProps) => {
  return (
    <div className={`${customSize ? customSize : 'size-full'} flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-[1.75vh]">
        <Icon
          icon={icon}
          className="size-[6vh] text-[#999999] animation-spin"
        />
        <div className="flex flex-col items-center gap-[1.1vh]">
          <p className="text-[1.85vh] font-semibold text-white capitalize">
            {title}
          </p>
          {description && (
            <p className="text-[1.45vh] font-normal text-[#999999]">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoading;