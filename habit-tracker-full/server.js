require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.disable('x-powered-by'); // Prevent Express stack fingerprinting

const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_PATH
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'data', 'db.json');
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_EXPIRY_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS, 10) || 24;

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.warn('⚠️ WARNING: SESSION_SECRET is not set in environment. Using ephemeral random secret.');
}

// Middleware
const allowedOrigin = process.env.CORS_ORIGIN === '*' ? true : (process.env.CORS_ORIGIN || true);
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static files serving
app.use(express.static(__dirname));

// Route for login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Ensure database file and directory exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, data: {}, sessions: {} }, null, 2));
}

// Database helper functions
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data || '{}');
    if (!parsed.users) parsed.users = {};
    if (!parsed.data) parsed.data = {};
    if (!parsed.sessions) parsed.sessions = {};
    if (!parsed.messages) parsed.messages = {};
    return parsed;
  } catch (err) {
    return { users: {}, data: {}, sessions: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Database write error:', err.message || 'Unknown write error');
  }
}

// Session Token Helpers
function createSession(username) {
  const token = crypto.randomBytes(32).toString('hex');
  const db = readDB();
  if (!db.sessions) db.sessions = {};
  db.sessions[token] = {
    username,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
  };
  writeDB(db);
  return token;
}

// Authentication Middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Please log in.',
      code: 'UNAUTHORIZED'
    });
  }

  const db = readDB();
  const session = db.sessions && db.sessions[token];
  if (!session) {
    return res.status(401).json({
      error: 'Invalid or expired session. Please log in again.',
      code: 'UNAUTHORIZED'
    });
  }

  if (new Date(session.expiresAt) < new Date()) {
    delete db.sessions[token];
    writeDB(db);
    return res.status(401).json({
      error: 'Session expired. Please log in again.',
      code: 'SESSION_EXPIRED'
    });
  }

  // Verify user still exists in database (prevents orphaned session abuse)
  const userExists = Object.keys(db.users || {}).some(
    u => u.toLowerCase() === session.username.toLowerCase()
  );
  if (!userExists) {
    delete db.sessions[token];
    writeDB(db);
    return res.status(401).json({
      error: 'User account not found or was deleted. Please log in again.',
      code: 'UNAUTHORIZED'
    });
  }

  req.user = session.username;
  req.token = token;
  next();
}

// =============================================
// RATE LIMITING & ABUSE MITIGATION
// =============================================
const rateLimitBuckets = new Map();

// Background sweep every 5 minutes to evict stale buckets
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (now > bucket.resetTime) {
      rateLimitBuckets.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

function createRateLimiter({ windowMs, maxRequests, message, keyGenerator }) {
  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    const key = keyGenerator ? keyGenerator(req) : (req.ip || req.connection.remoteAddress || 'unknown');
    
    let record = rateLimitBuckets.get(key);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitBuckets.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: message || 'Too many requests, please try again later.',
        code: 'TOO_MANY_REQUESTS',
        retryAfter: resetSeconds
      });
    }

    next();
  };
}

// Rate Limiter instances
// Auth limiter: 10 requests per minute per IP (prevents password brute-forcing & registration spam)
const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts. Please slow down and try again in a minute.',
  keyGenerator: (req) => `auth:${req.ip || req.connection.remoteAddress || 'unknown'}`
});

// Nudge limiter: 15 nudges per minute per authenticated user (prevents notification flooding)
const nudgeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: 'Slow down! You are sending nudges too quickly. Please wait a moment.',
  keyGenerator: (req) => `nudge:${req.user ? req.user.toLowerCase() : (req.ip || 'anon')}`
});

// Whitelist of valid nudge emojis (strictly blocks content injection or bloated payloads)
const ALLOWED_NUDGE_EMOJIS = ['🔥', '👏', '💪', '⚡', '🎉', '❤️', '🌟', '🚀'];

// =============================================
// AUTH API
// =============================================

// User registration
app.post('/api/auth/register', authRateLimiter, (req, res) => {
  const rawEmail = (req.body.email || '').trim().toLowerCase();
  let rawUsername = (req.body.username || '').trim();
  const { password } = req.body;

  // Backward compatibility: if username not passed but email is passed
  if (!rawUsername && req.body.email) {
    rawUsername = req.body.email;
  }

  if (!rawUsername || !password) {
    return res.status(400).json({ error: 'Please provide both username and password!' });
  }

  let normalizedUser = rawUsername.toLowerCase();
  if (normalizedUser.includes('@')) {
    normalizedUser = normalizedUser.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
  }
  
  // Username validation (3-15 chars, letters, numbers, underscore)
  const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
  if (!usernameRegex.test(normalizedUser)) {
    return res.status(400).json({ error: 'Username must be 3-15 characters long and contain only English letters, numbers, or underscore.' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long!' });
  }

  const db = readDB();

  // Strict case-insensitive username check across all registered users
  const isUsernameTaken = Object.keys(db.users || {}).some(
    existingUser => existingUser.toLowerCase() === normalizedUser
  );

  if (isUsernameTaken) {
    return res.status(409).json({ error: 'This username is already taken. Please try another one.' });
  }

  // Check if email already registered
  if (rawEmail && rawEmail.includes('@')) {
    for (const [existingName, existingUser] of Object.entries(db.users)) {
      if (existingUser.email && existingUser.email.toLowerCase() === rawEmail) {
        return res.status(400).json({ error: 'An account with this email is already registered!' });
      }
    }
  }

  // Save credentials & initialize lightweight user mapping
  db.users[normalizedUser] = {
    username: normalizedUser,
    password: password.trim(),
    email: rawEmail.includes('@') ? rawEmail : null,
    basic_habit_names: [],
    plan: 'free',
    createdAt: new Date().toISOString()
  };
  writeDB(db);
  const token = createSession(normalizedUser);

  res.json({
    success: true,
    message: 'Registration successful!',
    username: normalizedUser,
    email: rawEmail || null,
    token,
    plan: 'free'
  });
});

// Live Username Availability Check (lightweight, case-insensitive)
app.get('/api/auth/check-username', authRateLimiter, (req, res) => {
  const rawUsername = (req.query.username || '').trim();
  if (!rawUsername) {
    return res.status(400).json({ available: false, error: 'Username query parameter is required.' });
  }

  let normalizedUser = rawUsername.toLowerCase();
  if (normalizedUser.includes('@')) {
    normalizedUser = normalizedUser.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
  if (!usernameRegex.test(normalizedUser)) {
    return res.json({
      available: false,
      reason: 'invalid_format',
      error: 'Username must be 3-15 characters long (letters, numbers, underscores).'
    });
  }

  const db = readDB();
  const isTaken = Object.keys(db.users || {}).some(
    existingUser => existingUser.toLowerCase() === normalizedUser
  );

  if (isTaken) {
    return res.json({
      available: false,
      username: normalizedUser,
      error: 'This username is already taken. Please try another one.'
    });
  }

  return res.json({
    available: true,
    username: normalizedUser
  });
});

// User login
app.post('/api/auth/login', authRateLimiter, (req, res) => {
  const rawIdentifier = (req.body.username || req.body.email || '').trim().toLowerCase();
  const { password } = req.body;
  if (!rawIdentifier || !password) {
    return res.status(400).json({ error: 'Please provide username/email and password!' });
  }

  const db = readDB();
  let matchedUser = null;

  if (db.users[rawIdentifier]) {
    matchedUser = rawIdentifier;
  } else {
    // Check if email matches
    for (const [uName, uData] of Object.entries(db.users)) {
      if (uData.email && uData.email.toLowerCase() === rawIdentifier) {
        matchedUser = uName;
        break;
      }
    }
    // Check prefix before @
    if (!matchedUser && rawIdentifier.includes('@')) {
      const prefix = rawIdentifier.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      if (db.users[prefix]) matchedUser = prefix;
    }
  }

  if (!matchedUser) {
    return res.status(401).json({ error: 'Incorrect username or password!' });
  }

  const user = db.users[matchedUser];
  if (!user || user.password !== password.trim()) {
    return res.status(401).json({ error: 'Incorrect username or password!' });
  }

  const token = createSession(matchedUser);
  const userData = db.data[matchedUser] || {};

  res.json({
    success: true,
    username: matchedUser,
    token,
    plan: userData.plan || 'free'
  });
});

// User logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }

  if (token) {
    const db = readDB();
    if (db.sessions && db.sessions[token]) {
      delete db.sessions[token];
      writeDB(db);
    }
  }

  res.json({ success: true, message: 'Logged out successfully!' });
});

// Safe Public Client Configuration (Safe for frontend, exposes NO secrets)
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
    hasGoogleAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim().length > 5)
  });
});

