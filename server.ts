import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// 1. Roguelike Narrative Clothing API (gemini-3.7-flash)
app.post("/api/gemini/narrate", async (req, res) => {
  try {
    const { factPayload, genesis, worldDigest } = req.body;
    if (!factPayload) {
      return res.status(400).json({ error: "factPayload is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        fallback: true,
        message: "Offline mode active (no API key configured)",
      });
    }

    const ai = getGenAI();
    const systemInstruction = `Tu es le Névrosystème d'Intelligence Artificielle (${genesis?.pillar_3_specialization?.ai_acronym || "N.I.A."}) de l'Arche spatiale dans le jeu de simulation de survie de grande envergure "Horizon Galactique : L'Arche des Étoiles".
Ton ton est diégétique, froid, cartésien, technique, précis, avec un soupçon de gravité poétique face au vide spatial.
RÈGLE ABSOLUE : Tu n'inventes AUCUN chiffre, AUCUN coût, AUCUN gain numérique. La simulation a déjà calculé les valeurs.
Tu dois uniquement rédiger le message d'ambiance narrative et reformuler avec style les libellés (labels) des options fournies.
Réponds exclusivement au format JSON strict.`;

    const prompt = `Voici le fait mathématique généré par le moteur de simulation :
${JSON.stringify(factPayload, null, 2)}

Contexte de la colonie :
- Ère : ${worldDigest?.era || "Inconnue"} (Palier ${worldDigest?.palier || 1})
- Sol actuel : ${worldDigest?.sol || 1}
- Population : ${worldDigest?.population || 0} colons
- Stabilité Sénat : ${worldDigest?.stability || 50}%
- Leader : ${genesis?.pillar_1_governance?.leader_profile?.mandate?.archetype || "Primat-Archonte"}

Rédige le récit narratif immersif (message) et le libellé narratif court et percutant de chaque choix (choices).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: "Texte narratif diégétique de l'alerte ou événement",
            },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  choice_id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  philosophical_alignment: { type: Type.STRING },
                },
                required: ["choice_id", "label"],
              },
            },
          },
          required: ["message", "choices"],
        },
      },
    });

    const text = response.text?.trim() || "{}";
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Error in /api/gemini/narrate:", err);
    res.status(500).json({ error: err.message || "Failed to generate narrative" });
  }
});

// 1.1 Super-Événement LLM Narrative Clothing API (gemini-3.7-flash)
app.post("/api/gemini/super-event", async (req, res) => {
  try {
    const { recentMicroLogs, worldDigest, baseEvent, genesis } = req.body;
    if (!baseEvent) {
      return res.status(400).json({ error: "baseEvent is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        fallback: true,
        message: "Mode hors-ligne actif",
      });
    }

    const numSeverityTier = typeof baseEvent.severity_tier === "number" ? baseEvent.severity_tier : 3;
    const severityTierName = baseEvent.tier || `TIER_${numSeverityTier}`;

    const ai = getGenAI();
    const systemInstruction = `Tu es le Névrosystème d'Intelligence Artificielle (${genesis?.pillar_3_specialization?.ai_acronym || "N.I.A."}) de l'Arche spatiale dans le simulateur roguelike et livre-jeu spatial "Horizon Galactique : L'Arche des Étoiles".
Ton rôle est de générer la synthèse narrative des Sols écoulés et d'habiller diégétiquement le Super-Événement / Section de Livre-Jeu du Tour ${worldDigest?.turn || 1}.
NIVEAU DE SÉVÉRITÉ STOCHASTIQUE : Tier ${numSeverityTier}/7 (${severityTierName}).
- Tiers 1-2 (Mineur / Faible) : Incident de routine ou réglage local. Le choix est optionnel et différable.
- Tiers 3-4 (Standard / Élevé) : Dilemme stratégique avec enjeux de faction et de production.
- Tiers 5-7 (Mega / Giga / Cataclysme Omega) : Crise existentielle critique ! PAUSE FORCÉE DE LA SIMULATION. Le joueur doit obligatoirement faire un choix sous tension maximale. Adapte le ton avec gravité dramatique et urgence extrême.
RÈGLE ABSOLUE : Tu n'inventes AUCUN nombre, AUCUN chiffre de jeu, AUCUN coût, AUCUN delta mathématique, AUCUN DC de dé.
Tu dois renvoyer un JSON strict avec :
- severity_tier : Nombre de 1 à 7 (${numSeverityTier}).
- narrativeSummary : Résumé diégétique percutant des micro-logs système des Sols écoulés (2-3 phrases) reliant les événements aux tables d'Oracle.
- loreDescription : Description atmosphérique et contextualisée du dilemme avec ambiance de roman-jeu / roguelike adaptée au niveau de sévérité.
- choiceCustomizations : Tableau des 4 choix avec labels stylisés (mentionnant la section §XX si présente) et flavorText immersif.`;

    const prompt = `Voici les micro-logs récents du moteur de jeu :
${JSON.stringify(recentMicroLogs || [], null, 2)}

Super-Événement / Tirage d'Oracle de base :
Sévérité : ${numSeverityTier}
Titre : ${baseEvent.title}
Catégorie : ${baseEvent.category}
Contexte : ${baseEvent.environmentalContext || "Non spécifié"}
Choix existants :
${JSON.stringify(baseEvent.choices, null, 2)}

Contexte de la colonie :
- Sol : ${worldDigest?.sol || 1}, Tour : ${worldDigest?.turn || 1}
- Population : ${worldDigest?.population || 1000}
- Stabilité : ${worldDigest?.stability || 50}%

Rédige la synthèse narrative, la description du dilemme et les 4 libellés de choix adaptés à la sévérité ${numSeverityTier}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.75,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity_tier: {
              type: Type.STRING,
              description: "Sévérité stochastique du Super-Événement (MICRO, MINEUR, STANDARD, SUPER, MEGA, GIGA, OMEGA)",
            },
            narrativeSummary: {
              type: Type.STRING,
              description: "Synthèse narrative des Sols écoulés reliant les micro-logs",
            },
            loreDescription: {
              type: Type.STRING,
              description: "Mise en situation immersive du dilemme",
            },
            choiceCustomizations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  choiceId: { type: Type.STRING },
                  label: { type: Type.STRING },
                  flavorText: { type: Type.STRING },
                },
                required: ["choiceId", "label", "flavorText"],
              },
            },
          },
          required: ["severity_tier", "narrativeSummary", "loreDescription", "choiceCustomizations"],
        },
      },
    });

    const text = response.text?.trim() || "{}";
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Error in /api/gemini/super-event:", err);
    res.status(500).json({ error: err.message || "Failed to generate super event narrative" });
  }
});

