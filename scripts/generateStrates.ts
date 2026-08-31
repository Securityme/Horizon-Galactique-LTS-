import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

interface GitHubStatus {
  implementation: 'PARTIAL' | 'NOT_IMPLEMENTED' | 'IMPLEMENTED' | 'BLOCKED' | 'NOT_DEFINED';
  file: string | null;
  commit: string | null;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  estimated_hours: number;
  assigned_to: string | null;
  start_date: string | null;
  due_date: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'BACKLOG';
  blocked_by: string | null;
  dependencies: string[];
}

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
  github_status: GitHubStatus;
}

function getStrateInfo(id: number): {
  famille: string;
  famille_abstraite: string;
  designation: string;
  mission_rang: string;
  theme_activation: string | null;
  lot: string;
  ere: number;
  maturite: string;
  activation: string;
  origine_v402: string | null;
} {
  const S = Math.floor(id / 196);
  const R = Math.floor((id % 196) / 49);
  const F = Math.floor((id % 49) / 7);
  const P = id % 7;
  const roles = ['Base', 'Entree', 'Mesure', 'Agregat', 'Signal', 'Norme', 'Conteneur'];
  const role = roles[P];

  // S01 - Viewport Master
  if (S === 0) {
    if (R === 0) {
      // CANON
      if (F === 0) {
        return {
          famille: 'Base and saisie',
          famille_abstraite: 'Primitive',
          designation: 'Prim UI ' + role,
          mission_rang: 'Canon scelle, designation concue a la main.',
          theme_activation: null,
          lot: 'L1',
          ere: 1,
          maturite: 'SCELLE',
          activation: 'ACTIF',
          origine_v402: id < 7 ? 'V40.2 #' + String(id).padStart(3, '0') : null
        };
      } else if (F === 1) {
        return {
          famille: 'Design system tokens',
          famille_abstraite: 'Contrat',
          designation: 'DS ' + role,
          mission_rang: 'Canon scelle, designation concue a la main.',
          theme_activation: null,
          lot: 'L1',
          ere: 1,
          maturite: 'SCELLE',
          activation: 'ACTIF',
          origine_v402: id < 14 ? 'V40.2 #' + String(id).padStart(3, '0') : null
        };
      } else if (F === 2) {
        return {
          famille: 'Typographie and echelles',
          famille_abstraite: 'Cinetique',
          designation: role === 'Base' ? 'Font HUD' : role,
          mission_rang: 'Canon scelle, designation concue a la main.',
          theme_activation: null,
          lot: 'L1',
          ere: 1,
          maturite: 'SCELLE',
          activation: 'ACTIF',
          origine_v402: id < 21 ? 'V40.2 #' + String(id).padStart(3, '0') : null
        };
      } else if (F === 3) {
        return {
          famille: 'Motion and transitions',
          famille_abstraite: 'Structure',
          designation: role === 'Base' ? 'Presets de motion' : 'Animation de ' + role.toLowerCase(),
          mission_rang: 'Canon scelle, designation concue a la main.',
          theme_activation: null,
          lot: 'L1',
          ere: 1,
          maturite: 'SCELLE',
          activation: 'ACTIF',
          origine_v402: id < 28 ? 'V40.2 #' + String(id).padStart(3, '0') : null
        };
      } else if (F === 4) {
        return {
          famille: 'Grille and espacement',
          famille_abstraite: 'Effet',
          designation: 'Grid ' + role.toLowerCase(),
          mission_rang: 'Canon scelle, designation concue a la main.',
          theme_activation: null,
          lot: 'L1',
          ere: 1,
          maturite: 'SCELLE',
          activation: 'ACTIF',
          origine_v402: id < 35 ? 'V40.2 #' + String(id).padStart(3, '0') : null
        };
      } else if (F === 5) {
        return {
          famille: 'Effets and glassmorphisme',
          famille_abstraite: 'Adaptation',
          designation: 'FX ' + role.toLowerCase(),
          mission_rang: 'Canon scelle, designation concue a la main.',
          theme_activation: null,
          lot: 'L1',
          ere: 1,
          maturite: 'SCELLE',
          activation: 'ACTIF',
          origine_v402: id < 42 ? 'V40.2 #' + String(id).padStart(3, '0') : null
        };
      } else if (F === 6) {
        return {
          famille: 'Adaptateurs viewport',
          famille_abstraite: 'Gouvernance',
          designation: 'Adaptateur ' + role.toLowerCase(),
          mission_rang: 'Canon scelle, designation concue a la main.',
          theme_activation: null,
          lot: 'L1',
          ere: 1,
          maturite: 'SCELLE',
          activation: 'ACTIF',
          origine_v402: id < 49 ? 'V40.2 #' + String(id).padStart(3, '0') : null
        };
      }
    } else if (R === 1) {
      // EXTENSION
      if (id < 70) {
        return {
          famille: 'Rendu Canvas 2D de secours',
          famille_abstraite: 'Primitive',
          designation: 'Canvas2D ' + role,
          mission_rang: 'Chemins de repli du rendu: Canvas 2D de secours, fort contraste A11y.',
          theme_activation: 'Quartiers residentiels and maintien social',
          lot: 'L3',
          ere: 3,
          maturite: 'CONCU',
          activation: 'VERROUILLE jusqu a L3',
          origine_v402: null
        };
      } else if (id < 91) {
        return {
          famille: 'Surcharge dynamique des tokens Dark Neon',
          famille_abstraite: 'Contrat',
          designation: 'TokenHC ' + role,
          mission_rang: 'Chemins de repli du rendu: fort contraste A11y.',
          theme_activation: 'Quartiers residentiels and maintien social',
          lot: 'L3',
          ere: 3,
          maturite: 'CONCU',
          activation: 'VERROUILLE jusqu a L3',
          origine_v402: null
        };
      } else {
        return {
          famille: 'Replis typographiques vectoriels',
          famille_abstraite: 'Cinetique',
          designation: 'FontFallback ' + role,
          mission_rang: 'Chemins de repli du rendu: replis typographiques.',
          theme_activation: 'Quartiers residentiels and maintien social',
          lot: 'L3',
          ere: 3,
          maturite: 'CONCU',
          activation: 'VERROUILLE jusqu a L3',
          origine_v402: null
        };
      }
    }
  }

  // Other sectors (S02-S16) - Placeholder
  return {
    famille: 'TBD',
    famille_abstraite: 'TBD',
    designation: 'STR-' + id,
    mission_rang: 'A definir',
    theme_activation: null,
    lot: 'L2',
    ere: 2,
    maturite: 'CONCU',
    activation: 'VERROUILLE jusqu a L2',
    origine_v402: null
  };
}