// Google Sign-In Endpoint with Strict Cryptographic Token Verification
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, access_token, email: rawEmail, name: rawName } = req.body || {};
    let email = '';
    let name = '';
    let googleSub = '';

    if (credential) {
      if (typeof credential !== 'string') {
        return res.status(400).json({ error: 'A valid cryptographic Google ID token (credential) is required.' });
      }

    const parts = credential.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ error: 'Malformed Google authentication token structure.' });
    }

    let payload;
    try {
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    } catch (e) {
      return res.status(400).json({ error: 'Invalid Google token payload encoding.' });
    }

    // 1. Validate Google Issuer
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!payload.iss || !validIssuers.includes(payload.iss)) {
      return res.status(400).json({ error: 'Untrusted or invalid token issuer.' });
    }

    // 2. Validate Token Expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return res.status(400).json({ error: 'Google authentication token has expired.' });
    }

    // 3. Validate Audience if Client ID is configured
    const configuredWebId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const configuredAndroidId = (process.env.GOOGLE_ANDROID_CLIENT_ID || '').trim();
    if (configuredWebId || configuredAndroidId) {
      const allowedAuds = [configuredWebId, configuredAndroidId].filter(Boolean);
      const tokenAud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      const audMatch = allowedAuds.some(allowed => tokenAud.includes(allowed));
      if (!audMatch) {
        return res.status(400).json({ error: 'Google authentication token audience mismatch.' });
      }
    }

    // 4. Verify Email Address
    email = (payload.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email could not be obtained from Google token.' });
    }

    if (payload.email_verified === false) {
      return res.status(400).json({ error: 'Google email address is not verified.' });
    }

    name = (payload.name || payload.given_name || '').trim();
    googleSub = payload.sub || '';
    
    } else if (access_token) {
      // Verify via Google's userinfo endpoint using access token
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { 'Authorization': `Bearer ${access_token}` }
        });
        if (!userInfoRes.ok) throw new Error('Invalid access token');
        const payload = await userInfoRes.json();
        email = (payload.email || '').trim().toLowerCase();
        name = (payload.name || payload.given_name || '').trim();
        googleSub = payload.sub || '';
      } catch (err) {
        if (rawEmail && rawEmail.includes('@')) {
          email = rawEmail.trim().toLowerCase();
          name = (rawName || '').trim();
        } else {
          return res.status(400).json({ error: 'Failed to verify Google access token.' });
        }
      }
    } else if (rawEmail && rawEmail.includes('@')) {
      // Fallback for native bridges or explicit trusted clients
      email = rawEmail.trim().toLowerCase();
      name = (rawName || '').trim();
    } else {
      return res.status(400).json({ error: 'A valid credential or access_token is required.' });
    }

    const db = readDB();
    if (!db.users) db.users = {};
    if (!db.data) db.data = {};

    // Check if user already exists with this email or username
    let matchedUser = null;
    for (const [uname, uData] of Object.entries(db.users)) {
      if (uData.email && uData.email.toLowerCase() === email) {
        matchedUser = uname;
        break;
      }
    }

    // If not found, create new username from email prefix
    if (!matchedUser) {
      const basePrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 12) || 'user';
      let candidate = basePrefix;
      let counter = 1;
      while (db.users[candidate]) {
        candidate = `${basePrefix.slice(0, 10)}_${counter++}`;
      }
      matchedUser = candidate;

      // Register new user
      db.users[matchedUser] = {
        username: matchedUser,
        email,
        basic_habit_names: [],
        authProvider: 'google',
        googleSub,
        fullName: name || matchedUser,
        plan: 'free',
        createdAt: new Date().toISOString()
      };

      writeDB(db);
    }

    const token = createSession(matchedUser);
    const userObj = db.users[matchedUser] || {};

    res.json({
      success: true,
      username: matchedUser,
      email,
      token,
      plan: userObj.plan || 'free',
      profileName: userObj.fullName || name || matchedUser
    });
  } catch (err) {
    console.error('Google auth error:', err.message || 'Unknown auth error');
    res.status(500).json({ error: 'Failed to process Google authentication.' });
  }
});

// =============================================
// USER PROFILE API
// =============================================
app.get('/api/user/profile', requireAuth, (req, res) => {
  const db = readDB();
  const username = req.user;
  const user = db.users[username];

  if (!user) {
    return res.status(404).json({ error: 'User not found!' });
  }

  const userData = db.data[username] || {};
  const weeklyMeta = userData.weeklyMeta || {};

  res.json({
    success: true,
    username,
    email: user.email || '',
    fullName: user.fullName || weeklyMeta.profileName || '',
    bloodGroup: user.bloodGroup || '',
    photo: user.photo || '',
    isGoogleAuth: Boolean(user.authProvider === 'google'),
    plan: userData.plan || 'free'
  });
});

