import { useState, useRef, useEffect, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { useOnClickOutside } from 'usehooks-ts';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ISelectDropdownProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
}

const SelectDropdown = ({ 
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  className = '',
  dropdownClassName = ''
}: ISelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useOnClickOutside([triggerRef, dropdownRef as RefObject<HTMLButtonElement | HTMLDivElement>], () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  const calculatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  const handleOptionSelect = (optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue);
    if (option && !option.disabled) {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{
            duration: 0.15,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 99999
          }}
          className={`
            bg-[#292929] border-[.1vh] border-[#4d4d4d] 
            rounded-[.5vh] shadow-[0_0_2vh_rgba(0,0,0,0.3)]
            overflow-hidden max-h-[25vh] overflow-y-auto
            ${dropdownClassName}
          `}
        >
          {options.map((option, index) => (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleOptionSelect(option.value)}
              disabled={option.disabled}
              className={`
                w-full px-[1.25vh] py-[1.15vh] text-left
                flex items-center justify-between
                hover:bg-[#28AC40] transition-colors duration-250
                border-none outline-none cursor-pointer text-[1.45vh] font-normal
                ${option.disabled ? 'opacity-75 pointer-events-none' : ''}
                ${value === option.value ? 'bg-[#28AC40] text-white' : 'text-white'}
              `}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.02,
                duration: 0.12,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
            >
              <span className="capitalize">{option.label}</span>
              {value === option.value && (
                <Icon 
                  icon="ic:round-check" 
                  className="size-[1.5vh] text-white flex-shrink-0"
                />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full h-[3.75vh] bg-[#333333] rounded-[.5vh] outline-none px-[1.25vh]
            text-[1.5vh] font-normal text-left flex items-center justify-between
            transition-all duration-250 border-none cursor-pointer
            ${disabled ? 'opacity-75 pointer-events-none' : 'hover:bg-[#404040]'}
            ${isOpen ? 'bg-[#404040]' : ''}
          `}
        >
          <span className={selectedOption ? 'text-white' : 'text-[#999999]'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
            <Icon 
              icon="mdi:chevron-down" 
              className="size-[1.75vh] text-white flex-shrink-0"
            />
          </motion.div>
        </button>
      </div>

      {typeof document !== 'undefined' && createPortal(
        dropdownContent,
        document.body
      )}
    </>
  );
};

export default SelectDropdown;