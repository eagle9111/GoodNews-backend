// cron.js
import cron from "cron";
import https from "https";
import { checkAndCleanDB } from './utils/dbCleanup.js';




const fetchNewsJob = new cron.CronJob("0 */12 * * *", function () {
  https
    .get("https://goodnews-backend-1.onrender.com/api/fetch-news", (res) => {
      console.log(`📰 Fetch News Cron triggered: ${res.statusCode}`);
    })
    .on("error", (e) => {
      console.error(`❌ Error fetching news: ${e.message}`);
    });
});
const dbCleanupJob = new cron.CronJob("0 3 * * 1", async function () { 
  console.log('🧹 Starting scheduled DB cleanup');
  try {
    await checkAndCleanDB(365);
    console.log('✅ DB cleanup completed');
  } catch (error) {
    console.error('❌ DB cleanup failed:', error);
  }
});

export default {
  startAll: () => {
    fetchNewsJob.start();
    dbCleanupJob.start();
    console.log("⏰ Cron jobs started");
  },
};
