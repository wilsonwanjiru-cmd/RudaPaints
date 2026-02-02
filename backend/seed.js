const mongoose = require('mongoose');
const Paint = require('./models/Paint');
require('dotenv').config();

const samplePaints = [
    {
        name: "Premium Interior Emulsion",
        category: "Interior",
        brand: "Ruda Paints",
        size: "4L",
        price: 4500,
        description: "High-quality interior wall paint with excellent coverage",
        features: ["Washable", "Low VOC", "Quick Drying"]
    },
    {
        name: "Weatherproof Exterior Paint",
        category: "Exterior",
        brand: "Ruda Paints",
        size: "5L",
        price: 6500,
        description: "Durable exterior paint resistant to weather conditions",
        features: ["UV Resistant", "Waterproof", "Mold Resistant"]
    },
    {
        name: "Universal Primer",
        category: "Primer",
        brand: "Ruda Paints",
        size: "4L",
        price: 3500,
        description: "Multi-surface primer for better paint adhesion",
        features: ["Quick Drying", "Seals Surfaces", "Improves Coverage"]
    },
    {
        name: "Gloss Enamel Paint",
        category: "Enamel",
        brand: "Ruda Paints",
        size: "1L",
        price: 1800,
        description: "High gloss finish for wood and metal surfaces",
        features: ["High Shine", "Durable", "Easy to Clean"]
    },
    {
        name: "Clear Varnish",
        category: "Varnish",
        brand: "Ruda Paints",
        size: "1L",
        price: 2200,
        description: "Protective clear coat for wooden surfaces",
        features: ["Transparent", "Water Resistant", "Enhances Grain"]
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ruda_paints');
        console.log('Connected to database');
        
        // Clear existing data
        await Paint.deleteMany({});
        console.log('Cleared existing paints');
        
        // Insert sample data
        await Paint.insertMany(samplePaints);
        console.log('Added sample paints');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();

// wilsonmuita41_db_user  - Username
// DTnnqtm5yfozCOjZ  - PassWord