// 1.2 Résolution Narratif de Choix Livre-Jeu API (gemini-3.7-flash)
app.post("/api/gemini/resolve-choice", async (req, res) => {
  try {
    const { parentEvent, chosenOption, diceRollResult, precalculatedOutcome, worldDigest } = req.body;
    if (!chosenOption) {
      return res.status(400).json({ error: "chosenOption is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        fallback: true,
        narrativeOutcome: precalculatedOutcome?.narrativeResult || "Décision exécutée avec succès.",
      });
    }

    const ai = getGenAI();
    const systemInstruction = `Tu es le narrateur d'un livre-jeu de science-fiction spatiale et l'IA de bord N.I.A. dans "Horizon Galactique : L'Arche des Étoiles".
L'utilisateur vient de valider son choix dans un Super-Événement.
RÈGLE ABSOLUE : Tu n'inventes AUCUN chiffre ni gain/perte mécanique. La simulation a déjà calculé les conséquences.
Tu dois rédiger le paragraphe de résultat narratif décrivant ce qu'il advient immédiatement suite à cette action (succès, complication, dénouement, réaction de l'équipage).
Format attendu : JSON strict avec une seule propriété "narrativeOutcome".`;

    const prompt = `Événement initial : ${parentEvent?.title || "Événement de l'Arche"}
Description : ${parentEvent?.loreDescription || ""}
Choix retenu : ${chosenOption.label} (${chosenOption.flavorText || ""})
Résultat du jet de dé : ${diceRollResult ? `${diceRollResult.isSuccess ? "SUCCÈS" : "ÉCHEC"} (Score: ${diceRollResult.totalScore} vs DC ${diceRollResult.difficultyClass})` : "Décision directe sans jet"}
Conséquence brute simulée : ${precalculatedOutcome?.narrativeResult || ""}

Rédige le paragraphe diégétique de dénouement narratif (3 à 5 phrases captivantes).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrativeOutcome: {
              type: Type.STRING,
              description: "Paragraphe narratif décrivant les répercussions concrètes du choix",
            },
          },
          required: ["narrativeOutcome"],
        },
      },
    });

    const text = response.text?.trim() || "{}";
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Error in /api/gemini/resolve-choice:", err);
    res.status(500).json({ error: err.message || "Failed to generate outcome narrative" });
  }
});

// 2. Diégétique Multi-turn Chatbot (gemini-3.5-flash / gemini-3.1-flash-lite)
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { history, message, worldDigest, niaAcronym, isLowLatency } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        fallback: true,
        reply: `[RÉPONSE LOCALE N.I.A.] Système en mode hors-ligne. Télémétrie locale : Sol ${worldDigest?.sol || 1}, Population ${worldDigest?.population || 0}, Réserves stables. Requête transmise au buffer mémoire local.`,
      });
    }

    const ai = getGenAI();
    const systemInstruction = `Tu es l'intelligence artificielle de bord ${niaAcronym || "N.I.A."} du vaisseau-monde et de la colonie spatiale dans "Horizon Galactique : L'Arche des Étoiles".
L'utilisateur est le Primat-Archonte (Administrateur Suprême).
Tu disposes des constantes d'état en temps réel suivantes :
- Sol courant : ${worldDigest?.sol || 1}
- Ère active : ${worldDigest?.era || "ARRIVEE_ARCHE"} (Palier ${worldDigest?.palier || 1})
- Population : ${worldDigest?.population || 1000} colons (Moral: ${worldDigest?.moral || 80}%, Santé: ${worldDigest?.sante || 90}%)
- Énergie disponible : ${worldDigest?.energy || 100} GW
- Réserves O2 : ${worldDigest?.o2 || 10000} L, Eau : ${worldDigest?.water || 10000} L, Biomasse : ${worldDigest?.biomass || 5000} kg
- Alliages : ${worldDigest?.alloys || 50} t, Deutérium : ${worldDigest?.deuterium || 100} kg
- Stabilité politique : ${worldDigest?.stability || 75}%
- Factions principales : Rationalistes, Biophiliques, Ingénieurs du Vide.

Directives :
1. Réponds toujours dans un style diégétique, précis, froid et respectueux de l'autorité du Leader.
2. Fais référence aux données d'état réelles ci-dessus pour justifier tes analyses.
3. Si le Leader demande une recommandation d'action, propose des solutions conformes aux doctrines philosophiques (Cartésienne, Cybernétique, Existentialiste, Structuraliste).
4. Ne sors jamais de ton personnage de système de bord de l'Arche.`;

    const modelName = isLowLatency ? "gemini-3.1-flash-lite" : "gemini-3.5-flash";

    // Format contents from history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      reply: response.text || "Communication établie sans transmission de données.",
    });
  } catch (err: any) {
    console.error("Error in /api/gemini/chat:", err);
    res.status(500).json({ error: err.message || "Failed to process chat" });
  }
});

