import { generateExternalFixtures } from './generateExternalFixtures';
import * as path from 'path';

const outDir = path.resolve(__dirname, 'external');
generateExternalFixtures(outDir).then(() => {
  console.log('Generated external fixtures in:', outDir);
}).catch(err => {
  console.error('Failed to generate external fixtures:', err);
  process.exit(1);
});
