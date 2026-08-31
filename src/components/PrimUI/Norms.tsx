import React from 'react';
import { motion } from 'motion';

/**
 * STR-01.01.00.05 - Prim UI Norme
 * Composant de normalisation atomique
 * @status PARTIAL
 * @priority P0
 */
export const PrimUINorms: React.FC<{
  value: number;
  min: number;
  max: number;
  format?: (value: number) => string;
}> = ({ value, min = 0, max = 100, format = (v) => v.toString() }) => {
  // Normalize value to 0-1 range
  const normalized = (value - min) / (max - min);
  
  // Determine color based on normalized value
  const getColor = () => {
    if (normalized < 0.3) return 'text-red-600';
    if (normalized < 0.6) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <motion.div
      className={`flex items-center gap-2 ${getColor()}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="font-medium">{format(value)}</span>
      <span className="text-gray-400">/ {format(max)}</span>
    </motion.div>
  );
};
