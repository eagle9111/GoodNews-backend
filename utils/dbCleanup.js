import mongoose from 'mongoose';
import News from '../models/News.js'; // Make sure to import your models
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';

export const checkAndCleanDB = async (force = false) => {
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ MongoDB connection is not established yet.');
      return;
    }
  
    try {
      const stats = await mongoose.connection.db.stats();
      const dbSizeMB = stats.storageSize / 1024 / 1024;
      console.log(`📊 TEST MODE: Current DB size: ${dbSizeMB.toFixed(2)}MB`);
      
      // TEST SETTINGS (2MB threshold, delete 0.5MB)
      const TEST_THRESHOLD_MB = 500;
      const DELETE_TARGET_MB = 50;

      if (force || dbSizeMB > TEST_THRESHOLD_MB) {
        console.log(`⚠️ TEST TRIGGER: DB exceeds ${TEST_THRESHOLD_MB}MB threshold`);
        
        // Get accurate average document size
        const sampleDoc = await News.findOne().lean();
        const avgDocSizeBytes = sampleDoc ? Buffer.byteLength(JSON.stringify(sampleDoc)) : 1024;
        const avgDocSizeMB = avgDocSizeBytes / 1024 / 1024;
        
        const docsToDelete = Math.ceil(DELETE_TARGET_MB / avgDocSizeMB);
        console.log(`🔍 TEST CALCULATION: Need to delete ${docsToDelete} docs (~${avgDocSizeMB.toFixed(4)}MB each)`);

        const oldNews = await News.find({})
          .sort({ createdAt: 1 }) // oldest first
          .limit(docsToDelete)
          .select('_id createdAt') // include createdAt for verification
          .lean();

        console.log(`🗑️ TEST READY TO DELETE:`, {
          count: oldNews.length,
          oldest: oldNews[0]?.createdAt,
          newest: oldNews[oldNews.length - 1]?.createdAt
        });

        if (oldNews.length > 0) {
          const idsToDelete = oldNews.map(n => n._id);
          
          // ACTUAL DELETION
          await News.deleteMany({ _id: { $in: idsToDelete } });
          await Like.deleteMany({ postId: { $in: idsToDelete } });
          await Comment.deleteMany({ postId: { $in: idsToDelete } });
          
          console.log(`✅ TEST COMPLETE: Deleted ${idsToDelete.length} documents (~${(avgDocSizeMB * idsToDelete.length).toFixed(2)}MB)`);
        } else {
          console.log('⚠️ TEST NOTE: No documents available to delete');
        }
      } else {
        console.log(`✅ TEST PASS: DB size ${dbSizeMB.toFixed(2)}MB under ${TEST_THRESHOLD_MB}MB threshold`);
      }
    } catch (error) {
      console.error('❌ TEST FAILED:', error);
    }
};