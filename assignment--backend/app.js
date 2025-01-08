const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'school_payments.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    collect_id TEXT PRIMARY KEY,
    school_id TEXT,
    gateway TEXT,
    order_amount REAL,
    transaction_amount REAL,
    status TEXT,
    custom_order_id TEXT,
    bank_reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// JWT Secret
const JWT_SECRET = 'my-secret-key';

// Middleware for JWT authentication
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers['authorization'];
  const jwToken = authHeader && authHeader.split(' ')[1];

  if (!jwToken) {
    return response.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(jwToken, JWT_SECRET, (err, user) => {
    if (err) {
      return response.status(403).json({ error: 'Invalid or expired token' });
    }
    request.user = user;
    next();
  });
};

// 1. Fetch All Transactions
app.get('/api/transactions', authenticateToken, (request, response) => {
  const query = `
    SELECT collect_id, school_id, gateway, order_amount, 
           transaction_amount, status, custom_order_id
    FROM transactions
    ORDER BY created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }
    response.json(rows);
  });
});

// 2. Fetch Transactions by School
app.get('/api/transactions/school/:schoolId', authenticateToken, (request, response) => {
  const { schoolId } = request.params;
  
  const query = `
    SELECT *
    FROM transactions
    WHERE school_id = '${schoolId}'
    ORDER BY created_at DESC
  `;

  db.all(query,[] ,(err, rows) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }
    response.json(rows);
  });
});

// 3. Transaction Status Check
app.get('/api/transactions/status/:customOrderId', authenticateToken, (request, response) => {
  const { customOrderId } = request.params;

  const query = `
    SELECT status, collect_id, order_amount, transaction_amount, gateway
    FROM transactions
    WHERE custom_order_id = '${customOrderId}'
  `;

  db.get(query, [], (err, row) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }
    if (!row) {
      return response.status(404).json({ error: 'Transaction not found' });
    }
    response.json(row);
  });
});

// 4. Webhook for Status Updates
app.post('/api/webhook/transaction-status', (request, response) => {
  const { status, order_info } = request.body;
  
  if (!order_info || !order_info.order_id) {
    return response.status(400).json({ error: 'Invalid webhook payload' });
  }

  const query = `
    UPDATE transactions
    SET status = ?,
        transaction_amount = ?,
        gateway = ?,
        bank_reference = ?
    WHERE collect_id = ?
  `;

  db.run(
    query,
    [
      status === 200 ? 'SUCCESS' : 'FAILED',
      order_info.transaction_amount,
      order_info.gateway,
      order_info.bank_reference,
      order_info.order_id
    ],
    function(err) {
      if (err) {
        return response.status(500).json({ error: err.message });
      }
      response.json({ message: 'Transaction status updated successfully' });
    }
  );
});

// 5. Manual Status Update
app.post('/api/transactions/:collectId/status', authenticateToken, (request, response) => {
  const { collectId } = request.params;
  const { status } = request.body;

  if (!status) {
    return response.status(400).json({ error: 'Status is required' });
  }

  const query = `
    UPDATE transactions
    SET status = '${status}'
    WHERE collect_id = '${collectId}'
  `;

  db.run(query, [], function(err) {
    if (err) {
      return response.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return response.status(404).json({ error: 'Transaction not found' });
    }
    response.json({ message: 'Status updated successfully' });
  });
});

// Additional Task: Create Payment Transaction
app.post('/api/create-collect-request', authenticateToken, (request, response) => {
  const { school_id } = request.body;
  
  if (!school_id) {
    return response.status(400).json({ error: 'School ID is required' });
  }

  const collectId = `COL${Date.now()}`;
  const customOrderId = `ORD${Date.now()}`;

  const query = `
    INSERT INTO transactions (
      collect_id, school_id, custom_order_id, 
      order_amount, status, gateway
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [collectId, school_id, customOrderId, 0, 'PENDING', 'PENDING'],
    function(err) {
      if (err) {
        return response.status(500).json({ error: err.message });
      }
      
      // Generate payment link (mock implementation)
      const paymentLink = `https://payment-gateway.com/pay/${collectId}`;
      
      response.json({
        collect_id: collectId,
        custom_order_id: customOrderId,
        payment_link: paymentLink
      });
    }
  );
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});