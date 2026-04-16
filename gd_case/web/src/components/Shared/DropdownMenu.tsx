import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { useOnClickOutside, useIntersectionObserver } from 'usehooks-ts';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right' | 'center';
  className?: string;
}

type DropdownMenuAlign = NonNullable<DropdownMenuProps['align']>;

const dropdownMenuAlignmentClass = (align: DropdownMenuAlign): string => {
  switch (align) {
    case 'left':
      return 'left-0';
    case 'center':
      return 'left-1/2 -translate-x-1/2';
    case 'right':
    default:
      return 'right-0';
  }
};

const dropdownMenuPositionClass = (shouldOpenUpward: boolean): string =>
  shouldOpenUpward
    ? 'bottom-[calc(100%+1vh)]'
    : 'top-[calc(100%+1vh)]';

const dropdownMenuAnimationProps = (shouldOpenUpward: boolean) => {
  if (shouldOpenUpward) {
    return {
      initial: { opacity: 0, scale: 0.95, y: 8 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 8 },
    };
  }
  return {
    initial: { opacity: 0, scale: 0.95, y: -8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -8 },
  };
};

const DropdownMenu = ({
  trigger,
  items,
  align = 'right',
  className = ''
}: DropdownMenuProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [shouldOpenUpward, setShouldOpenUpward] = useState<boolean>(false);

  const { isIntersecting, ref: intersectionRef } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px',
  });

  useEffect(() => {
    if (triggerElement) {
      intersectionRef(triggerElement);
    }
  }, [triggerElement, intersectionRef]);

  useEffect(() => {
    if (isOpen && triggerElement) {
      const calculatePosition = () => {
        const trigger = triggerElement;
        if (!trigger) return;

        const findScrollContainer = (element: Element): Element | null => {
          let parent = element.parentElement;
          while (parent) {
            const style = window.getComputedStyle(parent);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll' || 
                parent.classList.contains('overflow-y-auto')) {
              return parent;
            }
            parent = parent.parentElement;
          }
          return null;
        };

        const scrollContainer = findScrollContainer(trigger);
        const triggerRect = trigger.getBoundingClientRect();
        
        const estimatedItemHeight = 45;
        const estimatedPadding = 20;
        const estimatedDropdownHeight = (items.length * estimatedItemHeight) + estimatedPadding;
        
        let shouldOpenUp = false;

        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const spaceBelow = containerRect.bottom - triggerRect.bottom - 10;
          const spaceAbove = triggerRect.top - containerRect.top - 10;
          
          shouldOpenUp = spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight;
          
          if (!isIntersecting) {
            shouldOpenUp = true;
          }
        } else {
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - triggerRect.bottom - 20;
          const spaceAbove = triggerRect.top - 20;
          
          shouldOpenUp = spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight;
        }
        
        setShouldOpenUpward(shouldOpenUp);
      };

      calculatePosition();
      
      const handleRecalculate = () => {
        calculatePosition();
      };
      
      window.addEventListener('scroll', handleRecalculate, { passive: true });
      window.addEventListener('resize', handleRecalculate, { passive: true });
      
      const scrollContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto, [class*="overflow-y-auto"], [class*="overflow-auto"]');
      scrollContainers.forEach(container => {
        container.addEventListener('scroll', handleRecalculate, { passive: true });
      });

      return () => {
        window.removeEventListener('scroll', handleRecalculate);
        window.removeEventListener('resize', handleRecalculate);
        scrollContainers.forEach(container => {
          container.removeEventListener('scroll', handleRecalculate);
        });
      };
    }
  }, [isOpen, items.length, isIntersecting, triggerElement]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      const scrollContainers = document.querySelectorAll('[class*="overflow-y-auto"]');
      scrollContainers.forEach(container => {
        container.addEventListener('scroll', handleScroll, { passive: true });
      });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        scrollContainers.forEach(container => {
          container.removeEventListener('scroll', handleScroll);
        });
      };
    }
  }, [isOpen]);

  useOnClickOutside([dropdownRef, { current: triggerElement }], () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={setTriggerElement}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            {...dropdownMenuAnimationProps(shouldOpenUpward)}
            transition={{
              duration: 0.15,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className={`
              absolute ${dropdownMenuPositionClass(shouldOpenUpward)} z-[9999] 
              min-w-[10.75vw] max-w-[20vw]
              bg-[#292929] border-[.1vh] border-[#4d4d4d] 
              rounded-[.5vh] shadow-[0_0_2vh_rgba(0,0,0,0.3)]
              overflow-hidden
              ${dropdownMenuAlignmentClass(align)}
            `}
          >
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`
                  w-full px-[1.25vh] py-[1.15vh] text-left
                  flex items-center gap-[.65vh]
                  hover:bg-[#404040] transition-colors duration-250
                  border-none outline-none cursor-pointer
                  ${item.disabled ? 'opacity-75 pointer-events-none' : ''}
                  ${item.danger ? 'hover:bg-[#ff4747] hover:bg-opacity-20' : ''}
                `}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.02,
                  duration: 0.12,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
              >
                {item.icon && (
                  <Icon 
                    icon={item.icon} 
                    className={`
                      size-[1.75vh] flex-shrink-0
                      ${item.danger ? 'text-[#ff4747]' : 'text-white'}
                      ${item.disabled ? 'opacity-75' : ''}
                    `}
                  />
                )}
                <span 
                  className={`
                    text-[1.45vh] font-normal capitalize flex-1
                    ${item.danger ? 'text-[#ff4747]' : 'text-white'}
                    ${item.disabled ? 'opacity-75' : ''}
                  `}
                >
                  {item.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownMenu;