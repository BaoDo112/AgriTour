require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const partnerRoutes = require('./src/routes/partnerRoutes');
const db = require('./src/config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/partners', partnerRoutes);

// Health endpoint
app.get('/health', (req, res) => {
  db.query('SELECT 1 AS ok', (err) => {
    if (err) {
      return res.status(500).json({
        status: 'DOWN',
        service: 'identity-partner',
        error: 'database_unavailable',
      });
    }

    res.status(200).json({ status: 'UP', service: 'identity-partner' });
  });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Identity Partner service running on port ${PORT}`);
});
