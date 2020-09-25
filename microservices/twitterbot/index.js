import fs from "fs";
import express from "express";
import Twitter from "twitter";
import { getFollowersCount, fetchAllFollowers, processFollowers } from "./helper.js";

const PORT = process.env.PORT || 3002;
const keys = JSON.parse(fs.readFileSync("keys.json"));

// let followers = JSON.parse(fs.readFileSync("followers.json"));
// let startFromScratch = !!(process.env.REINITIALIZE || followers.length === 0);
// let followersCount = await getFollowersCount();

// if (startFromScratch) {
//   console.log(`Twitter reports ${followersCount} followers, getting ready to download`);
//   // Initial data scrape
//   let rawFollowers = await fetchAllFollowers();
//   let processedFollowers = processFollowers(rawFollowers);
//   fs.writeFileSync("followers.json", JSON.stringify(processedFollowers));
// } else {
//   console.log(`You have ${followers.length} followers in the internal database`);
// }

let twitterClient = new Twitter(keys);
let eventCode = "javascript";
let eventStream = twitterClient.stream("statuses/filter", {track: eventCode, tweet_mode: "extended"});
eventStream.on("data", event => {
  let user = event.user.screen_name;
  let isFollower = true; //!!followers.find(follower => follower.handle === user);
  if (isFollower && event.text) {
    console.log(`Tweet from follower ${user}`);
    let text = event.extended_tweet && event.extended_tweet.full_text ? event.extended_tweet.full_text : event.text;
    console.log(`${text}`);
  }
});
eventStream.on("error", event => {
  console.log(`Error in stream`);
  console.log(event);
});

const app = express();

app.get("/followers/all", async (req, res) => {
  let followers = await fetchAllFollowers();
  res.send(followers).status(200);
});

// app.get("/forceprocess", async (req, res) => {
//   let raw = JSON.parse(fs.readFileSync("followers_raw.json").toString());
//   let processedFollowers = await processFollowers(raw);
//   fs.writeFileSync("followers.json", JSON.stringify(processedFollowers));
//   res.send("ok").status(200);
// });

// app.get("/followers", (req, res) => {
//   res.send(followers).status(200);
// });

app.listen(PORT, () => console.log(`TwitterBot started on port ${PORT}`));