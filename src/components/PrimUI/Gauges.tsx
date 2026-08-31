import React from 'react';
import { motion } from 'motion';

/**
 * STR-01.01.00.02 - Prim UI Jauges
 * Composant de jauge atomique
 * @status PARTIAL
 * @priority P0
 */
export const PrimUIGauges: React.FC<{
  value: number;
  min: number;
  max: number;
  label?: string;
}> = ({ value, min = 0, max = 100, label = '' }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {label && (
        <div className="text-sm text-gray-600 mb-1">{label}</div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1 text-right">
        {value}/{max}
      </div>
    </motion.div>
  );
};
