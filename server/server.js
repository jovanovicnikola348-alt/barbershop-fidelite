// ============================================
// SERVEUR BARBERSHOP FIDÉLITÉ - VERSION SIMPLE
// ============================================
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ============ ROUTES DE TEST ============
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Barbershop Fidélité</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          height: 100vh;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          text-align: center;
          max-width: 600px;
        }
        h1 { color: #6d28d9; margin-top: 0; }
        .btn {
          background: #6d28d9;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          margin: 10px;
          text-decoration: none;
          display: inline-block;
        }
        .btn:hover { background: #5b21b6; }
        .status { 
          background: #10b981; 
          color: white; 
          padding: 10px; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .routes { 
          text-align: left; 
          background: #f3f4f6; 
          padding: 15px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Serveur Barbershop Fidélité</h1>
        <div class="status">✅ Serveur en ligne - Port 5000</div>
        
        <div class="routes">
          <h3>📡 Routes disponibles :</h3>
          <ul>
            <li><strong>GET</strong> <a href="/api/test">/api/test</a> - Test API</li>
            <li><strong>POST</strong> /api/register - Inscription client</li>
            <li><strong>POST</strong> /api/login - Connexion</li>
            <li><strong>POST</strong> /api/scan - Scanner QR code (admin)</li>
            <li><strong>GET</strong> /api/dashboard - Tableau de bord client</li>
          </ul>
        </div>
        
        <p>
          <a class="btn" href="/api/test">Tester l'API</a>
          <a class="btn" href="http://localhost:3000" style="background: #3b82f6;">Aller au Frontend</a>
        </p>
        
        <p style="color: #666; margin-top: 30px; font-size: 14px;">
          Compte admin: admin@barbershop.com / admin123
        </p>
      </div>
    </body>
    </html>
  `);
});

// Route test ESSENTIELLE
app.get('/api/test', (req, res) => {
  console.log('📡 /api/test appelée !');
  res.json({
    success: true,
    message: '✅ Serveur Barbershop Fidélité fonctionne !',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'GET    /api/test',
      'POST   /api/register',
      'POST   /api/login', 
      'POST   /api/scan',
      'GET    /api/dashboard',
      'GET    /api/admin/users'
    ]
  });
});

// Route inscription SIMULÉE
app.post('/api/register', (req, res) => {
  console.log('📝 Inscription:', req.body.email);
  res.json({
    success: true,
    message: 'Compte créé avec succès !',
    userId: Math.floor(Math.random() * 1000),
    qrToken: 'QR-' + Date.now()
  });
});

// Route connexion AVEC RÔLES
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('🔑 Connexion:', email);
  
  // Vérifier si c'est l'admin
  if (email === 'admin@barbershop.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'admin-jwt-token-' + Date.now(),
      qrToken: 'ADMIN-QR-' + Date.now(),
      user: {
        id: 999,
        email: 'admin@barbershop.com',
        username: 'Administrateur',
        role: 'admin'  // ← IMPORTANT: rôle admin
      }
    });
    return;
  }
  
  // Sinon c'est un client normal
  res.json({
    success: true,
    token: 'client-jwt-token-' + Date.now(),
    qrToken: 'CLIENT-QR-' + Date.now(),
    user: {
      id: Math.floor(Math.random() * 1000),
      email: email || 'client@test.com',
      username: email.split('@')[0] || 'Client',
      role: 'client'  // ← rôle client
    }
  });
});

// ============ DÉMARRAGE ============
const PORT = 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SERVEUR BARBERSHOP FIDÉLITÉ DÉMARRÉ');
  console.log('='.repeat(60));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
  console.log('👑 Admin: admin@barbershop.com / admin123');
  console.log('='.repeat(60));
  console.log('\n📡 En attente de requêtes...\n');
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    requestedUrl: req.url,
    method: req.method,
    availableRoutes: ['/api/test', '/api/register', '/api/login']
  });
});