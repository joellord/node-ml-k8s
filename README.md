# NodeJS, ML, K8s and Unethical Face Recognition
Presentation and Code Samples for my talk.

## Presentation
Once you cloned the repo, you can 

```
cd presentation
npm start
```

## Demo
Using podman (you might need to use a --network flag with Docker).

You will also need concurrently installed (`npm install -g concurrently`)

```
cd demo
./servers.sh
./services.sh
```

## Todo

There is still a lot of work to do on the demo application, here is a list so I don't forget about it.

* Score should have it's own service
* Update DB with each tweet from a follower
* UI for Trainer
