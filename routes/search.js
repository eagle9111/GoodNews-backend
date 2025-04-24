import express from 'express';
import mongoose from 'mongoose';
import News from '../models/News.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q: searchTerm, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const query = {};

    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      query.pubDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
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
    res.status(500).json({ error: 'فشل البحث' });
  }
});

export default router;