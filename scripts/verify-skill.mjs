import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const source = JSON.parse(await readFile('.agents/taste-source.json', 'utf8'));
for (const [relative, expected] of Object.entries(source.files)) {
  const bytes = await readFile(`${source.installedDirectory}/${relative}`);
  if (createHash('sha256').update(bytes).digest('hex') !== expected)
    throw new Error(`Upstream skill differs: ${relative}`);
}
const skill = await readFile(`${source.installedDirectory}/SKILL.md`, 'utf8');
if (!/^name: design-taste-frontend$/m.test(skill)) throw new Error('Skill name not discoverable');
const instructions = await readFile('AGENTS.md', 'utf8');
if (!instructions.includes(`${source.installedDirectory}/SKILL.md`)) throw new Error('Missing project skill instructions');
await access(`${source.installedDirectory}/scripts/gate.mjs`);
console.log(`PASS: design-taste-frontend discoverable at ${source.installedDirectory}; ${Object.keys(source.files).length} upstream files verified (${source.commit}).`);
