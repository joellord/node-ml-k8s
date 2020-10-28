import mongoose from "mongoose";

const FollowerSchema = {
  id: String,
  handle: String,
  name: String,
  followers: Number,
  friends: Number,
  lastProfilePicture: String,
  status: String,
  hidden: Boolean,
  sentiment: {
    tweetCount: Number,
    averageComparative: Number
  },
  faceDescriptors: Array,
  score: Number
}

const Follower = mongoose.model("Follower", FollowerSchema);

export {
  Follower
}