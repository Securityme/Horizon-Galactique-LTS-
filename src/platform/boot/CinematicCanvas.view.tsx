import React, { useEffect, useRef } from "react";

interface CinematicCanvasProps {
  progress: number; // 0 to 1
  completedTasks: number; // 0 to 7
  isReducedMotion?: boolean;
}

interface Star {
  x: number;
  y: number;
  layer: number; // 0, 1, 2
  brightness: number;
  baseBrightness: number;
  size: number;
  speed: number;
  birthThreshold: number;
}

export function CinematicCanvas({
  progress,
  completedTasks,
  isReducedMotion = false,
}: CinematicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const dustRef = useRef<{ x: number; y: number; vx: number; vy: number; alpha: number }[]>([]);

  // Initialisation des particules procédurales
  useEffect(() => {
    const starCount = 350;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      const layer = i % 3; // 0: fond, 1: moyen, 2: proche
      stars.push({
        x: Math.random(),
        y: Math.random(),
        layer,
        brightness: 0,
        baseBrightness: 0.3 + Math.random() * 0.7,
        size: layer === 2 ? 1.8 : layer === 1 ? 1.2 : 0.8,
        speed: (layer + 1) * 0.0002,
        birthThreshold: Math.random() * 0.25, // Apparaît entre 0% et 25% de progression
      });
    }
    starsRef.current = stars;

    // Poussière spatiale
    const dust: { x: number; y: number; vx: number; vy: number; alpha: number }[] = [];
    for (let i = 0; i < 40; i++) {
      dust.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0001,
        vy: (Math.random() - 0.5) * 0.0001,
        alpha: 0.1 + Math.random() * 0.2,
      });
    }
    dustRef.current = dust;
  }, []);

  // Rendu de la cinématique
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
      const h = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

      ctx.fillStyle = "#01040a";
      ctx.fillRect(0, 0, w, h);

      if (isReducedMotion) {
        // Mode Reduced Motion : image fixe composée et feux allumés
        drawStars(ctx, w, h, 1);
        drawArk(ctx, w, h, 1, 7, 1);
        return;
      }

      // PLAN A (0 - 0.25) : Étoiles et poussière
      const starProgress = Math.min(1, progress / 0.25);
      drawStars(ctx, w, h, starProgress);
      drawDust(ctx, w, h);

      // PLAN B à D : Effet cosmique de propulsion / saut quantique (Sans dessin de vaisseau)
      if (progress >= 0.2) {
        let zoomFactor = 1;
        let whiteoutAlpha = 0;

        if (progress > 0.85) {
          const zoomProgress = (progress - 0.85) / 0.15; // 0 to 1
          zoomFactor = 1 + zoomProgress * 4; // Accélération stellaire
          if (zoomProgress > 0.7) {
            whiteoutAlpha = (zoomProgress - 0.7) / 0.3; // Fondu blanc de transition
          }
        }

        // Effet de halo et d'énergie quantique centrale
        if (completedTasks > 0) {
          const auraGrad = ctx.createRadialGradient(
            w * 0.5,
            h * 0.5,
            5,
            w * 0.5,
            h * 0.5,
            120 * zoomFactor
          );
          auraGrad.addColorStop(0, "rgba(0, 212, 255, 0.25)");
          auraGrad.addColorStop(0.5, "rgba(120, 0, 255, 0.08)");
          auraGrad.addColorStop(1, "transparent");

          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(w * 0.5, h * 0.5, 120 * zoomFactor, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fondu au blanc très bref en toute fin
        if (whiteoutAlpha > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, whiteoutAlpha * 0.9)})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [progress, completedTasks, isReducedMotion]);

  // Dessin des étoiles
  const drawStars = (ctx: CanvasRenderingContext2D, w: number, h: number, starProgress: number) => {
    const cx = w / 2;
    const cy = h / 2;

    starsRef.current.forEach((star) => {
      // Déplacement parallaxe lent
      star.x += star.speed;
      if (star.x > 1) star.x = 0;

      // Distance au centre pour apparition par vagues
      const sx = star.x * w;
      const sy = star.y * h;
      const distFromCenter = Math.hypot(sx - cx, sy - cy) / Math.hypot(cx, cy);

      // Calcul de l'illumination progressive du centre vers les bords
      let alpha = 0;
      if (starProgress > star.birthThreshold) {
        const localProg = (starProgress - star.birthThreshold) / (1 - star.birthThreshold);
        if (localProg >= distFromCenter * 0.7) {
          alpha = Math.min(1, (localProg - distFromCenter * 0.7) * 2) * star.baseBrightness;
        }
      }

      if (alpha > 0) {
        ctx.fillStyle =
          star.layer === 2
            ? `rgba(200, 240, 255, ${alpha})`
            : star.layer === 1
            ? `rgba(180, 210, 240, ${alpha * 0.8})`
            : `rgba(140, 160, 190, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Léger halo sur les étoiles proches
        if (star.layer === 2 && alpha > 0.6) {
          ctx.fillStyle = `rgba(0, 212, 255, ${alpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  };

  // Dessin de la poussière cosmique
  const drawDust = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    dustRef.current.forEach((d) => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = 1;
      if (d.x > 1) d.x = 0;
      if (d.y < 0) d.y = 1;
      if (d.y > 1) d.y = 0;

      ctx.fillStyle = `rgba(100, 150, 200, ${d.alpha * 0.3})`;
      ctx.fillRect(d.x * w, d.y * h, 1.5, 1.5);
    });
  };

  // Dessin de l'Arche et de ses feux procéduraux
  const drawArk = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    entryProgress: number,
    tasksCount: number,
    zoom: number
  ) => {
    ctx.save();

    // Position centrale de l'Arche
    const targetX = w * 0.5;
    const targetY = h * 0.5;
    const currentX = -w * 0.4 + (targetX + w * 0.4) * Math.sin((entryProgress * Math.PI) / 2);
    const currentY = targetY;

    ctx.translate(currentX, currentY);
    const safeScale = Math.max(0.001, zoom);
    ctx.scale(safeScale, safeScale);

    // Échelle de base de l'Arche
    const arkLength = Math.min(w * 0.75, 720);
    const arkRadius = arkLength * 0.16;

    // 1. Silhouette massive à contre-jour (Corps principal de l'Arche)
    ctx.fillStyle = "#040914";
    ctx.strokeStyle = "rgba(0, 212, 255, 0.15)";
    ctx.lineWidth = 1.5;

    // Coque cylindrique centrale
    ctx.beginPath();
    ctx.roundRect(-arkLength * 0.45, -arkRadius * 0.6, arkLength * 0.8, arkRadius * 1.2, 12);
    ctx.fill();
    ctx.stroke();

    // Anneau de gravité 1 (Secteurs 05-08 Habitat)
    ctx.beginPath();
    ctx.ellipse(
      -arkLength * 0.1,
      0,
      arkRadius * 0.4,
      arkRadius * 1.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#02050e";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 212, 255, 0.25)";
    ctx.stroke();

    // Anneau de gravité 2 (Secteurs 09-12 Cryostase)
    ctx.beginPath();
    ctx.ellipse(
      arkLength * 0.15,
      0,
      arkRadius * 0.35,
      arkRadius * 1.3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#02050e";
    ctx.fill();
    ctx.stroke();

    // Proue blindée (Bouclier déflecteur avant)
    ctx.beginPath();
    ctx.moveTo(arkLength * 0.35, -arkRadius * 0.8);
    ctx.lineTo(arkLength * 0.48, 0);
    ctx.lineTo(arkLength * 0.35, arkRadius * 0.8);
    ctx.closePath();
    ctx.fillStyle = "#050d1e";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 212, 255, 0.3)";
    ctx.stroke();

    // Tuyères de propulsion arrière (Secteurs 01-04)
    ctx.fillStyle = "#030812";
    ctx.fillRect(-arkLength * 0.52, -arkRadius * 0.45, arkLength * 0.1, arkRadius * 0.9);

    // 2. Feux de coque en séquence selon les tâches accomplies (Plan C & D)
    // Tâche 1 : Lueurs de réacteur ionique arrière (Bleu profond)
    if (tasksCount >= 1) {
      const glowGrad = ctx.createRadialGradient(
        -arkLength * 0.52,
        0,
        2,
        -arkLength * 0.52,
        0,
        arkRadius * 0.8
      );
      glowGrad.addColorStop(0, "rgba(0, 212, 255, 0.9)");
      glowGrad.addColorStop(0.5, "rgba(0, 100, 255, 0.3)");
      glowGrad.addColorStop(1, "transparent");

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(-arkLength * 0.52, 0, arkRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tâche 2 : Feux de position sur l'anneau 1 (Cyan)
    if (tasksCount >= 2) {
      ctx.fillStyle = "#00d4ff";
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const px = -arkLength * 0.1 + Math.cos(angle) * (arkRadius * 0.38);
        const py = Math.sin(angle) * (arkRadius * 1.45);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tâche 3 : Hublots des quartiers résidentiels (Ambre chaud)
    if (tasksCount >= 3) {
      ctx.fillStyle = "#f59e0b";
      for (let x = -arkLength * 0.3; x <= arkLength * 0.1; x += 18) {
        ctx.fillRect(x, -arkRadius * 0.4, 4, 2);
        ctx.fillRect(x, arkRadius * 0.38, 4, 2);
      }
    }

    // Tâche 4 : Balises dorsales & communications N.I.A. (Blanc pulsant)
    if (tasksCount >= 4) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, -arkRadius * 0.65, 3, 0, Math.PI * 2);
      ctx.arc(arkLength * 0.2, -arkRadius * 0.65, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tâche 5 : Énergie du bouclier déflecteur avant (Liseré cyan)
    if (tasksCount >= 5) {
      ctx.strokeStyle = "rgba(0, 255, 230, 0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(arkLength * 0.36, -arkRadius * 0.75);
      ctx.lineTo(arkLength * 0.47, 0);
      ctx.lineTo(arkLength * 0.36, arkRadius * 0.75);
      ctx.stroke();
    }

    // Tâche 6 : Feux d'amarrage des hangars (Vert émeraude)
    if (tasksCount >= 6) {
      ctx.fillStyle = "#10b981";
      ctx.fillRect(-arkLength * 0.2, 0, 6, 4);
      ctx.fillRect(-arkLength * 0.05, 0, 6, 4);
    }

    // Tâche 7 : Hublot de passerelle de commandement central (Lumière pure vers laquelle on zoome au Plan D)
    if (tasksCount >= 7) {
      const bridgeGlow = ctx.createRadialGradient(
        arkLength * 0.25,
        0,
        1,
        arkLength * 0.25,
        0,
        25
      );
      bridgeGlow.addColorStop(0, "rgba(255, 255, 255, 1)");
      bridgeGlow.addColorStop(0.3, "rgba(0, 212, 255, 0.8)");
      bridgeGlow.addColorStop(1, "transparent");

      ctx.fillStyle = bridgeGlow;
      ctx.beginPath();
      ctx.arc(arkLength * 0.25, 0, 25, 0, Math.PI * 2);
      ctx.fill();

      // Point focal
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(arkLength * 0.25, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
