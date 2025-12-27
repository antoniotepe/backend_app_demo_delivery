const express = require('express');
const router = express.Router();

// GET /api/clientes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ruta de clientes - En construcción'
  });
});

module.exports = router;