import amqp from "amqplib";

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
const queue = "detector.faces.detect";
const recQueue = "requester.results";

const url = process.argv[2];
if (!url) {
  console.log("Please provide a URL to analyze");
  process.exit(1);
}

console.log(`Connecting to RabbitMQ with URI ${RABBITMQ_URI}`);

let connection = await amqp.connect(RABBITMQ_URI);
let channel = await connection.createChannel();
channel.prefetch(1);

channel.assertQueue(queue, {durable: false});
channel.sendToQueue(queue, Buffer.from(JSON.stringify({url})), {replyTo: recQueue});

channel.assertQueue(recQueue);
channel.consume(recQueue, async msg => {
  let results = JSON.parse(msg.content.toString()).results;
  console.log(results);
  channel.ack(msg);
  setTimeout(() => {
    channel.close();
    connection.close();
  }, 100);
});