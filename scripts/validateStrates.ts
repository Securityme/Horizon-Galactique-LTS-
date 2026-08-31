import { readFileSync } from 'fs';

interface GitHubStatus {
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
}

interface Strate {
  id: number;
  str: string;
  github_status: GitHubStatus;
}

interface StratesJson {
  strates: Strate[];
}

function validateStrates(): void {
  const jsonPath = './strates/strates_3136_v41_updated.json';
  const data: StratesJson = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  console.log('Validating strates...');
  
  const errors: string[] = [];
  const warnings: string[] = [];

  data.strates.forEach((strate, index) => {
    if (strate.id !== index) {
      errors.push("Strate " + strate.str + " has inconsistent ID: expected " + index + ", got " + strate.id);
    }

    if (!strate.github_status) {
      errors.push("Strate " + strate.str + " is missing github_status");
    } else {
      const status = strate.github_status;
      if (!['P0', 'P1', 'P2', 'P3'].includes(status.priority)) {
        errors.push("Strate " + strate.str + " has invalid priority: " + status.priority);
      }
      if (!['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED', 'BACKLOG'].includes(status.status)) {
        errors.push("Strate " + strate.str + " has invalid status: " + status.status);
      }
    }

    if (strate.github_status.dependencies) {
      strate.github_status.dependencies.forEach(dep => {
        const depStrate = data.strates.find(s => s.str === dep);
        if (!depStrate) {
          warnings.push("Strate " + strate.str + " depends on non-existent strate: " + dep);
        }
      });
    }
  });

  if (errors.length > 0) {
    console.error('Errors found:');
    errors.forEach(err => console.error('  -', err));
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('Warnings found:');
    warnings.forEach(warn => console.warn('  -', warn));
  }

  console.log('Validation complete. No errors found.');
  console.log("Total strates: " + data.strates.length);
}

validateStrates();
