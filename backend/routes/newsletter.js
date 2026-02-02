const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateSubscribe = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('name').optional().trim().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('preferences').optional().isArray().withMessage('Preferences must be an array'),
    
    // Check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

// Subscribe to newsletter
router.post('/subscribe', validateSubscribe, async (req, res) => {
    try {
        const { email, name, preferences, source = 'website' } = req.body;
        
        // Check if email already subscribed and active
        const existingSubscriber = await Newsletter.findOne({ 
            email: email.toLowerCase(),
            active: true 
        });
        
        if (existingSubscriber) {
            return res.status(200).json({
                success: true,
                message: 'You are already subscribed to our newsletter!',
                data: {
                    email: existingSubscriber.email,
                    name: existingSubscriber.name,
                    subscribedAt: existingSubscriber.subscribedAt,
                    preferences: existingSubscriber.preferences
                }
            });
        }
        
        // Check if email exists but inactive
        const inactiveSubscriber = await Newsletter.findOne({ 
            email: email.toLowerCase(),
            active: false 
        });
        
        let subscriber;
        
        if (inactiveSubscriber) {
            // Reactivate subscription
            inactiveSubscriber.active = true;
            inactiveSubscriber.subscribedAt = new Date();
            inactiveSubscriber.name = name || inactiveSubscriber.name;
            if (preferences) inactiveSubscriber.preferences = preferences;
            await inactiveSubscriber.save();
            subscriber = inactiveSubscriber;
        } else {
            // Create new subscription
            subscriber = new Newsletter({
                email: email.toLowerCase(),
                name,
                preferences: preferences || ['promotions', 'new-products'],
                source
            });
            await subscriber.save();
        }
        
        // Send welcome email (in production)
        // await sendWelcomeEmail(subscriber.email, subscriber.name);
        
        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter!',
            data: {
                email: subscriber.email,
                name: subscriber.name,
                subscribedAt: subscriber.subscribedAt,
                preferences: subscriber.preferences
            }
        });
        
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email, token } = req.body;
        
        if (!email && !token) {
            return res.status(400).json({
                success: false,
                message: 'Email or unsubscribe token is required'
            });
        }
        
        const subscriber = await Newsletter.unsubscribe(email || token);
        
        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }
        
        // Send confirmation email (in production)
        // await sendUnsubscribeEmail(subscriber.email);
        
        res.json({
            success: true,
            message: 'Successfully unsubscribed from newsletter'
        });
        
    } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsubscribe. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get newsletter statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await Newsletter.getStatistics();
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Get newsletter stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch newsletter statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all subscribers
router.get('/subscribers', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            active, 
            source,
            search 
        } = req.query;
        
        let query = {};
        
        if (active !== undefined) {
            query.active = active === 'true';
        }
        
        if (source) {
            query.source = source;
        }
        
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        
        const subscribers = await Newsletter.find(query)
            .sort({ subscribedAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .select('-__v');
        
        const total = await Newsletter.countDocuments(query);
        
        res.json({
            success: true,
            data: subscribers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscribers',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Check subscription status
router.get('/check/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const subscriber = await Newsletter.findOne({ 
            email: email.toLowerCase() 
        }).select('email name active subscribedAt preferences');
        
        if (!subscriber) {
            return res.json({
                success: true,
                subscribed: false,
                message: 'Email not found in our newsletter list'
            });
        }
        
        res.json({
            success: true,
            subscribed: subscriber.active,
            data: subscriber
        });
        
    } catch (error) {
        console.error('Check subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check subscription status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;