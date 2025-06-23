import fs from 'fs';
import path from 'path';

// Path to the index.html file
const indexPath = path.resolve('dist/public/index.html');

// Read the file
let content = fs.readFileSync(indexPath, 'utf8');

// Replace all occurrences of "./assets/" with "assets/"
content = content.replace(/\.\/assets\//g, 'assets/');

// Write the file back
fs.writeFileSync(indexPath, content);

console.log('Successfully fixed asset paths in index.html');
