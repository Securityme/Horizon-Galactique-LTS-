/**
 * STR-01.01.03.06 - Animation de conteneurs
 * Motion Container component
 * @status TODO
 * @priority P1
 */
export const MotionContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="motion-container">{children}</div>;
};
