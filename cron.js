// cron.js
import cron from "cron";
import https from "https";
import { checkAndCleanDB } from './utils/dbCleanup.js';


const keepAliveJob = new cron.CronJob("*/14 * * * *", function () {
  https
    .get("https://goodnews-backend-1.onrender.com", (res) => {
      if (res.statusCode === 200) {
        console.log("🔄 Server is up and running");
      } else {
        console.log("⚠️ Server ping failed");
      }
    })
    .on("error", (e) => {
      console.error(`🚨 Ping error: ${e.message}`);
    });
});

const fetchNewsJob = new cron.CronJob("*/8 * * * *", function () {
  https
    .get("https://goodnews-backend-1.onrender.com/api/fetch-news", (res) => {
      console.log(`📰 Fetch News Cron triggered: ${res.statusCode}`);
    })
    .on("error", (e) => {
      console.error(`❌ Error fetching news: ${e.message}`);
    });
});
const dbCleanupJob = new cron.CronJob("0/1 * * * *", async function () {
  console.log('🧹 Starting scheduled DB cleanup');
  try {
    await checkAndCleanDB();
    console.log('✅ DB cleanup completed');
  } catch (error) {
    console.error('❌ DB cleanup failed:', error);
  }
});

export default {
  startAll: () => {
    keepAliveJob.start();
    fetchNewsJob.start();
    dbCleanupJob.start();
    console.log("⏰ Cron jobs started");
  },
};
