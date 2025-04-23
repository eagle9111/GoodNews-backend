// routes/profile.js
import express from 'express';
import News from '../models/News.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';

const router = express.Router();

// Get all posts user has liked
router.get('/liked-posts/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Get all post IDs the user has liked
    const likes = await Like.find({ email });
    const postIds = likes.map(like => like.postId);
    
    // Get the full post details for these posts
    const posts = await News.find({ _id: { $in: postIds } })
      .sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts user has commented on
router.get('/commented-posts/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Get all unique post IDs the user has commented on
    const comments = await Comment.aggregate([
      { $match: { email } },
      { $group: { _id: "$postId" } }
    ]);
    
    const postIds = comments.map(c => c._id);
    
    // Get the full post details for these posts
    const posts = await News.find({ _id: { $in: postIds } })
      .sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;