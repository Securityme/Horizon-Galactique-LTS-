/**
 * STR-01.01.01.05 - DS Norme
 * Design System Norm component
 * @status TODO
 * @priority P0
 */
export const DesignSystemNorms: React.FC<{
  value: number;
}> = ({ value }) => {
  return <div className="ds-norm">Norm: {value}</div>;
};
