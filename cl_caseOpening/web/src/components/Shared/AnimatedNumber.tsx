import { motion, SpringOptions, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: React.ElementType;
  format?: 'number' | 'currency' | 'decimal';
  prefix?: string;
  decimalPlaces?: number;
  skipMountAnimation?: boolean;
};

const AnimatedNumber = ({
  value,
  className,
  springOptions,
  as = 'span',
  format = 'number',
  prefix = '',
  decimalPlaces = 0,
  skipMountAnimation = false,
}: AnimatedNumberProps) => {
  const MotionComponent = motion.create(as as keyof JSX.IntrinsicElements);

  const safeValue = Number.isFinite(value) ? value : 0;

  const spring = useSpring(skipMountAnimation ? safeValue : 0, {
    bounce: 0,
    duration: 1000,
    ...springOptions,
  });

  const display = useTransform(spring, (current) => {
    if (format === 'decimal') {
      const formatted = current.toLocaleString('vi-VN', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      });
      return prefix ? `${prefix}${formatted}` : formatted;
    }

    const roundedValue = Math.round(current);

    if (format === 'currency') {
      const formatted = roundedValue.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return prefix ? `${prefix}${formatted}` : formatted;
    }

    const formatted = roundedValue.toLocaleString('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return prefix ? `${prefix}${formatted}` : formatted;
  });

  useEffect(() => {
    spring.set(safeValue);
  }, [spring, safeValue]);

  return (
    <MotionComponent className={`tabular-nums ${className}`}>
      {display}
    </MotionComponent>
  );
};

export default AnimatedNumber;