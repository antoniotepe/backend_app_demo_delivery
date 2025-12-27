const express = require('express');
const router = express.Router();

// GET /api/empresas
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Lista de empresas',
    data: [
      { id: 1, nombre: 'Pizzería Don Carlos' },
      { id: 2, nombre: 'Sushi Fresh' },
      { id: 3, nombre: 'Burger House' }
    ]
  });
});

// GET /api/empresas/:id
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: `Empresa con ID ${req.params.id}`,
    data: { id: req.params.id, nombre: 'Empresa Ejemplo' }
  });
});

// POST /api/empresas
router.post('/', (req, res) => {
  const { nombre, direccion, telefono } = req.body;
  res.status(201).json({
    success: true,
    message: 'Empresa creada',
    data: { id: 100, nombre, direccion, telefono }
  });
});

module.exports = router;