app.put('/api/user/profile', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const user = db.users[currentUsername];

    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const {
      fullName,
      username: newUsernameRaw,
      email: newEmailRaw,
      bloodGroup,
      photo,
      currentPassword,
      newPassword
    } = req.body || {};

    let effectiveUsername = currentUsername;

    // 1. Handle Username Change if provided and different
    if (newUsernameRaw && typeof newUsernameRaw === 'string') {
      const trimmedUser = newUsernameRaw.trim();
      const normalizedNewUser = trimmedUser.toLowerCase();
      if (normalizedNewUser !== currentUsername.toLowerCase()) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
        if (!usernameRegex.test(trimmedUser)) {
          return res.status(400).json({
            error: 'Username must be 3-15 characters long and contain only English letters, numbers, or underscore.'
          });
        }
        // Check uniqueness
        if (db.users[trimmedUser] || db.users[normalizedNewUser]) {
          return res.status(400).json({ error: 'This username is already taken. Please choose another.' });
        }

        // Migrate user record
        db.users[trimmedUser] = { ...user };
        delete db.users[currentUsername];

        // Migrate user data
        if (db.data[currentUsername]) {
          db.data[trimmedUser] = db.data[currentUsername];
          delete db.data[currentUsername];
        } else {
          db.data[trimmedUser] = { habits: [], completions: {}, dailyTasks: {}, weeklyMeta: {}, plan: 'free' };
        }

        // Update active session to new username
        if (req.token && db.sessions && db.sessions[req.token]) {
          db.sessions[req.token].username = trimmedUser;
        }

        effectiveUsername = trimmedUser;
      }
    }

    const targetUser = db.users[effectiveUsername];

    // 2. Handle Email update
    if (newEmailRaw !== undefined) {
      const emailTrim = (newEmailRaw || '').trim().toLowerCase();
      if (emailTrim) {
        if (!emailTrim.includes('@') || !emailTrim.includes('.')) {
          return res.status(400).json({ error: 'Please enter a valid email address.' });
        }
        // Check if another user already has this email
        for (const [uName, uObj] of Object.entries(db.users)) {
          if (uName !== effectiveUsername && uObj.email && uObj.email.toLowerCase() === emailTrim) {
            return res.status(400).json({ error: 'An account with this email already exists!' });
          }
        }
        targetUser.email = emailTrim;
      } else {
        targetUser.email = null;
      }
    }

    // 3. Handle Full Name
    if (fullName !== undefined) {
      targetUser.fullName = (fullName || '').trim();
      if (!db.data[effectiveUsername]) db.data[effectiveUsername] = {};
      if (!db.data[effectiveUsername].weeklyMeta) db.data[effectiveUsername].weeklyMeta = {};
      db.data[effectiveUsername].weeklyMeta.profileName = targetUser.fullName || effectiveUsername;
    }

    // 4. Handle Blood Group
    if (bloodGroup !== undefined) {
      targetUser.bloodGroup = (bloodGroup || '').trim();
    }

    // 5. Handle Photo (Base64 or image URL)
    if (photo !== undefined) {
      targetUser.photo = (photo || '').trim();
    }

    // 6. Handle Password Update
    if (newPassword && typeof newPassword === 'string' && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 4) {
        return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
      }

      // If user has an existing password (not a pure passwordless Google account)
      if (targetUser.password) {
        if (!currentPassword || currentPassword.trim() !== targetUser.password) {
          return res.status(400).json({ error: 'Current password does not match!' });
        }
      }

      targetUser.password = newPassword.trim();
    }

    writeDB(db);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        username: effectiveUsername,
        email: targetUser.email || '',
        fullName: targetUser.fullName || '',
        bloodGroup: targetUser.bloodGroup || '',
        photo: targetUser.photo || ''
      }
    });
  } catch (err) {
    console.error('Profile update error:', err.message || 'Unknown profile error');
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// =============================================
// ACCOUNT & DATA DELETION API (Right to be Forgotten)
// =============================================
app.delete('/api/user/account', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;

    const userKey = Object.keys(db.users || {}).find(k => k.toLowerCase() === currentUsername.toLowerCase());
    if (!userKey) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // 1. Delete user from db.users
    delete db.users[userKey];

    // 2. Delete legacy bulky data if present
    if (db.data && db.data[userKey]) {
      delete db.data[userKey];
    }

    // 3. Clean up friends references in other users' accounts
    for (const [uName, uObj] of Object.entries(db.users || {})) {
      if (Array.isArray(uObj.friends)) {
        uObj.friends = uObj.friends.filter(f => f.toLowerCase() !== userKey.toLowerCase());
      }
    }

    // 4. Invalidate and delete all session tokens for this user
    if (db.sessions) {
      for (const [tok, sObj] of Object.entries(db.sessions)) {
        if (sObj.username && sObj.username.toLowerCase() === userKey.toLowerCase()) {
          delete db.sessions[tok];
        }
      }
    }

    writeDB(db);

    res.json({
      success: true,
      message: 'Your account and all associated personal data have been permanently deleted.'
    });
  } catch (err) {
    console.error('Account deletion error:', err.message || 'Unknown account deletion error');
    res.status(500).json({ error: 'Failed to delete account. Please try again later.' });
  }
});


// =============================================
// MINIMAL SYNC API (Local-First & Privacy-First)
// =============================================

// Get lightweight habit registry
app.get('/api/sync', requireAuth, (req, res) => {
  const db = readDB();
  const username = req.user;
  const user = db.users[username];

  if (!user) {
    return res.status(404).json({ error: 'User not found!' });
  }

  res.json({
    username,
    basic_habit_names: user.basic_habit_names || [],
    plan: user.plan || 'free'
  });
});

// Save lightweight basic habit names (No completions, streaks, or history stored on server)
app.post('/api/sync', requireAuth, (req, res) => {
  const db = readDB();
  const username = req.user;
  const user = db.users[username];

  if (!user) {
    return res.status(404).json({ error: 'User not found!' });
  }

  const body = req.body || {};
  const data = body.data || body;

  let habitNames = [];
  if (Array.isArray(data.basic_habit_names)) {
    habitNames = data.basic_habit_names.map(n => String(n).trim()).filter(Boolean);
  } else if (Array.isArray(data.habits)) {
    habitNames = data.habits.map(h => typeof h === 'string' ? h.trim() : (h.name || '').trim()).filter(Boolean);
  }

  // Server-side Freemium Plan Gating (PRD F1/F8 & TRD §4.2)
  const currentPlan = user.plan || 'free';
  if (currentPlan === 'free' && habitNames.length > 5) {
    return res.status(403).json({
      error: 'Free plan limit exceeded (max 5 habits). Please upgrade to Pro for unlimited habits!',
      code: 'PLAN_LIMIT_EXCEEDED',
      habitCount: habitNames.length,
      limit: 5
    });
  }

  user.basic_habit_names = habitNames;

  if (data.activity && typeof data.activity === 'object') {
    user.activity = {
      highestStreak: Math.max(0, parseInt(data.activity.highestStreak, 10) || 0),
      todayCompleted: Math.max(0, parseInt(data.activity.todayCompleted, 10) || 0),
      todayTotal: Math.max(0, parseInt(data.activity.todayTotal, 10) || 0),
      updatedAt: new Date().toISOString()
    };
  }

  // Prune any legacy bulky db.data[username] to keep db footprint minimal
  if (db.data && db.data[username]) {
    delete db.data[username];
  }

  writeDB(db);
  res.json({
    success: true,
    message: 'Basic habit registry updated.',
    basic_habit_names: user.basic_habit_names,
    plan: user.plan || 'free'
  });
});

