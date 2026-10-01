import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('⚠️ [PostgreSQL] ERROR: DATABASE_URL is not defined in .env');
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Seed data
const INITIAL_TENANTS_DATA = [
  // Marmota
  { id: 'mar-1', building_id: 'marmota', dpto: '1', name: 'Luis', payment_day: 24, notes: '' },
  { id: 'mar-2', building_id: 'marmota', dpto: '2', name: 'Claudia', payment_day: 18, notes: '' },
  { id: 'mar-3', building_id: 'marmota', dpto: '3', name: 'Jesús', payment_day: 4, notes: '' },
  { id: 'mar-4', building_id: 'marmota', dpto: '4', name: 'David', payment_day: 13, notes: '' },
  { id: 'mar-5', building_id: 'marmota', dpto: '5', name: 'Wiliam', payment_day: 8, notes: '' },
  { id: 'mar-6', building_id: 'marmota', dpto: '6', name: 'Suki', payment_day: 1, notes: '' },
  { id: 'mar-7', building_id: 'marmota', dpto: '7', name: 'Miguel', payment_day: 4, notes: '' },
  { id: 'mar-8', building_id: 'marmota', dpto: '8', name: 'Maya', payment_day: 26, notes: '' },
  { id: 'mar-9', building_id: 'marmota', dpto: '9', name: 'Omar Nieves', payment_day: null, notes: '' },
  { id: 'mar-10', building_id: 'marmota', dpto: '10', name: 'Lizeth', payment_day: 23, notes: '' },
  { id: 'mar-11', building_id: 'marmota', dpto: '11', name: 'Amashi', payment_day: null, notes: '' },
  { id: 'mar-12', building_id: 'marmota', dpto: '12', name: 'Gabriela', payment_day: 26, notes: '' },
  { id: 'mar-13', building_id: 'marmota', dpto: '13', name: 'Señor Héctor', payment_day: 28, notes: '' },
  { id: 'mar-14', building_id: 'marmota', dpto: '14', name: 'Olga', payment_day: 25, notes: '' },
  { id: 'mar-15', building_id: 'marmota', dpto: '15', name: 'Jess', payment_day: 21, notes: '' },
  { id: 'mar-16', building_id: 'marmota', dpto: '16', name: 'Jesica Paola', payment_day: 18, notes: '' },
  { id: 'mar-17', building_id: 'marmota', dpto: '17', name: 'Víctor', payment_day: 16, notes: '' },

  // Cuyo
  { id: 'cuy-1', building_id: 'cuyo', dpto: '1', name: 'Kenia', payment_day: 9, notes: '' },
  { id: 'cuy-2', building_id: 'cuyo', dpto: '2', name: 'Ana', payment_day: 30, notes: '' },
  { id: 'cuy-3', building_id: 'cuyo', dpto: '3', name: 'Rosa', payment_day: 1, notes: '' },
  { id: 'cuy-4', building_id: 'cuyo', dpto: '4', name: 'Rosy', payment_day: 1, notes: '' },
  { id: 'cuy-5', building_id: 'cuyo', dpto: '5', name: 'Ané', payment_day: 8, notes: '' },
  { id: 'cuy-6', building_id: 'cuyo', dpto: '6', name: 'Cynthia', payment_day: 17, notes: '' },
  { id: 'cuy-7', building_id: 'cuyo', dpto: '7', name: 'Diego', payment_day: 6, notes: '' },
  { id: 'cuy-8', building_id: 'cuyo', dpto: '8', name: 'Erick', payment_day: 30, notes: '' },
  { id: 'cuy-9', building_id: 'cuyo', dpto: '9', name: 'Jessica', payment_day: 20, notes: '' },
  { id: 'cuy-10', building_id: 'cuyo', dpto: '10', name: 'Irelys', payment_day: 15, notes: '' },

  // Mapache
  { id: 'map-1', building_id: 'mapache', dpto: '1', name: 'Jocelyn', payment_day: 16, notes: '' },
  { id: 'map-2', building_id: 'mapache', dpto: '2', name: 'Albania', payment_day: 29, notes: '' },
  { id: 'map-3', building_id: 'mapache', dpto: '3', name: 'Edison', payment_day: 3, notes: '' },
  { id: 'map-4', building_id: 'mapache', dpto: '4', name: 'Calep', payment_day: 1, notes: '' },
  { id: 'map-5', building_id: 'mapache', dpto: '5', name: 'Marco', payment_day: 6, notes: '' },
  { id: 'map-6', building_id: 'mapache', dpto: '6', name: 'Serafín', payment_day: 30, notes: '' },
  { id: 'map-7', building_id: 'mapache', dpto: '7', name: 'Alejandro', payment_day: 7, notes: 'Sin amueblar' },
  { id: 'map-8', building_id: 'mapache', dpto: '8', name: 'Alexander', payment_day: 14, notes: '' },
  { id: 'map-9', building_id: 'mapache', dpto: '9', name: 'Suko', payment_day: 9, notes: '' },
  { id: 'map-10', building_id: 'mapache', dpto: '10', name: 'Javier', payment_day: 18, notes: '' },
  { id: 'map-11', building_id: 'mapache', dpto: '11', name: 'Lili', payment_day: null, notes: 'Personal / Sin fecha' },
  { id: 'map-12', building_id: 'mapache', dpto: '12', name: 'Antonia', payment_day: 3, notes: '' },
  { id: 'map-13', building_id: 'mapache', dpto: '13', name: 'Carolina', payment_day: 4, notes: '' },
  { id: 'map-14', building_id: 'mapache', dpto: '14', name: 'Joaquín', payment_day: 14, notes: '' },
  { id: 'map-15', building_id: 'mapache', dpto: '15', name: 'Diana Antonio', payment_day: null, notes: '' },

  // Suites Ardillas
  { id: 'ard-2', building_id: 'suites_ardillas', dpto: '2', name: 'Julio', payment_day: 30, notes: '' },
  { id: 'ard-3', building_id: 'suites_ardillas', dpto: '3', name: 'Blanca', payment_day: 30, notes: '' },
  { id: 'ard-4', building_id: 'suites_ardillas', dpto: '4', name: 'Héctor', payment_day: 15, notes: '' },
  { id: 'ard-5', building_id: 'suites_ardillas', dpto: '5', name: 'Mario', payment_day: 2, notes: '' },
  { id: 'ard-6', building_id: 'suites_ardillas', dpto: '6', name: 'Anna', payment_day: 4, notes: '' },
  { id: 'ard-7', building_id: 'suites_ardillas', dpto: '7', name: 'Verónica', payment_day: 25, notes: '' },
  { id: 'ard-8', building_id: 'suites_ardillas', dpto: '8', name: '(Disponible)', payment_day: null, is_vacant: true, notes: '' },
  { id: 'ard-9', building_id: 'suites_ardillas', dpto: '9', name: 'Meli', payment_day: 17, notes: '' },
  { id: 'ard-10', building_id: 'suites_ardillas', dpto: '10', name: 'Daya', payment_day: 19, notes: '' },
  { id: 'ard-11', building_id: 'suites_ardillas', dpto: '11', name: 'Antoni', payment_day: 1, notes: '' },
  { id: 'ard-12', building_id: 'suites_ardillas', dpto: '12', name: '(Disponible)', payment_day: null, is_vacant: true, notes: '' },
  { id: 'ard-13', building_id: 'suites_ardillas', dpto: '13', name: '(Disponible)', payment_day: null, is_vacant: true, notes: '' },
  { id: 'ard-14', building_id: 'suites_ardillas', dpto: '14', name: 'Mar', payment_day: 8, notes: '' },
  { id: 'ard-15', building_id: 'suites_ardillas', dpto: '15', name: 'Beberly', payment_day: 18, notes: '' },
  { id: 'ard-16', building_id: 'suites_ardillas', dpto: '16', name: 'Alejandra', payment_day: 30, notes: '' },
  { id: 'ard-17', building_id: 'suites_ardillas', dpto: '17', name: 'Cyn', payment_day: null, notes: '' },
  { id: 'ard-18', building_id: 'suites_ardillas', dpto: '18', name: 'Verónica', payment_day: 30, notes: '' },
  { id: 'ard-ph', building_id: 'suites_ardillas', dpto: 'PH', name: 'Sara', payment_day: null, notes: 'Penthouse' }
];

