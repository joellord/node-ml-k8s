import amqp from "amqplib/callback_api.js";

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
console.log(`Connecting to RabbitMQ with URI ${RABBITMQ_URI}`);
amqp.connect(RABBITMQ_URI, (err, conn) => {
  if (err) {
    console.log(err);
    process.exit(2);
  }
  
  conn.createChannel((err, channel) => {
    if (err) {
      console.log(err);
      process.exit(3);
    }
    const recQueue = "transformer.follower.transform";
    const sendQueue = "db.follower.add";
    channel.assertQueue(recQueue, { durable: false });
    channel.prefetch(1);
    channel.consume(recQueue, msg => {
      let content = JSON.parse(msg.content.toString());
      console.log(`Received ${content.screen_name}, transforming`);
      let follower = transformFollower(content);
      console.log(`Sending new follower ${follower.handle} to DB`);
      channel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(follower)), { persistent: false });
      channel.ack(msg);
    });
  })
});

const transformFollower = twitterFollower => {
  let follower = {
    id: twitterFollower.id_str,
    name: twitterFollower.name,
    handle: twitterFollower.screen_name,
    followers: twitterFollower.followers_count,
    friends: twitterFollower.friends_count,
    lastProfilePicture: twitterFollower.profile_image_url,
    status: twitterFollower.status ? twitterFollower.status.text : ""
  };
  return follower;
};
