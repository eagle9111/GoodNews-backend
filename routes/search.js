import express from 'express';
import mongoose from 'mongoose';
import News from '../models/News.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q: searchTerm, category, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const query = {};

    // Add search term filter
    if (searchTerm) {
      query.title = { $regex: searchTerm, $options: 'i' };
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add date range filter
    if (startDate && endDate) {
      query.pubDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

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