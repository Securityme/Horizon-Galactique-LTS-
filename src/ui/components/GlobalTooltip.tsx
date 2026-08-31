import React, { createContext, useContext, useState, ReactNode } from "react";

export interface TooltipInfo {
  title: string;
  category?: string;
  status?: string;
  description: string;
  modifiers?: string[];
}

interface TooltipContextType {
  showTooltip: (info: TooltipInfo, event: React.MouseEvent) => void;
  hideTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const showTooltip = (info: TooltipInfo, event: React.MouseEvent) => {
    setTooltip(info);
    setCoords({ x: event.clientX, y: event.clientY });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip) {
      setCoords({ x: event.clientX, y: event.clientY });
    }
  };

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      <div onMouseMove={handleMouseMove} className="w-full h-full">
        {children}
        {tooltip && (
          <div
            className="fixed z-[9999] p-3 w-64 bg-slate-950/95 border border-sky-500/40 rounded-xl shadow-2xl text-xs font-mono text-slate-200 pointer-events-none backdrop-blur-md space-y-1.5 transition-all duration-75 ease-out animate-in fade-in zoom-in-95"
            style={{
              left: `${Math.min(window.innerWidth - 270, coords.x + 12)}px`,
              top: `${Math.min(window.innerHeight - 180, coords.y + 12)}px`,
            }}
          >
            <div className="flex items-center justify-between border-b border-sky-500/20 pb-1">
              <span className="font-extrabold text-sky-400 uppercase tracking-wide truncate max-w-[150px]">{tooltip.title}</span>
              {tooltip.category && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/10 text-sky-300 border border-sky-500/30 font-bold uppercase shrink-0">
                  {tooltip.category}
                </span>
              )}
            </div>
            {tooltip.status && (
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Statut :</span>
                <span className="font-bold text-emerald-400">{tooltip.status}</span>
              </div>
            )}
            <p className="text-[10px] text-slate-300 leading-relaxed font-sans">{tooltip.description}</p>
            {tooltip.modifiers && tooltip.modifiers.length > 0 && (
              <div className="pt-1.5 border-t border-sky-500/10 space-y-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Modificateurs :</span>
                {tooltip.modifiers.map((mod, index) => (
                  <div key={index} className="flex items-start gap-1 text-[9px] text-emerald-400 font-medium">
                    <span>✦</span>
                    <span className="leading-tight">{mod}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltip must be used within a TooltipProvider");
  }
  return context;
}
