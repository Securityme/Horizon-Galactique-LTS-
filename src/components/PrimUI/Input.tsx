import React from 'react';
import { motion } from 'motion';

/**
 * STR-01.01.00.01 - Prim UI Saisie
 * Champ de saisie atomique
 * @status TODO
 * @priority P0
 */
export const PrimUIInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}> = ({ value, onChange, placeholder = '', type = 'text', disabled = false }) => {
  return (
    <motion.input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      whileFocus={{ scale: 1.02, borderColor: '#3b82f6' }}
      className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
  );
};
