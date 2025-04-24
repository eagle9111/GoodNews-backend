import express from 'express';
import News from '../modals.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { 
      q, 
      source, 
      dateFrom, 
      dateTo,
      sortBy = 'pubDate',  // Default sort field
      sortOrder = 'desc'   // Default sort order
    } = req.query;
    
    const query = {};
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    if (q) query.$text = { $search: q };
    if (source) query.source_id = source;
    if (dateFrom || dateTo) {
      query.pubDate = {};
      if (dateFrom) query.pubDate.$gte = new Date(dateFrom);
      if (dateTo) query.pubDate.$lte = new Date(dateTo);
    }

    const results = await News.find(query)
                             .sort(sort)
                             .exec();
                             
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;