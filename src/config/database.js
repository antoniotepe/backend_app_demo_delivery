const mysql = require('mysql2');

// Configuración del pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_demo_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00'
});

// Convertir a promesas
const promisePool = pool.promise();

// Función para probar conexión
async function testConnection() {
  try {
    const [rows] = await promisePool.query('SELECT NOW() as server_time, DATABASE() as database_name');
    console.log('✅ Conectado a MySQL:', {
      database: rows[0].database_name,
      serverTime: rows[0].server_time
    });
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    throw error;
  }
}

// Función para ejecutar queries con manejo de errores
async function query(sql, params = []) {
  try {
    const [rows] = await promisePool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Error en query:', {
      sql: sql.substring(0, 100) + '...',
      params,
      error: error.message
    });
    throw error;
  }
}

// Exportar funciones útiles
module.exports = {
  pool: promisePool,
  testConnection,
  query,
  
  // Funciones específicas
  async findOne(table, where) {
    const keys = Object.keys(where);
    const values = Object.values(where);
    const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
    
    const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
    const rows = await query(sql, values);
    return rows[0] || null;
  },
  
  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await query(sql, values);
    return { id: result.insertId, ...data };
  },
  
  async update(table, data, where) {
    const setKeys = Object.keys(data);
    const setValues = Object.values(data);
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    
    const setClause = setKeys.map(key => `${key} = ?`).join(', ');
    const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    await query(sql, [...setValues, ...whereValues]);
    return { success: true };
  }
};