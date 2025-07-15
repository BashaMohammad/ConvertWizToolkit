// ConvertWiz Premium Backend - Node.js Express Server
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');

// ✅ Razorpay Live Configuration
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: "rzp_live_HXdG9BXkQBfjyG",
  key_secret: "CyQm3qiy5mMfapVKyul67pGO"
});

const app = express();
app.use(express.json());
app.use(express.static('.'));

// Premium users storage (in production, use database)
const premiumUsers = {
  'iqbalaiwork@gmail.com': true, // Manually granted premium access due to successful payment
  'iqbalbashasi@gmail.com': true // Grant premium for testing purposes
};

// Create Razorpay order endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, plan } = req.body;
    
    console.log(`📦 Creating Razorpay order: Plan=${plan}, Amount=₹${amount}`);
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${plan}_${new Date().getTime()}`,
      payment_capture: 1,
      notes: {
        plan: plan,
        email: req.body.email || 'no_email_provided'
      }
    };

    const order = await razorpayInstance.orders.create(options);
    console.log(`✅ Order created successfully: ${order.id}`);
    
    res.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Unable to create order' });
  }
});

// Razorpay Webhook Handler
app.post("/razorpay-webhook", express.json(), (req, res) => {
  console.log("🔔 Razorpay webhook received:", JSON.stringify(req.body, null, 2));
  console.log("📋 Headers:", req.headers);
  
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Verify webhook signature if secret is configured
  if (secret && req.headers["x-razorpay-signature"]) {
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      console.log("❌ Invalid webhook signature");
      return res.status(403).send("Invalid signature.");
    }
    console.log("✅ Webhook signature verified");
  } else {
    console.log("⚠️  Webhook signature verification skipped (no secret configured)");
  }

  const event = req.body.event;
  const payment = req.body.payload?.payment?.entity;
  const order = req.body.payload?.order?.entity;

  console.log(`📝 Event: ${event}`);
  console.log(`💳 Payment details:`, payment);
  console.log(`📦 Order details:`, order);

  if (event === "payment.captured" || event === "order.paid") {
    // Try multiple sources for user email
    let userEmail = null;
    
    // Check payment notes
    if (payment?.notes?.email) {
      userEmail = payment.notes.email;
    }
    // Check order notes
    else if (order?.notes?.email) {
      userEmail = order.notes.email;
    }
    // Check payment entity email
    else if (payment?.email) {
      userEmail = payment.email;
    }
    
    if (userEmail && userEmail !== 'no_email_provided') {
      premiumUsers[userEmail] = true;
      console.log(`✅ Premium access granted to ${userEmail} via ${event}`);
      
      // Store payment details for audit
      const paymentRecord = {
        payment_id: payment?.id,
        order_id: order?.id || payment?.order_id,
        amount: payment?.amount || order?.amount,
        email: userEmail,
        event: event,
        timestamp: new Date().toISOString()
      };
      console.log(`📝 Payment record:`, paymentRecord);
      
    } else {
      console.log("⚠️  No user email found in webhook data");
      console.log("Available data sources checked:");
      console.log("- payment.notes.email:", payment?.notes?.email);
      console.log("- order.notes.email:", order?.notes?.email);
      console.log("- payment.email:", payment?.email);
    }
  }

  res.json({ status: "Webhook received successfully" });
});

// Manual premium grant endpoint for testing (remove in production)
app.post("/manual-premium-grant", express.json(), (req, res) => {
  const { email } = req.body;
  if (email) {
    premiumUsers[email] = true;
    console.log(`✅ Manual premium access granted to ${email}`);
    res.json({ success: true, message: `Premium access granted to ${email}` });
  } else {
    res.status(400).json({ error: "Email required" });
  }
});

// 🟡 STEP 3: Add check route to backend
app.get("/check-premium", (req, res) => {
  const userEmail = req.query.email || req.session?.user?.email;
  const isPremium = premiumUsers[userEmail] || false;
  console.log(`🔍 Premium check for ${userEmail}: ${isPremium ? 'PREMIUM' : 'NOT PREMIUM'}`);
  console.log(`📊 Current premium users:`, Object.keys(premiumUsers));
  res.json({ isPremium, email: userEmail });
});

// Payment webhook endpoint for Razorpay (backup)
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), (req, res) => {
  try {
    // Razorpay webhook verification would go here
    // For now, just acknowledge receipt
    console.log('Payment webhook received:', req.body);
    res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ✅ SEO + AdSense Enhanced Component Configuration
const components = [
  {
    id: "jpg-to-png",
    title: "JPG to PNG Converter - Free Online Image Converter | ConvertWiz",
    description: "Convert JPG images to high-quality PNG format instantly. Fast, secure, and free image converter tool by ConvertWiz. No registration required.",
    keywords: "JPG to PNG, Image Converter, Free PNG Converter, JPEG to PNG, Convert Images Online",
    showAd: true
  },
  {
    id: "image-compressor",
    title: "Image Compressor Tool - Reduce File Size Online | ConvertWiz",
    description: "Reduce image size without losing quality. Compress JPEG, PNG, and WebP files online for free using ConvertWiz advanced algorithms.",
    keywords: "Image Compression, Reduce Image Size, JPG Compressor, PNG Optimizer, File Size Reducer",
    showAd: true
  },
  {
    id: "url-shortener",
    title: "URL Shortener with QR Code Generator | ConvertWiz",
    description: "Shorten long URLs and download QR Codes instantly. Ideal for sharing links on social media and business cards. Free URL shortening service.",
    keywords: "Short URL, QR Code Generator, Link Shortener, Custom URLs, Social Media Links",
    showAd: true
  },
  {
    id: "word-counter",
    title: "Word Counter Tool - Count Words & Characters Online | ConvertWiz",
    description: "Count words, characters, sentences, and paragraphs online. Perfect tool for writers, students, and professionals with reading time estimation.",
    keywords: "Word Count Tool, Character Counter, Online Editor, Text Analysis, Writing Tools",
    showAd: true
  },
  {
    id: "text-to-speech",
    title: "Text to Speech Converter - AI Voice Generator | ConvertWiz",
    description: "Convert text into lifelike audio using AI-powered voices. Supports multiple languages and download options for accessibility.",
    keywords: "Text to Voice, TTS Generator, Online Speech Tool, AI Voice, Audio Converter",
    showAd: true
  },
  {
    id: "meta-tag-generator",
    title: "Meta Tag Generator - SEO Optimization Tool | ConvertWiz",
    description: "Generate SEO-optimized meta tags for better search engine rankings. Create title tags, meta descriptions, and Open Graph tags instantly.",
    keywords: "Meta Tag Generator, SEO Tools, Title Tag Creator, Meta Description, Open Graph",
    showAd: true
  },
  {
    id: "backlink-checker",
    title: "Backlink Checker - SEO Link Analysis Tool | ConvertWiz",
    description: "Check your website's backlink profile and analyze SEO performance. Monitor domain authority and link quality for better rankings.",
    keywords: "Backlink Checker, SEO Analysis, Link Building, Domain Authority, Website SEO",
    showAd: true
  }
];

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

// Image Compressor API (JPG/PNG) - Enhanced with better quality control
app.post('/api/image-compressor', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const originalSize = req.file.buffer.length;
    const quality = parseInt(req.query.quality) || 60;
    
    // Enhanced quality control range (50-70 as suggested in fixes)
    const adjustedQuality = Math.min(Math.max(quality, 50), 70);
    
    if (quality < 1 || quality > 100) {
      return res.status(400).json({ error: 'Quality must be between 1 and 100' });
    }

    const compressed = await sharp(req.file.buffer)
      .jpeg({ quality: adjustedQuality, progressive: true })
      .toBuffer();

    const compressedSize = compressed.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    res.json({
      success: true,
      originalSize,
      compressedSize,
      compressionRatio: `${compressionRatio}%`,
      quality: adjustedQuality,
      qualityUsed: adjustedQuality,
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

// ✅ SEO Enhancement API - Get component metadata
app.get('/api/seo/:componentId', (req, res) => {
  const component = components.find(c => c.id === req.params.componentId);
  if (!component) {
    return res.status(404).json({ error: 'Component not found' });
  }
  res.json({
    title: component.title,
    description: component.description,
    keywords: component.keywords,
    showAd: component.showAd,
    canonical: `https://convertwiz.in/${component.id}`,
    ogType: 'website',
    ogImage: `https://convertwiz.in/images/${component.id}-og.jpg`
  });
});