function generateGitHubStatus(id: number, currentCommit: string): GitHubStatus {
  const priority = id < 6 ? 'P0' : id < 14 ? 'P0' : id < 49 ? 'P1' : id < 196 ? 'P2' : 'P3';
  const estimated_hours = id < 6 ? 8 : id < 14 ? 12 : id < 49 ? 6 : id < 196 ? 4 : 2;
  const status = id < 6 ? 'TODO' : id < 49 ? 'TODO' : id < 196 ? 'BACKLOG' : 'BACKLOG';
  const implementation = id < 6 ? 'PARTIAL' : id < 49 ? 'NOT_IMPLEMENTED' : 'NOT_DEFINED';
  const blocked_by = id >= 49 && id < 196 ? 'L3_maturity' : null;

  // Map known files
  const fileMap: Record<number, string> = {
    0: 'package.json',
    2: 'd3',
    3: 'motion',
    4: 'lucide-react',
    5: 'tailwindcss',
    6: 'vite.config.ts',
    7: 'src/components/DesignSystem/Base.tsx',
    8: 'src/components/DesignSystem/Input.tsx',
    9: 'src/components/DesignSystem/Gauges.tsx',
    10: 'src/components/DesignSystem/MuChart.tsx',
    11: 'src/components/DesignSystem/Badges.tsx',
    12: 'src/components/DesignSystem/Norms.tsx',
    13: 'src/components/DesignSystem/Container.tsx'
  };

  const dependencies: string[] = [];
  if (id > 0) {
    const prevId = id - 1;
    const prevS = Math.floor(prevId / 196);
    const prevR = Math.floor((prevId % 196) / 49);
    const prevF = Math.floor((prevId % 49) / 7);
    const prevP = prevId % 7;
    dependencies.push("STR-" + String(prevS + 1).padStart(2, '0') + "." +
                     String(prevR).padStart(2, '0') + "." +
                     String(prevF).padStart(2, '0') + "." +
                     String(prevP).padStart(2, '0'));
  }

  return {
    implementation,
    file: fileMap[id] || null,
    commit: id < 14 ? currentCommit : null,
    priority: priority as 'P0' | 'P1' | 'P2' | 'P3',
    estimated_hours,
    assigned_to: 'Securityme',
    start_date: null,
    due_date: null,
    status: status as 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'BACKLOG',
    blocked_by,
    dependencies
  };
}

