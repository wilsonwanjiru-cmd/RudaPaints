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

// **FIXED CORS CONFIGURATION - SIMPLIFIED VERSION**
// Configure CORS with more specific options
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5000',
            // Add your production domains here when ready
        ];
        
        // Always allow in development mode
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`🚫 CORS blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Auth-Token', 'x-requested-with'],
    exposedHeaders: ['Content-Disposition', 'Content-Length'],
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 204
};

// **IMPORTANT: Apply CORS middleware first**
app.use(cors(corsOptions));

// Body parsers with increased limits for image uploads
app.use(express.json({ 
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '50mb',
    parameterLimit: 100000
}));

// Static files - serve uploads publicly
app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1y',
    setHeaders: (res, filepath) => {
        // Security headers for static files
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        
        // Cache control
        if (filepath.endsWith('.jpg') || filepath.endsWith('.jpeg') || filepath.endsWith('.png')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
    }
}));

// Logging middleware
const setupLogging = () => {
    try {
        const morgan = require('morgan');
        
        // Custom token for request body (only in development)
        morgan.token('body', (req) => {
            if (process.env.NODE_ENV === 'development' && req.method !== 'GET') {
                try {
                    return JSON.stringify(req.body);
                } catch {
                    return '[Non-JSON body]';
                }
            }
            return '';
        });
        
        // Custom format
        morgan.format('rudapaints', ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :body');
        
        // Use morgan for HTTP request logging
        if (process.env.NODE_ENV !== 'test') {
            app.use(morgan('rudapaints'));
            
            // Also log to file in production
            if (process.env.NODE_ENV === 'production') {
                try {
                    const rfs = require('rotating-file-stream');
                    const accessLogStream = rfs.createStream('access.log', {
                        interval: '1d',
                        path: logsDir,
                        compress: 'gzip',
                        size: '10M'
                    });
                    app.use(morgan('combined', { stream: accessLogStream }));
                } catch (rfsError) {
                    console.warn('Could not set up rotating file stream:', rfsError.message);
                }
            }
        }
    } catch (morganError) {
        console.warn('Morgan logging setup failed:', morganError.message);
    }
};

setupLogging();

// Database connection with updated syntax and better error handling
const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
            retryWrites: true,
            w: 'majority'
        };

        console.log('🔄 Connecting to MongoDB...');
        console.log('📝 Connection string:', process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 30)}...` : 'Using default');
        
        const conn = await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ruda_paints',
            options
        );
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`✅ Database: ${conn.connection.name}`);
        console.log(`✅ Connection state: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
        
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        
        // Provide more helpful error messages
        if (error.name === 'MongoNetworkError') {
            console.error('💡 Troubleshooting tips:');
            console.error('   1. Check if MongoDB is running: `sudo systemctl status mongodb`');
            console.error('   2. Start MongoDB: `sudo systemctl start mongodb`');
            console.error('   3. Check your MONGODB_URI in .env file');
            console.error('   4. For Atlas, ensure your IP is whitelisted');
        }
        
        console.error('❌ Full error details:', error);
        
        // Don't exit immediately in development - allow server to start without DB
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        
        return null;
    }
};

// Connection events with better logging
mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to DB successfully');
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from DB');
    
    // Attempt reconnection in production
    if (process.env.NODE_ENV === 'production') {
        console.log('🔄 Attempting to reconnect...');
        setTimeout(() => {
            connectDB();
        }, 5000);
    }
});

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('\n🔄 Received shutdown signal, closing connections...');
    
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed gracefully');
        
        if (server) {
            server.close(() => {
                console.log('✅ HTTP server closed');
                console.log('👋 Server shutdown complete');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function
    res.end = function(...args) {
        const duration = Date.now() - start;
        const logMessage = `[${requestId}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;
        
        // Color code by status
        if (res.statusCode >= 500) {
            console.error(`❌ ${logMessage}`);
        } else if (res.statusCode >= 400) {
            console.warn(`⚠️  ${logMessage}`);
        } else if (res.statusCode >= 300) {
            console.log(`🔀 ${logMessage}`);
        } else {
            console.log(`✅ ${logMessage}`);
        }
        
        // Call original end function
        originalEnd.apply(res, args);
    };
    
    // Add request ID to response headers for debugging
    res.setHeader('X-Request-ID', requestId);
    
    next();
});

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

