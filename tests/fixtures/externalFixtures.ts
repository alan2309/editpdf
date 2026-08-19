import * as fs from 'fs';
import * as path from 'path';
import { generateExternalFixtures } from './generateExternalFixtures';

const externalDir = path.resolve(__dirname, 'external');

export function ensureExternalFixturesExist(): string {
  if (!fs.existsSync(externalDir) || fs.readdirSync(externalDir).length < 5) {
    // Generate synchronously or run generation
    generateExternalFixtures(externalDir);
  }
  return externalDir;
}

export function loadExternalPdf(filename: string): Uint8Array {
  const filePath = path.join(externalDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fixture not found: ${filePath}`);
  }
  return new Uint8Array(fs.readFileSync(filePath));
}
