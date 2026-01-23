const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// SQLite Database (fichier local, pas besoin de connexion Internet)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Modèles
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: 'client' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Visit = sequelize.define('Visit', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  notes: { type: DataTypes.TEXT }
});

const Reward = sequelize.define('Reward', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, defaultValue: 'Coupe gratuite' },
  requiredVisits: { type: DataTypes.INTEGER, defaultValue: 5 }
});

// Relations
User.hasMany(Visit, { foreignKey: 'userId' });
Visit.belongsTo(User, { foreignKey: 'userId' });

// Initialisation
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite connecté !');
    
    await sequelize.sync({ force: false });
    console.log('✅ Tables prêtes');
    
    // Admin
    const admin = await User.findOne({ where: { email: 'admin@barbershop.com' } });
    if (!admin) {
      await User.create({
        email: 'admin@barbershop.com',
        password: await bcrypt.hash('admin123', 10),
        username: 'Admin',
        role: 'admin'
      });
      console.log('👑 Admin créé');
    }
    
    // Client test
    const client = await User.findOne({ where: { email: 'client@test.com' } });
    if (!client) {
      await User.create({
        email: 'client@test.com',
        password: await bcrypt.hash('test123', 10),
        username: 'ClientTest',
        role: 'client'
      });
      console.log('👤 Client test créé');
    }
    
    // Récompense
    const reward = await Reward.findOne();
    if (!reward) {
      await Reward.create({ name: 'Coupe gratuite', requiredVisits: 5 });
      console.log('🎁 Récompense créée');
    }
    
  } catch (error) {
    console.error('❌ Erreur DB:', error.message);
  }
}

// ==================== ROUTES ====================
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: '✅ API Barbershop fonctionne !', db: 'SQLite' });
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Vérifier email
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email déjà utilisé' });
    
    // Créer utilisateur
    const user = await User.create({
      email,
      password: await bcrypt.hash(password, 10),
      username: username || email.split('@')[0],
      role: 'client'
    });
    
    // QR Token
    const qrToken = jwt.sign(
      { userId: user.id, type: 'qr' },
      process.env.JWT_SECRET || 'default-secret',
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

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trouver utilisateur
    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
    
    // Vérifier mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });
    
    // Tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
    
    const qrToken = jwt.sign(
      { userId: user.id, type: 'qr' },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '365d' }
    );
    
    // Visites
    const visits = await Visit.count({ where: { userId: user.id } });
    
    res.json({
      success: true,
      token,
      qrToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        visits
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur connexion' });
  }
});

// Démarrer serveur
const PORT = process.env.PORT || 10000;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 BARBERSHOP API - SQLITE VERSION');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log(`👑 Admin: admin@barbershop.com / admin123`);
    console.log(`👤 Client: client@test.com / test123`);
    console.log('💾 Database: SQLite (fichier local)');
    console.log('='.repeat(60));
  });
});