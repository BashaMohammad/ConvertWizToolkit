// ConvertWiz Premium Backend - Node.js Express Server
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());
app.use(express.static('.'));

// Initialize Firebase Admin SDK with environment variables
const firebaseConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "convertwiz",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
};

// Initialize Firebase Admin only if credentials are available
let db = null;
try {
  if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig)
    });
    db = admin.firestore();
    console.log('Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.log('Firebase Admin SDK not initialized (running without backend features):', error.message);
}

// Admin whitelist
const adminEmails = [
  'iqbalaiwork@gmail.com',
  'iqbalbashasi@gmail.com',
  'sajoshaikh@gmail.com',
  'support@convertwiz.in'
];

// Enhanced middleware to verify Firebase ID Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  try {
    if (!db) {
      return res.status(503).json({ error: 'Backend services unavailable' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Admin-specific middleware
const verifyAdmin = async (req, res, next) => {
  const email = req.user.email;
  if (!adminEmails.includes(email)) {
    return res.status(403).json({ error: 'Access denied: Not an admin' });
  }
  next();
};

// API Routes

// Admin Dashboard API - Get all users (admin only)
app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      // Remove sensitive data
      email: doc.data().email?.replace(/(.{2}).*(@.*)/, '$1***$2') // Partially mask email
    }));
    
    const stats = {
      total: users.length,
      free: users.filter(u => !u.plan || u.plan === 'free').length,
      standard: users.filter(u => u.plan === 'standard').length,
      premium: users.filter(u => u.plan === 'premium').length,
      totalConversions: users.reduce((sum, u) => sum + (u.dailyUsageCount || 0), 0)
    };

    res.json({ users, stats });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Percentage Calculator API
app.post('/api/percentage-calculator', (req, res) => {
  const { value, percentage, operation } = req.body;
  
  if (isNaN(value) || isNaN(percentage)) {
    return res.status(400).json({ error: 'Invalid input: value and percentage must be numbers' });
  }

  let result;
  let message;

  switch (operation) {
    case 'find_percentage':
      result = (value * percentage) / 100;
      message = `${percentage}% of ${value} is ${result}`;
      break;
    case 'find_percent_change':
      result = ((percentage - value) / value) * 100;
      message = `Percentage change from ${value} to ${percentage} is ${result.toFixed(2)}%`;
      break;
    case 'find_total':
      result = (value * 100) / percentage;
      message = `If ${value} is ${percentage}%, then the total is ${result}`;
      break;
    default:
      result = (value * percentage) / 100;
      message = `${percentage}% of ${value} is ${result}`;
  }

  res.json({ 
    result: parseFloat(result.toFixed(2)), 
    message,
    calculation: {
      value,
      percentage,
      operation: operation || 'find_percentage'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      firebase: !!db,
      express: true
    }
  });
});

// Success/Cancel pages for future payment integration
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve static files and SPA routing for all other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ConvertWiz server running on port ${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`API endpoints: http://localhost:${PORT}/api/health`);
});