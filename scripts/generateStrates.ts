import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

interface Strate {
  id: number;
  str: string;
  quadrant: string;
  master: string;
  secteur: string;
  sous_quadrant: string;
  rang: string;
  rang_nom: string;
  famille: string;
  famille_abstraite: string;
  role: string;
  designation: string;
  mission_rang: string;
  theme_activation: string | null;
  lot: string;
  ere: number;
  maturite: string;
  activation: string;
  origine_v402: string | null;
  chemin_src: string | null;
  proprietaire: string | null;
  tags: string[];
  github_status: {
    implementation: string;
    file: string | null;
    commit: string | null;
    priority: string;
    estimated_hours: number;
    assigned_to: string | null;
    start_date: string | null;
    due_date: string | null;
    status: string;
    blocked_by: string | null;
    dependencies: string[];
  };
}

function generateStrates(): void {
  const strates: Strate[] = [];
  const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();

  // Generate all 3136 strates
  for (let id = 0; id < 3136; id++) {
    const S = Math.floor(id / 196);
    const R = Math.floor((id % 196) / 49);
    const F = Math.floor((id % 49) / 7);
    const P = id % 7;

    const str = `STR-${String(S + 1).padStart(2, '0')}.${String(R).padStart(2, '0')}.${String(F).padStart(2, '0')}.${String(P).padStart(2, '0')}`;

    const roles = ['Base', 'Entrée', 'Mesure', 'Agrégat', 'Signal', 'Norme', 'Conteneur'];
    const role = roles[P];

    // Determine famille based on S, R, F
    let famille = 'TBD';
    let famille_abstraite = 'TBD';
    let designation = `STR-${id}`;
    let mission_rang = 'A définir';
    let theme_activation: string | null = null;
    let lot = 'L1';
    let ere = 1;
    let maturite = 'SCELLÉ';
    let activation = 'ACTIF';
    let origine_v402: string | null = null;

    if (S === 0) {
      if (R === 0) {
        // S01 - Base components
        if (F === 0) {
          famille = 'Base & saisie';
          famille_abstraite = 'Primitive';
          designation = `Prim UI ${role}`;
          mission_rang = 'Canon scellé, désignation conçue à la main.';
          if (id < 7) origine_v402 = `V40.2 #${String(id).padStart(3, '0')}`;
        } else if (F === 1) {
          famille = 'Design system tokens';
          famille_abstraite = 'Contrat';
          designation = `DS ${role}`;
          mission_rang = 'Canon scellé, désignation conçue à la main.';
          if (id < 14) origine_v402 = `V40.2 #${String(id).padStart(3, '0')}`;
        } else if (F === 2) {
          famille = 'Typographie & échelles';
          famille_abstraite = 'Cinétique';
          designation = role === 'Base' ? 'Font HUD' : role;
          mission_rang = 'Canon scellé, désignation conçue à la main.';
          if (id < 21) origine_v402 = `V40.2 #${String(id).padStart(3, '0')}`;
        } else if (F === 3) {
          famille = 'Motion & transitions';
          famille_abstraite = 'Structure';
          designation = role === 'Base' ? 'Presets de motion' : `Animation de ${role.toLowerCase()}`;
          mission_rang = 'Canon scellé, désignation conçue à la main.';
          if (id < 28) origine_v402 = `V40.2 #${String(id).padStart(3, '0')}`;
        } else if (F === 4) {
          famille = 'Grille & espacement';
          famille_abstraite = 'Effet';
          designation = `Grid ${role.toLowerCase()}`;
          mission_rang = 'Canon scellé, désignation conçue à la main.';
          if (id < 35) origine_v402 = `V40.2 #${String(id).padStart(3, '0')}`;
        } else if (F === 5) {
          famille = 'Effets & glassmorphisme';
          famille_abstraite = 'Adaptation';
          designation = `FX ${role.toLowerCase()}`;
          mission_rang = 'Canon scellé, désignation conçue à la main.';
          if (id < 42) origine_v402 = `V40.2 #${String(id).padStart(3, '0')}`;
        } else if (F === 6) {
          famille = 'Adaptateurs viewport';
          famille_abstraite = 'Gouvernance';
          designation = `Adaptateur ${role.toLowerCase()}`;
          mission_rang = 'Canon scellé, désignation conçue à la main.';
          if (id < 49) origine_v402 = `V40.2 #${String(id).padStart(3, '0')}`;
        }
      } else if (R === 1) {
        // S01 - Extension
        famille = id < 70 ? 'Rendu Canvas 2D de secours des boutons et conteneurs atomiques sur échec WebGL2' :
                 id < 91 ? 'Surcharge dynamique des tokens Dark Neon en fort contraste A11y (CARTESIEN_HC)' :
                 'Replis typographiques vectoriels sur retard de chargement des fonts HUD';
        famille_abstraite = id < 70 ? 'Primitive' : id < 91 ? 'Contrat' : 'Cinétique';
        designation = `${famille.split(' ')[0]} ${role}`;
        mission_rang = 'Chemins de repli du rendu : Canvas 2D de secours, fort contraste A11y, dégrafage des animations, désactivation des effets sous contrainte GPU/RAM.';
        theme_activation = 'Quartiers résidentiels & maintien social';
        lot = 'L3';
        ere = 3;
        maturite = 'CONÇU';
        activation = 'VERROUILLÉ jusqu'à L3';
      }
    } else {
      // Other sectors (S02, S03, etc.) - to be defined
      famille = 'TBD';
      famille_abstraite = 'TBD';
      lot = 'L2';
      ere = 2;
    }

    // Generate chemin_src
    let chemin_src: string | null = null;
    if (S === 0 && R === 0) {
      const familleClean = famille.replace(/[& ]/g, '_').replace(/[éè]/g, 'e');
      chemin_src = `/src/components/${familleClean}/${role}/index.tsx`;
    } else if (S === 0 && R === 1) {
      chemin_src = `/src/components/Resilience/${famille.replace(/[()& ]/g, '_')}/${role}/index.tsx`;
    }

    // Generate GitHub status
    const github_status = {
      implementation: id < 6 ? 'PARTIAL' : id < 49 ? 'NOT_IMPLEMENTED' : id < 196 ? 'NOT_DEFINED' : 'NOT_DEFINED',
      file: id === 0 ? 'package.json' :
            id === 2 ? 'd3' :
            id === 3 ? 'motion' :
            id === 4 ? 'lucide-react' :
            id === 5 ? 'tailwindcss' :
            id === 6 ? 'vite.config.ts' : null,
      commit: id < 6 ? currentCommit : null,
      priority: id < 6 ? 'P0' : id < 14 ? 'P0' : id < 49 ? 'P1' : id < 196 ? 'P2' : 'P3',
      estimated_hours: id < 6 ? 8 : id < 14 ? 12 : id < 49 ? 6 : id < 196 ? 4 : 2,
      assigned_to: 'Securityme',
      start_date: null,
      due_date: null,
      status: id < 6 ? 'TODO' : id < 49 ? 'TODO' : 'BACKLOG',
      blocked_by: id >= 49 && id < 196 ? 'L3_maturity' : null,
      dependencies: id > 0 ? [`STR-${String(Math.floor((id - 1) / 196) + 1).padStart(2, '0')}.${String(Math.floor(((id - 1) % 196) / 49)).padStart(2, '0')}.${String(Math.floor(((id - 1) % 49) / 7)).padStart(2, '0')}.${String((id - 1) % 7).padStart(2, '0')}`] : []
    };

    // Add tags
    const tags = ['github-integration'];
    if (id < 49) tags.push('phase-1');
    else if (id < 196) tags.push('phase-2');
    else tags.push('phase-3');

    tags.push(`priority-${github_status.priority.toLowerCase()}`);
    if (github_status.blocked_by) tags.push('blocked');

    strates.push({
      id,
      str,
      quadrant: 'D',
      master: 'VIEWPORT-MASTER',
      secteur: `S${String(S + 1).padStart(2, '0')}`,
      sous_quadrant: 'D-A',
      rang: S === 0 && R === 0 ? 'CANON' : S === 0 && R === 1 ? 'EXTENSION' : 'CANON',
      rang_nom: S === 0 && R === 0 ? 'CANON' : S === 0 && R === 1 ? 'Extension & résilience UI' : 'CANON',
      famille,
      famille_abstraite,
      role,
      designation,
      mission_rang,
      theme_activation,
      lot,
      ere,
      maturite,
      activation,
      origine_v402,
      chemin_src,
      proprietaire: 'Securityme',
      tags,
      github_status
    });
  }

  // Create final JSON
  const finalJson = {
    reference: 'SPEC-MASTER-HG-AE-2026-V41.0-LTS',
    revision: '41.0.2',
    total: 3136,
    adresse: 'STR-S.R.F.P',
    loi: {
      S: 'id//196',
      R: '(id%196)//49',
      F: '(id%49)//7',
      P: 'id%7'
    },
    cadence_hz: 24,
    github_integration: {
      repository: 'Securityme/Horizon-Galactique-LTS-',
      analysis_date: new Date().toISOString(),
      current_status: {
        maturity: 'L1',
        branches: 3,
        commits: 2,
        issues: 0,
        coverage: 0.19,
        compliance_score: 0.45,
        target_maturity: 'L3',
        estimated_completion: '2026-10-15T00:00:00Z'
      },
      technical_stack: {
        frontend: {
          react: '19.0.1',
          typescript: '5.8.2',
          vite: '6.2.3',
          tailwindcss: '4.1.14',
          status: 'CONFIGURED'
        },
        backend: {
          express: '4.21.2',
          firebase: '12.18.0',
          status: 'CONFIGURED'
        },
        ai: {
          google_genai: '2.4.0',
          status: 'INTEGRATED'
        }
      }
    },
    strates: strates
  };

  // Save to file
  writeFileSync('./strates/strates_3136_v41_updated.json', JSON.stringify(finalJson, null, 2));
  console.log('Generated strates_3136_v41_updated.json with 3136 strates');
}

generateStrates();
