"use client";

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// Variantes de animación predefinidas
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -60,
  },
};

export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -60,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 60,
  },
};

export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 60,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -60,
  },
};

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
  },
};

export const slideInFromTop: Variants = {
  initial: {
    opacity: 0,
    y: -100,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -100,
  },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

// Componente de animación reutilizable
interface AnimatedDivProps {
  children: ReactNode;
  variants?: Variants;
  initial?: string;
  animate?: string;
  exit?: string;
  transition?: any;
  className?: string;
  delay?: number;
  duration?: number;
}

export function AnimatedDiv({
  children,
  variants = fadeInUp,
  initial = "initial",
  animate = "animate",
  exit = "exit",
  transition = {},
  className = "",
  delay = 0,
  duration = 0.5,
}: AnimatedDivProps) {
  return (
    <motion.div
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={{
        duration,
        delay,
        ease: "easeOut",
        ...transition,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente para animaciones de entrada
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  className = "",
}: FadeInProps) {
  const variants = {
    up: fadeInUp,
    down: {
      initial: { opacity: 0, y: -60 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 60 },
    },
    left: fadeInLeft,
    right: fadeInRight,
  };

  return (
    <AnimatedDiv
      variants={variants[direction]}
      delay={delay}
      duration={duration}
      className={className}
    >
      {children}
    </AnimatedDiv>
  );
}

// Componente para animaciones de escala
interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.3,
  className = "",
}: ScaleInProps) {
  return (
    <AnimatedDiv
      variants={scaleIn}
      delay={delay}
      duration={duration}
      className={className}
    >
      {children}
    </AnimatedDiv>
  );
}

// Componente para listas con animación stagger
interface StaggerListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerList({
  children,
  className = "",
  staggerDelay = 0.1,
}: StaggerListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      <motion.div variants={staggerItem}>
        {children}
      </motion.div>
    </motion.div>
  );
}

// Componente para animaciones de hover
interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
  duration?: number;
}

export function HoverScale({
  children,
  scale = 1.05,
  className = "",
  duration = 0.2,
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente para animaciones de tap
interface TapScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
  duration?: number;
}

export function TapScale({
  children,
  scale = 0.95,
  className = "",
  duration = 0.1,
}: TapScaleProps) {
  return (
    <motion.div
      whileTap={{ scale }}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente para animaciones de rotación
interface RotateOnHoverProps {
  children: ReactNode;
  rotation?: number;
  className?: string;
  duration?: number;
}

export function RotateOnHover({
  children,
  rotation = 360,
  className = "",
  duration = 0.5,
}: RotateOnHoverProps) {
  return (
    <motion.div
      whileHover={{ rotate: rotation }}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente para animaciones de pulso
interface PulseProps {
  children: ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export function Pulse({
  children,
  scale = 1.1,
  duration = 1,
  className = "",
}: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente para animaciones de bounce
interface BounceProps {
  children: ReactNode;
  intensity?: number;
  duration?: number;
  className?: string;
}

export function Bounce({
  children,
  intensity = 0.2,
  duration = 0.6,
  className = "",
}: BounceProps) {
  return (
    <motion.div
      animate={{
        y: [0, -intensity * 100, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hook para animaciones basadas en scroll
export function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

// Componente para animaciones basadas en scroll
interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function ScrollAnimation({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
}: ScrollAnimationProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
