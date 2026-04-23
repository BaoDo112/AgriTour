require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const partnerRoutes = require('./src/routes/partnerRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/partners', partnerRoutes);

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'identity-partner' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Identity Partner service running on port ${PORT}`);
});
