/**
 * STR-01.01.05.05 - FX norme
 * Effects Norms component
 * @status TODO
 * @priority P1
 */
export const EffectsNorms: React.FC<{
  value: number;
}> = ({ value }) => {
  return <div className="effects-norms">FX Norm: {value}</div>;
};
