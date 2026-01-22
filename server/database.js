const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

sequelize.authenticate()
  .then(() => console.log('✅ Base de données connectée'))
  .catch(err => console.error('❌ Erreur de connexion DB:', err));

module.exports = sequelize;