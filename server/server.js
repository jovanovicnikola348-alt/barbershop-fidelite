      'GET    /api/dashboard',
      'POST   /api/scan',
      'GET    /api/admin/users'
    ]
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
      isActive: true
    };
    
    users.push(user);
    
    const qrToken = jwt.sign({ userId: user.id }, 'secret123', { expiresIn: '365d' });
    
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
      'secret123',
      { expiresIn: '7d' }
    );
    
    const qrToken = jwt.sign(
      { userId: user.id },
      'secret123',
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
      const decoded = jwt.verify(token, 'secret123');
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
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
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
        date: v.date || new Date()
      }))
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Erreur dashboard' });
  }
});

// Scanner QR Code
app.post('/api/scan', (req, res) => {
  try {
    const { qrToken } = req.body;
    
    if (!qrToken) {
      return res.status(400).json({ error: 'QR Code requis' });
    }
    
    // Décoder token
    let userId;
    try {
      const decoded = jwt.verify(qrToken, 'secret123');
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
        isActive: true,
        visitsCount: userVisits.length,
        lastVisit: userVisits[0]?.date || null
      };
    });
    
    const stats = {
      totalUsers: users.length,
      totalVisits: visits.length,
      activeUsers: users.length,
      rewardsGiven: Math.floor(visits.length / 5)
    };
    
    res.json({
      success: true,
      users: usersWithVisits,
      stats
    });
    
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Erreur admin' });
  }
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'Barbershop Fidélité API',
    version: '1.0.0',
    status: 'online',
    users: users.length,
    visits: visits.length
  });
});

// Initialisation
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
      isActive: true
    });
    console.log('👤 Client créé: client@test.com / test123');
  }
}

// Démarrer
const PORT = 10000;

init().then(() => {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 BARBERSHOP API COMPLÈTE - EN LIGNE !');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 API: https://barbershop-api-n73d.onrender.com`);
    console.log(`🌐 Frontend: https://barbershop-fidelite.vercel.app`);
    console.log(`👑 Admin: admin@barbershop.com / admin123`);
    console.log('='.repeat(60));
  });
});