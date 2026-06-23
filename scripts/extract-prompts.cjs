const fs = require('fs');
const path = require('path');

const questionsDir = path.join(__dirname, '..', 'quantguide-hard-index', 'questions');
const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.md'));

const prompts = {};

for (const file of files) {
  const slug = file.replace('.md', '');
  const content = fs.readFileSync(path.join(questionsDir, file), 'utf-8');
  const promptMatch = content.match(/## Prompt\s*\n([\s\S]*)/);
  if (promptMatch) {
    prompts[slug] = promptMatch[1].trim();
  }
}

const outPath = path.join(__dirname, '..', 'src', 'data', 'quant-prompts.json');
fs.writeFileSync(outPath, JSON.stringify(prompts, null, 2));
console.log(`Extracted ${Object.keys(prompts).length} prompts to ${outPath}`);
