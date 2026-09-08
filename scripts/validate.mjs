import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'index.html',
  'assets/css/styles.css',
  'assets/js/main.js',
  'assets/images/fallback.svg',
  'assets/audio/dom-quixote.wav',
  'assets/audio/always.wav',
  'assets/audio/fallen-star.wav'
];

for (const file of requiredFiles) {
  const absolutePath = path.join(root, file);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Arquivo obrigatório ausente: ${file}`);
  }
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const requiredSnippets = [
  '<meta name="description"',
  'property="og:title"',
  'name="twitter:card"',
  'loading="lazy"',
  'assets/js/main.js',
  '<main class="container">'
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet)) {
    throw new Error(`index.html sem trecho esperado: ${snippet}`);
  }
}

console.log('Validação básica concluída com sucesso.');
