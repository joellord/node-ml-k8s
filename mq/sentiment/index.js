import amqp from "amqplib/callback_api.js";
import Sentiment from "sentiment";

const sentiment = new Sentiment();

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
console.log(`Connecting to RabbitMQ with URI ${RABBITMQ_URI}`);
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
    const recQueue = "sentiment.status.analyze";
    const sendQueue = "db.follower.add";
    channel.assertQueue(recQueue, { durable: false });
    channel.prefetch(1);
    channel.consume(recQueue, msg => {
      let follower = JSON.parse(msg.content.toString());
      console.log(`New tweet from ${follower.handle}, analysing`);
      if (!follower.status) {
        channel.ack(msg);
        return;
      }
      let analysis = analyse(follower.status);
      console.log(`Message is ${analysis.score > 0 ? "positive" : "negative"}. Updating follower score.`);

      if (!follower.sentiment) follower.sentiment = { tweetCount: 0, averageComparative: 0 };
      let weightedComparative = follower.sentiment.tweetCount * follower.sentiment.averageComparative;
      follower.sentiment.tweetCount++;
      follower.sentiment.averageComparative = (weightedComparative + analysis.comparative) / follower.sentiment.tweetCount;

      channel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(follower)), { persistent: false });
      channel.ack(msg);
    });
  })
});

const analyse = tweet => {
  let result = sentiment.analyze(tweet);
  return result;
};
