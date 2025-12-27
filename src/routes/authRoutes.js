const express = require('express');
const router = express.Router();

// GET /api/auth
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ruta de autenticación - En construcción'
  });
});

module.exports = router;