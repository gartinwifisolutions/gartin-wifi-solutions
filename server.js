const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8888; // Using a non-standard port to avoid router conflicts
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Military-grade logging with timestamp precision
function logInfo(message) {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`);
}

function logError(message, error) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
}

// Database setup with error handling
const db = new sqlite3.Database('consultations.db', (err) => {
    if (err) {
        logError('Database connection failed:', err);
        process.exit(1);
    }
    logInfo('Connected to database successfully');
});

// Enhanced security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Professional-grade CORS configuration
app.use(cors({
    origin: '*', // Allow all origins during testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret: 'your-military-grade-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Database initialization
db.serialize(() => {
    try {
        // Consultations table
        db.run(`CREATE TABLE IF NOT EXISTS consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            address2 TEXT,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            zip TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        logInfo('Consultations table initialized');

        // Admin table
        db.run(`CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
        logInfo('Admin table initialized');

        // Create default admin account
        const defaultAdmin = {
            username: 'admin',
            password: 'change_this_password'
        };

        db.get('SELECT * FROM admin WHERE username = ?', [defaultAdmin.username], async (err, row) => {
            if (err) {
                logError('Error checking admin account:', err);
                return;
            }

            if (!row) {
                try {
                    const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);
                    db.run('INSERT INTO admin (username, password) VALUES (?, ?)',
                        [defaultAdmin.username, hashedPassword],
                        (err) => {
                            if (err) {
                                logError('Error creating admin account:', err);
                            } else {
                                logInfo('Default admin account created');
                            }
                        }
                    );
                } catch (error) {
                    logError('Error hashing password:', error);
                }
            }
        });
    } catch (error) {
        logError('Database initialization failed:', error);
        process.exit(1);
    }
});

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session.authenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/consultation', (req, res) => {
    res.sendFile(path.join(__dirname, 'consultation.html'));
});

// Admin authentication
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        db.get('SELECT * FROM admin WHERE username = ?', [username], async (err, user) => {
            if (err) {
                logError('Database error during login:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            req.session.authenticated = true;
            req.session.userId = user.id;
            logInfo(`Admin login successful: ${username}`);
            res.json({ success: true });
        });
    } catch (error) {
        logError('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/admin/logout', (req, res) => {
    const userId = req.session.userId;
    req.session.destroy((err) => {
        if (err) {
            logError('Logout error:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        logInfo(`Admin logout successful: ID ${userId}`);
        res.json({ success: true });
    });
});

// Consultation management
app.post('/submit-consultation', (req, res) => {
    const { name, address, address2, city, state, zip, phone, email, message } = req.body;

    if (!name || !address || !city || !state || !zip || !phone || !email) {
        return res.status(400).json({ error: 'All required fields must be filled out' });
    }

    const sql = `INSERT INTO consultations (name, address, address2, city, state, zip, phone, email, message, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [name, address, address2, city, state, zip, phone, email, message, 'new'], function(err) {
        if (err) {
            logError('Error saving consultation:', err);
            return res.status(500).json({ error: 'Failed to save consultation' });
        }
        logInfo(`New consultation created: ${name} (ID: ${this.lastID})`);
        res.json({ success: true, id: this.lastID });
    });
});

app.get('/admin/consultations', requireAuth, (req, res) => {
    const sql = 'SELECT * FROM consultations ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            logError('Error fetching consultations:', err);
            return res.status(500).json({ error: 'Failed to fetch consultations' });
        }
        res.json(rows);
    });
});

app.put('/admin/consultations/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'contacted', 'scheduled', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const sql = 'UPDATE consultations SET status = ? WHERE id = ?';
    db.run(sql, [status, id], function(err) {
        if (err) {
            logError('Error updating consultation:', err);
            return res.status(500).json({ error: 'Failed to update consultation' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Consultation not found' });
        }
        logInfo(`Consultation ${id} status updated to: ${status}`);
        res.json({ success: true });
    });
});

// Error handling
app.use((err, req, res, next) => {
    logError('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server with comprehensive network diagnostics
const server = app.listen(PORT, HOST, () => {
    const interfaces = require('os').networkInterfaces();
    const networkInfo = [];
    
    Object.keys(interfaces).forEach((iface) => {
        interfaces[iface].forEach((details) => {
            if (details.family === 'IPv4') {
                const url = `http://${details.address}:${PORT}`;
                networkInfo.push(url);
                logInfo(`Available on: ${url}`);
            }
        });
    });
    
    logInfo('Server Configuration:');
    logInfo(`Port: ${PORT} (High port to avoid conflicts)`);
    logInfo(`Host: ${HOST}`);
    logInfo('Network Interfaces: ' + networkInfo.join(', '));
}).on('error', (error) => {
    logError('Server failed to start:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logInfo('SIGTERM received. Starting graceful shutdown...');
    server.close(() => {
        logInfo('Server closed. Closing database connection...');
        db.close(() => {
            logInfo('Database connection closed. Exiting...');
            process.exit(0);
        });
    });
});
