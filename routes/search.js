// routes/search.js
import express from 'express';
import News from '../models/News.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, sort } = req.query;
    let sortOption = { pubDate: -1 };

    if (sort === 'likes') {
      sortOption = { likesCount: -1 };
    } else if (sort === 'comments') {
      sortOption = { commentsCount: -1 };
    }

    const results = await News.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { content: { $regex: q, $options: 'i' } }
          ]
        }
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes'
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' }
        }
      },
      { $sort: sortOption }
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;