import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Page Transition Component
 * 
 * Animates page transitions using Framer Motion with a smooth fade and slide effect.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Fade In Component
 * 
 * Simple fade-in animation for content elements.
 */
export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className 
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide Up Component
 * 
 * Slides content up with a fade effect.
 */
export function SlideUp({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className 
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered Children Component
 * 
 * Animates multiple child elements with a staggered delay.
 */
export function StaggeredChildren({ 
  children, 
  delayBetween = 0.1,
  initialDelay = 0,
  className 
}: { 
  children: ReactNode; 
  delayBetween?: number;
  initialDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: delayBetween,
            delayChildren: initialDelay,
          },
        },
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: 'spring',
                damping: 15,
                stiffness: 100,
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Scale In Component
 * 
 * Scales in with a slight bounce effect.
 */
export function ScaleIn({ 
  children, 
  delay = 0,
  className 
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hover Scale Component
 * 
 * Adds a subtle scale effect on hover.
 */
export function HoverScale({ 
  children, 
  scaleAmount = 1.05,
  className 
}: { 
  children: ReactNode;
  scaleAmount?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: scaleAmount }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated Card Component
 * 
 * Card component with scale and elevation effects on hover.
 */
export function AnimatedCard({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Rotating Icon Component
 * 
 * Creates a rotating animation for icons, useful for loading states.
 */
export function RotatingIcon({
  icon,
  duration = 2,
  className
}: {
  icon: ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={className}
    >
      {icon}
    </motion.div>
  );
}

/**
 * Bounce Component
 * 
 * Creates a subtle bouncing animation to draw attention.
 */
export function Bounce({
  children,
  delay = 0,
  className
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 1,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated List Component
 * 
 * Creates a staggered animation for list items.
 */
export function AnimatedList({
  children,
  staggerDelay = 0.05,
  className
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.ul
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {React.Children.map(children, (child) => (
        <motion.li variants={item}>{child}</motion.li>
      ))}
    </motion.ul>
  );
}

/**
 * Attention Pulse Component
 * 
 * Creates a pulsing animation to draw attention to an element.
 */
export function AttentionPulse({
  children,
  color = 'rgba(var(--primary), 0.3)',
  duration = 2,
  className
}: {
  children: ReactNode;
  color?: string;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-md"
        animate={{
          boxShadow: [
            `0 0 0 0 ${color}`,
            `0 0 0 10px transparent`
          ]
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />
      {children}
    </div>
  );
}

/**
 * Slide In Component
 * 
 * Slides in from a specified direction.
 */
export function SlideIn({
  children,
  direction = 'right',
  delay = 0,
  duration = 0.5,
  className
}: {
  children: ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const directionMap = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    top: { x: 0, y: -50 },
    bottom: { x: 0, y: 50 },
  };
  
  const initial = directionMap[direction];
  
  return (
    <motion.div
      initial={{ opacity: 0, ...initial }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Drawer Animation Component
 * 
 * Creates a drawer-like animation for sidebars or panels.
 */
export function Drawer({
  children,
  isOpen,
  direction = 'right',
  className
}: {
  children: ReactNode;
  isOpen: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}) {
  const variants = {
    open: { opacity: 1, x: 0, y: 0 },
    closedLeft: { opacity: 0, x: '-100%' },
    closedRight: { opacity: 0, x: '100%' },
    closedTop: { opacity: 0, y: '-100%' },
    closedBottom: { opacity: 0, y: '100%' },
  };
  
  const getClosedVariant = () => {
    switch(direction) {
      case 'left': return 'closedLeft';
      case 'right': return 'closedRight';
      case 'top': return 'closedTop';
      case 'bottom': return 'closedBottom';
      default: return 'closedRight';
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={getClosedVariant()}
          animate="open"
          exit={getClosedVariant()}
          variants={variants}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}