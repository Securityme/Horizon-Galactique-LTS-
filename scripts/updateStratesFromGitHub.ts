import { readFileSync, writeFileSync } from 'fs';

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

function updateStratesFromGitHub(): void {
  const jsonPath = './strates/strates_3136_v41_updated.json';
  const data: StratesJson = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  console.log('Updating strates from GitHub...');
  console.log("Total strates: " + data.strates.length);
  
  const byPriority: Record<string, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  const byStatus: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0, BLOCKED: 0, BACKLOG: 0 };

  data.strates.forEach((strate) => {
    byPriority[strate.github_status.priority]++;
    byStatus[strate.github_status.status]++;
  });

  console.log('By Priority:', byPriority);
  console.log('By Status:', byStatus);
  
  writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log('Strates updated from GitHub');
}

updateStratesFromGitHub();
