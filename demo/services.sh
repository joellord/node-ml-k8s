concurrently --names "DB-Link,Transformer,Twitter,Sentiment,Trainer,Detector" \
  -c "red,blue,yellow,cyan,green,magenta" \
  "node ./dblink" \
  "node ./transformer" \
  "node ./twitter" \
  "node ./sentiment" \
  "node ./trainer" \
  "node ./detector"