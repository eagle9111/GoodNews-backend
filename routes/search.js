import express from 'express';
import mongoose from 'mongoose';
import News from '../models/News.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const query = {};

    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const [news, total] = await Promise.all([
      News.find(query)
        .sort({ pubDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      News.countDocuments(query)
    ]);

    res.json({
      news,
      pagination: { 
        total, 
        page, 
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;