const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Please provide a module name! Example: node generate-module.js user");
  process.exit(1);
}

// Define the directory path
const dir = path.join(__dirname, 'src', 'app', 'modules', moduleName);

// Define the files to create
const files = [
  `${moduleName}.controller.ts`,
  `${moduleName}.validation.ts`,
  `${moduleName}.service.ts`, // Fixed typo from 'services' to 'service' for consistency
  `${moduleName}.utils.ts`,
  `${moduleName}.constants.ts`,
  `${moduleName}.interface.ts`, // Standard in Next Level Web Dev
  `${moduleName}.route.ts`
];

// Create the directory
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Create each file with basic boilerplate
files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `// ${file} generated\n`, 'utf8');
    console.log(`Created: ${file}`);
  } else {
    console.warn(`Skipped: ${file} (already exists)`);
  }
});

console.log(`\nSuccessfully generated [${moduleName}] module! 🚀`);