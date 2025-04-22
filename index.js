// index.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import newsRoute from './routes/new-route.js';
import cronJobs from './cron.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api', newsRoute);
cronJobs.startAll();
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
