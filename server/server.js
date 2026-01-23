const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Stockage en mémoire
const users = [];
const visits = [];

// Route test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ Barbershop API - PRÊT',
    users: users.length,
    version: '1.0.0'
  });
});

// Inscription
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    // Vérifier email
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }
    
    // Hasher mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer utilisateur
    const user = {
      id: 'user_' + Date.now(),
      email,
      password: hashedPassword,
      username: username || email.split('@')[0],
      role: 'client',
      isActive: true
    };
    
    users.push(user);
    
    // QR Token
    const qrToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '365d' }
    );
    
    res.json({ 
      success: true, 
      message: 'Compte créé !',
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
    
    // Trouver utilisateur
    const user = users.find(u => u.email === email && u.isActive);
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Visites
    const userVisits = visits.filter(v => v.userId === user.id);
    
    // Tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );
    
    const qrToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret123',
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

// Scanner
app.post('/api/scan', (req, res) => {
  try {
    const { qrToken } = req.body;
    
    if (!qrToken) {
      return res.status(400).json({ error: 'QR Code requis' });
    }
    
    // Décoder token
    let userId;
    try {
      const decoded = jwt.verify(qrToken, process.env.JWT_SECRET || 'secret123');
      userId = decoded.userId;
    } catch (err) {
      return res.status(400).json({ error: 'QR Code invalide' });
    }
    
    // Trouver utilisateur
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Ajouter visite
    visits.push({
      id: 'visit_' + Date.now(),
      userId,
      date: new Date()
    });
    
    // Compter visites
    const userVisits = visits.filter(v => v.userId === userId);
    const visitCount = userVisits.length;
    
    // Récompense
    let reward = null;
    if (visitCount > 0 && visitCount % 5 === 0) {
      reward = '🎉 Coupe gratuite gagnée !';
    }
    
    res.json({
      success: true,
      message: `Visite #${visitCount} enregistrée`,
      visits: visitCount,
      reward,
      client: {
        name: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Erreur scan' });
  }
});

// Dashboard
app.get('/api/dashboard', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    
    // Vérifier token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({ error: 'Session expirée' });
    }
    
    // Trouver utilisateur
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Visites
    const userVisits = visits
      .filter(v => v.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    const totalVisits = userVisits.length;
    
    const progress = {
      current: totalVisits % 5,
      total: 5,
      nextReward: 'Coupe gratuite',
      percentage: Math.min(100, (totalVisits % 5) / 5 * 100)
    };
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      totalVisits,
      progress,
      visits: userVisits.map(v => ({
        id: v.id,
        date: v.date
      }))
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Erreur dashboard' });
  }
});

// Admin users
app.get('/api/admin/users', (req, res) => {
  try {
    const usersWithVisits = users.map(user => {
      const userVisits = visits.filter(v => v.userId === user.id);
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        visitsCount: userVisits.length
      };
    });
    
    res.json({
      success: true,
      users: usersWithVisits,
      stats: {
        totalUsers: users.length,
        totalVisits: visits.length,
        activeUsers: users.filter(u => u.isActive).length
      }
    });
    
  } catch (error) {
    console.error('Admin error:', error);
    res.status(500).json({ error: 'Erreur admin' });
  }
});

// Ajouter admin par défaut
async function init() {
  // Admin
  const adminExists = users.find(u => u.email === 'admin@barbershop.com');
  if (!adminExists) {
    users.push({
      id: 'admin_001',
      email: 'admin@barbershop.com',
      password: await bcrypt.hash('admin123', 10),
      username: 'Admin',
      role: 'admin',
      isActive: true
    });
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
      isActive: true
    });
  }
}

// Démarrer
const PORT = process.env.PORT || 10000;

init().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  });
});