/**
 * Component Type Definitions
 * Type definitions for all UI components
 */

import { Strate } from './strate';

// Base component props
export interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
}

// Button props
export interface ButtonProps extends BaseComponentProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Input props
export interface InputProps extends BaseComponentProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
}

// Gauge/Progress props
export interface GaugeProps extends BaseComponentProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
}

// Chart props
export interface ChartProps extends BaseComponentProps {
  data: number[];
  labels?: string[];
  type?: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  width?: number;
  height?: number;
  color?: string;
}

// Badge props
export interface BadgeProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

// Card props
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'bordered' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// Container props
export interface ContainerProps extends BaseComponentProps {
  variant?: 'default' | 'card' | 'bordered' | 'glass';
  fluid?: boolean;
}

// Strate-specific props
export interface StrateCardProps extends BaseComponentProps {
  strate: Strate;
  showPriority?: boolean;
  showStatus?: boolean;
  showDependencies?: boolean;
  compact?: boolean;
}

// Layout props
export interface GridProps extends BaseComponentProps {
  cols?: number | string;
  gap?: number | string;
  responsive?: boolean;
}

// Animation props
export interface MotionProps extends BaseComponentProps {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
  whileHover?: object;
  whileTap?: object;
  delay?: number;
  duration?: number;
}
