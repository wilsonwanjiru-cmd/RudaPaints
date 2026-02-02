const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Validation middleware
const validateContact = [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('phone').trim().isLength({ min: 10, max: 20 }).withMessage('Phone number must be between 10 and 20 characters'),
    body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
    body('message').trim().isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters'),
    body('category').optional().isIn(['general', 'sales', 'support', 'technical', 'complaint', 'feedback']).withMessage('Invalid category'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority')
];

// Submit contact form
router.post('/', validateContact, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { 
            name, 
            email, 
            phone, 
            subject, 
            message, 
            category = 'general', 
            priority = 'normal' 
        } = req.body;
        
        // Create contact message
        const contact = new Contact({
            name,
            email: email.toLowerCase(),
            phone,
            subject,
            message,
            category,
            priority,
            source: 'website',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        await contact.save();
        
        // Send notification email (in production)
        // await sendContactNotification(contact);
        
        // Send auto-reply to user (in production)
        // await sendAutoReply(email, name);
        
        res.status(201).json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.',
            data: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
                submittedAt: contact.createdAt
            }
        });
        
    } catch (error) {
        console.error('Contact submission error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to submit message. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all contact messages (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            category,
            priority,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        let query = {};
        
        // Apply filters
        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const contacts = await Contact.find(query)
            .sort(sortOptions)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .select('-__v')
            .populate('assignedTo', 'name email');
        
        const total = await Contact.countDocuments(query);
        
        res.json({
            success: true,
            data: contacts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact messages',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get single contact message (Admin only)
router.get('/:id', auth, async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id)
            .select('-__v')
            .populate('assignedTo', 'name email');
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        // Mark as read if it's new
        if (contact.status === 'new') {
            contact.markAsRead();
            await contact.save();
        }
        
        res.json({
            success: true,
            data: contact
        });
        
    } catch (error) {
        console.error('Get contact message error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update contact message status (Admin only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['new', 'read', 'replied', 'closed', 'spam'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required'
            });
        }
        
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        contact.status = status;
        await contact.save();
        
        res.json({
            success: true,
            message: 'Contact status updated successfully',
            data: contact
        });
        
    } catch (error) {
        console.error('Update contact status error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update contact status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Respond to contact message (Admin only)
router.put('/:id/respond', auth, async (req, res) => {
    try {
        const { response } = req.body;
        
        if (!response || response.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Response must be at least 10 characters'
            });
        }
        
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        // Update contact with response
        contact.respond(response, req.admin.id);
        await contact.save();
        
        // Send response email to user (in production)
        // await sendResponseEmail(contact.email, contact.name, response);
        
        res.json({
            success: true,
            message: 'Response sent successfully',
            data: contact
        });
        
    } catch (error) {
        console.error('Respond to contact error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to send response',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get contact statistics (Admin only)
router.get('/stats/summary', auth, async (req, res) => {
    try {
        const stats = await Contact.getStatistics();
        
        // Get counts by date (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentStats = await Contact.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);
        
        res.json({
            success: true,
            data: {
                ...stats,
                recentStats
            }
        });
        
    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete contact message (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        await contact.deleteOne();
        
        res.json({
            success: true,
            message: 'Contact message deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete contact error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;