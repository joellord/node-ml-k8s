import dotenv from "dotenv";
import amqplib from "amqplib";
import Sentiment from "sentiment";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({path: __dirname + "/.env"});

const s = new Sentiment();

console.log(`Connecting to amqp://${process.env.MQ_SERVER}`);
const mq = await amqplib.connect(`amqp://${process.env.MQ_SERVER}`);
const channel = await mq.createChannel();

channel.assertQueue("dblink.save");
channel.assertQueue("sentiment.analyze");
channel.prefetch(1);

channel.consume("sentiment.analyze", msg => {
  let data = JSON.parse(msg.content.toString());
  let { id, status, sentiment } = data;
  let result = s.analyze(status);
  let comparative = result.comparative;
  if (!sentiment.tweetCount) {
    sentiment.tweetCount = 1;
    sentiment.averageComparative = comparative;
  } else {
    sentiment.tweetCount++;
    sentiment.averageComparative = (sentiment.averageComparative + comparative) / sentiment.tweetCount;
  }
  data = { id, status, sentiment };
  console.log(`Tweet ${data.status} by ${data.id} has a comparative of ${comparative}, new average is ${data.sentiment.averageComparative}`);
  channel.sendToQueue("dblink.save", Buffer.from(JSON.stringify(data)));
  channel.ack(msg);
});