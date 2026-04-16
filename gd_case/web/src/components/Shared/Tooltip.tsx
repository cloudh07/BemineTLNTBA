import { useState, useRef, useEffect, ReactNode, cloneElement, isValidElement, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useOnClickOutside, useIntersectionObserver } from 'usehooks-ts';

type TooltipTrigger = 'hover' | 'click';
type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';
type TooltipAlign = 'start' | 'center' | 'end';
export type TooltipOffset = { x?: number; y?: number };

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  trigger?: TooltipTrigger;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
  maxWidth?: string;
  delay?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  offset?: TooltipOffset;
}

const isTooltipContentEmpty = (content: ReactNode): boolean => {
  if (!content) return true;
  if (typeof content === 'string' && content.trim().length === 0) return true;
  return false;
};

const getTooltipMotionPropsByPlacement = (finalPlacement: TooltipPlacement) => {
  switch (finalPlacement) {
    case 'top':
      return {
        initial: { opacity: 0, scale: 0.95, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 8 },
      };
    case 'bottom':
      return {
        initial: { opacity: 0, scale: 0.95, y: -8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -8 },
      };
    case 'left':
      return {
        initial: { opacity: 0, scale: 0.95, x: 8 },
        animate: { opacity: 1, scale: 1, x: 0 },
        exit: { opacity: 0, scale: 0.95, x: 8 },
      };
    case 'right':
      return {
        initial: { opacity: 0, scale: 0.95, x: -8 },
        animate: { opacity: 1, scale: 1, x: 0 },
        exit: { opacity: 0, scale: 0.95, x: -8 },
      };
    default:
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      };
  }
};

const Tooltip = ({
  children,
  content,
  trigger = 'hover',
  placement = 'auto',
  align = 'center',
  maxWidth = 'max-w-[20vw]',
  delay = 150,
  disabled = false,
  className = '',
  contentClassName = '',
  offset
}: TooltipProps) => {
  const tooltipId = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    placement: TooltipPlacement;
  }>({ 
    top: 0, 
    left: 0, 
    placement: 'bottom'
  });
  
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isIntersecting, ref: intersectionRef } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '0px 0px -50px 0px',
  });

  useEffect(() => {
    if (triggerRef.current) {
      intersectionRef(triggerRef.current);
    }
  }, [intersectionRef]);

  useOnClickOutside([triggerRef, tooltipRef], () => {
    if (trigger === 'click' && isVisible) {
      setIsVisible(false);
    }
  });

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const tempTooltip = document.createElement('div');
    tempTooltip.id = `temp-tooltip-${tooltipId}`;
    tempTooltip.style.position = 'absolute';
    tempTooltip.style.visibility = 'hidden';
    tempTooltip.style.pointerEvents = 'none';
    tempTooltip.className = `
      bg-[#292929] border-[.1vh] border-[#4d4d4d] 
      rounded-[.5vh] p-[1vh] text-[1.4vh] font-normal text-white
      leading-[2.15vh] ${maxWidth}
    `;
    tempTooltip.innerHTML = typeof content === 'string' ? content : '';
    document.body.appendChild(tempTooltip);
    
    const actualWidth = tempTooltip.offsetWidth;
    const actualHeight = tempTooltip.offsetHeight;
    
    document.body.removeChild(tempTooltip);
    
    const gap = 8;
    let finalPlacement = placement;
    let top = 0;
    let left = 0;

    if (placement === 'auto') {
      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      if (spaceBottom >= actualHeight + gap) {
        finalPlacement = 'bottom';
      } else if (spaceTop >= actualHeight + gap) {
        finalPlacement = 'top';
      } else if (spaceRight >= actualWidth + gap) {
        finalPlacement = 'right';
      } else if (spaceLeft >= actualWidth + gap) {
        finalPlacement = 'left';
      } else {
        finalPlacement = spaceBottom >= spaceTop ? 'bottom' : 'top';
      }
    }

    switch (finalPlacement) {
      case 'top':
        top = triggerRect.top + window.scrollY - actualHeight - gap;
        break;
      case 'bottom':
        top = triggerRect.bottom + window.scrollY + gap;
        break;
      case 'left':
        left = triggerRect.left + window.scrollX - actualWidth - gap;
        break;
      case 'right':
        left = triggerRect.right + window.scrollX + gap;
        break;
    }

    if (finalPlacement === 'top' || finalPlacement === 'bottom') {
      switch (align) {
        case 'start':
          left = triggerRect.left + window.scrollX;
          break;
        case 'center':
          left = triggerRect.left + window.scrollX + (triggerRect.width / 2) - (actualWidth / 2);
          break;
        case 'end':
          left = triggerRect.right + window.scrollX - actualWidth;
          break;
      }
    }

    left += offset?.x ?? 0;
    top += offset?.y ?? 0;

    left = Math.max(16, Math.min(left, viewportWidth - actualWidth - 16));
    top = Math.max(16, Math.min(top, viewportHeight - actualHeight - 16));

    setTooltipPosition({
      top,
      left,
      placement: finalPlacement
    });
  };

  const isDisabled = disabled || isTooltipContentEmpty(content);

  const showTooltip = () => {
    if (isDisabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, trigger === 'hover' ? delay : 0);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        setIsVisible(false);
      } else {
        showTooltip();
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      const handleResize = () => calculatePosition();
      const handleScroll = () => {
        if (!isIntersecting) {
          setIsVisible(false);
        } else {
          calculatePosition();
        }
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible, isIntersecting, offset?.x, offset?.y]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const triggerProps = {
    ref: triggerRef,
    ...(trigger === 'hover' && {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip,
    }),
    ...(trigger === 'click' && {
      onClick: handleClick,
    }),
  };

  const tooltipContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          key={`tooltip-${tooltipId}`}
          {...getTooltipMotionPropsByPlacement(tooltipPosition.placement)}
          transition={{
            duration: 0.15,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          style={{
            position: 'fixed',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            zIndex: 99999
          }}
          className={`
            bg-[#292929] border-[.1vh] border-[#4d4d4d] 
            rounded-[.5vh] shadow-[0_0_2vh_rgba(0,0,0,0.3)]
            p-[1vh] text-[1.4vh] font-normal text-white
            leading-[2.15vh] ${maxWidth}
            ${contentClassName}
          `}
          onMouseEnter={() => {
            if (trigger === 'hover' && timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={() => {
            if (trigger === 'hover') {
              hideTooltip();
            }
          }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const triggerElement = isValidElement(children) 
    ? cloneElement(children as React.ReactElement, {
        ...triggerProps,
        className: `${(children as React.ReactElement).props?.className || ''} ${className}`.trim()
      })
    : (
        <span {...triggerProps} className={className}>
          {children}
        </span>
      );

  return (
    <>
      {triggerElement}
      {typeof document !== 'undefined' && createPortal(
        tooltipContent,
        document.body
      )}
    </>
  );
};

export default Tooltip;