import express from "express";
import News from "../models/News.js";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { query = "", sort = "likes", order = "desc", page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let sortField = "likesCount";
    if (sort === "comments") sortField = "commentsCount";
    if (sort === "date") sortField = "pubDate";

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
      { $skip: skip },
      { $limit: limitNum },
    ]);

    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