export async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('📦 [PostgreSQL] Conectando a Neon DB e inicializando tablas...');

    // 1. Table Tenants
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(100) PRIMARY KEY,
        building_id VARCHAR(50) NOT NULL,
        dpto VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        payment_day INTEGER,
        phone VARCHAR(50),
        notes TEXT,
        is_vacant BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Table Payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(100) PRIMARY KEY,
        tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        building_id VARCHAR(50) NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        paid_at DATE,
        payment_method VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_tenant_month_year UNIQUE (tenant_id, month, year)
      );
    `);

    // 3. Table Expenses
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(100) PRIMARY KEY,
        date DATE NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        building_id VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Check if tenants exist; if not, seed initial data
    const countRes = await client.query('SELECT COUNT(*) FROM tenants;');
    const count = parseInt(countRes.rows[0].count, 10);

    if (count === 0) {
      console.log('🌱 [PostgreSQL] Poblacion inicial de datos en Neon DB...');
      for (const t of INITIAL_TENANTS_DATA) {
        await client.query(
          `INSERT INTO tenants (id, building_id, dpto, name, payment_day, phone, notes, is_vacant)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING;`,
          [t.id, t.building_id, t.dpto, t.name, t.payment_day, '', t.notes || '', t.is_vacant || false]
        );
      }

      // Initial Expense
      await client.query(
        `INSERT INTO expenses (id, date, amount, category, building_id, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING;`,
        [
          'exp-1',
          new Date().toISOString().split('T')[0],
          1450.00,
          'Internet y televisión',
          'general',
          'Servicio mensual de internet y televisión para áreas comunes'
        ]
      );
      console.log('✅ [PostgreSQL] Datos iniciales de los 4 edificios creados exitosamente.');
    } else {
      console.log(`✅ [PostgreSQL] Base de datos lista con ${count} departamentos.`);
    }
  } catch (err) {
    console.error('❌ [PostgreSQL] Error inicializando base de datos:', err);
    throw err;
  } finally {
    client.release();
  }
}