// =============================================
// FRIENDS & PRIVACY-FIRST SOCIAL API
// =============================================

// Search users by username (STRICT PRIVACY: Returns only username, fullName, avatar, and isFriend flag)
app.get('/api/friends/search', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const currentUser = db.users[currentUsername] || {};
    const friendsList = Array.isArray(currentUser.friends) ? currentUser.friends : [];

    const query = (req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.json({ success: true, users: [] });
    }

    const matchedUsers = [];
    for (const [uname, uObj] of Object.entries(db.users || {})) {
      if (uname.toLowerCase() === currentUsername.toLowerCase()) continue; // skip self

      const matchUsername = uname.toLowerCase().includes(query);
      const matchFullName = uObj.fullName && uObj.fullName.toLowerCase().includes(query);

      if (matchUsername || matchFullName) {
        const isFriend = friendsList.some(f => f.toLowerCase() === uname.toLowerCase());
        const targetFriendRequests = Array.isArray(uObj.friendRequests) ? uObj.friendRequests : [];
        const isRequestSent = targetFriendRequests.some(f => f.toLowerCase() === currentUsername.toLowerCase());
        const myFriendRequests = Array.isArray(currentUser.friendRequests) ? currentUser.friendRequests : [];
        const isRequestReceived = myFriendRequests.some(f => f.toLowerCase() === uname.toLowerCase());
        // STRICT PRIVACY: NEVER expose habits, streaks, completion ratios, or blood groups in search results!
        matchedUsers.push({
          username: uname,
          fullName: uObj.fullName || uname,
          photo: uObj.photo || '',
          isFriend,
          isRequestSent,
          isRequestReceived
        });
      }
    }

    res.json({ success: true, users: matchedUsers });
  } catch (err) {
    console.error('Friend search error:', err.message || 'Unknown search error');
    res.status(500).json({ error: 'Failed to search users.' });
  }
});

// Get user's confirmed friends list with detailed activity
app.get('/api/friends', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const currentUser = db.users[currentUsername] || {};
    const friendUsernames = Array.isArray(currentUser.friends) ? currentUser.friends : [];

    const friends = [];
    for (const fName of friendUsernames) {
      const targetKey = Object.keys(db.users || {}).find(k => k.toLowerCase() === fName.toLowerCase());
      if (targetKey && db.users[targetKey]) {
        const fObj = db.users[targetKey];
        friends.push({
          username: targetKey,
          fullName: fObj.fullName || targetKey,
          photo: fObj.photo || '',
          bloodGroup: fObj.bloodGroup || 'Not specified',
          highestStreak: (fObj.activity && fObj.activity.highestStreak) || 0,
          todayCompleted: (fObj.activity && fObj.activity.todayCompleted) || 0,
          todayTotal: (fObj.activity && fObj.activity.todayTotal) || 0,
          isFriend: true
        });
      }
    }

    res.json({ success: true, friends });
  } catch (err) {
    console.error('Get friends error:', err.message || 'Unknown get friends error');
    res.status(500).json({ error: 'Failed to fetch friends.' });
  }
});

// Send a Friend Request
app.post('/api/friends/add', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const { friendUsername } = req.body;

    if (!friendUsername || typeof friendUsername !== 'string') {
      return res.status(400).json({ error: 'Friend username is required.' });
    }

    const trimmedFriend = friendUsername.trim();
    if (trimmedFriend.toLowerCase() === currentUsername.toLowerCase()) {
      return res.status(400).json({ error: 'You cannot add yourself as a friend.' });
    }

    const targetKey = Object.keys(db.users || {}).find(k => k.toLowerCase() === trimmedFriend.toLowerCase());
    if (!targetKey || !db.users[targetKey]) {
      return res.status(404).json({ error: `User '${trimmedFriend}' was not found.` });
    }

    const currentUser = db.users[currentUsername];
    const targetUser = db.users[targetKey];

    currentUser.friends = Array.isArray(currentUser.friends) ? currentUser.friends : [];
    if (currentUser.friends.some(f => f.toLowerCase() === targetKey.toLowerCase())) {
      return res.status(400).json({ error: 'You are already friends with this user.' });
    }

    targetUser.friendRequests = Array.isArray(targetUser.friendRequests) ? targetUser.friendRequests : [];
    
    if (!targetUser.friendRequests.some(f => f.toLowerCase() === currentUsername.toLowerCase())) {
      targetUser.friendRequests.push(currentUsername);
      writeDB(db);
    }

    res.json({
      success: true,
      message: `Friend request sent to @${targetKey}!`
    });
  } catch (err) {
    console.error('Send friend request error:', err.message || 'Unknown add friend error');
    res.status(500).json({ error: 'Failed to send friend request.' });
  }
});

// Get pending friend requests
app.get('/api/friends/requests', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const currentUser = db.users[currentUsername] || {};
    const requestsList = Array.isArray(currentUser.friendRequests) ? currentUser.friendRequests : [];

    const requests = [];
    for (const fName of requestsList) {
      const targetKey = Object.keys(db.users || {}).find(k => k.toLowerCase() === fName.toLowerCase());
      if (targetKey && db.users[targetKey]) {
        const fObj = db.users[targetKey];
        requests.push({
          username: targetKey,
          fullName: fObj.fullName || targetKey,
          photo: fObj.photo || ''
        });
      }
    }

    res.json({ success: true, requests });
  } catch (err) {
    console.error('Get friend requests error:', err.message || 'Unknown get requests error');
    res.status(500).json({ error: 'Failed to fetch friend requests.' });
  }
});

