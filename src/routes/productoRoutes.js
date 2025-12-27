const express = require('express');
const router = express.Router();

// GET /api/productos
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Lista de productos',
    data: [
      { id: 1, nombre: 'Pizza Hawaiana', precio: 12.99 },
      { id: 2, nombre: 'Sushi Roll', precio: 15.99 },
      { id: 3, nombre: 'Burger Mega', precio: 18.99 }
    ]
  });
});

module.exports = router;