/**
 * STR-01.01.02.01 - Graisses
 * Typography Weight component
 * @status TODO
 * @priority P1
 */
export const TypographyInput: React.FC<{
  children: React.ReactNode;
  weight?: number;
}> = ({ children, weight = 400 }) => {
  return <span style={{ fontWeight: weight }}>{children}</span>;
};
