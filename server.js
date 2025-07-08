// ConvertWiz Premium Backend - Node.js Express Server
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
app.use(express.json());
app.use(express.static('.'));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

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

// Temperature Converter API
app.post('/api/temperature-converter', (req, res) => {
  const { value, fromUnit } = req.body;
  const input = parseFloat(value);
  if (isNaN(input)) {
    return res.status(400).json({ error: 'Invalid temperature input' });
  }

  let celsius, fahrenheit, kelvin;
  switch (fromUnit) {
    case 'C':
      celsius = input;
      fahrenheit = (input * 9/5) + 32;
      kelvin = input + 273.15;
      break;
    case 'F':
      celsius = (input - 32) * 5/9;
      fahrenheit = input;
      kelvin = celsius + 273.15;
      break;
    case 'K':
      celsius = input - 273.15;
      fahrenheit = (celsius * 9/5) + 32;
      kelvin = input;
      break;
    default:
      return res.status(400).json({ error: 'Invalid unit' });
  }

  res.json({ 
    celsius: parseFloat(celsius.toFixed(2)), 
    fahrenheit: parseFloat(fahrenheit.toFixed(2)), 
    kelvin: parseFloat(kelvin.toFixed(2)),
    fromUnit,
    originalValue: input
  });
});

// Color Converter API (HEX ↔ RGB ↔ HSL)
app.post('/api/color-converter', (req, res) => {
  const { hex } = req.body;
  if (!hex || !/^#[0-9A-F]{6}$/i.test(hex)) {
    return res.status(400).json({ error: 'Invalid HEX color format. Use #RRGGBB format.' });
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const rgb = `rgb(${r}, ${g}, ${b})`;

  // Convert to HSL
  const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }

  const hsl = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

  res.json({ 
    hex: hex.toUpperCase(), 
    rgb, 
    hsl,
    values: {
      r, g, b,
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  });
});

// Image Compressor API (JPG/PNG)
app.post('/api/image-compressor', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const originalSize = req.file.buffer.length;
    const quality = parseInt(req.query.quality) || 60;
    
    // Validate quality parameter
    if (quality < 1 || quality > 100) {
      return res.status(400).json({ error: 'Quality must be between 1 and 100' });
    }

    const compressed = await sharp(req.file.buffer)
      .jpeg({ quality })
      .toBuffer();

    const compressedSize = compressed.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    res.json({
      success: true,
      originalSize,
      compressedSize,
      compressionRatio: `${compressionRatio}%`,
      quality,
      data: compressed.toString('base64')
    });
  } catch (error) {
    console.error('Compression failed:', error);
    res.status(500).json({ error: 'Compression error occurred' });
  }
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

// Blog route
app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});

// ===== New SEO Tool Routes =====
app.get('/tools/backlink-checker', (req, res) => {
    res.setHeader('Cache-Control','no-store');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/tools/meta-tag-generator', (req, res) => {
    res.setHeader('Cache-Control','no-store');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/tools/dpi-checker', (req, res) => {
    res.setHeader('Cache-Control','no-store');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/tools/url-shortener', (req, res) => {
    res.setHeader('Cache-Control','no-store');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/tools/text-to-speech', (req, res) => {
    res.setHeader('Cache-Control','no-store');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// === Short URL Tool API (SEO + Usability)
const shortLinks = {};
app.post('/api/shortener', express.urlencoded({extended:true}), express.json(), (req, res) => {
  const id = Date.now().toString(36);
  shortLinks[id] = req.body.url;
  res.json({shortUrl:`${req.protocol}://${req.get('host')}/s/${id}`});
});

app.get('/s/:id', (req, res) => {
  const dest = shortLinks[req.params.id];
  if(dest) res.redirect(dest); else res.status(404).send('Short URL not found.');
});

// Serve static files and SPA routing for all other routes
app.get('/', (req, res) => {
  // Force logout on browser reopen - disable cache login
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ConvertWiz server running on port ${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`API endpoints: http://localhost:${PORT}/api/health`);
});