import mongoose from "mongoose";
import { Follower } from "./Models.js";
import amqp from "amqplib";

const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:12345@127.0.0.1/node-ml-k8s?authSource=admin";
const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";

console.log(`Connecting to Mongo with URI ${MONGO_URI}`)
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).catch(e => {
  console.log(e);
  process.exit(1);
});

console.log(`Connecting to RabbitMQ with URI ${RABBITMQ_URI}`);
let connection = await amqp.connect(RABBITMQ_URI).catch( e => {
  console.log(e);
  process.exit(2);
});
let channel = await connection.createChannel().catch(e => {
  console.log(e);
  process.exit(3);
});

const newFollowerQueue = "db.follower.add";
await channel.assertQueue(newFollowerQueue, { durable: false });
channel.prefetch(1);
channel.consume(newFollowerQueue, async msg => {
  let content = JSON.parse(msg.content.toString());
  console.log(`Ready to add ${content.handle} to DB`);
  const filter = {handle: content.handle};
  const options = {
    returnOriginal: true,
    upsert: true
  };

  let oldFollower = await Follower.findOneAndUpdate(filter, content, options);
  let newFollower = await Follower.findOne(filter);

  if (oldFollower === null) {
    channel.sendToQueue("score.follower.rate", Buffer.from(JSON.stringify(newFollower)), { persistent: false });
  }

  if (oldFollower === null || oldFollower.lastProfilePic !== newFollower.lastProfilePic) {
    console.log("Found a new profile pic, need to update");
    channel.sendToQueue("faceprocessor.picture.descriptors", Buffer.from(JSON.stringify(newFollower)), { persistent: false });
  }

  if (newFollower.status && (oldFollower === null || oldFollower.status !== newFollower.status)) {
    channel.sendToQueue("sentiment.status.analyze", Buffer.from(JSON.stringify(newFollower)), { persistent: false });
    channel.sendToQueue("score.follower.rate", Buffer.from(JSON.stringify(newFollower)), { persistent: false });
  }

  console.log(`Follower added to DB`);
  channel.ack(msg);
});

const faceDataQueue = "db.follower.facedata";
await channel.assertQueue(faceDataQueue);
channel.prefetch(1);
channel.consume(faceDataQueue, async msg => {
  console.log(`Face data has been requested. Will be sent to ${msg.properties.replyTo}`);
  let followers = await Follower.find({"faceDescriptors.1": {$exists: true}}, "handle faceDescriptors score");
  channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(followers)));
  channel.ack(msg);
});

const newFaceQueue = "db.follower.train";
await channel.assertQueue(newFaceQueue, { durable: false });
channel.prefetch(1);
channel.consume(newFaceQueue, async msg => {
  let content = JSON.parse(msg.content.toString());
  console.log(`Request to train ${content.profilePic} for ${content.handle}`);
  const filter = {handle: content.handle};
  const updatedFollower = {
    handle: content.handle,
    lastProfilePicture: content.profilePic
  };
  const options = {
    returnOriginal: true,
    upsert: true
  };
  let oldFollower = await Follower.findOneAndUpdate(filter, updatedFollower, options);
  let newFollower = await Follower.findOne(filter);
  if (oldFollower === null) console.log(`Inserted new follower ${newFollower.handle}`);
  else console.log(`Updated follower ${oldFollower.handle}`);
  console.log(`Image was ${oldFollower !== null ? oldFollower.lastProfilePicture : null}, is now ${newFollower.lastProfilePicture}`)
  if (oldFollower === null || oldFollower.lastProfilePicture !== newFollower.lastProfilePicture) {
    console.log(`New or updated record, processing new face`);
    channel.sendToQueue("faceprocessor.picture.descriptors", Buffer.from(JSON.stringify(newFollower)), { persistent: false });
  }
  channel.ack(msg);
});