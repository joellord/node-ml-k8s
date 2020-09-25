import amqp from "amqplib";

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
const initQueue = "detector.faces.init";
const fetchInitQueue = "db.followers.facedata";

console.log(`Connecting to RabbitMQ with URI ${RABBITMQ_URI}`);

let connection = await amqp.connect(RABBITMQ_URI);
let channel = await connection.createChannel();
channel.prefetch(1);

channel.assertQueue(fetchInitQueue)
  .then(_ => channel.sendToQueue(fetchInitQueue, Buffer.from("data please"), { replyTo: initQueue }));

channel.assertQueue(initQueue).then(_ => channel.consume(initQueue, msg => {
  console.log("Received face data for detector");
  channel.ack(msg);
}));
