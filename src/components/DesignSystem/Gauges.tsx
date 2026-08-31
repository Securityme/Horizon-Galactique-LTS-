/**
 * STR-01.01.01.02 - DS Jauges
 * Design System Gauge component
 * @status TODO
 * @priority P0
 */
export const DesignSystemGauges: React.FC<{
  value: number;
  min: number;
  max: number;
}> = ({ value, min = 0, max = 100 }) => {
  return <div className="ds-gauge">Gauge: {value}</div>;
};
