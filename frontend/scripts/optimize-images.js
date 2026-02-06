const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🖼️  Starting image optimization...');

// Define image directories
const imageDirs = [
  path.join(__dirname, '../public'),
  path.join(__dirname, '../src/assets'),
];

// Check if ImageMagick is installed
try {
  execSync('which convert', { stdio: 'pipe' });
  console.log('✅ ImageMagick found');
} catch (error) {
  console.log('⚠️  ImageMagick not found. Install it with: sudo apt-get install imagemagick');
  console.log('📦 Or install via npm: npm install -g imagemin-cli');
  process.exit(1);
}

// Function to optimize images
const optimizeImages = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      optimizeImages(filePath);
    } else {
      const ext = path.extname(file).toLowerCase();
      
      if (imageExtensions.includes(ext)) {
        try {
          // Create optimized version
          const optimizedPath = filePath.replace(/(\.[\w\d]+)$/, '-optimized$1');
          
          // Use ImageMagick to optimize
          if (ext === '.jpg' || ext === '.jpeg') {
            execSync(`convert "${filePath}" -sampling-factor 4:2:0 -strip -quality 85 -interlace JPEG -colorspace sRGB "${optimizedPath}"`);
          } else if (ext === '.png') {
            execSync(`convert "${filePath}" -strip -quality 85 "${optimizedPath}"`);
          }
          
          // Replace original with optimized if smaller
          const originalSize = stat.size;
          const optimizedSize = fs.statSync(optimizedPath).size;
          
          if (optimizedSize < originalSize) {
            fs.renameSync(optimizedPath, filePath);
            console.log(`✅ Optimized: ${filePath} (${(originalSize/1024).toFixed(2)}KB → ${(optimizedSize/1024).toFixed(2)}KB)`);
          } else {
            fs.unlinkSync(optimizedPath);
            console.log(`⚠️  Skipped (already optimal): ${filePath}`);
          }
        } catch (error) {
          console.log(`❌ Error optimizing ${filePath}:`, error.message);
        }
      }
    }
  });
};

// Optimize images in all directories
imageDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`🔍 Scanning directory: ${dir}`);
    optimizeImages(dir);
  }
});

console.log('🎉 Image optimization complete!');