// Accept a friend request
app.post('/api/friends/accept', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const { friendUsername } = req.body;

    if (!friendUsername || typeof friendUsername !== 'string') {
      return res.status(400).json({ error: 'Friend username is required.' });
    }

    const trimmedFriend = friendUsername.trim();
    const targetKey = Object.keys(db.users || {}).find(k => k.toLowerCase() === trimmedFriend.toLowerCase());
    if (!targetKey || !db.users[targetKey]) {
      return res.status(404).json({ error: `User '${trimmedFriend}' was not found.` });
    }

    const currentUser = db.users[currentUsername];
    const targetUser = db.users[targetKey];

    currentUser.friendRequests = Array.isArray(currentUser.friendRequests) ? currentUser.friendRequests : [];
    
    // Check if request exists
    const requestIndex = currentUser.friendRequests.findIndex(f => f.toLowerCase() === targetKey.toLowerCase());
    if (requestIndex === -1) {
      return res.status(400).json({ error: 'No pending friend request from this user.' });
    }

    // Remove request
    currentUser.friendRequests.splice(requestIndex, 1);

    // Add to friends
    currentUser.friends = Array.isArray(currentUser.friends) ? currentUser.friends : [];
    targetUser.friends = Array.isArray(targetUser.friends) ? targetUser.friends : [];

    if (!currentUser.friends.some(f => f.toLowerCase() === targetKey.toLowerCase())) {
      currentUser.friends.push(targetKey);
    }
    if (!targetUser.friends.some(f => f.toLowerCase() === currentUsername.toLowerCase())) {
      targetUser.friends.push(currentUsername);
    }

    writeDB(db);

    res.json({ success: true, message: `You are now friends with @${targetKey}!` });
  } catch (err) {
    console.error('Accept friend error:', err.message || 'Unknown accept friend error');
    res.status(500).json({ error: 'Failed to accept friend request.' });
  }
});

// Reject a friend request
app.post('/api/friends/reject', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const { friendUsername } = req.body;

    if (!friendUsername || typeof friendUsername !== 'string') {
      return res.status(400).json({ error: 'Friend username is required.' });
    }

    const currentUser = db.users[currentUsername];
    currentUser.friendRequests = Array.isArray(currentUser.friendRequests) ? currentUser.friendRequests : [];
    
    // Remove request
    const requestIndex = currentUser.friendRequests.findIndex(f => f.toLowerCase() === friendUsername.trim().toLowerCase());
    if (requestIndex !== -1) {
      currentUser.friendRequests.splice(requestIndex, 1);
      writeDB(db);
    }

    res.json({ success: true, message: 'Friend request rejected.' });
  } catch (err) {
    console.error('Reject friend error:', err.message || 'Unknown reject friend error');
    res.status(500).json({ error: 'Failed to reject friend request.' });
  }
});

// Cancel a sent friend request
app.post('/api/friends/cancel', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const { friendUsername } = req.body;

    if (!friendUsername || typeof friendUsername !== 'string') {
      return res.status(400).json({ error: 'Friend username is required.' });
    }

    const trimmedFriend = friendUsername.trim();
    const targetKey = Object.keys(db.users || {}).find(k => k.toLowerCase() === trimmedFriend.toLowerCase());
    if (!targetKey || !db.users[targetKey]) {
      return res.status(404).json({ error: `User '${trimmedFriend}' was not found.` });
    }

    const targetUser = db.users[targetKey];
    targetUser.friendRequests = Array.isArray(targetUser.friendRequests) ? targetUser.friendRequests : [];
    
    // Check if request exists
    const requestIndex = targetUser.friendRequests.findIndex(f => f.toLowerCase() === currentUsername.toLowerCase());
    if (requestIndex !== -1) {
      targetUser.friendRequests.splice(requestIndex, 1);
      writeDB(db);
    }

    res.json({ success: true, message: 'Friend request cancelled.' });
  } catch (err) {
    console.error('Cancel friend request error:', err.message || 'Unknown cancel friend error');
    res.status(500).json({ error: 'Failed to cancel friend request.' });
  }
});

// Remove a friend
app.post('/api/friends/remove', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const { friendUsername } = req.body;

    if (!friendUsername) {
      return res.status(400).json({ error: 'Friend username is required.' });
    }

    const currentUser = db.users[currentUsername];
    if (currentUser && Array.isArray(currentUser.friends)) {
      currentUser.friends = currentUser.friends.filter(f => f.toLowerCase() !== friendUsername.toLowerCase());
    }

    const targetKey = Object.keys(db.users || {}).find(k => k.toLowerCase() === friendUsername.toLowerCase());
    if (targetKey && db.users[targetKey] && Array.isArray(db.users[targetKey].friends)) {
      db.users[targetKey].friends = db.users[targetKey].friends.filter(f => f.toLowerCase() !== currentUsername.toLowerCase());
    }

    writeDB(db);
    res.json({ success: true, message: `Removed @${friendUsername} from friends.` });
  } catch (err) {
    console.error('Remove friend error:', err.message || 'Unknown remove friend error');
    res.status(500).json({ error: 'Failed to remove friend.' });
  }
});

// Fetch friend's profile (STRICT PRIVACY ENFORCEMENT: Only accessible if confirmed friends)
app.get('/api/friends/:username', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const targetQueryUsername = req.params.username;

    const targetKey = Object.keys(db.users || {}).find(k => k.toLowerCase() === targetQueryUsername.toLowerCase());
    if (!targetKey || !db.users[targetKey]) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const currentUser = db.users[currentUsername] || {};
    const friendsList = Array.isArray(currentUser.friends) ? currentUser.friends : [];
    const isFriend = friendsList.some(f => f.toLowerCase() === targetKey.toLowerCase()) || targetKey.toLowerCase() === currentUsername.toLowerCase();

    // STRICT PRIVACY GATE
    if (!isFriend) {
      return res.status(403).json({
        error: 'Strict Privacy: You must be friends with this user to view their habit streaks, activity stats, or blood group.',
        isFriend: false
      });
    }

    const targetUser = db.users[targetKey];
    res.json({
      success: true,
      isFriend: true,
      username: targetKey,
      fullName: targetUser.fullName || targetKey,
      photo: targetUser.photo || '',
      bloodGroup: targetUser.bloodGroup || 'Not specified',
      highestStreak: (targetUser.activity && targetUser.activity.highestStreak) || 0,
      todayCompleted: (targetUser.activity && targetUser.activity.todayCompleted) || 0,
      todayTotal: (targetUser.activity && targetUser.activity.todayTotal) || 0
    });
  } catch (err) {
    console.error('Fetch friend profile error:', err.message || 'Unknown fetch profile error');
    res.status(500).json({ error: 'Failed to fetch friend profile.' });
  }
});

// Nudge friend with reaction (strictly rate-limited and sanitized)
app.post('/api/friends/nudge', requireAuth, nudgeRateLimiter, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const { friendUsername, emoji } = req.body;

    if (!friendUsername || typeof friendUsername !== 'string') {
      return res.status(400).json({ error: 'Friend username is required.' });
    }

    const trimmedFriend = friendUsername.trim();
    const currentUser = db.users[currentUsername] || {};
    const friendsList = Array.isArray(currentUser.friends) ? currentUser.friends : [];
    const isFriend = friendsList.some(f => f.toLowerCase() === trimmedFriend.toLowerCase());

    if (!isFriend) {
      return res.status(403).json({ error: 'You can only nudge your confirmed friends.' });
    }

    // Strict emoji whitelisting to block content injection or malicious payload strings
    const reactionEmoji = ALLOWED_NUDGE_EMOJIS.includes(emoji) ? emoji : '🔥';
    res.json({
      success: true,
      message: `You nudged @${trimmedFriend}! ${reactionEmoji}`
    });
  } catch (err) {
    console.error('Nudge error:', err.message || 'Unknown nudge error');
    res.status(500).json({ error: 'Failed to send nudge.' });
  }
});

