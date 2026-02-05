const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');

dotenv.config();

const app = express();

// Create necessary directories
const uploadsDir = path.join(__dirname, 'uploads');
const logsDir = path.join(__dirname, 'logs');

// Ensure directories exist
[uploadsDir, logsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

// Security and performance settings
app.set('trust proxy', 1);

// **UPDATED PRODUCTION CORS CONFIGURATION - WITH CUSTOM DOMAIN**
// =============================================================
const allowedOrigins = [
    // Development origins
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    
    // Production origins - UPDATED WITH HTTP ORIGIN
    'http://rudapaints.com',            // ADDED: HTTP version for root domain
    'https://rudapaints.com',           // Your new custom domain
    'https://www.rudapaints.com',       // www version
    'https://ruda-paints-frontend.onrender.com', // Your Render frontend URL (keep as backup)
];

// Apply CORS middleware with updated options
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all in development for easier testing
        if (process.env.NODE_ENV !== 'production') {
            console.log(`🔓 Development: Allowing origin ${origin}`);
            return callback(null, true);
        }
        
        // Check if the origin is allowed in production
        if (allowedOrigins.includes(origin)) {
            console.log(`✅ Production: Allowed origin ${origin}`);
            callback(null, true);
        } else {
            console.log(`🚫 CORS blocked in production: ${origin}`);
            console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parsers
app.use(express.json({ 
    limit: '10mb'
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb'
}));

// Static files
app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1y',
    setHeaders: (res, path) => {
        // Allow CORS for uploaded images
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMessage = `[${requestId}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;
        
        if (res.statusCode >= 400) {
            console.error(`❌ ${logMessage}`);
        } else {
            console.log(`📝 ${logMessage}`);
        }
    });
    
    res.setHeader('X-Request-ID', requestId);
    next();
});

// Database connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruda_paints';
        
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        console.log('🔄 Connecting to MongoDB...');
        
        const conn = await mongoose.connect(mongoURI, options);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`✅ Database: ${conn.connection.name}`);
        
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        
        if (process.env.NODE_ENV === 'production') {
            console.error('💡 Check MONGODB_URI in environment variables');
            setTimeout(() => {
                console.log('🔄 Attempting to reconnect...');
                connectDB();
            }, 5000);
        }
        
        return null;
    }
};

// Connection events
mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from DB');
    setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        connectDB();
    }, 5000);
});

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('\n🔄 Shutting down gracefully...');
    
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        
        if (server) {
            server.close(() => {
                console.log('✅ HTTP server closed');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
    
    setTimeout(() => {
        console.error('❌ Force shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Routes
const adminRoutes = require('./routes/admin');
const paintRoutes = require('./routes/paints');
const priceListRoutes = require('./routes/priceList');
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/paints', paintRoutes);
app.use('/api/price-list', priceListRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Health check endpoint - ENHANCED FOR MONITORING
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        const dbStatusText = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        }[dbStatus] || 'unknown';

        // Get request origin for debugging
        const origin = req.headers.origin || req.headers.referer || 'unknown';
        
        const healthData = {
            status: dbStatus === 1 ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            service: 'Ruda Paints API',
            environment: process.env.NODE_ENV || 'development',
            custom_domain: 'api.rudapaints.com', // UPDATED: Show actual API domain
            request_origin: origin,
            database: {
                status: dbStatusText,
                readyState: dbStatus,
                name: mongoose.connection.name || 'Not connected',
                host: mongoose.connection.host || 'Not connected'
            },
            server: {
                uptime: process.uptime(),
                memory: {
                    heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
                    rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`
                }
            }
        };

        // Add CORS headers explicitly for health endpoint
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(healthData);
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            environment: process.env.NODE_ENV || 'development'
        });
    }
});

// Simple test endpoint - UPDATED WITH CORS HEADERS
app.get('/api/test', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
        success: true,
        message: 'Ruda Paints API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        domain: 'api.rudapaints.com', // UPDATED: Show actual API domain
        cors_allowed: allowedOrigins
    });
});

// Welcome route - UPDATED FOR CUSTOM DOMAIN
app.get('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
        message: '🎨 Welcome to Ruda Paints Enterprise API',
        version: '2.0.0',
        status: 'running',
        domain: 'api.rudapaints.com', // UPDATED: Show actual API domain
        endpoints: {
            health: '/api/health',
            paints: '/api/paints',
            priceList: '/api/price-list',
            contact: '/api/contact',
            newsletter: '/api/newsletter',
            admin: '/api/admin'
        },
        documentation: 'Check /api/health for system status',
        support: {
            email: 'rudapaints@gmail.com',
            whatsapp: '+254703538670'
        }
    });
});

// API documentation
app.get('/api/docs', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
        title: 'Ruda Paints API Documentation',
        baseUrl: `${req.protocol}://${req.get('host')}/api`,
        productionUrl: 'https://api.rudapaints.com/api', // UPDATED: Correct API URL
        endpoints: {
            paints: '/paints',
            priceList: '/price-list',
            contact: '/contact',
            newsletter: '/newsletter',
            admin: '/admin'
        },
        authentication: 'Bearer token required for admin endpoints',
        cors: {
            allowed_origins: allowedOrigins
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /',
            'GET /api/health',
            'GET /api/test',
            'GET /api/docs',
            'GET /api/paints',
            'GET /api/price-list',
            'POST /api/contact',
            'POST /api/newsletter/subscribe',
            'POST /api/admin/login'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    
    if (process.env.NODE_ENV === 'development') {
        console.error('Stack:', err.stack);
    }

    const statusCode = err.status || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    const response = {
        error: 'Internal Server Error',
        message: isProduction ? 'Something went wrong' : err.message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    };

    if (!isProduction && err.stack) {
        response.stack = err.stack;
    }

    // Add CORS headers even for errors
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(statusCode).json(response);
});

// Server configuration
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const server = createServer(app);

// Start server
const startServer = async () => {
    try {
        // Connect to database
        console.log('🔄 Starting Ruda Paints Server...');
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Custom API Domain: api.rudapaints.com`); // UPDATED
        
        await connectDB();
        
        // Start listening
        server.listen(PORT, HOST, () => {
            console.log(`
    🚀 Ruda Paints Server Started!
    ================================
    🌐 Server URL: http://localhost:${PORT}
    🌍 Production API URL: https://api.rudapaints.com  // UPDATED
    ⏰ Port: ${PORT}
    📁 Uploads: ${uploadsDir}
    🗄️  Database: ${mongoose.connection.name || 'Not connected'}
    ================================
    
    📋 Available Endpoints:
    ----------------------
    🏠 Home: /
    🩺 Health: /api/health
    🧪 Test: /api/test
    📖 Docs: /api/docs
    🎨 Paints: /api/paints
    📋 Price List: /api/price-list
    📧 Contact: /api/contact
    📰 Newsletter: /api/newsletter
    🔐 Admin: /api/admin
    
    🔒 CORS Allowed Origins:
    -----------------------
    ${allowedOrigins.map(origin => `    • ${origin}`).join('\n')}
            `);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
                console.log(`💡 Try: kill -9 $(lsof -ti:${PORT})`);
                process.exit(1);
            } else {
                console.error('❌ Server error:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

// Start the application
if (require.main === module) {
    startServer();
}

module.exports = { app, server };