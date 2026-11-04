import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const frontend = fileURLToPath(new URL('../', import.meta.url));
const backend = fileURLToPath(new URL('../../backend/', import.meta.url));
const path = frontend + '.env.local';
const result = spawnSync('php', ['artisan', 'cms:preview-url', '--minutes=10080', '--locale=ar', '--no-ansi'], { cwd: backend, encoding: 'utf8', shell: false });
if (result.status !== 0 || result.error) {
  console.error('Could not generate a preview URL. Check PHP and the Laravel environment.');
  process.exitCode = 1;
} else {
  const url = result.stdout.trim().split(/\r?\n/).at(-1);
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.searchParams.has('signature')) throw new Error('Invalid preview URL');
    let environment = existsSync(path) ? readFileSync(path, 'utf8') : readFileSync(frontend + '.env.example', 'utf8');
    if (/^CMS_PREVIEW_URL=.*$/m.test(environment)) environment = environment.replace(/^CMS_PREVIEW_URL=.*$/m, 'CMS_PREVIEW_URL=' + url);
    else environment += '\nCMS_PREVIEW_URL=' + url + '\n';
    writeFileSync(path, environment, 'utf8');
    console.log('Local draft preview refreshed for seven days. Restart Next.js to load the new environment.');
  } catch {
    console.error('Laravel did not return a valid signed preview URL.');
    process.exitCode = 1;
  }
}
