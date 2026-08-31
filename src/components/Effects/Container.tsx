/**
 * STR-01.01.05.06 - FX conteneurs
 * Effects Container component
 * @status TODO
 * @priority P1
 */
export const EffectsContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="effects-container">{children}</div>;
};
