import React from 'react';
import { motion } from 'motion';

/**
 * STR-01.01.00.06 - Prim UI Conteneur
 * Conteneur atomique
 * @status TODO
 * @priority P0
 */
export const PrimUIContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'bordered';
}> = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-white',
    card: 'bg-white shadow-lg rounded-xl p-6',
    bordered: 'bg-white border border-gray-200 rounded-lg p-4',
  };

  return (
    <motion.div
      className={`${variants[variant]} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