// Health check endpoint with detailed status
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        let dbMessage, dbColor;
        
        switch(dbStatus) {
            case 0: dbMessage = '🔴 Disconnected'; dbColor = 'red'; break;
            case 1: dbMessage = '🟢 Connected'; dbColor = 'green'; break;
            case 2: dbMessage = '🟡 Connecting'; dbColor = 'yellow'; break;
            case 3: dbMessage = '🟠 Disconnecting'; dbColor = 'orange'; break;
            default: dbMessage = '⚫ Unknown'; dbColor = 'black'; break;
        }
        
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        const now = new Date();
        
        // Check disk space (simplified)
        let diskInfo = { free: 'N/A', total: 'N/A' };
        try {
            const checkDiskSpace = require('check-disk-space');
            const diskSpace = await checkDiskSpace(__dirname);
            diskInfo = {
                free: `${Math.round(diskSpace.free / 1024 / 1024 / 1024)} GB`,
                total: `${Math.round(diskSpace.size / 1024 / 1024 / 1024)} GB`
            };
        } catch (diskError) {
            console.warn('Could not check disk space:', diskError.message);
        }
        
        const healthData = {
            status: 'ok',
            timestamp: now.toISOString(),
            service: 'Ruda Paints Enterprise API',
            version: '3.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: {
                seconds: uptime,
                human: `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`
            },
            database: {
                status: dbMessage,
                color: dbColor,
                name: mongoose.connection.name || 'Not connected',
                host: mongoose.connection.host || 'Not connected',
                port: mongoose.connection.port || 'Not connected',
                readyState: dbStatus
            },
            system: {
                platform: process.platform,
                nodeVersion: process.version,
                pid: process.pid,
                memory: {
                    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
                    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`
                },
                disk: diskInfo,
                cpu: process.cpuUsage ? {
                    user: `${Math.round(process.cpuUsage().user / 1000)} ms`,
                    system: `${Math.round(process.cpuUsage().system / 1000)} ms`
                } : 'Not available'
            },
            directories: {
                uploads: {
                    exists: fs.existsSync(uploadsDir),
                    path: uploadsDir,
                    files: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0
                },
                logs: {
                    exists: fs.existsSync(logsDir),
                    path: logsDir
                }
            },
            endpoints: {
                home: '/',
                health: '/api/health',
                paints: '/api/paints',
                priceList: '/api/price-list',
                admin: '/api/admin',
                contact: '/api/contact',
                newsletter: '/api/newsletter'
            },
            limits: {
                jsonBody: '50MB',
                urlEncoded: '50MB',
                fileUploads: '50MB'
            },
            cors: {
                allowedOrigins: [
                    'http://localhost:3000',
                    'http://localhost:5000',
                    'http://127.0.0.1:3000',
                    'http://127.0.0.1:5000'
                ],
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
            }
        };
        
        // Add warnings if needed
        const warnings = [];
        if (dbStatus !== 1) warnings.push('Database is not connected');
        if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.8) warnings.push('High memory usage');
        
        if (warnings.length > 0) {
            healthData.warnings = warnings;
            healthData.status = 'warning';
        }
        
        res.json(healthData);
        
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is working!',
        timestamp: new Date().toISOString(),
        requestHeaders: req.headers,
        clientIp: req.ip
    });
});

// Welcome route with interactive documentation
app.get('/', (req, res) => {
    const documentation = {
        message: '🎨 Welcome to Ruda Paints Enterprise API',
        description: 'Professional paint inventory management and e-commerce system',
        version: '3.0.0',
        documentation: 'Check /api/health for detailed status',
        support: {
            email: 'rudapaints@gmail.com',
            whatsapp: '+254703538670',
            address: 'Nairobi, Kenya'
        },
        quickStart: {
            endpoints: [
                { method: 'GET', path: '/api/paints', description: 'Get all paint products' },
                { method: 'POST', path: '/api/paints', description: 'Create new paint product (Admin)' },
                { method: 'GET', path: '/api/price-list', description: 'Get price list' },
                { method: 'POST', path: '/api/contact', description: 'Submit contact form' },
                { method: 'POST', path: '/api/newsletter/subscribe', description: 'Subscribe to newsletter' },
                { method: 'GET', path: '/api/health', description: 'Check system health' },
                { method: 'GET', path: '/api/test', description: 'Test connection' }
            ]
        },
        authentication: {
            admin: '/api/admin/login',
            note: 'Admin routes require JWT token in Authorization header'
        },
        features: [
            'Product management with image uploads',
            'Price list generation (CSV/Excel)',
            'Contact form with admin dashboard',
            'Newsletter subscription',
            'Real-time health monitoring',
            'File uploads with validation'
        ],
        cors: {
            allowedOrigins: ['http://localhost:3000', 'http://localhost:5000'],
            status: 'Enabled'
        }
    };
    
    // Add interactive documentation in development
    if (process.env.NODE_ENV === 'development') {
        documentation.links = {
            adminPanel: `http://localhost:3000/admin`,
            frontend: `http://localhost:3000`,
            healthCheck: `http://localhost:${process.env.PORT || 5000}/api/health`,
            testEndpoint: `http://localhost:${process.env.PORT || 5000}/api/test`
        };
    }
    
    res.json(documentation);
});

