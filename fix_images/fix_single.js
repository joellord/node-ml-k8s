const sharp = require("sharp");
const fs = require("fs");

let filename = process.argv[2];
let output = process.argv[3];
let SIZE = 300;

sharp(filename)
  .jpeg()
  .resize(SIZE, SIZE, {fit: "cover"})
  .toFile("fixed.jpg")
  .then(_ => {
    if (output) {
      fs.renameSync("./fixed.jpg", output);
    }
  });
