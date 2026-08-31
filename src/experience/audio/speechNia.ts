/**
 * HORIZON GALACTIQUE : L'ARCHE DES ÉTOILES
 * LOT S1 — Synthèse Vocale Diégétique N.I.A. & Voix Radio France FIP-Σ
 */

export class SpeechNiaEngine {
  private isSpeaking: boolean = false;
  private volume: number = 0.85;
  private onAnnouncementCallback: ((text: string, isFip?: boolean) => void) | null = null;

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setAnnouncementListener(cb: (text: string, isFip?: boolean) => void) {
    this.onAnnouncementCallback = cb;
  }

  public speak(text: string, isFip: boolean = false) {
    if (this.onAnnouncementCallback) {
      this.onAnnouncementCallback(text, isFip);
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (this.volume <= 0.01) return;

    try {
      window.speechSynthesis.cancel(); // Annule la précédente
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;

      if (isFip) {
        // Voix FIP : douce, chaleureuse, posée, tempo lent et caressant
        utterance.rate = 0.88;
        utterance.pitch = 1.05;
      } else {
        // Voix N.I.A. : robotique et neutre
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
      }

      // Sélection d'une voix française féminine privilégiée pour le style FIP
      const voices = window.speechSynthesis.getVoices();
      const frVoices = voices.filter((v) => v.lang.startsWith("fr"));
      
      if (isFip) {
        // Cherche une voix féminine douce si possible (ex: Google français, Thomas, Amelie, etc.)
        const preferredFipVoice = frVoices.find(
          (v) => v.name.toLowerCase().includes("female") || 
                 v.name.toLowerCase().includes("femme") || 
                 v.name.toLowerCase().includes("amelie") ||
                 v.name.toLowerCase().includes("marie") ||
                 v.name.toLowerCase().includes("hortense") ||
                 v.name.toLowerCase().includes("google")
        ) || frVoices[0];

        if (preferredFipVoice) {
          utterance.voice = preferredFipVoice;
        }
      } else if (frVoices[0]) {
        utterance.voice = frVoices[0];
      }

      this.isSpeaking = true;
      utterance.onend = () => {
        this.isSpeaking = false;
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  }

  public speakFipAnnouncement(sol: number = 1) {
    const fipAnnouncements = [
      `Vous écoutez FIP, la voix de la Terre dans l'immensité de l'Arche. Sol ${sol}. Une programmation continue, sans frontières, pour accompagner votre voyage stellaire.`,
      `FIP, 104.2 mégahertz. Le soleil s'éloigne doucement, mais les harmonies demeurent. Restez avec nous pour une traversée feutrée.`,
      `Flash navigation FIP. Le trafic est fluide entre l'Anneau 1 et les Dômes de Cryostase. Respirez, vous êtes sur FIP.`,
      `FIP, Radio France Internationale et Stellaire. Un instant d'écoute partagée entre deux quadrants cosmiques.`,
      `Vous êtes bien sur FIP. Musique éclectique, jazz stellaire et mémoires terrestres. Prochain titre dans un souffle...`,
      `FIP-Sigma, onde continue. La Terre nous a confié ses plus belles mélodies, nous les diffusons pour vous jusqu'aux confins du vide.`,
    ];
    const text = fipAnnouncements[sol % fipAnnouncements.length];
    this.speak(text, true);
  }

  public generateDiégeticAnnouncement(sol: number, pop: number, energyGw: number, alertCount: number): string {
    const templates = [
      `Bulletin de bord. Sol ${sol}. Population nominale à ${pop} colons. Consommation énergétique stabilisée à ${energyGw.toFixed(1)} gigawatts.`,
      `Communication N.I.A. : Intégrité des dômes confirmée pour le cycle en cours. Aucune dérive majeure détectée.`,
      `Rappel aux résidents de l'Anneau 2 : les sas de décompression sont sous surveillance automatique. Bonne rotation horaire.`,
      `Analyse spectroscopique stellaire : balayage des vecteurs d'approche en cours. Tous les systèmes sont nominaux.`,
    ];
    if (alertCount > 0) {
      return `Alerte de bord Sol ${sol}. ${alertCount} anomalie(s) détectée(s) dans la télémétrie des sous-systèmes de l'Arche.`;
    }
    return templates[sol % templates.length];
  }
}

export const speechNia = new SpeechNiaEngine();
