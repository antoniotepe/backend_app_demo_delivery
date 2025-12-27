const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función para subir imagen desde buffer
const uploadFromBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'delivery_app',
        public_id: options.public_id,
        overwrite: options.overwrite || true,
        transformation: options.transformation || [
          { width: 800, height: 600, crop: 'limit', quality: 'auto' }
        ],
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Funciones específicas para diferentes tipos de imágenes
const uploadLogoEmpresa = async (buffer, empresaId) => {
  return uploadFromBuffer(buffer, {
    folder: 'delivery_app/empresas/logos',
    public_id: `logo_empresa_${empresaId}`,
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
  });
};

const uploadImagenProducto = async (buffer, productoId) => {
  return uploadFromBuffer(buffer, {
    folder: 'delivery_app/productos',
    public_id: `producto_${productoId}_${Date.now()}`,
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }]
  });
};

const uploadPerfilCliente = async (buffer, clienteId) => {
  return uploadFromBuffer(buffer, {
    folder: 'delivery_app/clientes/perfiles',
    public_id: `perfil_cliente_${clienteId}`,
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
  });
};

// Función para eliminar imagen
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadFromBuffer,
  uploadLogoEmpresa,
  uploadImagenProducto,
  uploadPerfilCliente,
  deleteImage
};