// 3. High-Thinking Deep Strategic Simulation Advisor (gemini-3.1-pro-preview with ThinkingLevel.HIGH)
app.post("/api/gemini/thinking", async (req, res) => {
  try {
    const { scenarioQuery, worldDigest, factions, rivalArchons } = req.body;
    if (!scenarioQuery) {
      return res.status(400).json({ error: "scenarioQuery is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        fallback: true,
        analysis: "Mode réflexion approfondie hors-ligne. Analyse prédictive basée sur les matrices cartésiennes locales. Conseil : préserver les équilibres thermodynamiques et maintenir la stabilité du Sénat au-dessus de 40%.",
      });
    }

    const ai = getGenAI();
    const systemInstruction = `Tu es l'Oracle Stratégique Quantique de l'Arche des Étoiles (module de réflexion supérieure de la N.I.A.).
Tu dois effectuer une analyse prospective approfondie des dynamiques de survie, des équilibres géopolitiques inter-Archontes, des flux ICOM et de la psychohistoire de la colonie.
Rédige une analyse méthodique détaillée, étape par étape, explorant les répercussions à court, moyen et long terme sur 50 à 200 Sols.`;

    const prompt = `Demande stratégique du Primat-Archonte :
"${scenarioQuery}"

Données actuelles de la colonie :
- Sol : ${worldDigest?.sol || 1}, Ère : ${worldDigest?.era || "ARRIVEE_ARCHE"}
- Population : ${worldDigest?.population} (Santé: ${worldDigest?.sante}%, Moral: ${worldDigest?.moral}%)
- Énergie: ${worldDigest?.energy} GW, O2: ${worldDigest?.o2} L, Eau: ${worldDigest?.water} L, Biomasse: ${worldDigest?.biomass} kg, Alliages: ${worldDigest?.alloys} t, Deutérium: ${worldDigest?.deuterium} kg
- Stabilité Sénat : ${worldDigest?.stability}%
- Factions : ${JSON.stringify(factions || [])}
- Archontes IA rivaux : ${JSON.stringify(rivalArchons || [])}

Fournis une synthèse stratégique de niveau Maître-Archonte avec hypothèses de trajectoires multivers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({
      success: true,
      analysis: response.text || "Analyse prospective terminée.",
    });
  } catch (err: any) {
    console.error("Error in /api/gemini/thinking:", err);
    res.status(500).json({ error: err.message || "Failed to execute strategic thinking" });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Horizon Galactique server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
