/**
 * STR-01.01.01.06 - DS Conteneur
 * Design System Container component
 * @status TODO
 * @priority P0
 */
export const DesignSystemContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="ds-container">{children}</div>;
};
