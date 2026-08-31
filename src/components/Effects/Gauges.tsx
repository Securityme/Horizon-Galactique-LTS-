/**
 * STR-01.01.05.02 - FX jauges
 * Effects Gauges component
 * @status TODO
 * @priority P1
 */
export const EffectsGauges: React.FC<{
  value: number;
}> = ({ value }) => {
  return <div className="effects-gauges">FX Gauge: {value}</div>;
};