// API documentation route
app.get('/api/docs', (req, res) => {
    res.json({
        title: 'Ruda Paints API Documentation',
        version: '3.0.0',
        baseUrl: `${req.protocol}://${req.get('host')}/api`,
        authentication: {
            type: 'Bearer Token',
            note: 'Required for admin endpoints. Get token from /api/admin/login'
        },
        endpoints: {
            paints: {
                GET_ALL: { method: 'GET', path: '/paints', auth: 'No', query: '?category=Interior&featured=true' },
                GET_ONE: { method: 'GET', path: '/paints/:id', auth: 'No' },
                CREATE: { method: 'POST', path: '/paints', auth: 'Yes', body: 'FormData with image' },
                UPDATE: { method: 'PUT', path: '/paints/:id', auth: 'Yes', body: 'FormData' },
                DELETE: { method: 'DELETE', path: '/paints/:id', auth: 'Yes' }
            },
            priceList: {
                GET: { method: 'GET', path: '/price-list', auth: 'No' },
                DOWNLOAD: { method: 'GET', path: '/price-list/download?format=csv', auth: 'No' }
            },
            contact: {
                SUBMIT: { method: 'POST', path: '/contact', auth: 'No', body: 'JSON' },
                GET_ALL: { method: 'GET', path: '/contact', auth: 'Yes' },
                GET_ONE: { method: 'GET', path: '/contact/:id', auth: 'Yes' }
            },
            newsletter: {
                SUBSCRIBE: { method: 'POST', path: '/newsletter/subscribe', auth: 'No', body: 'JSON' },
                UNSUBSCRIBE: { method: 'POST', path: '/newsletter/unsubscribe', auth: 'No', body: 'JSON' },
                CHECK: { method: 'GET', path: '/newsletter/check/:email', auth: 'No' }
            },
            admin: {
                LOGIN: { method: 'POST', path: '/admin/login', auth: 'No', body: 'JSON' },
                CREATE: { method: 'POST', path: '/admin/create', auth: 'No', body: 'JSON' }
            },
            system: {
                HEALTH: { method: 'GET', path: '/health', auth: 'No' },
                TEST: { method: 'GET', path: '/test', auth: 'No' }
            }
        },
        examples: {
            createPaint: {
                method: 'POST',
                url: '/api/paints',
                headers: { 'Authorization': 'Bearer YOUR_TOKEN', 'Content-Type': 'multipart/form-data' },
                body: {
                    name: 'Premium Silk Vinyl',
                    category: 'Interior',
                    brand: 'Ruda Paints',
                    size: '4L',
                    price: 2500,
                    description: 'High-quality interior wall paint',
                    features: 'Washable,Low VOC,Quick Drying',
                    image: '(binary file)'
                }
            },
            contactForm: {
                method: 'POST',
                url: '/api/contact',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '0703123456',
                    subject: 'Inquiry about paint products',
                    message: 'I would like to know more about your interior paints.'
                }
            }
        }
    });
});

// 404 handler with helpful suggestions
app.use((req, res, next) => {
    const suggestions = [];
    const path = req.originalUrl;
    
    // Check if path might be missing /api prefix
    if (!path.startsWith('/api') && !['/', '/api/docs', '/api/health', '/api/test'].includes(path)) {
        suggestions.push(`Did you mean '/api${path}'?`);
    }
    
    // Check for common typos
    const commonTypos = {
        '/api/paint': '/api/paints',
        '/api/paint/': '/api/paints',
        '/api/priceList': '/api/price-list',
        '/api/price-list/': '/api/price-list',
        '/api/contacts': '/api/contact',
        '/api/newsletters': '/api/newsletter'
    };
    
    if (commonTypos[path]) {
        suggestions.push(`Did you mean '${commonTypos[path]}'?`);
    }
    
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${path} not found`,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
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
        ].map(route => `${req.protocol}://${req.get('host')}${route}`)
    });
});

