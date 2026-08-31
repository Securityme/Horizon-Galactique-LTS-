/**
 * STR-01.01.06.05 - Adaptateur norme
 * Adapters Norms component
 * @status TODO
 * @priority P1
 */
export const AdaptersNorms: React.FC<{
  value: number;
}> = ({ value }) => {
  return <div className="adapters-norms">Adapter Norm: {value}</div>;
};
