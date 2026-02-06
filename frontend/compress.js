const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const buildPath = path.join(__dirname, 'build');

// Gzip compression
const compressFile = (filePath) => {
  const content = fs.readFileSync(filePath);
  const compressed = zlib.gzipSync(content);
  fs.writeFileSync(`${filePath}.gz`, compressed);
};

// Brotli compression
const brotliCompressFile = (filePath) => {
  const content = fs.readFileSync(filePath);
  const compressed = zlib.brotliCompressSync(content);
  fs.writeFileSync(`${filePath}.br`, compressed);
};

const walkDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (
      file.endsWith('.js') || 
      file.endsWith('.css') || 
      file.endsWith('.html') ||
      file.endsWith('.json')
    ) {
      console.log(`Compressing: ${filePath}`);
      compressFile(filePath);
      brotliCompressFile(filePath);
    }
  });
};

console.log('Starting compression...');
walkDir(buildPath);
console.log('Compression complete!');