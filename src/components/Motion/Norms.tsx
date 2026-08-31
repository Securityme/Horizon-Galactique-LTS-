/**
 * STR-01.01.03.05 - Normalisation animation
 * Motion Norms component
 * @status TODO
 * @priority P1
 */
export const MotionNorms: React.FC<{
  value: number;
}> = ({ value }) => {
  return <div className="motion-norms">Motion Norm: {value}</div>;
};
