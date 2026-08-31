/**
 * STR-01.01.01.00 - DS Base
 * Design System Base component
 * @status TODO
 * @priority P0
 */
export const DesignSystemBase: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="ds-base">{children}</div>;
};
