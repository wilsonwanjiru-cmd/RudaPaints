const mongoose = require('mongoose');
const crypto = require('crypto'); // Import crypto at the top

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    name: {
        type: String,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    },
    source: {
        type: String,
        enum: ['website', 'showroom', 'event', 'referral'],
        default: 'website'
    },
    preferences: {
        type: [String],
        enum: ['promotions', 'new-products', 'tips', 'events'],
        default: ['promotions', 'new-products']
    },
    lastNotified: {
        type: Date,
        default: null
    },
    unsubscribeToken: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true
});

// Generate unsubscribe token before saving - FIXED VERSION
newsletterSchema.pre('save', async function() {
    if (!this.unsubscribeToken) {
        this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
    }
});

// Remove this duplicate index since email field already has unique: true
// newsletterSchema.index({ email: 1 }, { unique: true });

// Index for faster queries
newsletterSchema.index({ active: 1, subscribedAt: -1 });
newsletterSchema.index({ source: 1 });

// Static method to check if email exists
newsletterSchema.statics.emailExists = async function(email) {
    const subscriber = await this.findOne({ email: email.toLowerCase() });
    return !!subscriber;
};

// Static method to subscribe
newsletterSchema.statics.subscribe = async function(email, name = '', source = 'website') {
    const existing = await this.findOne({ email: email.toLowerCase() });
    
    if (existing) {
        if (!existing.active) {
            existing.active = true;
            existing.subscribedAt = new Date();
            await existing.save();
        }
        return existing;
    }
    
    const subscriber = new this({
        email: email.toLowerCase(),
        name,
        source
    });
    
    await subscriber.save();
    return subscriber;
};

// Static method to unsubscribe
newsletterSchema.statics.unsubscribe = async function(emailOrToken) {
    let query;
    
    if (emailOrToken.includes('@')) {
        query = { email: emailOrToken.toLowerCase() };
    } else {
        query = { unsubscribeToken: emailOrToken };
    }
    
    const subscriber = await this.findOne(query);
    
    if (subscriber) {
        subscriber.active = false;
        subscriber.unsubscribeToken = crypto.randomBytes(32).toString('hex');
        await subscriber.save();
    }
    
    return subscriber;
};

// Static method to get statistics
newsletterSchema.statics.getStatistics = async function() {
    const totalSubscribers = await this.countDocuments();
    const activeSubscribers = await this.countDocuments({ active: true });
    
    const sourceStats = await this.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    
    const recentSubscribers = await this.find({ active: true })
        .sort({ subscribedAt: -1 })
        .limit(10)
        .select('email name subscribedAt source');
    
    return {
        totalSubscribers,
        activeSubscribers,
        sourceStats,
        recentSubscribers
    };
};

module.exports = mongoose.model('Newsletter', newsletterSchema);