import Twitter from "twitter";
import fs from "fs";
import sharp from "sharp";
import fetch from "node-fetch";
import util from "util";
import stream from "stream";

const STD_SIZE = 500;
const SENTIMENT_API_URL = process.env.SENTIMENT_API_URL || "http://localhost:3001";

let keys = JSON.parse(fs.readFileSync("keys.json"));
const twitterClient = new Twitter(keys);

const pause = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds);
  });
};

const getFollowersCount = () => {
  console.log("Fetching follower count");
  return new Promise((resolve, reject) => {
    twitterClient.get("followers/ids", (err, result) => {
      if (err) {
        console.log(err[0].message);
        resolve("unknown");
        return;
      }

      resolve(result.ids.length);
    });
  });
};

const fetchFollowers = (cursor) => {
  let p = new Promise((resolve, reject) => {
    twitterClient.get("followers/list", {cursor: cursor ? cursor : -1, count: 200}, (err, result) => {
      if (err) {
        console.log(err[0].message);
        process.exit(err[0].code);
        reject(err);
        return;
      }
      
      console.log(`Fetched ${result.users.length} followers`);
      console.log(`Next cursor: ${result.next_cursor_str}`);
      resolve(result);
      return;
    });
  });

  return p;
}

const fetchAllFollowers = async () => {
  let rateLimiterCount = 0;
  let followers = []
  let result = {
    next_cursor_str: -1
  };

  do {
    if (rateLimiterCount > 15) {
      console.log("Rate Limit reached, pausing for 15 minutes");
      await pause(15 * 60);
      rateLimiterCount = 0;
    }
    result = await fetchFollowers(result.next_cursor_str);
    followers.push(...result.users);
    rateLimiterCount++;
  }
  while(result.next_cursor_str != "0")

  return followers;
}

const downloadImage = async (uri, filename) => {
  console.log(uri);
  const streamPipeline = util.promisify(stream.pipeline);
  const response = await fetch(uri);
  if (response.ok) {
    return streamPipeline(response.body, fs.createWriteStream(filename));
  }

  if (response.status === 404) {
    return fs.copyFileSync("./assets/default_profile.png", filename);
  }

  throw new Error(`Unexpected response ${response.status} ${response.statusText}`);
}

const analyseStatus = (status) => {
  return new Promise(async (resolve, reject) => {
    const params = new URLSearchParams();
    params.append("text", status);
    let response = await fetch(`${SENTIMENT_API_URL}/sentiment`, {
      method: "POST",
      body: params
    }).catch(e => () => reject(e));
    response = response.json();
    resolve(response);
  });
}

const processFollower = async (follower) => {
  console.log(`Processing ${follower.screen_name}`);
  let processedFollower = {
    id: follower.id_str,
    name: follower.name,
    handle: follower.screen_name,
    followers: follower.followers_count,
    friends: follower.friends_count,
    lastTweet: follower.status ? follower.status.text : undefined,
    sentiment: {
      tweetCount: 0,
      averageComparative: 0
    }
  };
  let profilePic = follower.profile_image_url.replace("_normal", "");
  let profilePicExtension = profilePic.substr(profilePic.lastIndexOf(".") + 1);
  if (profilePicExtension.indexOf("/") !== -1) profilePicExtension = "jpg";
  let profileFilename = `pics/${processedFollower.handle}___1.${profilePicExtension}`;
  await downloadImage(profilePic, profileFilename);
  processedFollower.pics = [profileFilename];
  let modifiedFileName = profileFilename.replace("___1", "___2");
  await sharp(profileFilename)
    .resize({width: STD_SIZE, fit: "cover"})
    .jpeg()
    .toFile(profileFilename.replace("___1", "___2"));
  processedFollower.pics.push(modifiedFileName);
  if (processedFollower.lastTweet) {
    let sentiment = await analyseStatus(processedFollower.lastTweet);
    let comparative = sentiment.comparative;
    let weightedActual = processedFollower.sentiment.averageComparative * processedFollower.sentiment.tweetCount;
    processedFollower.sentiment.tweetCount++;
    processedFollower.sentiment.averageComparative = (weightedActual + comparative) / processedFollower.sentiment.tweetCount; 
  }
  return processedFollower;
}

const processFollowers = (followers) => {
  return new Promise(async (resolve) => {
    let processed = [];
    for (let i = 0; i < followers.length; i++) {
      let follower = await processFollower(followers[i]);
      processed.push(follower);
    }

    resolve(processed);
  });
};

export {
  getFollowersCount,
  fetchAllFollowers,
  processFollowers
}