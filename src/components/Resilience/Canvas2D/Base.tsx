/**
 * STR-01.02.00.00 - Canvas 2D fallback Base
 * Resilience Canvas2D Base component
 * @status BLOCKED (L3_maturity)
 * @priority P2
 */
export const ResilienceCanvas2DBase: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <canvas className="resilience-canvas2d">{children}</canvas>;
};
