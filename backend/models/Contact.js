const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters'],
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'closed', 'spam'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    category: {
        type: String,
        enum: ['general', 'sales', 'support', 'technical', 'complaint', 'feedback'],
        default: 'general'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    response: {
        type: String,
        trim: true,
        maxlength: [5000, 'Response cannot exceed 5000 characters']
    },
    respondedAt: {
        type: Date,
        default: null
    },
    source: {
        type: String,
        enum: ['website', 'phone', 'email', 'showroom', 'social'],
        default: 'website'
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for faster queries
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ category: 1 });
contactSchema.index({ priority: 1 });

// Virtual for days since creation
contactSchema.virtual('daysOld').get(function() {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to mark as read
contactSchema.methods.markAsRead = function() {
    if (this.status === 'new') {
        this.status = 'read';
    }
    return this;
};

// Method to respond
contactSchema.methods.respond = function(response, adminId) {
    this.status = 'replied';
    this.response = response;
    this.respondedAt = new Date();
    this.assignedTo = adminId;
    return this;
};

// Static method to get statistics
contactSchema.statics.getStatistics = async function() {
    const totalMessages = await this.countDocuments();
    const newMessages = await this.countDocuments({ status: 'new' });
    const repliedMessages = await this.countDocuments({ status: 'replied' });
    
    const categoryStats = await this.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const priorityStats = await this.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    const recentMessages = await this.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email subject status createdAt');
    
    return {
        totalMessages,
        newMessages,
        repliedMessages,
        categoryStats,
        priorityStats,
        recentMessages
    };
};

// To ensure virtual fields are included when converting to JSON
contactSchema.set('toJSON', { virtuals: true });
contactSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contact', contactSchema);