// Error handling middleware with detailed logging
app.use((err, req, res, next) => {
    const timestamp = new Date().toISOString();
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.error(`❌ [${timestamp}] Server Error (ID: ${errorId}):`, {
        id: errorId,
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers
    });
    
    // Log to file
    const errorLog = `
========== ERROR [${timestamp}] ID: ${errorId} ==========
URL: ${req.originalUrl}
Method: ${req.method}
IP: ${req.ip}
User-Agent: ${req.get('User-Agent')}
Error: ${err.message}
Stack: ${err.stack}
Body: ${JSON.stringify(req.body, null, 2)}
Params: ${JSON.stringify(req.params, null, 2)}
Query: ${JSON.stringify(req.query, null, 2)}
===================================================
`;
    
    try {
        fs.appendFileSync(path.join(logsDir, 'error.log'), errorLog);
    } catch (fileError) {
        console.error('Failed to write error log:', fileError);
    }
    
    const statusCode = err.status || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    
    const response = {
        error: 'Internal Server Error',
        message: isProduction ? 'Something went wrong' : err.message,
        errorId: errorId,
        timestamp: timestamp,
        path: req.originalUrl
    };
    
    if (!isProduction) {
        response.stack = err.stack;
        if (err.errors) response.errors = err.errors;
        response.debug = {
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query
        };
    }
    
    res.status(statusCode).json(response);
});

// Server configuration
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const server = createServer(app);

// Start server function
const startServer = async () => {
    try {
        // Connect to database first
        console.log('🔄 Connecting to database...');
        const dbConnection = await connectDB();
        
        if (!dbConnection && process.env.NODE_ENV === 'production') {
            throw new Error('Failed to connect to database in production mode');
        }
        
        // Start server
        server.listen(PORT, HOST, () => {
            const startupTime = new Date().toISOString();
            console.log(`
    🚀 Ruda Paints Server Started Successfully!
    ==========================================
    🌐 Server URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}
    ⏰ Started at: ${startupTime}
    📁 Uploads: ${uploadsDir}
    📊 Logs: ${logsDir}
    🗄️  Database: ${mongoose.connection.name || 'Not connected'}
    ==========================================
    
    📋 Available Endpoints:
    ----------------------
    🏠 Home: http://localhost:${PORT}/
    📖 API Docs: http://localhost:${PORT}/api/docs
    🩺 Health Check: http://localhost:${PORT}/api/health
    🎨 Paints API: http://localhost:${PORT}/api/paints
    📋 Price List: http://localhost:${PORT}/api/price-list
    📧 Contact API: http://localhost:${PORT}/api/contact
    📰 Newsletter API: http://localhost:${PORT}/api/newsletter
    🔐 Admin API: http://localhost:${PORT}/api/admin
    🧪 Test: http://localhost:${PORT}/api/test
    
    💡 Development Tips:
    -------------------
    • Frontend URL: http://localhost:3000
    • Admin Panel: http://localhost:3000/admin
    • MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/ruda_paints'}
    • Use Ctrl+C to stop the server
            `);
            
            console.log('\n🔧 CORS Configuration:');
            console.log('   Allowed Origins: http://localhost:3000, http://localhost:5000');
            console.log('   Allowed Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
            console.log('   Credentials: Enabled');
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
                console.log('💡 Try one of these solutions:');
                console.log('   1. Kill the process using port ' + PORT + ':');
                console.log(`      sudo lsof -i :${PORT} | grep LISTEN`);
                console.log(`      kill -9 <PID>`);
                console.log('   2. Use a different port:');
                console.log(`      PORT=5001 npm start`);
                console.log('   3. Wait a few minutes and try again');
            } else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });

        // Handle server close
        server.on('close', () => {
            console.log('Server closed');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    
    // Don't exit immediately, try to log and continue
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    
    // Don't exit immediately, try to log and continue
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

// Start the application
if (require.main === module) {
    startServer();
}

module.exports = { app, server };