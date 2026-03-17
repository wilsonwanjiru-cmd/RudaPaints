const mongoose = require('mongoose');

const paintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters long'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['Interior', 'Exterior', 'Primer', 'Varnish', 'Enamel', 'Others'],
            message: '{VALUE} is not a valid category'
        }
    },
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true,
        default: 'Ruda Paints'
    },
    size: {
        type: String,
        required: [true, 'Size is required'],
        enum: {
            values: [
                // Liters
                '1L', '4L', '5L', '10L', '20L', '25L',
                // Kilograms
                '1kg', '5kg', '25kg', '30kg',
                // Other (for custom sizes)
                'Other'
            ],
            message: '{VALUE} is not a valid size. Use L or kg units.'
        },
        default: '4L'
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        max: [1000000, 'Price cannot exceed 1,000,000']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative'],
        max: [1000000, 'Original price cannot exceed 1,000,000'],
        default: null
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    features: {
        type: [String],
        default: []
    },
    image: {
        type: String,
        default: null
    },
    available: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    newArrival: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5'],
        default: 0
    },
    reviewCount: {
        type: Number,
        min: [0, 'Review count cannot be negative'],
        default: 0
    },
    stockQuantity: {
        type: Number,
        min: [0, 'Stock quantity cannot be negative'],
        default: 0
    },
    sku: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        uppercase: true
    }
}, {
    timestamps: true
});

// Generate SKU before saving if not provided
paintSchema.pre('save', async function() {
    if (!this.sku) {
        const prefix = this.brand.substring(0, 3).toUpperCase();
        const categoryPrefix = this.category.substring(0, 2).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        this.sku = `${prefix}-${categoryPrefix}-${randomNum}`;
    }
});

// Indexes for faster queries (unchanged)
paintSchema.index({ name: 'text', brand: 'text', description: 'text' });
paintSchema.index({ category: 1, price: 1 });
paintSchema.index({ featured: 1, createdAt: -1 });
paintSchema.index({ available: 1 });
paintSchema.index({ newArrival: 1 });

// Virtuals and methods (unchanged)
paintSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

paintSchema.virtual('formattedPrice').get(function() {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(this.price);
});

paintSchema.virtual('formattedOriginalPrice').get(function() {
    if (!this.originalPrice) return null;
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(this.originalPrice);
});

paintSchema.methods.isOnSale = function() {
    return this.originalPrice && this.originalPrice > this.price;
};

paintSchema.methods.getStatus = function() {
    if (!this.available) return 'out-of-stock';
    if (this.isOnSale()) return 'on-sale';
    if (this.featured) return 'featured';
    if (this.newArrival) return 'new';
    return 'available';
};

paintSchema.methods.reduceStock = function(quantity) {
    if (this.stockQuantity < quantity) {
        throw new Error('Insufficient stock');
    }
    this.stockQuantity -= quantity;
    if (this.stockQuantity === 0) {
        this.available = false;
    }
    return this;
};

paintSchema.methods.addStock = function(quantity) {
    this.stockQuantity += quantity;
    if (!this.available && this.stockQuantity > 0) {
        this.available = true;
    }
    return this;
};

paintSchema.methods.updateRating = function(newRating) {
    const totalRating = (this.rating * this.reviewCount) + newRating;
    this.reviewCount += 1;
    this.rating = totalRating / this.reviewCount;
    return this;
};

paintSchema.statics.findByCategory = function(category, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;
    return this.find({ category })
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

paintSchema.statics.getFeaturedProducts = function(limit = 8) {
    return this.find({ 
        featured: true, 
        available: true 
    })
    .sort({ createdAt: -1 })
    .limit(limit);
};

paintSchema.statics.getNewArrivals = function(limit = 8) {
    return this.find({ 
        newArrival: true,
        available: true 
    })
    .sort({ createdAt: -1 })
    .limit(limit);
};

paintSchema.statics.searchProducts = function(searchTerm, options = {}) {
    const { category, minPrice, maxPrice, available = true, limit = 20 } = options;
    let query = {
        $and: [
            { 
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { brand: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ]
            },
            { available }
        ]
    };
    if (category) {
        query.$and.push({ category });
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
        const priceFilter = {};
        if (minPrice !== undefined) priceFilter.$gte = minPrice;
        if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
        query.$and.push({ price: priceFilter });
    }
    return this.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .limit(limit);
};

paintSchema.statics.getProductsOnSale = function(limit = 12) {
    return this.find({
        originalPrice: { $ne: null, $gt: 0 },
        $expr: { $gt: ['$originalPrice', '$price'] },
        available: true
    })
    .sort({ createdAt: -1 })
    .limit(limit);
};

paintSchema.statics.getStatistics = async function() {
    const totalProducts = await this.countDocuments();
    const availableProducts = await this.countDocuments({ available: true });
    const featuredProducts = await this.countDocuments({ featured: true });
    const newProducts = await this.countDocuments({ newArrival: true });
    
    const priceStats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalValue: { $sum: "$price" },
                averagePrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" }
            }
        }
    ]);
    
    const categoryStats = await this.aggregate([
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
                averagePrice: { $avg: "$price" }
            }
        }
    ]);
    
    return {
        totalProducts,
        availableProducts,
        featuredProducts,
        newProducts,
        priceStats: priceStats[0] || {},
        categoryStats
    };
};

// Include virtuals when converting to JSON
paintSchema.set('toJSON', { virtuals: true });
paintSchema.set('toObject', { virtuals: true });

const Paint = mongoose.model('Paint', paintSchema);

module.exports = Paint;