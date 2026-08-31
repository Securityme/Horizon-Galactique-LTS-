/**
 * STR-01.01.03.00 - Presets de motion
 * Motion Base component
 * @status TODO
 * @priority P1
 */
export const MotionBase: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="motion-base">{children}</div>;
};
