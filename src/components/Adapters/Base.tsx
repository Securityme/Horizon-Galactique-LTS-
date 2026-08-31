/**
 * STR-01.01.06.00 - Adaptateur VP
 * Adapters Base component (Viewport)
 * @status TODO
 * @priority P1
 */
export const AdaptersBase: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="adapters-base">{children}</div>;
};
