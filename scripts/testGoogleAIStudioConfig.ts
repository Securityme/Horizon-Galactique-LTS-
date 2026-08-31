import { readFileSync } from 'fs';

function testGoogleAIStudioConfig(): void {
  console.log('Testing Google AI Studio integration configuration...
');

  // Check environment variables
  const envVars = [
    'GOOGLE_AI_STUDIO_API_KEY',
    'GOOGLE_AI_STUDIO_PROJECT_ID',
    'GOOGLE_AI_STUDIO_DATASET_ID',
    'GOOGLE_CLOUD_PROJECT_ID'
  ];

  console.log('=== Environment Variables ===');
  envVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅ SET' : '❌ NOT SET';
    console.log(`${varName}: ${status}`);
  });

  // Check config file
  console.log('
=== Configuration Files ===');
  const configFiles = [
    './google-ai-studio.config.json',
    './strates/strates_3136_v41_updated.json',
    './.env.example'
  ];

  configFiles.forEach(filePath => {
    try {
      const stats = require('fs').statSync(filePath);
      console.log(`${filePath}: ✅ EXISTS (${stats.size} bytes)`);
    } catch (error) {
      console.log(`${filePath}: ❌ NOT FOUND`);
    }
  });

  // Check strates data
  console.log('
=== Strates Data ===');
  try {
    const data = JSON.parse(readFileSync('./strates/strates_3136_v41_updated.json', 'utf-8'));
    console.log(`Total Strates: ${data.total}`);
    console.log(`Defined Strates: ${data.strates.length}`);
    
    const byPriority: Record<string, number> = {};
    data.strates.forEach((s: any) => {
      byPriority[s.github_status.priority] = (byPriority[s.github_status.priority] || 0) + 1;
    });
    console.log('By Priority:', byPriority);

    const byStatus: Record<string, number> = {};
    data.strates.forEach((s: any) => {
      byStatus[s.github_status.status] = (byStatus[s.github_status.status] || 0) + 1;
    });
    console.log('By Status:', byStatus);

    console.log('
✅ Configuration test complete!');
    console.log('
Next steps:');
    console.log('1. Set environment variables');
    console.log('2. Add secrets to GitHub Actions');
    console.log('3. Run: bun run sync:google-ai-studio');

  } catch (error) {
    console.error('❌ Error reading strates data:', error.message);
    process.exit(1);
  }
}

testGoogleAIStudioConfig();
