import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Follower } from "./Models.js";
import amqplib from "amqplib";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({path: __dirname + "/.env"});

console.log(`Connecting to Mongo with URI ${process.env.MONGO_URI}`)
await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).catch(e => {
  console.log(e);
  process.exit(1);
});

const mq = await amqplib.connect(`amqp://${process.env.MQ_SERVER}`);
const channel = await mq.createChannel();

channel.assertQueue("twitter.newfollower");
channel.assertQueue("sentiment.analyze");
channel.assertQueue("trainer.add");

channel.assertQueue("dblink.checknewfollowers");
channel.consume("dblink.checknewfollowers", async msg => {
  console.log("Received list of followers, checking for new followers");
  let ids = JSON.parse(msg.content.toString());
  let followersInDB = await Follower.find().exec();
  followersInDB = followersInDB.map(f => f.id);

  let newFollowers = ids.filter(id => {
    return (followersInDB.indexOf(id.toString()) === -1);
  });
  
  console.log(`You've got ${newFollowers.length} new followers`);
  newFollowers.map(id => {
    channel.sendToQueue("twitter.newfollower", Buffer.from(JSON.stringify({id})));
  });

  channel.ack(msg);
});

channel.assertQueue("dblink.save");
channel.prefetch(1);
channel.consume("dblink.save", async msg => {
  let data = JSON.parse(msg.content.toString());
  console.log(`Updated follower information, upserting ${data.id}`);
  const filter = data.id ? { id: data.id } : { handle: data.handle };

  // Scoring --- Could move to its own service
  // 50% of score is # followers
  let followersScore = Math.round(Math.min((data.followers / 20), 100) * 0.5);
  // 30% of score is # friends
  let friendsScore = Math.round(Math.min((data.friends / 10), 100) * 0.3);
  // 20% of score is overall sentiment
  let sentimentScore = data.sentiment ? Math.round(data.sentiment.averageComparative * 20 * 0.2) : 0;
  
  data.score = followersScore + friendsScore + sentimentScore;
  data.score = isNaN(data.score) ? 0 : data.score;
  console.log(`Score for ${data.handle} is ${data.score}`);

  const update = data;

  let existingFollower = await Follower.findOne(filter).exec();
  let newFollower = await Follower.findOneAndUpdate(filter, update, { new: true, upsert: true });

  if (newFollower.hidden) {
    console.log(`Protected/hidden follower, ignore`);
    channel.ack(msg);
    return;
  }

  let updatedPicture = false;
  let updatedStatus = false;

  if (!existingFollower) console.log(`Got a new follower on Twitter: ${data.handle}`);

  if (!existingFollower || newFollower.lastProfilePicture != existingFollower.lastProfilePicture) updatedPicture = true;
  if (!existingFollower || newFollower.status != existingFollower.status) updatedStatus = true;

  if (updatedStatus) {
    channel.sendToQueue("sentiment.analyze", Buffer.from(JSON.stringify({
      id: newFollower.id,
      handle: newFollower.handle,
      status: newFollower.status,
      sentiment: newFollower.sentiment
    })));
  }

  if (updatedPicture) {
    channel.sendToQueue("trainer.add", Buffer.from(JSON.stringify({
      id: newFollower.id,
      handle: newFollower.handle,
      fromTwitter: true,
      lastProfilePicture: newFollower.lastProfilePicture
    })));
  }

  channel.ack(msg);
});

channel.assertQueue("dblink.adddescriptors");
channel.prefetch(1);
channel.consume("dblink.adddescriptors", async msg => {
  let data = JSON.parse(msg.content.toString());
  console.log(`New face descriptors available for ${data.handle}`);
  const filter = { handle: data.handle };
  let existingFollower = await Follower.findOne(filter).exec();
  if (!existingFollower) {
    console.log(`Could not find ${data.handle} in DB.`);
    channel.ack(msg);
    process.exit();
  }
  if (!existingFollower.faceDescriptors) existingFollower.faceDescriptors = [];
  existingFollower.faceDescriptors.push(data.descriptors);
  let newFollower = await existingFollower.save({ new: true });
  console.log(`Follower ${data.handle} now has ${newFollower.faceDescriptors.length} face descriptors`);
  channel.ack(msg);
});

const app = express();
app.use(cors());

app.get("/facedata", async (req, res) => {
  let data = await Follower.find();
  data = data.filter(f => f.faceDescriptors.length > 0 && f.faceDescriptors[0]).map(follower => {
    return { label: `${follower.handle} -- ${follower.score}`, faceDescriptors: follower.faceDescriptors };
  });
  res.send(data).status(200);
});

app.listen(process.env.PORT, () => console.log(`Listening for incoming requests on port ${process.env.PORT}`));