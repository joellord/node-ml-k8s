import express from "express";
import fetch from "node-fetch";
import Followers from "./Followers.js";

const PORT = process.env.PORT || 3000;
const TWITTERBOT_URL = process.env.TWITTERBOT_URL || "http://localhost:3002";
const app = express();

let followers = new Followers();
await followers.load();
console.log(`Followers (${followers.count()}) loaded`);


app.get("/reset", async (req, res) => {
  console.log("Starting a new database, this may take a few minutes");
  let data = await fetch(`${TWITTERBOT_URL}/followers/all`).then(resp => resp.json()).catch(e => console.log("Error fetching from twitter (rate limit?)"));
  console.log(`Received ${data.length} followers from the Twitter API`);
  followers = new Followers();
  await followers.importFromTwitter(data);
  followers.save();
  console.log(`Processing completed. Followers db has ${followers.count()} entries`);
  res.send({message: `Imported ${followers.count()} followers`}).status(200);
});

app.get("/followers", async (req, res) => {
  res.send(followers).status(200);
});

app.listen(PORT, () => console.log(`People service started on port ${PORT}`));