const express = require('express');
const router = express.Router();
const Paint = require('../models/Paint');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary'); // 👈 Cloudinary upload

// Helper function to parse features string
const parseFeatures = (featuresString) => {
    if (!featuresString) return [];
    return featuresString.split(',').map(feature => feature.trim()).filter(feature => feature.length > 0);
};

// Get all paints (Public route)
router.get('/', async (req, res) => {
    try {
        const { category, featured, search, sort = 'createdAt', order = 'desc' } = req.query;
        
        let query = {};
        
        if (category && category !== 'all') query.category = category;
        if (featured === 'true') query.featured = true;
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        
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
        const { name, category, brand, size, price } = req.body;
        
        if (!name || !category || !brand || !size || !price) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, category, brand, size, price'
            });
        }
        
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }
        
        const features = parseFeatures(req.body.features);
        
        const paintData = {
            name,
            category,
            brand,
            size,
            price: priceNum,
            description: req.body.description || '',
            features,
            available: req.body.available !== 'false',
            featured: req.body.featured === 'true',
            isNew: req.body.isNew === 'true',
            rating: parseFloat(req.body.rating) || 0,
            reviewCount: parseInt(req.body.reviewCount) || 0,
            originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null
        };
        
        if (req.file) {
            // req.file.path is the full Cloudinary URL
            paintData.image = req.file.path;
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
        // No local file to clean up
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
        
        // Update fields
        if (req.body.name !== undefined) paint.name = req.body.name;
        if (req.body.category !== undefined) paint.category = req.body.category;
        if (req.body.brand !== undefined) paint.brand = req.body.brand;
        if (req.body.size !== undefined) paint.size = req.body.size;
        if (req.body.price !== undefined) {
            const priceNum = parseFloat(req.body.price);
            if (isNaN(priceNum) || priceNum <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Price must be a positive number'
                });
            }
            paint.price = priceNum;
        }
        if (req.body.description !== undefined) paint.description = req.body.description;
        if (req.body.features !== undefined) paint.features = parseFeatures(req.body.features);
        if (req.body.available !== undefined) paint.available = req.body.available !== 'false';
        if (req.body.featured !== undefined) paint.featured = req.body.featured === 'true';
        if (req.body.isNew !== undefined) paint.isNew = req.body.isNew === 'true';
        if (req.body.rating !== undefined) paint.rating = parseFloat(req.body.rating) || 0;
        if (req.body.reviewCount !== undefined) paint.reviewCount = parseInt(req.body.reviewCount) || 0;
        if (req.body.originalPrice !== undefined) {
            paint.originalPrice = req.body.originalPrice ? parseFloat(req.body.originalPrice) : null;
        }
        
        // Handle image upload
        if (req.file) {
            // If a new image was uploaded, replace the old Cloudinary URL
            // (Optional: you could delete the old image from Cloudinary using its public_id)
            paint.image = req.file.path;
        }
        
        await paint.save();
        
        res.json({
            success: true,
            message: 'Paint updated successfully',
            data: paint
        });
    } catch (error) {
        console.error('Error updating paint:', error);
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
        
        // Optionally delete image from Cloudinary using its public_id
        // (You can extract public_id from the URL)
        
        await paint.deleteOne();
        
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
        
        // Find paints to possibly delete images from Cloudinary
        const paints = await Paint.find({ _id: { $in: ids } });
        
        // (Optional: delete images from Cloudinary)
        
        const result = await Paint.deleteMany({ _id: { $in: ids } });
        
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
        
        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        
        if (minPrice || maxPrice) {
            searchQuery.price = {};
            if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
            if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
        }
        
        if (categories) {
            const categoryArray = categories.split(',');
            searchQuery.category = { $in: categoryArray };
        }
        
        if (sizes) {
            const sizeArray = sizes.split(',');
            searchQuery.size = { $in: sizeArray };
        }
        
        if (available !== undefined) searchQuery.available = available === 'true';
        if (featured !== undefined) searchQuery.featured = featured === 'true';
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
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