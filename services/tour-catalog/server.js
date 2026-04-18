require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'tour-catalog',
    timestamp: new Date().toISOString()
  });
});


app.get('/', (req, res) => {
  res.send('Chào mừng bạn đến với API Tour Catalog (Group A)!');
});


const tourRoutes = require('./src/routes/tourRoutes');
app.use('/api/tours', tourRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Tour Catalog Service đang chạy tại port: ${PORT}`);
});