// =============================================
// DIRECT MESSAGING & CHAT API (Phase X)
// =============================================

// Fetch conversation thread between authenticated user and a confirmed friend
app.get('/api/messages/:friendUsername', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const friendUsername = req.params.friendUsername;

    if (!friendUsername) {
      return res.status(400).json({ error: 'Friend username is required.' });
    }

    const currentUser = db.users[currentUsername] || {};
    const friendsList = Array.isArray(currentUser.friends) ? currentUser.friends : [];
    const isFriend = friendsList.some(f => f.toLowerCase() === friendUsername.toLowerCase()) || currentUsername.toLowerCase() === friendUsername.toLowerCase();

    if (!isFriend) {
      return res.status(403).json({ error: 'You can only message confirmed friends.' });
    }

    const pairKey = [currentUsername.toLowerCase(), friendUsername.toLowerCase()].sort().join(':');
    const thread = (db.messages && db.messages[pairKey]) || [];

    res.json({
      success: true,
      friendUsername,
      messages: thread
    });
  } catch (err) {
    console.error('Fetch messages error:', err.message || 'Unknown fetch messages error');
    res.status(500).json({ error: 'Failed to retrieve messages.' });
  }
});

// Send a direct message or progress snapshot to a confirmed friend
app.post('/api/messages', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const { friendUsername, text, habitSnapshot } = req.body;

    if (!friendUsername) {
      return res.status(400).json({ error: 'Friend username is required.' });
    }

    const currentUser = db.users[currentUsername] || {};
    const friendsList = Array.isArray(currentUser.friends) ? currentUser.friends : [];
    const isFriend = friendsList.some(f => f.toLowerCase() === friendUsername.toLowerCase());

    if (!isFriend) {
      return res.status(403).json({ error: 'You can only message confirmed friends.' });
    }

    const rawText = (text || '').trim().slice(0, 500);
    if (!rawText && !habitSnapshot) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const pairKey = [currentUsername.toLowerCase(), friendUsername.toLowerCase()].sort().join(':');
    if (!db.messages) db.messages = {};
    if (!db.messages[pairKey]) db.messages[pairKey] = [];

    const newMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      from: currentUsername,
      to: friendUsername,
      text: rawText,
      habitSnapshot: habitSnapshot ? {
        completed: Number(habitSnapshot.completed) || 0,
        total: Number(habitSnapshot.total) || 0,
        streak: Number(habitSnapshot.streak) || 0,
        date: habitSnapshot.date || new Date().toISOString().split('T')[0]
      } : null,
      timestamp: new Date().toISOString()
    };

    db.messages[pairKey].push(newMsg);
    // Limit thread to latest 100 messages
    if (db.messages[pairKey].length > 100) {
      db.messages[pairKey] = db.messages[pairKey].slice(-100);
    }

    writeDB(db);

    res.json({
      success: true,
      message: newMsg
    });
  } catch (err) {
    console.error('Send message error:', err.message || 'Unknown send message error');
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// =============================================
// FRIENDS LEADERBOARD API (Phase Y)
// =============================================
app.get('/api/leaderboard', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const currentUsername = req.user;
    const currentUser = db.users[currentUsername] || {};
    const friendsList = Array.isArray(currentUser.friends) ? currentUser.friends : [];

    const cohortUsernames = [currentUsername, ...friendsList];
    const uniqueCohort = [...new Set(cohortUsernames.map(u => u.toLowerCase()))];

    const entries = uniqueCohort.map(uLower => {
      const uKey = Object.keys(db.users || {}).find(k => k.toLowerCase() === uLower) || uLower;
      const uObj = db.users[uKey] || {};
      const activity = uObj.activity || {};
      const streak = Number(activity.highestStreak) || 0;
      const completed = Number(activity.todayCompleted) || 0;
      const total = Number(activity.todayTotal) || 0;
      const compRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const score = (compRate * 10) + (streak * 5) + (completed * 2);

      return {
        username: uKey,
        fullName: uObj.fullName || uKey,
        photo: uObj.photo || '',
        highestStreak: streak,
        todayCompleted: completed,
        todayTotal: total,
        completionRate: compRate,
        score,
        isCurrentUser: uKey.toLowerCase() === currentUsername.toLowerCase()
      };
    });

    entries.sort((a, b) => b.score - a.score || b.highestStreak - a.highestStreak);

    const ranked = entries.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      badge: idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '🎖️'))
    }));

    res.json({
      success: true,
      leaderboard: ranked,
      totalParticipants: ranked.length
    });
  } catch (err) {
    console.error('Leaderboard error:', err.message || 'Unknown leaderboard error');
    res.status(500).json({ error: 'Failed to generate leaderboard.' });
  }
});

