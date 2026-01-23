const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Autorise toutes les origines pour le moment
  credentials: true
}));
app.use(express.json());

// Stockage en mémoire (temporaire)
const users = [];
const visits = [];

// Route test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ Serveur Barbershop Fidélité fonctionnel !',
    usersCount: users.length,
    visitsCount: visits.length,
    version: '1.0.0-simple'
  });
});

// Inscription
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    console.log('📝 Inscription demandée:', email);
    
    // Validation simple
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email et mot de passe requis' 
      });
    }
    
    // Vérifier si email existe
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cet email est déjà utilisé' 
      });
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
      isActive: true,
      createdAt: new Date()
    };
    
    users.push(user);
    console.log('✅ Utilisateur créé:', user.email);
    
    // Créer token QR
    const qrToken = jwt.sign(
      { userId: user.id, type: 'client_qr' },
      process.env.JWT_SECRET || 'default-secret-key-123456',
      { expiresIn: '365d' }
    );
    
    res.json({
      success: true,
      message: 'Compte créé avec succès !',
      userId: user.id,
      qrToken
    });
    
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la création du compte' 
    });
  }
});

// Connexion
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔑 Connexion demandée:', email);
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email et mot de passe requis' 
      });
    }
    
    // Trouver utilisateur
    const user = users.find(u => u.email === email && u.isActive);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Vérifier mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Compter visites
    const userVisits = visits.filter(v => v.userId === user.id);
    
    // Tokens
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'default-secret-key-123456',
      { expiresIn: '7d' }
    );
    
    const qrToken = jwt.sign(
      { 
        userId: user.id, 
        type: 'client_qr',
        timestamp: Date.now() 
      },
      process.env.JWT_SECRET || 'default-secret-key-123456',
      { expiresIn: '365d' }
    );
    
    console.log('✅ Connexion réussie pour:', user.email);
    
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
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur de connexion au serveur' 
    });
  }
});

// Scanner QR Code
app.post('/api/scan', async (req, res) => {
  try {
    const { qrToken } = req.body;
    
    console.log('📱 Scan demandé');
    
    if (!qrToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'QR Code requis' 
      });
    }
    
    // Vérifier token (simplifié)
    let userId;
    try {
      const decoded = jwt.verify(qrToken, process.env.JWT_SECRET || 'default-secret-key-123456');
      userId = decoded.userId;
    } catch (err) {
      return res.status(400).json({ 
        success: false, 
        error: 'QR Code invalide ou expiré' 
      });
    }
    
    // Trouver utilisateur
    const user = users.find(u => u.id === userId && u.isActive);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    // Ajouter visite
    const visit = {
      id: 'visit_' + Date.now(),
      userId,
      date: new Date(),
      notes: 'Visite enregistrée via scan'
    };
    
    visits.push(visit);
    
    // Compter visites
    const userVisits = visits.filter(v => v.userId === userId);
    const visitCount = userVisits.length;
    
    // Vérifier récompense
    let rewardMessage = null;
    if (visitCount > 0 && visitCount % 5 === 0) {
      rewardMessage = `🎉 Félicitations ! Vous avez gagné : Coupe gratuite`;
    }
    
    console.log(`✅ Visite enregistrée pour ${user.email}, total: ${visitCount}`);
    
    res.json({
      success: true,
      message: `Visite enregistrée ! Total : ${visitCount} visite(s)`,
      visits: visitCount,
      reward: rewardMessage,
      client: {
        name: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur scan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors du scan' 
    });
  }
});

// Dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Non autorisé' 
      });
    }
    
    // Vérifier token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key-123456');
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expirée' 
      });
    }
    
    const userId = decoded.id;
    
    // Trouver utilisateur
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    // Récupérer visites
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
        date: v.date,
        notes: v.notes
      }))
    });
    
  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur de chargement' 
    });
  }
});

// Liste utilisateurs (admin)
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
        visitsCount: userVisits.length,
        lastVisit: userVisits[0]?.date || null,
        createdAt: user.createdAt
      };
    });
    
    const stats = {
      totalUsers: users.length,
      totalVisits: visits.length,
      activeUsers: users.filter(u => u.isActive).length,
      rewardsGiven: Math.floor(visits.length / 5)
    };
    
    res.json({
      success: true,
      users: usersWithVisits,
      stats
    });
    
  } catch (error) {
    console.error('❌ Erreur admin users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur' 
    });
  }
});

// Créer admin par défaut
async function initializeData() {
  // Admin
  const adminExists = users.find(u => u.email === 'admin@barbershop.com');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    users.push({
      id: 'admin_001',
      email: 'admin@barbershop.com',
      password: hashedPassword,
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
    const hashedPassword = await bcrypt.hash('test123', 10);
    users.push({
      id: 'client_test',
      email: 'client@test.com',
      password: hashedPassword,
      username: 'ClientTest',
      role: 'client',
      isActive: true,
      createdAt: new Date()
    });
    console.log('👤 Client test créé: client@test.com / test123');
  }
  
  console.log(`📊 ${users.length} utilisateurs chargés`);
}

// Démarrer serveur
const PORT = process.env.PORT || 10000;

initializeData().then(() => {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVEUR BARBERSHOP FIDÉLITÉ - SIMPLIFIÉ');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
    console.log(`👑 Admin: admin@barbershop.com / admin123`);
    console.log(`👤 Client: client@test.com / test123`);
    console.log('='.repeat(60));
    console.log('\n📡 En attente de requêtes...\n');
  });
}).catch(error => {
  console.error('❌ Erreur initialisation:', error);
});