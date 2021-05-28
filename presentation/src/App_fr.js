import React from 'react';
import './App.css';

import { Deck, Slide, Title, Subtitle, Text, Browser, List, Image, Footer } from "@sambego/diorama";
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
// import ImgWarning from "./assets/warning.jpg";
import ImgStop from "./assets/stop.jpg";
import ImgTabarnak from "./assets/tabarnak.gif";
import ImgMicroservices from "./assets/microservices.jpg";
import ImgMachineLearning from "./assets/machine-learning.jpg";
import ImgConnecting from "./assets/connecting.jpg";
import ImgMindBlown from "./assets/mindblown.gif";
import ImgPassNotes from "./assets/passnotes.jpg";
import ImgMQSimple from "./assets/mq-simple.png";
import ImgMQWork from "./assets/mq-work-queue.png";
// import ImgMQRPC from "./assets/mq-rpc.png";
import ImgStorage from "./assets/storage.jpg";
import ImgMaestro from "./assets/maestro.jpg";
import ImgOpenShift from "./assets/openshift.png";
import ImgDemo from "./assets/demo.jpg";
import ImgUnethical from "./assets/unethical.jpg";

const SHOW_NOTES = true;

const talkProps = {
  title: "NodeJS, IA, K8s et Reconnaissance Faciale Non-Éthique",
  conference: "Web à Québec",
  conferenceHashTag: "#WAQ",
  date: "15 juin 2021",
  moreInfoUrl: "http://ezurl.to/unethical"
}

const footer = <Footer left={`@joel__lord ${talkProps.conferenceHashTag}`} right={`${talkProps.moreInfoUrl}`} />

