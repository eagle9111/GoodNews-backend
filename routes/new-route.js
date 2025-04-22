// routes/new-route.js
const express = require('express');
const axios = require('axios');
const News = require('../models/News');
require('dotenv').config();

const router = express.Router();

// routes/new-route.js
router.get('/fetch-news', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API;
    const response = await axios.get('https://newsdata.io/api/1/news', {
      params: {
        apikey: apiKey,
        country: 'lb',
        language: 'ar',
      },
    });

    const articles = response.data.results || [];

    if (articles.length === 0) {
      return res.status(404).json({ message: 'No articles found' });
    }

    const addedArticles = [];
    let count = 0;

    for (const article of articles) {
      if (count >= 10) break;

      const exists = await News.findOne({ title: article.title });
      if (!exists) {
        try {
          await News.create({
            title: article.title,
            link: article.link,
            pubDate: article.pubDate,
            description: article.description,
            content: article.content,
            source_id: article.source_id,
            image_url: article.image_url,
            video_url: article.video_url || '',
            creator: article.creator,
          });
          addedArticles.push(article);
          count++;
        } catch (err) {
          console.log('⏭ Skipping failed insert:', err.message);
        }
      }
    }

    res.status(200).json({ message: `${addedArticles.length} new unique articles saved.` });

  } catch (err) {
    console.error('❌ Error in fetch-news:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch or save news' });
  }
});

// GET /api/news - fetch saved news from MongoDB
router.get('/news', async (req, res) => {
  try {
    const news = await News.find().sort({ pubDate: -1 }).limit(20); // Latest 20 articles
    res.status(200).json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve news' });
  }
});
// GET /news/:id - fetch single article by ID
router.get('/news/:id', async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(200).json(article);
  } catch (err) {
    console.error('❌ Failed to fetch article by ID:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});


module.exports = router;
