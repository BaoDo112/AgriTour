require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./src/config/db');

app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
  db.query('SELECT 1 AS ok', (err) => {
    if (err) {
      return res.status(500).json({
        status: 'unhealthy',
        service: 'tour-catalog',
        timestamp: new Date().toISOString(),
        error: 'database_unavailable',
      });
    }

    res.status(200).json({
      status: 'healthy',
      service: 'tour-catalog',
      timestamp: new Date().toISOString(),
    });
  });
});


app.get('/', (req, res) => {
  res.send('Chào mừng bạn đến với API Tour Catalog (Group A)!');
});


const tourRoutes = require('./src/routes/tourRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const regionRoutes = require('./src/routes/regionRoutes');
app.use('/api/tours', tourRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/regions', regionRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Tour Catalog Service đang chạy tại port: ${PORT}`);
});