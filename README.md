First step: scrape all the profile images from my followers

Second step: Recognize a face in an image
Pitfalls:
* use tfjs-node @1.7 instead of the latest (2.x)
* use sharp 0.24 (https://github.com/lovell/sharp/issues/2062)
* Fix images
* full_sample works, not follower_recognition

Third step: Create microservices
Additional training data

Issues
* Adding a new face (training) does not update the detector
* Using a label {handle} ({score}) doesn't work if I add a new detector. Need a way to fetch the score independently of the label
* Detector is "stuck" with the last request

Todo
* Score should have it's own service
* Update DB with each tweet from a follower
* UI for Trainer