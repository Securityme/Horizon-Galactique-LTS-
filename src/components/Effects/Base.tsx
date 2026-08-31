/**
 * STR-01.01.05.00 - FX glass
 * Effects Base component (Glassmorphism)
 * @status TODO
 * @priority P1
 */
export const EffectsBase: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
      {children}
    </div>
  );
};
