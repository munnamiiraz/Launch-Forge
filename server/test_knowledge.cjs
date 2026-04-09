const fs = require('fs');
const path = require('path');

const out = [];
const dataPath = path.resolve(__dirname, 'src/data/data.txt');
out.push('Looking for: ' + dataPath);
out.push('Exists: ' + fs.existsSync(dataPath));

if (fs.existsSync(dataPath)) {
  const content = fs.readFileSync(dataPath, 'utf-8');
  out.push('Size: ' + content.length + ' chars');
  const rawSections = content.split(/={40,}\n(SECTION \d+:[^\n]+)\n={40,}/);
  out.push('Raw parts: ' + rawSections.length);
  for (let i = 1; i < rawSections.length; i += 2) {
    const title = rawSections[i]?.trim() || 'UNTITLED';
    const body = rawSections[i + 1]?.trim() || '';
    if (body) out.push('  Section: ' + title + ' (' + body.length + ' chars)');
  }
  out.push('PARSE OK');
}

fs.writeFileSync(path.resolve(__dirname, 'test_out.txt'), out.join('\n'));
