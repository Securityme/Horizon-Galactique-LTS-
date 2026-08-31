/**
 * STR-01.01.06.02 - Adaptateur jauges
 * Adapters Gauges component
 * @status TODO
 * @priority P1
 */
export const AdaptersGauges: React.FC<{
  value: number;
}> = ({ value }) => {
  return <div className="adapters-gauges">Adapter Gauge: {value}</div>;
};
