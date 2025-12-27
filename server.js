require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas (ahora con nombres correctos)
const empresaRoutes = require('./src/routes/empresaRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API de Delivery App - FUNCIONANDO',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      empresas: '/api/empresas',
      productos: '/api/productos',
      clientes: '/api/clientes',
      auth: '/api/auth'
    }
  });
});

// Usar rutas
app.use('/api/empresas', empresaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/auth', authRoutes);

// Ruta 404 - CORREGIDO
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    requestedUrl: req.originalUrl,
    availableRoutes: ['/', '/api/empresas', '/api/productos', '/api/clientes', '/api/auth']
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n=========================================');
  console.log('✅ SERVIDOR INICIADO CORRECTAMENTE');
  console.log('=========================================');
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🗄️  Base de datos: ${process.env.DB_NAME || 'db_demo_app'}`);
  console.log('=========================================\n');
});