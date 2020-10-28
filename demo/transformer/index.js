import dotenv from "dotenv";
import amqplib from "amqplib";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({path: __dirname + "/.env"});

console.log(`Connecting to amqp://${process.env.MQ_SERVER}`);
const mq = await amqplib.connect(`amqp://${process.env.MQ_SERVER}`);
const channel = await mq.createChannel();

channel.assertQueue("transformer.transform");
channel.prefetch(1);
channel.assertQueue("dblink.save");
channel.consume("transformer.transform", msg => {
  let content = JSON.parse(msg.content.toString());
  console.log(`Transformer request for follower id ${content.id}`);
  let transformed = transformFollower(content);
  console.log(`Follower has been transformed, sending to DB`);
  channel.sendToQueue("dblink.save", Buffer.from(JSON.stringify(transformed)));
  channel.ack(msg);
});

const transformFollower = twitterFollower => {
  let status = "";
  let tweet = twitterFollower.status;
  if (tweet) status = tweet.extended_tweet ? tweet.extended_tweet.full_text : tweet.text
  let follower = {
    id: twitterFollower.id_str,
    name: twitterFollower.name,
    handle: twitterFollower.screen_name,
    followers: twitterFollower.followers_count,
    friends: twitterFollower.friends_count,
    lastProfilePicture: twitterFollower.profile_image_url,
    status
  };
  return follower;
};
