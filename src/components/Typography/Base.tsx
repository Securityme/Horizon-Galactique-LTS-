/**
 * STR-01.01.02.00 - Font HUD
 * Typography Base component
 * @status TODO
 * @priority P1
 */
export const TypographyBase: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="typography-base">{children}</div>;
};
