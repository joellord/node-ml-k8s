const express = require("express");
const expressWs = require("express-ws");
const path = require("path");
const pty = require("node-pty");
const os = require("os");
const exec = require("child_process").exec;
let Twit = require("twit");
let keys = require("./keys.json");

const Sentiment = require("sentiment");
const sentiment = new Sentiment();

let t = new Twit(keys);

const app = express();
const ws = expressWs(app);
const twitterWs = expressWs(app);

const PORT = process.env.PORT || 8080;
const VERBOSE = process.env.VERBOSE;

const DEFAULT_PATH = "../";

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
let ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: DEFAULT_PATH,
  env: process.env
});

app.use(express.static(path.join(__dirname, "./build")));

app.get("/health", (req, res) => {
  res.send("Feeling good").status(200);
});

ws.app.ws("/shell", (ws, req) => {
  ptyProcess.on("data", data => {
    try {
      ws.send(data);
    } catch(e) {
      console.log(e);
    }
  }); 

  ws.on("message", msg => {
    ptyProcess.write(msg);
  });
});

let twitterFeedWebsocket;

twitterWs.app.ws("/twitter", (ws, req) => {
  twitterFeedWebsocket = ws;
});

t.get("followers/ids", {}, (err, data, resp) => {
  if (err) {
    console.log(err);
    process.exit();
  }
  console.log(`Fetched ${data.ids.length} follower ids`);
  let ids = data.ids;
  let stream = t.stream('statuses/filter', { follow: ids.join(",") })

  stream.on('tweet', function (tweet) {
    let isFollower = false;
    if (ids.indexOf(tweet.user.id) > -1) isFollower = true;
    let user = tweet.user.screen_name;
    let text = tweet.extended_tweet ? tweet.extended_tweet.full_text : tweet.text;

    let score = sentiment.analyze(text);

    if (VERBOSE) console.log(`@${user}: ${text}\n=-=-=-=-=-=-=`);

    try {
      twitterFeedWebsocket.send(JSON.stringify({
        handle: user,
        pic: tweet.user.profile_image_url,
        tweet: text,
        score: score.comparative
      }));
    } catch(e) {
      console.error("Could not send to websocket");
    }
  });  
});

app.get("/system", (req, res) => {
  api().then(snap => res.send(snap).status(200));
});

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/build/index.html'));
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));