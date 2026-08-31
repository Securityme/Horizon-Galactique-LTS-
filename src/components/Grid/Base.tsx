/**
 * STR-01.01.04.00 - Grid layout
 * Grid Base component
 * @status TODO
 * @priority P1
 */
export const GridBase: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="grid grid-cols-1 gap-4">{children}</div>;
};
