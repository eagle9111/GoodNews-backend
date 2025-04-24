import express from 'express';
import mongoose from 'mongoose';
import News from '../modals.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const query = {
      title: { $regex: searchTerm, $options: 'i' }
    };

    const news = await News.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await News.countDocuments(query);

    res.json({
      news,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'فشل البحث' });
  }
});

export default router;