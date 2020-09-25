import amqp from "amqplib";

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
const queue = "db.follower.train";

const handle = process.argv[2];
const profilePic = process.argv[3];
if (!profilePic) {
  console.log("Please provide a URL to analyze");
  process.exit(1);
}

const data = {
  handle,
  profilePic
}

console.log(`Connecting to RabbitMQ with URI ${RABBITMQ_URI}`);

let connection = await amqp.connect(RABBITMQ_URI);
let channel = await connection.createChannel();

channel.assertQueue(queue, {durable: false});
channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));

console.log(`Request sent to train DB with ${profilePic} for ${handle}`);

setTimeout(() => {
  channel.close();
  connection.close();
}, 100);