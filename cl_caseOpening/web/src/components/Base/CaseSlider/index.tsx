import { forwardRef } from 'react';
import { CaseItem } from '@/types';
import { ITEM_WIDTH, ITEM_GAP } from '@/constants';
import { getInventoryImageUrl, resolveItemImage } from '@/utils/helpers';

interface CaseSliderProps {
  sliderItems: CaseItem[];
  offset: number;
  centerItem: CaseItem | null;
  itemRefs: React.MutableRefObject<HTMLDivElement[]>;
  getItemOpacity: (index: number) => number;
}

const CaseSlider = forwardRef<HTMLDivElement, CaseSliderProps>(
  ({ sliderItems, offset, centerItem, getItemOpacity, itemRefs }, ref): JSX.Element => {
    return (
      <div className="relative w-[138.85vh] h-[15vh] -mt-[19vh] overflow-hidden scale-[1.1]" ref={ref}>
        <div className="absolute inset-0 bg-[url('/images/case-slider-wrapper.webp')] bg-no-repeat bg-full-size bg-full-center pointer-events-none z-[2]" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] pointer-events-none">
          <div
            className="flex items-center justify-center w-[11.05vh] h-[11.65vh] bg-no-repeat bg-full-size bg-full-center pt-[.35vh] transition-all duration-250"
            style={{
              backgroundImage: "url('/images/case-main-item-wrapper.webp')",
              filter: 'drop-shadow(0 0 3.5px #D93698)'
            }}
          >
            {centerItem && (
              <img
                className="max-w-[85%] max-h-[85%] object-cover drop-shadow-[0_4px_4px_#00000040]"
                src={resolveItemImage(
                  centerItem.imageUrl,
                  getInventoryImageUrl(centerItem.name)
                )}
                alt={centerItem.name}
              />
            )}
          </div>
        </div>

        <div
          className="absolute flex items-center h-full top-0 z-[2]"
          style={{
            left: '50%',
            transform: `translateX(calc(-50% - ${(ITEM_WIDTH + ITEM_GAP) / 2}vh + ${offset}vh)) translateZ(0)`,
            willChange: 'transform',
            transition: 'opacity .25s ease'
          }}
        >
          {sliderItems.map((item, index) => {
            const opacity = getItemOpacity(index);

            return (
              <div
                ref={(el) => { if (el) itemRefs.current[index] = el; }}
                key={`${item.name}-${index}`}
                className="flex items-center justify-center flex-shrink-0 w-[7.65vh] h-[8.65vh] transition-opacity duration-150"
                style={{
                  opacity,
                  marginRight: index < sliderItems.length - 1 ? '2.75vh' : '0',
                  willChange: 'opacity'
                }}
              >
                <div className="size-full bg-[url('/images/case-item-wrapper.webp')] bg-no-repeat bg-full-size bg-full-center flex items-center justify-center pt-[.35vh]">
                  <img
                    className="max-w-[68%] max-h-[68%] object-cover drop-shadow-[0_4px_4px_#00000066]"
                    src={resolveItemImage(item.imageUrl, getInventoryImageUrl(item.name))}
                    alt={item.name}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CaseSlider.displayName = 'CaseSlider';

export default CaseSlider;