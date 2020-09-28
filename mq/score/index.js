import amqp from "amqplib";

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
const sendQueue = "db.follower.add";
const recQueue = "score.follower.rate";

console.log(`Connecting to RabbitMQ with URI ${RABBITMQ_URI}`);

let connection = await amqp.connect(RABBITMQ_URI);
let channel = await connection.createChannel();
channel.prefetch(1);

channel.assertQueue(recQueue, { durable: false });
channel.consume(recQueue, async msg => {
  let follower = JSON.parse(msg.content.toString());
  console.log(`Getting ready to score ${follower.handle}`);
  
  // 30% of score is # followers
  let followersScore = Math.round(Math.min((follower.followers / 20), 100) * 0.3);
  // 20% of score is # friends
  let friendsScore = Math.round(Math.min((follower.friends / 10), 100) * 0.2);
  // 50% of score is overall sentiment
  let sentimentScore = follower.sentiment ? Math.round(follower.sentiment.averageComparative * 20 * 0.5) : 0;
  
  follower.score = followersScore + friendsScore + sentimentScore;
  console.log(`Follower ${follower.handle} scored ${follower.score}`);

  channel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(follower)));

  channel.ack(msg);
});