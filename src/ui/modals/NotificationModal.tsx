import React, { useState } from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import { Bell, AlertTriangle, Info, AlertOctagon, X, Check } from "lucide-react";

interface NotificationModalProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
}

export function NotificationModal({ gameState, theme, onClose }: NotificationModalProps) {
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "INFO">("ALL");
  const isLight = theme.isLight ?? false;

  const filteredAlerts = gameState.activeAlerts.filter((a) => {
    if (filter === "CRITICAL") return a.severity === "CRITICAL" || a.severity === "FATAL";
    if (filter === "INFO") return a.severity === "INFO";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none">
      <div className={`border rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl font-mono animate-in zoom-in-95 duration-200 ${
        isLight ? "bg-slate-50 border-slate-300 text-slate-900 shadow-slate-900/10" : "bg-slate-950 border-cyan-500/40 text-slate-100"
      }`}>
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-white/10"
        }`}>
          <div className={`flex items-center gap-2 font-bold text-sm ${isLight ? "text-slate-900" : "text-cyan-400"}`}>
            <Bell className={`w-5 h-5 ${isLight ? "text-slate-800" : "text-cyan-400"}`} /> Centre des Alertes & Notifications ({gameState.activeAlerts.length})
          </div>
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onClose();
            }}
            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
              isLight ? "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900" : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`flex border-b text-xs px-4 py-2 gap-2 shrink-0 ${
          isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/10"
        }`}>
          {["ALL", "CRITICAL", "INFO"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded-md text-[11px] cursor-pointer transition-all font-semibold ${
                filter === f
                  ? isLight
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f === "ALL" ? "Toutes" : f === "CRITICAL" ? "Critiques" : "Informatifs"}
            </button>
          ))}
        </div>

        <div className={`p-4 flex-1 overflow-y-auto space-y-2 text-xs scroll-smooth-touch ${
          isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
        }`}>
          {filteredAlerts.length === 0 ? (
            <div className={`p-8 text-center ${isLight ? "text-slate-500" : "text-slate-500"}`}>
              Aucune alerte enregistrée dans le journal actif.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  alert.severity === "FATAL" || alert.severity === "CRITICAL"
                    ? isLight
                      ? "bg-red-50 border-red-200 text-red-900"
                      : "bg-red-950/30 border-red-500/40 text-red-200"
                    : alert.severity === "WARNING"
                    ? isLight
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-amber-950/30 border-amber-500/40 text-amber-200"
                    : isLight
                    ? "bg-white border-slate-200 text-slate-800 shadow-sm"
                    : "bg-slate-900/60 border-white/5 text-slate-300"
                }`}
              >
                {alert.severity === "FATAL" || alert.severity === "CRITICAL" ? (
                  <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                ) : alert.severity === "WARNING" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? "text-sky-600" : "text-cyan-400"}`} />
                )}
                <div>
                  <div className="font-bold">{alert.message}</div>
                  <div className={`text-[10px] mt-1 ${isLight ? "text-slate-500" : "text-slate-500"}`}>Tick {alert.tick}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
