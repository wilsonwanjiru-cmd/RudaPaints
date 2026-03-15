require('dotenv').config();
const mongoose = require('mongoose');
const Paint = require('../models/Paint');
const cloudinary = require('../config/cloudinary').cloudinary;
const fs = require('fs');
const path = require('path');

const migrateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const paints = await Paint.find({ image: { $regex: '^/uploads/' } });
    console.log(`Found ${paints.length} paints with local images.`);

    for (const paint of paints) {
      const localPath = path.join(__dirname, '../uploads', path.basename(paint.image));
      if (!fs.existsSync(localPath)) {
        console.log(`File not found: ${localPath}`);
        continue;
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(localPath, {
        folder: 'ruda-paints',
        public_id: `${paint._id}-${Date.now()}`,
      });

      // Update paint with Cloudinary URL
      paint.image = result.secure_url;
      await paint.save();
      console.log(`Updated ${paint.name} -> ${result.secure_url}`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateImages();