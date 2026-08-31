import React from 'react';
import { motion } from 'motion';

/**
 * STR-01.01.00.03 - Prim UI µChart
 * Micro-graphique atomique
 * @status PARTIAL
 * @priority P0
 */
export const PrimUIMuChart: React.FC<{
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}> = ({ data, width = 200, height = 100, color = '#3b82f6' }) => {
  const maxValue = Math.max(...data, 1);

  return (
    <motion.div
      className="flex items-end gap-1"
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {data.map((value, index) => (
        <motion.div
          key={index}
          className="flex-1 bg-blue-500 rounded-t-sm"
          style={{
            height: `${(value / maxValue) * 100}%`,
            backgroundColor: color,
          }}
          initial={{ height: 0 }}
          animate={{ height: `${(value / maxValue) * 100}%` }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        />
      ))}
    </motion.div>
  );
};
