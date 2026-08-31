/**
 * STR-01.01.01.04 - DS Badges
 * Design System Badge component
 * @status TODO
 * @priority P0
 */
export const DesignSystemBadges: React.FC<{
  children: React.ReactNode;
  variant?: string;
}> = ({ children, variant = 'primary' }) => {
  return <span className={`ds-badge ds-badge-${variant}`}>{children}</span>;
};
