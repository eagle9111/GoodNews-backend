import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function () {
    https
        .get("https://goodnews-backend-1.onrender.com", (res) => {
            if (res.statusCode === 200) {
                console.log("Server is up and running");
            } else {
                console.log("Server is down");
            }
        })
        .on("error", (e) => {
            console.error(`Got error: ${e.message}`);
        });
});

export default job;