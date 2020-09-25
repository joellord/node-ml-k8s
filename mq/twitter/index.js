import Twitter from "twitter";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import amqp from "amqplib/callback_api.js";

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const keys = JSON.parse(fs.readFileSync(`${__dirname}/keys.json`));
let twitterClient = new Twitter(keys);

// Upon launch, fetch all followers
const fetchFollowers = (cursor) => {
  let p = new Promise((resolve, reject) => {
    twitterClient.get("followers/list", {cursor: cursor ? cursor : -1, count: 200}, (err, result) => {
      if (err) {
        console.log(err[0].message);
        process.exit(err[0].code);
        reject(err);
        return;
      }
      
      console.log(`Fetched ${result.users.length} followers`);
      console.log(`Next cursor: ${result.next_cursor_str}`);
      resolve(result);
      return;
    });
  });

  return p;
}

const fetchAllFollowers = async () => {
  let rateLimiterCount = 0;
  const RATE_LIMIT = 15;
  let followers = []
  let result = {
    next_cursor_str: -1
  };

  do {
    if (rateLimiterCount > RATE_LIMIT) {
      console.log("Rate Limit reached, pausing for 15 minutes");
      await pause(15 * 60);
      rateLimiterCount = 0;
    }
    result = await fetchFollowers(result.next_cursor_str);
    followers.push(...result.users);
    rateLimiterCount++;
  }
  while(result.next_cursor_str != "0")

  return followers;
}

fetchAllFollowers().then(followers => {
  for (let i = 0; i < followers.length; i++) {
    newFollower(followers[i]);
  }
});

console.log(`Connecting to RabbitMQ with URI ${RABBITMQ_URI}`);

let sendChannel;
const sendQueue = "transformer.follower.transform";

amqp.connect(RABBITMQ_URI, (err, conn) => {
  if (err) {
    console.log(err);
    process.exit(2);
  }
  
  conn.createChannel((err, channel) => {
    if (err) {
      console.log(err);
      process.exit(3);
    }
    channel.assertQueue(sendQueue, { durable: false });
    sendChannel = channel;
  })
});

const newFollower = follower => {
  console.log(`Sending new follower ${follower.screen_name} to Transformer`);
  sendChannel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(follower)), { persistent: false });
};