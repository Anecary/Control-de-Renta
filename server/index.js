import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initDatabase } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now;');
    res.json({ status: 'ok', db: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ================= TENANTS =================

// GET all tenants
app.get('/api/tenants', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        building_id AS "buildingId", 
        dpto, 
        name, 
        payment_day AS "paymentDay", 
        phone, 
        notes, 
        is_vacant AS "isVacant"
      FROM tenants
      ORDER BY 
        building_id,
        CASE 
          WHEN dpto = 'PH' THEN 999
          ELSE CAST(NULLIF(regexp_replace(dpto, '[^0-9]', '', 'g'), '') AS INTEGER)
        END ASC,
        dpto ASC;
    `);

    // Group by building
    const grouped = {
      marmota: [],
      cuyo: [],
      mapache: [],
      suites_ardillas: []
    };

    result.rows.forEach(t => {
      if (grouped[t.buildingId]) {
        grouped[t.buildingId].push(t);
      }
    });

    res.json({ success: true, data: grouped });
  } catch (err) {
    console.error('Error fetching tenants:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST / PUT Tenant (Upsert)
app.post('/api/tenants', async (req, res) => {
  const { id, buildingId, dpto, name, paymentDay, phone, notes, isVacant } = req.body;
  try {
    const tenantId = id || `tenant-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO tenants (id, building_id, dpto, name, payment_day, phone, notes, is_vacant, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (id) DO UPDATE SET
         building_id = EXCLUDED.building_id,
         dpto = EXCLUDED.dpto,
         name = EXCLUDED.name,
         payment_day = EXCLUDED.payment_day,
         phone = EXCLUDED.phone,
         notes = EXCLUDED.notes,
         is_vacant = EXCLUDED.is_vacant,
         updated_at = NOW()
       RETURNING 
         id, 
         building_id AS "buildingId", 
         dpto, 
         name, 
         payment_day AS "paymentDay", 
         phone, 
         notes, 
         is_vacant AS "isVacant";`,
      [tenantId, buildingId, dpto, name, paymentDay || null, phone || '', notes || '', !!isVacant]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error saving tenant:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Tenant
app.delete('/api/tenants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tenants WHERE id = $1;', [id]);
    res.json({ success: true, message: 'Tenant deleted successfully' });
  } catch (err) {
    console.error('Error deleting tenant:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= PAYMENTS =================

// GET all payments (optionally by year)
app.get('/api/payments', async (req, res) => {
  const { year } = req.query;
  try {
    let query = `
      SELECT 
        id, 
        tenant_id AS "tenantId", 
        building_id AS "buildingId", 
        month, 
        year, 
        CAST(amount AS DOUBLE PRECISION) AS amount, 
        TO_CHAR(paid_at, 'YYYY-MM-DD') AS "paidAt", 
        payment_method AS "paymentMethod", 
        notes
      FROM payments
    `;
    const params = [];
    if (year) {
      query += ' WHERE year = $1';
      params.push(parseInt(year, 10));
    }
    query += ' ORDER BY year DESC, month ASC;';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST / PUT Payment (Upsert)
app.post('/api/payments', async (req, res) => {
  const { id, tenantId, buildingId, month, year, amount, paidAt, paymentMethod, notes } = req.body;
  try {
    const paymentId = id || `pay-${tenantId}-${year}-${month}-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO payments (id, tenant_id, building_id, month, year, amount, paid_at, payment_method, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (tenant_id, month, year) DO UPDATE SET
         building_id = EXCLUDED.building_id,
         amount = EXCLUDED.amount,
         paid_at = EXCLUDED.paid_at,
         payment_method = EXCLUDED.payment_method,
         notes = EXCLUDED.notes,
         updated_at = NOW()
       RETURNING 
         id, 
         tenant_id AS "tenantId", 
         building_id AS "buildingId", 
         month, 
         year, 
         CAST(amount AS DOUBLE PRECISION) AS amount, 
         TO_CHAR(paid_at, 'YYYY-MM-DD') AS "paidAt", 
         payment_method AS "paymentMethod", 
         notes;`,
      [paymentId, tenantId, buildingId, month, year, amount, paidAt || null, paymentMethod || 'Transferencia', notes || '']
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error saving payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Payment
app.delete('/api/payments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM payments WHERE id = $1;', [id]);
    res.json({ success: true, message: 'Payment deleted' });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= EXPENSES =================

// GET all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') AS date, 
        CAST(amount AS DOUBLE PRECISION) AS amount, 
        category, 
        building_id AS "buildingId", 
        notes
      FROM expenses
      ORDER BY date DESC, created_at DESC;
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST / PUT Expense
app.post('/api/expenses', async (req, res) => {
  const { id, date, amount, category, buildingId, notes } = req.body;
  try {
    const expenseId = id || `exp-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO expenses (id, date, amount, category, building_id, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO UPDATE SET
         date = EXCLUDED.date,
         amount = EXCLUDED.amount,
         category = EXCLUDED.category,
         building_id = EXCLUDED.building_id,
         notes = EXCLUDED.notes,
         updated_at = NOW()
       RETURNING 
         id, 
         TO_CHAR(date, 'YYYY-MM-DD') AS date, 
         CAST(amount AS DOUBLE PRECISION) AS amount, 
         category, 
         building_id AS "buildingId", 
         notes;`,
      [expenseId, date, amount, category, buildingId, notes || '']
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error saving expense:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Expense
app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM expenses WHERE id = $1;', [id]);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server & Init DB
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [API Server] Servidor backend PostgreSQL corriendo en http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Error iniciando servidor PostgreSQL:', err);
});
