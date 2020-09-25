import express from "express";
import mongoose from "mongoose";
import { Follower } from "./Models.js";
import amqp from "amqplib/callback_api.js";

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:12345@127.0.0.1/node-ml-k8s?authSource=admin";
const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";

console.log(`Connecting to Mongo with URI ${MONGO_URI}`)
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).catch(e => {
  console.log(e);
  process.exit(1);
});

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
    let queue = "db.follower.add";
    channel.assertQueue(queue, { durable: false });
    channel.prefetch(1);
    channel.consume(queue, async msg => {
      let content = JSON.parse(msg.content.toString());
      console.log(`Ready to add ${content.handle} to DB`);
      const filter = {handle: content.handle};
      const options = {
        returnOriginal: true,
        upsert: true
      };

      let oldFollower = await Follower.findOneAndUpdate(filter, content, options);
      let newFollower = await Follower.findOne(filter);

      if (oldFollower === null || oldFollower.lastProfilePic !== newFollower.lastProfilePic) {
        console.log("Found a new profile pic, need to update");
        channel.sendToQueue("faceprocessor.picture.descriptors", Buffer.from(JSON.stringify(newFollower)), { persistent: false });
      }

      if (newFollower.status && (oldFollower === null || oldFollower.status !== newFollower.status)) {
        channel.sendToQueue("sentiment.status.analyze", Buffer.from(JSON.stringify(newFollower)), { persistent: false });
      }

      console.log(`Follower added to DB`);
      channel.ack(msg);
    });
  })
});

const app = express();

app.get("/", (req, res) => {
  res.send({message: "ok"}).status(200);
});

app.get("/followers", async (req, res) => {
  const followers = await Follower.find();
  res.send(followers).status(200);
})

app.listen(PORT, () => {
  console.log(`Server up and running on port ${PORT}`);
});