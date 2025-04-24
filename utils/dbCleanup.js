import mongoose from 'mongoose';
import News from '../models/News.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';

export const checkAndCleanDB = async (daysToKeep = 365) => {
  if (mongoose.connection.readyState !== 1) {
    console.log('❌ MongoDB connection is not established yet.');
    return;
  }

  try {
    // Log current DB size for visibility
    const stats = await mongoose.connection.db.stats();
    const dbSizeMB = stats.storageSize / 1024 / 1024;
    console.log(`📊 DB size: ${dbSizeMB.toFixed(2)} MB`);

    // Calculate the cutoff date for deleting documents (daysToKeep)
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0]; // Extract the date part only (YYYY-MM-DD)

    console.log(`🧹 Deleting documents older than ${cutoffDateString} (${daysToKeep} days)`);

    // Filter news based on the string format of pubDate (YYYY-MM-DD)
    const oldNews = await News.find({
      pubDate: { $lt: `${cutoffDateString} 00:00:00` }
    }).select('_id pubDate').lean();

    if (oldNews.length === 0) {
      console.log('✅ No outdated news to delete.');
      return;
    }

    const idsToDelete = oldNews.map(n => n._id);

    // Delete news, likes, comments
    await News.deleteMany({ _id: { $in: idsToDelete } });
    await Like.deleteMany({ postId: { $in: idsToDelete } });
    await Comment.deleteMany({ postId: { $in: idsToDelete } });

    console.log(`✅ Deleted ${idsToDelete.length} old news articles and related likes/comments.`);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
  }
};
