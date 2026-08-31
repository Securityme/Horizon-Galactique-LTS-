import { readFileSync, writeFileSync } from 'fs';
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
  github_status: GitHubStatus;
}

interface StratesJson {
  strates: Strate[];
  github_integration: {
    current_status: {
      commits: number;
      branches: number;
      last_commit?: string;
      analysis_date: string;
    };
  };
}

function syncGitHubStatus(): void {
  const jsonPath = './strates/strates_3136_v41_updated.json';
  const data: StratesJson = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  try {
    const files = execSync('git ls-files', { encoding: 'utf-8' }).trim().split('
');
    const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const commitCount = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim());
    const branchCount = parseInt(execSync('git branch --list | wc -l', { encoding: 'utf-8' }).trim());

    data.github_integration.current_status.commits = commitCount;
    data.github_integration.current_status.branches = branchCount;
    data.github_integration.current_status.last_commit = currentCommit;
    data.github_integration.current_status.analysis_date = new Date().toISOString();

    data.strates.forEach((strate) => {
      if (strate.github_status && strate.github_status.file) {
        if (files.includes(strate.github_status.file)) {
          strate.github_status.implementation = 'IMPLEMENTED';
          strate.github_status.status = 'DONE';
          strate.github_status.commit = currentCommit;
        }
      }

      if (strate.id < 49 && strate.github_status.status === 'TODO' && files.some(f => f.includes('PrimUI') || f.includes('DesignSystem'))) {
        strate.github_status.status = 'IN_PROGRESS';
      }
    });

    writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log('GitHub status synchronized successfully');
    console.log("Updated " + data.strates.length + " strates");
    console.log("Current commit: " + currentCommit);
    console.log("Branches: " + branchCount);
    console.log("Commits: " + commitCount);

  } catch (error) {
    console.error('Error syncing GitHub status:', error);
    process.exit(1);
  }
}

syncGitHubStatus();
