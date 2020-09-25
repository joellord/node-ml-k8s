import fs from "fs";
import Follower from "./Follower.js";

class Followers {
  followers = [];
  localFile = "./db/followers.json";

  constructor(followers = [], fromTwitter = false) {
    for (let i = 0; i < followers.length; i++) {
      this.addNewFollower(followers[i], fromTwitter);
    }
  }

  async importFromTwitter(followers) {
    for (let i = 0; i < followers.length; i++) {
      await this.addNewFollower(followers[i], true);
    }
    return this.count();
  }

  async addNewFollower(follower, fromTwitter = false) {
    let newFollower = new Follower();
    console.log(`Adding follower ${follower.screen_name || follower.handle}`)
    let fromWhere = fromTwitter ? "fromTwitter" : "fromLocal";
    await newFollower[fromWhere](follower);
    this.followers.push(newFollower);
    return this.followers;
  }

  save() {
    fs.writeFileSync(this.localFile, this.toString());
  }

  async load() {
    console.log(`Loading file ${this.localFile}`);
    this.followers = [];
    let followers = JSON.parse(fs.readFileSync(this.localFile));
    for (let i = 0; i < followers.length; i++) {
      await this.addNewFollower(followers[i]);
    }
  }

  toString() {
    let output = [];
    for (let i = 0; i < this.followers.length; i++) {
      let follower = this.followers[i].toJSON();
      output.push(follower);
    }

    return JSON.stringify(output);
  }

  count() {
    return this.followers.length;
  }

  getAllFollowers() {
    return this.followers;
  }
}

export default Followers;

export {
  Followers
}