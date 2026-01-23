const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Configuration
const CONFIG = {
  PORT: 10000,
  JWT_SECRET: 'barbershop-secret-key-2024-change-this',
  FRONTEND_URL: 'https://barbershop-fidelite.vercel.app'
};

// Middleware
app.use(cors({
  origin: CONFIG.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Stockage
const users = [];
const visits = [];

// ==================== ROUTES ====================

// Test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ Barbershop Fidélité API - EN LIGNE',
    time: new Date().toISOString(),
    users: users.length,
    visits: visits.length
  });
});

// Inscription
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }
    
    const user = {
      id: 'user_' + Date.now(),
      email,
      password: await bcrypt.hash(password, 10),
      username: username || email.split('@')[0],
      role: 'client',
      isActive: true,
      createdAt: new Date()
    };
    
    users.push(user);
    
    const qrToken = jwt.sign(
      { userId: user.id, type: 'qr' },
      CONFIG.JWT_SECRET,
      { expiresIn: '365d' }
    );
    
    res.json({ 
      success: true, 
      message: 'Compte créé avec succès !',
      userId: user.id,
      qrToken
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur création compte' });
  }
});

// Connexion
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    const user = users.find(u => u.email === email && u.isActive);
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const userVisits = visits.filter(v => v.userId === user.id);
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const qrToken = jwt.sign(
      { userId: user.id, type: 'qr' },
      CONFIG.JWT_SECRET,
      { expiresIn: '365d' }
    );
    
    res.json({
      success: true,
      token,
      qrToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        visits: userVisits.length
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur connexion' });
  }
});

// Initialiser données
async function initData() {
  // Admin
  const adminExists = users.find(u => u.email === 'admin@barbershop.com');
  if (!adminExists) {
    users.push({
      id: 'admin_001',
      email: 'admin@barbershop.com',
      password: await bcrypt.hash('admin123', 10),
      username: 'Admin',
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    });
    console.log('👑 Admin créé: admin@barbershop.com / admin123');
  }
  
  // Client test
  const clientExists = users.find(u => u.email === 'client@test.com');
  if (!clientExists) {
    users.push({
      id: 'client_001',
      email: 'client@test.com',
      password: await bcrypt.hash('test123', 10),
      username: 'ClientTest',
      role: 'client',
      isActive: true,
      createdAt: new Date()
    });
    console.log('👤 Client créé: client@test.com / test123');
  }
}

// Démarrer serveur
app.listen(CONFIG.PORT, async () => {
  await initData();
  console.log('\n' + '='.repeat(60));
  console.log('🚀 BARBERSHOP FIDÉLITÉ API - EN LIGNE !');
  console.log('='.repeat(60));
  console.log(`📍 Port: ${CONFIG.PORT}`);
  console.log(`🔗 URL: https://barbershop-api-n73d.onrender.com`);
  console.log(`👑 Admin: admin@barbershop.com / admin123`);
  console.log(`👤 Client: client@test.com / test123`);
  console.log('='.repeat(60));
});