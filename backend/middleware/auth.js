const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token, access denied'
            });
        }
        
        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Check if it's an admin token
        if (verified.role !== 'admin' && verified.role !== 'super-admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        
        // Add admin info to request
        req.admin = verified;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

module.exports = auth;