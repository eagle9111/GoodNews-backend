// index.js
import express from 'express';
import mongoose from 'mongoose';
import newsRoute from './routes/new-route.js';
import cronJobs from './cron.js';
import postsRoutes from "./routes/posts.js";
import profileRoutes from "./routes/profile.js";
import searchRoute from "./routes/search.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
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
app.use("/api/posts", postsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoute);

cronJobs.startAll();
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