function App() {
  return (
    <Deck swipeToChange={false} footer={footer} presenterNotes={SHOW_NOTES}>

      <ImageWithTitle 
        title="NodeJS, IA, K8s et Reconnaissance Faciale Non-Éthique" 
        img={ ImgRating } 
        notes="."
        />

      <About lang="fr"/>

      <ImageWithTitle title="L'appli" img={ ImgEvilApp } />

      <Slide>
        <Title>L'appli</Title>
        <List>
          <li>Trouver des données publiques</li>
          <li>Détecter les visages et scorer</li>
          <li>Deployer le tout</li>
        </List>
      </Slide>

      <ImageWithTitle title="Données Publiques" img={ ImgPublicData } />

      <Slide>
        <Subtitle>Twitter!</Subtitle>
        <Text>
          Une excellent source de données publiques. Images de profil, sentiments, suivants, et plus encore.
        </Text>
        <Text>
          Encore mieux, ils ont un API.
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
        title="Limites" 
        img={ImgStop}
        />

      <Slide>
        <Title>Limites</Title>
        <List>
          <li>Limité à 900 requêtes par 15 minutes</li>
          <li>Gérer la vitesse des requêtes</li>
          <li>Cache d'information</li>
        </List>
      </Slide>

      <Slide>
        <Title>Prochaines étapes</Title>
        <Text>
          J'ai votre visage et vos tweets, que faire maintenant?
        </Text>
      </Slide>

      <Slide>
        <Title>Évaluation</Title>
      </Slide>

      <Slide>
        <Subtitle>Êtes-vous dignes de mon temps</Subtitle>
        <List>
          <li>Vous devez me suivre sur Twitter</li>
          <li>Vous devez avoir un bon nombre de suivants</li>
          <li>Vous devez suivre d'autres personnes</li>
          <li>Vos gazouillis sont positifs</li>
        </List>
      </Slide>

      <ImageWithTitle title="Apprentissage Automatisé" img={ ImgMachineLearning } />

      <Slide>
        <Title>Apprentissage Automatisé</Title>
        <Text>L'apprentissage automatique (en anglais : machine learning), est un champ d'étude de l'intelligence artificielle qui se fonde sur des approches mathématiques et statistiques pour donner aux ordinateurs la capacité d'« apprendre » à partir de données, c'est-à-dire d'améliorer leurs performances à résoudre des tâches sans être explicitement programmés pour chacune.</Text>
      </Slide>

      <ImageWithTitle title="Tensorflow" img={ ImgTabarnak } />

      <Slide>
        <Title>Apprentissage Automatisé</Title>
        <List>
          <li>Créer un modèle est difficile, complexe et coûteux</li>
          <li>Il existe plusieurs solutions infonuagiques</li>
          <li>Des modèles pré-entraînés existent</li>
        </List>
      </Slide>

      <Slide>
        <Title>face-api.js</Title>
        <Text>https://github.com/justadudewhohacks/face-api.js/</Text>
      </Slide>

      <Detection title={"Détection Faciale"} />

      <Detection showLandmarks={true} title={"Repères faciaux"} />

      <Detection showExpressions={true} title={"Expressions faciales"} />

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

      <CodeSlide title="face-api.js avec NodeJS">
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
        <Title>Et la reconnaissance dans tout ça?</Title>
      </Slide>

      <Recognition />

      <CodeSlide title="Reconnaissance faciale">
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

      <CodeSlide title="Reconnaissance faciale">
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
          <li>Reconnaissance faciale avec un seul référant</li>
          <li>Suppose que votre image de profil en est une réelle</li>
          <li>Ne fonctionne pas si vous portez un masque (vous devriez!)</li>
        </List>
      </Slide>

      <ImageWithTitle img={ImgMindBlown} />

      <Slide>
        <Title>Plus d'IA!</Title>
        <Subtitle>Analyse de sentiments</Subtitle>
      </Slide>

      <Slide>
        <Title>Analyse de sentiments</Title>
        <Text>
          L'analyse de sentiments est un processus qui sert à déterminer si un extrait textuel est positif, négatif ou neutre.
        </Text>
        <Text>
          L'analyse de sentiments aide les analystes de données à jauger l'opinion publique, conduire des recherches de marché, surveiller une image de marque et comprendre l'expérience des clients.
        </Text>
      </Slide>
      
      <CodeSlide title="Analyse de sentiments">
        {`
const Sentiment = require("sentiment");
const sentiment = new Sentiment();

score = sentiment.analyze("Ce texte est positif!");
score = sentiment.analyze("Texte négatif.");
        `}
      </CodeSlide>

      <Slide>
        <Twitter withSentimentAnalysis="true" />
      </Slide>

      <Slide>
        <Subtitle>Jusqu'à maintenant</Subtitle>
        <List>
          <li>Données Publiques</li>
          <li>Visages</li>
          <li>Gazouillis</li>
        </List>
      </Slide>

      <ImageWithTitle title="Connecter le tout" img={ImgConnecting} />

      <Slide>
        <Title>Connecter le tout</Title>
        <List>
          <li>Microservices (NodeJS Containers)</li>
          <li>Messaging Queue (Rabbit MQ)</li>
          <li>Base de données (MongoDB)</li>
          <li>Kubernetes (OpenShift)</li>
        </List>
      </Slide>

      <Slide>
        <Image src={ ImgMicroservices } />
      </Slide>

      {/* <Slide>
        <Subtitle>Containerization For Software Developers</Subtitle>
        <Text>Tout ce que vous devez savoir sur les containers</Text>
      </Slide> */}

      <Slide>
        <Title>Containers (Conteneurs? Contenants?)</Title>
        <Text>Les conteneurs vous permettent d'assembler et d'isoler des applications avec leur environnement d'exécution complet contenant tous les fichiers nécessaires à leur exécution. Les applications conteneurisées sont plus faciles à déplacer d'un environnement à un autre, tout en conservant l'intégralité de leurs fonctions.</Text>
      </Slide>

      {/* <Slide>
        <Title>Containers</Title>
        <Text>It [...] is a lightweight, standalone, executable package of software that includes everything needed to run an application: code, runtime, system tools, system libraries and settings.</Text>
      </Slide>

      <Slide>
        <Title>Containers</Title>
        <Text>It is a disposable unit. Once it's completed, it destroys itself along with all other dependencies.</Text>
      </Slide> */}

      <CodeSlide title="Conteneur Node.js" lang="bash">
        {`
docker run -d -v $(pwd):/app:z \\
    -p 3000:3000 node:14 node /app
        `}
      </CodeSlide>

      <CodeSlide title="Conteneur MongoDB" lang="bash">
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

      <CodeSlide title="Conteneur MongoDB" lang="bash">
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
      </CodeSlide>

      {/* <CodeSlide title="Node Containers" lang="bash">
        {`
docker run -d -v $(pwd):/app:z \\
    -p 3000:3000 node:12 node /app
        `}
      </CodeSlide>

      <CodeSlide title="Node Containers" lang="bash">
        {`
docker run -d -p 3000:3000 <myimage>
        `}
      </CodeSlide> */}

      <CodeSlide title="Conteneur Node.js">
        {`
FROM node:14
EXPOSE 3000
WORKDIR /app
COPY . .
RUN npm install
CMD node .
        `}
      </CodeSlide>

      <CodeSlide title="Conteneur Node.js" lang="bash">
        {`
docker build -t joellord/node-ml-k8s-facedetection .

docker push docker.io/joellord/node-ml-k8s-facedetection
        `}
      </CodeSlide>

      <ImageWithTitle title="Stockage" img={ImgStorage} />

      <Slide>
        <Title>Données</Title>
        <List>
          <li>Flexible</li>
          <li>JSON-sympathique</li>
        </List>
      </Slide>

      <CodeSlide title="Schema de données">
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

      <ImageWithTitle title="Messagerie" img={ImgPassNotes} />

      <Slide>
        <Title>Système de Messagerie</Title>
        <Subtitle>(Messaging Queues)</Subtitle>
        <Text>Une file d'attente de messages est une forme de communication service-à-service asynchrone utilisée dans les architectures sans serveur et de micro-services. Les messages sont stockés dans la file d'attente jusqu'à ce qu'ils soient traités et supprimés. Chaque message n'est traité qu'une fois pour un seul utilisateur. Les files d'attente de message peuvent être utilisées pour découpler le traitement lourd, mettre en mémoire tampon ou traiter en lot, et fluidifier les pics de charges de travail.</Text>
      </Slide>

      <Slide>
        <Subtitle>Système de Messagerie Simple</Subtitle>
        <Image src={ImgMQSimple} />
      </Slide>

      <Slide>
        <Subtitle>Consommateurs Compétitifs</Subtitle>
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

      <ImageWithTitle title="Déploiement" img={ImgMaestro} />

      {/* <Slide>
        <Subtitle>Kubernetes Kitchen</Subtitle>
        <Text>Learn everything you need to know about Kubernetes</Text>
      </Slide> */}

      <Slide>
        <Title>Kubernetes</Title>
        <Text>Kubernetes est une plate-forme open-source extensible et portable pour la gestion de charges de travail (workloads) et de services conteneurisés.</Text>
      </Slide>

      <Slide>
        <Title>Kubernetes</Title>
        <List>
          <li>Gère les conteneurs. </li>
          <li>Ajoute ou enlève des conteneurs</li>
          <li>S'occupe de la réseautique</li>
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
      
      <CodeSlide title="Kubernetes Deployment" lang="yaml">
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
      </CodeSlide>

      <ImageWithTitle img={ImgOpenShift} title="" />

      <ImageWithTitle img={ImgDemo} title="On veut une demo!" />

      <ImageWithTitle img={ImgUnethical} title="Apprentissage automatisé et éthique" />

      <Slide>
        <Title>Liens</Title>
        <List>
          <li>Containerization for Software Developers</li>
          <li>Kubernetes Kitchen</li>
          <li>Rabbit MQ</li>
          <li>Face-api.js</li>
        </List>
      </Slide>

      <ThankYou 
        lang="fr"
        title={talkProps.title}
        conference={talkProps.conference}
        date={talkProps.date}
        moreInfoUrl={talkProps.moreInfoUrl}
      />
    </Deck>
  );
}

export default App;
