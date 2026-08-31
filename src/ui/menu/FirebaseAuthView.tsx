import React, { useState } from "react";
import { ThemeDefinition } from "../../theme/themes";
import { signInWithGoogle, auth } from "../../lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { proceduralRadio } from "../../audio/radio";
import { ShieldCheck, LogIn, UserCheck, Key, Lock, Sparkles } from "lucide-react";

interface FirebaseAuthViewProps {
  theme: ThemeDefinition;
  onAuthenticated: () => void;
}

export function FirebaseAuthView({ theme, onAuthenticated }: FirebaseAuthViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    proceduralRadio.playUIChime("CLICK");
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      proceduralRadio.playUIChime("CONFIRM");
      onAuthenticated();
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError(err?.message || "Échec de l'authentification Google");
      setLoading(false);
    }
  };

  const handleAnonymousAuth = async () => {
    proceduralRadio.playUIChime("CLICK");
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
      proceduralRadio.playUIChime("CONFIRM");
      onAuthenticated();
    } catch (err: any) {
      console.error("Anonymous auth error:", err);
      setError(err?.message || "Échec de la connexion invité");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col items-center justify-center p-4 select-none ${
      theme.isLight
        ? "bg-slate-50 text-slate-900"
        : "bg-slate-950 text-slate-100"
    }`}>
      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(100,116,139,0.15)_0%,transparent_70%)]" />
      </div>

      <div className={`w-full max-w-md p-6 sm:p-8 rounded-2xl border shadow-xl z-10 space-y-6 font-sans ${
        theme.isLight
          ? "bg-white border-slate-300 shadow-slate-200"
          : "bg-slate-900/90 border-slate-800 shadow-slate-950/80"
      }`}>
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`p-3 rounded-xl border ${
            theme.isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-slate-800 border-slate-700 text-slate-200"
          }`}>
            <ShieldCheck className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <h2 className="text-xl font-mono font-bold uppercase tracking-wider">
            AUTHENTIFICATION FIREBASE
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            IDENTIFICATION DE L'ARCHONTE EN CHEF
          </p>
        </div>

        <p className="text-xs text-center text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          Connectez-vous pour synchroniser vos sauvegardes dans le Cloud Firestore et accéder au registre d'accréditation.
        </p>

        {error && (
          <div className="p-3 bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 rounded-lg text-xs text-rose-800 dark:text-rose-300 font-mono">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase flex items-center justify-center gap-3 border transition-all cursor-pointer ${
              theme.isLight
                ? "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                : "bg-sky-600 hover:bg-sky-500 text-white border-sky-500"
            } disabled:opacity-50`}
          >
            <LogIn className="w-4 h-4" />
            <span>Se connecter avec Google</span>
          </button>

          <button
            onClick={handleAnonymousAuth}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase flex items-center justify-center gap-3 border transition-all cursor-pointer ${
              theme.isLight
                ? "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            } disabled:opacity-50`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Accès Invité / Session Anonyme</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-[10px] font-mono text-center text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
          PROJECT ID : AI-STUDIO-HORIZON · CLOUD FIRESTORE ACTIVE
        </div>
      </div>
    </div>
  );
}
