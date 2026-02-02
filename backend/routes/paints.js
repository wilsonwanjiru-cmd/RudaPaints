const express = require('express');
const router = express.Router();
const Paint = require('../models/Paint');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Helper function to parse features string
const parseFeatures = (featuresString) => {
    if (!featuresString) return [];
    return featuresString.split(',').map(feature => feature.trim()).filter(feature => feature.length > 0);
};

// Helper function to handle image URL
const getImageUrl = (req, file) => {
    if (!file) return null;
    return `/uploads/${file.filename}`;
};

// Helper function to clean up old image
const cleanupOldImage = (imagePath) => {
    if (imagePath) {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlink(fullPath, (err) => {
                if (err) console.error('Error deleting old image:', err);
            });
        }
    }
};

// Get all paints (Public route)
router.get('/', async (req, res) => {
    try {
        const { category, featured, search, sort = 'createdAt', order = 'desc' } = req.query;
        
        let query = {};
        
        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Filter by featured
        if (featured === 'true') {
            query.featured = true;
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Sorting
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sort] = sortOrder;
        
        const paints = await Paint.find(query)
            .sort(sortOptions)
            .select('-__v');
        
        res.json({
            success: true,
            count: paints.length,
            data: paints
        });
    } catch (error) {
        console.error('Error fetching paints:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching paints',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get single paint by ID (Public route)
router.get('/:id', async (req, res) => {
    try {
        const paint = await Paint.findById(req.params.id).select('-__v');
        
        if (!paint) {
            return res.status(404).json({
                success: false,
                message: 'Paint not found'
            });
        }
        
        res.json({
            success: true,
            data: paint
        });
    } catch (error) {
        console.error('Error fetching paint:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Paint not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error fetching paint',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Create new paint (Admin only)
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        // Validate required fields
        const { name, category, brand, size, price } = req.body;
        
        if (!name || !category || !brand || !size || !price) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, category, brand, size, price'
            });
        }
        
        // Parse price to number
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }
        
        // Parse features
        const features = parseFeatures(req.body.features);
        
        // Create paint object
        const paintData = {
            name,
            category,
            brand,
            size,
            price: priceNum,
            description: req.body.description || '',
            features,
            available: req.body.available !== 'false', // Default to true
            featured: req.body.featured === 'true',
            isNew: req.body.isNew === 'true',
            rating: parseFloat(req.body.rating) || 0,
            reviewCount: parseInt(req.body.reviewCount) || 0,
            originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null
        };
        
        // Add image if uploaded
        if (req.file) {
            paintData.image = getImageUrl(req, req.file);
        }
        
        const paint = new Paint(paintData);
        await paint.save();
        
        res.status(201).json({
            success: true,
            message: 'Paint created successfully',
            data: paint
        });
    } catch (error) {
        console.error('Error creating paint:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file) {
            cleanupOldImage(`/uploads/${req.file.filename}`);
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error creating paint',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update paint (Admin only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const paint = await Paint.findById(req.params.id);
        
        if (!paint) {
            return res.status(404).json({
                success: false,
                message: 'Paint not found'
            });
        }
        
        // Store old image path for cleanup
        const oldImagePath = paint.image;
        
        // Update fields
        const updates = {};
        
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.category !== undefined) updates.category = req.body.category;
        if (req.body.brand !== undefined) updates.brand = req.body.brand;
        if (req.body.size !== undefined) updates.size = req.body.size;
        if (req.body.price !== undefined) {
            const priceNum = parseFloat(req.body.price);
            if (isNaN(priceNum) || priceNum <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Price must be a positive number'
                });
            }
            updates.price = priceNum;
        }
        if (req.body.description !== undefined) updates.description = req.body.description;
        if (req.body.features !== undefined) updates.features = parseFeatures(req.body.features);
        if (req.body.available !== undefined) updates.available = req.body.available !== 'false';
        if (req.body.featured !== undefined) updates.featured = req.body.featured === 'true';
        if (req.body.isNew !== undefined) updates.isNew = req.body.isNew === 'true';
        if (req.body.rating !== undefined) updates.rating = parseFloat(req.body.rating) || 0;
        if (req.body.reviewCount !== undefined) updates.reviewCount = parseInt(req.body.reviewCount) || 0;
        if (req.body.originalPrice !== undefined) {
            updates.originalPrice = req.body.originalPrice ? parseFloat(req.body.originalPrice) : null;
        }
        
        // Handle image upload
        if (req.file) {
            updates.image = getImageUrl(req, req.file);
        }
        
        // Update paint
        Object.assign(paint, updates);
        await paint.save();
        
        // Clean up old image after successful update
        if (req.file && oldImagePath) {
            cleanupOldImage(oldImagePath);
        }
        
        res.json({
            success: true,
            message: 'Paint updated successfully',
            data: paint
        });
    } catch (error) {
        console.error('Error updating paint:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file) {
            cleanupOldImage(`/uploads/${req.file.filename}`);
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Paint not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error updating paint',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete paint (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const paint = await Paint.findById(req.params.id);
        
        if (!paint) {
            return res.status(404).json({
                success: false,
                message: 'Paint not found'
            });
        }
        
        // Store image path for cleanup
        const imagePath = paint.image;
        
        // Delete paint
        await paint.deleteOne();
        
        // Clean up image file
        if (imagePath) {
            cleanupOldImage(imagePath);
        }
        
        res.json({
            success: true,
            message: 'Paint deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting paint:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Paint not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error deleting paint',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Bulk delete paints (Admin only)
router.post('/bulk-delete', auth, async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No paint IDs provided'
            });
        }
        
        // Find paints to get image paths
        const paints = await Paint.find({ _id: { $in: ids } });
        
        // Get image paths for cleanup
        const imagePaths = paints.map(paint => paint.image).filter(path => path);
        
        // Delete paints
        const result = await Paint.deleteMany({ _id: { $in: ids } });
        
        // Clean up image files
        imagePaths.forEach(imagePath => {
            cleanupOldImage(imagePath);
        });
        
        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} paints successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error bulk deleting paints:', error);
        res.status(500).json({
            success: false,
            message: 'Server error bulk deleting paints',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get paint statistics (Admin only)
router.get('/stats/summary', auth, async (req, res) => {
    try {
        const totalPaints = await Paint.countDocuments();
        const totalPrice = await Paint.aggregate([
            { $group: { _id: null, total: { $sum: "$price" } } }
        ]);
        const categoryStats = await Paint.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        const availabilityStats = await Paint.aggregate([
            { $group: { _id: "$available", count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            data: {
                totalPaints,
                totalValue: totalPrice.length > 0 ? totalPrice[0].total : 0,
                categories: categoryStats,
                availability: availabilityStats,
                featuredCount: await Paint.countDocuments({ featured: true }),
                newCount: await Paint.countDocuments({ isNew: true })
            }
        });
    } catch (error) {
        console.error('Error getting paint stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting paint statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Search paints with advanced filtering (Public route)
router.get('/search/advanced', async (req, res) => {
    try {
        const { 
            query, 
            minPrice, 
            maxPrice, 
            categories, 
            sizes,
            available,
            featured,
            sortBy = 'name',
            sortOrder = 'asc',
            page = 1,
            limit = 20 
        } = req.query;
        
        let searchQuery = {};
        
        // Text search
        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        
        // Price range
        if (minPrice || maxPrice) {
            searchQuery.price = {};
            if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
            if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
        }
        
        // Categories filter
        if (categories) {
            const categoryArray = categories.split(',');
            searchQuery.category = { $in: categoryArray };
        }
        
        // Sizes filter
        if (sizes) {
            const sizeArray = sizes.split(',');
            searchQuery.size = { $in: sizeArray };
        }
        
        // Availability filter
        if (available !== undefined) {
            searchQuery.available = available === 'true';
        }
        
        // Featured filter
        if (featured !== undefined) {
            searchQuery.featured = featured === 'true';
        }
        
        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const paints = await Paint.find(searchQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');
        
        const total = await Paint.countDocuments(searchQuery);
        
        res.json({
            success: true,
            data: paints,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error in advanced search:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in search',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;