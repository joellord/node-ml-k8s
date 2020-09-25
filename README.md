First step: scrape all the profile images from my followers

Second step: Recognize a face in an image
Pitfalls:
* use tfjs-node @1.7 instead of the latest (2.x)
* use sharp 0.24 (https://github.com/lovell/sharp/issues/2062)
* Fix images
* full_sample works, not follower_recognition

Third step: Create microservices
