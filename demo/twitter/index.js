import dotenv from "dotenv";
import Twitter from "twit";
import pause from "@joellord/pause";
import amqplib from "amqplib";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({path: __dirname + "/.env"});

let twitterKeys = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

let twitter = new Twitter(twitterKeys);

const mq = await amqplib.connect(`amqp://${process.env.MQ_SERVER}`);
const queue = await mq.createChannel();

queue.assertQueue("dblink.checknewfollowers");
queue.assertQueue("twitter.newfollower");
queue.prefetch(1);
queue.consume("twitter.newfollower", msg => {
  let content = JSON.parse(msg.content.toString());
  console.log(`Got a new follower, id ${content.id}`);
  twitter.get("users/show", {user_id: parseInt(content.id), tweet_mode: "extended"}, async (err, data) => {
    if (data.errors && (data.errors[0].code === 17 || data.errors[0].code === 50)) {
      console.log(`User ${content.id} not found at Twitter. Maybe a protected user?`);
      queue.sendToQueue("dblink.save", Buffer.from(JSON.stringify({
        id: content.id,
        hidden: true
      })));
      queue.ack(msg);
      return;
    }
    if (data.errors && data.errors[0].code === 88) {
      console.log(`Rate limit exceeded. Pausing for 15 minutes`);
      await pause (15 * 60);
    }
    if (data.errors) {
      console.log(data);
    }
    console.log(`Data received for follower ${data.id}, sending to transformer`);
    // Send data to transformer
    queue.sendToQueue("transformer.transform", Buffer.from(JSON.stringify(data)));

    //Rate limit is 900 req / 15 minutes. Therefore, we should break to avoir exceeding the limit
    // 900 requests / 15 * 60 seconds = 1 request / second
    // Pausing for a full second should avoid exceeding the limit
    await pause(1.1);
    queue.ack(msg);
  });
});

do {
  // Check for new followers every 5 minutes
  console.log("Fetching followers");
  twitter.get("followers/ids", (err, results) => {
    // Validate against DB
    console.log(`Received ${results.ids.length} followers, sending to DB`);
    queue.sendToQueue("dblink.checknewfollowers", Buffer.from(JSON.stringify(results.ids)));
  });
  await pause(5*60);
} while (true);

// Check for new statuses