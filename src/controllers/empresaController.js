const db = require('../config/database');
const cloudinary = require('../config/cloudinary');

class EmpresaController {
  // Obtener todas las empresas
  async getAll(req, res, next) {
    try {
      const empresas = await db.query(`
        SELECT * FROM empresas 
        WHERE activo = TRUE 
        ORDER BY creado_en DESC
      `);
      
      res.json({
        success: true,
        count: empresas.length,
        data: empresas
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener empresa por ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const empresa = await db.findOne('empresas', { id, activo: true });
      
      if (!empresa) {
        return res.status(404).json({
          success: false,
          error: 'Empresa no encontrada'
        });
      }
      
      // Obtener productos de esta empresa
      const productos = await db.query(
        'SELECT * FROM productos WHERE empresa_id = ? AND disponible = TRUE',
        [id]
      );
      
      res.json({
        success: true,
        data: {
          ...empresa,
          productos: productos || []
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nueva empresa
  async create(req, res, next) {
    try {
      const { nombre, direccion, telefono, latitud, longitud } = req.body;
      
      // Validar campos requeridos
      if (!nombre || !direccion || !telefono) {
        return res.status(400).json({
          success: false,
          error: 'Nombre, dirección y teléfono son requeridos'
        });
      }
      
      const empresaData = {
        nombre,
        direccion,
        telefono,
        latitud: latitud || null,
        longitud: longitud || null,
        activo: true
      };
      
      const result = await db.insert('empresas', empresaData);
      
      res.status(201).json({
        success: true,
        message: 'Empresa creada exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar empresa
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Verificar que la empresa existe
      const empresa = await db.findOne('empresas', { id });
      if (!empresa) {
        return res.status(404).json({
          success: false,
          error: 'Empresa no encontrada'
        });
      }
      
      await db.update('empresas', updates, { id });
      
      res.json({
        success: true,
        message: 'Empresa actualizada exitosamente',
        data: { id, ...updates }
      });
    } catch (error) {
      next(error);
    }
  }

  // Subir/actualizar logo
  async uploadLogo(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ninguna imagen'
        });
      }
      
      // Verificar que la empresa existe
      const empresa = await db.findOne('empresas', { id });
      if (!empresa) {
        return res.status(404).json({
          success: false,
          error: 'Empresa no encontrada'
        });
      }
      
      // Subir a Cloudinary
      const uploadResult = await cloudinary.uploadLogoEmpresa(req.file.buffer, id);
      
      // Actualizar en la base de datos
      await db.update('empresas', { imagen_logo: uploadResult.secure_url }, { id });
      
      res.json({
        success: true,
        message: 'Logo actualizado exitosamente',
        data: {
          imageUrl: uploadResult.secure_url,
          empresaId: id
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar empresa (soft delete)
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const empresa = await db.findOne('empresas', { id });
      if (!empresa) {
        return res.status(404).json({
          success: false,
          error: 'Empresa no encontrada'
        });
      }
      
      await db.update('empresas', { activo: false }, { id });
      
      res.json({
        success: true,
        message: 'Empresa desactivada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar empresas por ubicación
  async buscarPorUbicacion(req, res, next) {
    try {
      const { lat, lng, radio = 5 } = req.query; // radio en km
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Se requieren coordenadas (lat, lng)'
        });
      }
      
      // Fórmula Haversine para calcular distancia
      const empresas = await db.query(`
        SELECT *,
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitud)) * 
          cos(radians(longitud) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitud))
        )) AS distancia
        FROM empresas
        WHERE activo = TRUE 
          AND latitud IS NOT NULL 
          AND longitud IS NOT NULL
        HAVING distancia < ?
        ORDER BY distancia
        LIMIT 20
      `, [lat, lng, lat, radio]);
      
      res.json({
        success: true,
        count: empresas.length,
        data: empresas
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmpresaController();