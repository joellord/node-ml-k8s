import React, { Component } from "react";
import "./Twitter.css";

const protocol = (window.location.protocol === 'https:') ? 'wss://' : 'ws://';
// const port = window.location.port ? `:${window.location.port}` : '';
const port = ":8080";
const socketUrl = `${protocol}${window.location.hostname}${port}/twitter`;
const socket = new WebSocket(socketUrl);

export default class Twitter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tweets: []
    };

    this.addTweet.bind(this);
  }

  componentDidMount() {
    let self = this;
    // Listen for messages
    socket.addEventListener('message', function (event) {
      let message = JSON.parse(event.data);
      self.addTweet(message);
    });
  }

  addTweet(tweet) {
    let tweets = this.state.tweets;
    if (tweets.length >= 5) tweets.shift();
    tweets.push(tweet);
    this.setState({tweets});
  }

  refreshFollowers() {
    let refreshUrl = `http://${window.location.hostname}${port}/refreshstream`;
    fetch(refreshUrl);
  }

  render() {
    let style = {
      pic: {
        img: {
          width: "150px",
          height: "150px",
          borderRadius: "50%"
        }
      },
      tweet: {
        textAlign: "left"
      },
      handle: {
        paddingRight: "20px",
        paddingLeft: "20px",
        fontSize: "1em",
        fontWeight: "bold"
      },
      button: {
        color: "rgba(0, 0, 0, 0.1)",
        border: "0",
        position: "absolute",
        right: "20px",
        bottom: "50px"
      }
    }

    return (
      <div id="twitter">
        <table>
          <tbody>
            {this.state.tweets.map((t, index) => {
              let tweet = t.tweet.replace(/@[a-z0-9_]*/ig, "<span class='handle'>$&</span>");
              let bgColor = "hsl(0, 100%, 100%)";
              if (this.props.withSentimentAnalysis) {
                let MAXSCORE = 2;
                let score = parseFloat(t.score);
                score = Math.abs(score);
                if (score > MAXSCORE) score = MAXSCORE;
                let relativeScore = 255 - parseInt(score * 255 / MAXSCORE);
                let strength = relativeScore.toString(16);
                if (t.score > 0) {
                  bgColor = `#${strength}ff${strength}`;
                } 
                if (t.score < 0) {
                  bgColor = `#ff${strength}${strength}`;
                }

                tweet += ` (${t.score} -- ${strength})`;
              }
              return (
                <tr className="tweetRow" key={index} style={{backgroundColor: bgColor}}>
                  <td style={style.pic}>
                    <img src={t.pic.replace("_normal", "")} style={style.pic.img} alt="Profile pic" />
                  </td>
                  <td style={style.handle}>
                    @{t.handle}
                  </td>
                  <td style={style.tweet} dangerouslySetInnerHTML={{__html: tweet}}>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <button style={style.button} onClick={this.refreshFollowers}>Refresh Followers</button>
      </div>
    );
  }
}