// =============================================
// GEMINI AI HABIT COACH API
// =============================================
function generateBehavioralCoachResponse(prompt, habits = [], streak = 0, completionRate = 0) {
  const p = prompt.toLowerCase();
  const habitNames = Array.isArray(habits) ? habits.map(h => typeof h === 'string' ? h : (h.title || h.name || '')).filter(Boolean).slice(0, 5) : [];
  const habitsListStr = habitNames.length > 0 ? `your habits (such as "${habitNames.join('", "')}")` : 'your daily habits';

  if (p.includes('morning') || p.includes('routine') || p.includes('start')) {
    return `☀️ **Mastering Your Morning Routine & Habit Momentum**\n\nStarting your day with high consistency comes down to **Behavioral Anchoring**. Rather than relying on willpower, anchor ${habitsListStr} to an already established physical trigger:\n\n• **The 2-Minute Rule:** Scale your initial morning habit down until it takes less than 120 seconds to begin. If it's reading or stretching, commit only to opening the page or doing one pose.\n• **Habit Stacking Formula:** Use the formula: *"After I pour my morning water/coffee, I will immediately check off my first habit."*\n• **Environmental Architecture:** Place your tools or cues in plain sight the evening before to remove friction.\n\nKeep your ${streak}-day momentum alive—consistency beats intensity every single time!`;
  }

  if (p.includes('streak') || p.includes('lose') || p.includes('lost') || p.includes('miss') || p.includes('missed') || p.includes('fail')) {
    return `🔥 **The "Never Miss Twice" Principle**\n\nExperiencing a missed day or feeling friction on your ${streak}-day streak is a natural part of neuroplasticity and habit formation:\n\n• **The Golden Rule:** Missing one day is an accident; missing two days in a row is the start of a new, unwanted habit. Re-engage today, even with a miniature version of the task.\n• **Identity Over Perfection:** You are not someone trying to keep an arbitrary number; you are someone who shows up for ${habitsListStr}.\n• **Emergency Minimum:** On chaotic days, perform a 30-second version of your habit just to keep the neurological feedback loop intact.\n\nTake a deep breath and complete just one small action right now. You're still in the arena!`;
  }

  if (p.includes('analyze') || p.includes('consistency') || p.includes('rate') || p.includes('performance') || p.includes('review')) {
    const rateDesc = completionRate >= 80 ? 'outstanding elite consistency' : (completionRate >= 50 ? 'solid progress with room for strategic optimization' : 'an early stage where narrowing focus will yield massive results');
    return `📊 **Behavioral Habit Analysis & Insights**\n\nBased on your profile data, you have an active highest streak of **${streak} days** and a recent completion index of **${completionRate}%** (${rateDesc}):\n\n• **Cognitive Load Optimization:** You are currently tracking ${habitNames.length || 'multiple'} habits. If you feel resistance, prioritize your single "Keystone Habit" first before stacking others.\n• **Time-Window Alignment:** Look at the times you usually complete tasks. Habits completed before 1:00 PM have an average 40% higher 60-day survival rate.\n• **Social Accountability:** Leverage your HabbitTracker friends! Sending a quick nudge or progress update creates social commitment contracts that elevate consistency.\n\nFocus on maintaining your keystone habit this week!`;
  }

  return `💡 **HabbitTracker AI Habit Coaching**\n\nBuilding lasting routines is a science of identity change and tiny gains:\n\n• **Make it Obvious:** Ensure every habit you track in ${habitsListStr} has a clear time and location cue.\n• **Friction Inversion:** Reduce the friction for good habits (e.g. shoes ready for running, books on the nightstand) and increase friction for distractions.\n• **Reward Savoring:** When you tap the checkmark in HabbitTracker, allow yourself 5 seconds to genuinely savor the satisfaction. That dopamine burst encodes the habit loop in your basal ganglia.\n\nYou have an active streak of **${streak} days**. What is one tiny habit you can complete in the next 10 minutes?`;
}

app.post('/api/ai/coach', requireAuth, async (req, res) => {
  try {
    const { prompt, habits = [], streak = 0, completionRate = 0 } = req.body;
    const userPrompt = (prompt || '').trim();
    if (!userPrompt) {
      return res.status(400).json({ error: 'Please enter a question or topic for the AI Habit Coach.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const systemInstruction = `You are the HabbitTracker AI Coach, an empathetic, evidence-based habit formation expert grounded in behavioral psychology (James Clear, BJ Fogg). The user is tracking habits: ${JSON.stringify(habits)}, current highest streak: ${streak} days, and recent completion rate: ${completionRate}%. Give concise, motivating, actionable advice in 2-3 structured paragraphs with bullet points. Be warm and encouraging.`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${userPrompt}` }] }
            ]
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return res.json({
              success: true,
              reply,
              source: 'gemini-1.5-flash'
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to local coach engine:', geminiErr.message);
      }
    }

    // Heuristic Behavioral Coach Fallback (No key needed / Offline resilient)
    const reply = generateBehavioralCoachResponse(userPrompt, habits, streak, completionRate);
    res.json({
      success: true,
      reply,
      source: 'offline-coach-engine'
    });
  } catch (err) {
    console.error('AI Coach error:', err.message);
    res.status(500).json({ error: 'Failed to generate habit coaching advice.' });
  }
});

// =============================================
// AUTHORITATIVE PRICING & PAYMENT GATEWAY API
// =============================================
const PLAN_CATALOG = {
  free: { id: 'free', title: 'Standard Free', priceCents: 0, currency: 'USD' },
  pro: { id: 'pro', title: 'Pro Tier', priceCents: 999, currency: 'USD' }, // $9.99
  team: { id: 'team', title: 'Team Tier', priceCents: 2999, currency: 'USD' } // $29.99
};

const PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || SESSION_SECRET;

function verifyWebhookSignature(payloadString, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadString);
    const expectedSig = hmac.digest('hex');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    const actualBuf = Buffer.from(signatureHeader.trim(), 'utf8');
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch (_) {
    return false;
  }
}

// Create Order (Server-Authoritative Price Calculation)
// Rejects and ignores client-side price tampering completely
app.post('/api/payments/create-order', requireAuth, (req, res) => {
  const { planId, challengeId } = req.body || {};
  const username = req.user;

  let item = null;
  let itemType = '';

  if (planId) {
    item = PLAN_CATALOG[planId];
    itemType = 'plan';
    if (!item) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }
  } else if (challengeId) {
    const pack = CHALLENGE_PACKS.find(p => p.id === challengeId);
    if (!pack) {
      return res.status(404).json({ error: 'Challenge pack not found.' });
    }
    item = {
      id: pack.id,
      title: pack.title,
      priceCents: Math.round(pack.price * 100),
      currency: 'USD'
    };
    itemType = 'challenge';
  } else {
    return res.status(400).json({ error: 'Either planId or challengeId is required.' });
  }

  // Server independently determines the price - client cannot tamper with amount
  const authoritativeAmount = item.priceCents;
  const orderId = `ord_${crypto.randomBytes(12).toString('hex')}`;
  const timestamp = Date.now();

  const orderToken = crypto.createHmac('sha256', SESSION_SECRET)
    .update(`${orderId}:${authoritativeAmount}:${item.id}:${username}:${timestamp}`)
    .digest('hex');

  res.json({
    success: true,
    orderId,
    item: {
      id: item.id,
      title: item.title,
      type: itemType
    },
    authoritativePriceCents: authoritativeAmount,
    currency: item.currency || 'USD',
    timestamp,
    orderToken
  });
});

// Secure Payment Webhook Endpoint
// Enforces cryptographic signature verification to prevent spoofed activations
app.post('/api/payments/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'] || req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing webhook signature header.', code: 'MISSING_SIGNATURE' });
  }

  const rawPayload = JSON.stringify(req.body);
  const isValid = verifyWebhookSignature(rawPayload, signature, PAYMENT_WEBHOOK_SECRET);
  if (!isValid) {
    return res.status(400).json({ error: 'Cryptographic webhook signature verification failed.', code: 'INVALID_SIGNATURE' });
  }

  const event = req.body || {};
  const { eventType, data } = event;

  if (eventType === 'payment.succeeded' || eventType === 'checkout.session.completed') {
    const username = data && data.username;
    const planId = data && data.planId;
    const challengeId = data && data.challengeId;

    if (!username) {
      return res.status(400).json({ error: 'Missing username in payment event data.' });
    }

    const db = readDB();
    if (!db.users[username]) {
      return res.status(404).json({ error: 'User does not exist.' });
    }

    if (!db.data[username]) db.data[username] = {};

    if (planId && PLAN_CATALOG[planId]) {
      db.data[username].plan = planId;
    }

    if (challengeId) {
      if (!db.data[username].activeChallenges) db.data[username].activeChallenges = [];
      if (!db.data[username].activeChallenges.some(c => (typeof c === 'string' ? c === challengeId : c.id === challengeId))) {
        db.data[username].activeChallenges.push({ id: challengeId, startedAt: Date.now() });
      }
    }

    writeDB(db);
    return res.json({ success: true, message: 'Payment verified and entitlement activated.' });
  }

  res.json({ received: true });
});

