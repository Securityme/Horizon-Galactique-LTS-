/**
 * STR-01.01.01.01 - DS Saisie
 * Design System Input component
 * @status TODO
 * @priority P0
 */
export const DesignSystemInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="ds-input"
    />
  );
};