function generateStrates(): void {
  const strates: Strate[] = [];
  const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();

  for (let id = 0; id < 3136; id++) {
    const S = Math.floor(id / 196);
    const R = Math.floor((id % 196) / 49);
    const F = Math.floor((id % 49) / 7);
    const P = id % 7;

    const str = "STR-" + String(S + 1).padStart(2, '0') + "." +
                String(R).padStart(2, '0') + "." +
                String(F).padStart(2, '0') + "." +
                String(P).padStart(2, '0');

    const roles = ['Base', 'Entree', 'Mesure', 'Agregat', 'Signal', 'Norme', 'Conteneur'];
    const role = roles[P];

    const info = getStrateInfo(id);

    // Generate chemin_src
    let chemin_src: string | null = null;
    if (S === 0 && R === 0) {
      const familleClean = info.famille.replace(/[& ]/g, '_').replace(/[e]/g, 'e');
      chemin_src = '/src/components/' + familleClean + '/' + role + '/index.tsx';
    } else if (S === 0 && R === 1) {
      chemin_src = '/src/components/Resilience/' + info.famille.replace(/[()& ]/g, '_') + '/' + role + '/index.tsx';
    }

    // Generate tags
    const tags = ['github-integration'];
    if (id < 49) tags.push('phase-1');
    else if (id < 196) tags.push('phase-2');
    else tags.push('phase-3');
    tags.push('priority-' + generateGitHubStatus(id, currentCommit).priority.toLowerCase());
    if (info.activation?.includes('VERROUILLE')) tags.push('blocked');

    strates.push({
      id,
      str,
      quadrant: 'D',
      master: 'VIEWPORT-MASTER',
      secteur: 'S' + String(S + 1).padStart(2, '0'),
      sous_quadrant: 'D-A',
      rang: S === 0 && R === 0 ? 'CANON' : S === 0 && R === 1 ? 'EXTENSION' : 'CANON',
      rang_nom: S === 0 && R === 0 ? 'CANON' : S === 0 && R === 1 ? 'Extension and resilience UI' : 'CANON',
      famille: info.famille,
      famille_abstraite: info.famille_abstraite,
      role,
      designation: info.designation,
      mission_rang: info.mission_rang,
      theme_activation: info.theme_activation,
      lot: info.lot,
      ere: info.ere,
      maturite: info.maturite,
      activation: info.activation,
      origine_v402: info.origine_v402,
      chemin_src,
      proprietaire: 'Securityme',
      tags,
      github_status: generateGitHubStatus(id, currentCommit)
    });

    // Log progress every 100 strates
    if (id % 100 === 0) {
      console.log('Generated strate', id);
    }
  }

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
        commits: 20,
        issues: 97,
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
    strates
  };

  writeFileSync('./strates/strates_3136_v41_updated.json', JSON.stringify(finalJson, null, 2));
  console.log('Successfully generated 3136 strates!');
  console.log('File: strates/strates_3136_v41_updated.json');
}

generateStrates();