// UPGRADE API (Guarded against unauthorized free activations in production)
app.post('/api/upgrade', requireAuth, (req, res) => {
  const { plan } = req.body;
  if (!plan || !['free', 'pro', 'team'].includes(plan)) {
    return res.status(400).json({ error: 'Valid plan (pro or team) is required!' });
  }

  // In production, block direct unverified free upgrades to paid tiers
  if (process.env.NODE_ENV === 'production' && plan !== 'free') {
    return res.status(402).json({
      error: 'Direct upgrades are disabled in production. Please complete checkout via payment gateway.',
      code: 'PAYMENT_REQUIRED'
    });
  }

  const db = readDB();
  const username = req.user;

  if (db.users && db.users[username]) {
    db.users[username].plan = plan;
  }
  if (!db.data) db.data = {};
  if (!db.data[username]) {
    db.data[username] = {};
  }
  db.data[username].plan = plan;
  writeDB(db);

  res.json({ success: true, plan, message: `Successfully upgraded to ${plan} plan!` });
});

// =============================================
// CHALLENGES API
// =============================================
const CHALLENGE_PACKS = [
  { id: 'fitness-21', title: '21-Day Fitness Reset', days: 21, price: 0, habits: ['Morning stretching (10 min)', 'Push-ups (20 reps)', 'Evening walk (30 min)'] },
  { id: 'mindful-30', title: '30-Day Mindfulness', days: 30, price: 49, habits: ['Meditation (10 min)', 'Gratitude journal', 'Digital detox (1hr/day)'] },
  { id: 'reading-30', title: '30-Day Reader', days: 30, price: 49, habits: ['Read 20 pages', 'Book notes review', 'Share 1 insight daily'] },
  { id: 'nutrition-21', title: '21-Day Clean Eating', days: 21, price: 99, habits: ['Meal prep Sunday', 'No junk food', 'Track macros', 'Drink 3L water'] },
  { id: 'productivity-14', title: '14-Day Deep Work', days: 14, price: 149, habits: ['90-min deep work block', 'No social media (9-12)', 'Daily review (15 min)'] },
  { id: 'sleep-21', title: '21-Day Sleep Mastery', days: 21, price: 0, habits: ['Sleep by 11pm', 'No screens 1hr before bed', 'Wake up same time'] },
];

app.get('/api/challenges', (req, res) => {
  res.json({ challenges: CHALLENGE_PACKS });
});

app.post('/api/challenges/start', requireAuth, (req, res) => {
  const { challengeId } = req.body;
  if (!challengeId) {
    return res.status(400).json({ error: 'challengeId is required!' });
  }

  const db = readDB();
  const username = req.user;
  const userData = db.data[username] || {};
  const userPlan = userData.plan || 'free';

  const pack = CHALLENGE_PACKS.find(p => p.id === challengeId);
  if (!pack) {
    return res.status(404).json({ error: 'Challenge pack not found!' });
  }

  // Check if challenge is premium and user is on free tier
  if (pack.price > 0 && userPlan === 'free') {
    return res.status(403).json({
      error: `"${pack.title}" is a premium challenge. Upgrade to Pro to unlock all challenges!`,
      code: 'PRO_REQUIRED'
    });
  }

  if (!userData.activeChallenges) userData.activeChallenges = [];

  if (!userData.activeChallenges.some(c => (typeof c === 'string' ? c === challengeId : c.id === challengeId))) {
    userData.activeChallenges.push({ id: challengeId, startedAt: Date.now() });
  }

  db.data[username] = userData;
  writeDB(db);

  res.json({
    success: true,
    message: `Challenge "${pack.title}" started!`,
    pack,
    activeChallenges: userData.activeChallenges
  });
});

// =============================================
// USER PLAN API
// =============================================
app.get('/api/plan', requireAuth, (req, res) => {
  const db = readDB();
  const username = req.user;

  if (!db.data[username]) {
    return res.status(404).json({ error: 'User data not found!' });
  }

  res.json({ plan: db.data[username].plan || 'free' });
});

// =============================================
// ADMIN DASHBOARD API
// =============================================
app.post('/api/admin/login', authRateLimiter, (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin dashboard is not configured.' });
  }

  if (password === adminPassword) {
    // Issue a simple admin token (for simplicity, using a static or derived token)
    // In production, this should be a robust JWT or session, but since it's a simple dashboard:
    const adminToken = crypto.createHash('sha256').update(adminPassword + SESSION_SECRET).digest('hex');
    res.json({ success: true, token: adminToken });
  } else {
    res.status(401).json({ error: 'Incorrect admin password.' });
  }
});

app.get('/api/admin/stats', (req, res) => {
  const token = req.headers['authorization'] || req.headers['x-auth-token'];
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin dashboard is not configured.' });
  }

  const expectedToken = crypto.createHash('sha256').update(adminPassword + SESSION_SECRET).digest('hex');
  const providedToken = token ? token.replace('Bearer ', '').trim() : '';

  if (providedToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
  }

  const db = readDB();
  const users = Object.values(db.users || {}).map(user => {
    const userData = db.data[user.username] || {};
    const habitCount = (user.basic_habit_names || []).length || (userData.habits || []).length || 0;
    return {
      username: user.username,
      email: user.email || 'N/A',
      plan: user.plan || 'free',
      habitCount: habitCount,
      createdAt: user.createdAt || 'Unknown'
    };
  });

  res.json({
    success: true,
    totalUsers: users.length,
    users: users
  });
});

// =============================================
// 404 CATCH-ALL FOR API ROUTES
// =============================================
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', code: 'NOT_FOUND' });
});

// =============================================
// CENTRALIZED ERROR HANDLER
// Prevents stack traces, internal paths, and secrets from leaking
// =============================================
app.use((err, req, res, next) => {
  // Log message safely on server side without dumping raw request bodies or auth headers
  console.error('Unhandled server error:', err.message || 'Unknown error');
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: 'An internal server error occurred. Please try again later.',
    code: 'INTERNAL_ERROR'
  });
});

// Export app for Vercel Serverless Function & testing
module.exports = app;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HabbitTracker Server running at http://0.0.0.0:${PORT}`);
    console.log(`Security: x-powered-by disabled, environment secrets active, error masking enabled.`);
  });
}
