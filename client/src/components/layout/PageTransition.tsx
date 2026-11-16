import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scrollToTopImmediate } from '../../hooks/useLenis';

export const PageTransition: React.FC = () => {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const firstMountRef = useRef(true);
  const [transitioning, setTransitioning] = React.useState(false);

  useEffect(() => {
    scrollToTopImmediate();

    if (firstMountRef.current) {
      firstMountRef.current = false;
      return;
    }

    if (reducedMotion) return;

    setTransitioning(true);
    const timer = setTimeout(() => {
      setTransitioning(false);
    }, 520);

    return () => clearTimeout(timer);
  }, [location.pathname, reducedMotion]);

  return (
    <AnimatePresence>
      {transitioning && (
        <motion.div
          key={location.pathname}
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.48, ease: [0.87, 0, 0.13, 1] }}
          className="fixed inset-0 z-[9980] flex items-center justify-center bg-[#B6F500] pointer-events-none"
        >
          <div className="font-display italic font-black text-7xl tracking-tighter text-[#050505]">
            JS
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
