import React from 'react';
import './App.css';

import { Deck, Slide, Title, Subtitle, Text, Browser, List, Link, Image, Footer } from "@sambego/diorama";
import ImageWithTitle from "./components/ImageWithTitle";
import CodeSlide from "./components/CodeSlide";
import Twitter from "./slides/Twitter";
import About from "./slides/About";
import Detection from "./slides/Detection";
import Recognition from "./slides/Recognition";
import ThankYou from "./slides/ThankYou";

import ImgRating from "./assets/ratings.jpg";
import ImgEvilApp from "./assets/evil-app.jpg";
import ImgPublicData from "./assets/public-data.jpg";
import ImgWarning from "./assets/warning.jpg";
import ImgStop from "./assets/stop.jpg";
import ImgTabarnak from "./assets/tabarnak.gif";
import ImgMicroservices from "./assets/microservices.jpg";
import ImgMachineLearning from "./assets/machine-learning.jpg";
import ImgConnecting from "./assets/connecting.jpg";
import ImgMindBlown from "./assets/mindblown.gif";
import ImgPassNotes from "./assets/passnotes.jpg";
import ImgMQSimple from "./assets/mq-simple.png";
import ImgMQWork from "./assets/mq-work-queue.png";
import ImgMQRPC from "./assets/mq-rpc.png";
import ImgStorage from "./assets/storage.jpg";
import ImgMaestro from "./assets/maestro.jpg";
import ImgOpenShift from "./assets/openshift.png";
import ImgDemo from "./assets/demo.jpg";
import ImgUnethical from "./assets/unethical.jpg";

const SHOW_NOTES = true;

const talkProps = {
  title: "NodeJS, ML, K8s and Unethical Facial Recognition",
  conference: "CodeMotion",
  conferenceHashTag: "#CodeMotion",
  date: "Apr 20, 2021",
  moreInfoUrl: "http://ezurl.to/unethical"
}

const footer = <Footer left={`@joel__lord ${talkProps.conferenceHashTag}`} right={`${talkProps.moreInfoUrl}`} />

