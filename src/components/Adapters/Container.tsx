/**
 * STR-01.01.06.06 - Adaptateur conteneurs
 * Adapters Container component
 * @status TODO
 * @priority P1
 */
export const AdaptersContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="adapters-container">{children}</div>;
};
