import React from 'react';
import { motion } from 'motion';

/**
 * STR-01.01.00.00 - Prim UI Base
 * Bouton tactile & conteneur atomique
 * @status PARTIAL (GitHub)
 * @priority P0
 */
export const PrimUIBase: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, onClick, disabled = false }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
    >
      {children}
    </motion.button>
  );
};