function App() {
  return (
    <Deck swipeToChange={false} footer={footer} presenterNotes={SHOW_NOTES}>

      <ImageWithTitle 
        title="NodeJS, ML, K8s and Unethical Face Recognition" 
        img={ ImgRating } 
        notes="."
        />

      <About />

      <ImageWithTitle title="The App" img={ ImgEvilApp } />

      <Slide>
        <Title>The App</Title>
        <List>
          <li>Find public data sources</li>
          <li>Detect faces and score</li>
          <li>Deploy all the things</li>
        </List>
      </Slide>

      <ImageWithTitle title="Public Data Sources" img={ ImgPublicData } />

      <Slide>
        <Subtitle>Twitter!</Subtitle>
        <Text>
          Great source of public data. Profile pictures, sentiments, followers, and so on.
        </Text>
        <Text>
          More importantly, they have an API.
        </Text>
      </Slide>

      <CodeSlide title="Twitter" lang="bash">
        npm install --save twitter
      </CodeSlide>

      <CodeSlide title="Twitter" lang="javascript">
        {`
let twitterClient = new Twitter(keys);
twitterClient.get("followers/list", (err, result) => {
  if (err) {
    reject(err);
    return;
  }

  console.log("Fetched \${result.users.length} followers");
  resolve(result);
  return;
});
      `}
      </CodeSlide>

      <CodeSlide title="Twitter">
        {`
t.get("followers/ids", {}, (err, data, resp) => {
  let ids = data.ids;
  let stream = t.stream('statuses/filter', { follow: ids.join(",") })

  stream.on('tweet', function (tweet) {
    let user = tweet.user.screen_name;
    let text = tweet.extended_tweet ? tweet.extended_tweet.full_text : tweet.text;

    console.log(\`@\${user}: \${text}\`);
  });
  
});
        `}
      </CodeSlide>

      <Slide>
        <Twitter /> 
      </Slide>

      <ImageWithTitle 
        title="Rate Limit" 
        img={ImgStop}
        />

      <Slide>
        <Title>Rate Limits</Title>
        <List>
          <li>Limited to 900 calls per 15 minutes</li>
          <li>Throttle your calls</li>
          <li>Cache information</li>
        </List>
      </Slide>

      <Slide>
        <Title>Next Steps</Title>
        <Text>
          I now have your face and your tweets, now what?
        </Text>
      </Slide>

      <Slide>
        <Title>Time to rate you</Title>
      </Slide>

      <Slide>
        <Subtitle>Are you worthy of my time</Subtitle>
        <List>
          <li>You have to be one of my followers</li>
          <li>Good following yourself</li>
          <li>You follow other people</li>
          <li>Your tweets are positive</li>
        </List>
      </Slide>

      <ImageWithTitle title="Machine Learning" img={ ImgMachineLearning } />

      <Slide>
        <Title>Machine Learning</Title>
        <Text>Machine learning (ML) is the study of computer algorithms that improve automatically through experience.</Text>
        <Text>It is seen as a subset of artificial intelligence. </Text>
        <Text>Machine learning algorithms build a mathematical model based on sample data, known as "training data", in order to make predictions or decisions without being explicitly programmed to do so.</Text>
      </Slide>

      <ImageWithTitle title="Tensorflow" img={ ImgTabarnak } />

      <Slide>
        <Title>Machine Learning</Title>
        <List>
          <li>Training a model is hard, complex and costly</li>
          <li>Many cloud providers can offer some tooling</li>
          <li>Pre-trained models are available</li>
        </List>
      </Slide>

      <Slide>
        <Title>face-api.js</Title>
        <Text>https://github.com/justadudewhohacks/face-api.js/</Text>
      </Slide>

      <Detection title={"Face Detection"} />

      <Detection showLandmarks={true} title={"Face Landmarks"} />

      <Detection showExpressions={true} title={"Face Expressions"} />

      <CodeSlide title="face-api.js">
        {`
import faceapi from "face-api.js";

// OR

<script src="face-api.js"></script>
        `}
      </CodeSlide>

      {/* <CodeSlide title="face-api.js">
        {`
    let reader = new FileReader();
    reader.onload = function(event){
        let img = new Image();
        img.onload = async function(){
          //...
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(props.file);     
        `}
      </CodeSlide> */}

      <CodeSlide title="face-api.js">
        {`
await faceapi.nets
.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
await faceapi.nets
.faceLandmark68Net.loadFromDisk(MODELS_PATH);
        `}
      </CodeSlide>

      <CodeSlide title="face-api.js">
        {`
canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d");
ctx.drawImage(img, 0, 0);
let fullFaceDescriptions = await faceapi
  .detectAllFaces(img)
  .withFaceLandmarks()
  .withFaceDescriptors();
faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
faceapi.draw.drawFaceLandmarks(canvas, fullFaceDescriptions);
        `}
      </CodeSlide>

      <CodeSlide title="face-api.js on NodeJS">
        {`
const { Canvas, Image, ImageData, loadImage } = nodeCanvas;
const canvas = new Canvas(WIDTH, HEIGHT);

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
      `}
      </CodeSlide>

      {/* <CodeSlide title="face-api.js on NodeJS">
        {`
let trainingImage = TRAINING_IMAGE_PATH;
const input = await nodeCanvas.loadImage(trainingImage);
let fullFaceDescriptions = await faceapi
    .detectAllFaces(input)
    .withFaceLandmarks();
        `}
      </CodeSlide> */}

      <Slide>
        <Title>What about recognition?</Title>
      </Slide>

      <Recognition />

      <CodeSlide title="Face Recognition">
        {`
const labeledFaceDescriptors = await Promise.all(
  labels.map(async label => {
    const imgUrl = \`\${label}.png\`
    const img = await faceapi.fetchImage(imgUrl)
    
    const fullFaceDescription = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks().withFaceDescriptor()
    
    const faceDescriptors = [fullFaceDescription.descriptor]
    return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
  })
)     
        `}
      </CodeSlide>

      <CodeSlide title="Face Recognition">
        {`
const maxDescriptorDistance = 0.6
const faceMatcher = new faceapi.FaceMatcher(
  labeledFaceDescriptors, 
  maxDescriptorDistance
);

const results = fullFaceDescriptions.map(fd => 
  faceMatcher.findBestMatch(fd.descriptor)
);
        `}
      </CodeSlide>

      <Slide>
        <Browser url="https://justadudewhohacks.github.io/face-api.js/face_and_landmark_detection"></Browser>
      </Slide>

      <Slide>
        <Title>face-api.js</Title>
        <List>
          <li>Face recognition with a single reference point</li>
          <li>Assumes your Twitter profile is an actual picture</li>
          <li>Doesn't work if you wear a mask (which you should!)</li>
        </List>
      </Slide>

      <ImageWithTitle img={ImgMindBlown} />

      <Slide>
        <Title>Moar Machine Learning</Title>
        <Subtitle>Sentiment Analysis</Subtitle>
      </Slide>

      <Slide>
        <Title>Sentiment Analysis</Title>
        <Text>
          Sentiment Analysis is the process of determining whether a piece of writing is positive, negative or neutral.
        </Text>
        <Text>
          Sentiment analysis helps data analysts within large enterprises gauge public opinion, conduct nuanced market research, monitor brand and product reputation, and understand customer experiences.
        </Text>
      </Slide>
      
      <CodeSlide title="Sentiment Analysis">
        {`
const Sentiment = require("sentiment");
const sentiment = new Sentiment();

score = sentiment.analyze("This is positive!");
score = sentiment.analyze("Something negative.");
        `}
      </CodeSlide>

      <Slide>
        <Twitter withSentimentAnalysis="true" />
      </Slide>

      <Slide>
        <Subtitle>What we have so far</Subtitle>
        <List>
          <li>Public data</li>
          <li>Faces</li>
          <li>Tweets</li>
        </List>
      </Slide>

      <ImageWithTitle title="Connecting Everything Together" img={ImgConnecting} />

      <Slide>
        <Title>Connecting everything together</Title>
        <List>
          <li>Microservices (NodeJS Containers)</li>
          <li>Messaging Queue (Rabbit MQ)</li>
          <li>Database (MongoDB)</li>
          <li>Kubernetes (OpenShift)</li>
        </List>
      </Slide>

      <Slide>
        <Image src={ ImgMicroservices } />
      </Slide>

      <Slide>
        <Subtitle>Containerization For Software Developers</Subtitle>
        <Text>Learn everything you need to know about Containers</Text>
      </Slide>

      <Slide>
        <Title>Containers</Title>
        <Text>A container is a standard unit of software that packages up code and all its dependencies so the application runs quickly and reliably from one computing environment to another.</Text>
      </Slide>

      {/* <Slide>
        <Title>Containers</Title>
        <Text>It [...] is a lightweight, standalone, executable package of software that includes everything needed to run an application: code, runtime, system tools, system libraries and settings.</Text>
      </Slide>

      <Slide>
        <Title>Containers</Title>
        <Text>It is a disposable unit. Once it's completed, it destroys itself along with all other dependencies.</Text>
      </Slide> */}

      <CodeSlide title="Node Containers" lang="bash">
        {`
docker run -d -v $(pwd):/app:z \\
    -p 3000:3000 node:14 node /app
        `}
      </CodeSlide>

      <CodeSlide title="MongoDB Containers" lang="bash">
        {`
echo "Starting Mongo Database"
echo "(data persisted in ./data)"
docker run -d --rm --name mongo \\
 -e MONGO_INITDB_ROOT_USERNAME=admin \\
 -e MONGO_INITDB_ROOT_PASSWORD=12345 \\
 -p 27017:27017 \\
 -v data:/data/db \\
 mongo:4.4
        `}
      </CodeSlide>

      {/* <CodeSlide title="MongoDB Containers" lang="bash">
        {`
echo "Starting Mongo-express"
echo " Interface available at http://localhost:8882"
docker run -d --rm --name mongo-admin \\
 -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \\
 -e ME_CONFIG_MONGODB_ADMINPASSWORD=12345 \\
 -e ME_CONFIG_MONGODB_SERVER=192.168.122.1 \\
 -p 8882:8081 \\
 mongo-express:0.54
        `}
      </CodeSlide> */}

      {/* <CodeSlide title="Node Containers" lang="bash">
        {`
docker run -d -v $(pwd):/app:z \\
    -p 3000:3000 node:12 node /app
        `}
      </CodeSlide> */}

      <CodeSlide title="Node Containers" lang="bash">
        {`
docker run -d -p 3000:3000 <myimage>
        `}
      </CodeSlide>

      <CodeSlide title="Node Containers">
        {`
FROM node:14
EXPOSE 3000
WORKDIR /app
COPY . .
RUN npm install
CMD node .
        `}
      </CodeSlide>

      <CodeSlide title="Node Containers" lang="bash">
        {`
docker build -t joellord/node-ml-k8s-facedetection .

docker push docker.io/joellord/node-ml-k8s-facedetection
        `}
      </CodeSlide>

      <ImageWithTitle title="Storage" img={ImgStorage} />

      <Slide>
        <Title>Storage</Title>
        <List>
          <li>Flexible</li>
          <li>JSON-friendly</li>
        </List>
      </Slide>

      <CodeSlide title="Data Schema">
        {`
import mongoose from "mongoose";

const FollowerSchema = {
  id: String,
  handle: String,
  ...
  sentiment: {
    averageComparative: Number
  },
  faceDescriptors: Array
}

const Follower = mongoose.model("Follower", FollowerSchema);
        `}
      </CodeSlide>

      {/* <CodeSlide title="Data Schema">
        {`
import mongoose from "mongoose";
await mongoose.connect(process.env.MONGO_URI, {});

// Get document
let follower = await Follower.findOne(filter).exec();

// Insert/Update document
let newFollower = await Follower.findOneAndUpdate(
  filter, 
  update, 
  { new: true, upsert: true });

// Add information then save
existingFollower.faceDescriptors.push(data.descriptors);
let newFollower = await existingFollower.save({ new: true });
        `}
      </CodeSlide>

      <Slide>
        <Title>Mongoose vs Mongo</Title>
        <Text>
          Mongoose is a node module to help you enforce schemas. There is also a Node.js drive that you can use.
        </Text>
      </Slide>

      <Slide>
        <Title>Mongoose vs Mongo</Title>
        <Text>Do You Need Mongoose When Developing Node.js and MongoDB Applications?</Text>
        <a href="#">https://developer.mongodb.com/article/mongoose-versus-nodejs-driver/</a>
      </Slide> */}

      <ImageWithTitle title="Messaging" img={ImgPassNotes} />

      <Slide>
        <Title>Messaging Queue</Title>
        <Text>A message queue is a form of asynchronous service-to-service communication used in serverless and microservices architectures. Messages are stored on the queue until they are processed and deleted. Each message is processed only once, by a single consumer. Message queues can be used to decouple heavyweight processing, to buffer or batch work, and to smooth spiky workloads.</Text>
      </Slide>

      <Slide>
        <Subtitle>Simple Message Queue</Subtitle>
        <Image src={ImgMQSimple} />
      </Slide>

      <Slide>
        <Subtitle>Competing Consumers</Subtitle>
        <Image src={ImgMQWork} />
      </Slide>

      {/* <Slide>
        <Subtitle>Request/Reply Pattern (RPC)</Subtitle>
        <Image src={ImgMQRPC} />
      </Slide>
       */}
      <CodeSlide title="Simple Pub/Sub - Publisher">
        {`
const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, connection) {
    connection.createChannel(function(err, channel) {
        const queue = 'hello';
        const msg = 'Hello World!';

        channel.assertQueue(queue);

        channel.sendToQueue(queue, Buffer.from(msg));

        console.log(" [x] Sent %s", msg);
    });
});            
        `}
      </CodeSlide>

      <CodeSlide title="Simple Pub/Sub - Consumer">
        {`
const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, connection) {
    connection.createChannel(function(err, channel) {
        const queue = 'hello';

        channel.assertQueue(queue);
        console.log(" [*] Waiting for messages in %s.", queue);

        channel.consume(queue, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
        });
    });
});       
        `}
      </CodeSlide>

      <Slide>
        <Subtitle>RabbitMQ</Subtitle>
        <a href="https://www.rabbitmq.com/getstarted.html">https://www.rabbitmq.com/getstarted.html</a>
      </Slide>

      <ImageWithTitle title="Deploy All The Things" img={ImgMaestro} />

      <Slide>
        <Subtitle>Kubernetes Kitchen</Subtitle>
        <Text>Learn everything you need to know about Kubernetes</Text>
      </Slide>

      <Slide>
        <Title>Kubernetes</Title>
        <Text>Kubernetes (K8s) is an open-source system for automating deployment, scaling, and management of containerized applications.</Text>
      </Slide>

      <Slide>
        <Title>Kubernetes</Title>
        <List>
          <li>Orchestrator for containers. </li>
          <li>Spin up more or less containers as needed</li>
          <li>Takes care of the networking</li>
        </List>
      </Slide>

      <Slide>
        <Title>Kubernetes</Title>
        <List>
          <li>Pods</li>
          <li>Deployments</li>
          <li>Services</li>
        </List>
      </Slide>
      
      {/* <CodeSlide title="Kubernetes Deployment" lang="yaml">
        {`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: facedetection
spec:
  replicas: 3
  selector:
    matchLabels:
      component: facedetect
  template:
    metadata:
      labels:
        component: facedetect
    spec:
      containers:
        - name: facedetect
          image: joellord/node-ml-k8s-facedetect
          ports:
            - containerPort: 3000
        `}
      </CodeSlide>
      
      <CodeSlide title="Kubernetes Deployment" lang="yaml">
        {`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rabbitmq
  labels:
    app: node-ml-k8s
    section: servers
spec:
  replicas: 1
  selector:
    matchLabels:
      section: servers
      component: queue
  template:
    metadata:
      labels:
        app: node-ml-k8s
        section: servers
        component: queue
    spec:
      containers:
        - name: rabbitmq
          image: rabbitmq:management
          ports:
            - containerPort: 5672
            - containerPort: 15672
        `}
      </CodeSlide>

      <CodeSlide title="Kubernetes Service" lang="yaml">
        {`
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq
spec:
  selector:
    component: queue  
  ports:
  - port: 5672
    name: rabbitmq
    targetPort: 5672
        `}
      </CodeSlide>

      <CodeSlide title="Kubernetes">
        {`
const amqp = require('amqplib/callback_api');

amqp.connect('amqp://rabbitmq', (err, connection) => {
  // ...
});            
        `}
      </CodeSlide> */}

      <ImageWithTitle img={ImgOpenShift} title="" />

      <ImageWithTitle img={ImgDemo} title="What About the demo?" />

      <ImageWithTitle img={ImgUnethical} title="A Quick Note About Unethical Machine Learning" />

      <Slide>
        <Title>Links</Title>
        <List>
          <li>Containerization for Software Developers</li>
          <li>Kubernetes Kitchen</li>
          <li>Rabbit MQ</li>
          <li>Face-api.js</li>
        </List>
      </Slide>

      <ThankYou 
        title={talkProps.title}
        conference={talkProps.conference}
        date={talkProps.date}
        moreInfoUrl={talkProps.moreInfoUrl}
      />
    </Deck>
  );
}

export default App;
