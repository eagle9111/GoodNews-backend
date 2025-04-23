import express from "express";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";

const router = express.Router();

// Like a post
router.post("/like", async (req, res) => {
  const { postId, email } = req.body;
  try {
    const existingLike = await Like.findOne({ postId, email });
    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      return res.json({ message: "Like removed" });
    }

    const like = new Like({ postId, email });
    await like.save();
    res.status(201).json(like);
  } catch (err) {
    console.error("Error in /like route:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get likes for a post
router.get("/likes/:postId", async (req, res) => {
  try {
    const likes = await Like.find({ postId: req.params.postId });
    res.json(likes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's likes
router.get("/likes", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const likes = await Like.find({ email });
    res.json(likes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a comment
router.post("/comment", async (req, res) => {
  const { postId, email, fullName ,  content } = req.body;
  try {
    if (!content) return res.status(400).json({ message: "Comment content is required" });
    
    const comment = new Comment({ postId, email, fullName ,  content });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  const { fullName } = req.query; 

  try {
    const allComments = await Comment.find({ postId }).sort({ createdAt: -1 });

    let userComment = [];
    let otherComments = [];

    if (fullName) {
      userComment = allComments.filter(c => c.email === email);
      otherComments = allComments.filter(c => c.email !== email);
    } else {
      otherComments = allComments;
    }

    res.status(200).json([...userComment, ...otherComments]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Delete a comment
router.delete("/comment/:id", async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Add these new routes to posts.js

// Get total likes count for a post
router.get("/likes/count/:postId", async (req, res) => {
  try {
    const count = await Like.countDocuments({ postId: req.params.postId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total comments count for a post
router.get("/comments/count/:postId", async (req, res) => {
  try {
    const count = await Comment.countDocuments({ postId: req.params.postId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;