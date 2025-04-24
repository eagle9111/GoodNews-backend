import express from "express";
import News from "../models/News.js";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";

const router = express.Router();

// GET /api/search?query=&sort=likes&order=desc
router.get("/", async (req, res) => {
  try {
    const { query = "", sort = "date", order = "desc" } = req.query;

    let sortField = "createdAt";
    if (sort === "likes") sortField = "likesCount";
    if (sort === "comments") sortField = "commentsCount";

    const news = await News.aggregate([
      {
        $match: {
          title: { $regex: query, $options: "i" },
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "title",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "title",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
        },
      },
      {
        $sort: {
          [sortField]: order === "asc" ? 1 : -1,
        },
      },
      { $limit: 50 },
    ]);

    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;