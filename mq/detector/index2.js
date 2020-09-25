import amqp from "amqplib";

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
const fetchInitQueue = "db.followers.facedata";

console.log(`Second service started`);

let connection = await amqp.connect(RABBITMQ_URI);
let channel = await connection.createChannel();

// channel.assertQueue(fetchInitQueue)
//   .then(_ => channel.sendToQueue(fetchInitQueue, Buffer.from("data please"), { replyTo: initQueue }));
channel.prefetch(1);
channel.assertQueue(fetchInitQueue).then(_ => channel.consume(fetchInitQueue, msg => {
  console.log("Received message on fetchInitQueue");
  console.log(`Response will be sent back to ${msg.properties.replyTo}`);
  setTimeout(() => {
    channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({data: true})));
    channel.ack(msg);
  }, 1000);
}));
