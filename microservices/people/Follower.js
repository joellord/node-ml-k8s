import fs from "fs";
import sharp from "sharp";
import fetch from "node-fetch";
import util from "util";
import stream from "stream";

class Follower {
  STD_SIZE = 500;

  id = "";
  name = "";
  handle = "";
  followers = 0;
  friends = 0;
  lastTweet = "";
  sentiment = {
    tweetCount: 0,
    averageComparative: 0
  };
  pics = [];

  constructor() {

  }

  toJSON() {
    let data = {
      id: this.id,
      name: this.name,
      handle: this.handle,
      followers: this.followers,
      friends: this.friends,
      sentiment: this.sentiment
    };
    return data;
  }

  async fromTwitter(follower) {
    this.id = follower.id_str;
    this.name = follower.name;
    this.handle = follower.screen_name;
    this.followers = follower.followers_count;
    this.friends = follower.friends_count;
    this.addPicture(follower.profile_image_url.replace("_normal", ""));
    if (follower.status) this.newTweetReceived(follower.status.text);
  }

  async fromLocal(follower) {
    this.id = follower.id;
    this.name = follower.name;
    this.handle = follower.handle,
    this.followers = follower.followers;
    this.friends = follower.friends;
    this.pics = await this.readdir(`pics/${this.handle}`);
    this.sentiment = follower.sentiment;
  }

  readdir(path) {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, result) => {
        if (err && err.errno === -2) {
          fs.mkdir(path, err => {
            if (err) {
              reject(err);
              return;
            }
            resolve([]);
          });
          return;
        }
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  async downloadImage(uri, filename) {
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

  async addPicture(imageLink) {
    let localImages = await this.readdir(`pics/${this.handle}`);
    let imgCounter = localImages.length;
    let profilePicExtension = imageLink.substr(imageLink.lastIndexOf(".") + 1);
    if (profilePicExtension.indexOf("/") !== -1) profilePicExtension = "jpg";
    let profileFilename = `pics/${this.handle}/${imgCounter + 1}.${profilePicExtension}`;
    await this.downloadImage(imageLink, profileFilename).catch(e => console.log("Error downloading image", e));
    this.pics.push(profileFilename);
    let modifiedFileName = profileFilename.replace(imgCounter + 1, imgCounter + 2);
    await sharp(profileFilename)
      .resize({width: this.STD_SIZE, height: this.STD_SIZE, fit: "cover"})
      .jpeg()
      .toFile(modifiedFileName)
      .catch(e => console.log("Error transforming image", e));
    this.pics.push(modifiedFileName);
  }

  async newTweetReceived(status) {
    return new Promise(async (resolve, reject) => {
      const params = new URLSearchParams();
      params.append("text", status);
      let response = await fetch(`${SENTIMENT_API_URL}/sentiment`, {
        method: "POST",
        body: params
      }).catch(e => () => reject(e));
      response = response.json();
      let weightedCurrent = this.sentiment.averageComparative * this.sentiment.tweetCount;
      this.sentiment.tweetCount++;
      this.sentiment.averageComparative = (weightedCurrent + response.comparative) / this.sentiment.tweetCount;
      resolve(this.sentiment);
    });
  }
}

const processFollowers = (followers) => {
  return new Promise(async (resolve) => {
    let processed = [];
    for (let i = 0; i < followers.length; i++) {
      let follower = new Follower(followers[i]);
      processed.push(follower);
    }

    resolve(processed);
  });
};

export default Follower;

export {
  Follower
}