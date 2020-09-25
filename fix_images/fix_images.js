const sharp = require("sharp");
const fs = require("fs");

const IMAGES_PATH = "../scrape_faces/known_faces";
const OUTPUT_PATH = "./fixed";
const SIZE = 500;

let files = fs.readdirSync(IMAGES_PATH);

files.map(async file => {
  let handle = file.substr(0, file.lastIndexOf("."));
  let extension = file.substr(file.lastIndexOf(".") + 1);
  format = "jpg";
  if (extension === "png") format = "png";
  if (extension === "gif") format = "gif";
  console.log(extension);

  await sharp(`${IMAGES_PATH}/${file}`, {format})
    .jpeg()
    .resize(SIZE, SIZE)
    .toFile(`${OUTPUT_PATH}/${handle}.jpg`)
    .catch(e => console.log(file, e));
});