// ✅ Get all components for sitemap generation
app.get('/api/components', (req, res) => {
  res.json(components.map(c => ({
    id: c.id,
    title: c.title.split(' | ')[0], // Remove site name for cleaner display
    description: c.description,
    url: `/${c.id}`
  })));
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

// User Dashboard Route
app.get('/dashboard', (req, res) => {
    res.setHeader('Cache-Control','no-store');
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// === PostgreSQL Database Integration ===
const { Pool } = require('pg');

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err);
  } else {
    console.log('✅ Successfully connected to PostgreSQL database');
    release();
  }
});

// === Short URL Tool API (SEO + Usability) ===
// Generate truly short alphanumeric code
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

app.post('/api/shortener', express.urlencoded({extended:true}), express.json(), async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Generate a short code with retry mechanism
    let shortCode = generateShortCode();
    let attempts = 0;
    const maxAttempts = 10;
    
    // Ensure uniqueness by checking database
    let isUnique = false;
    while (!isUnique && attempts < maxAttempts) {
      try {
        const existingUrl = await pool.query(
          'SELECT id FROM short_urls WHERE short_code = $1',
          [shortCode]
        );
        
        if (existingUrl.rows.length === 0) {
          isUnique = true;
        } else {
          shortCode = generateShortCode();
          attempts++;
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        return res.status(500).json({ error: 'Database connection error' });
      }
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Unable to generate unique short code' });
    }
    
    // Store in PostgreSQL database (never expires by default)
    try {
      await pool.query(
        'INSERT INTO short_urls (short_code, original_url, created_at) VALUES ($1, $2, NOW())',
        [shortCode, url]
      );
    } catch (insertError) {
      console.error('Database insert error:', insertError);
      return res.status(500).json({ error: 'Failed to save URL' });
    }
    
    // Create short URL with custom domain or current host
    const host = req.get('host');
    const baseUrl = host.includes('localhost') ? `${req.protocol}://${host}` : 'https://cvz.to';
    const shortUrl = `${baseUrl}/s/${shortCode}`;
    
    res.json({
      shortUrl,
      shortCode,
      originalUrl: url,
      qrCodeData: shortUrl,
      success: true
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

app.get('/s/:id', async (req, res) => {
  try {
    const shortCode = req.params.id;
    
    // Get URL from database
    const result = await pool.query(
      'SELECT original_url, is_active FROM short_urls WHERE short_code = $1',
      [shortCode]
    );
    
    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(404).send('Short URL not found or has expired.');
    }
    
    const originalUrl = result.rows[0].original_url;
    
    // Increment click counter and update last clicked timestamp
    await pool.query(
      'UPDATE short_urls SET clicks = clicks + 1, last_clicked_at = NOW() WHERE short_code = $1',
      [shortCode]
    );
    
    res.redirect(originalUrl);
  } catch (error) {
    console.error('Error redirecting short URL:', error);
    res.status(500).send('Internal server error');
  }
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

// Payment routes - serve specific payment pages
app.get('/test-payment.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-payment.html'));
});

app.get('/payment-success.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'payment-success.html'));
});

app.get('/payment-failed.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'payment-failed.html'));
});

// ✅ SPA Wildcard Route - Catches all unknown paths and redirects to index.html
// This fixes 404 errors on mobile/desktop when refreshing component pages
// Must be the LAST route in server.js to ensure all known routes work first
app.use((req, res, next) => {
  // Only handle GET requests for HTML pages
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    next();
  }
});

// Export Razorpay instance for use in other modules
module.exports = razorpayInstance;

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ConvertWiz server running on port ${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`API endpoints: http://localhost:${PORT}/api/health`);
});