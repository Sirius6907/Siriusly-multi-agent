import fs from 'node:fs';
fs.cpSync('src/onboarding-assets', 'dist/onboarding-assets', { recursive: true });
