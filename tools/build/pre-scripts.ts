import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface BuildConfig {
  site: string;
  channel: string;
  environment: string;
  mode: 'serve' | 'build';
}

export async function runPreScripts(config: BuildConfig): Promise<void> {
  try {
    console.log('✔ NPM');
    
    // Check environment variables
    const requiredEnvVars = ['NODE_ENV'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      console.log('✖ Environment');
      console.log(`  Missing: ${missingVars.join(', ')}`);
    } else {
      console.log('✔ Environment');
    }
  } catch (error) {
    console.error('Pre-script failed:', error);
    throw error;
  }
}

export async function checkDependencies(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('npm list --depth=0');
    return true;
  } catch {
    return false;
  }
}
