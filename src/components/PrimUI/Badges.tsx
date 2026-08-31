import React from 'react';
import { motion } from 'motion';

/**
 * STR-01.01.00.04 - Prim UI Badges
 * Badge atomique
 * @status PARTIAL
 * @priority P0
 */
export const PrimUIBadges: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}> = ({ children, variant = 'primary', size = 'md' }) => {
  const variants = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    error: 'bg-red-600 text-white',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.span
      className={`${variants[variant]} ${sizes[size]} rounded-full font-medium`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
};
