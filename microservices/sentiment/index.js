let express = require("express");
let Sentiment = require("sentiment");

const app = express();
const sentiment = new Sentiment();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

app.post("/sentiment", (req, res) => {
  let text = req.body.text;
  if (!text) {
    res.sendStatus(422);
    return;
  }
  console.log(`Performing sentiment analysis for ${text}`);
  let result = sentiment.analyze(text);
  result.text = text;
  console.log(result);
  res.send(result).status(200);
});

app.listen(PORT, () => console.log(`Sentiment server started on port ${PORT}`));