const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://barbershop-fidelite.vercel.app',
  credentials: true
}));
app.use(express.json());

// Connexion à PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Modèles
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('client', 'admin'),
    defaultValue: 'client'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'visits',
  timestamps: true
});

const Reward = sequelize.define('Reward', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: 'Coupe gratuite'
  },
  description: {
    type: DataTypes.TEXT
  },
  requiredVisits: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  }
}, {
  tableName: 'rewards',
  timestamps: true
});

// Relations
User.hasMany(Visit, { foreignKey: 'userId' });
Visit.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Reward, { foreignKey: 'userId' });
Reward.belongsTo(User, { foreignKey: 'userId' });

// Initialisation
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connecté avec succès !');
    
    await sequelize.sync({ force: false });
    console.log('✅ Tables synchronisées');
    
    // Créer admin s'il n'existe pas
    const adminExists = await User.findOne({ where: { email: 'admin@barbershop.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@barbershop.com',
        password: hashedPassword,
        username: 'Admin',
        role: 'admin'
      });
      console.log('👑 Admin créé: admin@barbershop.com / admin123');
    }
    
    // Créer récompense par défaut
    const rewardExists = await Reward.findOne();
    if (!rewardExists) {
      await Reward.create({
        name: 'Coupe gratuite',
        description: 'Une coupe offerte après 5 visites',
        requiredVisits: 5
      });
      console.log('🎁 Récompense par défaut créée');
    }
    
  } catch (error) {
    console.error('❌ Erreur initialisation:', error.message);
  }
}

// ==================== ROUTES ====================

// Test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ Serveur Barbershop Fidélité fonctionnel !',
    database: 'PostgreSQL',
    status: 'online'
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
    
    // Vérifier si email existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Hasher mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer utilisateur
    const user = await User.create({
      email,
      password: hashedPassword,
      username: username || email.split('@')[0],
      role: 'client'
    });
    
    // Créer token QR
    const qrToken = jwt.sign(
      { userId: user.id, type: 'client_qr' },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );
    
    res.json({
      success: true,
      message: 'Compte créé avec succès !',
      userId: user.id,
      qrToken
    });
    
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Connexion
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    // Trouver utilisateur
    const user = await User.findOne({ 
      where: { email, isActive: true } 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Token QR (valide 1 an)
    const qrToken = jwt.sign(
      { 
        userId: user.id, 
        type: 'client_qr',
        timestamp: Date.now() 
      },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );
    
    // Compter visites
    const visitCount = await Visit.count({ where: { userId: user.id } });
    
    res.json({
      success: true,
      token,
      qrToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        visits: visitCount
      }
    });
    
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Scanner QR Code
app.post('/api/scan', async (req, res) => {
  try {
    const { qrToken } = req.body;
    
    if (!qrToken) {
      return res.status(400).json({ error: 'QR Code requis' });
    }
    
    // Vérifier token
    let decoded;
    try {
      decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'QR Code invalide ou expiré' });
    }
    
    if (decoded.type !== 'client_qr') {
      return res.status(400).json({ error: 'QR Code invalide' });
    }
    
    const userId = decoded.userId;
    
    // Vérifier utilisateur
    const user = await User.findByPk(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Ajouter visite
    await Visit.create({ userId });
    
    // Compter visites
    const visitCount = await Visit.count({ where: { userId } });
    
    // Vérifier récompense
    const reward = await Reward.findOne();
    let rewardMessage = null;
    
    if (reward && visitCount > 0 && visitCount % reward.requiredVisits === 0) {
      rewardMessage = `🎉 Félicitations ! Vous avez gagné : ${reward.name}`;
    }
    
    res.json({
      success: true,
      message: `Visite enregistrée ! Total : ${visitCount} visite(s)`,
      visits: visitCount,
      reward: rewardMessage,
      client: {
        name: user.username || user.email.split('@')[0],
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Erreur scan:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Dashboard utilisateur
app.get('/api/dashboard', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    
    // Vérifier token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Session expirée' });
    }
    
    const userId = decoded.id;
    
    // Récupérer utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Visites
    const visits = await Visit.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    const totalVisits = visits.length;
    const reward = await Reward.findOne();
    
    const progress = {
      current: totalVisits % (reward?.requiredVisits || 5),
      total: reward?.requiredVisits || 5,
      nextReward: reward?.name || 'Cadeau',
      percentage: Math.min(100, (totalVisits % (reward?.requiredVisits || 5)) / (reward?.requiredVisits || 5) * 100)
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
      visits: visits.map(v => ({
        id: v.id,
        date: v.createdAt,
        notes: v.notes
      }))
    });
    
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Liste utilisateurs (admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Visit,
        attributes: ['id', 'createdAt']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    const stats = {
      totalUsers: await User.count(),
      totalVisits: await Visit.count(),
      activeUsers: await User.count({ where: { isActive: true } }),
      rewardsGiven: await Reward.count()
    };
    
    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        role: u.role,
        isActive: u.isActive,
        visitsCount: u.Visits.length,
        lastVisit: u.Visits[0]?.createdAt || null
      })),
      stats
    });
    
  } catch (error) {
    console.error('Erreur admin users:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrer serveur
const PORT = process.env.PORT || 10000;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVEUR BARBERSHOP FIDÉLITÉ - VERSION RÉELLE');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 URL: https://barbershop-api-n73d.onrender.com`);
    console.log(`👑 Admin: admin@barbershop.com / admin123`);
    console.log(`💾 Base: PostgreSQL (Supabase)`);
    console.log('='.repeat(60));
  });
}).catch(error => {
  console.error('❌ Impossible de démarrer le serveur:', error);
});