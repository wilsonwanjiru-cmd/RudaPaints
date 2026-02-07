// frontend/scripts/generate-verification.js
const fs = require('fs');
const path = require('path');

const generateVerificationFile = () => {
  console.log('🔧 Generating Google Search Console verification file...');
  
  const verificationContent = 'google-site-verification: googleea6c0f24382c1950';
  
  const publicDir = path.join(__dirname, '..', 'public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(publicDir, 'googleea6c0f24382c1950.html'), 
    verificationContent
  );
  
  console.log('✅ Google verification file created at:', path.join(publicDir, 'googleea6c0f24382c1950.html'));
  
  // Also create in build directory for production
  const buildDir = path.join(__dirname, '..', 'build');
  if (fs.existsSync(buildDir)) {
    fs.writeFileSync(
      path.join(buildDir, 'googleea6c0f24382c1950.html'), 
      verificationContent
    );
    console.log('✅ Google verification file created at:', path.join(buildDir, 'googleea6c0f24382c1950.html'));
  }
};

if (require.main === module) {
  generateVerificationFile();
}

module.exports = generateVerificationFile;